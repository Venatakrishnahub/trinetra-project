import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { patientAPI } from '../api/services'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—'

const EMPTY = {
  firstName:'', lastName:'', dob:'', age:'', gender:'',
  mobile:'', email:'', address:'', occupation:'', hobbies:''
}

export default function Patients() {
  const toast   = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [patients,    setPatients]    = useState([])
  const [total,       setTotal]       = useState(0)
  const [page,        setPage]        = useState(0)
  const [totalPages,  setTotalPages]  = useState(0)
  const [loading,     setLoading]     = useState(false)

  // Filters
  const [search,  setSearch]  = useState('')
  const [gender,  setGender]  = useState('')
  const [fromDate,setFrom]    = useState('')
  const [toDate,  setTo]      = useState('')
  const searchTimer = useRef(null)

  // Modal state
  const [showModal,  setShowModal]  = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editId,     setEditId]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async (pg = 0) => {
    setLoading(true)
    try {
      const res = await patientAPI.getAll({
        page: pg, size: 15, sortBy:'id', sortDir:'desc',
        search: search || undefined,
        gender: gender || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      })
      setPatients(res.data?.data || [])
      setTotal(res.data?.totalRecords || 0)
      setTotalPages(res.data?.totalPages || 0)
      setPage(pg)
    } catch { toast('Failed to load patients', 'error') }
    finally { setLoading(false) }
  }, [search, gender, fromDate, toDate])

  useEffect(() => { load(0) }, [gender, fromDate, toDate])

  // Handle ?id= URL param to open edit modal
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) openEdit(Number(id))
  }, [])

  const handleSearch = (val) => {
    setSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => load(0), 400)
  }

  const f = (k) => (e) => {
    const val = e.target.value
    setForm(prev => ({ ...prev, [k]: val }))
    if (k === 'dob' && val) {
      const age = Math.floor((new Date() - new Date(val)) / (365.25 * 24 * 3600 * 1000))
      setForm(prev => ({ ...prev, dob: val, age: String(age) }))
    }
  }

  const openAdd = () => { setEditId(null); setForm(EMPTY); setShowModal(true) }

  const openEdit = async (id) => {
    try {
      const res = await patientAPI.getById(id)
      const p = res.data?.data || res.data
      setForm({
        firstName: p.firstName || '', lastName: p.lastName || '',
        dob: p.dob || '', age: String(p.age || ''), gender: p.gender || '',
        mobile: p.mobile || '', email: p.email || '', address: p.address || '',
        occupation: p.occupation || '', hobbies: p.hobbies || '',
        patientCode: p.patientCode || '',
      })
      setEditId(id)
      setShowModal(true)
    } catch { toast('Failed to load patient', 'error') }
  }

  const save = async () => {
    if (!form.firstName.trim()) { toast('First name is required', 'warning'); return }
    setSaving(true)
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim() || null,
      dob: form.dob || null,
      age: form.age ? parseInt(form.age) : null,
      gender: form.gender || null,
      mobile: form.mobile.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      occupation: form.occupation.trim() || null,
      hobbies: form.hobbies.trim() || null,
    }
    try {
      if (editId) {
        await patientAPI.update(editId, payload)
        toast('Patient updated successfully')
      } else {
        await patientAPI.create(payload)
        toast('Patient created successfully')
      }
      setShowModal(false)
      load(page)
    } catch (e) {
      toast(e.response?.data?.message || 'Save failed', 'error')
    } finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await patientAPI.remove(deleteTarget.id)
      toast('Patient deleted')
      setShowDelete(false)
      load(page)
    } catch { toast('Delete failed', 'error') }
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="card" style={{marginBottom:18}}>
        <div className="card-body" style={{padding:'14px 20px'}}>
          <div style={{display:'flex',gap:12,alignItems:'flex-end',flexWrap:'wrap'}}>
            <div className="form-group" style={{margin:0,flex:2,minWidth:180}}>
              <label className="form-label">Search</label>
              <input className="form-control" value={search} onChange={e => handleSearch(e.target.value)}
                placeholder="Name, mobile, code, email…" />
            </div>
            <div className="form-group" style={{margin:0,minWidth:120}}>
              <label className="form-label">Gender</label>
              <select className="form-control" value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group" style={{margin:0,minWidth:140}}>
              <label className="form-label">DOB From</label>
              <input type="date" className="form-control" value={fromDate} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="form-group" style={{margin:0,minWidth:140}}>
              <label className="form-label">DOB To</label>
              <input type="date" className="form-control" value={toDate} onChange={e => setTo(e.target.value)} />
            </div>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setGender(''); setFrom(''); setTo(''); setTimeout(() => load(0), 0) }}>Clear</button>
            <button className="btn btn-primary" onClick={openAdd}>+ Add Patient</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Patient Records</span>
          <span style={{fontSize:12,color:'#8aa0b8'}}>{total} patients</span>
        </div>
        <div style={{padding:0}}>
          {loading
            ? <div style={{textAlign:'center',padding:40}}><span className="spinner spinner-lg"></span></div>
            : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Code</th><th>Full Name</th><th>Age / Gender</th>
                    <th>DOB</th><th>Mobile</th><th>Email</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0
                    ? <tr><td colSpan="7" className="empty">No patients found</td></tr>
                    : patients.map(p => (
                      <tr key={p.id}>
                        <td><span className="badge badge-primary" style={{fontSize:10.5}}>{p.patientCode}</span></td>
                        <td><strong>{p.firstName} {p.lastName || ''}</strong></td>
                        <td>{p.age || '—'} / {p.gender || '—'}</td>
                        <td>{fmt(p.dob)}</td>
                        <td>{p.mobile || '—'}</td>
                        <td style={{color:'#4a6080',fontSize:12}}>{p.email || '—'}</td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-outline btn-sm" onClick={() => openEdit(p.id)} title="Edit">
                              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            </button>
                            <button className="btn btn-danger btn-sm" title="Delete"
                              onClick={() => { setDeleteTarget(p); setShowDelete(true) }}>
                              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            </button>
                            <button className="btn btn-accent btn-sm" onClick={() => navigate(`/visits?patientId=${p.id}`)}>Visit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{padding:'10px 16px'}}>
            <Pagination current={page} total={totalPages} onChange={pg => load(pg)} />
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editId ? 'Edit Patient' : 'Add New Patient'}
        size="modal-lg"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={saving} onClick={save}>
              {saving ? <span className="spinner"></span> : editId ? 'Update Patient' : 'Save Patient'}
            </button>
          </>
        }
      >
        {editId && form.patientCode && (
          <div className="form-row form-row-2" style={{marginBottom:16}}>
            <div className="form-group" style={{margin:0}}>
              <label className="form-label">Patient Code</label>
              <input className="form-control auto-gen" value={form.patientCode} readOnly />
            </div>
            <div></div>
          </div>
        )}
        <div className="form-row form-row-2">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input className="form-control" value={form.firstName} onChange={f('firstName')} placeholder="Enter first name" />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input className="form-control" value={form.lastName} onChange={f('lastName')} placeholder="Enter last name" />
          </div>
        </div>
        <div className="form-row form-row-3">
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input type="date" className="form-control" value={form.dob} onChange={f('dob')} />
          </div>
          <div className="form-group">
            <label className="form-label">Age</label>
            <input type="number" className="form-control" value={form.age} onChange={f('age')} placeholder="Years" min="0" max="150" />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-control" value={form.gender} onChange={f('gender')}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="form-row form-row-2">
          <div className="form-group">
            <label className="form-label">Mobile</label>
            <input className="form-control" value={form.mobile} onChange={f('mobile')} placeholder="10-digit mobile" maxLength="15" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={form.email} onChange={f('email')} placeholder="patient@email.com" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea className="form-control" value={form.address} onChange={f('address')} rows="2" placeholder="Full address" />
        </div>
        <div className="form-row form-row-2">
          <div className="form-group">
            <label className="form-label">Occupation</label>
            <input className="form-control" value={form.occupation} onChange={f('occupation')} placeholder="Occupation" />
          </div>
          <div className="form-group">
            <label className="form-label">Hobbies</label>
            <input className="form-control" value={form.hobbies} onChange={f('hobbies')} placeholder="Hobbies" />
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)}
        title="Confirm Delete"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowDelete(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete Patient</button>
          </>
        }
      >
        <p style={{color:'#4a6080',fontSize:14,lineHeight:1.7}}>
          Are you sure you want to delete patient{' '}
          <strong style={{color:'#0f2339'}}>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </>
  )
}
