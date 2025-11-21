// import React from 'react'
import { useAuth } from "../context/AuthContext"



function HomePage() {
  const {authUser} = useAuth()
  return (
    <div>HomePage: {authUser?.name}</div>
  )
}

export default HomePage