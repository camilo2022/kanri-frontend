import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import GroupsService from '../../services/groups.service'
import List from './groups/List'
import Create from './groups/Create'
import Edit from './groups/Edit'

const Groups = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Grupos' })
  const [data, setData] = useState({})
  const [group, setGroup] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.group?.id) {
      findGroup(view.group.id)
    }
    setLoading(true)
    setGroup('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Grupos' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchGroups = async (params) => {
    try {
      const response = await GroupsService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createGroup = async (data) => {
    try {
      const response = await GroupsService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editGroup = async (id, data) => {
    try {
      const response = await GroupsService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findGroup = async (id) => {
    try {
      const response = await GroupsService.find(id)
      setGroup(response.data.group)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteGroup = async (id) => {
    try {
      const response = await GroupsService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await GroupsService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createGroup} errors={errors} />

      case 'edit':
        return <Edit group={group} onChangeView={changeView} onSubmit={editGroup} errors={errors} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchGroups={fetchGroups}
            onChangeView={changeView}
            deleteGroup={deleteGroup}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Groups
