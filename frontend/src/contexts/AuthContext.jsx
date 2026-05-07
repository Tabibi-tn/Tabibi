import { createContext, useState, useEffect } from 'react'
import api from '../api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem('tabibi_user')
    if (raw) {
      try {
        const userData = JSON.parse(raw)
        setUser(userData)
        if (userData.role === 'doctor') {
          fetchDoctorProfile().finally(() => setAuthLoading(false))
          return
        }
      } catch {
        localStorage.removeItem('tabibi_user')
        localStorage.removeItem('tabibi_token')
      }
    }
    setAuthLoading(false)
  }, [])

  async function fetchDoctorProfile() {
    try {
      const res = await api.get('/doctors/me')
      setDoctorProfile(res.data)
    } catch (err) {
      console.error('Failed to fetch doctor profile:', err)
    }
  }

  const login = async (token, userData) => {
    localStorage.setItem('tabibi_token', token)
    localStorage.setItem('tabibi_user', JSON.stringify(userData))
    setUser(userData)
    if (userData.role === 'doctor') {
      await fetchDoctorProfile()
    }
  }

  const logout = () => {
    localStorage.removeItem('tabibi_token')
    localStorage.removeItem('tabibi_user')
    setUser(null)
    setDoctorProfile(null)
  }

  const needsProfileCompletion = () => {
    if (!user || user.role !== 'doctor') return false
    if (user.doctorStatus === 'needs_profile') return true
    if (!doctorProfile) return false
    return !doctorProfile.specialtyId || !doctorProfile.licenseNumber || !doctorProfile.diplomaUrl || !doctorProfile.licenseDocUrl
  }

  return (
    <AuthContext.Provider value={{ user, setUser, doctorProfile, authLoading, login, logout, needsProfileCompletion, fetchDoctorProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
