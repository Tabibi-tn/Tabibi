import React, { useState, useEffect, useContext, Suspense } from 'react'
import api from '../api'
import { AuthContext } from '../contexts/AuthContext'

const FullCalendarLoader = React.lazy(() => import('@fullcalendar/react'))

export default function Availability(){
  const { user } = useContext(AuthContext)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [doctor, setDoctor] = useState(null)
  const [dayGridPlugin, setDayGridPlugin] = useState(null)
  const [interactionPlugin, setInteractionPlugin] = useState(null)

  useEffect(()=>{ 
    load();
    // dynamically import plugins to avoid startup errors
    import('@fullcalendar/daygrid').then(m => setDayGridPlugin(m.default || m)).catch(()=>{});
    import('@fullcalendar/interaction').then(m => setInteractionPlugin(m.default || m)).catch(()=>{});
  },[])

  async function load(){
    if (!user) return;
    
    // For doctors, get their profile first to get the correct doctor ID
    if (user.role === 'doctor') {
      try {
        // Get doctor profile
        const doctorRes = await api.get('/doctors/me')
        setDoctor(doctorRes.data)
        
        // Get availability
        const availabilityRes = await api.get('/doctors/me/availability')
        const availability = availabilityRes.data || []
        
        // Get approved appointments
        const appointmentsRes = await api.get('/appointments/approved')
        const appointments = appointmentsRes.data || []
        
        // Combine availability and appointments into events
        const availabilityEvents = availability.map(a => ({
          ...a,
          backgroundColor: '#10b981', // green for available
          title: 'Available'
        }))
        
        const appointmentEvents = appointments.map(a => ({
          start: a.date,
          title: `Appointment with ${a.patientName || 'Patient'}`,
          backgroundColor: '#0ea5e9', // blue for appointments
          textColor: '#ffffff'
        }))
        
        setEvents([...availabilityEvents, ...appointmentEvents])
      } catch (err) {
        console.error('Failed to load calendar data:', err)
      }
    }
    setLoading(false)
  }

  async function handleDateSelect(selectInfo) {
    if (user.role !== 'doctor') return;
    
    const title = 'Available'
    const newEvent = { start: selectInfo.startStr, end: selectInfo.endStr, title }
    const next = [...events.filter(e => e.backgroundColor === '#10b981'), newEvent]
    
    setEvents([...next, ...events.filter(e => e.backgroundColor === '#0ea5e9')])
    
    try {
      await api.post('/doctors/me/availability', next)
    } catch (err) {
      console.error('Failed to save availability:', err)
    }
  }

  // Only allow doctors to access this page
  if (!user || user.role !== 'doctor') {
    return (
      <div className="page">
        <div className="container">
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>This page is only accessible to doctors.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Calendar</h1>
          <p className="page-subtitle">Manage your availability and view your appointments</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 16, height: 16, backgroundColor: '#10b981', borderRadius: 4 }}></div>
            <span style={{ fontSize: '0.875rem' }}>Available Slots</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 16, height: 16, backgroundColor: '#0ea5e9', borderRadius: 4 }}></div>
            <span style={{ fontSize: '0.875rem' }}>Appointments</span>
          </div>
        </div>

        <Suspense fallback={<div>Loading calendar...</div>}>
          {dayGridPlugin && interactionPlugin && (
            <FullCalendarLoader
              plugins={[ dayGridPlugin, interactionPlugin ]}
              initialView="dayGridMonth"
              selectable={user.role === 'doctor'}
              select={handleDateSelect}
              events={events}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek'
              }}
              height="auto"
              eventDisplay="block"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short'
              }}
            />
          )}
        </Suspense>
      </div>
    </div>
  )
}
