import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import HealthEntitiesService from '../../services/health_entities.service'
import List from './healthEntities/List'
import Create from './healthEntities/Create'
import Edit from './healthEntities/Edit'

const HealtEntities = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Entidades de Salud' })
  const [data, setData] = useState({})
  const [healthEntity, setHealthEntity] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.health_entity?.id) {
      findHealthEntity(view.health_entity.id)
    }
    setLoading(true)
    setHealthEntity('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Entidades de Salud' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchHealtEntities = async (params) => {
    try {
      const response = await HealthEntitiesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createHealthEntity = async (data) => {
    try {
      const response = await HealthEntitiesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editHealthEntity = async (id, data) => {
    try {
      const response = await HealthEntitiesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findHealthEntity = async (id) => {
    try {
      const response = await HealthEntitiesService.find(id)
      setHealthEntity(response.data.health_entity)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteHealthEntity = async (id) => {
    try {
      const response = await HealthEntitiesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await HealthEntitiesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createHealthEntity} errors={errors} />

      case 'edit':
        return (
          <Edit
            healthEntity={healthEntity}
            onChangeView={changeView}
            onSubmit={editHealthEntity}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchHealtEntities={fetchHealtEntities}
            onChangeView={changeView}
            deleteHealthEntity={deleteHealthEntity}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default HealtEntities
