import { useContext, useState, useEffect, useRef } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function Dashboard(){
  const { user, authLoading, needsProfileCompletion } = useContext(AuthContext)
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    appointments: 0, totalAppointments: 0,
    consultations: 0, completedAppointments: 0,
    messages: 0, pendingAppointments: 0, upcomingAppointments: 0,
    doctors: 0, users: 0, patients: 0
  })
  const [loading, setLoading] = useState(true)
  const fetched = useRef(false)

  useEffect(() => {
    if (authLoading || !user) return
    if (fetched.current) return
    fetched.current = true

    if (user.role === 'doctor' && needsProfileCompletion()) {
      navigate('/doctor-complete-profile')
      return
    }
    fetchDashboardStats()
  }, [user, authLoading])

  const fetchDashboardStats = async () => {
    try {
      const endpoint = user.role === 'doctor' 
        ? '/dashboard/doctor-stats' 
        : user.role === 'admin'
        ? '/dashboard/admin-stats'
        : '/dashboard/patient-stats'
      
      const response = await api.get(endpoint)
      setStats(response.data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setStats({ appointments: 0, consultations: 0, messages: 0, doctors: 0 })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getRoleSpecificContent = () => {
    switch (user.role) {
      case 'patient':
        return (
          <div className="grid grid-4" style={{ marginTop: '1.5rem' }}>
            <div className="card stat-card">
              <div className="stat-icon primary">📅</div>
              <div className="stat-value">{stats.totalAppointments ?? stats.appointments ?? 0}</div>
              <div className="stat-label">Total Appointments</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon success">✅</div>
              <div className="stat-value">{stats.upcomingAppointments ?? 0}</div>
              <div className="stat-label">Upcoming</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon warning">🏥</div>
              <div className="stat-value">{stats.completedAppointments ?? 0}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon error">💬</div>
              <div className="stat-value">{stats.messages ?? 0}</div>
              <div className="stat-label">Messages</div>
            </div>
          </div>
        )
      case 'doctor':
        return (
          <div className="grid grid-4" style={{ marginTop: '1.5rem' }}>
            <div className="card stat-card">
              <div className="stat-icon primary">📅</div>
              <div className="stat-value">{stats.totalAppointments ?? stats.appointments ?? 0}</div>
              <div className="stat-label">Total Appointments</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon success">✅</div>
              <div className="stat-value">{stats.completedAppointments ?? 0}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon warning">⏳</div>
              <div className="stat-value">{stats.pendingAppointments ?? stats.pending ?? 0}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon error">💬</div>
              <div className="stat-value">{stats.messages ?? 0}</div>
              <div className="stat-label">Messages</div>
            </div>
          </div>
        )
      case 'admin':
        return (
          <div className="grid grid-4" style={{ marginTop: '1.5rem' }}>
            <div className="card stat-card">
              <div className="stat-icon primary">👥</div>
              <div className="stat-value">{stats.users || 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon success">👨‍⚕️</div>
              <div className="stat-value">{stats.doctors || 0}</div>
              <div className="stat-label">Doctors</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon warning">📅</div>
              <div className="stat-value">{stats.appointments || 0}</div>
              <div className="stat-label">Appointments</div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon error">🏥</div>
              <div className="stat-value">{stats.patients || 0}</div>
              <div className="stat-label">Patients</div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="dashboard-greeting">{getGreeting()}, {user.name?.split(' ')[0] || 'User'}!</h1>
              <p className="dashboard-subtitle">
                {user.role === 'admin' && 'Manage your healthcare platform'}
                {user.role === 'doctor' && 'Manage your appointments and patients'}
                {user.role === 'patient' && 'View your health dashboard'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {user.role === 'patient' && (
                <Link to="/doctors" className="btn btn-primary">Find a Doctor</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-primary">Admin Panel</Link>
              )}
            </div>
          </div>
        </div>

        {!loading && getRoleSpecificContent()}

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Quick Actions</h2>
          </div>
          <div className="quick-actions">
            {user.role === 'patient' && (
              <>
                <Link to="/doctors" className="quick-action"><span>🔍</span> Find Doctors</Link>
                <Link to="/appointments" className="quick-action"><span>📅</span> My Appointments</Link>
                <Link to="/messages" className="quick-action"><span>💬</span> Messages</Link>
                <Link to="/profile" className="quick-action"><span>👤</span> My Profile</Link>
              </>
            )}
            {user.role === 'doctor' && (
              <>
                <Link to="/appointments" className="quick-action"><span>📅</span> Appointments</Link>
                <Link to="/availability" className="quick-action"><span>📆</span> Availability</Link>
                <Link to="/consultations/new" className="quick-action"><span>📝</span> New Consultation</Link>
                <Link to="/messages" className="quick-action"><span>💬</span> Messages</Link>
                <Link to="/profile" className="quick-action"><span>👤</span> Profile</Link>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/admin" className="quick-action"><span>⚙️</span> Admin Panel</Link>
                <Link to="/doctors" className="quick-action"><span>👨‍⚕️</span> Manage Doctors</Link>
                <Link to="/appointments" className="quick-action"><span>📅</span> All Appointments</Link>
                <Link to="/messages" className="quick-action"><span>💬</span> Messages</Link>
                <Link to="/profile" className="quick-action"><span>👤</span> Profile</Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-2" style={{ marginTop: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Your Account</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Role</span>
                  <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{user.role}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Email</span>
                  <span style={{ fontWeight: 500 }}>{user.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Member Since</span>
                  <span style={{ fontWeight: 500 }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              <Link to="/profile" className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }}>
                Edit Profile
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Need Help?</h3>
            </div>
            <div className="card-body">
              <p style={{ color: 'var(--gray-500)', marginBottom: '1rem' }}>
                Have questions? We're here to help you with any concerns about your healthcare journey.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href="mailto:support@tabibi.com" className="quick-action" style={{ justifyContent: 'flex-start' }}>
                  <span>📧</span> Email Support
                </a>
                <Link to="/doctors" className="quick-action" style={{ justifyContent: 'flex-start' }}>
                  <span>🏥</span> Find a Doctor
                </Link>
                <Link to="/messages" className="quick-action" style={{ justifyContent: 'flex-start' }}>
                  <span>💬</span> Send Message
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
