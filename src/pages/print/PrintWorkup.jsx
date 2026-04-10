import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { visitAPI, patientAPI, visualAcuityAPI, retinoscopyAPI, subjectiveAPI, slitLampAPI, diagnosisAPI } from '../../api/services'

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—'
const dash = (v) => v || '—'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Outfit', sans-serif; background: #f0f4f8; }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; padding: 14mm 18mm; }
  .toolbar { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; background: #1a3a5c; position: sticky; top: 0; z-index: 10; }
  .toolbar button { padding: 8px 18px; border-radius: 6px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; display: flex; align-items: center; gap: 6px; }
  .btn-print { background: #00b4d8; color: white; }
  .btn-close  { background: rgba(255,255,255,0.15); color: white; }
  @media print { .toolbar { display: none; } .page { margin: 0; padding: 10mm 14mm; } }
`

export default function PrintWorkup() {
  const { visitId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (visitId) loadAll() }, [visitId])

  async function loadAll() {
    const d = {}
    try { const r = await visitAPI.getById(visitId); d.visit = r.data?.data || r.data } catch {}
    try { if (d.visit?.patientId) { const r = await patientAPI.getById(d.visit.patientId); d.patient = r.data?.data || r.data } } catch {}
    try { const r = await visualAcuityAPI.getByVisit(visitId); d.va = r.data?.data || r.data } catch {}
    try { const r = await retinoscopyAPI.getByVisit(visitId); d.rt = r.data?.data || r.data } catch {}
    try { const r = await subjectiveAPI.getByVisit(visitId); d.sr = r.data?.data || r.data } catch {}
    try { const r = await slitLampAPI.getByVisit(visitId); d.sl = r.data?.data || r.data } catch {}
    try { const r = await diagnosisAPI.getByVisit(visitId); d.dg = r.data?.data || r.data } catch {}
    setData(d)
    setLoading(false)
  }

  if (loading) return <div style={{textAlign:'center',padding:40,fontFamily:'Outfit,sans-serif'}}>Loading…</div>
  if (!data) return <div style={{padding:40}}>Visit not found.</div>

  const { visit:v, patient:p, va, rt, sr, sl, dg } = data

  const HeaderTH  = ({children, bg='#e8f0f8'}) => <th style={{background:bg,color:bg==='#1a3a5c'?'white':'#1a3a5c',fontSize:9.5,fontWeight:700,padding:'5px 8px',textAlign:'center',border:'1px solid #c8d8e8',textTransform:'uppercase',letterSpacing:'0.3px'}}>{children}</th>
  const ClinTD    = ({children}) => <td style={{border:'1px solid #c8d8e8',padding:'5px 8px',textAlign:'center',fontSize:10.5}}>{children}</td>
  const RowHdr    = ({children}) => <td style={{border:'1px solid #c8d8e8',background:'#f5f8fc',fontWeight:700,color:'#1a3a5c',padding:'5px 10px',fontSize:9.5,textTransform:'uppercase',letterSpacing:'0.3px',whiteSpace:'nowrap'}}>{children}</td>
  const Section   = ({title, children}) => (
    <div style={{border:'1px solid #c8d8e8',borderRadius:4,overflow:'hidden',marginBottom:12}}>
      <div style={{background:'#1a3a5c',color:'white',padding:'5px 10px',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>{title}</div>
      {children}
    </div>
  )

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
            <div style={{width:54,height:54,border:'2.5px solid #1a3a5c',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg viewBox="0 0 24 24" fill="#1a3a5c" style={{width:32,height:32}}>
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </div>
            <div>
              <div style={{fontSize:17,fontWeight:700,color:'#1a3a5c',lineHeight:1.2}}>Trinetra Vision Care &amp; Optical</div>
              <div style={{fontSize:9,color:'#4a6080',marginTop:2}}>Committed to Enhancing Quality of Life</div>
            </div>
          </div>
          <div style={{textAlign:'right',fontSize:9.5,color:'#4a6080',lineHeight:1.8}}>
            <div style={{fontWeight:700,color:'#1a3a5c',fontSize:11}}>Date: {fmt(v?.visitDate)}</div>
            <div>Patient ID: <strong>{p?.patientCode || '—'}</strong></div>
            <div>Visit: {v?.visitCode || visitId}</div>
          </div>
        </div>

        {/* Doc Title */}
        <div style={{textAlign:'center',fontSize:13,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',color:'#1a3a5c',border:'1.5px solid #1a3a5c',padding:'6px 20px',margin:'0 0 12px',background:'#f0f4f8'}}>
          Clinical Examination Workup Sheet
        </div>

        {/* Patient Info */}
        <div style={{border:'1px solid #c8d8e8',borderRadius:4,overflow:'hidden',marginBottom:12}}>
          {[
            [['Name', `${p?.firstName||''} ${p?.lastName||''}`], ['Contact', p?.mobile]],
            [['Date of Birth', fmt(p?.dob)], ['Age / Gender', `${p?.age||'—'} / ${p?.gender||'—'}`]],
            [['Address', p?.address], ['Occupation', p?.occupation]],
          ].map((row, ri) => (
            <div key={ri} style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom: ri<2 ? '1px solid #e0eaf4':'none'}}>
              {row.map(([label, val]) => (
                <div key={label} style={{display:'flex',borderRight:'1px solid #e0eaf4'}}>
                  <div style={{background:'#f5f8fc',padding:'5px 8px',fontSize:9.5,fontWeight:700,color:'#4a6080',minWidth:90,display:'flex',alignItems:'center',borderRight:'1px solid #e0eaf4',textTransform:'uppercase',letterSpacing:'0.3px'}}>{label}</div>
                  <div style={{padding:'5px 10px',fontSize:11,fontWeight:500,flex:1}}>{dash(val)}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* History */}
        <Section title="Medical History">
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            {[
              ['Chief Complaint',       v?.chiefComplaint],
              ['History of Present Illness', v?.historyPresentIllness],
              ['History of Past Illness',    v?.historyPastIllness],
              ['Family History',        v?.familyHistory],
              ['Allergies',             v?.allergies],
              ['Current Medication',    v?.currentMedication],
              ['Personal / Nutritional',v?.personalBioticHistory],
              ['Systemic Examination',  v?.systemicExamination],
              ['IOP', `OD: ${dash(v?.iopOd)} mmHg     OS: ${dash(v?.iopOs)} mmHg`],
            ].map(([label, val]) => (
              <tr key={label} style={{borderBottom:'1px solid #e8f0f8'}}>
                <td style={{background:'#f5f8fc',padding:'5px 10px',fontSize:9.5,fontWeight:700,color:'#4a6080',width:160,textTransform:'uppercase',letterSpacing:'0.3px',verticalAlign:'top',borderRight:'1px solid #e0eaf4'}}>{label}</td>
                <td style={{padding:'5px 10px',fontSize:11,minHeight:22}}>{dash(val)}</td>
              </tr>
            ))}
          </table>
        </Section>

        {/* Visual Acuity */}
        <Section title="Visual Acuity">
          <div style={{padding:8}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  <HeaderTH>—</HeaderTH>
                  <HeaderTH bg="#1a3a5c">OD Distance</HeaderTH><HeaderTH bg="#1a3a5c">OD Near</HeaderTH>
                  <HeaderTH bg="#0096b4">OS Distance</HeaderTH><HeaderTH bg="#0096b4">OS Near</HeaderTH>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <RowHdr>Unaided</RowHdr>
                  <ClinTD>{dash(va?.unaidedDistanceOd)}</ClinTD><ClinTD>{dash(va?.unaidedNearOd)}</ClinTD>
                  <ClinTD>{dash(va?.unaidedDistanceOs)}</ClinTD><ClinTD>{dash(va?.unaidedNearOs)}</ClinTD>
                </tr>
                <tr>
                  <RowHdr>Aided (Glasses)</RowHdr>
                  <ClinTD>{dash(va?.aidedDistanceOd)}</ClinTD><ClinTD>{dash(va?.aidedNearOd)}</ClinTD>
                  <ClinTD>{dash(va?.aidedDistanceOs)}</ClinTD><ClinTD>{dash(va?.aidedNearOs)}</ClinTD>
                </tr>
              </tbody>
            </table>
            <div style={{marginTop:6,fontSize:10.5}}>
              <strong>PH:</strong> {dash(va?.ph)} &nbsp;&nbsp; <strong>Remarks:</strong> {dash(va?.remarks)}
            </div>
          </div>
        </Section>

        {/* Retinoscopy + Subjective side-by-side */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
          <Section title="Retinoscopy">
            <div style={{padding:8}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><HeaderTH>—</HeaderTH><HeaderTH>SPH</HeaderTH><HeaderTH>CYL</HeaderTH><HeaderTH>AXIS</HeaderTH><HeaderTH>Reflex</HeaderTH></tr></thead>
                <tbody>
                  <tr>
                    <td style={{background:'#dce8f5',fontWeight:700,color:'#1a3a5c',padding:'5px 8px',fontSize:9.5,border:'1px solid #c8d8e8'}}>OD</td>
                    <ClinTD>{dash(rt?.sphOd)}</ClinTD><ClinTD>{dash(rt?.cylOd)}</ClinTD><ClinTD>{dash(rt?.axisOd)}</ClinTD><ClinTD>{dash(rt?.reflexOd)}</ClinTD>
                  </tr>
                  <tr>
                    <td style={{background:'#dceef5',fontWeight:700,color:'#0096b4',padding:'5px 8px',fontSize:9.5,border:'1px solid #c8d8e8'}}>OS</td>
                    <ClinTD>{dash(rt?.sphOs)}</ClinTD><ClinTD>{dash(rt?.cylOs)}</ClinTD><ClinTD>{dash(rt?.axisOs)}</ClinTD><ClinTD>{dash(rt?.reflexOs)}</ClinTD>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>
          <Section title="Subjective Refraction">
            <div style={{padding:8}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><HeaderTH>—</HeaderTH><HeaderTH>SPH</HeaderTH><HeaderTH>CYL</HeaderTH><HeaderTH>AXIS</HeaderTH><HeaderTH>BCVA</HeaderTH><HeaderTH>ADD</HeaderTH><HeaderTH>NV</HeaderTH></tr></thead>
                <tbody>
                  <tr>
                    <td style={{background:'#dce8f5',fontWeight:700,color:'#1a3a5c',padding:'5px 8px',fontSize:9.5,border:'1px solid #c8d8e8'}}>OD</td>
                    {[sr?.sphOd,sr?.cylOd,sr?.axisOd,sr?.bcvaOd,sr?.addOd,sr?.nvOd].map((v,i) => <ClinTD key={i}>{dash(v)}</ClinTD>)}
                  </tr>
                  <tr>
                    <td style={{background:'#dceef5',fontWeight:700,color:'#0096b4',padding:'5px 8px',fontSize:9.5,border:'1px solid #c8d8e8'}}>OS</td>
                    {[sr?.sphOs,sr?.cylOs,sr?.axisOs,sr?.bcvaOs,sr?.addOs,sr?.nvOs].map((v,i) => <ClinTD key={i}>{dash(v)}</ClinTD>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        {/* Slit Lamp */}
        <Section title="Slit Lamp Examination">
          <div style={{padding:8}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><HeaderTH>Structure</HeaderTH><HeaderTH bg="#1a3a5c">OD (Right Eye)</HeaderTH><HeaderTH bg="#0096b4">OS (Left Eye)</HeaderTH></tr></thead>
              <tbody>
                {[
                  ['Eyelids',sl?.eyelidsOd,sl?.eyelidsOs],
                  ['Conjunctiva',sl?.conjunctivaOd,sl?.conjunctivaOs],
                  ['Sclera',sl?.scleraOd,sl?.scleraOs],
                  ['Cornea',sl?.corneaOd,sl?.corneaOs],
                  ['Anterior Chamber',sl?.anteriorChamberOd,sl?.anteriorChamberOs],
                  ['Iris',sl?.irisOd,sl?.irisOs],
                  ['Pupil',sl?.pupilOd,sl?.pupilOs],
                ].map(([label,od,os]) => (
                  <tr key={label}>
                    <RowHdr>{label}</RowHdr>
                    <ClinTD>{dash(od)}</ClinTD>
                    <ClinTD>{dash(os)}</ClinTD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Diagnosis */}
        <Section title="Diagnosis">
          <div style={{padding:10}}>
            <div style={{fontSize:10,fontWeight:700,color:'#4a6080',marginBottom:4,textTransform:'uppercase'}}>Ametropic Condition</div>
            <div style={{border:'1px solid #c8d8e8',borderRadius:4,padding:8,minHeight:36,fontSize:11.5,fontWeight:600,color:'#1a3a5c',marginBottom:10}}>{dash(dg?.ametropicCondition)}</div>
            <div style={{fontSize:10,fontWeight:700,color:'#4a6080',marginBottom:4,textTransform:'uppercase'}}>Notes / Advice</div>
            <div style={{border:'1px solid #c8d8e8',borderRadius:4,padding:8,minHeight:32,fontSize:11}}>{dash(dg?.notes)}</div>
          </div>
        </Section>

        {/* Signature */}
        <div style={{display:'flex',justifyContent:'space-between',marginTop:22,paddingTop:10}}>
          {['Patient Signature','Optometrist Signature','Date'].map(label => (
            <div key={label} style={{textAlign:'center'}}>
              <div style={{width:140,borderTop:'1px solid #1a3a5c',margin:'0 auto 4px'}}></div>
              <div style={{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.5px'}}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
