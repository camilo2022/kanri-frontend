import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import ProductsService from '../../services/products.service'
import ProcessesService from '../../services/processes.service'
import TrademarksService from '../../services/trademarks.service'
import CategoriesService from '../../services/categories.service'
import SubcategoriesService from '../../services/subcategories.service'
import List from './products/List'
import Create from './products/Create'
import Edit from './products/Edit'
import TechnicalSheets from './TechnicalSheets'

const Products = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Productos' })
  const [data, setData] = useState({})
  const [processes, setProcesses] = useState({})
  const [trademarks, setTrademarks] = useState({})
  const [categories, setCategories] = useState({})
  const [subcategories, setSubcategories] = useState({})
  const [product, setProduct] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null)

  useEffect(() => {
    setLoading(true)
    setProduct('')
    if (view.name === 'edit' && view.product?.id) {
      findProduct(view.product.id)
    }
    if (view.name === 'technical_sheet' && view.product?.id) {
      findProduct(view.product.id)
    }
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Productos' })
      fetchProcesses({ in_technical_sheet: true })
      fetchTrademarks()
      fetchCategories()
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchProducts = async (params) => {
    try {
      const response = await ProductsService.all(params)
      setData(response.data)
      setStatus(response.data.status_technical_sheet)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchProcesses = async (params) => {
    try {
      const response = await ProcessesService.all(params)
      setProcesses(
        Array.isArray(response.data.processes)
          ? response.data.processes.map((process) => ({
              label: process.name.charAt(0).toUpperCase() + process.name.slice(1).toLowerCase(),
              key: `technical_sheet_detail_${process.id}`,
            }))
          : [],
      )
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchTrademarks = async (params) => {
    try {
      const response = await TrademarksService.all(params)
      setTrademarks(
        Array.isArray(response.data.trademarks)
          ? response.data.trademarks.map((trademark) => ({
              label: trademark.name,
              value: trademark.id,
              group: trademark.group[0].name,
            }))
          : [],
      )
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async (params) => {
    try {
      const response = await CategoriesService.all(params)
      setCategories(
        Array.isArray(response.data.categories)
          ? response.data.categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))
          : [],
      )
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchSubcategories = async (category_id, params) => {
    try {
      const response = await SubcategoriesService.all(category_id, params)
      setSubcategories(
        Array.isArray(response.data.subcategories)
          ? response.data.subcategories.map((subcategory) => ({
              label: subcategory.name,
              value: subcategory.id,
            }))
          : [],
      )
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async (data) => {
    try {
      const response = await ProductsService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editProduct = async (id, data) => {
    try {
      const response = await ProductsService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findProduct = async (id) => {
    try {
      const response = await ProductsService.find(id)
      setProduct(response.data.product)
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
            trademarks={trademarks}
            categories={categories}
            subcategories={subcategories}
            onChangeView={changeView}
            fetchSubcategories={fetchSubcategories}
            onSubmit={createProduct}
            errors={errors}
          />
        )

      case 'edit':
        return (
          <Edit
            product={product}
            trademarks={trademarks}
            categories={categories}
            subcategories={subcategories}
            onChangeView={changeView}
            fetchSubcategories={fetchSubcategories}
            onSubmit={editProduct}
            errors={errors}
          />
        )

      case 'technical_sheet':
        return <TechnicalSheets product_id={product.id} action={view.action} />

      default:
        return (
          <List
            data={data}
            processes={processes}
            loading={loading}
            fetchProducts={fetchProducts}
            onChangeView={changeView}
            errors={errors}
            status={status}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Products
