import { useState, useEffect, useContext } from 'react'
import api from '../api'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function ConsultationEditor() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const appointmentIdParam = searchParams.get('appointmentId')
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const { toast } = useToast()
  const [consult, setConsult] = useState({ diagnosis: '', prescription: '', notes: '', fileUrl: '', appointmentId: appointmentIdParam ? parseInt(appointmentIdParam) : null })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (id) load() }, [id])

  async function load() {
    try {
      const res = await api.get(`/consultations/${id}`)
      setConsult(res.data)
    } catch (err) {
      setError('Failed to load consultation')
    } finally {
      setLoading(false)
    }
  }

  async function uploadFile() {
    if (!file) return null
    const fd = new FormData()
    fd.append('file', file)
    const r = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    return r.data.fileUrl
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let fileUrl = consult.fileUrl
      if (file) fileUrl = await uploadFile()
      const payload = {
        diagnosis: consult.diagnosis,
        prescription: consult.prescription,
        notes: consult.notes,
        fileUrl,
        appointmentId: consult.appointmentId
      }
      if (id) {
        // Editing an existing consultation by its consultation ID
        await api.put(`/consultations/${id}`, payload)
      } else if (user?.role === 'patient') {
        // Patients use the upsert endpoint (creates or updates notes for an appointment)
        await api.post('/consultations/patient-note', payload)
      } else {
        // Doctors create a new consultation record
        await api.post('/consultations', payload)
      }
      toast(id ? 'Consultation updated' : 'Consultation saved', 'success')
      navigate('/appointments')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save consultation. Please try again.'
      setError(msg)
      toast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="text-center" style={{ padding: '4rem 0' }}>
            <div className="spinner"></div>
            <p style={{ color: 'var(--gray-500)' }}>Loading consultation...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">{id ? 'Edit' : 'New'} Consultation</h1>
          <p className="page-subtitle">Document the patient consultation details</p>
        </div>

        <div className="consultation-form">
          {error && (
            <div style={{
              padding: '1rem',
              background: '#fee2e2',
              color: 'var(--error)',
              borderRadius: 'var(--radius)',
              marginBottom: '1.5rem',
              border: '1px solid #fca5a5'
            }}>
              ⚠️ {error}
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{id ? 'Update' : 'Create'} Consultation Notes</h3>
              <p className="card-subtitle">Fill in the consultation details below</p>
            </div>
            <div className="card-body">
              <form onSubmit={submit}>
                <div className="form-group">
                  <label className="form-label">Diagnosis</label>
                  <textarea
                    className="form-textarea"
                    value={consult.diagnosis}
                    onChange={e => setConsult({ ...consult, diagnosis: e.target.value })}
                    placeholder="Enter diagnosis details..."
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Prescription</label>
                  <textarea
                    className="form-textarea"
                    value={consult.prescription}
                    onChange={e => setConsult({ ...consult, prescription: e.target.value })}
                    placeholder="List medications, dosages, and instructions..."
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Notes</label>
                  <textarea
                    className="form-textarea"
                    value={consult.notes}
                    onChange={e => setConsult({ ...consult, notes: e.target.value })}
                    placeholder="Any follow-up instructions, referrals, or observations..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Attach Document (Optional)</label>
                  <div
                    className="file-upload"
                    onClick={() => document.getElementById('consult-file').click()}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📎</div>
                    <p style={{ color: 'var(--gray-600)', fontWeight: 500, marginBottom: '0.25rem' }}>
                      {file ? file.name : 'Click to upload a file'}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: 0 }}>
                      PDF, JPG, PNG — max 10 MB
                    </p>
                  </div>
                  <input
                    id="consult-file"
                    type="file"
                    style={{ display: 'none' }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setFile(e.target.files[0])}
                  />
                  {consult.fileUrl && !file && (
                    <p className="form-hint">
                      Current file: <a href={consult.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (
                      <><span className="spinner-small"></span> Saving...</>
                    ) : (
                      id ? 'Update Consultation' : 'Save Consultation'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
