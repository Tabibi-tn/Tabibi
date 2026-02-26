import React from 'react'
import { useParams, Link } from 'react-router-dom'

export default function DoctorProfile() {
  const { id } = useParams()

  return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
      
      <Link to="/doctors">← Back</Link>

      <h2 style={{ marginTop: '2rem' }}>Doctor Profile</h2>
      <p>dr profile page</p>

      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd' }}>
        <h3>Doctor ID: {id}</h3>
        <p>Name: Dr. Maram</p>
        <p>Specialty: aesthetic medecine</p>
        <p>Experience: 5 years</p>
      </div>

      <button style={{ marginTop: '1.5rem', padding: '8px 16px' }}>
        Book Appointment 
      </button>

    </div>
  )
}