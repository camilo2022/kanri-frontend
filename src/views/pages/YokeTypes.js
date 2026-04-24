import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import YokeTypesService from '../../services/yoke_types.service'
import List from './yokeTypes/List'
import Create from './yokeTypes/Create'
import Edit from './yokeTypes/Edit'

const YokeTypes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipos de Cotilla' })
  const [data, setData] = useState({})
  const [yokeType, setYokeType] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setLoading(true)
    setYokeType('')
    if (view.name === 'edit' && view.yoke_type?.id) {
      findYokeType(view.yoke_type.id)
    }
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipos de Cotilla' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchYokeTypes = async (params) => {
    try {
      const response = await YokeTypesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createYokeType = async (data) => {
    try {
      const response = await YokeTypesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editYokeType = async (id, data) => {
    try {
      const response = await YokeTypesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findYokeType = async (id) => {
    try {
      const response = await YokeTypesService.find(id)
      setYokeType(response.data.yoke_type)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteYokeType = async (id) => {
    try {
      const response = await YokeTypesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await YokeTypesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createYokeType} errors={errors} />

      case 'edit':
        return (
          <Edit
            yoke_type={yokeType}
            onChangeView={changeView}
            onSubmit={editYokeType}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchYokeTypes={fetchYokeTypes}
            onChangeView={changeView}
            deleteYokeType={deleteYokeType}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default YokeTypes
