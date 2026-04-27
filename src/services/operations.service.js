import api from '../API/api'
import { getConfig } from '../axiosConfig'

const all = async (id, params) => {
  try {
    const response = await api.get(`/workflow/processes/subprocesses/operations/all/${id}`, {
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
    const response = await api.post(
      `/workflow/processes/subprocesses/operations/store`,
      data,
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
    console.log(id, data)
    const response = await api.put(
      `/workflow/processes/subprocesses/operations/update/${id}`,
      data,
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
    console.log('Estes es el id', id)
    const response = await api.get(
      `/workflow/processes/subprocesses/operations/find/${id}`,
      getConfig(),
    )
    console.log(response)
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
      `/workflow/processes/subprocesses/operations/delete/${id}`,
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
      `/workflow/processes/subprocesses/operations/restore/${id}`,
      {},
      getConfig(),
    )
    return response.data
  } catch (error) {
    console.log(error)
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const OperationsService = {
  all,
  store,
  update,
  find,
  destroy,
  restore,
}

export default OperationsService
