import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  const [valid, setValid] = useState(null)

  useEffect(() => {
    const checkToken = async () => {
      try {
        await AuthService.user()
        setValid(true)
      } catch (err) {
        setValid(false)
      }
    }
    checkToken()
  }, [])

  if (!token && !valid) {
    return <Navigate to="/" />
  }

  return children
}

export default PrivateRoute
