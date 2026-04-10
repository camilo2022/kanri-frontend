import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import BackTypesService from '../../services/back_types.service'
import List from './backTypes/List'
import Create from './backTypes/Create'
import Edit from './backTypes/Edit'

const BackTypes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipos de Trasero' })
  const [data, setData] = useState({})
  const [backType, setBackType] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.back_type?.id) {
      findBackType(view.back_type.id)
    }
    setLoading(true)
    setBackType('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipos de Trasero' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchBackTypes = async (params) => {
    try {
      const response = await BackTypesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createBackType = async (data) => {
    try {
      const response = await BackTypesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editBackType = async (id, data) => {
    try {
      const response = await BackTypesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findBackType = async (id) => {
    try {
      const response = await BackTypesService.find(id)
      setBackType(response.data.back_type)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteBackType = async (id) => {
    try {
      const response = await BackTypesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await BackTypesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createBackType} errors={errors} />

      case 'edit':
        return (
          <Edit
            back_type={backType}
            onChangeView={changeView}
            onSubmit={editBackType}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchBackTypes={fetchBackTypes}
            onChangeView={changeView}
            deleteBackType={deleteBackType}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default BackTypes
