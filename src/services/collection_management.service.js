import api from '../API/api'
import { getConfig } from '../axiosConfig'

const find = async (id) => {
  try {
    const response = await api.get(`/management/collections/find/${id}`, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

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

const save = async (data) => {
  try {
    const formData = new FormData()

    appendFormData(formData, data)

    const response = await api.post(`/management/collections/save`, formData, getConfig())
    return {
      success: true,
      data: response.data.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Error desconocido' },
    }
  }
}

const CollectionManagementService = {
  find,
  save,
}

export default CollectionManagementService
