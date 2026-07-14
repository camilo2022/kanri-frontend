import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import PiecesService from '../../services/pieces.service'
import List from './pieces/List'
import Create from './pieces/Create'
import Edit from './pieces/Edit'

const Pieces = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Piezas' })
  const [data, setData] = useState({})
  const [piece, setPiece] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.piece?.id) {
      findPiece(view.piece.id)
    }
    setLoading(true)
    setPiece('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Piezas' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchPieces = async (params) => {
    try {
      const response = await PiecesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createPiece = async (data) => {
    try {
      const response = await PiecesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editPiece = async (id, data) => {
    try {
      const response = await PiecesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findPiece = async (id) => {
    try {
      const response = await PiecesService.find(id)
      setPiece(response.data.piece)
      return response
    } catch (error) {
      throw error
    }
  }

  const deletePiece = async (id) => {
    try {
      const response = await PiecesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await PiecesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createPiece} errors={errors} />

      case 'edit':
        return <Edit piece={piece} onChangeView={changeView} onSubmit={editPiece} errors={errors} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchPieces={fetchPieces}
            onChangeView={changeView}
            deletePiece={deletePiece}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Pieces
