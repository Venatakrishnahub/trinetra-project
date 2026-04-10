import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { patientAPI, visitAPI, prescriptionAPI } from '../api/services'
import { useToast } from '../context/ToastContext'
import Pagination from '../components/Pagination'

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—'

function StatCard({ icon, value, label, colorClass }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass}`}>{icon}</div>
      <div>
        <div className="stat-value">{value ?? <span className="spinner" style={{width:20,height:20}}></span>}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const toast = useToast()
  const navigate = useNavigate()

  const [stats, setStats]           = useState({ patients: null, visits: null, prescriptions: null, exams: null })
  const [recentVisits, setRV]       = useState([])
  const [patients, setPatients]     = useState([])
  const [page, setPage]             = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch]         = useState('')
  const [searchTimer, setTimer]     = useState(null)

  useEffect(() => { loadStats(); loadRecentVisits() }, [])
  useEffect(() => { loadPatients(0) }, [])

  async function loadStats() {
    try {
      const p = await patientAPI.getAll({ page:0, size:1 })
      setStats(s => ({ ...s, patients: p.data?.totalRecords ?? 0 }))
    } catch {}
    try {
      const v = await visitAPI.getAll({ page:0, size:1 })
      setStats(s => ({ ...s, visits: v.data?.totalRecords ?? 0 }))
    } catch {}
    try {
      const r = await prescriptionAPI.getAll({ page:0, size:1 })
      setStats(s => ({ ...s, prescriptions: r.data?.totalRecords ?? 0, exams: r.data?.totalRecords ?? 0 }))
    } catch {}
  }

  async function loadRecentVisits() {
    try {
      const res = await visitAPI.getAll({ page:0, size:6, sortBy:'id', sortDir:'desc' })
      setRV(res.data?.data || [])
    } catch {}
  }

  const loadPatients = useCallback(async (pg = 0, q = '') => {
    try {
      const res = await patientAPI.getAll({ page:pg, size:10, sortBy:'id', sortDir:'desc', search: q || undefined })
      setPatients(res.data?.data || [])
      setTotalPages(res.data?.totalPages || 0)
      setPage(pg)
    } catch { toast('Failed to load patients','error') }
  }, [])

  const handleSearch = (val) => {
    setSearch(val)
    clearTimeout(searchTimer)
    setTimer(setTimeout(() => loadPatients(0, val), 400))
  }

  return (
    <>
      {/* Stats */}
      <div className="stats-grid">
        <StatCard colorClass="blue" value={stats.patients}
          label="Total Patients"
          icon={<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>}
        />
        <StatCard colorClass="teal" value={stats.visits}
          label="Total Visits"
          icon={<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>}
        />
        <StatCard colorClass="gold" value={stats.prescriptions}
          label="Prescriptions"
          icon={<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13H9v-2h3c.83 0 1.5-.67 1.5-1.5S12.83 8 12 8H9V6h3zm-3 9l4-4h-4v4z"/></svg>}
        />
        <StatCard colorClass="green" value={stats.exams}
          label="Eye Exams Completed"
          icon={<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>}
        />
      </div>

      {/* Two columns */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        {/* Recent Visits */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Visits</span>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/visits')}>View All</button>
          </div>
          <div style={{padding:0}}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Patient</th><th>Date</th><th>Complaint</th></tr></thead>
                <tbody>
                  {recentVisits.length === 0
                    ? <tr><td colSpan="3" className="empty">No visits yet</td></tr>
                    : recentVisits.map(v => (
                        <tr key={v.id}>
                          <td><strong>{v.patientName || '—'}</strong></td>
                          <td>{fmt(v.visitDate)}</td>
                          <td style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.chiefComplaint || '—'}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header"><span className="card-title">Quick Actions</span></div>
          <div className="card-body">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[
                { label:'New Patient',   path:'/patients',      color:'#2563a8' },
                { label:'New Visit',     path:'/visits',        color:'#00b4d8' },
                { label:'Prescription',  path:'/prescriptions', color:'#e8a12a' },
                { label:'View Reports',  path:'/patients',      color:'#10b981' },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.path)}
                  style={{
                    padding:'14px',border:`2px solid ${a.color}20`,borderRadius:10,
                    background:`${a.color}08`,color:a.color,fontWeight:700,
                    fontSize:13,cursor:'pointer',fontFamily:'Outfit,sans-serif',
                    transition:'all 0.2s',
                  }}
                  onMouseEnter={e => { e.target.style.background=`${a.color}18` }}
                  onMouseLeave={e => { e.target.style.background=`${a.color}08` }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Patients List</span>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <div className="search-box" style={{width:200}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search patients…" />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/patients')}>
              + New Patient
            </button>
          </div>
        </div>
        <div style={{padding:0}}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Code</th><th>Name</th><th>Age</th><th>Gender</th><th>Mobile</th><th>Action</th></tr></thead>
              <tbody>
                {patients.length === 0
                  ? <tr><td colSpan="6" className="empty">No patients found</td></tr>
                  : patients.map(p => (
                      <tr key={p.id}>
                        <td><span className="badge badge-primary" style={{fontSize:10.5}}>{p.patientCode}</span></td>
                        <td><strong>{p.firstName} {p.lastName || ''}</strong></td>
                        <td>{p.age || '—'}</td>
                        <td>{p.gender || '—'}</td>
                        <td>{p.mobile || '—'}</td>
                        <td>
                          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/patients?id=${p.id}`)}>View</button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div style={{padding:'10px 16px'}}>
            <Pagination current={page} total={totalPages} onChange={p => loadPatients(p, search)} />
          </div>
        </div>
      </div>
    </>
  )
}
