import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import Web3 from 'web3'
import { GoldRushProvider } from "@covalenthq/goldrush-kit";

export const PROVIDER = window.ethereum
export const web3 = new Web3(PROVIDER)

export const AuthContext = React.createContext()

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

  useEffect(() => {
    isWalletConnected().then((addr) => {
      if (typeof addr !== 'undefined') {
        setWallet(addr)
      } else navigate('/home')
    })
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

  return <AuthContext.Provider value={value}><GoldRushProvider apikey="cqt_rQXcP6C3GMhjq8wxXb6PwmX8kXQ8" value={value}>{children}</GoldRushProvider></AuthContext.Provider>
}
