import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SuppliersService from '../../services/suppliers.service'
import ProcessesService from '../../services/processes.service'
import List from './suppliers/List'
import Create from './suppliers/Create'
import Edit from './suppliers/Edit'

const Suppliers = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Proveedores' })
  const [data, setData] = useState({})
  const [supplier, setSupplier] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setLoading(true)
    setSupplier('')
    if (view.name === 'edit' && view.supplier?.id) {
      findSupplier(view.supplier.id)
    }
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Proveedores' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchSuppliers = async (params) => {
    try {
      const response = await SuppliersService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createSupplier = async (data) => {
    try {
      const response = await SuppliersService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editSupplier = async (id, data) => {
    try {
      const response = await SuppliersService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findSupplier = async (id) => {
    try {
      const response = await SuppliersService.find(id)
      setSupplier(response.data.supplier)
      return response
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteSupplier = async (id) => {
    try {
      const response = await SuppliersService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await SuppliersService.restore(id)
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const setting = async (id, data) => {
    try {
      const response = await SuppliersService.setting(id, data)
      setErrors({})
      setSupplier(response.data.supplier)
      return response
    } catch (error) {
      console.log(error)
      setErrors(error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createSupplier} errors={errors} />

      case 'edit':
        return (
          <Edit
            supplier={supplier}
            onChangeView={changeView}
            onSubmit={editSupplier}
            errors={errors}
          />
        )

      case 'show':
        return (
          <Show
            supplier={supplier}
            onChangeView={changeView}
            errors={errors}
            loading={loading}
            setting={setting}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchSuppliers={fetchSuppliers}
            onChangeView={changeView}
            deleteSupplier={deleteSupplier}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Suppliers
