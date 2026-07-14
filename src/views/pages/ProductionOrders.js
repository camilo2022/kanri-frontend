import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import TechnicalSheetsService from '../../services/technical_sheets.service'
import ProductionOrdersService from '../../services/production_orders.service'
import VariantsService from '../../services/variants.service'
import PiecesService from '../../services/pieces.service'
import SupplyTypesService from '../../services/supply_types.service'
import ProductsService from '../../services/products.service'

import ProcessesService from '../../services/processes.service'
import TrademarksService from '../../services/trademarks.service'
import CategoriesService from '../../services/categories.service'
import SubcategoriesService from '../../services/subcategories.service'
import List from './technicalSheets/productionOrder/List'
import Create from './technicalSheets/productionOrder/Create'
import Edit from './products/Edit'
import TechnicalSheets from './TechnicalSheets'

const ProductionOrders = ({ technical_sheet_id, action }) => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: action })
  const [technicalSheet, setTechnicalSheet] = useState(null)
  const [productionOrder, setProductionOrder] = useState(null)
  const [data, setData] = useState({})
  const [statusOrders, setStatusOrders] = useState({})
  const [fabrics, setFabrics] = useState(null)
  const [rolls, setRolls] = useState(null)
  const [pieces, setPieces] = useState(null)
  const [supplyType, setSupplyType] = useState(null)
  const [supplyTypes, setSupplyTypes] = useState(null)
  const [products, setProducts] = useState(null)
  const [product, setProduct] = useState(null)
  const [sizes, setSizes] = useState(null)
  const [fabric, setFabric] = useState(null)

  const [processes, setProcesses] = useState({})
  const [trademarks, setTrademarks] = useState({})
  const [categories, setCategories] = useState({})
  const [subcategories, setSubcategories] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null)
  const [loadingRolls, setLoadingRolls] = useState(false)

  useEffect(() => {
    if (!technical_sheet_id) return
    setLoading(true)
    setLoadingRolls(true)
    findTechnicalSheet({ id: technical_sheet_id })
    findProductionOrder({ technical_sheet_id: technical_sheet_id })
    fetchSupplyTypes()
    if (view.name === 'create') {
      fetchPieces()
      findProduct(technicalSheet.product_id)
    }
  }, [view, technical_sheet_id])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const findTechnicalSheet = async (id) => {
    try {
      const response = await TechnicalSheetsService.find(id)
      setTechnicalSheet(response.data.technical_sheet)
      setStatusOrders(
        Array.isArray(response.data.status_production_order)
          ? response.data.status_production_order.map((item) => ({
              value: item,
              label: item,
            }))
          : [],
      )
      return response
    } catch (error) {
      throw error
    }
  }

  const findProductionOrder = async (id) => {
    try {
      const response = await ProductionOrdersService.find(id)
      setProductionOrder(response.data.production_order)
      return response
    } catch (error) {
      throw error
    }
  }

  const fetchProductionOrders = async (params) => {
    try {
      const response = await ProductionOrdersService.all(params)
      setData(response.data)
      dispatch({ type: 'set', total_orders: response.data.meta?.pagination?.total })
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchFabrics = async () => {
    try {
      const aux = supplyTypes.find((item) => item.name === 'TELA').id || 218
      const response = await VariantsService.all(aux)
      setFabrics(
        Array.isArray(response.data.variants)
          ? response.data.variants.reduce((acc, variant) => {
              acc[variant.id] = {
                label: `${variant.name} - ${variant.description}`,
                value: variant.id,
                data: variant,
              }
              return acc
            }, {})
          : {},
      )
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchSupplyTypes = async () => {
    try {
      const response = await SupplyTypesService.all()
      setSupplyTypes(response.data.supply_types)
      setSupplyType(response.data.supply_types.find((item) => item.name === 'ROLLO'))
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchPieces = async (params) => {
    try {
      const response = await PiecesService.all(params)
      setPieces(
        Array.isArray(response.data.pieces)
          ? response.data.pieces.reduce((acc, piece) => {
              acc[piece.id] = {
                label: piece.name,
                value: piece.id,
                data: piece,
              }
              return acc
            }, {})
          : {},
      )
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchRolls = async (id, params) => {
    try {
      const response = await VariantsService.all(id, params)
      setRolls(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoadingRolls(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await ProductsService.all()
      console.log(response.data.products)
      setProducts(
        Array.isArray(response.data.products)
          ? response.data.products.reduce((acc, product) => {
              acc[product.id] = {
                label: product.code,
                value: product.id,
              }
              return acc
            }, {})
          : {},
      )
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const findProduct = async (id) => {
    try {
      const response = await ProductsService.find(id)
      setProduct(response.data.product)
      setSizes(response.data.product.trademark.sizes)
      return response
    } catch (error) {
      throw error
    }
  }

  const findFabric = async (id) => {
    try {
      const response = await VariantsService.find(id)
      console.log(response.data.variant)
      setFabric(response.data.variant)
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

  console.log(supplyType)

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return (
          <Create
            technical_sheet={technicalSheet}
            status_orders={statusOrders}
            fabrics={fabrics}
            fetchFabrics={fetchFabrics}
            pieces={pieces}
            rolls={rolls}
            fetchRolls={fetchRolls}
            supply_type={supplyType}
            loading_rolls={loadingRolls}
            products={products}
            fetchProducts={fetchProducts}
            product={product}
            sizes={sizes}
            fabric={fabric}
            findFabric={findFabric}
            //
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

      case 'list_production_orders':
        return (
          <List
            technical_sheet={technicalSheet}
            data={data}
            processes={processes}
            loading={loading}
            fetchProductionOrders={fetchProductionOrders}
            onChangeView={changeView}
            errors={errors}
            status={status}
          />
        )

      case 'technical_sheet':
        return <TechnicalSheets product_id={product.id} action={view.action} />

      case 'back':
        return <TechnicalSheets action={'back'} />

      default:
        return (
          <List
            data={data}
            processes={processes}
            loading={loading}
            fetchProductionOrders={fetchProductionOrders}
            onChangeView={changeView}
            errors={errors}
            status={status}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default ProductionOrders
