import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import CollectionsService from '../../services/collections.service'
import SupplyTypesService from '../../services/supply_types.service'
import SuppliesService from '../../services/supplies.service'
import SupplierTypesService from '../../services/supplier_types.service'
import SuppliersService from '../../services/suppliers.service'
import ProductionManagement from './productionManagement/ProductionManagement'
import ProductsService from '../../services/products.service'
import TrademarksService from '../../services/trademarks.service'
import ProductionManagementService from '../../services/production_management.service'
import CategoriesService from '../../services/categories.service'
import SubcategoriesService from '../../services/subcategories.service'
import BuildersService from '../../services/builders.service'
import ProcessesService from '../../services/processes.service'

const ManagementProduction = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [errorsCreate, setErrorsCreate] = useState({})
  const [errorsBuilder, setErrorsBuilder] = useState({})

  const [collections, setCollections] = useState(null)
  const [collection, setCollection] = useState(null)
  const [trademarks, setTrademarks] = useState(null)
  const [trademarksAux, setTrademarksAux] = useState(null)
  const [supplyTypes, setSupplyTypes] = useState(null)
  const [fabrics, setFabrics] = useState(null)
  const [supplierTypes, setSupplierTypes] = useState(null)
  const [suppliers, setSuppliers] = useState(null)
  const [products, setProducts] = useState(null)
  const [optStatus, setOptStatus] = useState(null)
  const [categories, setCategories] = useState(null)
  const [subcategories, setSubcategories] = useState()
  const [builders, setBuilders] = useState(null)
  const [processes, setProcesses] = useState(null)

  useEffect(() => {
    fetchCollections()
    fetchSupplyTypes({ in_production_order: 'true' })
    fetchSupplierTypes({ in_production_order: 'true' })
    fetchTrademarks()
    fetchCategories()
    fetchBuilders()
    fetchProcesses({ in_technical_sheet: true })
  }, [])

  useEffect(() => {
    if (!supplyTypes) return
    fetchFabrics()
  }, [supplyTypes])

  useEffect(() => {
    if (!supplierTypes) return
    fetchSuppliers()
  }, [supplierTypes])

  const fetchCollections = async (params) => {
    try {
      const response = await CollectionsService.all(params)
      setCollections(
        Array.isArray(response.data.collections)
          ? response.data.collections.map((type) => ({
              label: `${type.settings.code ?? 'N/A'} - ${type.name}`,
              value: type.id,
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

  const findCollection = async (collection_id) => {
    try {
      const response = await CollectionsService.find(collection_id)
      const collection = response.data.collection
      setCollection(collection)
      setOptStatus(
        Array.isArray(response.data.status_production_order)
          ? response.data.status_production_order.map((item) => ({
              value: item,
              label: item.toUpperCase(),
            }))
          : [],
      )

      const trademarks = collection.technical_sheets.reduce((acc, technical_sheet) => {
        const product = technical_sheet.product
        const trademark = product?.trademark
        const subcategory = product?.subcategory
        const category = subcategory?.category?.[0]

        if (!trademark || !category || !subcategory) {
          return acc
        }

        if (!acc[trademark.id]) {
          acc[trademark.id] = {
            id: trademark.id,
            name: trademark.name,
            sizes: trademark.sizes,
            categories: {},
          }
        }

        if (!acc[trademark.id].categories[category.id]) {
          acc[trademark.id].categories[category.id] = {
            id: category.id,
            name: category.name,
            subcategories: {},
          }
        }

        if (!acc[trademark.id].categories[category.id].subcategories[subcategory.id]) {
          acc[trademark.id].categories[category.id].subcategories[subcategory.id] = {
            id: subcategory.id,
            name: subcategory.name,
            technical_sheets: [],
          }
        }

        acc[trademark.id].categories[category.id].subcategories[
          subcategory.id
        ].technical_sheets.push(technical_sheet)

        return acc
      }, {})

      setTrademarks(trademarks)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchSupplyTypes = async (params) => {
    try {
      const response = await SupplyTypesService.all(params)
      setSupplyTypes(response.data.supply_types)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchFabrics = async () => {
    try {
      const aux = supplyTypes.find((item) => item.settings.paragraph === 'fabric').id || 218
      const response = await SuppliesService.all(aux)
      setFabrics(
        Array.isArray(response.data.supplies)
          ? response.data.supplies.reduce((acc, supply) => {
              acc[supply.id] = {
                label: `${supply.name} - ${supply.description}`,
                value: supply.id,
                data: supply,
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

  const fetchSupplierTypes = async (params) => {
    try {
      const response = await SupplierTypesService.all(params)
      setSupplierTypes(response.data.supplier_types)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const aux = supplierTypes.find((item) => item.settings.paragraph === 'production').id || 423
      const response = await SuppliersService.all(aux)
      setSuppliers(
        Array.isArray(response.data.suppliers)
          ? response.data.suppliers.reduce((acc, supplier) => {
              acc[supplier.id] = {
                label: `${supplier.settings?.code} - ${supplier.name}`,
                value: supplier.id,
                data: supplier,
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

  const fetchTrademarks = async () => {
    try {
      const response = await TrademarksService.all()
      setTrademarksAux(response.data.trademarks)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await CategoriesService.all()
      setCategories(response.data.categories)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchSubcategories = async (category_id) => {
    try {
      const response = await SubcategoriesService.all(category_id)
      setSubcategories(response.data.subcategories)
      return response.data.subcategories
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
      setErrorsCreate({})
      return response
    } catch (error) {
      console.log(error)
      setErrorsCreate(error.errors)
      throw error
    }
  }

  const save = async (data) => {
    const response = await ProductionManagementService.save(data)
    return response
  }

  const create_builder = async (data) => {
    try {
      const response = await BuildersService.store(data)
      setErrorsBuilder({})
      return response
    } catch (error) {
      setErrorsBuilder(error.errors)
      throw error
    }
  }

  const update_builder = async (data, uuid) => {
    try {
      const response = await BuildersService.update(data, uuid)
      fetchBuilders()
      setErrorsBuilder({})
      return response
    } catch (error) {
      setErrorsBuilder(error.errors)
      throw error
    }
  }

  const delete_builder = async (uuid) => {
    try {
      const response = await BuildersService.destroy(uuid)
      setErrorsBuilder({})
      return response
    } catch (error) {
      setErrorsBuilder(error.errors)
      throw error
    }
  }

  const fetchBuilders = async () => {
    try {
      const response = await BuildersService.all()
      setBuilders(response.data.builders)
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
      setProcesses(response.data.processes)
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  return (
    <div>
      <ProductionManagement
        collections={collections}
        collection={collection}
        setCollection={setCollection}
        findCollection={findCollection}
        trademarks={trademarks}
        fabrics={fabrics}
        suppliers={suppliers}
        products={products}
        fetchProducts={fetchProducts}
        aux_trademarks={trademarksAux}
        errors_create={errorsCreate}
        createProduct={createProduct}
        save={save}
        opt_status={optStatus}
        categories={categories}
        subcategories={subcategories}
        fetchSubcategories={fetchSubcategories}
        create_builder={create_builder}
        update_builder={update_builder}
        delete_builder={delete_builder}
        errors_builder={errorsBuilder}
        builders={builders}
        processes={processes}
      />
    </div>
  )
}

export default ManagementProduction
