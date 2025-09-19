import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Landing from './components/Landing.jsx'
import Login from './components/Login.jsx'

const root = createRoot(document.getElementById('root'))

function Router() {
  const [path, setPath] = React.useState(window.location.pathname)
  React.useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  if (path === '/app') return <App />
  if (path === '/login') return <Login apiBaseUrl={import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'} />
  return <Landing />
}

root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
)


