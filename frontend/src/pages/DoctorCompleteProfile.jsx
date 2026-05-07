import { useState, useEffect, useContext } from 'react'
import api from '../api'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'

export default function DoctorCompleteProfile(){
  const { user } = useContext(AuthContext)
  const { toast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [specialties, setSpecialties] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    specialtyId: '',
    experience: '',
    clinicAddress: '',
    fee: '',
    licenseNumber: '',
    bio: '',
    diplomaUrl: '',
    licenseDocUrl: ''
  })

  useEffect(() => {
    loadSpecialties()
    loadCurrentProfile()
  }, [])

  async function loadSpecialties(){
    try {
      const res = await api.get('/specialties')
      setSpecialties(res.data)
    } catch (err) {
      console.error('Failed to load specialties:', err)
    }
  }

  async function loadCurrentProfile(){
    try {
      const res = await api.get('/doctors/me')
      const doctor = res.data
      if (doctor.specialtyId) setFormData(prev => ({ ...prev, specialtyId: doctor.specialtyId }))
      if (doctor.experience) setFormData(prev => ({ ...prev, experience: doctor.experience }))
      if (doctor.clinicAddress) setFormData(prev => ({ ...prev, clinicAddress: doctor.clinicAddress }))
      if (doctor.fee) setFormData(prev => ({ ...prev, fee: doctor.fee }))
      if (doctor.licenseNumber) setFormData(prev => ({ ...prev, licenseNumber: doctor.licenseNumber }))
      if (doctor.bio) setFormData(prev => ({ ...prev, bio: doctor.bio }))
      if (doctor.diplomaUrl) setFormData(prev => ({ ...prev, diplomaUrl: doctor.diplomaUrl }))
      if (doctor.licenseDocUrl) setFormData(prev => ({ ...prev, licenseDocUrl: doctor.licenseDocUrl }))
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
  }

  async function handleFileUpload(e, fieldName) {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('documentType', fieldName)
      
      const res = await api.post('/doctors/me/upload-document', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const fieldKey = fieldName === 'diploma' ? 'diplomaUrl' : fieldName === 'license' ? 'licenseDocUrl' : fieldName
      setFormData(prev => ({ ...prev, [fieldKey]: res.data.fileUrl }))
      setError('')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload file'
      setError(msg)
      toast(msg, 'error')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    
    // Validation
    if (!formData.specialtyId) { setError('Please select a specialty'); return }
    if (!formData.licenseNumber) { setError('Please enter your license number'); return }
    if (!formData.diplomaUrl) { setError('Please upload your diploma'); return }
    if (!formData.licenseDocUrl) { setError('Please upload your medical license document'); return }
    
    setLoading(true)
    try {
      await api.post('/doctors/me/complete-profile', formData)
      setSuccess(true)
      toast('Profile submitted for review!', 'success')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile'
      setError(msg)
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="page-header">
          <h1 className="page-title">Complete Your Profile</h1>
          <p className="page-subtitle">Please provide your professional information and documents for admin review</p>
        </div>

        {success && (
          <div className="card" style={{ background: '#d4edda', borderColor: '#c3e6cb', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', color: '#155724', textAlign: 'center' }}>
              <h3>✅ Profile Submitted Successfully!</h3>
              <p>Your profile is now pending admin approval. You will be notified once approved.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="form-error" style={{ marginBottom: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card">
          <div className="card-header">
            <h3 className="card-title">Professional Information</h3>
          </div>
          
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Specialty */}
            <div className="form-group">
              <label htmlFor="specialtyId">Specialty *</label>
              <select 
                id="specialtyId"
                className="form-input"
                value={formData.specialtyId}
                onChange={e => setFormData(prev => ({ ...prev, specialtyId: e.target.value }))}
              >
                <option value="">Select a specialty</option>
                {specialties.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* License Number */}
            <div className="form-group">
              <label htmlFor="licenseNumber">Medical License Number *</label>
              <input 
                id="licenseNumber"
                type="text"
                className="form-input"
                placeholder="Enter your medical license number"
                value={formData.licenseNumber}
                onChange={e => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
              />
            </div>

            {/* Experience */}
            <div className="form-group">
              <label htmlFor="experience">Years of Experience</label>
              <input 
                id="experience"
                type="number"
                className="form-input"
                placeholder="Enter years of experience"
                value={formData.experience}
                onChange={e => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              />
            </div>

            {/* Clinic Address */}
            <div className="form-group">
              <label htmlFor="clinicAddress">Clinic Address</label>
              <input 
                id="clinicAddress"
                type="text"
                className="form-input"
                placeholder="Enter your clinic address"
                value={formData.clinicAddress}
                onChange={e => setFormData(prev => ({ ...prev, clinicAddress: e.target.value }))}
              />
            </div>

            {/* Fee */}
            <div className="form-group">
              <label htmlFor="fee">Consultation Fee (TND)</label>
              <input 
                id="fee"
                type="number"
                className="form-input"
                placeholder="Enter consultation fee"
                value={formData.fee}
                onChange={e => setFormData(prev => ({ ...prev, fee: e.target.value }))}
              />
            </div>

            {/* Bio */}
            <div className="form-group">
              <label htmlFor="bio">Professional Bio</label>
              <textarea 
                id="bio"
                className="form-input"
                rows={4}
                placeholder="Tell patients about your experience and expertise..."
                value={formData.bio}
                onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>
          </div>

          <div className="card-header" style={{ borderTop: '1px solid var(--gray-200)', marginTop: '1rem' }}>
            <h3 className="card-title">Documents *</h3>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Diploma Upload */}
            <div className="form-group">
              <label>Diploma/Certificate *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <input 
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => handleFileUpload(e, 'diploma')}
                  disabled={uploading}
                  style={{ flex: 1 }}
                />
                {formData.diplomaUrl && (
                  <span style={{ color: 'green', fontSize: '1.5rem' }}>✅</span>
                )}
              </div>
              {uploading && <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>Uploading...</p>}
              {formData.diplomaUrl && (
                <p style={{ color: 'green', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  ✅ Diploma uploaded: <a href={formData.diplomaUrl} target="_blank" rel="noopener noreferrer">View</a>
                </p>
              )}
            </div>

            {/* License Document Upload */}
            <div className="form-group">
              <label>Medical License Document *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <input 
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => handleFileUpload(e, 'license')}
                  disabled={uploading}
                  style={{ flex: 1 }}
                />
                {formData.licenseDocUrl && (
                  <span style={{ color: 'green', fontSize: '1.5rem' }}>✅</span>
                )}
              </div>
              {formData.licenseDocUrl && (
                <p style={{ color: 'green', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  ✅ License uploaded: <a href={formData.licenseDocUrl} target="_blank" rel="noopener noreferrer">View</a>
                </p>
              )}
            </div>
          </div>

          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--gray-200)' }}>
            <button 
              type="submit" 
              className="btn btn-primary btn-lg btn-block"
              disabled={loading || uploading}
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              Your profile will be reviewed by an administrator before approval.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}