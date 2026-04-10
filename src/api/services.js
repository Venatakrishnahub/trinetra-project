import http from '../config/http'
import { EP } from '../config/api.config'

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => http.post(EP.LOGIN, { email, password }),
}

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
export const patientAPI = {
  getAll:  (params) => http.get(EP.PATIENTS, { params }),
  getById: (id)     => http.get(EP.PATIENT(id)),
  create:  (data)   => http.post(EP.PATIENTS, data),
  update:  (id, d)  => http.put(EP.PATIENT(id), d),
  remove:  (id)     => http.delete(EP.PATIENT(id)),
}

// ─── VISITS ───────────────────────────────────────────────────────────────────
export const visitAPI = {
  getAll:      (params) => http.get(EP.VISITS, { params }),
  getById:     (id)     => http.get(EP.VISIT(id)),
  getByPatient:(pid)    => http.get(EP.VISITS_BY_PATIENT(pid)),
  create:      (data)   => http.post(EP.VISITS, data),
  update:      (id, d)  => http.put(EP.VISIT(id), d),
}

// ─── VISUAL ACUITY ────────────────────────────────────────────────────────────
export const visualAcuityAPI = {
  getByVisit: (vid)    => http.get(EP.VA_BY_VISIT(vid)),
  save:       (data)   => http.post(EP.VISUAL_ACUITY, data),
  update:     (id, d)  => http.put(`${EP.VISUAL_ACUITY}/${id}`, d),
}

// ─── RETINOSCOPY ──────────────────────────────────────────────────────────────
export const retinoscopyAPI = {
  getByVisit: (vid)    => http.get(EP.RETO_BY_VISIT(vid)),
  save:       (data)   => http.post(EP.RETINOSCOPY, data),
  update:     (id, d)  => http.put(`${EP.RETINOSCOPY}/${id}`, d),
}

// ─── SUBJECTIVE REFRACTION ────────────────────────────────────────────────────
export const subjectiveAPI = {
  getByVisit: (vid)    => http.get(EP.SUBJ_BY_VISIT(vid)),
  save:       (data)   => http.post(EP.SUBJECTIVE, data),
  update:     (id, d)  => http.put(`${EP.SUBJECTIVE}/${id}`, d),
}

// ─── SLIT LAMP ────────────────────────────────────────────────────────────────
export const slitLampAPI = {
  getByVisit: (vid)    => http.get(EP.SLIT_BY_VISIT(vid)),
  save:       (data)   => http.post(EP.SLIT_LAMP, data),
  update:     (id, d)  => http.put(`${EP.SLIT_LAMP}/${id}`, d),
}

// ─── DIAGNOSIS ────────────────────────────────────────────────────────────────
export const diagnosisAPI = {
  getByVisit: (vid)    => http.get(EP.DIAG_BY_VISIT(vid)),
  save:       (data)   => http.post(EP.DIAGNOSIS, data),
  update:     (id, d)  => http.put(`${EP.DIAGNOSIS}/${id}`, d),
}

// ─── PRESCRIPTIONS ────────────────────────────────────────────────────────────
export const prescriptionAPI = {
  getAll:      (params) => http.get(EP.PRESCRIPTIONS, { params }),
  getById:     (id)     => http.get(EP.PRESCRIPTION(id)),
  getByPatient:(pid)    => http.get(EP.RX_BY_PATIENT(pid)),
  create:      (data)   => http.post(EP.PRESCRIPTIONS, data),
  update:      (id, d)  => http.put(EP.PRESCRIPTION(id), d),
  saveDetails: (data)   => http.post(EP.RX_DETAILS, data),
  saveIPD:     (data)   => http.post(EP.INTERPUPILLARY, data),
  updateIPD:   (id, d)  => http.put(`${EP.INTERPUPILLARY}/${id}`, d),
}

// ─── USERS ────────────────────────────────────────────────────────────────────
export const userAPI = {
  getAll: () => http.get(EP.USERS),
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => http.get(EP.DASHBOARD_STATS),
}
