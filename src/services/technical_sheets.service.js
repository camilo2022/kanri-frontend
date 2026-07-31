import api from '../API/api'
import { getConfig } from '../axiosConfig'

/*
const all = async (params) => {
  try {
    const response = await api.get(`/products/all`, {
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
*/
const find = async (index) => {
  try {
    const response = await api.get(`/technical_sheets/find`, {
      ...getConfig(),
      params: index,
    })
    return response.data
  } catch (error) {
    console.log(error)
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const store = async (data) => {
  try {
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && !(value instanceof File)) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            formData.append(`${key}[${subKey}]`, subValue)
          })
        } else {
          formData.append(key, value)
        }
      }
    })

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
    const response = await api.put(`/technical_sheets/update/${id}`, data, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const TechnicalSheetsService = {
  find,
  store,
  update,
}

export default TechnicalSheetsService
