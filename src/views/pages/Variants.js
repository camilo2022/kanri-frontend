import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import VariantsService from '../../services/variants.service'
import SupplyTypesService from '../../services/supply_types.service'
import List from './supplyTypes/variants/List'
import Create from './supplyTypes/variants/Create'
import Edit from './supplyTypes/variants/Edit'
import SupplyTypes from './SupplyTypes'

const Variants = ({ supply_type_id }) => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Variantes' })
  const [data, setData] = useState({})
  const [variant, setVariant] = useState({})
  const [supplyType, SetSupplyType] = useState(null)
  const [models, setModels] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!supply_type_id) return
    findSupplyType(supply_type_id)
    if (view.name === 'edit' && view.variant?.id) {
      findVariant(view.variant.id)
    }
    setLoading(true)
    setVariant('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Variantes' })
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

  const fetchVariants = async (supply_type_id, params) => {
    try {
      const response = await VariantsService.all(supply_type_id, params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createVariant = async (data) => {
    try {
      const response = await VariantsService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editVariant = async (id, data) => {
    try {
      const response = await VariantsService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findVariant = async (id) => {
    try {
      const response = await VariantsService.find(id)
      setVariant(response.data.variant)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteVariant = async (id) => {
    try {
      const response = await VariantsService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await VariantsService.restore(id)
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
            onSubmit={createVariant}
            errors={errors}
          />
        )

      case 'edit':
        return (
          <Edit
            supply_type={supplyType}
            models={models}
            variant={variant}
            onChangeView={changeView}
            onSubmit={editVariant}
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
            fetchVariants={fetchVariants}
            onChangeView={changeView}
            deleteVariant={deleteVariant}
            restore={restore}
            errors={errors}
            supply_type={supplyType}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Variants
