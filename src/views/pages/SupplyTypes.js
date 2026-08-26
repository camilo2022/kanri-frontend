import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SupplyTypesService from '../../services/supply_types.service'
import SuppliesService from '../../services/supplies.service'
import List from './supplyTypes/List'
import Create from './supplyTypes/Create'
import Edit from './supplyTypes/Edit'
import Supplies from './Supplies'
import Settings from './supplyTypes/Settings'

const SupplyTypes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipos de Insumo' })
  const [data, setData] = useState({})
  const [models, setModels] = useState({})
  const [supplyType, setSupplyType] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setLoading(true)
    setSupplyType('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipos de Insumo' })
    }
    if (view.name === 'edit' && view.supply_type?.id) {
      findSupplyType(view.supply_type.id)
    }
    if (view.name === 'show' && view.supply_type?.id) {
      findSupplyType(view.supply_type.id)
    }
    if (view.name === 'settings' && view.supply_type?.id) {
      findSupplyType(view.supply_type.id)
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
      setModels(response.data.model_types)
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

  const setting = async (id, data) => {
    try {
      const response = await SupplyTypesService.setting(id, data)
      setErrors({})
      setSupplyType(response.data.supply_type)
      return response
    } catch (error) {
      console.log(error)
      setErrors(error)
      throw error
    }
  }

  const generateExcel = async (supply_type_id) => {
    try {
      const response = await SuppliesService.excel(supply_type_id)
      var blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      var url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'supplies.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      throw error
    }
  }

  const importExcel = async (file, id) => {
    try {
      const response = await SuppliesService.upload(file, id)
      setErrors({})
      return response
    } catch (error) {
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

      case 'show':
        return <Supplies supply_type_id={supplyType.id} />

      case 'settings':
        return (
          <Settings
            supply_type={supplyType}
            onChangeView={changeView}
            errors={errors}
            loading={loading}
            setting={setting}
            models={models}
            supply_types={data?.supply_types}
            fetchSupplyTypes={fetchSupplyTypes}
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
            generateExcel={generateExcel}
            importExcel={importExcel}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default SupplyTypes
