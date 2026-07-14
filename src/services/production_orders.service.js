import api from '../API/api'
import { getConfig } from '../axiosConfig'

const all = async (technical_sheet_id, params) => {
  try {
    const response = await api.get(
      `/technical_sheets/production_orders/all/${technical_sheet_id}`,
      {
        ...getConfig(),
        params: params,
      },
    )
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const find = async (index) => {
  try {
    const response = await api.get(`/technical_sheets/production_orders/find`, {
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
    const response = await api.post(`/products/store`, data, getConfig())
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
    const response = await api.put(`/products/update/${id}`, data, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const ProductionOrdersService = {
  all,
  find,
  store,
  update,
}

export default ProductionOrdersService
