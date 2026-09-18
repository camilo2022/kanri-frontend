import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import ProductionOrders from './ProductionOrders'
import ProductsService from '../../services/products.service'
import ProcessesService from '../../services/processes.service'
import TrademarksService from '../../services/trademarks.service'
import CategoriesService from '../../services/categories.service'
import SubcategoriesService from '../../services/subcategories.service'
import CollectionsService from '../../services/collections.service'
import TechnicalSheetsService from '../../services/technical_sheets.service'
import SubgroupsService from '../../services/subgroups.service'
import GarmentTypesService from '../../services/garment_types.service'
import WashTonesService from '../../services/wash_tones.service'
import ColorsService from '../../services/colors.service'
import BackTypesService from '../../services/back_types.service'
import BootTypesService from '../../services/boot_types.service'
import YokeTypesService from '../../services/yoke_types.service'
import WaistbandTypesService from '../../services/waistband_types.service'
import SupplyTypesService from '../../services/supply_types.service'
import EmployeesService from '../../services/employees.service'
import TechnicalSheetDetailService from '../../services/technical_sheet_detail.service'
import Create from './technicalSheets/Create'
import Edit from './technicalSheets/Edit'
import EditProcess from './technicalSheets/processes/Edit'
import Products from './Products'
import CreateTransformation from './technicalSheets/productionOrder/transformations/Create'

const TechnicalSheet = ({ product_id, action, process_id = null }) => {
  console.log(process_id)
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: action })
  const [product, setProduct] = useState(null)
  const [collections, setCollections] = useState(null)
  const [subgroups, setSubgroups] = useState(null)
  const [garmentTypes, setGarmentTypes] = useState(null)
  const [washTones, setWashTones] = useState(null)
  const [colors, setColors] = useState(null)
  const [backTypes, setBackTypes] = useState(null)
  const [bootTypes, setBootTypes] = useState(null)
  const [yokeTypes, setYokeTypes] = useState(null)
  const [waistbandTypes, setWaistbandTypes] = useState(null)
  const [employees, setEmployees] = useState(null)
  const [processes, setProcesses] = useState(null)
  const [process, setProcess] = useState(null)
  const [supplyTypes, setSupplyTypes] = useState(null)
  const [supplies, setSupplies] = useState(null)
  const [models, setModels] = useState(null)
  const [statusCollection, setStatusCollection] = useState(null)
  const [statusTechnical, setStatusTechnical] = useState(null)

  const [technicalSheet, setTechnicalSheet] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [productionOrder, setProductionOrder] = useState(null)

  useEffect(() => {
    if (!product_id) return
    setLoading(true)
    findProduct(product_id)
    fetchProcesses({ in_technical_sheet: true })
    if (view.name === 'edit_technical_sheet') {
      findTechnicalSheet({ product_id })
      fetchSupplyTypes()
    }
    console.log(view.name, process_id, view.name === 'edit_process' && process_id !== null)
    if (view.name === 'edit_process' && process_id !== null) {
      findTechnicalSheet({ product_id })
      findProcess(process_id)
      fetchSupplyTypes()
    }
    if (view.name === 'create_technical_sheet') {
      fetchSupplyTypes()
    }
    if (view.name === 'list_production_orders') {
      findTechnicalSheet({ product_id })
      fetchSupplyTypes()
    }
    if (view.name === 'create_transformation') {
    }
  }, [view, product_id])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const findProduct = async (id) => {
    try {
      const response = await ProductsService.find(id)
      console.log(response)
      setProduct(response.data.product)
      setModels(response.data.model_types)
      setStatusCollection(response.data.status_technical_sheet_detail)
      setStatusTechnical(
        Array.isArray(response.data.status_technical_sheet)
          ? response.data.status_technical_sheet.map((item) => ({
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

  const findTechnicalSheet = async (id) => {
    try {
      const response = await TechnicalSheetsService.find(id)
      setTechnicalSheet({
        ...response.data.technical_sheet,
        technical_sheet_details: Array.isArray(
          response.data.technical_sheet.technical_sheet_details,
        )
          ? response.data.technical_sheet.technical_sheet_details.reduce((acc, detail) => {
              acc[detail.model_id] = {
                ...detail,
              }
              return acc
            }, {})
          : {},
        supplies: Array.isArray(response.data.technical_sheet.supplies)
          ? response.data.technical_sheet.supplies.reduce((acc, supply) => {
              acc[supply?.supply_type?.[0]?.id] = {
                ...supply,
              }
              return acc
            }, {})
          : {},
      })
      setModels(response.data.model_types)
      setStatusCollection(response.data.status_technical_sheet_detail)
      setStatusTechnical(
        Array.isArray(response.data.status_technical_sheet)
          ? response.data.status_technical_sheet.map((item) => ({
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

  const fetchSubgroups = async (params) => {
    try {
      const response = await SubgroupsService.all(params)
      setSubgroups(
        Array.isArray(response.data.subgroups)
          ? response.data.subgroups.reduce((acc, subgroup) => {
              acc[subgroup.id] = {
                label: subgroup.name,
                value: subgroup.id,
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

  const fetchCollections = async (params) => {
    try {
      const response = await CollectionsService.all(params)
      setCollections(
        Array.isArray(response.data.collections)
          ? response.data.collections.reduce((acc, collection) => {
              acc[collection.id] = {
                label: `${collection.name} - ${collection.description}`,
                value: collection.id,
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

  const fetchGarmentTypes = async (params) => {
    try {
      const response = await GarmentTypesService.all(params)
      setGarmentTypes(
        Array.isArray(response.data.garment_types)
          ? response.data.garment_types.reduce((acc, garment_type) => {
              acc[garment_type.id] = {
                label: `${garment_type.settings.code ?? 'N/A'} - ${garment_type.name ?? 'N/A'}`,
                value: garment_type.id,
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

  const fetchWashTones = async (params) => {
    try {
      const response = await WashTonesService.all(params)
      setWashTones(
        Array.isArray(response.data.wash_tones)
          ? response.data.wash_tones.reduce((acc, wash_tone) => {
              acc[wash_tone.id] = {
                label: `${wash_tone.settings.code ?? 'N/A'} - ${wash_tone.name ?? 'N/A'}`,
                value: wash_tone.id,
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

  const fetchColors = async (params) => {
    try {
      const response = await ColorsService.all(params)
      setColors(
        Array.isArray(response.data.colors)
          ? response.data.colors.reduce((acc, color) => {
              acc[color.id] = {
                label: `${color.settings.code ?? 'N/A'} - ${color.name ?? 'N/A'}`,
                value: color.id,
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

  const fetchBackTypes = async (params) => {
    try {
      const response = await BackTypesService.all(params)
      setBackTypes(
        Array.isArray(response.data.back_types)
          ? response.data.back_types.reduce((acc, back_type) => {
              acc[back_type.id] = {
                label: `${back_type.settings.code ?? 'N/A'} - ${back_type.name ?? 'N/A'}`,
                value: back_type.id,
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

  const fetchBootTypes = async (params) => {
    try {
      const response = await BootTypesService.all(params)
      setBootTypes(
        Array.isArray(response.data.boot_types)
          ? response.data.boot_types.reduce((acc, boot_type) => {
              acc[boot_type.id] = {
                label: `${boot_type.settings.code ?? 'N/A'} - ${boot_type.name ?? 'N/A'}`,
                value: boot_type.id,
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

  const fetchYokeTypes = async (params) => {
    try {
      const response = await YokeTypesService.all(params)
      setYokeTypes(
        Array.isArray(response.data.yoke_types)
          ? response.data.yoke_types.reduce((acc, yoke_type) => {
              acc[yoke_type.id] = {
                label: `${yoke_type.settings.code ?? 'N/A'} - ${yoke_type.name ?? 'N/A'}`,
                value: yoke_type.id,
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

  const fetchWaistbandTypes = async (params) => {
    try {
      const response = await WaistbandTypesService.all(params)
      setWaistbandTypes(
        Array.isArray(response.data.waistband_types)
          ? response.data.waistband_types.reduce((acc, waistband_type) => {
              acc[waistband_type.id] = {
                label: `${waistband_type.settings.code ?? 'N/A'} - ${waistband_type.name ?? 'N/A'}`,
                value: waistband_type.id,
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

  const fetchEmployees = async (params) => {
    try {
      const response = await EmployeesService.all(params)
      setEmployees(
        Array.isArray(response.data.employees)
          ? response.data.employees.reduce((acc, employee) => {
              acc[employee.id] = {
                label: `${employee.person.names} ${employee.person.last_names} | ${employee.person.document} | ${employee.position?.name || '-'}`,
                value: employee.id,
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

  const fetchProcesses = async (params) => {
    try {
      const response = await ProcessesService.all(params)
      setProcesses(
        Array.isArray(response.data.processes)
          ? response.data.processes.reduce((acc, process) => {
              acc[process.id] = {
                ...process,
                subprocesses: Array.isArray(process.subprocesses)
                  ? process.subprocesses.reduce((acc, subprocess) => {
                      acc[subprocess.id] = {
                        ...subprocess,
                        operations: Array.isArray(subprocess.operations)
                          ? subprocess.operations.reduce((acc, operation) => {
                              acc[operation.id] = {
                                ...operation,
                              }
                              return acc
                            }, {})
                          : {},
                      }
                      return acc
                    }, {})
                  : {},
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
      const response = await SupplyTypesService.all({ in_technical_sheet: true })
      setSupplyTypes(response.data.supply_types)
      setSupplies(
        Array.isArray(response.data.supply_types)
          ? response.data.supply_types.reduce((acc, supply_type) => {
              acc[supply_type.id] = (supply_type.supplies || []).reduce((supplyAcc, supply) => {
                supplyAcc[supply.id] = {
                  label: `${supply.name} - ${supply.description}`,
                  value: supply.id,
                  data: supply,
                }
                return supplyAcc
              }, {})
              return acc
            }, {})
          : {},
      )
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const createTechnicalSheet = async (data) => {
    try {
      const response = await TechnicalSheetsService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editTechnicalSheet = async (id, data) => {
    try {
      const response = await TechnicalSheetsService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      const groupedErrors = {}
      Object.entries(error.errors).forEach(([path, messages]) => {
        const matchDinamic = path.match(
          /^technical_sheet_details\.(\d+)\.settings\.dinamic\.values\.(\d+)\.(.+)$/,
        )

        if (matchDinamic) {
          const [, detailId, rowIndex, field] = matchDinamic

          groupedErrors[detailId] ??= {
            dinamic: {},
            static: {},
          }

          groupedErrors[detailId].dinamic[rowIndex] ??= {}
          groupedErrors[detailId].dinamic[rowIndex][field] = messages

          return
        }
        const matchStatic = path.match(
          /^technical_sheet_details\.(\d+)\.settings\.static\.values\.(.+)$/,
        )

        if (matchStatic) {
          const [, detailId, field] = matchStatic

          groupedErrors[detailId] ??= {
            dinamic: {},
            static: {},
          }

          groupedErrors[detailId].static[field] = messages
        }
      })

      setErrors({
        ...error.errors,
        technical_sheet_details: groupedErrors,
      })

      throw error
    }
  }

  const saveTechnicalSheetDetails = async (data) => {
    try {
      const response = await TechnicalSheetDetailService.save(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findProcess = async (process_id) => {
    try {
      const response = await ProcessesService.find(process_id)
      setProcess(response.data.process)
      console.log(response)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create_technical_sheet':
        return (
          <Create
            product={product}
            fetchCollections={fetchCollections}
            collections={collections}
            fetchSubgroups={fetchSubgroups}
            subgroups={subgroups}
            fetchGarmentTypes={fetchGarmentTypes}
            garment_types={garmentTypes}
            fetchWashTones={fetchWashTones}
            wash_tones={washTones}
            fetchColors={fetchColors}
            colors={colors}
            fetchBackTypes={fetchBackTypes}
            back_types={backTypes}
            fetchBootTypes={fetchBootTypes}
            boot_types={bootTypes}
            fetchYokeTypes={fetchYokeTypes}
            yoke_types={yokeTypes}
            fetchWaistbandTypes={fetchWaistbandTypes}
            waistband_types={waistbandTypes}
            fetchEmployees={fetchEmployees}
            employees={employees}
            processes={processes}
            supply_types={supplyTypes}
            supplies={supplies}
            onChangeView={changeView}
            create={createTechnicalSheet}
            errors={errors}
            models={models}
            statusCollection={statusCollection}
            statusTechnical={statusTechnical}
          />
        )

      case 'edit_technical_sheet':
        return (
          <Edit
            product={product}
            technical_sheet={technicalSheet}
            fetchCollections={fetchCollections}
            collections={collections}
            fetchSubgroups={fetchSubgroups}
            subgroups={subgroups}
            fetchGarmentTypes={fetchGarmentTypes}
            garment_types={garmentTypes}
            fetchWashTones={fetchWashTones}
            wash_tones={washTones}
            fetchColors={fetchColors}
            colors={colors}
            fetchBackTypes={fetchBackTypes}
            back_types={backTypes}
            fetchBootTypes={fetchBootTypes}
            boot_types={bootTypes}
            fetchYokeTypes={fetchYokeTypes}
            yoke_types={yokeTypes}
            fetchWaistbandTypes={fetchWaistbandTypes}
            waistband_types={waistbandTypes}
            fetchEmployees={fetchEmployees}
            employees={employees}
            processes={processes}
            supply_types={supplyTypes}
            supplies={supplies}
            onChangeView={changeView}
            edit={editTechnicalSheet}
            errors={errors}
            models={models}
            save={saveTechnicalSheetDetails}
            statusCollection={statusCollection}
            statusTechnical={statusTechnical}
          />
        )

      case 'edit_process':
        return (
          <EditProcess
            product={product}
            technical_sheet={technicalSheet}
            processes={processes}
            supplies={supplies}
            onChangeView={changeView}
            edit={editTechnicalSheet}
            errors={errors}
            models={models}
            statusCollection={statusCollection}
            process={process}
          />
        )

      case 'list_production_orders':
        return <ProductionOrders technical_sheet_id={technicalSheet?.id} action={view.name} />

      case 'back':
        return <Products />

      default:
        return
    }
  }

  return <div>{renderView()}</div>
}

export default TechnicalSheet
