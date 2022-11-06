import {
  Avatar,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
} from '@mui/material'
import styled from 'styled-components'
import ChatIcon from '@mui/icons-material/Chat'
import MoreVerticalIcon from '@mui/icons-material/MoreVert'
import LogoutIcon from '@mui/icons-material/Logout'
import SearchIcon from '@mui/icons-material/Search'
import { signOut } from 'firebase/auth'
import { auth, db } from '../config/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useState } from 'react'
import * as EmailValidator from 'email-validator'
import { addDoc, collection, query, where } from 'firebase/firestore'
import { useCollection } from 'react-firebase-hooks/firestore'
import { Conversation } from '../types'
import ConversationSelect from './ConversationSelect'

const StyledContainer = styled.div`
  height: 100vh;
  min-width: 300px;
  max-width: 350px;
  overflow-y: scroll;
  border-right: 1px solid whitesmoke;

  ::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`
const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;

  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
`
const StyledSearch = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 2px;
`

const StyledUserAvatar = styled(Avatar)`
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`
const StyledSearchInput = styled.input`
  outline: none;
  border: none;
  flex: 1;
`
const StyledSidebarButton = styled(Button)`
  width: 100%;
  border-top: 1px solid whitesmoke;
  border-bottom: 1px solid whitesmoke;
`

const SideBar = () => {
  const [loggerInUser, loading, error] = useAuthState(auth)

  const [isOpenNewConversationDialog, setIsOpenNewConversationDialog] =
    useState(false)

  const [recipientEmail, setRecipientEmail] = useState('')

  const toggleNewConversationDialog = (isOpen: boolean) => {
    setIsOpenNewConversationDialog(isOpen)
    if (!isOpen) {
      setRecipientEmail('')
    }
  }

  const closeNewConversationDialog = () => {
    toggleNewConversationDialog(false)
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {}
  }

  // check if conversation already exists between the current logged in user and recipient
  const queryGetConversationsForCurrentUser = query(
    collection(db, 'conversations'),
    where('users', 'array-contains', loggerInUser?.email)
  )
  const [conversationSnapshot, __loading, __error] = useCollection(
    queryGetConversationsForCurrentUser
  )

  const isConversationAlreadyExists = (recipientEmail: string) =>
    conversationSnapshot?.docs.find((conversation) =>
      (conversation.data() as Conversation).users.includes(recipientEmail)
    )

  const createConversation = async () => {
    if (!recipientEmail) return
    const isInvitingSelf = recipientEmail === loggerInUser?.email

    if (
      EmailValidator.validate(recipientEmail) &&
      !isInvitingSelf &&
      !isConversationAlreadyExists(recipientEmail)
    ) {
      // Add a conversation user to db 'conversation' collection
      // A conversation is between the currently logger in user and user invited.
      await addDoc(collection(db, 'conversations'), {
        users: [loggerInUser?.email, recipientEmail],
      })
    }
    closeNewConversationDialog()
  }

  return (
    <StyledContainer>
      <StyledHeader>
        <Tooltip title={loggerInUser?.email as string} placement="right">
          <StyledUserAvatar src={loggerInUser?.photoURL as string} />
        </Tooltip>
        <div>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <MoreVerticalIcon />
          </IconButton>
          <IconButton onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </div>
      </StyledHeader>
      <StyledSearch>
        <SearchIcon />
        <StyledSearchInput placeholder="Search in conversations" />
      </StyledSearch>
      <StyledSidebarButton onClick={() => toggleNewConversationDialog(true)}>
        Start a new conversation
      </StyledSidebarButton>
      {/* List of conversation */}
      {conversationSnapshot?.docs.map((conversation) => (
        <ConversationSelect
          key={conversation.id}
          id={conversation.id}
          conversationUsers={(conversation.data() as Conversation).users}
        />
      ))}

      <Dialog
        open={isOpenNewConversationDialog}
        onClose={closeNewConversationDialog}
      >
        <DialogTitle>New Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a Google email address for the user you wish to chat
            with
          </DialogContentText>
          <TextField
            autoFocus
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={recipientEmail}
            onChange={(event) => setRecipientEmail(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNewConversationDialog}>Cancel</Button>
          <Button disabled={!recipientEmail} onClick={createConversation}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  )
}

export default SideBar
