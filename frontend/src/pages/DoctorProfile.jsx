import { useState, useEffect, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import { AuthContext } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function DoctorProfile() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const { toast } = useToast()
  const [doctor, setDoctor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetchDoctor()
    fetchReviews()
    fetchAvailability()
  }, [id])

  const fetchDoctor = async () => {
    try {
      const res = await api.get(`/doctors/${id}`)
      setDoctor(res.data)
    } catch (err) {
      setError('Failed to load doctor information')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/doctor/${id}`)
      setReviews(res.data)
    } catch {
      // non-critical
    }
  }

  const fetchAvailability = async () => {
    try {
      const res = await api.get(`/doctors/${id}/availability`)
      setAvailability(res.data || [])
    } catch {
      // non-critical
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!user) { toast('Please login to leave a review', 'info'); return }
    if (user.role !== 'patient') { toast('Only patients can leave reviews', 'warning'); return }
    setSubmittingReview(true)
    try {
      await api.post('/reviews', { doctorId: id, rating: reviewForm.rating, comment: reviewForm.comment })
      toast('Review submitted successfully!', 'success')
      setReviewForm({ rating: 5, comment: '' })
      fetchReviews()
      fetchDoctor()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to submit review', 'error')
    } finally {
      setSubmittingReview(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'DR'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const renderStars = (rating, interactive = false, onChange) => {
    return (
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            style={{
              color: star <= Math.round(rating || 0) ? '#f59e0b' : '#e5e7eb',
              fontSize: interactive ? '1.5rem' : '0.9375rem',
              cursor: interactive ? 'pointer' : 'default',
              lineHeight: 1
            }}
            onClick={() => interactive && onChange && onChange(star)}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="text-center" style={{ padding: '4rem 0' }}>
            <div className="spinner"></div>
            <p style={{ color: 'var(--gray-500)' }}>Loading doctor profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <div className="page">
        <div className="container">
          <Link to="/doctors" className="btn btn-ghost" style={{ marginBottom: '1.5rem' }}>
            ← Back to Doctors
          </Link>
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3>Doctor Not Found</h3>
            <p style={{ color: 'var(--gray-500)' }}>{error || 'This profile is not available.'}</p>
          </div>
        </div>
      </div>
    )
  }

  const doctorName = doctor.User?.name || 'Doctor'
  const doctorUserId = doctor.userId || doctor.User?.id
  const avgRating = doctor.averageRating ?? doctor.rating
  const reviewCount = doctor.reviewCount ?? reviews.length

  return (
    <div className="page">
      <div className="container">
        <Link to="/doctors" className="btn btn-ghost" style={{ marginBottom: '1.5rem' }}>
          ← Back to Doctors
        </Link>

        <div className="doctor-profile-grid">

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>

            {/* Profile Header Card */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="doctor-avatar" style={{ width: 100, height: 100, fontSize: '2.5rem', flexShrink: 0, borderRadius: 'var(--radius-xl)' }}>
                  {getInitials(doctorName)}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h1 style={{ marginBottom: '0.375rem', fontSize: '1.75rem' }}>Dr. {doctorName}</h1>
                  {doctor.Specialty && (
                    <span className="doctor-specialty" style={{ fontSize: '0.9375rem' }}>
                      🏥 {doctor.Specialty.name}
                    </span>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.75rem' }}>
                    {doctor.experience && (
                      <span className="doctor-detail">💼 {doctor.experience} years experience</span>
                    )}
                    {avgRating != null && (
                      <span className="doctor-rating">
                        ⭐ {parseFloat(avgRating).toFixed(1)}
                        <span style={{ color: 'var(--gray-400)', fontSize: '0.8125rem', marginLeft: 4 }}>
                          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                        </span>
                      </span>
                    )}
                    {doctor.fee && (
                      <span className="doctor-fee">TND {doctor.fee}</span>
                    )}
                  </div>
                  {doctor.clinicAddress && (
                    <p style={{ marginTop: '0.5rem', color: 'var(--gray-500)', fontSize: '0.9375rem', marginBottom: 0 }}>
                      📍 {doctor.clinicAddress}
                    </p>
                  )}
                </div>
              </div>

              {doctor.bio && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-100)' }}>
                  <h3 style={{ marginBottom: '0.75rem', fontSize: '1.125rem' }}>About</h3>
                  <p style={{ color: 'var(--gray-600)', lineHeight: 1.75, marginBottom: 0 }}>{doctor.bio}</p>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem' }}>
                Patient Reviews
                {reviewCount > 0 && (
                  <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--gray-500)', marginLeft: 8 }}>
                    ({reviewCount} total)
                  </span>
                )}
              </h3>

              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⭐</div>
                  <p style={{ marginBottom: 0 }}>No reviews yet — be the first!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map((review, i) => (
                    <div key={i} style={{
                      padding: '1rem',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius)',
                      borderLeft: '3px solid var(--primary)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong style={{ color: 'var(--gray-800)' }}>
                          {review.patientName || review.Patient?.User?.name || 'Patient'}
                        </strong>
                        {renderStars(review.rating)}
                      </div>
                      {review.comment && (
                        <p style={{ color: 'var(--gray-600)', margin: 0, fontSize: '0.9375rem' }}>
                          {review.comment}
                        </p>
                      )}
                      {review.createdAt && (
                        <p style={{ color: 'var(--gray-400)', fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0 }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Review Form for patients */}
              {user?.role === 'patient' && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-100)' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Leave a Review</h4>
                  <form onSubmit={submitReview}>
                    <div className="form-group">
                      <label className="form-label">Rating</label>
                      {renderStars(reviewForm.rating, true, (star) => setReviewForm(f => ({ ...f, rating: star })))}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Comment (Optional)</label>
                      <textarea
                        className="form-textarea"
                        value={reviewForm.comment}
                        onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                        placeholder="Share your experience..."
                        rows={3}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Booking Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Book Appointment</h3>
              {doctor.fee && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'var(--gray-50)',
                  borderRadius: 'var(--radius)',
                  marginBottom: '1rem'
                }}>
                  <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Consultation Fee</span>
                  <span className="doctor-fee">TND {doctor.fee}</span>
                </div>
              )}
              <Link
                to={`/doctors/${id}/book`}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                📅 Book Appointment
              </Link>
              {user && doctorUserId && (
                <Link
                  to={`/messages/${doctorUserId}`}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                >
                  💬 Send Message
                </Link>
              )}
            </div>

            {/* Info Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Practice Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {doctor.Specialty && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Specialty</span>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{doctor.Specialty.name}</span>
                  </div>
                )}
                {doctor.experience && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Experience</span>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{doctor.experience} years</span>
                  </div>
                )}
                {doctor.licenseNumber && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>License</span>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{doctor.licenseNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Availability Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Availability</h3>
              {availability.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {availability.slice(0, 5).map((slot, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius)',
                      background: 'var(--primary-50)'
                    }}>
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                        {slot.title || new Date(slot.start || slot.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--primary-dark)' }}>
                        Available
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { day: 'Mon – Fri', hours: '9:00 AM – 5:00 PM', available: true },
                    { day: 'Saturday', hours: '9:00 AM – 1:00 PM', available: true },
                    { day: 'Sunday', hours: 'Closed', available: false },
                  ].map(({ day, hours, available }) => (
                    <div key={day} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius)',
                      background: available ? 'var(--primary-50)' : 'var(--gray-50)'
                    }}>
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{day}</span>
                      <span style={{ fontSize: '0.8125rem', color: available ? 'var(--primary-dark)' : 'var(--gray-400)' }}>
                        {hours}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.75rem', marginBottom: 0 }}>
                * Verify actual slots when booking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
