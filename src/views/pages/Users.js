import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import UserService from '../../services/users.service'
import RoleService from '../../services/roles.service'
import EmployeesService from '../../services/employees.service'
import List from './user/List'
import Create from './user/Create'
import Edit from './user/Edit'
import Show from './user/Show'

const Users = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Usuario', user: null })
  const [data, setData] = useState({})
  const [roles, setRoles] = useState({})
  const [employees, setEmployees] = useState({})
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'show' && view.user?.id) {
      findUser(view.user.id)
      allRoles()
    }
    if (view.name === 'create') {
      allEmployees()
    }
    setLoading(true)
    setUser('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Usuarios' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    setView(newView)
    dispatch({ type: 'set', action: newView.title })
  }

  const fetchUsers = async (params) => {
    try {
      const response = await UserService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (data) => {
    try {
      const response = await UserService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editUser = async (id, data) => {
    try {
      const response = await UserService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findUser = async (id) => {
    try {
      const response = await UserService.find(id)
      setUser(response.data.user)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteUser = async (id) => {
    try {
      const response = await UserService.delete_user(id)
      return response
    } catch (error) {
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await UserService.restore(id)
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

  const allEmployees = async (params) => {
    setLoading(true)
    try {
      const response = await EmployeesService.all(params)
      setEmployees(response.data.employees)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const assign = async (id, permission_id) => {
    try {
      const response = await UserService.assign(id, permission_id)
      setUser(response.data.user)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const remove = async (id, permission_id) => {
    try {
      const response = await UserService.remove(id, permission_id)
      setUser(response.data.user)
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
            onSubmit={createUser}
            errors={errors}
            employees={employees}
          />
        )

      case 'edit':
        return (
          <Edit user={view.user} onChangeView={changeView} onSubmit={editUser} errors={errors} />
        )

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

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchUsers={fetchUsers}
            onChangeView={changeView}
            deleteUser={deleteUser}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Users
