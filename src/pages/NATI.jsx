// import * as React from 'react'
import React, { useState } from 'react'

import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import Paper from '@mui/material/Paper'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import styled from '@mui/material/styles/styled'
import Typography from '@mui/material/Typography'
import { useWeb3React } from '@web3-react/core'

import ConnectButton from '../components/ConnectButton'
import TransactionForm from '../components/NATIForm/TransactionForm'
import WalletConnectDialog from '../components/WalletConnectDialog'
import { injectedConnector } from '../connectors/injectedConnector'


const theme = createTheme()



export default function Checkout() {

  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const { account, activate, deactivate } = useWeb3React()

  const handleClickConnect = () => {
    if (account) {
      deactivate();
    } else {
      setWalletDialogOpen(true)
    }
  }

  const handleConfirm = async () => {
    await activate(injectedConnector);
    setWalletDialogOpen(false);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StyledRow>
        <StyledContainer component="main" maxWidth="sm">
          <Paper variant="outlined" sx={{ px: { xs: 2, md: 3 }, py: { md: 8, xs: 2 }, mb: 3, border: '2px solid grey', borderRadius: '10px' }}>
            <Typography component="h1" variant="h4" align="center" sx={{ mb: 3 }}>
              Send NATI to Verus Blockchain
            </Typography>
            <ConnectButton onClick={handleClickConnect} />
            <WalletConnectDialog
              isOpen={walletDialogOpen}
              onClose={() => setWalletDialogOpen(false)}
              onConfirm={handleConfirm}
            />
            
            <TransactionForm />
          </Paper>
        </StyledContainer>
      </StyledRow>
    </ThemeProvider>
  )
}

const StyledContainer = styled(Container)(() => ({
  display: 'flex',
  flexDirection: "column",
  justifyContent: 'center',
  height: "calc(100vh - 64px)"
}))

const StyledRow = styled('div')(({ theme }) => ({
  display: 'flex',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column-reverse'
  },
  [theme.breakpoints.up('lg')]: {
    flexDirection: 'row'
  },

  justifyContent: 'center'

}))


