import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SubcategoriesService from '../../services/subcategories.service'
import CategoriesService from '../../services/categories.service'
import List from './categories/subcategories/List'
import Edit from './categories/subcategories/Edit'
import Create from './categories/subcategories/Create'
import Categories from './Categories'

const Subcategories = ({ category }) => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Subcategorías' })
  const [data, setData] = useState({})
  const [subcategory, setSubcategory] = useState({})
  const [categories, setCategories] = useState({})
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
    } finally {
      setLoading(false)
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

  const allCategories = async (params) => {
    try {
      const response = await CategoriesService.all(params)
      setCategories(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
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
            category_id={category.id}
          />
        )

      case 'edit':
        return (
          <Edit
            subcategory={subcategory}
            onChangeView={changeView}
            onSubmit={editSubcategory}
            errors={errors}
            category_id={category.id}
          />
        )

      case 'back':
        return <Categories />

      case 'show':
        return (
          <Show
            subcategory={subcategory}
            categories={categories}
            loading={loading}
            onChangeView={changeView}
            errors={errors}
            allCategories={allCategories}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            category={category}
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
