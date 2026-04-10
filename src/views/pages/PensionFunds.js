import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import PensionFundsService from '../../services/pension_funds.service'
import List from './pensionFunds/List'
import Create from './pensionFunds/Create'
import Edit from './pensionFunds/Edit'

const PensionFunds = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Fondos de Pensión' })
  const [data, setData] = useState({})
  const [pensionFund, setPensionFund] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.pensionFund?.id) {
      findPensionFund(view.pensionFund.id)
    }
    setLoading(true)
    setPensionFund('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Fondos de Pensión' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchPensionFunds = async (params) => {
    try {
      const response = await PensionFundsService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createPensionFund = async (data) => {
    try {
      const response = await PensionFundsService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editPensionFund = async (id, data) => {
    try {
      const response = await PensionFundsService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findPensionFund = async (id) => {
    try {
      const response = await PensionFundsService.find(id)
      setPensionFund(response.data.pension_fund)
      return response
    } catch (error) {
      throw error
    }
  }

  const deletePensionFund = async (id) => {
    try {
      const response = await PensionFundsService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await PensionFundsService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createPensionFund} errors={errors} />

      case 'edit':
        return (
          <Edit
            pensionFund={pensionFund}
            onChangeView={changeView}
            onSubmit={editPensionFund}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchPensionFunds={fetchPensionFunds}
            onChangeView={changeView}
            deletePensionFund={deletePensionFund}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default PensionFunds
