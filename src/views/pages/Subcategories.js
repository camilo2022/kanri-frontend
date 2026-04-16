import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SubcategoriesService from '../../services/subcategories.service'
import List from './subcategories/List'
import Edit from './subcategories/Edit'
import Create from './subcategories/Create'
import Show from './subcategories/Show'

const Subcategories = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Subcategorías' })
  const [data, setData] = useState({})
  const [subcategory, setSubcategory] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.subcategory?.id) {
      findSubcategory(view.subcategory.id)
    }
    if (view.name === 'show' && view.subcategory?.id) {
      findSubcategory(view.subcategory.id)
    }
    setLoading(true)
    setSubcategory('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Subcategorías' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchSubcategories = async (params) => {
    try {
      const response = await SubcategoriesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createSubcategory = async (data) => {
    try {
      const response = await SubcategoriesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editSubcategory = async (subcategory_id, data) => {
    try {
      const response = await SubcategoriesService.update(subcategory_id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findSubcategory = async (id) => {
    try {
      const response = await SubcategoriesService.find(id)
      setSubcategory(response.data.subcategory)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const deleteSubcategory = async (id) => {
    try {
      const response = await SubcategoriesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await SubcategoriesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createSubcategory} errors={errors} />

      case 'edit':
        return (
          <Edit
            subcategory={subcategory}
            onChangeView={changeView}
            onSubmit={editSubcategory}
            errors={errors}
          />
        )

      case 'show':
        return (
          <Show
            subcategory={subcategory}
            loading={loading}
            onChangeView={changeView}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchSubcategories={fetchSubcategories}
            onChangeView={changeView}
            deleteSubcategory={deleteSubcategory}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Subcategories
