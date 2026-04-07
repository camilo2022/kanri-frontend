import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import TrademarksService from '../../services/trademarks.service'
import List from './trademarks/List'
import Create from './trademarks/Create'
import Edit from './trademarks/Edit'
import Show from './trademarks/Show'

const Trademarks = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Marcas' })
  const [data, setData] = useState({})
  const [trademark, setTrademark] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'show' && view.trademark?.id) {
      findTrademark(view.trademark.id)
    }
    if (view.name === 'edit' && view.trademark?.id) {
      findTrademark(view.trademark.id)
    }
    setLoading(true)
    setTrademark('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Marcas' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchTrademarks = async (params) => {
    try {
      const response = await TrademarksService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createTrademark = async (data) => {
    try {
      const response = await TrademarksService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editTrademark = async (id, data) => {
    try {
      const response = await TrademarksService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findTrademark = async (id) => {
    try {
      const response = await TrademarksService.find(id)
      setTrademark(response.data.trademark)
      return response
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteTrademark = async (id) => {
    try {
      const response = await TrademarksService.delete_trademark(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await TrademarksService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createTrademark} errors={errors} />

      case 'edit':
        return (
          <Edit
            trademark={trademark}
            onChangeView={changeView}
            onSubmit={editTrademark}
            errors={errors}
          />
        )

      case 'show':
        return (
          <Show trademark={trademark} onChangeView={changeView} errors={errors} loading={loading} />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchTrademarks={fetchTrademarks}
            onChangeView={changeView}
            deleteTrademark={deleteTrademark}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Trademarks
