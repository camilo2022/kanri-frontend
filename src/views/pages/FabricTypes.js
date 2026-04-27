import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import FabricTypesService from '../../services/fabric_types.service'
import List from './fabricTypes/List'
import Create from './fabricTypes/Create'
import Edit from './fabricTypes/Edit'

const FabricTypes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipos de Tela' })
  const [data, setData] = useState({})
  const [fabricType, setFabricType] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.fabric_type?.id) {
      findFabricType(view.fabric_type.id)
    }
    setLoading(true)
    setFabricType('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipos de Tela' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchFabricTypes = async (params) => {
    try {
      const response = await FabricTypesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createFabricType = async (data) => {
    try {
      const response = await FabricTypesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editFabricType = async (id, data) => {
    try {
      const response = await FabricTypesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findFabricType = async (id) => {
    try {
      const response = await FabricTypesService.find(id)
      setFabricType(response.data.fabric_type)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteFabricType = async (id) => {
    try {
      const response = await FabricTypesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await FabricTypesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createFabricType} errors={errors} />

      case 'edit':
        return (
          <Edit
            fabric_type={fabricType}
            onChangeView={changeView}
            onSubmit={editFabricType}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchFabricTypes={fetchFabricTypes}
            onChangeView={changeView}
            deleteFabricType={deleteFabricType}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default FabricTypes
