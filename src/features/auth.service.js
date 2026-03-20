import axios from 'axios'
import { API_URL } from '../base'
import { getConfig } from '../axiosConfig'

const login = async (auth) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, auth, {
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
    const response = await axios.get(`${API_URL}/auth/user`, getConfig())
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
    const response = await axios.post(`${API_URL}/auth/logout`, {}, getConfig())
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
