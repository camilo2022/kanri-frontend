import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import BloodTypesService from '../../services/blood_types.service'
import List from './bloodTypes/List'
import Create from './bloodTypes/Create'
import Edit from './bloodTypes/Edit'

const BloodTypes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipos de Sangre' })
  const [data, setData] = useState({})
  const [bloodType, setBloodType] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.blood_type?.id) {
      findBloodType(view.blood_type.id)
    }
    setLoading(true)
    setBloodType('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipos de Sangre' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchBloodTypes = async (params) => {
    try {
      const response = await BloodTypesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createBloodType = async (data) => {
    try {
      const response = await BloodTypesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editBloodType = async (id, data) => {
    try {
      const response = await BloodTypesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findBloodType = async (id) => {
    try {
      const response = await BloodTypesService.find(id)
      setBloodType(response.data.blood_type)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteBloodType = async (id) => {
    try {
      const response = await BloodTypesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await BloodTypesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createBloodType} errors={errors} />

      case 'edit':
        return (
          <Edit
            bloodType={bloodType}
            onChangeView={changeView}
            onSubmit={editBloodType}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchBloodTypes={fetchBloodTypes}
            onChangeView={changeView}
            deleteBloodType={deleteBloodType}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default BloodTypes
