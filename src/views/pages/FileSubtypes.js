import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import FileSubtypesService from '../../services/file_subtypes.service'
import FileTypesService from '../../services/file_types.service'
import List from './fileTypes/fileSubtypes/List'
import Create from './fileTypes/fileSubtypes/Create'
import Edit from './fileTypes/fileSubtypes/Edit'
import FileTypes from './FileTypes'

const FileSubtypes = ({ file_type_id }) => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Subtipos de Archivos' })
  const [data, setData] = useState({})
  const [fileSubtype, setFileSubtype] = useState({})
  const [fileType, SetFileType] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!file_type_id) return
    findFileType(file_type_id)
    if (view.name === 'edit' && view.file_subtype?.id) {
      findFileSubtype(view.file_subtype.id)
    }
    setLoading(true)
    setFileSubtype('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Subtipos de Archivos' })
    }
  }, [view, file_type_id])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const findFileType = async (id) => {
    try {
      const response = await FileTypesService.find(id)
      SetFileType(response.data.file_type)
      return response
    } catch (error) {
      throw error
    }
  }

  const fetchFileSubtypes = async (file_type_id, params) => {
    try {
      const response = await FileSubtypesService.all(file_type_id, params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createFileSubtype = async (data) => {
    try {
      const response = await FileSubtypesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editFileSubtype = async (id, data) => {
    try {
      const response = await FileSubtypesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findFileSubtype = async (id) => {
    try {
      const response = await FileSubtypesService.find(id)
      setFileSubtype(response.data.file_subtype)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteFileSubtype = async (id) => {
    try {
      const response = await FileSubtypesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await FileSubtypesService.restore(id)
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
          <Create
            file_type={fileType}
            onChangeView={changeView}
            onSubmit={createFileSubtype}
            errors={errors}
          />
        )

      case 'edit':
        return (
          <Edit
            file_type={fileType}
            file_subtype={fileSubtype}
            onChangeView={changeView}
            onSubmit={editFileSubtype}
            errors={errors}
          />
        )

      case 'back':
        return <FileTypes />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchFileSubtypes={fetchFileSubtypes}
            onChangeView={changeView}
            deleteFileSubtype={deleteFileSubtype}
            restore={restore}
            errors={errors}
            file_type={fileType}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default FileSubtypes
