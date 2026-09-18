import api from '../API/api'
import { getConfig } from '../axiosConfig'

const all = async (params) => {
  try {
    const response = await api.get(`/trademarks/all`, {
      ...getConfig(),
      params: params,
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

    const response = await api.post(`/trademarks/store`, formData, getConfig())

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

    const appendFormData = (formData, value, key) => {
      if (value === null || value === undefined) {
        return
      }

      if (value instanceof File) {
        formData.append(key, value)
        return
      }

      if (value instanceof FileList) {
        Array.from(value).forEach((file, index) => {
          formData.append(`${key}[${index}]`, file)
        })
        return
      }

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          appendFormData(formData, item, `${key}[${index}]`)
        })
        return
      }

      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          appendFormData(formData, subValue, `${key}[${subKey}]`)
        })
        return
      }

      formData.append(key, value)
    }

    Object.entries(data).forEach(([key, value]) => {
      appendFormData(formData, value, key)
    })

    formData.append('_method', 'PUT')

    const response = await api.post(`/trademarks/update/${id}`, formData, getConfig())

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
    const response = await api.get(`/trademarks/find/${id}`, getConfig())
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
    const response = await api.delete(`/trademarks/delete/${id}`, getConfig())
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
    const response = await api.patch(`/trademarks/restore/${id}`, {}, getConfig())
    return response.data
  } catch (error) {
    console.log(error)
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const setting = async (id, data) => {
  try {
    const response = await api.put(`/trademarks/setting/${id}`, data, getConfig())
    return response.data
  } catch (error) {
    console.log(error)
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const assign = async (id, size_id) => {
  try {
    const response = await api.post(`/trademarks/size/assign/${id}`, { size_id }, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const remove = async (id, size_id) => {
  try {
    const response = await api.post(`/trademarks/size/remove/${id}`, { size_id }, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const TrademarksService = {
  all,
  store,
  update,
  find,
  destroy,
  restore,
  setting,
  remove,
  assign,
}

export default TrademarksService
