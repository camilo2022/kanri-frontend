import api from '../API/api'
import { getConfig } from '../axiosConfig'

const save = async (data) => {
  try {
    const response = await api.post(`/technical_sheets_details/save`, data, getConfig())
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

const TechnicalSheetDetailService = {
  save,
}

export default TechnicalSheetDetailService
