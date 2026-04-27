import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import OperationsService from '../../services/operations.service'
import List from './processes/subprocesses/operations/List'
import Create from './processes/subprocesses/operations/Create'
import Edit from './processes/subprocesses/operations/Edit'
import Subprocesses from './Subprocesses'

const Operations = ({ subprocess }) => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Operaciones' })
  const [data, setData] = useState({})
  const [operation, setOperation] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setLoading(true)
    setOperation('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Operaciones' })
    }
    if (view.name === 'edit' && view.operation?.id) {
      findOperation(view.operation?.id)
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchOperations = async (subprocess_id, params) => {
    try {
      const response = await OperationsService.all(subprocess_id, params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createOperation = async (data) => {
    try {
      const response = await OperationsService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editOperation = async (id, data) => {
    try {
      console.log(id, data)
      const response = await OperationsService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findOperation = async (id) => {
    try {
      console.log(id)
      const response = await OperationsService.find(id)
      setOperation(response.data.operation)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteOperation = async (id) => {
    try {
      const response = await OperationsService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await OperationsService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  console.log(operation)

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return (
          <Create
            onChangeView={changeView}
            onSubmit={createOperation}
            errors={errors}
            subprocess={subprocess}
          />
        )

      case 'edit':
        return (
          <Edit
            subprocess={subprocess}
            operation={operation}
            onChangeView={changeView}
            onSubmit={editOperation}
            errors={errors}
          />
        )

      case 'back':
        return <Subprocesses process={subprocess.process[0]} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchOperations={fetchOperations}
            onChangeView={changeView}
            deleteOperation={deleteOperation}
            restore={restore}
            errors={errors}
            subprocess={subprocess}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Operations
