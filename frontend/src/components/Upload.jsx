import React, { useState } from 'react'
import axios from 'axios'

export function Upload({ apiBaseUrl, onUploaded }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const onFileChange = (e) => {
    setFile(e.target.files?.[0] || null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please choose a file (PDF or image).')
      return
    }
    setError('')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      await axios.post(`${apiBaseUrl}/api/invoices`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setFile(null)
      if (onUploaded) onUploaded()
    } catch (e) {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '16px 0' }}>
      <input type="file" accept=".pdf,image/*" onChange={onFileChange} />
      <button type="submit" disabled={uploading}>{uploading ? 'Uploading…' : 'Upload'}</button>
      {error && <span style={{ color: 'crimson' }}>{error}</span>}
    </form>
  )
}


