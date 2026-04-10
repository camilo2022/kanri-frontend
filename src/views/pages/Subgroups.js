import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SubgroupsService from '../../services/subgroups.service'
import List from './subgroups/List'
import Create from './subgroups/Create'
import Edit from './subgroups/Edit'

const Subgroups = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Subgrupos' })
  const [data, setData] = useState({})
  const [subgroup, setSubgroup] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.subgroup?.id) {
      findSubgroup(view.subgroup.id)
    }
    setLoading(true)
    setSubgroup('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Subgrupos' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchSubgroups = async (params) => {
    try {
      const response = await SubgroupsService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createSubgroup = async (data) => {
    try {
      const response = await SubgroupsService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editSubgroup = async (id, data) => {
    try {
      const response = await SubgroupsService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findSubgroup = async (id) => {
    try {
      const response = await SubgroupsService.find(id)
      setSubgroup(response.data.subgroup)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteSubgroup = async (id) => {
    try {
      const response = await SubgroupsService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await SubgroupsService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createSubgroup} errors={errors} />

      case 'edit':
        return (
          <Edit
            subgroup={subgroup}
            onChangeView={changeView}
            onSubmit={editSubgroup}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchSubgroups={fetchSubgroups}
            onChangeView={changeView}
            deleteSubgroup={deleteSubgroup}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Subgroups
