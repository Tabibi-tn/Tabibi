import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

function DoctorCard({ d }) {
  const getInitials = (name) => {
    if (!name) return 'DR'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="card doctor-card">
      <div className="doctor-card-header">
        <div className="doctor-avatar">
          {getInitials(d.User?.name || 'Doctor')}
        </div>
        <div className="doctor-info">
          <h3 className="doctor-name">Dr. {d.User?.name || 'Doctor'}</h3>
          {d.Specialty && (
            <span className="doctor-specialty">🏥 {d.Specialty.name}</span>
          )}
          {d.rating != null && (
            <div className="doctor-rating" style={{ marginTop: '0.25rem' }}>
              <span>⭐</span>
              <span style={{ fontWeight: 500 }}>{parseFloat(d.rating).toFixed(1)}</span>
              {d.reviewCount > 0 && (
                <span style={{ color: 'var(--gray-400)', fontSize: '0.8125rem' }}>
                  ({d.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="doctor-details">
        {d.experience && (
          <span className="doctor-detail">💼 {d.experience} yrs exp.</span>
        )}
        {d.clinicAddress && (
          <span className="doctor-detail" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📍 {d.clinicAddress}
          </span>
        )}
        {d.fee && (
          <span className="doctor-fee">TND {d.fee}</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <Link
          to={`/doctors/${d.id}/book`}
          className="btn btn-primary btn-sm"
          style={{ flex: 1, justifyContent: 'center' }}
        >
          Book Appointment
        </Link>
        <Link to={`/doctors/${d.id}`} className="btn btn-secondary btn-sm">
          Profile
        </Link>
      </div>
    </div>
  )
}

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [search, setSearch] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDoctors()
    fetchSpecialties()
  }, [])

  const fetchDoctors = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/doctors')
      // backend returns array directly (new) or { doctors: [] } (legacy)
      setDoctors(Array.isArray(res.data) ? res.data : (res.data.doctors ?? []))
    } catch (err) {
      setError('Failed to load doctors. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSpecialties = async () => {
    try {
      const res = await api.get('/specialties')
      setSpecialties(res.data)
    } catch (err) {
      console.error('Failed to load specialties:', err)
    }
  }

  const doctorsPerPage = 6
  const filtered = doctors.filter(d => {
    const name = (d.User?.name || '').toLowerCase()
    const specialty = (d.Specialty?.name || '').toLowerCase()
    const matchesSearch = name.includes(search.toLowerCase()) || specialty.includes(search.toLowerCase())
    const matchesSpecialty = !specialtyFilter || d.Specialty?.name === specialtyFilter
    return matchesSearch && matchesSpecialty
  })
  const totalPages = Math.ceil(filtered.length / doctorsPerPage)
  const start = (page - 1) * doctorsPerPage
  const visible = filtered.slice(start, start + doctorsPerPage)

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Find a Doctor</h1>
          <p className="page-subtitle">Browse our network of qualified healthcare professionals</p>
        </div>

        {/* Search & Filter */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="search-input-wrapper" style={{ flex: 1, minWidth: 200 }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="form-input search-input"
                placeholder="Search by name or specialty..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <select
              className="form-select"
              style={{ width: 200 }}
              value={specialtyFilter}
              onChange={e => { setSpecialtyFilter(e.target.value); setPage(1) }}
            >
              <option value="">All Specialties</option>
              {specialties.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="spinner"></div>
            <p style={{ color: 'var(--gray-500)' }}>Loading doctors...</p>
          </div>
        ) : error ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3>Something went wrong</h3>
            <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>{error}</p>
            <button className="btn btn-primary" onClick={fetchDoctors}>Try Again</button>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
            </p>

            {filtered.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <h3>No Doctors Found</h3>
                <p style={{ color: 'var(--gray-500)' }}>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-auto">
                {visible.map(d => <DoctorCard key={d.id} d={d} />)}
              </div>
            )}

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
