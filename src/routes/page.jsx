import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getConfig, addEvent } from '../util/api'
import LSP0ERC725Account from '@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json'
import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json'
import Web3 from 'web3'
import Loading from './components/LoadingSpinner'
import PinkCheckmark from './../assets/pink-checkmark.svg'
import { Helmet } from 'react-helmet'
import styles from './Page.module.scss'
import toast from 'react-hot-toast'
import Shimmer from './helper/Shimmer.jsx'
const RPC_URL = `https://rpc.testnet.lukso.gateway.fm`
const schemas = [
  {
    name: 'SupportedStandards:LSP3Profile',
    key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
    keyType: 'Mapping',
    valueType: 'bytes',
    valueContent: '0x5ef83ad9',
  },
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueType: 'bytes',
    valueContent: 'VerifiableURI',
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    keyType: 'Singleton',
    valueType: 'address',
    valueContent: 'Address',
  },
]
const web3 = new Web3(RPC_URL)

let mediaRecorder = ''
let chunks = []

function Page() {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState()
  const [config, setConfig] = useState()
  const [blobFile, setBlobfile] = useState()

  const params = useParams()

  const audioRecorder = {
    start: () => {
      console.log('start')

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('getUserMedia supported.')
        navigator.mediaDevices
          .getUserMedia(
            // constraints - only audio needed for this app
            {
              audio: true,
            }
          )

          // Success callback
          .then((stream) => {
            mediaRecorder = new MediaRecorder(stream)
            mediaRecorder.start()
            console.log(mediaRecorder.state)
            console.log('recorder started')

            mediaRecorder.ondataavailable = (e) => {
              chunks.push(e.data)
            }
          })

          // Error callback
          .catch((err) => {
            console.error(`The following getUserMedia error occurred: ${err}`)
          })
      } else {
        console.log('getUserMedia not supported on your browser!')
      }
    },
    pause: () => true,
    stop: () => {
      mediaRecorder.stop()
      console.log(mediaRecorder.state)
      console.log('recorder stopped')

      const audio = document.createElement('audio')
      audio.setAttribute('controls', '')

      const blob = new Blob(chunks, { type: 'audio/mp4; codecs="mp4a.40.2"' })
      chunks = []
      const audioURL = window.URL.createObjectURL(blob)
      audio.src = audioURL
      document.querySelector(`#audioHold`).appendChild(audio)

      setBlobfile(blob)
      console.log(blob)
    },
    download: () => true,
  }

  /**
   * Download CID
   * @param {string} CID
   * @returns
   */
  const getIPFS = async (CID) => {
    console.log(CID)
    let requestOptions = {
      method: 'GET',
      redirect: 'follow',
    }
    const response = await fetch(`https://api.universalprofile.cloud/ipfs/${CID}`, requestOptions)
    if (!response.ok) throw new Response('Failed to get data', { status: 500 })
    return response.json()
  }

  /**
   * Fetch profile
   * @param {string} addr
   * @returns
   */
  const fetchProfile = async (addr) => {
    console.log(addr)
    var contract = new web3.eth.Contract(LSP0ERC725Account.abi, addr)
    return contract.methods
      .getData(schemas[1].key)
      .call()
      .then(async (data) => {
        console.log(data)
        data = data.substring(6, data.length)
        const hashFunction = '0x' + data.slice(0, 8)
        const hash = '0x' + data.slice(76)
        const url = '0x' + data.slice(76)
        // console.log(hashFunction, ' | ', hash, ' | ', url)
        // check if it uses keccak256
        // if (hashFunction === '0x6f357c6a') {
        // download the json file
        const json = await getIPFS(web3.utils.hexToUtf8(url).replace('ipfs://', '').replace('://', ''))
        return json
        //   }
      })
  }

  const fetchAsset = async (addr) => {
    console.log(addr)
    var contract = new web3.eth.Contract(LSP7DigitalAsset.abi, '0xc1A411B2F0332C86c90Af22f5367A0265bCB1Df9')
    return contract.methods
      .getData('0xeafec4d89fa9619884b60000a4d96624a38f7ac2d8d9a604ecf07c12c77e480c')
      .call()
      .then(async (data) => {
        console.log(data)
      })
  }

  const record = () => {
    audioRecorder.start()
  }

  const handleSubmit = async (e) => {
    console.log(blobFile)
    let form = new FormData()
    form.append('voice', blobFile, 'audio.ogg')
    form.append('chat_id', '1321105370')
    form.append('caption', 'test')
    const response = await fetch('https://api.telegram.org/bot6839061467:AAFGUaHBx8jsyPbFTxL9-spfgUu158AHHDY/sendVoice', {
      method: 'POST',
      body: form,
    })
    console.log(await response.json())
  }

  useEffect(() => {
    getConfig(params.username, '').then((result) => {
      setConfig(result)

      // fetchProfile(result.wallet_addr).then(async (profileData) => {
      //   setProfile(profileData.LSP3Profile)
      //   setIsLoading(false)
      // })

      fetchAsset(result.wallet_addr).then(async (data) => {
      
      })
    })
  }, [])

  if (isLoading) return <Loading />

  return (
    <>
      <Helmet>
        <title>
          @{params.username} - {import.meta.env.VITE_NAME}
        </title>
        <meta name="title" content={`@${params.username} - ${import.meta.env.VITE_NAME}`} />
        <meta name="description" content="Embrace the links" />
      </Helmet>

      <div
        id={`page`}
        className={`${styles.page}`}
        style={{
          '--color-background': (config && JSON.parse(config.style).backgroundColor) || '#F9F9FB',
          '--color-text': (config && JSON.parse(config.style).textColor) || '#212121',
          '--color-button-background': (config && JSON.parse(config.style).buttonBackgroundColor) || '#fff',
          '--color-shadow': (config && JSON.parse(config.style).shadowColor) || 'rgba(0, 0, 0, 0.25)',
          '--border-radius': (config && JSON.parse(config.style).borderRadius) || '0',
        }}
      >
                  {isLoading && (
          <Shimmer theme="light">
            <div>
              <div style={{ width: '100%', borderRadius: '24px', height: '200px', background: '#e1e1e1' }}></div>
              <div style={{ width: '80%', borderRadius: '24px', height: '20px', background: '#e1e1e1', marginTop: '1rem' }}></div>
              <div style={{ width: '50%', borderRadius: '24px', height: '20px', background: '#e1e1e1', marginTop: '1rem' }}></div>
              <div style={{ width: '90%', borderRadius: '24px', height: '20px', background: '#e1e1e1', marginTop: '1rem' }}></div>
              <div style={{ width: '30%', borderRadius: '24px', height: '20px', background: '#e1e1e1', marginTop: '1rem' }}></div>
              <ul className="d-flex" style={{ columnGap: '1rem' }}>
                <li className="flex-1">
                  <div style={{ width: '100%', borderRadius: '24px', height: '80px', background: '#e1e1e1', marginTop: '1rem' }}></div>
                </li>
                <li className="flex-1">
                  <div style={{ width: '100%', borderRadius: '24px', height: '80px', background: '#e1e1e1', marginTop: '1rem' }}></div>
                </li>
                <li className="flex-1">
                  <div style={{ width: '100%', borderRadius: '24px', height: '80px', background: '#e1e1e1', marginTop: '1rem' }}></div>
                </li>
              </ul>
            </div>
          </Shimmer>
        )}
        <div className={`__container ${styles.container} d-flex flex-column align-items-center justify-content-between text-center`} data-width={`medium`}>
          {profile && (
            <>
              <header className={`d-flex flex-column align-items-center justify-content-start text-center`}>
                <figure className={`animate__animated animate__fadeInDown`}>
                  {profile.profileImage && (
                    <img src={profile.profileImage.length > 0 ? `https://api.universalprofile.cloud/ipfs/${profile.profileImage[0].url.replace('ipfs://', '')}` : null} />
                  )}
                </figure>

                <ul className={`${styles.name} d-flex flex-row align-items-center justify-content-start text-center`}>
                  <li>
                    <h5>{config && config.username}</h5>
                  </li>
                  <li title={`Verified`}>{config && (config.username === `atenyun` || config.username === `tantodefi.eth`) && <img src={PinkCheckmark} />}</li>
                </ul>

                <p className={styles.description}>{profile.description}</p>

                <ul className={`${styles.tags} d-flex flex-row align-items-center justify-content-start`}>
                  {profile.tags.map((item, i) => {
                    return (
                      <li key={i} className={`animate__animated animate__fadeInUp`} style={{ '--animate-duration': `0.${++i * 2}s` }}>
                        <span className={styles.tag}>{item}</span>
                      </li>
                    )
                  })}
                </ul>
              </header>

              <main className={`d-flex flex-column align-items-center justify-content-start text-center`}>
                <ul className={`d-flex flex-column align-items-center justify-content-start text-center`}>
                  {config &&
                    JSON.parse(config.links).length > 0 &&
                    JSON.parse(config.links)
                      .filter((item) => item.status)
                      .sort((a, b) => a.priority - b.priority)
                      .map((item, i) => {
                        return (
                          <li
                            key={i}
                            style={{ '--animate-duration': `0.${i * 2}s` }}
                            className={`d-flex flex-column align-items-center justify-content-start text-center animate__animated animate__fadeInUp`}
                            onClick={() => addEvent(params.username, 'click', item.title)}
                          >
                            <a href={`${item.url}`} className={styles.link} target={`_blank`}>
                              {item.title}
                            </a>
                          </li>
                        )
                      })}
                </ul>
              </main>

              <footer className={`d-flex flex-column align-items-center justify-content-center`}>
                <a href={`/`}>
                  <div className={`d-flex flex-column align-items-center justify-content-center`}>
                    <svg width="40" height="31" viewBox="0 0 40 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M28.8571 23.6541V28.1248C35.1042 27.3111 39.9286 21.9689 39.9286 15.5C39.9286 8.46826 34.2282 2.76788 27.1964 2.76788H16.6786V7.19645H27.1964C36.8658 7.19645 37.6523 22.0011 28.8571 23.6541Z"
                        fill="#FD1669"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.48214 7.85639V3.20541C4.06104 4.66636 0.0714245 9.61726 0.0714245 15.5C0.0714245 22.5317 5.7718 28.2321 12.8036 28.2321H23.3214V23.8035H12.8036C3.79138 23.8035 2.49561 10.9428 9.48214 7.85639Z"
                        fill="#005FF7"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M26.0893 31C28.8408 31 31.0714 28.7694 31.0714 26.0178C31.0714 23.2663 28.8408 21.0357 26.0893 21.0357C23.3377 21.0357 21.1071 23.2663 21.1071 26.0178C21.1071 28.7694 23.3377 31 26.0893 31ZM26.0893 28.7857C27.6179 28.7857 28.8571 27.5465 28.8571 26.0178C28.8571 24.4892 27.6179 23.25 26.0893 23.25C24.5606 23.25 23.3214 24.4892 23.3214 26.0178C23.3214 27.5465 24.5606 28.7857 26.0893 28.7857Z"
                        fill="#005FF7"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12.25 9.96429C15.0016 9.96429 17.2321 7.7337 17.2321 4.98214C17.2321 2.23058 15.0016 0 12.25 0C9.49844 0 7.26786 2.23058 7.26786 4.98214C7.26786 7.7337 9.49844 9.96429 12.25 9.96429ZM12.25 7.75C13.7786 7.75 15.0179 6.51079 15.0179 4.98214C15.0179 3.4535 13.7786 2.21429 12.25 2.21429C10.7214 2.21429 9.48214 3.4535 9.48214 4.98214C9.48214 6.51079 10.7214 7.75 12.25 7.75Z"
                        fill="#FD1669"
                      />
                    </svg>

                    <small>{import.meta.env.VITE_NAME}</small>
                  </div>
                </a>
              </footer>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Page
