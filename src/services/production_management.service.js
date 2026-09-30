import api from '../API/api'
import { getConfig } from '../axiosConfig'

const find = async (id) => {
  try {
    const response = await api.get(`/management/production/find/${id}`, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const save = async (data) => {
  try {
    const response = await api.post(`/management/production/save`, data, getConfig())
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

const ProductionManagementService = {
  find,
  save,
}

export default ProductionManagementService
