import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import CollectionsService from '../../services/collections.service'
import List from './collections/List'
import Create from './collections/Create'
import Edit from './collections/Edit'

const Collections = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Colecciones' })
  const [data, setData] = useState({})
  const [collection, setCollection] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setLoading(true)
    setCollection('')
    if (view.name === 'edit' && view.collection?.id) {
      findCollection(view.collection.id)
    }
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Colecciones' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchCollections = async (params) => {
    try {
      const response = await CollectionsService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createCollection = async (data) => {
    try {
      const response = await CollectionsService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editCollection = async (id, data) => {
    try {
      const response = await CollectionsService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findCollection = async (id) => {
    try {
      const response = await CollectionsService.find(id)
      setCollection(response.data.collection)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteCollection = async (id) => {
    try {
      const response = await CollectionsService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await CollectionsService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createCollection} errors={errors} />

      case 'edit':
        return (
          <Edit
            collection={collection}
            onChangeView={changeView}
            onSubmit={editCollection}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchCollections={fetchCollections}
            onChangeView={changeView}
            deleteCollection={deleteCollection}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Collections
