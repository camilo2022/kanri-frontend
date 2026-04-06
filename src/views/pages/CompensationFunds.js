import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import CompensationFundsService from '../../services/compensation_funds.service'
import List from './compensationFunds/List'
import Create from './compensationFunds/Create'
import Edit from './compensationFunds/Edit'

const CompensationFunds = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Cajas de Compensación' })
  const [data, setData] = useState({})
  const [compensationFund, setCompensationFund] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.compensationFund?.id) {
      findCompensationFund(view.compensationFund.id)
    }
    setLoading(true)
    setCompensationFund('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Cajas de Compensación' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchCompensationFunds = async (params) => {
    try {
      const response = await CompensationFundsService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createCompensationFund = async (data) => {
    try {
      const response = await CompensationFundsService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editCompensationFund = async (id, data) => {
    try {
      const response = await CompensationFundsService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findCompensationFund = async (id) => {
    try {
      const response = await CompensationFundsService.find(id)
      setCompensationFund(response.data.compensation_fund)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteCompensationFund = async (id) => {
    try {
      const response = await CompensationFundsService.delete_compensation_fund(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await CompensationFundsService.restore(id)
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
          <Create onChangeView={changeView} onSubmit={createCompensationFund} errors={errors} />
        )

      case 'edit':
        return (
          <Edit
            compensationFund={compensationFund}
            onChangeView={changeView}
            onSubmit={editCompensationFund}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchCompensationFunds={fetchCompensationFunds}
            onChangeView={changeView}
            deleteCompensationFund={deleteCompensationFund}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default CompensationFunds
