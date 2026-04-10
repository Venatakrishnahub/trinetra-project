import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { visitAPI, patientAPI, userAPI } from '../api/services'
import { useToast } from '../context/ToastContext'
import Pagination from '../components/Pagination'
import ExamForm from '../components/ExamForm'

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—'

export default function Visits() {
  const toast    = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const examRef  = useRef({})

  const [view, setView]         = useState('list') // 'list' | 'form'
  const [visits, setVisits]     = useState([])
  const [page, setPage]         = useState(0)
  const [totalPages, setTP]     = useState(0)
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [vsearch, setVSearch]   = useState('')
  const searchTimer = useRef(null)

  // Form state
  const [editId,   setEditId]   = useState(null)
  const [patients, setPatients] = useState([])
  const [users,    setUsers]    = useState([])
  const [saving,   setSaving]   = useState(false)
  const [currentVisitData, setCVD] = useState(null)
  const [vForm, setVForm]       = useState({
    patientId:'', visitDate: new Date().toISOString().slice(0,16), optometristId:''
  })

  useEffect(() => {
    loadPatients()
    loadUsers()
    const pid = searchParams.get('patientId')
    const vid = searchParams.get('visitId')
    if (pid) { setVForm(f => ({...f, patientId:pid})); setView('form') }
    else if (vid) openEdit(Number(vid))
    else loadVisits(0)
  }, [])

  async function loadVisits(pg = 0) {
    setLoading(true)
    try {
      const res = await visitAPI.getAll({ page:pg, size:15, sortBy:'id', sortDir:'desc', search: vsearch || undefined })
      setVisits(res.data?.data || [])
      setTP(res.data?.totalPages || 0)
      setTotal(res.data?.totalRecords || 0)
      setPage(pg)
    } catch { toast('Failed to load visits','error') }
    finally { setLoading(false) }
  }

  async function loadPatients() {
    try {
      const res = await patientAPI.getAll({ page:0, size:500 })
      setPatients(res.data?.data || [])
    } catch {}
  }

  async function loadUsers() {
    try {
      const res = await userAPI.getAll()
      setUsers(res.data?.data || res.data || [])
    } catch {}
  }

  const handleVSearch = (val) => {
    setVSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => loadVisits(0), 400)
  }

  const openNew = () => {
    setEditId(null)
    setCVD(null)
    setVForm({ patientId:'', visitDate: new Date().toISOString().slice(0,16), optometristId:'' })
    setView('form')
  }

  const openEdit = async (id) => {
    try {
      const res = await visitAPI.getById(id)
      const v = res.data?.data || res.data
      setEditId(id)
      setCVD(v)
      setVForm({
        patientId: String(v.patientId || ''),
        visitDate: v.visitDate?.slice(0,16) || new Date().toISOString().slice(0,16),
        optometristId: String(v.optometristId || ''),
      })
      setView('form')
    } catch { toast('Failed to load visit','error') }
  }

  const saveVisit = async () => {
    if (!vForm.patientId) { toast('Please select a patient','warning'); return }
    setSaving(true)
    try {
      // Get history data from the ExamForm
      const histPayload = examRef.current?.getHistoryPayload?.() || {}

      const visitPayload = {
        patientId: parseInt(vForm.patientId),
        visitDate: vForm.visitDate || new Date().toISOString(),
        optometristId: vForm.optometristId ? parseInt(vForm.optometristId) : null,
        ...histPayload,
      }

      let vid = editId
      if (editId) {
        await visitAPI.update(editId, visitPayload)
      } else {
        const res = await visitAPI.create(visitPayload)
        vid = res.data?.data?.id || res.data?.id
      }

      // Save all exam sub-tables
      if (vid && examRef.current?.saveAllExam) {
        await examRef.current.saveAllExam(vid)
      }

      toast('Examination saved successfully!', 'success')
      setEditId(vid)
    } catch (e) {
      toast(e.response?.data?.message || 'Save failed','error')
    } finally { setSaving(false) }
  }

  const vf = (k) => (e) => setVForm(prev => ({...prev, [k]: e.target.value}))

  return (
    <>
      {/* ─── LIST VIEW ─── */}
      {view === 'list' && (
        <>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-body" style={{padding:'14px 20px'}}>
              <div style={{display:'flex',gap:12,alignItems:'flex-end',flexWrap:'wrap'}}>
                <div className="form-group" style={{margin:0,flex:2,minWidth:180}}>
                  <label className="form-label">Search</label>
                  <input className="form-control" value={vsearch} onChange={e=>handleVSearch(e.target.value)}
                    placeholder="Patient name or code…" />
                </div>
                <button className="btn btn-primary" onClick={openNew}>+ New Visit</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Visit Records</span>
              <span style={{fontSize:12,color:'#8aa0b8'}}>{total} visits</span>
            </div>
            <div style={{padding:0}}>
              {loading
                ? <div style={{textAlign:'center',padding:40}}><span className="spinner spinner-lg"></span></div>
                : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Visit Code</th><th>Patient</th><th>Date</th>
                        <th>Optometrist</th><th>Chief Complaint</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visits.length === 0
                        ? <tr><td colSpan="6" className="empty">No visits found</td></tr>
                        : visits.map(v => (
                          <tr key={v.id}>
                            <td><span className="badge badge-info">{v.visitCode || '—'}</span></td>
                            <td><strong>{v.patientName || '—'}</strong></td>
                            <td>{fmt(v.visitDate)}</td>
                            <td style={{color:'#4a6080'}}>{v.optometristName || '—'}</td>
                            <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                              {v.chiefComplaint || '—'}
                            </td>
                            <td>
                              <div style={{display:'flex',gap:6}}>
                                <button className="btn btn-outline btn-sm" onClick={() => openEdit(v.id)}>
                                  Edit
                                </button>
                                <button className="btn btn-accent btn-sm"
                                  onClick={() => window.open(`/print/workup/${v.id}`, '_blank')}>
                                  Print
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{padding:'10px 16px'}}>
                <Pagination current={page} total={totalPages} onChange={p => loadVisits(p)} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── FORM VIEW ─── */}
      {view === 'form' && (
        <>
          {/* Visit Header Info */}
          <div className="card" style={{marginBottom:16}}>
            <div className="card-body" style={{padding:'16px 20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <h3 style={{fontSize:16,fontWeight:700,color:'#0f2339'}}>
                  {editId ? 'Edit Visit & Examination' : 'New Visit & Examination'}
                </h3>
                <button className="btn btn-outline btn-sm" onClick={() => { setView('list'); loadVisits(0) }}>
                  ← Back to Visits
                </button>
              </div>
              <div className="form-row form-row-3">
                <div className="form-group">
                  <label className="form-label">Patient *</label>
                  <select className="form-control" value={vForm.patientId} onChange={vf('patientId')}>
                    <option value="">Select Patient</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.patientCode} — {p.firstName} {p.lastName || ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Visit Date & Time</label>
                  <input type="datetime-local" className="form-control" value={vForm.visitDate} onChange={vf('visitDate')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Optometrist</label>
                  <select className="form-control" value={vForm.optometristId} onChange={vf('optometristId')}>
                    <option value="">Select Optometrist</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.fullName || u.username}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 6-Tab Examination Form */}
          <div className="card">
            <div style={{padding:'0 20px'}}>
              <ExamForm
                visitId={editId}
                initialVisitData={currentVisitData}
                onSaveExam={examRef}
              />
            </div>

            {/* Footer */}
            <div style={{
              padding:'16px 20px', borderTop:'1px solid #e8eff6',
              display:'flex', justifyContent:'space-between', alignItems:'center'
            }}>
              <span style={{fontSize:12,color:'#8aa0b8'}}>All tabs are saved together</span>
              <div style={{display:'flex',gap:10}}>
                <button className="btn btn-outline" onClick={() => { setView('list'); loadVisits(0) }}>Cancel</button>
                <button className="btn btn-success" disabled={saving} onClick={saveVisit}>
                  {saving
                    ? <><span className="spinner"></span> Saving…</>
                    : <>
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
                        Save Examination
                      </>
                  }
                </button>
                {editId && (
                  <button className="btn btn-accent"
                    onClick={() => window.open(`/print/workup/${editId}`, '_blank')}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                    Print Workup Sheet
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
