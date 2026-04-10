import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import GarmentTypesService from '../../services/garment_types.service'
import List from './garmentTypes/List'
import Create from './garmentTypes/Create'
import Edit from './garmentTypes/Edit'

const GarmentTypes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipos de Prenda' })
  const [data, setData] = useState({})
  const [garmentType, setGarmentType] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.garment_type?.id) {
      findGarmentType(view.garment_type.id)
    }
    setLoading(true)
    setGarmentType('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipos de Prenda' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchGarmentTypes = async (params) => {
    try {
      const response = await GarmentTypesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createGarmentType = async (data) => {
    try {
      const response = await GarmentTypesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editGarmentType = async (id, data) => {
    try {
      const response = await GarmentTypesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findGarmentType = async (id) => {
    try {
      const response = await GarmentTypesService.find(id)
      setGarmentType(response.data.garment_type)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteGarmentType = async (id) => {
    try {
      const response = await GarmentTypesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await GarmentTypesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createGarmentType} errors={errors} />

      case 'edit':
        return (
          <Edit
            garment_type={garmentType}
            onChangeView={changeView}
            onSubmit={editGarmentType}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchGarmentTypes={fetchGarmentTypes}
            onChangeView={changeView}
            deleteGarmentType={deleteGarmentType}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default GarmentTypes
