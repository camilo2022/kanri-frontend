import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import AreasService from '../../services/areas.service'
import List from './areas/List'
import Create from './areas/Create'
import Edit from './areas/Edit'
import Positions from './Positions'

const Areas = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Áreas' })
  const [data, setData] = useState({})
  const [area, setArea] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'show' && view.area?.id) {
      findArea(view.area.id)
    }
    setLoading(true)
    setArea('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Áreas' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchAreas = async (params) => {
    try {
      const response = await AreasService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createArea = async (data) => {
    try {
      const response = await AreasService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editArea = async (id, data) => {
    try {
      const response = await AreasService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findArea = async (id) => {
    try {
      const response = await AreasService.find(id)
      setArea(response.data.area)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteArea = async (id) => {
    try {
      const response = await AreasService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await AreasService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createArea} errors={errors} />

      case 'edit':
        return (
          <Edit area={view.area} onChangeView={changeView} onSubmit={editArea} errors={errors} />
        )

      case 'show':
        return <Positions area={area} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchAreas={fetchAreas}
            onChangeView={changeView}
            deleteArea={deleteArea}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Areas
