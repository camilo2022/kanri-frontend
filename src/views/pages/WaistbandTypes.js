import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import WaistbandTypesService from '../../services/waistband_types.service'
import List from './waistbandTypes/List'
import Create from './waistbandTypes/Create'
import Edit from './waistbandTypes/Edit'

const WaistbandTypes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipos de Pretina' })
  const [data, setData] = useState({})
  const [waistbandType, setWaistbandType] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.waistband_type?.id) {
      findWaistbandType(view.waistband_type.id)
    }
    setLoading(true)
    setWaistbandType('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipos de Pretina' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchWaistbandTypes = async (params) => {
    try {
      const response = await WaistbandTypesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createWaistbandType = async (data) => {
    try {
      const response = await WaistbandTypesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editWaistbandType = async (id, data) => {
    try {
      const response = await WaistbandTypesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findWaistbandType = async (id) => {
    try {
      const response = await WaistbandTypesService.find(id)
      setWaistbandType(response.data.waistband_type)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteWaistbandType = async (id) => {
    try {
      const response = await WaistbandTypesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await WaistbandTypesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createWaistbandType} errors={errors} />

      case 'edit':
        return (
          <Edit
            waistband_type={waistbandType}
            onChangeView={changeView}
            onSubmit={editWaistbandType}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchWaistbandTypes={fetchWaistbandTypes}
            onChangeView={changeView}
            deleteWaistbandType={deleteWaistbandType}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default WaistbandTypes
