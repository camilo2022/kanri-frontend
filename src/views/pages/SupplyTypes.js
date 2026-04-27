import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SupplyTypesService from '../../services/supply_types.service'
import List from './supplyTypes/List'
import Create from './supplyTypes/Create'
import Edit from './supplyTypes/Edit'

const SupplyTypes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipos de Insumo' })
  const [data, setData] = useState({})
  const [supplyType, setSupplyType] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.supply_type?.id) {
      findSupplyType(view.supply_type.id)
    }
    setLoading(true)
    setSupplyType('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipos de Insumo' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchSupplyTypes = async (params) => {
    try {
      const response = await SupplyTypesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createSupplyType = async (data) => {
    try {
      const response = await SupplyTypesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editSupplyType = async (id, data) => {
    try {
      const response = await SupplyTypesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findSupplyType = async (id) => {
    try {
      const response = await SupplyTypesService.find(id)
      setSupplyType(response.data.supply_type)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteSupplyType = async (id) => {
    try {
      const response = await SupplyTypesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await SupplyTypesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createSupplyType} errors={errors} />

      case 'edit':
        return (
          <Edit
            supply_type={supplyType}
            onChangeView={changeView}
            onSubmit={editSupplyType}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchSupplyTypes={fetchSupplyTypes}
            onChangeView={changeView}
            deleteSupplyType={deleteSupplyType}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default SupplyTypes
