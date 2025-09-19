import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Landing from './components/Landing.jsx'

const root = createRoot(document.getElementById('root'))

function Router() {
  const [path, setPath] = React.useState(window.location.pathname)
  React.useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  if (path === '/app') return <App />
  return <Landing />
}

root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
)


