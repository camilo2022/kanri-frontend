import api from '../API/api'
import { getConfig } from '../axiosConfig'

const login = async (auth) => {
  try {
    const response = await api.post(`/auth/login`, auth, {
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const user = async () => {
  try {
    const response = await api.get(`/auth/user`, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const logout = async () => {
  try {
    const response = await api.post(`/auth/logout`, {}, getConfig())
    localStorage.removeItem('token')
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const AuthService = {
  login,
  user,
  logout,
}

export default AuthService
