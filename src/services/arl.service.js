import api from '../API/api'
import { getConfig } from '../axiosConfig'

const all = async (params) => {
  try {
    const response = await api.get(`/arl/all`, {
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

const ArlService = {
  all,
}

export default ArlService
