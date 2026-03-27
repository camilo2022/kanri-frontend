import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import PermissionService from '../../services/permissions.service'
import RoleService from '../../services/roles.service'
import List from './permission/List'
import Create from './permission/Create'
import Edit from './permission/Edit'

const Permissions = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Permisos' })
  const [data, setData] = useState({})
  const [permission, setPermission] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [roles, setRoles] = useState({})

  useEffect(() => {
    if (view.name === 'create') {
      allRoles()
    }
    if (view.name === 'edit') {
      findPermission(view.permission.id)
      allRoles()
    }
    setLoading(true)
    setPermission('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Permisos' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchPermissions = async (params) => {
    try {
      const response = await PermissionService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createPermission = async (data) => {
    try {
      const response = await PermissionService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editPermission = async (id, data) => {
    try {
      const response = await PermissionService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findPermission = async (id) => {
    try {
      const response = await PermissionService.find(id)
      setPermission(response.data.permission)
      return response
    } catch (error) {
      throw error
    }
  }

  const allRoles = async (params) => {
    setLoading(true)
    try {
      const response = await RoleService.all(params)
      setRoles(response.data.roles)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return (
          <Create
            onChangeView={changeView}
            onSubmit={createPermission}
            errors={errors}
            roles={roles}
          />
        )

      case 'edit':
        return (
          <Edit
            roles={roles}
            permission={permission}
            onChangeView={changeView}
            onSubmit={editPermission}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchPermissions={fetchPermissions}
            onChangeView={changeView}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Permissions
