// import React from 'react'

import { useNavigate } from "react-router-dom"

const NotFound = () => {
  const navigate = useNavigate()
  // const goBack = ()=>{
  //   if(window.history.state && window.history.state.idx > 0) navigate(-1)
  //   else navigate('/',{ replace: true })
  // }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-gray-600 mb-6">
          Page not found
        </p>
        <button
          onClick={()=>navigate(-1)}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

export default NotFound