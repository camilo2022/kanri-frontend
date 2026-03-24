import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import RoleService from '../../features/authorization/roles.service'
import PermissionService from '../../features/authorization/permissions.service'
import List from './role/List'
import Edit from './role/Edit'
import Create from './role/Create'

const Role = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Roles' })
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    /*
    if (view.name === 'show' && view.user?.id) {
      findUser(view.user.id)
      allRoles()
    }*/
    setLoading(true)
    //setUser('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Roles' })
    }
  }, [view])

  const changeView = (newView) => {
    console.log('Estos en el new', newView)
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

  const fetchPermissions = async (params) => {
    try {
      const response = await PermissionService.all(params)
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
      const response = await UserService.find(id)
      setUser(response.data.user)
      return response
    } catch (error) {
      throw error
    }
  }
  /*
  const deleteUser = async (id) => {
    try {
      const response = await UserService.delete_user(id)
      const users = await UserService.all()
      setData(users.data)
      return response
    } catch (error) {
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await UserService.restore(id)
      const users = await UserService.all()
      setData(users.data)
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
      console.log(error)
    } finally {
      setLoading(false)
    }
  }
*/
  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createRole} errors={errors} />

      case 'edit':
        return (
          <Edit role={view.rol} onChangeView={changeView} onSubmit={editRole} errors={errors} />
        )
      /*
      case 'show':
        return (
          <Show
            user={user}
            onChangeView={changeView}
            errors={errors}
            roles={roles}
            assign={assign}
            remove={remove}
          />
        )
*/
      default:
        return (
          <List data={data} loading={loading} fetchRoles={fetchRoles} onChangeView={changeView} />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Role
