import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import DocumentTypesService from '../../services/document_types.service'
import PersonTypesService from '../../services/person_types.service'
import List from './personTypes/documentTypes/List'
import Create from './personTypes/documentTypes/Create'
import Edit from './personTypes/documentTypes/Edit'
import Setting from './personTypes/documentTypes/Settings'
import PersonTypes from './PersonTypes'

const DocumentTypes = ({ person_type_id }) => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipos de Documentos' })
  const [data, setData] = useState({})
  const [documentType, setDocumentType] = useState({})
  const [personType, SetPersonType] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!person_type_id) return
    findPersonType(person_type_id)
    if (view.name === 'edit' && view.document_type?.id) {
      findDocumentType(view.document_type.id)
    }
    setLoading(true)
    setDocumentType('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipos de Documentos' })
    }
    if (view.name === 'settings' && view.document_type?.id) {
      findDocumentType(view.document_type.id)
    }
  }, [view, person_type_id])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const findPersonType = async (id) => {
    try {
      const response = await PersonTypesService.find(id)
      SetPersonType(response.data.person_type)
      return response
    } catch (error) {
      throw error
    }
  }

  const fetchDocumentTypes = async (person_type_id, params) => {
    try {
      const response = await DocumentTypesService.all(person_type_id, params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createDocumentType = async (data) => {
    try {
      const response = await DocumentTypesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editDocumentType = async (id, data) => {
    try {
      const response = await DocumentTypesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findDocumentType = async (id) => {
    try {
      const response = await DocumentTypesService.find(id)
      setDocumentType(response.data.document_type)
      return response
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteDocumentType = async (id) => {
    try {
      const response = await DocumentTypesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await DocumentTypesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const settings = async (id, data) => {
    try {
      const response = await DocumentTypesService.settings(id, data)
      setErrors({})
      setDocumentType(response.data.document_type)
      return response
    } catch (error) {
      setErrors(error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return (
          <Create
            person_type={personType}
            onChangeView={changeView}
            onSubmit={createDocumentType}
            errors={errors}
          />
        )

      case 'edit':
        return (
          <Edit
            person_type={personType}
            document_type={documentType}
            onChangeView={changeView}
            onSubmit={editDocumentType}
            errors={errors}
          />
        )

      case 'settings':
        return (
          <Setting
            document_type={documentType}
            onChangeView={changeView}
            errors={errors}
            loading={loading}
            settings={settings}
          />
        )

      case 'back':
        return <PersonTypes />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchDocumentTypes={fetchDocumentTypes}
            onChangeView={changeView}
            deleteDocumentType={deleteDocumentType}
            restore={restore}
            errors={errors}
            person_type={personType}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default DocumentTypes
