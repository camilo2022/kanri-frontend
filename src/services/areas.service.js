import api from '../API/api'
import { getConfig } from '../axiosConfig'

const all = async (params) => {
  try {
    const response = await api.get(`/organizational_structure/areas/all`, {
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
    const response = await api.post(`/organizational_structure/areas/store`, data, getConfig())
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
    const response = await api.put(
      `/organizational_structure/areas/update/${id}`,
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
    const response = await api.get(`/organizational_structure/areas/find/${id}`, getConfig())
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
    const response = await api.delete(`/organizational_structure/areas/delete/${id}`, getConfig())
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
    const response = await api.patch(
      `/organizational_structure/areas/restore/${id}`,
      {},
      getConfig(),
    )
    return response.data
  } catch (error) {
    console.log(error)
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const AreasService = {
  all,
  store,
  update,
  find,
  destroy,
  restore,
}

export default AreasService
