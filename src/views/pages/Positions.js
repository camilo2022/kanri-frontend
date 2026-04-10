import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import PositionsService from '../../services/positions.service'
import RoleService from '../../services/roles.service'
import Areas from './Areas'
import List from './areas/positions/List'
import Edit from './areas/positions/Edit'
import Create from './areas/positions/Create'
import Show from './areas/positions/Show'

const Positions = ({ area }) => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Cargos' })
  const [data, setData] = useState({})
  const [position, setPosition] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [roles, setRoles] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.position?.id) {
      findPosition(view.position.id)
    }
    if (view.name === 'show' && view.position?.id) {
      findPosition(view.position.id)
      allRoles()
    }
    setLoading(true)
    setPosition('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Cargos' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchPositions = async (area_id, params) => {
    try {
      const response = await PositionsService.all(area_id, params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createPosition = async (data) => {
    try {
      const response = await PositionsService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editPosition = async (area_id, data) => {
    try {
      const response = await PositionsService.update(area_id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findPosition = async (id) => {
    try {
      const response = await PositionsService.find(id)
      setPosition(response.data.position)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const deletePosition = async (id) => {
    try {
      const response = await PositionsService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await PositionsService.restore(id)
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

  const assign = async (id, permission_id) => {
    try {
      const response = await PositionsService.assign(id, permission_id)
      setPosition(response.data.position)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const remove = async (id, permission_id) => {
    try {
      const response = await PositionsService.remove(id, permission_id)
      setPosition(response.data.position)
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
            onSubmit={createPosition}
            errors={errors}
            areaId={area.id}
          />
        )

      case 'edit':
        return (
          <Edit
            position={position}
            onChangeView={changeView}
            onSubmit={editPosition}
            errors={errors}
            areaId={area.id}
          />
        )

      case 'back':
        return <Areas />

      case 'show':
        return (
          <Show
            position={position}
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
            areaId={area.id}
            fetchPositions={fetchPositions}
            onChangeView={changeView}
            deletePosition={deletePosition}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Positions
