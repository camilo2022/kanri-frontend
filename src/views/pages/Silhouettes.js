import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SilhouettesService from '../../services/silhouettes.service'
import List from './silhouettes/List'
import Create from './silhouettes/Create'
import Edit from './silhouettes/Edit'

const Silhouettes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Siluetas' })
  const [data, setData] = useState({})
  const [silhouette, setSilhouette] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.silhouette?.id) {
      findSilhouette(view.silhouette.id)
    }
    setLoading(true)
    setSilhouette('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Siluetas' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchSilhouettes = async (params) => {
    try {
      const response = await SilhouettesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createSilhouette = async (data) => {
    try {
      const response = await SilhouettesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editSilhouette = async (id, data) => {
    try {
      const response = await SilhouettesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findSilhouette = async (id) => {
    try {
      const response = await SilhouettesService.find(id)
      console.log(response)
      setSilhouette(response.data.silhouette)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteSilhouette = async (id) => {
    try {
      const response = await SilhouettesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await SilhouettesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createSilhouette} errors={errors} />

      case 'edit':
        return (
          <Edit
            silhouette={silhouette}
            onChangeView={changeView}
            onSubmit={editSilhouette}
            errors={errors}
          />
        )

      case 'show':
        return <Positions silhouette={silhouette} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchSilhouettes={fetchSilhouettes}
            onChangeView={changeView}
            deleteSilhouette={deleteSilhouette}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Silhouettes
