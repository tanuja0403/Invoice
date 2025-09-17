import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Upload } from './components/Upload.jsx'
import { Dashboard } from './components/Dashboard.jsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function App() {
  const [invoices, setInvoices] = useState([])
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

  useEffect(() => {
    fetchInvoices()
  }, [])

  const handleUploaded = async () => {
    await fetchInvoices()
  }
  const handleRemoveInvoice = (invoiceId) => {
    setInvoices((prevInvoices) =>
      prevInvoices.filter((invoice) => invoice._id !== invoiceId) // assuming _id from backend
    )
  }
 

  return (
    <div style={{ fontFamily: 'Inter, system-ui, Arial', padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1>Invoice OCR Dashboard</h1>
      <Upload apiBaseUrl={API_BASE_URL} onUploaded={handleUploaded} />
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <Dashboard 
      invoices={invoices}
      onRemoveInvoice={handleRemoveInvoice}/>
    </div>
  )
}


