import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import RiskManagersService from '../../services/risk_managers.service'
import List from './riskManagers/List'
import Create from './riskManagers/Create'
import Edit from './riskManagers/Edit'

const RiskManagers = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Administradoras de Riegos' })
  const [data, setData] = useState({})
  const [riskManager, setRiskManager] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.risk_manager?.id) {
      findRiskManager(view.risk_manager.id)
    }
    setLoading(true)
    setRiskManager('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Administradoras de Riesgos' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchRiskManagers = async (params) => {
    try {
      const response = await RiskManagersService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createRiskManager = async (data) => {
    try {
      const response = await RiskManagersService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editRiskManager = async (id, data) => {
    try {
      const response = await RiskManagersService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findRiskManager = async (id) => {
    try {
      const response = await RiskManagersService.find(id)
      setRiskManager(response.data.risk_manager)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteRiskManager = async (id) => {
    try {
      const response = await RiskManagersService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await RiskManagersService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createRiskManager} errors={errors} />

      case 'edit':
        return (
          <Edit
            riskManager={riskManager}
            onChangeView={changeView}
            onSubmit={editRiskManager}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchRiskManagers={fetchRiskManagers}
            onChangeView={changeView}
            deleteRiskManager={deleteRiskManager}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default RiskManagers
