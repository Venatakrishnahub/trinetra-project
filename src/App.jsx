import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'

// Pages
import Login         from './pages/Login'
import Dashboard     from './pages/Dashboard'
import Patients      from './pages/Patients'
import Visits        from './pages/Visits'
import Prescriptions from './pages/Prescriptions'
import Users         from './pages/Users'
import PrintWorkup   from './pages/print/PrintWorkup'
import PrintRx       from './pages/print/PrintRx'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/print/workup/:visitId"        element={<PrintWorkup />} />
          <Route path="/print/prescription/:rxId"     element={<PrintRx />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"     element={<Dashboard />} />
            <Route path="patients"      element={<Patients />} />
            <Route path="visits"        element={<Visits />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="users"         element={<Users />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
