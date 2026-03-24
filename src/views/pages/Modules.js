import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import RoleService from '../../features/authorization/roles.service'
import PermissionService from '../../features/authorization/permissions.service'
import ModuleService from '../../features/modules.service'
import List from './module/List'
import Edit from './module/Edit'
import Create from './module/Create'

const Modules = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Módulos' })
  const [data, setData] = useState({})
  const [role, setRole] = useState('')
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'show' && view.role?.id) {
      findRole(view.role.id)
    }
    setLoading(true)
    setRole('')
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

  const editRole = async (id, data) => {
    try {
      const response = await RoleService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findRole = async (id) => {
    try {
      const response = await RoleService.find(id)
      setRole(response.data.role)
      return response
    } catch (error) {
      throw error
    }
  }

  const allPermissions = async (params) => {
    setLoading(true)
    try {
      const response = await PermissionService.all(params)
      setPermissions(response.data)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createModule} errors={errors} />

      case 'edit':
        return (
          <Edit role={view.rol} onChangeView={changeView} onSubmit={editRole} errors={errors} />
        )

      case 'show':
        return (
          <Show
            role={role}
            loading={loading}
            onChangeView={changeView}
            errors={errors}
            permissions={permissions}
            allPermissions={allPermissions}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchModules={fetchModules}
            onChangeView={changeView}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Modules
