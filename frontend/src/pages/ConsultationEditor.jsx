import React, { useState, useEffect, useContext } from 'react'
import api from '../api'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

export default function ConsultationEditor(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [consult, setConsult] = useState({ diagnosis:'', prescription:'', notes:'', fileUrl:'', appointmentId: null })
  const [file, setFile] = useState(null)

  useEffect(()=>{ if (id) load() },[id])
  async function load(){
    const res = await api.get(`/consultations`)
    const item = res.data.find(c => String(c.id) === String(id))
    if (item) setConsult(item)
  }

  async function uploadFile() {
    if (!file) return null
    const fd = new FormData()
    fd.append('file', file)
    const r = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    return r.data.fileUrl
  }

  async function submit(e){
    e.preventDefault()
    try {
      let fileUrl = consult.fileUrl
      if (file) fileUrl = await uploadFile()
      const payload = { diagnosis: consult.diagnosis, prescription: consult.prescription, notes: consult.notes, fileUrl, appointmentId: consult.appointmentId }
      if (id) {
        await api.put(`/consultations/${id}`, payload)
      } else {
        await api.post('/consultations', payload)
      }
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Failed to save consultation')
    }
  }

  return (
    <div className="page">
      <h3>{id? 'Edit':'Create'} Consultation</h3>
      <form onSubmit={submit}>
        <textarea value={consult.diagnosis} onChange={e=>setConsult({...consult, diagnosis:e.target.value})} placeholder="Diagnosis" />
        <textarea value={consult.prescription} onChange={e=>setConsult({...consult, prescription:e.target.value})} placeholder="Prescription" />
        <textarea value={consult.notes} onChange={e=>setConsult({...consult, notes:e.target.value})} placeholder="Notes" />
        <input type="file" onChange={e=>setFile(e.target.files[0])} />
        <input value={consult.fileUrl} onChange={e=>setConsult({...consult, fileUrl:e.target.value})} placeholder="File URL (uploaded)" />
        <button>{id? 'Update':'Create'}</button>
      </form>
    </div>
  )
}