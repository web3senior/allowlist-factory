import { useEffect, useState } from 'react'
import { Outlet, useLocation, Link, NavLink, useNavigate, useNavigation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './../contexts/AuthContext'
import MaterialIcon from './helper/MaterialIcon'
import { MenuIcon } from './components/icons'
import styles from './Layout.module.scss'
import Logo from './../../src/assets/logo.svg'
import { CovalentClient } from '@covalenthq/client-sdk'
let links = [
  {
    name: 'Home',
    icon: null,
    path: '/',
  },
  {
    name: 'About Us',
    icon: null,
    path: 'about',
  },
]

export default function Root() {
  const [balance, setBalance] = useState()
  const [isLoading, setIsLoading] = useState()
  const noHeader = ['/sss']
  const auth = useAuth()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const location = useLocation()

  const getBalance = async () => {
    const client = new CovalentClient('cqt_rQXcP6C3GMhjq8wxXb6PwmX8kXQ8')
    const resp = await client.BalanceService.getTokenBalancesForWalletAddress('eth-mainnet', '0x20e229667Cec8A0e9D3C6Fb89693B2a44ec2C50e')
    setBalance(resp.data)
    console.log(resp.data)
  }

  useEffect(() => {
    getBalance()
  }, [])

  return (
    <>
      <Toaster />
      <div className={styles.layout}>
        <header className={`${styles.header}`}>
          <div className={`${styles.container} d-flex align-items-center justify-content-between`}>
            <Link to={'/'}>
              <div className={`${styles.logo} d-flex align-items-center`}>
                <figure>
                  <img src={Logo} alt={`logo`} />
                </figure>
                <b>{import.meta.env.VITE_NAME}</b>
              </div>
            </Link>

            {/* <ul className={`d-flex flex-row align-items-center`}>
              {links.map((item, i) => (
                <li key={i}>
                  <Link to={item.path} target={item.target}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul> */}

            <div className={`d-flex align-items-center`} style={{ columnGap: '1rem' }}>
              {!auth.wallet && (
                <>
                  <button className="btn mt-40" onClick={() => auth.connectWallet()}>
                    Connect
                  </button>
                </>
              )}
              <span></span>
              <ul className={`d-flex flex-column align-items-left`}>
                <li style={{color: 'var(--area1)'}}>{auth.wallet && `${auth.wallet.slice(0, 4)}...${auth.wallet.slice(38)}`}</li>
                <li>Balance: {balance && balance.items[0].pretty_quote}</li>
              </ul>
              
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>

      <div className="cover" onClick={() => handleOpenNav()} />
      <nav className={`${styles.nav} animate`} id="modal">
        <figure>
          <img src={Logo} alt={`logo`} />
        </figure>
        <ul>
          <li className="">
            <button onClick={() => handleNavLink(`/`)}>
              <MaterialIcon name="home" />
              <span>Home</span>
            </button>
          </li>
          <li className="">
            <button onClick={() => handleNavLink(`/about`)}>
              <MaterialIcon name="info" />
              <span>About us</span>
            </button>
          </li>
        </ul>

        <small>{`Version ${import.meta.env.VITE_VERSION}`}</small>
      </nav>
    </>
  )
}
