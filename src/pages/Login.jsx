import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api/services'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }               = useAuth()
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter email and password.'); return }
    setError(''); setLoading(true)
    try {
      const res = await authAPI.login(email, password)
      const token = res.data?.token || res.data
      login(token, { username: email.split('@')[0], role: 'Staff', email })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Left panel */}
        <div style={styles.left}>
          <div style={styles.leftInner}>
            <div style={styles.eyeBox}>
              <svg viewBox="0 0 24 24" fill="#00b4d8" style={{width:38,height:38}}>
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </div>
            <div style={styles.brandTitle}>Trinetra Vision Care<br/>&amp; Optical</div>
            <div style={styles.brandSub}>Comprehensive Eye Care Management</div>

            <div style={{marginTop:40}}>
              {['Patient Management','Clinical Examinations','Digital Prescriptions'].map(f => (
                <div key={f} style={styles.feature}>
                  <div style={styles.featureDot}></div>
                  <div style={styles.featureText}>{f}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.25)'}}>© 2026 Trinetra Vision Care</div>
        </div>

        {/* Right panel */}
        <div style={styles.right}>
          <div style={{marginBottom:32}}>
            <h2 style={{fontSize:24,fontWeight:700,color:'#0f2339',marginBottom:6}}>Welcome back 👋</h2>
            <p style={{color:'#8aa0b8',fontSize:13.5}}>Sign in to your account to continue</p>
          </div>

          {error && (
            <div style={styles.errBox}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{position:'relative'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#8aa0b8" strokeWidth="2" style={styles.inputIcon}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@clinic.com"
                  style={styles.inputField}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{position:'relative'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#8aa0b8" strokeWidth="2" style={styles.inputIcon}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={styles.inputField}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.loginBtn}>
              {loading ? <span className="spinner" style={{borderTopColor:'white',borderColor:'rgba(255,255,255,0.3)',width:18,height:18}}></span> : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0f4f8 0%, #e8eef6 100%)',
    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(37,99,168,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,180,216,0.06) 0%, transparent 40%)',
    padding: 20,
  },
  card: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    width: 900, minHeight: 560, borderRadius: 20,
    overflow: 'hidden', boxShadow: '0 20px 60px rgba(15,35,57,0.18)',
  },
  left: {
    background: 'linear-gradient(145deg, #0f2339 0%, #1a3a5c 55%, #0d4a8a 100%)',
    padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    position: 'relative', overflow: 'hidden',
  },
  leftInner: { position: 'relative', zIndex: 1 },
  eyeBox: {
    width: 64, height: 64,
    background: 'rgba(0,180,216,0.15)', border: '2px solid rgba(0,180,216,0.4)',
    borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  brandTitle: { fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: 6 },
  brandSub:   { fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' },
  feature:    { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
  featureDot: { width: 8, height: 8, background: '#00b4d8', borderRadius: '50%', flexShrink: 0 },
  featureText:{ fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  right: { background: 'white', padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  errBox: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16,
  },
  inputIcon:  { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18 },
  inputField: {
    width: '100%', padding: '11px 12px 11px 42px',
    border: '1.5px solid #d1dce8', borderRadius: 8, fontSize: 14,
    fontFamily: "'Outfit', sans-serif", outline: 'none', color: '#0f2339',
    transition: 'border-color 0.2s',
  },
  loginBtn: {
    width: '100%', padding: 12, marginTop: 8,
    background: 'linear-gradient(135deg, #2563a8, #1a3a5c)',
    color: 'white', border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
}
