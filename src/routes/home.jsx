import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Title } from './helper/DocumentTitle'
import MaterialIcon from './helper/MaterialIcon'
import { MenuIcon } from './components/icons'
import Loading from './components/LoadingSpinner'
import { CheckIcon, ChromeIcon, BraveIcon } from './components/icons'
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from './../contexts/AuthContext'
import Logo from './../../src/assets/logo.svg'
import styles from './Home.module.scss'
import allowListFactoryABI from './../abi/allowlist-abi.json'

import { GoldRushProvider, NFTWalletTokenListView, TokenBalancesListView, TokenTransfersListView, AddressActivityListView } from '@covalenthq/goldrush-kit'




function Home({ title }) {
  const [allowlist, setAllowlist] = useState()
  Title(title)
  const auth = useAuth()
  const navigate = useNavigate()
  // const { connect, connected } = useConnect()
 
  
  const getAddresses = async () => {
    const myToken = new web3.eth.Contract(allowListFactoryABI, '0xa5e73b15c1c3ee477aed682741f0324c6787bbb8')
    setAllowlist(await myToken.methods.getAddress().call())
  }

  const addNewAddress = async (addr) => {
    console.log(addr)
    const myToken = new web3.eth.Contract(allowListFactoryABI, '0xa5e73b15c1c3ee477aed682741f0324c6787bbb8')
    console.log(await myToken.methods.addAddress().send({ from: addr, gas: 100_000 }))
  }

  useEffect(() => {
    getAddresses()
  }, [])

  return (
    <>
      <section className={styles.section}>
        <div className={`__container`} data-width={`medium`}>
          <div className="card">
            <div className="card__header">Allow List</div>
            <div className="card__body">
              {allowlist &&
                allowlist.map((item) => {
                  return <>⌛ {item.sender}</>
                })}
            </div>
          </div>

          <div className="card mt-40">
            <div className="card__body">
              <p>Join our allow list! We will be releasing a Lightsaber collection very soon⚔️</p>
              <button className="btn" onClick={() => addNewAddress(auth.wallet)}>
                Submit my wallet address
              </button>
            </div>
          </div>

          {/* <TokenBalancesListView
            chain_names={['eth-mainnet','eth-testnet', 'scroll-sepolia', 'matic-mainnet', 'bsc-mainnet', 'avalanche-mainnet', 'optimism-mainnet']}
            hide_small_balances
            address="0x20e229667Cec8A0e9D3C6Fb89693B2a44ec2C50e"
          /> */}

          {/* <TokenTransfersListView chain_name="eth-mainnet" address="0x20e229667Cec8A0e9D3C6Fb89693B2a44ec2C50e" contract_address="0x20e229667Cec8A0e9D3C6Fb89693B2a44ec2C50e" /> */}
          {/* <AddressActivityListView address="0x20e229667Cec8A0e9D3C6Fb89693B2a44ec2C50e" /> */}
          {auth.wallet && (
            <>
              <NFTWalletTokenListView
                address="0x20e229667Cec8A0e9D3C6Fb89693B2a44ec2C50e"
                chain_names={['eth-mainnet', 'matic-mainnet', 'bsc-mainnet', 'avalanche-mainnet', 'optimism-mainnet']}
              />
            </>
          )}
          <div className={`${styles.hero}`}>
            <div className={`grid grid--fit mt-20`} style={{ '--data-width': '300px' }}>
              <div className="d-flex align-items-center justify-content-center"></div>
              <div className={` d-flex align-items-center justify-content-center`}></div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
