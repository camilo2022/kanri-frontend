import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import CategoriesService from '../../services/categories.service'
import List from './categories/List'
import Create from './categories/Create'
import Edit from './categories/Edit'
import Subcategories from './Subcategories'

const Categories = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Categorías' })
  const [data, setData] = useState({})
  const [category, setCategory] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'show' && view.category?.id) {
      findCategory(view.category.id)
    }
    if (view.name === 'edit' && view.category?.id) {
      findCategory(view.category.id)
    }
    setLoading(true)
    setCategory('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Categorías' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchCategories = async (params) => {
    try {
      const response = await CategoriesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (data) => {
    try {
      const response = await CategoriesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editCategory = async (id, data) => {
    try {
      const response = await CategoriesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findCategory = async (id) => {
    try {
      const response = await CategoriesService.find(id)
      setCategory(response.data.category)
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteCategory = async (id) => {
    try {
      const response = await CategoriesService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await CategoriesService.restore(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return <Create onChangeView={changeView} onSubmit={createCategory} errors={errors} />

      case 'edit':
        return (
          <Edit
            category={category}
            onChangeView={changeView}
            onSubmit={editCategory}
            errors={errors}
          />
        )

      case 'show':
        return <Subcategories category={category} />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchCategories={fetchCategories}
            onChangeView={changeView}
            deleteCategory={deleteCategory}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Categories
