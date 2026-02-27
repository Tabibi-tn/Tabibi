import React from 'react'
import { Link } from 'react-router-dom'

function DoctorCard({ doctor }) {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem'
    }}>
      <h4 style={{ margin: 0 }}>{doctor.name}</h4>
      <p style={{ margin: '4px 0', color: '#666' }}>
        {doctor.specialty}
      </p>
      <p style={{ margin: '4px 0' }}>
        Fee: TND{doctor.fee}
      </p>

      <div style={{ marginTop: '10px' }}>
        <Link to={`/doctors/${doctor.id}`} style={{ marginRight: '10px' }}>
          View Profile
        </Link>
        <button>Book</button>
      </div>
    </div>
  )
}

export default function Doctors() {


  const doctors = [
    { id: 1, name: 'Dr. Maram Mihoub', specialty: 'Cardiology', fee: 90 },
    { id: 2, name: 'Dr. Yasmine Kalai', specialty: 'Neurology', fee: 120 },
    { id: 3, name: 'Dr. Lilia Charfi', specialty: 'Radiology', fee: 90 }
  ]

  return (
    <div style={{ maxWidth: '600px', margin: '4rem auto' }}>
      <h2>Doctors</h2>
      <p>Doctors page</p>

      {doctors.map(doctor => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </div>
  )
}