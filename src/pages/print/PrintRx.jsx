import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { prescriptionAPI, patientAPI } from '../../api/services'

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—'
const dash = (v) => (v !== null && v !== undefined && v !== '') ? String(v) : '—'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Outfit', sans-serif; background: #f0f4f8; }
  .page { width: 210mm; min-height: 210mm; margin: 0 auto; background: white; padding: 14mm 18mm; }
  .toolbar { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; background: #1a3a5c; position: sticky; top: 0; z-index: 10; }
  .toolbar button { padding: 8px 18px; border-radius: 6px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; }
  .btn-print { background: #00b4d8; color: white; }
  .btn-close  { background: rgba(255,255,255,0.15); color: white; }
  @media print { .toolbar { display: none; } .page { margin: 0; padding: 10mm 14mm; } }
`

export default function PrintRx() {
  const { rxId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (rxId) load() }, [rxId])

  async function load() {
    try {
      const res = await prescriptionAPI.getById(rxId)
      const r = res.data?.data || res.data
      let p = null
      if (r.patientId) {
        const pr = await patientAPI.getById(r.patientId)
        p = pr.data?.data || pr.data
      }
      setData({ rx: r, patient: p })
    } catch {}
    setLoading(false)
  }

  if (loading) return <div style={{textAlign:'center',padding:40,fontFamily:'Outfit,sans-serif'}}>Loading…</div>
  if (!data) return <div style={{padding:40}}>Prescription not found.</div>

  const { rx, patient: p } = data
  const details = rx.details || []
  const ipd     = rx.interpupillaryDistance || {}
  const od = details.find(d => d.eye === 'OD') || {}
  const os = details.find(d => d.eye === 'OS') || {}

  const ThStyle = { background:'#1a3a5c', color:'white', padding:'7px 10px', fontSize:10, textAlign:'center', border:'1px solid #1a3a5c', letterSpacing:'0.5px', fontWeight:700 }
  const TdStyle = { border:'1px solid #c8d8e8', padding:'8px 10px', textAlign:'center', fontSize:12, fontWeight:500 }

  return (
    <>
      <style>{styles}</style>
      <div className="toolbar">
        <button className="btn-close" onClick={() => window.close()}>✕ Close</button>
        <button className="btn-print" onClick={() => window.print()}>🖨 Print</button>
      </div>
      <div className="page">

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',borderBottom:'2.5px solid #1a3a5c',paddingBottom:12,marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:54,height:54,border:'2.5px solid #1a3a5c',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg viewBox="0 0 24 24" fill="#1a3a5c" style={{width:32,height:32}}>
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </div>
            <div>
              <div style={{fontSize:17,fontWeight:700,color:'#1a3a5c'}}>Trinetra Vision Care &amp; Optical</div>
              <div style={{fontSize:9,color:'#4a6080',marginTop:2}}>Committed to Enhancing Quality of Life</div>
            </div>
          </div>
          <div style={{textAlign:'right',fontSize:9.5,color:'#4a6080',lineHeight:1.8}}>
            <div style={{fontWeight:700,color:'#1a3a5c',fontSize:11}}>Date: {fmt(rx.createdAt)}</div>
            <div>Patient ID: <strong>{p?.patientCode || '—'}</strong></div>
            {rx.visitCode && <div>Visit: {rx.visitCode}</div>}
          </div>
        </div>

        {/* Doc Title */}
        <div style={{textAlign:'center',fontSize:13,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',color:'#1a3a5c',border:'1.5px solid #1a3a5c',padding:'6px 20px',margin:'0 0 14px',background:'#f0f4f8',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
          <span style={{fontSize:22,fontWeight:700}}>℞</span> Glass Prescription
        </div>

        {/* Patient Info */}
        <div style={{border:'1px solid #c8d8e8',borderRadius:4,overflow:'hidden',marginBottom:16}}>
          {[
            [['Patient Name', `${p?.firstName||''} ${p?.lastName||''}`], ['Age / Gender', `${p?.age||'—'} yrs / ${p?.gender||'—'}`]],
            [['Mobile', p?.mobile], ['Optometrist', rx.optometristName]],
          ].map((row, ri) => (
            <div key={ri} style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:ri<1?'1px solid #e0eaf4':'none'}}>
              {row.map(([label, val]) => (
                <div key={label} style={{display:'flex',borderRight:'1px solid #e0eaf4'}}>
                  <div style={{background:'#f5f8fc',padding:'6px 8px',fontSize:9.5,fontWeight:700,color:'#4a6080',minWidth:90,display:'flex',alignItems:'center',borderRight:'1px solid #e0eaf4',textTransform:'uppercase',letterSpacing:'0.3px'}}>{label}</div>
                  <div style={{padding:'6px 10px',fontSize:12,fontWeight:500,flex:1}}>{dash(val)}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Rx Table */}
        <div style={{border:'1px solid #c8d8e8',borderRadius:4,overflow:'hidden',marginBottom:14}}>
          <div style={{background:'#1a3a5c',color:'white',padding:'5px 10px',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>
            Spectacle Prescription
          </div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>
                <th style={{...ThStyle,width:60}}>Eye</th>
                <th style={ThStyle}>SPH</th><th style={ThStyle}>CYL</th>
                <th style={ThStyle}>AXIS</th><th style={ThStyle}>PRISM</th>
                <th style={ThStyle}>BCVA</th><th style={ThStyle}>ADD</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{...TdStyle,background:'#dce8f5',fontWeight:700,color:'#1a3a5c'}}>OD</td>
                {[od.sph, od.cyl, od.axis, od.prsm, od.bcva, od.addValue].map((v,i) => <td key={i} style={TdStyle}>{dash(v)}</td>)}
              </tr>
              <tr>
                <td style={{...TdStyle,background:'#dceef5',fontWeight:700,color:'#0096b4'}}>OS</td>
                {[os.sph, os.cyl, os.axis, os.prsm, os.bcva, os.addValue].map((v,i) => <td key={i} style={TdStyle}>{dash(v)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>

        {/* IPD */}
        <div style={{border:'1px solid #c8d8e8',borderRadius:4,padding:'10px 14px',marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:'#1a3a5c',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.5px'}}>Interpupillary Distance (IPD)</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            {[
              ['Distance PD (DPD)', [['RE',ipd.dpdRe],['LE',ipd.dpdLe],['Both',ipd.dpdBoth]]],
              ['Near PD (NPD)',     [['RE',ipd.npdRe],['LE',ipd.npdLe],['Both',ipd.npdBoth]]],
            ].map(([title, cells]) => (
              <div key={title}>
                <div style={{fontSize:10,fontWeight:700,color:'#4a6080',marginBottom:8,textTransform:'uppercase'}}>{title}</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {cells.map(([label, val]) => (
                    <div key={label} style={{textAlign:'center'}}>
                      <div style={{fontSize:9,color:'#4a6080',textTransform:'uppercase'}}>{label}</div>
                      <div style={{fontSize:15,fontWeight:700,color:'#1a3a5c'}}>{val ? `${val} mm` : '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnosis + Purpose */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          {[['Diagnosis', rx.diagnosis], ['Purpose / Advice', rx.purpose]].map(([label, val]) => (
            <div key={label}>
              <div style={{fontSize:10,fontWeight:700,color:'#4a6080',textTransform:'uppercase',marginBottom:4}}>{label}</div>
              <div style={{border:'1px solid #c8d8e8',borderRadius:4,padding:'8px 10px',minHeight:36,fontSize:11.5,fontWeight:500}}>{dash(val)}</div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div style={{border:'1px solid #c8d8e8',borderRadius:4,padding:'7px 12px',marginBottom:18,fontSize:10.5,color:'#4a6080'}}>
          <strong style={{color:'#1a3a5c'}}>Instructions:</strong> Please follow the prescribed power and consult us if vision does not improve within 2 weeks.
        </div>

        {/* Signature */}
        <div style={{display:'flex',justifyContent:'space-between',marginTop:10}}>
          <div style={{textAlign:'center'}}>
            <div style={{width:160,borderTop:'1px solid #1a3a5c',margin:'0 auto 4px'}}></div>
            <div style={{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.5px'}}>Patient Signature</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:12,fontWeight:700,color:'#1a3a5c',marginBottom:4}}>{rx.optometristName || 'Optometrist'}</div>
            <div style={{width:160,borderTop:'1px solid #1a3a5c',margin:'0 auto 4px'}}></div>
            <div style={{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.5px'}}>Optometrist Signature &amp; Stamp</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign:'center',marginTop:18,paddingTop:10,borderTop:'1px dashed #c8d8e8',fontSize:9,color:'#8aa0b8'}}>
          Trinetra Vision Care &amp; Optical — Prescription valid for 1 year from date of issue
        </div>
      </div>
    </>
  )
}
