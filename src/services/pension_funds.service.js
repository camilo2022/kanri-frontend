import api from '../API/api'
import { getConfig } from '../axiosConfig'

const all = async (params) => {
  try {
    const response = await api.get(`/pension_funds/all`, {
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

const PensionFundsService = {
  all,
}

export default PensionFundsService
