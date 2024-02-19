import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import Web3 from 'web3'
import { GoldRushProvider } from '@covalenthq/goldrush-kit'

export const PROVIDER = window.ethereum
export const web3 = new Web3(PROVIDER)
export const AuthContext = React.createContext()

import { ParticleNetwork, WalletEntryPosition } from '@particle-network/auth'
// import { ParticleProvider } from '@particle-network/provider'
// import { SolanaWallet } from '@particle-network/solana-wallet'
// import { evmWallets, ParticleConnect } from '@particle-network/connect';
import { Ethereum } from '@particle-network/chains'

import { AuthType } from '@particle-network/auth-core'
import { EthereumGoerli } from '@particle-network/chains'
import { AuthCoreContextProvider, PromptSettingType } from '@particle-network/auth-core-modal'
const particle = new ParticleNetwork({
  projectId: 'a1f9b732-8d00-43e3-a42e-e79b42102576',
  clientKey: 'cREHkrBfolSGKX4pJq73xgg5p26Zgp6V6GSPEGTu',
  appId: '106ca095-864d-40f3-8bae-5a639066cc5c',
  chainName: Ethereum.name,
  chainId: Ethereum.id,
  wallet: {
    displayWalletEntry: true,
    defaultWalletEntryPosition: WalletEntryPosition.BR,
    uiMode: 'dark',
    supportChains: [
      { id: 1, name: 'Ethereum' },
      { id: 5, name: 'Ethereum' },
    ],
    customStyle: {},
  },
  securityAccount: {
    //optional: particle security account config
    //prompt set payment password. 0: None, 1: Once(default), 2: Always
    promptSettingWhenSign: 1,
    //prompt set master password. 0: None(default), 1: Once, 2: Always
    promptMasterPasswordSettingWhenLogin: 1,
  },
})
// Particle Auth Core
import { useConnect } from '@particle-network/auth-core-modal'

import('buffer').then(({ Buffer }) => {
  window.Buffer = Buffer
})

export function useAuth() {
  return useContext(AuthContext)
}

export const isAuth = async () => await localStorage.getItem('accessToken')

export const chainID = async () => await web3.eth.getChainId()

export const getIPFS = async (CID) => {
  console.log(CID)
  let requestOptions = {
    method: 'GET',
    redirect: 'follow',
  }
  const response = await fetch(`https://ipfs.io/ipfs/${CID}`, requestOptions)
  if (!response.ok) throw new Response('Failed to get data', { status: 500 })
  return response.json()
}

/**
 * Connect wallet
 */
export const isWalletConnected = async () => {
  console.info(`Is wallet connected?`)

  try {
    let accounts = await web3.eth.getAccounts()
    return accounts[0]
  } catch (error) {
    toast.error(error.message)
  }
}

export function AuthProvider({ children }) {
  const [wallet, setWallet] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { connect, connected } = useConnect()
  
  function logout() {
    localStorage.removeItem('accessToken')
    navigate('/login')
    setUser(null)
  }

  const connectWallet = async () => {
    let loadingToast = toast.loading('Loading...')

    console.log(await web3.eth.requestAccounts())
    return false

    try {
      let accounts = await web3.eth.getAccounts()
      if (accounts.length === 0) await web3.eth.requestAccounts()
      accounts = await web3.eth.getAccounts()
      console.log(accounts)
      setWallet(accounts[0])
      toast.dismiss(loadingToast)
      toast.success(`UP successfuly connected`)
      navigate(`/usr/${accounts[0]}`)
      return accounts[0]
    } catch (error) {
      toast.error(error.message)
      toast.dismiss(loadingToast)
    }
  }

  const checkParticle = async () => {

    if (connected) {
      const userInfo = await connect()
    }

    // Particle Auth (old)
    if (!particle.auth.isLogin()) {
      // Boolean based upon login state of session
      // Request user login if needed, returns current user info, such as name, email, etc.
      const userInfo = await particle.auth.login()
    }
  }

  useEffect(() => {
    isWalletConnected().then((addr) => {
      if (typeof addr !== 'undefined') {
        setWallet(addr)
      } else navigate('/home')
    })

    checkParticle()
  }, [])

  const value = {
    wallet,
    setWallet,
    setProfile,
    isWalletConnected,
    connectWallet,
    logout,
  }

  if (!wallet && location.pathname !== '/home' && location.pathname !== '/') return <>Loading...</>

  //return <AuthContext.Provider value={value}><GoldRushProvider apikey="cqt_rQXcP6C3GMhjq8wxXb6PwmX8kXQ8" value={value}>{children}</GoldRushProvider></AuthContext.Provider>

  return (
    <AuthContext.Provider value={value}>
      <AuthCoreContextProvider
        options={{
          projectId: import.meta.env.VITE_PROJECT_ID,
          clientKey: import.meta.env.VITE_CLIENT_KEY,
          appId: import.meta.env.VITE_APP_ID,
          authTypes: [AuthType.email, AuthType.google, AuthType.twitter],
          themeType: 'dark',
          fiatCoin: 'USD',
          language: 'en',
          erc4337: {
            name: 'SIMPLE',
            version: '1.0.0',
          },
          promptSettingConfig: {
            promptPaymentPasswordSettingWhenSign: PromptSettingType.first,
            promptMasterPasswordSettingWhenLogin: PromptSettingType.first,
          },
          wallet: {
            visible: true,
            customStyle: {
              supportChains: [EthereumGoerli],
            },
          },
        }}
      >
        {children}
      </AuthCoreContextProvider>
    </AuthContext.Provider>
  )
}
