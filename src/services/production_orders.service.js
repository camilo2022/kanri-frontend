import api from '../API/api'
import { getConfig } from '../axiosConfig'

const appendFormData = (formData, data, parentKey = '') => {
  if (data === undefined) {
    return
  }

  if (data === null) {
    formData.append(parentKey, '')
    return
  }

  if (data instanceof File) {
    formData.append(parentKey, data)
    return
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      appendFormData(formData, item, `${parentKey}[${index}]`)
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
    const response = await api.get(`/technical_sheets/production_orders/find/${index}`, {
      ...getConfig(),
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

    const response = await api.post(
      `/technical_sheets/production_orders/store`,
      formData,
      getConfig(),
    )
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

    const response = await api.post(
      `/technical_sheets/production_orders/update/${id}`,
      formData,
      getConfig(),
    )

    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const pdf = async (id) => {
  try {
    const response = await api.get(`/technical_sheets/production_orders/pdf/${id}`, {
      ...getConfig(),
      responseType: 'blob',
    })
    return response
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
  pdf,
}

export default ProductionOrdersService
