import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import CollectionManagement from './collectionManagement/CollectionManagement'
import CollectionsService from '../../services/collections.service'
import ProcessesService from '../../services/processes.service'
import SupplyTypesService from '../../services/supply_types.service'
import GarmentTypesService from '../../services/garment_types.service'
import WashTonesService from '../../services/wash_tones.service'
import BootTypesService from '../../services/boot_types.service'
import TrademarksService from '../../services/trademarks.service'
import CategoriesService from '../../services/categories.service'
import SubcategoriesService from '../../services/subcategories.service'
import CollectionManagementService from '../../services/collection_management.service'

const ManagementCollections = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [collections, setCollections] = useState(null)
  const [processes, setProcesses] = useState(null)
  const [supplyTypes, setSupplyTypes] = useState(null)
  const [variants, setVariants] = useState(null)
  const [garmentTypes, setGarmentTypes] = useState(null)
  const [washTones, setWashTones] = useState(null)
  const [bootTypes, setBootTypes] = useState(null)
  const [auxTrademark, setAuxTrademark] = useState(null)
  const [auxCategories, setAuxCategories] = useState(null)
  const [auxSubcategories, setAuxSubcategories] = useState(null)

  useEffect(() => {
    fetchCollections()
    fetchProcesses({ in_technical_sheet: true })
    fetchSupplyTypes({ in_technical_sheet: true })
    fetchGarmentTypes()
    fetchWashTones()
    fetchBootTypes()
    fetchTrademarks()
    fetchCategories()
  }, [])

  const fetchCollections = async (params) => {
    try {
      const response = await CollectionsService.all(params)
      setCollections(
        Array.isArray(response.data.collections)
          ? response.data.collections.map((type) => ({
              label: type.name,
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

  const fetchProcesses = async (params) => {
    try {
      const response = await ProcessesService.all(params)
      setProcesses(response.data.processes)
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const fetchSupplyTypes = async (params) => {
    try {
      const response = await SupplyTypesService.all(params)
      setSupplyTypes(response.data.supply_types)
      setVariants(
        Array.isArray(response.data.supply_types)
          ? response.data.supply_types.reduce((acc, item) => {
              acc[item.id] = (item.variants || []).map((variant) => ({
                label: variant.name,
                value: variant.id,
                data: variant,
              }))
              return acc
            }, {})
          : {},
      )
      return
    } catch (error) {
      setErrors(error.errors)
      console.error('Error obteniendo tipos de insumo:', error)
    }
  }

  const fetchGarmentTypes = async (params) => {
    try {
      const response = await GarmentTypesService.all(params)
      setGarmentTypes(
        Array.isArray(response.data.garment_types)
          ? response.data.garment_types.map((type) => ({
              label: type.name,
              value: type.id,
              data: type,
            }))
          : [],
      )
    } catch (error) {
      setErrors(error.errors)
      console.error('Error obteniendo tipos de prenda:', error)
    }
  }

  const fetchWashTones = async (params) => {
    try {
      const response = await WashTonesService.all(params)
      setWashTones(
        Array.isArray(response.data.wash_tones)
          ? response.data.wash_tones.map((type) => ({
              label: type.name,
              value: type.id,
              data: type,
            }))
          : [],
      )
    } catch (error) {
      setErrors(error.errors)
      console.error('Error obteniendo tonos de lavado:', error)
    }
  }

  const fetchBootTypes = async (params) => {
    try {
      const response = await BootTypesService.all(params)
      setBootTypes(
        Array.isArray(response.data.boot_types)
          ? response.data.boot_types.map((type) => ({
              label: type.name,
              value: type.id,
              data: type,
            }))
          : [],
      )
    } catch (error) {
      setErrors(error.errors)
      console.error('Error obteniendo tipos de botas:', error)
    }
  }

  const fetchTrademarks = async (params) => {
    try {
      const response = await TrademarksService.all(params)
      setAuxTrademark(response.data.trademarks)
    } catch (error) {
      setErrors(error.errors)
      console.error('Error obteniendo marcas:', error)
    }
  }

  const fetchCategories = async (params) => {
    try {
      const response = await CategoriesService.all(params)
      setAuxCategories(response.data.categories)
    } catch (error) {
      setErrors(error.errors)
      console.error('Error obteniendo categorías:', error)
    }
  }

  const fetchSubcategories = async (category_id, params) => {
    try {
      const response = await SubcategoriesService.all(category_id, params)
      setAuxSubcategories(response.data.subcategories)
    } catch (error) {
      setErrors(error.errors)
      console.error('Error obteniendo categorías:', error)
    }
  }

  const save = async (data) => {
    const result = await CollectionManagementService.save(data)
    return result
  }

  return (
    <div>
      <CollectionManagement
        collections={collections}
        processes={processes}
        supplyTypes={supplyTypes}
        variants={variants}
        garmentTypes={garmentTypes}
        washTones={washTones}
        bootTypes={bootTypes}
        auxTrademark={auxTrademark}
        auxCategories={auxCategories}
        fetchSubcategories={fetchSubcategories}
        fetchGarmentTypes={fetchGarmentTypes}
        fetchWashTones={fetchWashTones}
        fetchBootTypes={fetchBootTypes}
        fetchTrademarks={fetchTrademarks}
        fetchCollections={fetchCollections}
        fetchProcesses={fetchProcesses}
        fetchSupplyTypes={fetchSupplyTypes}
        fetchCategories={fetchCategories}
        auxSubcategories={auxSubcategories}
        save={save}
        errors={errors}
      />
    </div>
  )
}

export default ManagementCollections
