import React, { useState, useEffect } from 'react'
import api from '../api'
import { useParams, useNavigate, Link } from 'react-router-dom'

export default function Book(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])

  useEffect(() => { if (id) load() }, [id])
  useEffect(() => { if (date && id) loadAvailableSlots() }, [date])

  async function load() {
    try {
      const res = await api.get(`/doctors/${id}`)
      setDoctor(res.data)
    } catch (err) {
      console.error('Failed to load doctor:', err)
      setError('Failed to load doctor information')
    } finally {
      setLoading(false)
    }
  }

  async function loadAvailableSlots() {
    try {
      const res = await api.get(`/availability/doctor/${id}?date=${date}`)
      setAvailableSlots(res.data.slots || [])
    } catch (err) {
      console.error('Failed to load slots:', err)
      setAvailableSlots([])
    }
  }

  async function submit(e){
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/appointments', { 
        doctorId: id, 
        date, 
        time,
        notes 
      })
      navigate('/appointments')
    } catch (err) {
      console.error('Failed to book appointment:', err)
      setError(err.response?.data?.message || 'Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'DR'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ]

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="text-center" style={{ padding: '3rem' }}>
            <div className="spinner"></div>
            <p>Loading doctor information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <Link to={`/doctors/${id}`} className="btn btn-ghost" style={{ marginBottom: '1.5rem' }}>
          ← Back to Doctor Profile
        </Link>

        <div className="booking-container">
          {error && (
            <div className="alert alert-error" style={{
              padding: '1rem',
              borderRadius: 'var(--radius)',
              marginBottom: '1.5rem',
              background: '#fee2e2',
              color: 'var(--error)',
              border: '1px solid var(--error)'
            }}>
              {error}
            </div>
          )}

          {/* Doctor Info Card */}
          {doctor && (
            <div className="booking-doctor-info card">
              <div className="doctor-avatar">
                {getInitials(doctor.name)}
              </div>
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>Dr. {doctor.name}</h3>
                <p style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>
                  {doctor.specialty?.name || 'General Practitioner'}
                </p>
                {doctor.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)' }}>
                    <span>⭐</span>
                    <span style={{ fontWeight: 500 }}>{doctor.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Booking Form */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Book an Appointment</h3>
            </div>
            <div className="card-body">
              <form onSubmit={submit} className="booking-form">
                {/* Date Selection */}
                <div className="form-group">
                  <label className="form-label">Select Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={date} 
                    onChange={e => { setDate(e.target.value); setTime(''); }} 
                    min={new Date().toISOString().split('T')[0]}
                    required 
                  />
                </div>

                {/* Time Slots */}
                {date && (
                  <div className="form-group">
                    <label className="form-label">Select Time</label>
                    <div className="time-slots">
                      {timeSlots.map(slot => {
                        const isAvailable = availableSlots.length === 0 || availableSlots.includes(slot)
                        const isSelected = time === slot
                        return (
                          <button
                            key={slot}
                            type="button"
                            className={`time-slot ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                            onClick={() => isAvailable && setTime(slot)}
                            disabled={!isAvailable}
                          >
                            {formatTime(slot)}
                          </button>
                        )
                      })}
                    </div>
                    {time && (
                      <p className="form-hint" style={{ marginTop: '0.5rem' }}>
                        Selected: <strong>{formatTime(time)}</strong>
                      </p>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    className="form-textarea"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Describe your symptoms or reason for visit..."
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg" 
                  style={{ width: '100%' }}
                  disabled={submitting || !date || !time}
                >
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          </div>

          {/* Additional Info */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-body">
              <h4 style={{ marginBottom: '0.75rem' }}>Appointment Information</h4>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--gray-600)', lineHeight: 1.8 }}>
                <li>Please arrive 15 minutes before your scheduled appointment</li>
                <li>Bring a valid ID and any relevant medical records</li>
                <li>Cancellations must be made at least 24 hours in advance</li>
                <li>Consultation fee is to be paid at the clinic</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
