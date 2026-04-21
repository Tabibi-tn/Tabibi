import React, { createContext, useState, useEffect } from 'react'
import api from '../api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [doctorProfile, setDoctorProfile] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem('tabibi_user')
    if (raw) {
      const userData = JSON.parse(raw)
      setUser(userData)
      if (userData.role === 'doctor') {
        fetchDoctorProfile()
      }
    }
  }, [])

  async function fetchDoctorProfile() {
    try {
      const res = await api.get('/doctors/me')
      setDoctorProfile(res.data)
    } catch (err) {
      console.error('Failed to fetch doctor profile:', err)
    }
  }

  const login = async (token, user) => {
    localStorage.setItem('tabibi_token', token)
    localStorage.setItem('tabibi_user', JSON.stringify(user))
    setUser(user)
    if (user.role === 'doctor') {
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
    // If doctorStatus is 'needs_profile', they need to complete profile
    if (user.doctorStatus === 'needs_profile') return true
    // If no doctor profile exists, they need to complete profile
    if (!doctorProfile) return true
    // Check if required fields are missing
    return !doctorProfile.specialtyId || !doctorProfile.licenseNumber || !doctorProfile.diplomaUrl || !doctorProfile.licenseDocUrl
  }

  return (
    <AuthContext.Provider value={{ user, doctorProfile, login, logout, needsProfileCompletion }}>
      {children}
    </AuthContext.Provider>
  )
}
