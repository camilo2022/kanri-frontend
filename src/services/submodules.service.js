import axios from 'axios'
import { API_URL } from '../base'
import api from '../API/api'
import { getConfig } from '../axiosConfig'

const all = async (module_id, params) => {
  try {
    const response = await api.get(`/navegation/modules/submodules/all/${module_id}`, {
      ...getConfig(),
      params: params,
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Error desconocido' }
  }
}
const store = async (data) => {
  try {
    const response = await axios.post(
      `${API_URL}/navegation/modules/submodules/store`,
      data,
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

const update = async (id, data) => {
  try {
    const response = await axios.put(
      `${API_URL}/navegation/modules/submodules/update/${id}`,
      data,
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

const find = async (id) => {
  try {
    const response = await axios.get(
      `${API_URL}/navegation/modules/submodules/find/${id}`,
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

const destroy = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/navegation/modules/submodules/delete/${id}`,
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

const restore = async (id) => {
  try {
    const response = await axios.patch(
      `${API_URL}/navegation/modules/submodules/restore/${id}`,
      {},
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

const SubmoduleService = {
  all,
  store,
  update,
  find,
  destroy,
  restore,
}

export default SubmoduleService
