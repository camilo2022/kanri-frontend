import api from '../API/api'
import { getConfig } from '../axiosConfig'

const all = async (params) => {
  try {
    const response = await api.get(`/reports/all`, {
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

const find = async (id) => {
  try {
    const response = await api.get(`/reports/find/${id}`, getConfig())
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}

const generate = async (report_id, params) => {
  try {
    const response = await api.post(`/reports/${report_id}/generate`, params, {
      ...getConfig(),
    })

    return response.data
  } catch (error) {
    if (error.response?.data) {
      throw error.response.data
    }

    throw {
      message: 'Error desconocido',
    }
  }
}

const export_report = async (report_id, params, name) => {
  try {
    console.log(name)
    const response = await api.post(`/reports/${report_id}/export`, params, {
      ...getConfig(),
      responseType: 'blob',
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const url = window.URL.createObjectURL(blob)

    const safe_name = String(name || 'Reporte')
      .trim()
      .replace(/\s+/g, '_')

    const file_name = `REPORT_${safe_name}.xlsx`

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', file_name)

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(url)
  } catch (error) {
    if (error.response?.data) {
      throw error.response.data
    }

    throw {
      message: 'Error desconocido',
    }
  }
}

/*
const store = async (data) => {
  try {
    const response = await api.post(`/back_types/store`, data, getConfig())
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
    const response = await api.put(`/back_types/update/${id}`, data, getConfig())
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
    const response = await api.delete(`/back_types/delete/${id}`, getConfig())
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
    const response = await api.patch(`/back_types/restore/${id}`, {}, getConfig())
    return response.data
  } catch (error) {
    console.log(error)
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw { message: 'Error desconocido' }
  }
}*/

const ReportsService = {
  all,
  find,
  generate,
  export_report,
}

export default ReportsService
