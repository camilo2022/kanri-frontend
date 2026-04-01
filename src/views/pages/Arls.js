import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import ArlsService from '../../services/arls.service'
import List from './arls/List'
import Create from './arls/Create'
import Edit from './arls/Edit'

const Arls = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Arls' })
  const [data, setData] = useState({})
  const [arl, setArl] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.arl?.id) {
      findArl(view.arl.id)
    }
    setLoading(true)
    setArl('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Arls' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchArls = async (params) => {
    try {
      const response = await ArlsService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createArl = async (data) => {
    try {
      const response = await ArlsService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editArl = async (id, data) => {
    try {
      const response = await ArlsService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findArl = async (id) => {
    try {
      const response = await ArlsService.find(id)
      setArl(response.data.arl)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteArl = async (id) => {
    try {
      const response = await ArlsService.delete_arl(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await ArlsService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createArl} errors={errors} />

      case 'edit':
        return <Edit arl={arl} onChangeView={changeView} onSubmit={editArl} errors={errors} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchArls={fetchArls}
            onChangeView={changeView}
            deleteArl={deleteArl}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Arls
