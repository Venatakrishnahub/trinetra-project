import React, { useState, useEffect } from 'react'
import { visualAcuityAPI, retinoscopyAPI, subjectiveAPI, slitLampAPI, diagnosisAPI } from '../api/services'
import { useToast } from '../context/ToastContext'

const tabs = [
  { id:'history',    label:'📋 History' },
  { id:'visual',     label:'👁 Visual Acuity' },
  { id:'refraction', label:'🔬 Refraction' },
  { id:'slitlamp',   label:'💡 Slit Lamp' },
  { id:'tests',      label:'🧪 Tests' },
  { id:'diagnosis',  label:'📝 Diagnosis' },
]

const EMPTY = {
  // History
  chiefComplaint:'', historyPresentIllness:'', historyPastIllness:'',
  familyHistory:'', allergies:'', currentMedication:'',
  personalBioticHistory:'', systemicExamination:'', iopOd:'', iopOs:'',
  // Visual Acuity
  vaUnaDistOd:'', vaUnaNearOd:'', vaUnaDistOs:'', vaUnaNearOs:'',
  vaAidDistOd:'', vaAidNearOd:'', vaAidDistOs:'', vaAidNearOs:'',
  vaPH:'', vaRemarks:'',
  // Retinoscopy
  rtSphOd:'', rtCylOd:'', rtAxisOd:'', rtReflexOd:'',
  rtSphOs:'', rtCylOs:'', rtAxisOs:'', rtReflexOs:'',
  // Subjective
  srSphOd:'', srCylOd:'', srAxisOd:'', srBcvaOd:'', srAddOd:'', srNvOd:'',
  srSphOs:'', srCylOs:'', srAxisOs:'', srBcvaOs:'', srAddOs:'', srNvOs:'',
  srDuochrome:'', srBinocular:'',
  // Slit lamp
  slEyelidsOd:'', slConjOd:'', slScleraOd:'', slCorneaOd:'', slAcOd:'', slIrisOd:'', slPupilOd:'',
  slEyelidsOs:'', slConjOs:'', slScleraOs:'', slCorneaOs:'', slAcOs:'', slIrisOs:'', slPupilOs:'',
  // Tests
  tCoverDist:'', tCoverNear:'', tHirschberg:'', tNpa:'', tNpc:'', tEom:'', tStereopsis:'', tColorVision:'',
  tSch1Od:'', tSch1Os:'', tSch2Od:'', tSch2Os:'', tTbutOd:'', tTbutOs:'',
  // Diagnosis
  diagCondition:'', diagNotes:'',
}

export default function ExamForm({ visitId, initialVisitData, onSaveExam }) {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('history')
  const [d, setD] = useState(EMPTY)

  // Populate fields from visit data
  useEffect(() => {
    if (initialVisitData) {
      setD(prev => ({
        ...prev,
        chiefComplaint: initialVisitData.chiefComplaint || '',
        historyPresentIllness: initialVisitData.historyPresentIllness || '',
        historyPastIllness: initialVisitData.historyPastIllness || '',
        familyHistory: initialVisitData.familyHistory || '',
        allergies: initialVisitData.allergies || '',
        currentMedication: initialVisitData.currentMedication || '',
        personalBioticHistory: initialVisitData.personalBioticHistory || '',
        systemicExamination: initialVisitData.systemicExamination || '',
        iopOd: initialVisitData.iopOd || '',
        iopOs: initialVisitData.iopOs || '',
      }))
    }
  }, [initialVisitData])

  // Load existing exam data if editing
  useEffect(() => {
    if (!visitId) return
    loadExamData()
  }, [visitId])

  async function loadExamData() {
    try {
      const va = await visualAcuityAPI.getByVisit(visitId)
      const v = va.data?.data || va.data || {}
      setD(prev => ({...prev,
        vaUnaDistOd: v.unaidedDistanceOd||'', vaUnaNearOd: v.unaidedNearOd||'',
        vaUnaDistOs: v.unaidedDistanceOs||'', vaUnaNearOs: v.unaidedNearOs||'',
        vaAidDistOd: v.aidedDistanceOd||'', vaAidNearOd: v.aidedNearOd||'',
        vaAidDistOs: v.aidedDistanceOs||'', vaAidNearOs: v.aidedNearOs||'',
        vaPH: v.ph||'', vaRemarks: v.remarks||'',
      }))
    } catch {}
    try {
      const rt = await retinoscopyAPI.getByVisit(visitId)
      const v = rt.data?.data || rt.data || {}
      setD(prev => ({...prev,
        rtSphOd:v.sphOd||'', rtCylOd:v.cylOd||'', rtAxisOd:v.axisOd||'', rtReflexOd:v.reflexOd||'',
        rtSphOs:v.sphOs||'', rtCylOs:v.cylOs||'', rtAxisOs:v.axisOs||'', rtReflexOs:v.reflexOs||'',
      }))
    } catch {}
    try {
      const sr = await subjectiveAPI.getByVisit(visitId)
      const v = sr.data?.data || sr.data || {}
      setD(prev => ({...prev,
        srSphOd:v.sphOd||'', srCylOd:v.cylOd||'', srAxisOd:v.axisOd||'',
        srBcvaOd:v.bcvaOd||'', srAddOd:v.addOd||'', srNvOd:v.nvOd||'',
        srSphOs:v.sphOs||'', srCylOs:v.cylOs||'', srAxisOs:v.axisOs||'',
        srBcvaOs:v.bcvaOs||'', srAddOs:v.addOs||'', srNvOs:v.nvOs||'',
        srDuochrome:v.duchromeBalance||'', srBinocular:v.binocularBalance||'',
      }))
    } catch {}
    try {
      const sl = await slitLampAPI.getByVisit(visitId)
      const v = sl.data?.data || sl.data || {}
      setD(prev => ({...prev,
        slEyelidsOd:v.eyelidsOd||'', slConjOd:v.conjunctivaOd||'',
        slScleraOd:v.scleraOd||'', slCorneaOd:v.corneaOd||'',
        slAcOd:v.anteriorChamberOd||'', slIrisOd:v.irisOd||'', slPupilOd:v.pupilOd||'',
        slEyelidsOs:v.eyelidsOs||'', slConjOs:v.conjunctivaOs||'',
        slScleraOs:v.scleraOs||'', slCorneaOs:v.corneaOs||'',
        slAcOs:v.anteriorChamberOs||'', slIrisOs:v.irisOs||'', slPupilOs:v.pupilOs||'',
      }))
    } catch {}
    try {
      const dg = await diagnosisAPI.getByVisit(visitId)
      const v = dg.data?.data || dg.data || {}
      setD(prev => ({...prev, diagCondition:v.ametropicCondition||'', diagNotes:v.notes||''}))
    } catch {}
  }

  const ch = (k) => (e) => setD(prev => ({...prev, [k]: e.target.value}))
  const inp = (id, ph='', cls='') => (
    <input className={`form-control ${cls}`} value={d[id]} onChange={ch(id)} placeholder={ph}
      style={{margin:0}} />
  )

  const getHistoryPayload = () => ({
    chiefComplaint: d.chiefComplaint,
    historyPresentIllness: d.historyPresentIllness,
    historyPastIllness: d.historyPastIllness,
    familyHistory: d.familyHistory,
    allergies: d.allergies,
    currentMedication: d.currentMedication,
    personalBioticHistory: d.personalBioticHistory,
    systemicExamination: d.systemicExamination,
    iopOd: d.iopOd ? parseFloat(d.iopOd) : null,
    iopOs: d.iopOs ? parseFloat(d.iopOs) : null,
  })

  const saveAllExam = async (vid) => {
    const saves = []
    // Visual Acuity
    saves.push(visualAcuityAPI.save({
      visitId: vid,
      unaidedDistanceOd:d.vaUnaDistOd, unaidedNearOd:d.vaUnaNearOd,
      unaidedDistanceOs:d.vaUnaDistOs, unaidedNearOs:d.vaUnaNearOs,
      aidedDistanceOd:d.vaAidDistOd, aidedNearOd:d.vaAidNearOd,
      aidedDistanceOs:d.vaAidDistOs, aidedNearOs:d.vaAidNearOs,
      ph:d.vaPH, remarks:d.vaRemarks,
    }).catch(()=>{}))
    // Retinoscopy
    saves.push(retinoscopyAPI.save({
      visitId: vid,
      sphOd:d.rtSphOd||null, cylOd:d.rtCylOd||null, axisOd:d.rtAxisOd?parseInt(d.rtAxisOd):null, reflexOd:d.rtReflexOd,
      sphOs:d.rtSphOs||null, cylOs:d.rtCylOs||null, axisOs:d.rtAxisOs?parseInt(d.rtAxisOs):null, reflexOs:d.rtReflexOs,
    }).catch(()=>{}))
    // Subjective
    saves.push(subjectiveAPI.save({
      visitId: vid,
      sphOd:d.srSphOd||null, cylOd:d.srCylOd||null, axisOd:d.srAxisOd?parseInt(d.srAxisOd):null,
      bcvaOd:d.srBcvaOd, addOd:d.srAddOd||null, nvOd:d.srNvOd,
      sphOs:d.srSphOs||null, cylOs:d.srCylOs||null, axisOs:d.srAxisOs?parseInt(d.srAxisOs):null,
      bcvaOs:d.srBcvaOs, addOs:d.srAddOs||null, nvOs:d.srNvOs,
      duchromeBalance:d.srDuochrome, binocularBalance:d.srBinocular,
    }).catch(()=>{}))
    // Slit Lamp
    saves.push(slitLampAPI.save({
      visitId: vid,
      eyelidsOd:d.slEyelidsOd, conjunctivaOd:d.slConjOd, scleraOd:d.slScleraOd, corneaOd:d.slCorneaOd,
      anteriorChamberOd:d.slAcOd, irisOd:d.slIrisOd, pupilOd:d.slPupilOd,
      eyelidsOs:d.slEyelidsOs, conjunctivaOs:d.slConjOs, scleraOs:d.slScleraOs, corneaOs:d.slCorneaOs,
      anteriorChamberOs:d.slAcOs, irisOs:d.slIrisOs, pupilOs:d.slPupilOs,
    }).catch(()=>{}))
    // Diagnosis
    if (d.diagCondition) {
      saves.push(diagnosisAPI.save({ visitId:vid, ametropicCondition:d.diagCondition, notes:d.diagNotes }).catch(()=>{}))
    }
    await Promise.all(saves)
  }

  // Expose to parent
  if (onSaveExam) onSaveExam.current = { getHistoryPayload, saveAllExam }

  const Row = ({ label, children }) => (
    <tr>
      <td style={{fontWeight:600,color:'#1a3a5c',background:'#f5f8fc',padding:'8px 12px',fontSize:12,borderRight:'1px solid #e8eff6',whiteSpace:'nowrap',minWidth:130}}>{label}</td>
      <td style={{padding:'6px 8px'}}>{children}</td>
    </tr>
  )

  const examRowStyle = { background:'#1a3a5c', color:'white', textAlign:'center', padding:'7px 10px', fontWeight:700, fontSize:11 }
  const examRowStyleOs = { ...examRowStyle, background:'#0096b4' }

  return (
    <div>
      {/* Tabs Bar */}
      <div className="tabs-bar" style={{padding:'0 0'}}>
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn ${activeTab===t.id?'active':''}`}
            onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <div style={{padding:'20px 0'}}>

        {/* TAB: History */}
        {activeTab === 'history' && (
          <div>
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Chief Complaint *</label>
                <textarea className="form-control" value={d.chiefComplaint} onChange={ch('chiefComplaint')} rows="3" placeholder="Main reason for visit…" />
              </div>
              <div className="form-group">
                <label className="form-label">History of Present Illness</label>
                <textarea className="form-control" value={d.historyPresentIllness} onChange={ch('historyPresentIllness')} rows="3" placeholder="Detailed history…" />
              </div>
            </div>
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">History of Past Illness</label>
                <textarea className="form-control" value={d.historyPastIllness} onChange={ch('historyPastIllness')} rows="2" placeholder="Previous illnesses…" />
              </div>
              <div className="form-group">
                <label className="form-label">Family History</label>
                <textarea className="form-control" value={d.familyHistory} onChange={ch('familyHistory')} rows="2" placeholder="Family medical history…" />
              </div>
            </div>
            <div className="form-row form-row-3">
              <div className="form-group">
                <label className="form-label">Allergies</label>
                <textarea className="form-control" value={d.allergies} onChange={ch('allergies')} rows="2" placeholder="Known allergies…" />
              </div>
              <div className="form-group">
                <label className="form-label">Current Medication</label>
                <textarea className="form-control" value={d.currentMedication} onChange={ch('currentMedication')} rows="2" placeholder="Medications…" />
              </div>
              <div className="form-group">
                <label className="form-label">Personal / Nutritional History</label>
                <textarea className="form-control" value={d.personalBioticHistory} onChange={ch('personalBioticHistory')} rows="2" placeholder="Lifestyle, diet…" />
              </div>
            </div>
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Systemic Examination</label>
                <textarea className="form-control" value={d.systemicExamination} onChange={ch('systemicExamination')} rows="2" placeholder="BP, diabetes, thyroid…" />
              </div>
              <div>
                <label className="form-label">IOP (Intraocular Pressure)</label>
                <div className="eye-grid">
                  <div>
                    <span className="eye-label od">OD</span>
                    <input className="form-control" value={d.iopOd} onChange={ch('iopOd')} placeholder="mmHg" />
                  </div>
                  <div>
                    <span className="eye-label os">OS</span>
                    <input className="form-control" value={d.iopOs} onChange={ch('iopOs')} placeholder="mmHg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Visual Acuity */}
        {activeTab === 'visual' && (
          <div>
            <div style={{overflowX:'auto',marginBottom:16}}>
              <table className="exam-table">
                <thead>
                  <tr>
                    <th style={{width:140}}></th>
                    <th colSpan="2" style={examRowStyle}>OD (Right Eye)</th>
                    <th colSpan="2" style={examRowStyleOs}>OS (Left Eye)</th>
                  </tr>
                  <tr>
                    <th></th>
                    <th>Distance</th><th>Near</th>
                    <th>Distance</th><th>Near</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="row-lbl">Unaided</td>
                    <td>{inp('vaUnaDistOd','6/6')}</td><td>{inp('vaUnaNearOd','N6')}</td>
                    <td>{inp('vaUnaDistOs','6/6')}</td><td>{inp('vaUnaNearOs','N6')}</td>
                  </tr>
                  <tr>
                    <td className="row-lbl">Aided (Glasses)</td>
                    <td>{inp('vaAidDistOd','6/6')}</td><td>{inp('vaAidNearOd','N6')}</td>
                    <td>{inp('vaAidDistOs','6/6')}</td><td>{inp('vaAidNearOs','N6')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">PH (Pinhole)</label>
                <input className="form-control" value={d.vaPH} onChange={ch('vaPH')} placeholder="e.g. 6/9" />
              </div>
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <input className="form-control" value={d.vaRemarks} onChange={ch('vaRemarks')} placeholder="Visual acuity remarks…" />
              </div>
            </div>
          </div>
        )}

        {/* TAB: Refraction */}
        {activeTab === 'refraction' && (
          <div>
            <div className="section-title">Retinoscopy</div>
            <div style={{overflowX:'auto',marginBottom:22}}>
              <table className="exam-table">
                <thead><tr><th style={{width:60}}></th><th>SPH</th><th>CYL</th><th>AXIS</th><th>Type of Reflex</th></tr></thead>
                <tbody>
                  <tr>
                    <td><span className="eye-label od" style={{margin:0}}>OD</span></td>
                    <td>{inp('rtSphOd','+0.00')}</td><td>{inp('rtCylOd','-0.00')}</td>
                    <td>{inp('rtAxisOd','0-180')}</td><td>{inp('rtReflexOd','With/Against')}</td>
                  </tr>
                  <tr>
                    <td><span className="eye-label os" style={{margin:0}}>OS</span></td>
                    <td>{inp('rtSphOs','+0.00')}</td><td>{inp('rtCylOs','-0.00')}</td>
                    <td>{inp('rtAxisOs','0-180')}</td><td>{inp('rtReflexOs','With/Against')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="section-title">Subjective Refraction</div>
            <div style={{overflowX:'auto',marginBottom:16}}>
              <table className="exam-table">
                <thead><tr><th style={{width:60}}></th><th>SPH</th><th>CYL</th><th>AXIS</th><th>BCVA</th><th>ADD</th><th>NV</th></tr></thead>
                <tbody>
                  <tr>
                    <td><span className="eye-label od" style={{margin:0}}>OD</span></td>
                    <td>{inp('srSphOd','+0.00')}</td><td>{inp('srCylOd','-0.00')}</td>
                    <td>{inp('srAxisOd','0-180')}</td><td>{inp('srBcvaOd','6/6')}</td>
                    <td>{inp('srAddOd','+0.00')}</td><td>{inp('srNvOd','N6')}</td>
                  </tr>
                  <tr>
                    <td><span className="eye-label os" style={{margin:0}}>OS</span></td>
                    <td>{inp('srSphOs','+0.00')}</td><td>{inp('srCylOs','-0.00')}</td>
                    <td>{inp('srAxisOs','0-180')}</td><td>{inp('srBcvaOs','6/6')}</td>
                    <td>{inp('srAddOs','+0.00')}</td><td>{inp('srNvOs','N6')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="form-row form-row-2">
              <div className="form-group"><label className="form-label">Duochrome Balance</label>
                <input className="form-control" value={d.srDuochrome} onChange={ch('srDuochrome')} placeholder="OD/OS result" /></div>
              <div className="form-group"><label className="form-label">Binocular Balance</label>
                <input className="form-control" value={d.srBinocular} onChange={ch('srBinocular')} placeholder="Result" /></div>
            </div>
          </div>
        )}

        {/* TAB: Slit Lamp */}
        {activeTab === 'slitlamp' && (
          <div style={{overflowX:'auto'}}>
            <table className="exam-table">
              <thead>
                <tr>
                  <th style={{width:140}}>Structure</th>
                  <th style={examRowStyle}>OD (Right Eye)</th>
                  <th style={examRowStyleOs}>OS (Left Eye)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Eyelids',          'slEyelidsOd','slEyelidsOs'],
                  ['Conjunctiva',      'slConjOd',  'slConjOs'],
                  ['Sclera',           'slScleraOd','slScleraOs'],
                  ['Cornea',           'slCorneaOd','slCorneaOs'],
                  ['Anterior Chamber', 'slAcOd',    'slAcOs'],
                  ['Iris',             'slIrisOd',  'slIrisOs'],
                  ['Pupil',            'slPupilOd', 'slPupilOs'],
                ].map(([label, kOd, kOs]) => (
                  <tr key={label}>
                    <td className="row-lbl">{label}</td>
                    <td>{inp(kOd,'NAD / findings…')}</td>
                    <td>{inp(kOs,'NAD / findings…')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: Tests */}
        {activeTab === 'tests' && (
          <div>
            <div className="form-row form-row-3">
              <div className="form-group"><label className="form-label">Cover Test (Distance)</label>
                <input className="form-control" value={d.tCoverDist} onChange={ch('tCoverDist')} placeholder="Ortho / Exo / Eso…" /></div>
              <div className="form-group"><label className="form-label">Cover Test (Near)</label>
                <input className="form-control" value={d.tCoverNear} onChange={ch('tCoverNear')} placeholder="Ortho / Exo / Eso…" /></div>
              <div className="form-group"><label className="form-label">Hirschberg Test</label>
                <input className="form-control" value={d.tHirschberg} onChange={ch('tHirschberg')} placeholder="Result…" /></div>
            </div>
            <div className="form-row form-row-3">
              <div className="form-group"><label className="form-label">NPA</label>
                <input className="form-control" value={d.tNpa} onChange={ch('tNpa')} placeholder="cm" /></div>
              <div className="form-group"><label className="form-label">NPC</label>
                <input className="form-control" value={d.tNpc} onChange={ch('tNpc')} placeholder="cm" /></div>
              <div className="form-group"><label className="form-label">Extra Ocular Motility</label>
                <input className="form-control" value={d.tEom} onChange={ch('tEom')} placeholder="Full / Restricted…" /></div>
            </div>
            <div className="form-row form-row-2">
              <div className="form-group"><label className="form-label">Stereopsis</label>
                <input className="form-control" value={d.tStereopsis} onChange={ch('tStereopsis')} placeholder="Test / Result…" /></div>
              <div className="form-group"><label className="form-label">Color Vision</label>
                <input className="form-control" value={d.tColorVision} onChange={ch('tColorVision')} placeholder="Ishihara / Result…" /></div>
            </div>
            <hr className="divider" />
            <div className="section-title">Dry Eye Tests</div>
            <div style={{overflowX:'auto'}}>
              <table className="exam-table">
                <thead><tr><th style={{width:160}}>Test</th><th>OD</th><th>OS</th></tr></thead>
                <tbody>
                  {[
                    ['Schirmer 1','tSch1Od','tSch1Os'],
                    ['Schirmer 2','tSch2Od','tSch2Os'],
                    ['TBUT',     'tTbutOd','tTbutOs'],
                  ].map(([label,kOd,kOs]) => (
                    <tr key={label}>
                      <td className="row-lbl">{label}</td>
                      <td>{inp(kOd,'mm')}</td>
                      <td>{inp(kOs,'mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Diagnosis */}
        {activeTab === 'diagnosis' && (
          <div>
            <div className="form-group">
              <label className="form-label">Ametropic Condition / Diagnosis</label>
              <textarea className="form-control" value={d.diagCondition} onChange={ch('diagCondition')} rows="3" placeholder="Enter diagnosis…" />
            </div>
            <div className="form-group">
              <label className="form-label">Notes / Advice for Patient</label>
              <textarea className="form-control" value={d.diagNotes} onChange={ch('diagNotes')} rows="3" placeholder="Clinical notes, advice…" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
