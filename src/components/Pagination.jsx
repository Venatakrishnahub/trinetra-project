import React from 'react'

export default function Pagination({ current, total, onChange }) {
  if (total <= 1) return null

  const pages = []
  const start = Math.max(0, current - 2)
  const end   = Math.min(total - 1, current + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="pagination">
      <button className="page-btn" disabled={current === 0} onClick={() => onChange(current - 1)}>‹</button>
      {start > 0 && <><button className="page-btn" onClick={() => onChange(0)}>1</button><span style={{padding:'0 4px',color:'#8aa0b8'}}>…</span></>}
      {pages.map(i => (
        <button key={i} className={`page-btn ${i === current ? 'active' : ''}`} onClick={() => onChange(i)}>{i + 1}</button>
      ))}
      {end < total - 1 && <><span style={{padding:'0 4px',color:'#8aa0b8'}}>…</span><button className="page-btn" onClick={() => onChange(total - 1)}>{total}</button></>}
      <button className="page-btn" disabled={current >= total - 1} onClick={() => onChange(current + 1)}>›</button>
    </div>
  )
}
