export const getConfig = () => {
  const token = localStorage.getItem('token')
  console.log(token)
  return {
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
      Accept: 'application/json',
    },
  }
}
