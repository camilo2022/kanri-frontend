import api from '../API/api'
import { getConfig } from '../axiosConfig'

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
  save,
}

export default ProductionManagementService
