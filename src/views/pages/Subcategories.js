import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SubcategoriesService from '../../services/subcategories.service'
import Categories from './Categories'
import List from './categories/subcategories/List'
import Edit from './categories/subcategories/Edit'
import Create from './categories/subcategories/Create'

const Subcategories = ({ category }) => {
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

  const fetchSubcategories = async (category_id, params) => {
    try {
      const response = await SubcategoriesService.all(category_id, params)
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

  const editSubcategory = async (category_id, data) => {
    try {
      const response = await SubcategoriesService.update(category_id, data)
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
        return (
          <Create
            onChangeView={changeView}
            onSubmit={createSubcategory}
            errors={errors}
            categoryId={category.id}
          />
        )

      case 'edit':
        return (
          <Edit
            subcategory={subcategory}
            onChangeView={changeView}
            onSubmit={editSubcategory}
            errors={errors}
            categoryId={category.id}
          />
        )

      case 'back':
        return <Categories />

      default:
        return (
          <List
            data={data}
            loading={loading}
            categoryId={category.id}
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
