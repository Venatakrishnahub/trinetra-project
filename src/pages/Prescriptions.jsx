import React, { useState, useEffect, useRef } from 'react'
import { prescriptionAPI, patientAPI, visitAPI, userAPI } from '../api/services'
import { useToast } from '../context/ToastContext'

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—'
const v = (id, form) => form[id] || ''
const EyeField = ({ label, onChange, value, ph }) => (
  <input className="form-control" style={{margin:0}} value={value} onChange={onChange} placeholder={ph||''} />
)

const EMPTY_RX = {
  patientId:'', visitId:'', optometristId:'', purpose:'', diagnosis:'',
  sphOd:'', cylOd:'', axisOd:'', prismOd:'', bcvaOd:'', addOd:'',
  sphOs:'', cylOs:'', axisOs:'', prismOs:'', bcvaOs:'', addOs:'',
  dpdRe:'', dpdLe:'', dpdBoth:'', npdRe:'', npdLe:'', npdBoth:'',
}

export default function Prescriptions() {
  const toast = useToast()
  const [view, setView]           = useState('list')
  const [rxList, setRxList]       = useState([])
  const [loading, setLoading]     = useState(false)
  const [search, setSearch]       = useState('')
  const searchTimer               = useRef(null)

  const [editId, setEditId]       = useState(null)
  const [form, setForm]           = useState(EMPTY_RX)
  const [saving, setSaving]       = useState(false)
  const [patients, setPatients]   = useState([])
  const [visits, setVisits]       = useState([])
  const [users, setUsers]         = useState([])

  useEffect(() => { loadList(); loadPatients(); loadUsers() }, [])

  async function loadList() {
    setLoading(true)
    try {
      const res = await prescriptionAPI.getAll({ page:0, size:50, search: search||undefined })
      setRxList(res.data?.data || [])
    } catch { toast('Failed to load','error') }
    finally { setLoading(false) }
  }

  async function loadPatients() {
    try { const r = await patientAPI.getAll({page:0,size:500}); setPatients(r.data?.data||[]) } catch {}
  }

  async function loadUsers() {
    try { const r = await userAPI.getAll(); setUsers(r.data?.data||r.data||[]) } catch {}
  }

  async function loadPatientVisits(pid) {
    if (!pid) { setVisits([]); return }
    try { const r = await visitAPI.getByPatient(pid); setVisits(r.data?.data||r.data||[]) } catch {}
  }

  const f = (k) => (e) => {
    setForm(p => ({...p, [k]: e.target.value}))
    if (k === 'patientId') loadPatientVisits(e.target.value)
  }

  const openNew = () => {
    setEditId(null); setForm(EMPTY_RX); setVisits([])
    setView('form')
  }

  const openEdit = async (id) => {
    try {
      const res = await prescriptionAPI.getById(id)
      const r = res.data?.data || res.data
      const details = r.details || []
      const ipd     = r.interpupillaryDistance || {}
      const od = details.find(d => d.eye === 'OD') || {}
      const os = details.find(d => d.eye === 'OS') || {}
      await loadPatientVisits(r.patientId)
      setForm({
        patientId:     String(r.patientId || ''),
        visitId:       String(r.visitId || ''),
        optometristId: String(r.optometristId || ''),
        purpose:  r.purpose  || '',
        diagnosis:r.diagnosis|| '',
        sphOd: od.sph||'', cylOd: od.cyl||'', axisOd: od.axis||'', prismOd: od.prsm||'', bcvaOd: od.bcva||'', addOd: od.addValue||'',
        sphOs: os.sph||'', cylOs: os.cyl||'', axisOs: os.axis||'', prismOs: os.prsm||'', bcvaOs: os.bcva||'', addOs: os.addValue||'',
        dpdRe: ipd.dpdRe||'', dpdLe: ipd.dpdLe||'', dpdBoth: ipd.dpdBoth||'',
        npdRe: ipd.npdRe||'', npdLe: ipd.npdLe||'', npdBoth: ipd.npdBoth||'',
      })
      setEditId(id)
      setView('form')
    } catch { toast('Failed to load prescription','error') }
  }

  const save = async () => {
    if (!form.patientId) { toast('Please select a patient','warning'); return }
    setSaving(true)
    try {
      const payload = {
        patientId:     parseInt(form.patientId),
        visitId:       form.visitId ? parseInt(form.visitId) : null,
        optometristId: form.optometristId ? parseInt(form.optometristId) : null,
        purpose:       form.purpose,
        diagnosis:     form.diagnosis,
      }
      let rxId = editId
      if (editId) { await prescriptionAPI.update(editId, payload) }
      else {
        const res = await prescriptionAPI.create(payload)
        rxId = res.data?.data?.id || res.data?.id
      }
      setEditId(rxId)

      // Save OD + OS details
      for (const [eye, sfx] of [['OD','Od'],['OS','Os']]) {
        await prescriptionAPI.saveDetails({
          prescriptionId: rxId, eye,
          sph: form[`sph${sfx}`] || null, cyl: form[`cyl${sfx}`] || null,
          axis: form[`axis${sfx}`] ? parseInt(form[`axis${sfx}`]) : null,
          prsm: form[`prism${sfx}`] || null, bcva: form[`bcva${sfx}`] || null,
          addValue: form[`add${sfx}`] || null,
        }).catch(()=>{})
      }
      // Save IPD
      await prescriptionAPI.saveIPD({
        prescriptionId: rxId,
        dpdRe:   form.dpdRe   ? parseFloat(form.dpdRe)   : null,
        dpdLe:   form.dpdLe   ? parseFloat(form.dpdLe)   : null,
        dpdBoth: form.dpdBoth ? parseFloat(form.dpdBoth) : null,
        npdRe:   form.npdRe   ? parseFloat(form.npdRe)   : null,
        npdLe:   form.npdLe   ? parseFloat(form.npdLe)   : null,
        npdBoth: form.npdBoth ? parseFloat(form.npdBoth) : null,
      }).catch(()=>{})

      toast('Prescription saved successfully!')
    } catch (e) {
      toast(e.response?.data?.message || 'Save failed','error')
    } finally { setSaving(false) }
  }

  const handleSearch = (val) => {
    setSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(loadList, 400)
  }

  const examRowStyle = { background:'#1a3a5c', color:'white', textAlign:'center', padding:'7px 10px', fontWeight:700, fontSize:11 }
  const examRowStyleOs = { ...examRowStyle, background:'#0096b4' }

  return (
    <>
      {/* LIST VIEW */}
      {view === 'list' && (
        <>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-body" style={{padding:'14px 20px'}}>
              <div style={{display:'flex',gap:12,alignItems:'flex-end',flexWrap:'wrap'}}>
                <div className="form-group" style={{margin:0,flex:2,minWidth:180}}>
                  <label className="form-label">Search</label>
                  <input className="form-control" value={search} onChange={e=>handleSearch(e.target.value)} placeholder="Patient name, code…" />
                </div>
                <button className="btn btn-primary" onClick={openNew}>+ New Prescription</button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Prescription Records</span></div>
            <div style={{padding:0}}>
              {loading
                ? <div style={{textAlign:'center',padding:40}}><span className="spinner spinner-lg"></span></div>
                : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Rx Code</th><th>Patient</th><th>Visit</th><th>Purpose</th><th>Optometrist</th><th>Date</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {rxList.length === 0
                        ? <tr><td colSpan="7" className="empty">No prescriptions found</td></tr>
                        : rxList.map(r => (
                          <tr key={r.id}>
                            <td><span className="badge badge-info">{r.prescriptionCode || '—'}</span></td>
                            <td><strong>{r.patientName || '—'}</strong></td>
                            <td style={{color:'#4a6080'}}>{r.visitCode || '—'}</td>
                            <td>{r.purpose || '—'}</td>
                            <td style={{color:'#4a6080'}}>{r.optometristName || '—'}</td>
                            <td>{fmt(r.createdAt)}</td>
                            <td>
                              <div style={{display:'flex',gap:6}}>
                                <button className="btn btn-outline btn-sm" onClick={() => openEdit(r.id)}>Edit</button>
                                <button className="btn btn-accent btn-sm"
                                  onClick={() => window.open(`/print/prescription/${r.id}`, '_blank')}>Print</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* FORM VIEW */}
      {view === 'form' && (
        <>
          {/* Header */}
          <div className="card" style={{marginBottom:16}}>
            <div className="card-body" style={{padding:'16px 20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <h3 style={{fontSize:16,fontWeight:700,color:'#0f2339'}}>
                  {editId ? 'Edit Prescription' : 'New Glass Prescription'}
                </h3>
                <button className="btn btn-outline btn-sm" onClick={() => { setView('list'); loadList() }}>← Back</button>
              </div>
              <div className="form-row form-row-3">
                <div className="form-group">
                  <label className="form-label">Patient *</label>
                  <select className="form-control" value={form.patientId} onChange={f('patientId')}>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.patientCode} — {p.firstName} {p.lastName||''}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Visit</label>
                  <select className="form-control" value={form.visitId} onChange={f('visitId')}>
                    <option value="">Select Visit</option>
                    {visits.map(v => <option key={v.id} value={v.id}>{v.visitCode || v.id} — {fmt(v.visitDate)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Optometrist</label>
                  <select className="form-control" value={form.optometristId} onChange={f('optometristId')}>
                    <option value="">Select Optometrist</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.fullName||u.username}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Purpose</label>
                  <input className="form-control" value={form.purpose} onChange={f('purpose')} placeholder="Distance / Near / Bifocal / Progressive…" />
                </div>
                <div className="form-group">
                  <label className="form-label">Diagnosis</label>
                  <input className="form-control" value={form.diagnosis} onChange={f('diagnosis')} placeholder="Myopia / Hyperopia / Astigmatism…" />
                </div>
              </div>
            </div>
          </div>

          {/* Rx Table */}
          <div className="card" style={{marginBottom:16}}>
            <div className="card-header">
              <span className="card-title" style={{fontSize:15}}>
                <span style={{fontSize:22,fontWeight:700,color:'#1a3a5c',marginRight:6}}>℞</span>
                Glass Prescription
              </span>
            </div>
            <div className="card-body">
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:520}}>
                  <thead>
                    <tr>
                      <th style={{...examRowStyle,width:60,background:'#1a3a5c'}}>Eye</th>
                      <th style={examRowStyle}>SPH</th><th style={examRowStyle}>CYL</th>
                      <th style={examRowStyle}>AXIS</th><th style={examRowStyle}>PRISM</th>
                      <th style={examRowStyle}>BCVA</th><th style={examRowStyle}>ADD</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{background:'#dce8f5',fontWeight:700,color:'#1a3a5c',textAlign:'center',padding:8,border:'1px solid #e8eff6'}}>OD</td>
                      {['sphOd','cylOd','axisOd','prismOd','bcvaOd','addOd'].map(k => (
                        <td key={k} style={{border:'1px solid #e8eff6',padding:4}}>
                          <input className="form-control" style={{margin:0}} value={form[k]} onChange={f(k)} placeholder="+0.00" />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{background:'#dceef5',fontWeight:700,color:'#0096b4',textAlign:'center',padding:8,border:'1px solid #e8eff6'}}>OS</td>
                      {['sphOs','cylOs','axisOs','prismOs','bcvaOs','addOs'].map(k => (
                        <td key={k} style={{border:'1px solid #e8eff6',padding:4}}>
                          <input className="form-control" style={{margin:0}} value={form[k]} onChange={f(k)} placeholder="+0.00" />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* IPD */}
          <div className="card" style={{marginBottom:16}}>
            <div className="card-header"><span className="card-title">Interpupillary Distance (IPD)</span></div>
            <div className="card-body">
              <div className="form-row form-row-2">
                <div>
                  <label className="form-label" style={{marginBottom:10}}>Distance PD (DPD) — mm</label>
                  <div className="form-row form-row-3">
                    {[['Right Eye','dpdRe'],['Left Eye','dpdLe'],['Both','dpdBoth']].map(([label,k]) => (
                      <div className="form-group" key={k}>
                        <label className="form-label" style={{fontSize:10}}>{label}</label>
                        <input className="form-control" value={form[k]} onChange={f(k)} placeholder="mm" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{marginBottom:10}}>Near PD (NPD) — mm</label>
                  <div className="form-row form-row-3">
                    {[['Right Eye','npdRe'],['Left Eye','npdLe'],['Both','npdBoth']].map(([label,k]) => (
                      <div className="form-group" key={k}>
                        <label className="form-label" style={{fontSize:10}}>{label}</label>
                        <input className="form-control" value={form[k]} onChange={f(k)} placeholder="mm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginTop:4}}>
            <button className="btn btn-outline" onClick={() => { setView('list'); loadList() }}>Cancel</button>
            <button className="btn btn-primary" disabled={saving} onClick={save}>
              {saving ? <><span className="spinner"></span> Saving…</> : <>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
                Save Prescription
              </>}
            </button>
            {editId && (
              <button className="btn btn-accent"
                onClick={() => window.open(`/print/prescription/${editId}`, '_blank')}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                Print Prescription
              </button>
            )}
          </div>
        </>
      )}
    </>
  )
}
