import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SuppliesService from '../../services/supplies.service'
import SupplyTypesService from '../../services/supply_types.service'
import List from './supplyTypes/supplies/List'
import Create from './supplyTypes/supplies/Create'
import Edit from './supplyTypes/supplies/Edit'
import SupplyTypes from './SupplyTypes'

const Supplies = ({ supply_type_id }) => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Insumos' })
  const [data, setData] = useState({})
  const [supply, setSupply] = useState({})
  const [supplyType, SetSupplyType] = useState(null)
  const [models, setModels] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!supply_type_id) return
    findSupplyType(supply_type_id)
    if (view.name === 'edit' && view.supply?.id) {
      findSupply(view.supply.id)
    }
    setLoading(true)
    setSupply('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Insumos' })
    }
  }, [view, supply_type_id])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const findSupplyType = async (id) => {
    try {
      const response = await SupplyTypesService.find(id)
      SetSupplyType(response.data.supply_type)
      setModels(response.data.model_types)
      return response
    } catch (error) {
      throw error
    }
  }

  const fetchSupplies = async (supply_type_id, params) => {
    try {
      const response = await SuppliesService.all(supply_type_id, params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createSupply = async (data) => {
    try {
      const response = await SuppliesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editSupply = async (id, data) => {
    try {
      const response = await SuppliesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findSupply = async (id) => {
    try {
      const response = await SuppliesService.find(id)
      setSupply(response.data.supply)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteSupply = async (id) => {
    try {
      const response = await SuppliesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await SuppliesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return (
          <Create
            supply_type={supplyType}
            models={models}
            onChangeView={changeView}
            onSubmit={createSupply}
            errors={errors}
          />
        )

      case 'edit':
        return (
          <Edit
            supply_type={supplyType}
            models={models}
            supply={supply}
            onChangeView={changeView}
            onSubmit={editSupply}
            errors={errors}
          />
        )

      case 'back':
        return <SupplyTypes />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchSupplies={fetchSupplies}
            onChangeView={changeView}
            deleteSupply={deleteSupply}
            restore={restore}
            errors={errors}
            supply_type={supplyType}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Supplies
