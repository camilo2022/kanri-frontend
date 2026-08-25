import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import TechnicalSheetsService from '../../services/technical_sheets.service'
import ProductionOrdersService from '../../services/production_orders.service'
import VariantsService from '../../services/variants.service'
import PiecesService from '../../services/pieces.service'
import SupplyTypesService from '../../services/supply_types.service'
import ProductsService from '../../services/products.service'
import ColorsService from '../../services/colors.service'
import Products from './Products'
import TrademarksService from '../../services/trademarks.service'
import List from './technicalSheets/productionOrder/List'
import Create from './technicalSheets/productionOrder/Create'
import Edit from './technicalSheets/productionOrder/Edit'

const ProductionOrders = ({ technical_sheet_id, action }) => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: action })
  const [technicalSheet, setTechnicalSheet] = useState(null)
  const [productionOrder, setProductionOrder] = useState(null)
  const [data, setData] = useState(null)
  const [statusOrders, setStatusOrders] = useState({})
  const [fabrics, setFabrics] = useState(null)
  const [rolls, setRolls] = useState(null)
  const [pieces, setPieces] = useState(null)
  const [supplyType, setSupplyType] = useState(null)
  const [supplyTypes, setSupplyTypes] = useState(null)
  const [products, setProducts] = useState(null)
  const [product, setProduct] = useState(null)
  const [productStara, setProductStara] = useState(null)
  const [sizes, setSizes] = useState(null)
  const [fabric, setFabric] = useState(null)
  const [color, setColor] = useState(null)
  const [trademarks, setTrademarks] = useState({})
  const [categories, setCategories] = useState({})
  const [subcategories, setSubcategories] = useState({})
  const [errors, setErrors] = useState({})
  const [errorsCreate, setErrorsCreate] = useState({})
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [loadingRolls, setLoadingRolls] = useState(false)
  const [piecesCutA, setPiecesCutA] = useState(null)
  const [strokesCutA, setStrokesCutA] = useState(null)

  useEffect(() => {
    if (!technical_sheet_id) return
    setProductionOrder(null)
    setLoading(true)
    setLoadingRolls(true)
    findTechnicalSheet({ id: technical_sheet_id })
    fetchSupplyTypes()
    fetchTrademarks()
    if (view.name === 'create') {
      fetchPieces()
      findProduct(technicalSheet.product_id)
    }
    if (view.name === 'edit') {
      fetchPieces()
      findProduct(technicalSheet.product_id)
      findProductionOrder(view.production_order)
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
      setProductStara(response.data.technical_sheet.products || null)
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
      setPiecesCutA(response.data.production_orders.find((item) => item.cut === 'A')?.pieces ?? [])
      setStrokesCutA(response.data.production_orders.find((item) => item.cut === 'A')?.strokes)
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
          ? response.data.pieces.reduce(
              (acc, piece) => {
                acc[piece.id] = {
                  label: piece.name,
                  value: piece.id,
                  data: piece,
                }
                return acc
              },
              {
                [101]: {
                  label: 'Prueba',
                  value: 101,
                  data: '',
                },
              },
            )
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
      setProducts(response.data.products)
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
      setFabric(response.data.variant)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const findColor = async (id) => {
    try {
      const response = await ColorsService.find(id)
      setColor(response.data.color)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const create = async (data) => {
    try {
      const response = await ProductionOrdersService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const edit = async (id, data) => {
    try {
      const response = await ProductionOrdersService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const fetchTrademarks = async (params) => {
    try {
      const response = await TrademarksService.all(params)
      setTrademarks(response.data.trademarks)
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
      setProductStara(response.data.product)
      setErrorsCreate({})
      return response
    } catch (error) {
      console.log(error)
      setErrorsCreate(error.errors)
      throw error
    }
  }

  const pdf_production_order = (production_order_uuid) => {
    const url = ProductionOrdersService.pdf(production_order_uuid)

    window.open(url, '_blank')
  }

  const pdf_technical_sheet = (technical_sheet_uuid, production_order_id) => {
    const url = TechnicalSheetsService.pdf(technical_sheet_uuid, production_order_id)

    window.open(url, '_blank')
  }

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
            color={color}
            findColor={findColor}
            create={create}
            trademarks={trademarks}
            createProduct={createProduct}
            product_stara={productStara}
            onChangeView={changeView}
            errors={errors}
            errors_create={errorsCreate}
            edit={edit}
            piecesCutA={piecesCutA}
            strokesCutA={strokesCutA}
          />
        )

      case 'edit':
        return (
          <Edit
            production_order={productionOrder}
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
            color={color}
            findColor={findColor}
            onChangeView={changeView}
            create={create}
            trademarks={trademarks}
            createProduct={createProduct}
            errors={errors}
            errors_create={errorsCreate}
            product_stara={productStara}
            edit={edit}
            piecesCutA={piecesCutA}
          />
        )

      case 'list_production_orders':
        return (
          <List
            technical_sheet={technicalSheet}
            data={data}
            loading={loading}
            fetchProductionOrders={fetchProductionOrders}
            onChangeView={changeView}
            errors={errors}
            status={status}
            pdf_production_order={pdf_production_order}
            pdf_technical_sheet={pdf_technical_sheet}
          />
        )

      case 'technical_sheet':
        return <TechnicalSheets product_id={product.id} action={view.action} />

      case 'back':
        return <Products />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchProductionOrders={fetchProductionOrders}
            onChangeView={changeView}
            errors={errors}
            status={status}
            generatePDF={generatePDF}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default ProductionOrders
