import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function DoctorCard({ doctor }) {
  return (
    <div className="doctor-card card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        
        <div>
          <h4 style={{margin:0}}>{doctor.name}</h4>
          <div className="muted small">{doctor.specialty}</div>
        </div>

        <div style={{textAlign:'right'}}>
          <div className="muted small">Fee</div>
          <div style={{fontWeight:700}}>TND {doctor.fee}</div>
        </div>

      </div>

      <div style={{height:8}} />

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <Link to={`/doctors/${doctor.id}`} className="btn">
          Book
        </Link>

        <Link to={`/doctors/${doctor.id}`} className="muted small">
          Profile
        </Link>
      </div>
    </div>
  )
}

export default function Doctors(){

  const [q,setQ] = useState('')

  // Temporary static data
  const doctors = [
    { id:1, name:'Dr. Maram Mihoub', specialty:'Cardiology', fee:90 },
    { id:2, name:'Dr. Yasmine Kalai', specialty:'Neurology', fee:120 },
    { id:3, name:'Dr. Lilia Charfi', specialty:'Radiology', fee:80 },
    { id:4, name:'Dr. Ahmed Ben Ali', specialty:'Dermatology', fee:70 }
  ]

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(q.toLowerCase()) ||
    d.specialty.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="container">

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:'18px 0'}}>
        <h3 style={{margin:0}}>Doctors</h3>

        <input
          placeholder="Search by name or specialty"
          value={q}
          onChange={e=>setQ(e.target.value)}
          style={{
            padding:'8px 10px',
            borderRadius:8,
            border:'1px solid #e6eef6'
          }}
        />
      </div>

      <div className="grid">

        {filteredDoctors.length === 0 && (
          <div className="muted">No doctors found.</div>
        )}

        {filteredDoctors.map(d => (
          <DoctorCard key={d.id} doctor={d} />
        ))}

      </div>

    </div>
  )
}