    import React from 'react'
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
    import Home from '../pages/Home'
    import Register from '../pages/Register'
    import Login from '../pages/Login'
    import DoctorProfile from '../pages/DoctorProfile'
    import Doctors from '../pages/Doctors'


    function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/drprofile" element={<DoctorProfile/>} />
        <Route path="/doctors" element={<Doctors/>} />

      </Routes>
  )
}

export default App