import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Upload } from './components/Upload.jsx'
import { Dashboard } from './components/Dashboard.jsx'
import './css/Dashboard.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function App() {
  const [invoices, setInvoices] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const client = useMemo(() => axios.create({ baseURL: API_BASE_URL }), [])

  const fetchInvoices = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await client.get('/api/invoices')
      setInvoices(data)
    } catch (e) {
      setError('Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const { data } = await client.get('/api/analytics/summary')
      setSummary(data)
    } catch (e) {
      // ignore silently on first load
    }
  }

  useEffect(() => {
    fetchInvoices()
    fetchSummary()
  }, [])

  const handleUploaded = async () => {
    await Promise.all([fetchInvoices(), fetchSummary()])
  }
  const handleRemoveInvoice = async (invoiceId) => {
    try {
      await client.delete(`/api/invoices/${invoiceId}`)
      setInvoices((prevInvoices) =>
        prevInvoices.filter((invoice) => invoice._id !== invoiceId)
      )
    } catch (err) {
      console.error("Failed to delete invoice:", err)
    }
  }
  
  
  
  

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">📄</span>
          <span className="brand-name">InvoiceFlow</span>
        </div>
        <nav className="nav">
          <a className="nav-item active">Dashboard</a>
          <a className="nav-item">Reports</a>
          <a className="nav-item">Settings</a>
        </nav>
        <div className="help-link">Help</div>
      </aside>
      <main className="content">
        <header className="content-header">
          <h1>Documents</h1>
          <button className="primary-btn">+ New Document</button>
        </header>

        <section className="dropzone-section">
          <Upload apiBaseUrl={API_BASE_URL} onUploaded={handleUploaded} />
        </section>

        {loading && <p className="info-text">Loading…</p>}
        {error && <p className="error-text">{error}</p>}

        <section className="dashboard-section">
          <h2 className="section-title">Extracted Details</h2>
          <Dashboard invoices={invoices} analytics={summary} onRemoveInvoice={handleRemoveInvoice} />
        </section>
      </main>
    </div>
  )
}


