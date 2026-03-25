import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import RoleService from '../../services/roles.service'
import PermissionService from '../../services/permissions.service'
import List from './role/List'
import Edit from './role/Edit'
import Create from './role/Create'
import Show from './role/Show'

const Roles = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Roles' })
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
      dispatch({ type: 'set', action: 'Listar Roles' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchRoles = async (params) => {
    try {
      const response = await RoleService.all(params)
      setData(response.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const createRole = async (data) => {
    try {
      const response = await RoleService.store(data)
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
        return <Create onChangeView={changeView} onSubmit={createRole} errors={errors} />

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
          <List data={data} loading={loading} fetchRoles={fetchRoles} onChangeView={changeView} />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Roles
