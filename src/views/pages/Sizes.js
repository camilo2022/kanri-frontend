import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SizesService from '../../services/sizes.service'
import List from './sizes/List'
import Create from './sizes/Create'
import Edit from './sizes/Edit'

const Sizes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tallas' })
  const [data, setData] = useState({})
  const [size, setSize] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.size?.id) {
      findSize(view.size.id)
    }
    setLoading(true)
    setSize('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tallas' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchSizes = async (params) => {
    try {
      const response = await SizesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createSize = async (data) => {
    try {
      const response = await SizesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editSize = async (id, data) => {
    try {
      const response = await SizesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findSize = async (id) => {
    try {
      const response = await SizesService.find(id)
      setSize(response.data.size)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteSize = async (id) => {
    try {
      const response = await SizesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await SizesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createSize} errors={errors} />

      case 'edit':
        return <Edit size={size} onChangeView={changeView} onSubmit={editSize} errors={errors} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchSizes={fetchSizes}
            onChangeView={changeView}
            deleteSize={deleteSize}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Sizes
