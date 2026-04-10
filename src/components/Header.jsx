import React from 'react'
import { useLocation } from 'react-router-dom'

const PAGE_META = {
  '/dashboard':     { title: 'Dashboard',      crumb: ['Home', 'Dashboard'] },
  '/patients':      { title: 'Patients',        crumb: ['Home', 'Patients'] },
  '/visits':        { title: 'Visits & Examination', crumb: ['Home', 'Visits'] },
  '/prescriptions': { title: 'Prescriptions',   crumb: ['Home', 'Prescriptions'] },
  '/users':         { title: 'Users',           crumb: ['Home', 'Users'] },
}

export default function Header() {
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname] || { title: 'Trinetra', crumb: ['Home'] }

  return (
    <header className="header">
      <div className="header-left">
        <div>
          <div className="page-title">{meta.title}</div>
          <div className="breadcrumb">
            {meta.crumb.map((b, i) => (
              <React.Fragment key={i}>
                <span>{b}</span>
                {i < meta.crumb.length - 1 && <span style={{color:'#d1dce8'}}>/</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="header-right">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input placeholder="Search…" />
        </div>
      </div>
    </header>
  )
}
