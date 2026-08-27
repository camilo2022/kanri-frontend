import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import FileTypesService from '../../services/file_types.service'
import FileSubtypesService from '../../services/file_subtypes.service'
import List from './fileTypes/List'
import Create from './fileTypes/Create'
import Edit from './fileTypes/Edit'
import FileSubtypes from './FileSubtypes'

const FileTypes = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Tipos de Archivo' })
  const [data, setData] = useState({})
  const [fileType, setFileType] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setLoading(true)
    setFileType('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Tipos de Archivo' })
    }
    if (view.name === 'edit' && view.file_type?.id) {
      findFileType(view.file_type.id)
    }
    if (view.name === 'show' && view.file_type?.id) {
      findFileType(view.file_type.id)
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchFileTypes = async (params) => {
    try {
      const response = await FileTypesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createFileType = async (data) => {
    try {
      const response = await FileTypesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editFileType = async (id, data) => {
    try {
      const response = await FileTypesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findFileType = async (id) => {
    try {
      const response = await FileTypesService.find(id)
      setFileType(response.data.file_type)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteFileType = async (id) => {
    try {
      const response = await FileTypesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await FileTypesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createFileType} errors={errors} />

      case 'edit':
        return (
          <Edit
            file_type={fileType}
            onChangeView={changeView}
            onSubmit={editFileType}
            errors={errors}
          />
        )

      case 'show':
        return <FileSubtypes file_type_id={fileType.id} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchFileTypes={fetchFileTypes}
            onChangeView={changeView}
            deleteFileType={deleteFileType}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default FileTypes
