import axios from 'axios'
import { API_URL } from '../../base'
import { getConfig } from '../../axiosConfig'

const all = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/authorization/roles/all`, {
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

const RoleService = {
  all,
}

export default RoleService
