import React from 'react'
import { Route, Routes } from 'react-router-dom'

const App = () => {
  return (
    <>
      <div className='text-3xl font-bold text-center mt-10'>Welcome to GIGFLOW</div>
      <Routes>
        <Route path='/' element={<div className='text-center mt-5'>Home Page</div>} />
        <Route path='/about' element={<div className='text-center mt-5'>About Page</div>} />
      </Routes>
    </>
  )
}

export default App