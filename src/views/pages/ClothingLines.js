import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import ClothingLinesService from '../../services/clothing_lines.service'
import List from './clothingLines/List'
import Create from './clothingLines/Create'
import Edit from './clothingLines/Edit'

const ClothingLines = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Lineas' })
  const [data, setData] = useState({})
  const [clothingLine, setClothingLine] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.clothing_line?.id) {
      findClothingLine(view.clothing_line.id)
    }
    setLoading(true)
    setClothingLine('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Lineas' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchClothingLines = async (params) => {
    try {
      const response = await ClothingLinesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createClothingLine = async (data) => {
    try {
      const response = await ClothingLinesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editClothingLine = async (id, data) => {
    try {
      const response = await ClothingLinesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findClothingLine = async (id) => {
    try {
      const response = await ClothingLinesService.find(id)
      setClothingLine(response.data.clothing_line)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteClothingLine = async (id) => {
    try {
      const response = await ClothingLinesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await ClothingLinesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createClothingLine} errors={errors} />

      case 'edit':
        return (
          <Edit
            clothing_line={clothingLine}
            onChangeView={changeView}
            onSubmit={editClothingLine}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchClothingLines={fetchClothingLines}
            onChangeView={changeView}
            deleteClothingLine={deleteClothingLine}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default ClothingLines
