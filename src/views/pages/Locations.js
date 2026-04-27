import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import LocationsService from '../../services/locations.service'
import ProcessesService from '../../services/processes.service'
import List from './locations/List'
import Create from './locations/Create'
import Edit from './locations/Edit'

const Locations = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Ubicaciones' })
  const [data, setData] = useState({})
  const [processes, setProcesses] = useState({})
  const [location, setLocation] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setLoading(true)
    setLocation('')
    if (view.name === 'edit' && view.location?.id) {
      findLocation(view.location.id)
      allProcesses()
    }
    if (view.name === 'create') {
      allProcesses()
    }
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Ubicaciones' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchLocations = async (params) => {
    try {
      const response = await LocationsService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createLocation = async (data) => {
    try {
      const response = await LocationsService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editLocation = async (id, data) => {
    try {
      const response = await LocationsService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findLocation = async (id) => {
    try {
      const response = await LocationsService.find(id)
      setLocation(response.data.location)
      return response
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteLocation = async (id) => {
    try {
      const response = await LocationsService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await LocationsService.restore(id)
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const setting = async (id, data) => {
    try {
      const response = await LocationsService.setting(id, data)
      setErrors({})
      setLocation(response.data.location)
      return response
    } catch (error) {
      console.log(error)
      setErrors(error)
      throw error
    }
  }

  const allProcesses = async (params) => {
    try {
      const response = await ProcessesService.all(params)
      setProcesses(response.data.processes)
    } catch (error) {
      setErrors(error.error)
      throw error
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
            onSubmit={createLocation}
            errors={errors}
            processes={processes}
          />
        )

      case 'edit':
        return (
          <Edit
            location={location}
            onChangeView={changeView}
            onSubmit={editLocation}
            errors={errors}
            processes={processes}
          />
        )

      case 'show':
        return (
          <Show
            location={location}
            onChangeView={changeView}
            errors={errors}
            loading={loading}
            setting={setting}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchLocations={fetchLocations}
            onChangeView={changeView}
            deleteLocation={deleteLocation}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Locations
