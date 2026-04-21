import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import  api  from '../api'

export default function Appointments() {
  const { user } = useContext(AuthContext)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      // Use /appointments for both doctor and patient - backend handles role-based filtering
      const response = await api.get('/appointments')
      setAppointments(response.data)
    } catch (err) {
      setError('Failed to load appointments')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status })
      setAppointments(appointments.map(apt => 
        apt.id === id ? { ...apt, status } : apt
      ))
    } catch (err) {
      alert('Failed to update appointment')
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true
    return apt.status === filter
  })

  const getStatusClass = (status) => {
    const statusMap = {
      pending: 'pending',
      approved: 'approved',
      completed: 'completed',
      cancelled: 'cancelled'
    }
    return statusMap[status] || 'pending'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' })
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Get the other party's name based on user role
  // Backend returns: Doctor with User for patient, Patient with User for doctor
  const getOtherPartyName = (appointment) => {
    if (user.role === 'doctor') {
      // For doctor: appointment.Patient.User.name
      return appointment.Patient?.User?.name || 'Patient'
    } else {
      // For patient: appointment.Doctor.User.name
      return appointment.Doctor?.User?.name || 'Doctor'
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="text-center" style={{ padding: '3rem' }}>
            <div className="spinner"></div>
            <p>Loading appointments...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Appointments</h1>
          <p className="page-subtitle">
            {user.role === 'doctor' 
              ? 'Manage your patient appointments' 
              : 'View and manage your appointments'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs" style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--gray-200)',
          paddingBottom: '0.5rem'
        }}>
          {['all', 'pending', 'approved', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                background: filter === status ? 'var(--primary)' : 'transparent',
                color: filter === status ? 'white' : 'var(--gray-600)',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontWeight: 500,
                textTransform: 'capitalize',
                transition: 'var(--transition)'
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {filteredAppointments.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h3>No Appointments Found</h3>
            <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
              {filter === 'all' 
                ? "You don't have any appointments yet." 
                : `No ${filter} appointments.`}
            </p>
            {user.role === 'patient' && (
              <Link to="/doctors" className="btn btn-primary">
                Find a Doctor
              </Link>
            )}
          </div>
        ) : (
          <div className="appointments-list">
            {filteredAppointments.map(appointment => {
              const date = formatDate(appointment.date)
              const otherPartyName = getOtherPartyName(appointment)

              return (
                <div key={appointment.id} className="card appointment-card">
                  <div className="appointment-date">
                    <div className="appointment-day">{date.day}</div>
                    <div className="appointment-month">{date.month}</div>
                  </div>
                  
                  <div className="appointment-info">
                    <h3 className="appointment-title">
                      {user.role === 'doctor' 
                        ? `Appointment with ${otherPartyName}`
                        : `Dr. ${otherPartyName}`
                      }
                    </h3>
                    <div className="appointment-meta">
                      <span>🕒 {formatTime(appointment.time)}</span>
                      <span>📍 {appointment.location || 'Medical Center'}</span>
                      {appointment.specialty && (
                        <span>🏥 {appointment.specialty}</span>
                      )}
                    </div>
                    {appointment.notes && (
                      <p style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.875rem', 
                        color: 'var(--gray-500)' 
                      }}>
                        {appointment.notes}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span className={`appointment-status ${getStatusClass(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    
                    <div className="appointment-actions">
                      {user.role === 'doctor' && appointment.status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => updateAppointmentStatus(appointment.id, 'approved')}
                          >
                            Accept
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      
                      {user.role === 'patient' && appointment.status === 'approved' && (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        >
                          Mark Complete
                        </button>
                      )}

                      {user.role === 'patient' && appointment.status === 'completed' && (
                        <Link 
                          to={`/consultations/edit/${appointment.id}`}
                          className="btn btn-sm btn-secondary"
                        >
                          Add Notes
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats Summary */}
        {appointments.length > 0 && (
          <div className="stats-summary" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <div className="card stat-card">
              <div className="stat-icon primary">📅</div>
              <div className="stat-value">{appointments.length}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon warning">⏳</div>
              <div className="stat-value">
                {appointments.filter(a => a.status === 'pending').length}
              </div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon success">✓</div>
              <div className="stat-value">
                {appointments.filter(a => a.status === 'completed').length}
              </div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon error">✕</div>
              <div className="stat-value">
                {appointments.filter(a => a.status === 'cancelled').length}
              </div>
              <div className="stat-label">Cancelled</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}