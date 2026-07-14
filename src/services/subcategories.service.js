import api from '../API/api'
import { getConfig } from '../axiosConfig'

const all = async (category_id, params) => {
  try {
    const response = await api.get(`/categorization/categories/subcategories/all/${category_id}`, {
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
    const response = await api.post(
      `/categorization/categories/subcategories/store`,
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
    const response = await api.put(
      `/categorization/categories/subcategories/update/${id}`,
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
    const response = await api.get(
      `/categorization/categories/subcategories/find/${id}`,
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

const destroy = async (id) => {
  try {
    const response = await api.delete(
      `/categorization/categories/subcategories/delete/${id}`,
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
      `/categorization/categories/subcategories/restore/${id}`,
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

const SubcategoriesService = {
  all,
  store,
  update,
  find,
  destroy,
  restore,
}

export default SubcategoriesService
