import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import WashTonesService from '../../services/wash_tones.service'
import List from './washTones/List'
import Create from './washTones/Create'
import Edit from './washTones/Edit'

const WashTones = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tonos de Lavado' })
  const [data, setData] = useState({})
  const [washTone, setWashTone] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setLoading(true)
    setWashTone('')
    if (view.name === 'edit' && view.wash_tone?.id) {
      findWashTone(view.wash_tone.id)
    }
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tonos de Lavado' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchWashTones = async (params) => {
    try {
      const response = await WashTonesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createWashTone = async (data) => {
    try {
      const response = await WashTonesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editWashTone = async (id, data) => {
    try {
      const response = await WashTonesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findWashTone = async (id) => {
    try {
      const response = await WashTonesService.find(id)
      setWashTone(response.data.wash_tone)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteWashTone = async (id) => {
    try {
      const response = await WashTonesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await WashTonesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createWashTone} errors={errors} />

      case 'edit':
        return (
          <Edit
            wash_tone={washTone}
            onChangeView={changeView}
            onSubmit={editWashTone}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchWashTones={fetchWashTones}
            onChangeView={changeView}
            deleteWashTone={deleteWashTone}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default WashTones
