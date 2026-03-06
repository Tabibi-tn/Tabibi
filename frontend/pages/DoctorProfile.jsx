import React from 'react'
import { useParams, Link } from 'react-router-dom'

export default function DoctorProfile() {
  const { id } = useParams()

  const doctor = {
    name: 'Dr. Maram',
    specialty: 'Aesthetic Medicine',
    experience: 5,
    rating: 4.8,
    reviews: 12,
    fee: 80,
    clinic: 'City Health Clinic'
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '3rem auto', padding: '1rem' }}>

      <Link to="/doctors" style={{ textDecoration: 'none' }}>
        ← Back to Doctors
      </Link>

      <div style={{
        marginTop: '1.5rem',
        padding: '2rem',
        border: '1px solid #eee',
        borderRadius: '12px',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>

        <div style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: '#e0f2fe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#2563eb'
        }}>
          {getInitials(doctor.name)}
        </div>

        <div style={{ flex: 1, minWidth: '250px' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>{doctor.name}</h1>
          <p style={{ color: '#2563eb', fontWeight: '500' }}>
            {doctor.specialty}
          </p>

          <div style={{
            marginTop: '1rem',
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <span>💼 {doctor.experience} years</span>
            <span>⭐ {doctor.rating} ({doctor.reviews} reviews)</span>
            <span>💰 TND{doctor.fee}</span>
          </div>

          <p style={{ marginTop: '1rem', color: '#666' }}>
            📍 {doctor.clinic}
          </p>

          <button style={{
            marginTop: '1.5rem',
            padding: '10px 20px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Book Appointment
          </button>
        </div>
      </div>


      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        border: '1px solid #eee',
        borderRadius: '12px'
      }}>
        <h3>Patient Reviews</h3>

        <div style={{ marginTop: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Sarah A.</strong> ⭐⭐⭐⭐⭐
            <p style={{ margin: 0, color: '#666' }}>
              Very professional and kind. Highly recommended!
            </p>
          </div>

          <div>
            <strong>Ahmed M.</strong> ⭐⭐⭐⭐
            <p style={{ margin: 0, color: '#666' }}>
              Great experience and clear explanations.
            </p>
          </div>
        </div>
      </div>


      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        border: '1px solid #eee',
        borderRadius: '12px'
      }}>
        <h3>Availability</h3>

        <ul style={{ marginTop: '1rem', color: '#666' }}>
          <li>Monday: 9:00 AM – 3:00 PM</li>
          <li>Wednesday: 10:00 AM – 4:00 PM</li>
          <li>Friday: 8:00 AM – 1:00 PM</li>
        </ul>
      </div>

    </div>
  )
}
