import api from '../API/api'
import { getConfig } from '../axiosConfig'

const all = async (params) => {
  try {
    const response = await api.get(`/people/all`, {
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

    Object.keys(data).forEach((key) => {
      if (key === 'photo') {
        if (data.photo) {
          formData.append('photo', data.photo)
        }
      } else {
        formData.append(key, data[key])
      }
    })

    const response = await api.post(`/people/store`, formData, getConfig())

    return response.data
  } catch (error) {
    console.log(error)
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const update = async (id, data) => {
  try {
    const formData = new FormData()

    Object.keys(data).forEach((key) => {
      if (key === 'photo') {
        if (data.photo) {
          formData.append('photo', data.photo)
        }
      } else {
        formData.append(key, data[key])
      }
    })

    formData.append('_method', 'PUT')

    const response = await api.post(`/people/update/${id}`, formData, getConfig())
    return response.data
  } catch (error) {
    console.log(error)
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const find = async (id) => {
  try {
    const response = await api.get(`/people/find/${id}`, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}
const delete_person = async (id) => {
  try {
    const response = await api.delete(`/people/delete/${id}`, getConfig())
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
    const response = await api.patch(`/people/restore/${id}`, {}, getConfig())
    return response.data
  } catch (error) {
    console.log(error)
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const PeopleService = {
  all,
  store,
  update,
  find,
  delete_person,
  restore,
}

export default PeopleService
