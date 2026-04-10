import React, { useState, useEffect } from 'react'
import { userAPI } from '../api/services'
import { useToast } from '../context/ToastContext'

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—'

export default function Users() {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await userAPI.getAll()
      setUsers(res.data?.data || res.data || [])
    } catch { toast('Failed to load users', 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">System Users</span>
        <span style={{fontSize:12,color:'#8aa0b8'}}>{users.length} users</span>
      </div>
      <div style={{padding:0}}>
        {loading
          ? <div style={{textAlign:'center',padding:40}}><span className="spinner spinner-lg"></span></div>
          : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User Code</th><th>Full Name</th><th>Username</th>
                  <th>Email</th><th>Mobile</th><th>Role</th><th>Status</th><th>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0
                  ? <tr><td colSpan="8" className="empty">No users found</td></tr>
                  : users.map(u => (
                    <tr key={u.id}>
                      <td><span className="badge badge-primary" style={{fontSize:10.5}}>{u.userCode}</span></td>
                      <td><strong>{u.fullName}</strong></td>
                      <td style={{color:'#4a6080'}}>{u.username}</td>
                      <td style={{fontSize:12,color:'#4a6080'}}>{u.email}</td>
                      <td>{u.mobile || '—'}</td>
                      <td><span className="badge badge-info">{u.role || '—'}</span></td>
                      <td>
                        <span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                          {u.status || 'Active'}
                        </span>
                      </td>
                      <td style={{fontSize:12,color:'#8aa0b8'}}>{fmt(u.createdAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
