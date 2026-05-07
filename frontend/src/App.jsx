import { useContext, useState, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { AuthProvider, AuthContext } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Doctors from './pages/Doctors'
import DoctorProfile from './pages/DoctorProfile'
import Book from './pages/Book'
import Appointments from './pages/Appointments'
import Messages from './pages/Messages'
import Availability from './pages/Availability'
import ConsultationEditor from './pages/ConsultationEditor'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'
import DoctorCompleteProfile from './pages/DoctorCompleteProfile'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <Topbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
        <Route path="/doctors/:id" element={<ProtectedRoute><DoctorProfile /></ProtectedRoute>} />
        <Route path="/doctors/:id/book" element={<ProtectedRoute><Book /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/messages/:userId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/availability" element={<ProtectedRoute><Availability /></ProtectedRoute>} />
        <Route path="/consultations/edit/:id" element={<ProtectedRoute><ConsultationEditor /></ProtectedRoute>} />
        <Route path="/consultations/new" element={<ProtectedRoute><ConsultationEditor /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/doctor-complete-profile" element={<ProtectedRoute roles={['doctor']}><DoctorCompleteProfile /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}

function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      <nav className="topbar">
        <div className="topbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NavLink to="/" className="brand">
              <span className="brand-icon">🏥</span>
              Tabibi
            </NavLink>
            <Navigation />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AuthMenu />
            <button
              className="hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
          </div>
        </div>
      </nav>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}

function Navigation() {
  const { user } = useContext(AuthContext)
  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

  if (!user) return (
    <div className="nav-links">
      <NavLink to="/doctors" className={linkClass}>Find Doctors</NavLink>
    </div>
  )

  const isDoctor = user.role === 'doctor'
  const isAdmin = user.role === 'admin'
  const isPatient = user.role === 'patient'

  return (
    <div className="nav-links">
      {isPatient && (
        <>
          <NavLink to="/doctors" className={linkClass}>Find Doctors</NavLink>
          <NavLink to="/appointments" className={linkClass}>Appointments</NavLink>
        </>
      )}
      {(isDoctor || isAdmin) && (
        <NavLink to="/appointments" className={linkClass}>Appointments</NavLink>
      )}
      {isDoctor && (
        <NavLink to="/availability" className={linkClass}>Calendar</NavLink>
      )}
      <NavLink to="/messages" className={linkClass}>Messages</NavLink>
      {isAdmin && (
        <NavLink to="/admin" className={linkClass}>Admin</NavLink>
      )}
    </div>
  )
}

function AuthMenu() {
  const { user, logout } = useContext(AuthContext)

  if (!user) return (
    <div className="nav-right">
      <NavLink to="/login" className="btn btn-ghost">Login</NavLink>
      <NavLink to="/register" className="btn btn-primary">Register</NavLink>
    </div>
  )

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="user-menu">
      <NavLink to="/profile" className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="user-avatar">{getInitials(user.name)}</div>
        <span className="user-name">{user.name || user.email}</span>
      </NavLink>
      <button className="btn btn-ghost btn-sm" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

function MobileNav({ open, onClose }) {
  const { user, logout } = useContext(AuthContext)
  const linkClass = ({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <div className={`mobile-nav${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="mobile-nav-backdrop" onClick={onClose} />
      <div className="mobile-nav-drawer">
        <div className="mobile-nav-header">
          <NavLink to="/" className="brand" onClick={onClose} style={{ fontSize: '1.25rem' }}>
            <span>🏥</span> Tabibi
          </NavLink>
          <button className="mobile-nav-close" onClick={onClose} aria-label="Close menu">×</button>
        </div>

        {!user ? (
          <>
            <NavLink to="/doctors" className={linkClass} onClick={onClose}>🔍 Find Doctors</NavLink>
            <hr className="mobile-nav-divider" />
            <NavLink to="/login" className={linkClass} onClick={onClose}>🔑 Login</NavLink>
            <NavLink to="/register" className="btn btn-primary" style={{ marginTop: 8, justifyContent: 'center' }} onClick={onClose}>
              Register
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className={linkClass} onClick={onClose}>🏠 Dashboard</NavLink>

            {user.role === 'patient' && (
              <>
                <NavLink to="/doctors" className={linkClass} onClick={onClose}>🔍 Find Doctors</NavLink>
                <NavLink to="/appointments" className={linkClass} onClick={onClose}>📅 Appointments</NavLink>
              </>
            )}
            {(user.role === 'doctor' || user.role === 'admin') && (
              <NavLink to="/appointments" className={linkClass} onClick={onClose}>📅 Appointments</NavLink>
            )}
            {user.role === 'doctor' && (
              <NavLink to="/availability" className={linkClass} onClick={onClose}>📆 Calendar</NavLink>
            )}
            <NavLink to="/messages" className={linkClass} onClick={onClose}>💬 Messages</NavLink>
            {user.role === 'admin' && (
              <NavLink to="/admin" className={linkClass} onClick={onClose}>⚙️ Admin</NavLink>
            )}

            <hr className="mobile-nav-divider" />
            <NavLink to="/profile" className={linkClass} onClick={onClose}>👤 Profile</NavLink>
            <button
              className="mobile-nav-link"
              style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', color: 'var(--error)' }}
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </>
        )}
      </div>
    </div>
  )
}
