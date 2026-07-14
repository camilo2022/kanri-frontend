import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import TrademarksService from '../../services/trademarks.service'
import GroupsService from '../../services/groups.service'
import SizesService from '../../services/sizes.service'
import List from './trademarks/List'
import Create from './trademarks/Create'
import Edit from './trademarks/Edit'
import Show from './trademarks/Show'

const Trademarks = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Marcas' })
  const [sizes, setSizes] = useState({})
  const [data, setData] = useState({})
  const [groups, setGroups] = useState({})
  const [trademark, setTrademark] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingSizes, setLoadingSizes] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setLoading(true)
    setTrademark('')
    if (view.name === 'show' && view.trademark?.id) {
      findTrademark(view.trademark.id)
      allSizes({ is_finished_product: true })
    }
    if (view.name === 'edit' && view.trademark?.id) {
      findTrademark(view.trademark.id)
      allGroups({ with_user: false })
    }
    if (view.name === 'create') {
      allGroups({ with_user: false })
    }
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Marcas' })
      fetchTrademarks()
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
      const response = await TrademarksService.destroy(id)
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
      setErrors(error.errors)
      throw error
    }
  }

  const setting = async (id, data) => {
    try {
      const response = await TrademarksService.setting(id, data)
      setErrors({})
      setTrademark(response.data.trademark)
      return response
    } catch (error) {
      console.log(error)
      setErrors(error)
      throw error
    }
  }

  const allGroups = async (params) => {
    try {
      const response = await GroupsService.all(params)
      setGroups(response.data.groups)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const allSizes = async (params) => {
    setLoadingSizes(true)
    try {
      const response = await SizesService.all(params)
      setSizes(response.data)
    } catch (error) {
      console.log(error)
      setErrors(error)
    } finally {
      setLoadingSizes(false)
    }
  }

  const assign = async (id, size_id) => {
    try {
      const response = await TrademarksService.assign(id, size_id)
      setTrademark(response.data.trademark)
      return response
    } catch (error) {
      setErrors(error)
      throw error
    }
  }

  const remove = async (id, size_id) => {
    try {
      const response = await TrademarksService.remove(id, size_id)
      setTrademark(response.data.trademark)
      return response
    } catch (error) {
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return (
          <Create
            onChangeView={changeView}
            onSubmit={createTrademark}
            errors={errors}
            groups={groups}
          />
        )

      case 'edit':
        return (
          <Edit
            trademark={trademark}
            onChangeView={changeView}
            onSubmit={editTrademark}
            errors={errors}
            groups={groups}
          />
        )

      case 'show':
        return (
          <Show
            trademark={trademark}
            onChangeView={changeView}
            errors={errors}
            loading={loading}
            setting={setting}
            sizes={sizes}
            loadingSizes={loadingSizes}
            assign={assign}
            remove={remove}
          />
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
