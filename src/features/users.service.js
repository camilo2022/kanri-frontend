import axios from 'axios'
import { API_URL } from '../base'
import { getConfig } from '../axiosConfig'

const all = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/users/all`, {
      ...getConfig(),
      params: params,
    })
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const store = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/users/store`, data, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const update = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/users/update/${id}`, data, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const find = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/users/find/${id}`, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const delete_user = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/users/delete/${id}`, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const restore = async (id) => {
  try {
    const response = await axios.patch(`${API_URL}/users/restore/${id}`, {}, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const assign = async (id, permission_id) => {
  try {
    const response = await axios.post(
      `${API_URL}/users/authorization/assign/${id}`,
      { permission_id },
      getConfig(),
    )
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const remove = async (id, permission_id) => {
  try {
    const response = await axios.post(
      `${API_URL}/users/authorization/remove/${id}`,
      { permission_id },
      getConfig(),
    )
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const UserService = {
  all,
  store,
  update,
  find,
  assign,
  remove,
  delete_user,
  restore,
}

export default UserService
