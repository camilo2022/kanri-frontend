import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import GendersService from '../../services/genders.service'
import List from './genders/List'
import Create from './genders/Create'
import Edit from './genders/Edit'

const Genders = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Generos' })
  const [data, setData] = useState({})
  const [gender, setGender] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.gender?.id) {
      findGender(view.gender.id)
    }
    setLoading(true)
    setGender('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Generos' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchGenders = async (params) => {
    try {
      const response = await GendersService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createGender = async (data) => {
    try {
      const response = await GendersService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editGender = async (id, data) => {
    try {
      const response = await GendersService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findGender = async (id) => {
    try {
      const response = await GendersService.find(id)
      setGender(response.data.gender)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteGender = async (id) => {
    try {
      const response = await GendersService.delete_gender(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await GendersService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createGender} errors={errors} />

      case 'edit':
        return (
          <Edit gender={gender} onChangeView={changeView} onSubmit={editGender} errors={errors} />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchGenders={fetchGenders}
            onChangeView={changeView}
            deleteGender={deleteGender}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Genders
