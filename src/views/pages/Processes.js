import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import ProcessesService from '../../services/processes.service'
import List from './processes/List'
import Create from './processes/Create'
import Edit from './processes/Edit'
import Subprocesses from './Subprocesses'

const Processes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Procesos' })
  const [data, setData] = useState({})
  const [process, setProcess] = useState({})
  const [processes, setProcesses] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setLoading(true)
    setProcess('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Procesos' })
    }
    if (view.name === 'create') {
      fetchProcesses()
    }
    if (view.name === 'edit' && view.process?.id) {
      findProcess(view.process?.id)
      fetchProcesses({ process_id: view.process?.id, only_next: true })
    }
    if (view.name === 'show' && view.process?.id) {
      findProcess(view.process?.id)
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchProcesses = async (params) => {
    try {
      const response = await ProcessesService.all(params)
      setData(response.data)
      setProcesses(response.data.processes)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createProcess = async (data) => {
    try {
      const response = await ProcessesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editProcess = async (id, data) => {
    try {
      const response = await ProcessesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findProcess = async (id) => {
    try {
      const response = await ProcessesService.find(id)
      setProcess(response.data.process)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteProcess = async (id) => {
    try {
      const response = await ProcessesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await ProcessesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return (
          <Create
            onChangeView={changeView}
            onSubmit={createProcess}
            errors={errors}
            processes={processes}
          />
        )

      case 'edit':
        return (
          <Edit
            process={process}
            onChangeView={changeView}
            onSubmit={editProcess}
            errors={errors}
            processes={processes}
          />
        )

      case 'show':
        return <Subprocesses process={process} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchProcesses={fetchProcesses}
            onChangeView={changeView}
            deleteProcess={deleteProcess}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Processes
