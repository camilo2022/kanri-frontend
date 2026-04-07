import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SubmoduleService from '../../services/submodules.service'
import RoleService from '../../services/roles.service'
import Modules from './Modules'
import List from './module/Submodule/List'
import Edit from './module/Submodule/Edit'
import Create from './module/Submodule/Create'

const Submodules = ({ module }) => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Submódulos' })
  const [data, setData] = useState({})
  const [submodule, setSubmodule] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [roles, setRoles] = useState({})

  useEffect(() => {
    if (view.name === 'create') {
      allRoles()
    }
    if (view.name === 'edit' && view.submodule?.id) {
      findSubmodule(view.submodule.id)
      allRoles()
    }
    if (view.name === 'show' && view.submodule?.id) {
      findSubmodule(view.submodule.id)
    }
    setLoading(true)
    setSubmodule('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Submódulos' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchSubmodules = async (module_id, params) => {
    try {
      const response = await SubmoduleService.all(module_id, params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createSubmodule = async (data) => {
    try {
      const response = await SubmoduleService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editSubmodule = async (module_id, data) => {
    try {
      const response = await SubmoduleService.update(module_id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findSubmodule = async (id) => {
    try {
      const response = await SubmoduleService.find(id)
      setSubmodule(response.data.submodule)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const deleteSubmodule = async (id) => {
    try {
      const response = await SubmoduleService.delete_submodule(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await SubmoduleService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
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
            onSubmit={createSubmodule}
            errors={errors}
            roles={roles}
            moduleId={module.id}
          />
        )

      case 'edit':
        return (
          <Edit
            submodule={submodule}
            onChangeView={changeView}
            onSubmit={editSubmodule}
            errors={errors}
            roles={roles}
          />
        )

      case 'back':
        return <Modules />

      default:
        return (
          <List
            data={data}
            loading={loading}
            moduleId={module.id}
            fetchSubmodules={fetchSubmodules}
            onChangeView={changeView}
            deleteSubmodule={deleteSubmodule}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Submodules
