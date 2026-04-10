import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import BootTypesService from '../../services/boot_types.service'
import List from './bootTypes/List'
import Create from './bootTypes/Create'
import Edit from './bootTypes/Edit'

const BootTypes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipos de Bota' })
  const [data, setData] = useState({})
  const [bootType, setBootType] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.boot_type?.id) {
      findBootType(view.boot_type.id)
    }
    setLoading(true)
    setBootType('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipos de Bota' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchBootTypes = async (params) => {
    try {
      const response = await BootTypesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createBootType = async (data) => {
    try {
      const response = await BootTypesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editBootType = async (id, data) => {
    try {
      const response = await BootTypesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findBootType = async (id) => {
    try {
      const response = await BootTypesService.find(id)
      setBootType(response.data.boot_type)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteBootType = async (id) => {
    try {
      const response = await BootTypesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await BootTypesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createBootType} errors={errors} />

      case 'edit':
        return (
          <Edit
            boot_type={bootType}
            onChangeView={changeView}
            onSubmit={editBootType}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchBootTypes={fetchBootTypes}
            onChangeView={changeView}
            deleteBootType={deleteBootType}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default BootTypes
