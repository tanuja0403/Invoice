import React, { useRef, useState } from 'react'
import axios from 'axios'

export function Upload({ apiBaseUrl, onUploaded }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

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
      if (inputRef.current) inputRef.current.value = ''
      if (onUploaded) onUploaded()
    } catch (e) {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const openFilePicker = () => inputRef.current && inputRef.current.click()

  return (
    <form onSubmit={onSubmit} className="dropzone" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      <div className="dropzone-inner">
        <div className="dropzone-icon">☁️</div>
        <div className="dropzone-title">Drag and drop files here</div>
        <div className="dropzone-subtitle">Or, you can browse files from your computer</div>
        <div className="dropzone-actions">
          <button type="button" className="secondary-btn" onClick={openFilePicker}>Browse files</button>
          <button type="submit" className="primary-btn" disabled={uploading || !file}>
            {uploading ? 'Uploading…' : file ? 'Upload' : 'Select a file'}
          </button>
        </div>
        {file && <div className="selected-file">Selected: {file.name}</div>}
        {error && <div className="error-text">{error}</div>}
      </div>
      <input ref={inputRef} type="file" accept=".pdf,image/*" onChange={onFileChange} hidden />
    </form>
  )
}


