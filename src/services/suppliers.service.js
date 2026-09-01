import api from '../API/api'
import { getConfig } from '../axiosConfig'

const all = async (id, params) => {
  try {
    const response = await api.get(`/typification/supplier_types/suppliers/all/${id}`, {
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

const store = async (data) => {
  try {
    const formData = new FormData()

    const appendFormData = (formData, data, parentKey = '') => {
      Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) return

        const formKey = parentKey ? `${parentKey}[${key}]` : key

        if (value instanceof File) {
          formData.append(formKey, value)
          return
        }

        if (value instanceof FileList) {
          Array.from(value).forEach((file) => {
            formData.append(formKey, file)
          })
          return
        }

        if (typeof value === 'object') {
          appendFormData(formData, value, formKey)
          return
        }

        formData.append(formKey, value)
      })
    }

    appendFormData(formData, data)

    const response = await api.post(
      `/typification/supplier_types/suppliers/store`,
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

    const appendFormData = (formData, data, parentKey = '') => {
      Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) return

        const formKey = parentKey ? `${parentKey}[${key}]` : key

        if (value instanceof File) {
          formData.append(formKey, value)
          return
        }

        if (value instanceof FileList) {
          Array.from(value).forEach((file) => {
            formData.append(formKey, file)
          })
          return
        }

        if (typeof value === 'object') {
          appendFormData(formData, value, formKey)
          return
        }

        formData.append(formKey, value)
      })
    }

    appendFormData(formData, data)

    formData.append('_method', 'PUT')

    const response = await api.post(
      `/typification/supplier_types/suppliers/update/${id}`,
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

const find = async (id) => {
  try {
    const response = await api.get(`/typification/supplier_types/suppliers/find/${id}`, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const destroy = async (id) => {
  try {
    const response = await api.delete(
      `/typification/supplier_types/suppliers/delete/${id}`,
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

const restore = async (id) => {
  try {
    const response = await api.patch(
      `/typification/supplier_types/suppliers/restore/${id}`,
      {},
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

const SuppliersService = {
  all,
  store,
  update,
  find,
  destroy,
  restore,
}

export default SuppliersService
