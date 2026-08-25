import api from '../API/api'
import { getConfig } from '../axiosConfig'

const appendFormData = (formData, data, parentKey = '') => {
  if (data === null || data === undefined) return

  if (data instanceof File) {
    formData.append(parentKey, data)
    return
  }

  if (Array.isArray(data)) {
    data.forEach((value, index) => {
      appendFormData(formData, value, `${parentKey}[${index}]`)
    })
    return
  }

  if (typeof data === 'object') {
    Object.entries(data).forEach(([key, value]) => {
      appendFormData(formData, value, parentKey ? `${parentKey}[${key}]` : key)
    })
    return
  }

  formData.append(parentKey, data)
}

const find = async (index) => {
  try {
    const response = await api.get(`/technical_sheets/find`, {
      ...getConfig(),
      params: index,
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
    const formData = new FormData()

    appendFormData(formData, data)

    const response = await api.post(`/technical_sheets/store`, formData, getConfig())
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
    const formData = new FormData()

    appendFormData(formData, data)

    formData.append('_method', 'PUT')

    const response = await api.post(`/technical_sheets/update/${id}`, formData, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const pdf = (uuid, production_order_id) => {
  return `${api.defaults.baseURL}/technical_sheets/pdf/${uuid}?production_order_id=${production_order_id}`
}

const TechnicalSheetsService = {
  find,
  store,
  update,
  pdf,
}

export default TechnicalSheetsService
