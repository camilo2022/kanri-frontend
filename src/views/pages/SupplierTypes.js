import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SupplierTypesService from '../../services/supplier_types.service'
import List from './supplierTypes/List'
import Create from './supplierTypes/Create'
import Edit from './supplierTypes/Edit'
import Suppliers from './Suppliers'

const SupplierTypes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipos de Proveedores' })
  const [data, setData] = useState({})
  const [supplierType, setSupplierType] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setLoading(true)
    setSupplierType('')
    if (view.name === 'edit' && view.supplier_type?.id) {
      findSupplierType(view.supplier_type.id)
    }
    if (view.name === 'show' && view.supplier_type?.id) {
      findSupplierType(view.supplier_type.id)
    }
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipos de Proveedores' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchSupplierTypes = async (params) => {
    try {
      const response = await SupplierTypesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createSupplierType = async (data) => {
    try {
      const response = await SupplierTypesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editSupplierType = async (id, data) => {
    try {
      const response = await SupplierTypesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findSupplierType = async (id) => {
    try {
      const response = await SupplierTypesService.find(id)
      setSupplierType(response.data.supplier_type)
      return response
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteSupplierType = async (id) => {
    try {
      const response = await SupplierTypesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await SupplierTypesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createSupplierType} errors={errors} />

      case 'edit':
        return (
          <Edit
            supplier_type={supplierType}
            onChangeView={changeView}
            onSubmit={editSupplierType}
            errors={errors}
          />
        )

      case 'show':
        return <Suppliers supplier_type_id={supplierType.id} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchSupplierTypes={fetchSupplierTypes}
            onChangeView={changeView}
            deleteSupplierType={deleteSupplierType}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default SupplierTypes
