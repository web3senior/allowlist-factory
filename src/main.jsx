import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import './index.scss'
import './styles/global.scss'
import "@covalenthq/goldrush-kit/styles.css";

import ErrorPage from './error-page'
import Loading from './routes/components/LoadingSpinner'
const Layout = lazy(() => import('./routes/layout.jsx'))
import Home from './routes/home.jsx'
// import Page from './routes/page.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<Loading />}>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </Suspense>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to={`home`}/> //<SplashScreen title={`Welcome`} />,
      },
      {
        path: '/home',
        element: <Home title={`Home`} />,
      },
    ],
  },
  {
    path: ':username',
    element:<>test</>,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(<RouterProvider router={router} />)
