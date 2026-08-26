import api from '../API/api'
import { getConfig } from '../axiosConfig'

const all = async (supply_type_id, params) => {
  try {
    const response = await api.get(`/typification/supply_types/supplies/all/${supply_type_id}`, {
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
    const response = await api.post(`/typification/supply_types/supplies/store`, data, getConfig())
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
      `/typification/supply_types/supplies/update/${id}`,
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
    const response = await api.get(`/typification/supply_types/supplies/find/${id}`, getConfig())
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
    const response = await api.delete(
      `/typification/supply_types/supplies/delete/${id}`,
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
    const response = await api.patch(
      `/typification/supply_types/supplies/restore/${id}`,
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

const excel = async (supply_type_id) => {
  try {
    const response = await api.get(`/typification/supply_types/supplies/export/${supply_type_id}`, {
      ...getConfig(),
      responseType: 'blob',
    })
    return response
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const upload = async (file, supply_type_id) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post(
      `/typification/supply_types/supplies/import/${supply_type_id}`,
      formData,
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

const SuppliesService = {
  all,
  store,
  update,
  find,
  destroy,
  restore,
  excel,
  upload,
}

export default SuppliesService
