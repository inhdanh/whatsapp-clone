import Image from 'next/image'
import styled from 'styled-components'
import WhatsAppLogo from '../assets/whatsapplogo.png'
import { CircularProgress } from '@mui/material'

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`
const StyledImageWrapper = styled.div`
  margin-bottom: 50px;
`

const Loading = () => {
  return (
    <StyledContainer>
      <StyledImageWrapper>
        <Image
          src={WhatsAppLogo}
          alt="Whatsapp logo"
          width={200}
          height={200}
        />
      </StyledImageWrapper>
      <CircularProgress />
    </StyledContainer>
  )
}

export default Loading
