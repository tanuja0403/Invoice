// import React, { useMemo } from 'react'
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

// export function Dashboard({ invoices }) {
//   const tableRows = invoices || []

//   const totalByVendor = useMemo(() => {
//     const acc = {}
//     for (const inv of tableRows) {
//       const vendor = inv.vendor || 'Unknown'
//       const val = parseFloat(String(inv.total || '').replace(/[,\s]/g, ''))
//       const num = Number.isFinite(val) ? val : 0
//       acc[vendor] = (acc[vendor] || 0) + num
//     }
//     return Object.entries(acc).map(([name, value]) => ({ name, value }))
//   }, [tableRows])

//   return (
//     <div>
//       <h2>Extracted Invoices</h2>
//       <div style={{ overflowX: 'auto', border: '1px solid #eee', borderRadius: 8 }}>
//         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//           <thead>
//             <tr style={{ background: '#fafafa' }}>
//               <th style={{ textAlign: 'left', padding: 8 }}>Vendor</th>
//               <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
//               <th style={{ textAlign: 'left', padding: 8 }}>Total</th>
//               <th style={{ textAlign: 'left', padding: 8 }}>Filename</th>
//               <th style={{ textAlign: 'left', padding: 8 }}>Created</th>
//             </tr>
//           </thead>
//           <tbody>
//             {tableRows.map((r) => (
//               <tr key={r._id}>
//                 <td style={{ padding: 8 }}>{r.vendor || '-'}</td>
//                 <td style={{ padding: 8 }}>{r.date || '-'}</td>
//                 <td style={{ padding: 8 }}>{r.total || '-'}</td>
//                 <td style={{ padding: 8 }}>{r.filename || '-'}</td>
//                 <td style={{ padding: 8 }}>{new Date(r.createdAt).toLocaleString()}</td>
//               </tr>
//             ))}
//             {tableRows.length === 0 && (
//               <tr>
//                 <td colSpan="5" style={{ padding: 12, color: '#888' }}>No data yet. Upload an invoice to get started.</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       <h2 style={{ marginTop: 24 }}>Totals by Vendor</h2>
//       <div style={{ width: '100%', height: 320 }}>
//         <ResponsiveContainer>
//           <BarChart data={totalByVendor} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="value" fill="#3b82f6" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   )
// }


import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts'
import '../css/Dashboard.css' 

export function Dashboard({ invoices, analytics, onRemoveInvoice }) {
  const [activeTab, setActiveTab] = React.useState('all')
  const tableRows = invoices || []

  const filteredRows = React.useMemo(() => {
    if (activeTab === 'all') return tableRows
    if (activeTab === 'invoices') return tableRows.filter(r => (r.type || 'invoice') === 'invoice')
    if (activeTab === 'receipts') return tableRows.filter(r => (r.type || 'invoice') === 'receipt')
    return tableRows
  }, [tableRows, activeTab])

  const totalByVendor = useMemo(() => {
    const acc = {}
    for (const inv of filteredRows) {
      const vendor = inv.vendor || 'Unknown'
      
      const val = parseFloat(String(inv.total || '').replace(/[,\s]/g, ''))
      const num = Number.isFinite(val) ? val : 0
      acc[vendor] = (acc[vendor] || 0) + num
    }
    return Object.entries(acc).map(([name, value]) => ({ name, value }))
  }, [filteredRows])

  const byMonthData = useMemo(() => {
    if (!analytics || !analytics.byMonth) return []
    return Object.entries(analytics.byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => ({ name, value }))
  }, [analytics])

  // Pie chart removed per request

  return (
    <div className="dashboard-container">
      <div className="tabs">
        <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</button>
        <button className={`tab ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => setActiveTab('invoices')}>Invoices</button>
        <button className={`tab ${activeTab === 'receipts' ? 'active' : ''}`} onClick={() => setActiveTab('receipts')}>Receipts</button>
      </div>
      <h2 className="dashboard-heading">Extracted Details</h2>
      
      <div className="table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Date</th>
              <th>Total</th>
              <th>Filename</th>
              <th>Created</th>
              <th>Actions</th> 
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r) => (
              <tr key={r._id}>
                <td>{r.vendor || '-'}</td>
                <td>{r.date || '-'}</td>
                <td>{r.total || '-'}</td>
                <td>{r.filename || '-'}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${r.status || 'pending'}`}>
                    {(r.status || 'pending').replace(/^./, c => c.toUpperCase())}
                  </span>
                  <button 
                    className="remove-btn" 
                    onClick={() => onRemoveInvoice(r._id)}
                    title="Remove invoice"
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr className="empty-row">
                <td colSpan="6">
                  No data yet. Upload an invoice to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <div className="stat-title">Documents</div>
          <div className="stat-value">{analytics?.count ?? invoices.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Amount</div>
          <div className="stat-value">${(analytics?.amountSum ?? 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="chart-container">
          <h3 className="chart-title">Totals by Vendor</h3>
          <ResponsiveContainer>
            <BarChart data={totalByVendor} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Monthly Trend</h3>
          <ResponsiveContainer>
            <LineChart data={byMonthData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}