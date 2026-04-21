import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function DoctorCard({ d }) {
  return (
    <div className="doctor-card card" style={{
      padding: '1rem',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      marginBottom: '1rem',
      background: '#fff'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0 }}>{d.name}</h4>
          <div className="muted small" style={{ color: '#666', fontSize: '0.875rem' }}>
            {d.specialty || 'General'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="muted small" style={{ color: '#888', fontSize: '0.75rem' }}>Fee</div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{d.fee ? `TND ${d.fee}` : 'TBD'}</div>
        </div>
      </div>

      <div style={{ height: 10 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to={`/doctors/${d.id}/book`} className="btn" style={{ padding: '6px 12px', background: '#007bff', color: '#fff', borderRadius: 4, textDecoration: 'none' }}>
          Book
        </Link>
        <Link to={`/doctors/${d.id}`} className="muted small" style={{ color: '#666', fontSize: '0.875rem', textDecoration: 'underline' }}>
          View profile
        </Link>
      </div>
    </div>
  );
}

export default function Doctors() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const doctors = [
    { id: 1, name: 'Dr. Maram Mihoub', specialty: 'Cardiology', fee: 90 },
    { id: 2, name: 'Dr. Yasmine Kalai', specialty: 'Neurology', fee: 120 },
    { id: 3, name: 'Dr. Lilia Charfi', specialty: 'Radiology', fee: 80 },
    { id: 4, name: 'Dr. Ahmed Ben Ali', specialty: 'Dermatology', fee: 70 },
    { id: 5, name: 'Dr. Karim Ben Salem', specialty: 'Orthopedics', fee: 110 },
    { id: 6, name: 'Dr. Ines Jaziri', specialty: 'Pediatrics', fee: 85 }
  ];

  const doctorsPerPage = 3;
  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / doctorsPerPage);
  const start = (page - 1) * doctorsPerPage;
  const visibleDoctors = filtered.slice(start, start + doctorsPerPage);

  return (
    <div className="container" style={{ maxWidth: 700, margin: '3rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0 }}>Doctors</h3>
        <input
          placeholder="Search doctor or specialty"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #ddd',
            width: 220
          }}
        />
      </div>

      <div>
        {visibleDoctors.length === 0 && <div className="muted" style={{ color: '#888', textAlign: 'center' }}>No doctors found</div>}
        {visibleDoctors.map(d => <DoctorCard key={d.id} d={d} />)}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
          <button
            className="btn ghost"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ddd', background: '#f8f9fa' }}
          >
            Prev
          </button>
          <span className="muted" style={{ color: '#666' }}>Page {page} / {totalPages}</span>
          <button
            className="btn ghost"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ddd', background: '#f8f9fa' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
