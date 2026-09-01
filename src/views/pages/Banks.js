import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import BanksService from '../../services/banks.service'
import List from './banks/List'
import Create from './banks/Create'
import Edit from './banks/Edit'

const Banks = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Bancos' })
  const [data, setData] = useState({})
  const [bank, setBank] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.bank?.id) {
      findBank(view.bank.id)
    }
    setLoading(true)
    setBank('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Bancos' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchBanks = async (params) => {
    try {
      const response = await BanksService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createBank = async (data) => {
    try {
      const response = await BanksService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editBank = async (id, data) => {
    try {
      const response = await BanksService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findBank = async (id) => {
    try {
      const response = await BanksService.find(id)
      setBank(response.data.bank)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteBank = async (id) => {
    try {
      const response = await BanksService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await BanksService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createBank} errors={errors} />

      case 'edit':
        return <Edit bank={bank} onChangeView={changeView} onSubmit={editBank} errors={errors} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchBanks={fetchBanks}
            onChangeView={changeView}
            deleteBank={deleteBank}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Banks
