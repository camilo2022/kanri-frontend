import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import TypologiesService from '../../services/typologies.service'
import ProcessesService from '../../services/processes.service'
import List from './typologies/List'
import Create from './typologies/Create'
import Edit from './typologies/Edit'

const Typologies = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipologias' })
  const [data, setData] = useState()
  const [typology, setTypology] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [processes, setProcesses] = useState()

  useEffect(() => {
    setLoading(true)
    setTypology('')
    fetchProcesses()
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipologias' })
    }
    if (view.name === 'edit' && view.typology?.id) {
      findTypology(view.typology.id)
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
      setProcesses(response.data.processes)
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const fetchTypologies = async (params) => {
    try {
      const response = await TypologiesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createTypology = async (data) => {
    try {
      const response = await TypologiesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editTypology = async (id, data) => {
    try {
      const response = await TypologiesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findTypology = async (id) => {
    try {
      const response = await TypologiesService.find(id)
      setTypology(response.data.typology)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteTypology = async (id) => {
    try {
      const response = await TypologiesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await TypologiesService.restore(id)
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
            onSubmit={createTypology}
            errors={errors}
            processes={processes}
          />
        )

      case 'edit':
        return (
          <Edit
            typology={typology}
            onChangeView={changeView}
            onSubmit={editTypology}
            errors={errors}
            processes={processes}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchTypologies={fetchTypologies}
            onChangeView={changeView}
            deleteTypology={deleteTypology}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Typologies
