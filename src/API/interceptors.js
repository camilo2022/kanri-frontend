import api from './api'

const setupInterceptors = (navigate) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const status = error.response.status

        if (status === 500) {
          navigate('/500')
        }
      }

      return Promise.reject(error)
    },
  )
}

export default setupInterceptors
