import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SubprocessesService from '../../services/subprocesses.service'
import List from './processes/subprocesses/List'
import Create from './processes/subprocesses/Create'
import Edit from './processes/subprocesses/Edit'
import Processes from './Processes'
import Operations from './Operations'

const Subprocesses = ({ process }) => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Subprocesos' })
  const [data, setData] = useState({})
  const [subprocess, setSubprocess] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setLoading(true)
    setSubprocess('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Subprocesos' })
    }
    if (view.name === 'edit' && view.subprocess?.id) {
      findSubprocess(view.subprocess?.id)
    }
    if (view.name === 'show' && view.subprocess?.id) {
      findSubprocess(view.subprocess?.id)
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchSubprocesses = async (process_id, params) => {
    try {
      const response = await SubprocessesService.all(process_id, params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createSubprocess = async (data) => {
    try {
      const response = await SubprocessesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editSubprocess = async (id, data) => {
    try {
      const response = await SubprocessesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findSubprocess = async (id) => {
    try {
      const response = await SubprocessesService.find(id)
      setSubprocess(response.data.subprocess)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteSubprocess = async (id) => {
    try {
      const response = await SubprocessesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await SubprocessesService.restore(id)
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
            onSubmit={createSubprocess}
            errors={errors}
            process={process}
          />
        )

      case 'edit':
        return (
          <Edit
            process={process}
            subprocess={subprocess}
            onChangeView={changeView}
            onSubmit={editSubprocess}
            errors={errors}
          />
        )

      case 'back':
        return <Processes />

      case 'show':
        return <Operations subprocess={subprocess} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchSubprocesses={fetchSubprocesses}
            onChangeView={changeView}
            deleteSubprocess={deleteSubprocess}
            restore={restore}
            errors={errors}
            process={process}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Subprocesses
