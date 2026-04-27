import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import ThreadTypesService from '../../services/thread_types.service'
import List from './threadTypes/List'
import Create from './threadTypes/Create'
import Edit from './threadTypes/Edit'

const ThreadTypes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipos de Hilo' })
  const [data, setData] = useState({})
  const [threadType, setThreadType] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.thread_type?.id) {
      findThreadType(view.thread_type.id)
    }
    setLoading(true)
    setThreadType('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipos de Hilo' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchThreadTypes = async (params) => {
    try {
      const response = await ThreadTypesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createThreadType = async (data) => {
    try {
      const response = await ThreadTypesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editThreadType = async (id, data) => {
    try {
      const response = await ThreadTypesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findThreadType = async (id) => {
    try {
      const response = await ThreadTypesService.find(id)
      setThreadType(response.data.thread_type)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteThreadType = async (id) => {
    try {
      const response = await ThreadTypesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await ThreadTypesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createThreadType} errors={errors} />

      case 'edit':
        return (
          <Edit
            thread_type={threadType}
            onChangeView={changeView}
            onSubmit={editThreadType}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchThreadTypes={fetchThreadTypes}
            onChangeView={changeView}
            deleteThreadType={deleteThreadType}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default ThreadTypes
