import api from './api'

const setupInterceptors = (onServerError) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 500) {
        onServerError(true)
      }
      return Promise.reject(error)
    },
  )
}

export default setupInterceptors
