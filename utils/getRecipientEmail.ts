import { User } from 'firebase/auth'
import { Conversation } from '../types'

export const getRecipientEmail = (
  conversationUsers: Conversation['users'],
  loggerInUser?: User | null
) => conversationUsers.find((userEmail) => userEmail != loggerInUser?.email)
