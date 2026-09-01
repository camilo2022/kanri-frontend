import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import PeopleService from '../../services/people.service'
import GenderService from '../../services/gender.service'
import BloodTypeService from '../../services/blood_types.service'
import PersonTypeService from '../../services/person_types.service'
import DocumentTypeService from '../../services/document_types.service'
import List from './people/List'
import Create from './people/Create'
import Edit from './people/Edit'

const People = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Personas', user: null })
  const [data, setData] = useState({})
  const [genders, setGenders] = useState({})
  const [bloodTypes, setBloodTypes] = useState({})
  const [personTypes, setPersonTypes] = useState({})
  const [documentTypes, setDocumentTypes] = useState()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [person, setPerson] = useState()

  useEffect(() => {
    if (view.name === 'edit' && view.person?.id) {
      findPerson(view.person.id)
      allGender()
      allBloodType()
      allPersonType()
    }
    if (view.name === 'create') {
      allGender()
      allBloodType()
      allPersonType()
    }
    setPerson('')
    setLoading(true)
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Personas' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    setView(newView)
    dispatch({ type: 'set', action: newView.title })
  }

  const fetchPeople = async (params) => {
    try {
      const response = await PeopleService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createPerson = async (data) => {
    try {
      const response = await PeopleService.store(data)
      setErrors({})
      return response
    } catch (error) {
      console.log(error)
      setErrors(error.errors)
      throw error
    }
  }

  const allGender = async (params) => {
    try {
      const response = await GenderService.all(params)
      setGenders(response.data.genders)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const allBloodType = async (params) => {
    try {
      const response = await BloodTypeService.all(params)
      setBloodTypes(response.data.blood_types)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const allPersonType = async (params) => {
    try {
      const response = await PersonTypeService.all(params)
      setPersonTypes(response.data.person_types)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const fecthDocumentTypes = async (person_type_id, params) => {
    try {
      const response = await DocumentTypeService.all(person_type_id, params)
      setDocumentTypes(response.data.document_types)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const editPerson = async (id, data) => {
    try {
      const response = await PeopleService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findPerson = async (id) => {
    try {
      const response = await PeopleService.find(id)
      setPerson(response.data.person)
      return response
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deletePerson = async (id) => {
    try {
      const response = await PeopleService.destroy(id)
      return response
    } catch (error) {
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await PeopleService.restore(id)
      return response
    } catch (error) {
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return (
          <Create
            onChangeView={changeView}
            onSubmit={createPerson}
            errors={errors}
            genders={genders}
            bloodTypes={bloodTypes}
            personTypes={personTypes}
            fecthDocumentTypes={fecthDocumentTypes}
            documentTypes={documentTypes}
          />
        )

      case 'edit':
        return (
          <Edit
            person={person}
            onChangeView={changeView}
            onSubmit={editPerson}
            errors={errors}
            genders={genders}
            bloodTypes={bloodTypes}
            loading={loading}
            personTypes={personTypes}
            fecthDocumentTypes={fecthDocumentTypes}
            documentTypes={documentTypes}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchPeople={fetchPeople}
            onChangeView={changeView}
            deletePerson={deletePerson}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default People
