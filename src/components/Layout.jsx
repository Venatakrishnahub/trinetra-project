import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header  from './Header'
import { ToastProvider } from '../context/ToastContext'

export default function Layout() {
  return (
    <ToastProvider>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="page-body">
            <Outlet />
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}
