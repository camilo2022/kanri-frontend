import api from '../API/api'
import { getConfig } from '../axiosConfig'

const all = async (params) => {
  try {
    const response = await api.get(`/waistband_types/all`, {
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
    const response = await api.post(`/waistband_types/store`, data, getConfig())
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
    const response = await api.put(`/waistband_types/update/${id}`, data, getConfig())
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
    const response = await api.get(`/waistband_types/find/${id}`, getConfig())
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
    const response = await api.delete(`/waistband_types/delete/${id}`, getConfig())
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
    const response = await api.patch(`/waistband_types/restore/${id}`, {}, getConfig())
    return response.data
  } catch (error) {
    console.log(error)
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const WaistbandTypesService = {
  all,
  store,
  update,
  find,
  destroy,
  restore,
}

export default WaistbandTypesService
