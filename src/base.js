const api_config = {
  production: import.meta.env.VITE_BASE_URL_API
}

export const API_URL = api_config['production']
