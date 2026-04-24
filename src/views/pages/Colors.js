import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import ColorsService from '../../services/colors.service'
import List from './colors/List'
import Create from './colors/Create'
import Edit from './colors/Edit'

const Colors = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Colores' })
  const [data, setData] = useState({})
  const [color, setColor] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setLoading(true)
    setColor('')
    if (view.name === 'edit' && view.color?.id) {
      findColor(view.color.id)
    }
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Colores' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchColors = async (params) => {
    try {
      const response = await ColorsService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createColor = async (data) => {
    try {
      const response = await ColorsService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editColor = async (id, data) => {
    try {
      const response = await ColorsService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findColor = async (id) => {
    try {
      const response = await ColorsService.find(id)
      setColor(response.data.color)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteColor = async (id) => {
    try {
      const response = await ColorsService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await ColorsService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createColor} errors={errors} />

      case 'edit':
        return <Edit color={color} onChangeView={changeView} onSubmit={editColor} errors={errors} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchColors={fetchColors}
            onChangeView={changeView}
            deleteColor={deleteColor}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Colors
