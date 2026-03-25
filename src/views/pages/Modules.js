import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import ModuleService from '../../services/modules.service'
import List from './module/List'
import Edit from './module/Edit'
import Create from './module/Create'
import Submodules from './Submodules'

const Modules = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Módulos' })
  const [data, setData] = useState({})
  const [module, setModule] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'show' && view.module?.id) {
      findModule(view.module.id)
    }
    setLoading(true)
    setModule('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Módulos' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchModules = async (params) => {
    try {
      const response = await ModuleService.all(params)
      setData(response.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const createModule = async (data) => {
    try {
      const response = await ModuleService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editModule = async (id, data) => {
    try {
      const response = await ModuleService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findModule = async (id) => {
    try {
      const response = await ModuleService.find(id)
      setModule(response.data.module)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteModule = async (id) => {
    try {
      const response = await ModuleService.delete_module(id)
      return response
    } catch (error) {
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await ModuleService.restore(id)
      return response
    } catch (error) {
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createModule} errors={errors} />

      case 'edit':
        return (
          <Edit
            module={view.module}
            onChangeView={changeView}
            onSubmit={editModule}
            errors={errors}
          />
        )

      case 'show':
        return <Submodules module={module} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchModules={fetchModules}
            onChangeView={changeView}
            deleteModule={deleteModule}
            restore={restore}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Modules
