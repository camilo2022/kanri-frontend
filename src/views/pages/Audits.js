import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import AuditService from '../../services/audits.service'
import UserService from '../../services/users.service'
import List from './logs/List'
import Record from './logs/Record'

const Audits = () => {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const viewName = searchParams.get('view') || 'list'
  const [view, setView] = useState({
    name: viewName,
    title: viewName === 'record' ? 'Filtrar Registro' : 'Listar Auditorías',
  })
  const [data, setData] = useState({})
  const [audit, setAudit] = useState({})
  const [users, setUsers] = useState({})
  const [models, setModels] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const name = searchParams.get('view') || 'list'
    setView({
      name,
      title: name === 'record' ? 'Filtrar Registro' : 'Listar Auditorías',
    })
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    setAudit('')
    if (view.name === 'list') {
      allUsers()
      dispatch({ type: 'set', action: 'Listar Auditorías' })
    }
    if (view.name === 'record') {
      allUsers()
      dispatch({ type: 'set', action: 'Filtrar Registro' })
    }
  }, [view.name])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchAudits = async (params) => {
    try {
      const response = await AuditService.all(params)
      setData(response.data)
      setModels(response.data.model_types)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const findAudit = async (id) => {
    try {
      setAudit(null)
      const response = await AuditService.find(id)
      setAudit(response.data.audit)
      return response
    } catch (error) {
      throw error
    }
  }

  const allUsers = async () => {
    try {
      const response = await UserService.all()
      setUsers(response.data.users)
    } catch (error) {
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'record':
        return (
          <Record
            data={data}
            models={models}
            audit={audit}
            loading={loading}
            fetchAudits={fetchAudits}
            onChangeView={changeView}
            findAudit={findAudit}
            errors={errors}
            users={users}
          />
        )

      default:
        return (
          <List
            data={data}
            models={models}
            audit={audit}
            loading={loading}
            fetchAudits={fetchAudits}
            onChangeView={changeView}
            findAudit={findAudit}
            errors={errors}
            users={users}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Audits
