import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import AccountTypesService from '../../services/account_types.service'
import List from './accountTypes/List'
import Create from './accountTypes/Create'
import Edit from './accountTypes/Edit'

const AccountTypes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipos de Cuenta' })
  const [data, setData] = useState({})
  const [accountType, setAccountType] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.account_type?.id) {
      findAccountType(view.account_type.id)
    }
    setLoading(true)
    setAccountType('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipos de Cuenta' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchAccountTypes = async (params) => {
    try {
      const response = await AccountTypesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createAccountType = async (data) => {
    try {
      const response = await AccountTypesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editAccountType = async (id, data) => {
    try {
      const response = await AccountTypesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findAccountType = async (id) => {
    try {
      const response = await AccountTypesService.find(id)
      setAccountType(response.data.account_type)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteAccountType = async (id) => {
    try {
      const response = await AccountTypesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await AccountTypesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createAccountType} errors={errors} />

      case 'edit':
        return (
          <Edit
            account_type={accountType}
            onChangeView={changeView}
            onSubmit={editAccountType}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchAccountTypes={fetchAccountTypes}
            onChangeView={changeView}
            deleteAccountType={deleteAccountType}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default AccountTypes
