import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import PersonTypesService from '../../services/person_types.service'
import DocumentTypesService from '../../services/document_types.service'
import List from './personTypes/List'
import Create from './personTypes/Create'
import Edit from './personTypes/Edit'
import DocumentTypes from './DocumentTypes'

const PersonTypes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipos de Persona' })
  const [data, setData] = useState({})
  const [personType, setPersonType] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setLoading(true)
    setPersonType('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipos de Persona' })
    }
    if (view.name === 'edit' && view.person_type?.id) {
      findPersonType(view.person_type.id)
    }
    if (view.name === 'show' && view.person_type?.id) {
      findPersonType(view.person_type.id)
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchPersonTypes = async (params) => {
    try {
      const response = await PersonTypesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createPersonType = async (data) => {
    try {
      const response = await PersonTypesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editPersonType = async (id, data) => {
    try {
      const response = await PersonTypesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findPersonType = async (id) => {
    try {
      const response = await PersonTypesService.find(id)
      setPersonType(response.data.person_type)
      return response
    } catch (error) {
      throw error
    }
  }

  const deletePersonType = async (id) => {
    try {
      const response = await PersonTypesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await PersonTypesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createPersonType} errors={errors} />

      case 'edit':
        return (
          <Edit
            person_type={personType}
            onChangeView={changeView}
            onSubmit={editPersonType}
            errors={errors}
          />
        )

      case 'show':
        return <DocumentTypes person_type_id={personType.id} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchPersonTypes={fetchPersonTypes}
            onChangeView={changeView}
            deletePersonType={deletePersonType}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default PersonTypes
