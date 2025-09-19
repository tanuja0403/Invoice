import React from 'react'
import axios from 'axios'
import '../css/Landing.css'

export default function Login({ apiBaseUrl }) {
  const [mode, setMode] = React.useState('login') // 'login' | 'register'
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const goToApp = () => {
    if (window.location.pathname !== '/app') {
      window.history.pushState({}, '', '/app')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const path = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login' ? { email, password } : { name, email, password }
      const { data } = await axios.post(`${apiBaseUrl}${path}`, body)
      localStorage.setItem('auth_token', data.token)
      goToApp()
    } catch (err) {
      setError(err.response?.data?.error || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing-root light" style={{ display: 'grid', placeItems: 'center' }}>
      <div className="auth-card">
        <div className="brand" style={{ justifyContent: 'center', marginBottom: 8 }}>
          <span className="brand-icon">📄</span>
          <span className="brand-name">Smart Invoice Manager</span>
        </div>
        <h2 style={{ textAlign: 'center', margin: '0 0 8px' }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginTop: 0 }}>{mode === 'login' ? 'Sign in to continue' : 'Start managing invoices in minutes'}</p>
        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && (
            <div className="form-row">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
            </div>
          )}
          <div className="form-row">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          {error && <div className="error-text" style={{ textAlign: 'center' }}>{error}</div>}
          <button className="primary-btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className="auth-switch">
          {mode === 'login' ? (
            <span>New here? <button className="link-btn" onClick={() => setMode('register')}>Create an account</button></span>
          ) : (
            <span>Have an account? <button className="link-btn" onClick={() => setMode('login')}>Sign in</button></span>
          )}
        </div>
        <button className="secondary-btn" onClick={goToApp} style={{ width: '100%' }}>Continue as guest</button>
      </div>
    </div>
  )
}


