// ─── API Base URL ─────────────────────────────────────────────────────────────
export const API_BASE_URL = 'https://trinetra-backend-lc76.onrender.com'

// ─── Endpoints ────────────────────────────────────────────────────────────────
export const EP = {
  LOGIN:                    '/api/login',

  PATIENTS:                 '/api/patients',
  PATIENT:          (id)  => `/api/patients/${id}`,

  VISITS:                   '/api/visits',
  VISIT:            (id)  => `/api/visits/${id}`,
  VISITS_BY_PATIENT:(pid) => `/api/visits/patient/${pid}`,

  VISUAL_ACUITY:            '/api/visual-acuity',
  VA_BY_VISIT:      (vid) => `/api/visual-acuity/visit/${vid}`,

  RETINOSCOPY:              '/api/retinoscopy',
  RETO_BY_VISIT:    (vid) => `/api/retinoscopy/visit/${vid}`,

  SUBJECTIVE:               '/api/subjective-refraction',
  SUBJ_BY_VISIT:    (vid) => `/api/subjective-refraction/visit/${vid}`,

  SLIT_LAMP:                '/api/slit-lamp',
  SLIT_BY_VISIT:    (vid) => `/api/slit-lamp/visit/${vid}`,

  DIAGNOSIS:                '/api/diagnosis',
  DIAG_BY_VISIT:    (vid) => `/api/diagnosis/visit/${vid}`,

  PRESCRIPTIONS:            '/api/prescriptions',
  PRESCRIPTION:     (id)  => `/api/prescriptions/${id}`,
  RX_BY_PATIENT:   (pid) => `/api/prescriptions/patient/${pid}`,
  RX_DETAILS:               '/api/prescription-details',
  INTERPUPILLARY:           '/api/interpupillary',

  USERS:                    '/api/users',
  DASHBOARD_STATS:          '/api/dashboard/stats',
}
