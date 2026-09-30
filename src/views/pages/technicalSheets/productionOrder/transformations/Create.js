import api from '../../../../../API/api'
import { getConfig } from '../../../../../axiosConfig'
import { useState } from 'react'
import { CCard, CButton, CPopover, CFormSelect } from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import { useEffect } from 'react'
import { ArrowLeftCircle, CheckCircle2, Clock, AlertCircle, Save, BadgeAlert } from 'lucide-react'
import LoadingForm from '@/components/LoadingForm'
import { useRef } from 'react'
import InformationTransformation from '@/components/InformationTransformation'
import TechnicalSheetDetail from '@/components/TechnicalSheetDetail'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'
import TransformationReassignmentCurve from '../../../../../components/TransformationReassignmentCurve'

export const Create = ({
  product,
  technical_sheet,
  production_order,
  create,

  fetchCollections,
  collections,
  fetchSubgroups,
  subgroups,
  fetchGarmentTypes,
  garment_types,
  fetchWashTones,
  wash_tones,
  fetchColors,
  colors,
  fetchBackTypes,
  back_types,
  fetchBootTypes,
  boot_types,
  fetchYokeTypes,
  yoke_types,
  fetchWaistbandTypes,
  waistband_types,
  fetchEmployees,
  employees,
  processes,
  supply_types,
  supplies,
  onChangeView,
  edit,
  errors,
  models,
  statusCollection,
  statusTechnical,

  sizes,
  trademarks,
  createProduct,
  errors_create,
  categories,
  fetchCategories,
  subcategories,
  fetchSubcategories,
}) => {
  const [editingField, setEditingField] = useState(null)
  const inputRefs = useRef({})
  const [formData, setFormData] = useState({})
  const [details, setDetails] = useState({})
  const [tecSupplies, setTecSupplies] = useState({})
  const [validated, setValidated] = useState(false)
  const [catalogsData, setCatalogsData] = useState({})
  const [dependentFields, setDependentFields] = useState({})
  const [dinamicValues, setDinamicValues] = useState({})
  const [staticValues, setStaticValues] = useState({})
  const [openPopoverSupply, setOpenPopoverSupply] = useState({
    id: null,
  })
  const [editingSupplies, setEditingSupplies] = useState(null)
  const [dataOrigin, setDataOrigin] = useState(null)
  const [dataNew, setDataNew] = useState(null)
  const [data, setData] = useState([])
  const [reasigned, setReasigned] = useState(false)
  const [productStara, setProductStara] = useState(null)
  const [formDataStara, setFormDataStara] = useState({})

  useEffect(() => {
    if (!processes || !technical_sheet?.technical_sheet_details) return

    const aux_details = {}
    const detailsMap = technical_sheet?.technical_sheet_details || {}

    Object.values(processes).forEach((process) => {
      const processDetail = detailsMap[process.id]

      if (!processDetail) {
        aux_details[process.id] = {
          model_id: process.id,
          model_type: 'App\\Models\\Process',
          technical_sheet_id: technical_sheet?.id,
          settings: {
            dinamic: {
              ...process?.settings?.schema?.dinamic,
              insert_values: false,
              values: [],
            },
            static: {
              ...process?.settings?.schema?.static,
              insert_values: false,
              values: {},
            },
          },
          status: 'Pendiente',
        }
      } else {
        aux_details[process.id] = {
          ...processDetail,
          settings: {
            dinamic: {
              ...processDetail?.settings?.dinamic,
              insert_values:
                !processDetail?.settings?.dinamic?.body?.length &&
                !processDetail?.settings?.dinamic?.header?.trim()
                  ? false
                  : (processDetail?.settings?.dinamic?.insert_values ?? false),
            },
            static: {
              ...processDetail?.settings?.static,
              insert_values:
                !processDetail?.settings?.static?.body?.length &&
                !processDetail?.settings?.static?.header?.length
                  ? false
                  : (processDetail?.settings?.static?.insert_values ?? false),
            },
          },
        }
      }
      Object.values(process?.subprocesses || {}).forEach((subprocess) => {
        const subDetail = detailsMap[subprocess.id]

        if (!subDetail) return

        aux_details[subprocess.id] = {
          ...subDetail,
          settings: {
            dinamic: {
              ...subDetail?.settings?.dinamic,
              insert_values:
                !subDetail?.settings?.dinamic?.body?.length &&
                !subDetail?.settings?.dinamic?.header?.trim()
                  ? false
                  : (subDetail?.settings?.dinamic?.insert_values ?? false),
            },
            static: {
              ...subDetail?.settings?.static,
              insert_values:
                !subDetail?.settings?.static?.body?.length &&
                !subDetail?.settings?.static?.header?.length
                  ? false
                  : (subDetail?.settings?.static?.insert_values ?? false),
            },
          },
        }

        Object.values(subprocess?.operations || {}).forEach((operation) => {
          const opDetail = detailsMap[operation.id]

          if (!opDetail) return

          aux_details[operation.id] = {
            ...opDetail,
            settings: {
              static: {
                ...opDetail?.settings?.static,
                insert_values:
                  !opDetail?.settings?.static?.body?.length &&
                  !opDetail?.settings?.static?.header?.length
                    ? false
                    : (opDetail?.settings?.static?.insert_values ?? false),
              },
            },
          }
        })
      })
    })

    setDetails({ ...aux_details })
  }, [processes, technical_sheet])

  useEffect(() => {
    if (!details) return

    setDinamicValues(
      Array.isArray(Object.values(details))
        ? Object.values(details).reduce((acc, detail) => {
            const values = detail?.settings?.dinamic?.values ?? {}
            let counter = 1
            acc[detail.model_id] = Object.fromEntries(
              Object.values(values).map((item) => {
                const id = item.id ?? counter++
                return [
                  id,
                  structuredClone({
                    ...item,
                    id,
                  }),
                ]
              }),
            )
            return acc
          }, {})
        : {},
    )

    setStaticValues(
      Array.isArray(Object.values(details))
        ? Object.values(details).reduce((acc, detail) => {
            acc[detail.model_id] = detail?.settings?.static?.values ?? {}
            return acc
          }, {})
        : {},
    )

    const loadAllCatalogs = async () => {
      const modelsToLoad = new Set()
      const dependentFieldsAux = []
      Object.values(details).forEach(async (detail) => {
        const settings = detail?.settings || {}

        if (settings.dinamic) {
          for (const field of settings?.dinamic?.body || []) {
            if (field.type === 'selectdinamic' && !field.param && !catalogsData[field.model]) {
              modelsToLoad.add(field.model)
            }
            if (field.type === 'selectdinamic' && field.param) {
              dependentFieldsAux.push({
                model: field.model,
                param: field.param,
                field: field.field,
              })
            }
          }
        }

        if (settings.static) {
          for (const row of settings?.static?.body || []) {
            for (const field of row || []) {
              if (field.type === 'selectdinamic' && !field.param && !catalogsData[field.model]) {
                modelsToLoad.add(field.model)
              }
              if (field.type === 'selectdinamic' && field.param) {
                dependentFieldsAux.push({
                  model: field.model,
                  param: field.param,
                  field: field.field,
                })
              }
            }
          }
        }
      })

      for (const model of modelsToLoad) {
        await loadCatalog(model)
      }

      setDependentFields(dependentFieldsAux)
    }

    loadAllCatalogs()
  }, [details])

  useEffect(() => {
    if (!production_order || !sizes) return

    const data = production_order.production_order_details
      .filter((item) => item.model_type === 'App\\Models\\Product')
      .map((item) => ({
        location: item.destination,
        reference: item.model.code,
        product_id: item.model_id,
        sizes: sizes.reduce((acc, size) => {
          const quantity = item.production_order_detail_quantities.find(
            (aux) => aux.size_id === size.id,
          )

          acc[size.id] = {
            id: quantity?.id ?? null,
            size_id: size.id,
            name: size.name,
            quantity: quantity?.quantity ?? 0,
          }

          return acc
        }, {}),
      }))

    ;['NACIONAL', 'MEDELLIN', 'STARA'].forEach((location) => {
      if (!data.some((item) => item.location === location)) {
        data.push({
          location,
          reference: null,
          product_id: null,
          sizes: sizes.reduce((acc, size) => {
            acc[size.id] = {
              id: null,
              size_id: size.id,
              name: size.name,
              quantity: 0,
            }

            return acc
          }, {}),
        })
      }
    })

    setDataOrigin(data)
  }, [production_order, sizes])

  useEffect(() => {
    if (!formData.sizes) return

    setData(
      [
        {
          location: 'NACIONAL',
          product_id: null,
        },
        {
          location: 'MEDELLIN',
          product_id: null,
        },
        {
          location: 'STARA',
          product_id: null,
        },
      ].map((item) => ({
        ...item,
        sizes: formData.sizes.reduce((acc, size) => {
          acc[size.id] = {
            id: null,
            size_id: size.id,
            name: size.name,
            quantity: 0,
          }

          return acc
        }, {}),
      })),
    )
  }, [formData.sizes])

  const getCatalog = async (key, modelParam = null, dependencyValue = null) => {
    try {
      let url = Object.entries(models).find(([_, value]) => value.model === key)?.[1]?.url

      if (modelParam && dependencyValue && url.includes(`{${modelParam}}`)) {
        url = url.replace(`{${modelParam}}`, dependencyValue)
      }

      const response = await api.get(url, {
        ...getConfig(),
      })

      return response.data
    } catch (error) {
      console.log(error)
      throw error.response?.data || { message: 'Error desconocido' }
    }
  }

  const loadCatalog = async (key, modelParam = null, dependencyValue = null) => {
    try {
      const cacheKey = dependencyValue ? `${key}_${dependencyValue}` : key
      if (catalogsData[cacheKey]) return
      const res = await getCatalog(key, modelParam, dependencyValue)
      const aux = Array.isArray(
        res.data[Object.entries(models).find(([_, value]) => value.model === key)[0]],
      )
        ? res.data[Object.entries(models).find(([_, value]) => value.model === key)[0]].reduce(
            (acc, item) => {
              acc[item.id] = {
                id: item.id,
                ...(!item.person ? { ...item } : { person: item.person }),
              }
              return acc
            },
            {},
          )
        : {}

      setCatalogsData((prev) => ({
        ...prev,
        [cacheKey]: aux,
      }))
    } catch (error) {
      console.log(error)
    }
  }

  const dataGet = (path, data, defaultValue = undefined, separator = ' ') => {
    const getSingleValue = (singlePath) => {
      if (!singlePath) return undefined

      return singlePath
        .replace(/\[(\w+)\]/g, '.$1')
        .replace(/^\./, '')
        .split('.')
        .reduce((acc, key) => {
          if (acc === null || acc === undefined) {
            return undefined
          }

          return acc[key]
        }, data)
    }

    if (Array.isArray(path)) {
      const values = path
        .map((p) => getSingleValue(p))
        .filter((value) => value !== undefined && value !== null && value !== '')
      return values.length ? values.join(separator) : defaultValue
    }

    return getSingleValue(path) ?? defaultValue
  }

  const findTrademarkByCode = (reference) => {
    if (!reference || !trademarks) return null

    reference = reference.toUpperCase()

    const matches = trademarks.filter((trademark) => {
      const validations = trademark.settings?.validations ?? []

      return validations.some((validation) => {
        const match = validation.regex.match(/\/\^([A-Z0-9]+)\[0-9/)

        if (!match) return false

        const prefix = match[1]

        return prefix.startsWith(reference) || reference.startsWith(prefix)
      })
    })

    return matches.length === 1 ? matches[0] : null
  }

  useEffect(() => {
    if (!editingField) return

    const ref = inputRefs.current[editingField]

    if (ref) {
      ref.focus()
      if (typeof ref.openMenu === 'function') {
        ref.openMenu('first')
      }
    }
  }, [editingField])

  /*
  useEffect(() => {
    if (Object.keys(errors).length !== 0) {
      Toast.fire({
        icon: 'error',
        title: errors.message,
      })
    }
  }, [errors])*/

  const calculateCascadeStockForSize = (sizeId, dataAux, dataModal) => {
    const locationOrder = ['NACIONAL', 'MEDELLIN', 'STARA']

    let pendingDemand = dataModal.reduce((total, row) => {
      return total + Number(row.sizes?.[sizeId]?.quantity || 0)
    }, 0)

    const finalBalances = {}

    locationOrder.forEach((loc) => {
      const auxRow = dataAux.find((r) => r.location === loc)
      const availableStock = Number(auxRow?.sizes?.[sizeId]?.quantity || 0)

      if (pendingDemand > 0) {
        if (availableStock >= pendingDemand) {
          finalBalances[loc] = availableStock - pendingDemand
          pendingDemand = 0
        } else {
          finalBalances[loc] = 0
          pendingDemand -= availableStock
        }
      } else {
        finalBalances[loc] = availableStock
      }
    })

    return finalBalances
  }

  const handleSubmit = async () => {
    Swal.fire({
      title: 'Crear Transformación',
      html: `<div style="font-size:14px">
                Se guardará la información de la trasnformación de la referencia en el sistema.<br/>
                <strong>¿Deseas continuar?</strong>
              </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, crear',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const data_send = {
            technical_sheet_id: technical_sheet.id,
            product: {
              code: formData.reference,
              trademark_id: formData.trademark_id,
              subcategory_id: formData.subcategory_id,
            },
            technical_sheet: {
              ...formData,
              supplies: Object.values(tecSupplies)
                .map((item) => item?.id)
                .filter(Boolean),
              technical_sheet_details: Object.values(details).map((detail) => {
                const settings = {
                  ...detail.settings,
                  static: {
                    ...detail.settings.static,
                    values: staticValues[detail.model_id] ?? {},
                  },
                }

                if (detail.model_type !== 'App\\Models\\Operations') {
                  settings.dinamic = {
                    ...detail.settings.dinamic,
                    values: Object.values(dinamicValues[detail.model_id] ?? {}),
                  }
                }

                return {
                  ...detail,
                  settings,
                }
              }),
            },
            production_order: {
              cut: 'A',
              status: 'Pendiente',
              reasigned_curve: reasigned,
              production_order_id: production_order.id,
              production_order_details: [
                ...data
                  .filter((item) => item.product_id !== null)
                  .map((item) => ({
                    destination: item.location,
                    model_type: 'App\\Models\\Product',
                    sizes: Object.values(item.sizes)
                      .filter((size) => size.quantity !== 0)
                      .map((size) => ({
                        id: size.id,
                        size_id: size.size_id,
                        quantity: size.quantity,
                      })),
                  }))
                  .filter((item) => item.sizes.length > 0),
              ],
            },
            ...(productStara
              ? {
                  product_stara: {
                    code: productStara.code,
                    trademark_id: productStara.trademark_id,
                    subcategory_id: formData.subcategory_id,
                  },
                }
              : {}),
            ...(reasigned
              ? {
                  reasigned_curve: true,
                  production_order_id: production_order.id,
                }
              : {}),
          }

          if (reasigned) {
            const updatedDataAux = dataOrigin.map((row) => {
              const updatedSizes = {}

              sizes?.forEach((size) => {
                const sizeBalances = calculateCascadeStockForSize(size.id, dataOrigin, data)
                const remainingQty =
                  sizeBalances[row.location] ?? (row.sizes[size.id]?.quantity || 0)

                updatedSizes[size.id] = {
                  ...row.sizes[size.id],
                  quantity: remainingQty,
                }
              })

              return {
                ...row,
                sizes: updatedSizes,
              }
            })

            const response = await edit(production_order.id, {
              ...production_order,
              fabric_id: production_order.fabric.model_id,
              color_id: production_order.color[0].id,
              reasigned_curve: false,
              production_order_id: null,
              production_order_details: [
                {
                  model_id: production_order.production_order_details.find(
                    (item) => item.model_type === 'App\\Models\\Supply',
                  ).model_id,
                  model_type: 'App\\Models\\Supply',
                  destination: null,
                  rows: [
                    {
                      sizes: production_order.production_order_details
                        .find((item) => item.model_type === 'App\\Models\\Supply')
                        .production_order_detail_quantities.map((size) => ({
                          id: size.id,
                          size_id: size.size_id,
                          quantity: size.quantity,
                        })),
                    },
                  ],
                },
                ...updatedDataAux
                  .filter((item) => item.product_id !== null)
                  .map((item) => ({
                    destination: item.location,
                    model_id: item.product_id,
                    model_type: 'App\\Models\\Product',
                    sizes: Object.values(item.sizes)
                      .filter((size) => size.id !== null)
                      .map((size) => ({
                        id: size.id,
                        size_id: size.size_id,
                        quantity: size.quantity,
                      })),
                  })),
              ],
            })
          }
          const response = await create(data_send)
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          /*setTimeout(() => {
            onChangeView({ name: 'back', title: 'Listar Productos' })
          }, 2510)*/
        } catch (error) {
          console.log(error)
          setValidated(true)
        }
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Acción cancelada',
        })
      }
    })
  }

  useEffect(() => {
    if (!technical_sheet) return

    setTecSupplies({ ...technical_sheet.supplies })
  }, [technical_sheet])

  const handleSupplyChange = async (supply_type, data) => {
    try {
      setTecSupplies((prev) => ({
        ...prev,
        [supply_type]: {
          ...data,
        },
      }))
    } catch (error) {
      setValidated(true)
    }
  }

  if (!technical_sheet || !production_order) {
    return (
      <LoadingForm
        title="Cargando Información"
        subtitle="Un momento mientras se carga la información..."
        height="400px"
      />
    )
  }

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0 animate-fade-in">
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
          <span className="fw-bold fs-5 font-montserrat">Crear Transformación</span>
        </div>
        <div className="d-flex justify-content-end align-items-center mt-3 gap-2">
          <CButton
            className="d-flex align-items-center gap-2 font-poppins btn-primary-add"
            type="submit"
            onClick={() => handleSubmit(formData)}
          >
            <Save size={16} /> Guardar
          </CButton>
          <CButton
            className="d-flex align-items-center gap-2 font-poppins btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'back', title: 'Listar Productos' })
            }}
          >
            <ArrowLeftCircle size={16} /> Volver
          </CButton>
        </div>
      </div>
      <div className="p-3">
        <InformationTransformation
          technical_sheet={technical_sheet}
          fetchCollections={fetchCollections}
          collections={collections}
          fetchSubgroups={fetchSubgroups}
          subgroups={subgroups}
          fetchGarmentTypes={fetchGarmentTypes}
          garment_types={garment_types}
          fetchWashTones={fetchWashTones}
          wash_tones={wash_tones}
          fetchColors={fetchColors}
          colors={colors}
          fetchBackTypes={fetchBackTypes}
          back_types={back_types}
          fetchBootTypes={fetchBootTypes}
          boot_types={boot_types}
          fetchYokeTypes={fetchYokeTypes}
          yoke_types={yoke_types}
          fetchWaistbandTypes={fetchWaistbandTypes}
          waistband_types={waistband_types}
          fetchEmployees={fetchEmployees}
          employees={employees}
          handleSubmit={handleSubmit}
          errors={errors}
          validated={validated}
          formData={formData}
          setFormData={setFormData}
          statusTechnical={statusTechnical}
          trademarks={trademarks}
          categories={categories}
          fetchCategories={fetchCategories}
          subcategories={subcategories}
          fetchSubcategories={fetchSubcategories}
          findTrademarkByCode={findTrademarkByCode}
        />
      </div>

      <div className="p-4">
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              flex: 0.02,
              height: '2px',
              backgroundColor: '#e9ecef',
            }}
          />
          <h5 className="mb-0 fw-bold font-montserrat">Tipos de Insumos</h5>
          <div
            style={{
              flex: 1,
              height: '2px',
              backgroundColor: '#e9ecef',
            }}
          />
        </div>

        <p className="text-muted mt-2 mb-3 font-poppins" style={{ fontSize: '13px' }}>
          Seleccione el insumo correspondiente para cada tipo de insumo requerido por la ficha
          técnica.
        </p>

        <div className="custom-table-responsive font-inter">
          <table className="table align-middle custom-corporate-table mb-0">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="text-dark fw-bold font-montserrat"
                  style={{ fontSize: '14px', whiteSpace: 'nowrap' }}
                >
                  Tipo de Insumo
                </th>
                <th
                  scope="col"
                  className="text-dark fw-bold font-montserrat"
                  style={{ fontSize: '14px' }}
                >
                  Descripción
                </th>
                <th
                  scope="col"
                  className="text-dark fw-bold font-montserrat"
                  style={{ minWidth: 220, fontSize: '14px' }}
                >
                  Insumo
                </th>
              </tr>
            </thead>
            <tbody>
              {supply_types?.map((supply_type) => {
                const hasError = !!errors?.[`supply.${supply_type.id}`]

                return (
                  <tr key={supply_type.id} className={hasError ? 'table-row-error' : ''}>
                    <td className="text-slate font-inter">{supply_type.name}</td>
                    <td className="text-slate font-inter">{supply_type.description}</td>
                    <td
                      className="d-flex gap-2 align-items-center justify-content-between position-relative"
                      style={{ minHeight: '53px' }}
                    >
                      {editingSupplies === supply_type.id ? (
                        <CFormSelect
                          autoFocus
                          className="custom-table-select"
                          value={
                            supplies[supply_type.id][tecSupplies?.[supply_type.id]?.id]?.value || ''
                          }
                          onChange={(e) => {
                            handleSupplyChange(
                              supply_type.id,
                              supplies[supply_type.id][e.target.value].data,
                            )
                            setEditingSupplies(null)
                          }}
                          onBlur={() => setEditingSupplies(null)}
                          placeholder="Seleccione..."
                        >
                          <option value={''}>Seleccione...</option>
                          {Object.values(supplies[supply_type.id]).map((v) => (
                            <option key={v.value} value={v.value}>
                              {v.label}
                            </option>
                          ))}
                        </CFormSelect>
                      ) : (
                        <span
                          className="text-slate editable-span-trigger font-inter"
                          onClick={() => setEditingSupplies(supply_type.id)}
                        >
                          {tecSupplies?.[supply_type.id]?.name || 'Seleccione...'}
                        </span>
                      )}
                      {hasError && (
                        <CPopover
                          visible={openPopoverSupply?.id === supply_type.id}
                          placement="left"
                          onHide={() => setOpenPopoverSupply(null)}
                          title={
                            <div
                              className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                              style={{
                                color: '#991B1B',
                                fontSize: '0.85rem',
                                padding: '2px 0',
                              }}
                            >
                              <BadgeAlert size={15} className="text-danger" />
                              <span>Errores de validación</span>
                            </div>
                          }
                          content={
                            <div
                              className="font-inter custom-popover-error"
                              style={{
                                maxWidth: '260px',
                                fontSize: '0.82rem',
                              }}
                            >
                              {errors?.[`supply.${supply_type.id}`].map((err, i) => (
                                <div
                                  key={i}
                                  className="d-flex align-items-start gap-2 p-1 rounded-2"
                                >
                                  <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                                </div>
                              ))}
                            </div>
                          }
                        >
                          <span
                            style={{
                              cursor: 'pointer',
                              color: '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              paddingLeft: '4px',
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenPopoverSupply((prev) => {
                                if (prev?.id === supply_type.id) {
                                  return null
                                }
                                return { id: supply_type.id }
                              })
                            }}
                          >
                            <BadgeAlert size={16} />
                          </span>
                        </CPopover>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4">
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              flex: 0.02,
              height: '2px',
              backgroundColor: '#e9ecef',
            }}
          />
          <h5 className="mb-0 fw-bold font-montserrat">Especificación de Curva</h5>
          <div
            style={{
              flex: 1,
              height: '2px',
              backgroundColor: '#e9ecef',
            }}
          />
        </div>

        <p className="text-muted mt-2 mb-3 font-poppins" style={{ fontSize: '13px' }}>
          Especifique las unidades de cada talla de la curva original que se utilizarán en esta
          transformación.
        </p>

        <TransformationReassignmentCurve
          production_order={production_order}
          technical_sheet={technical_sheet}
          sizes={sizes}
          sizes_now={formData?.sizes}
          dataOrigin={dataOrigin}
          setDataOrigin={setDataOrigin}
          trademarks={trademarks}
          createProduct={createProduct}
          errors={
            !!errors
              ? Object.entries(errors)
                  .filter(([key]) =>
                    key.startsWith('production_order_details.App\\Models\\Product'),
                  )
                  .reduce((acc, [key, value]) => {
                    acc[key.split('.')[2]] = value
                    return acc
                  }, {})
              : null
          }
          errors_create={errors_create}
          dataNew={dataNew}
          setDataNew={setDataNew}
          data={data}
          setData={setData}
          formData={formData}
          reasigned={reasigned}
          setReasigned={setReasigned}
          productStara={productStara}
          setProductStara={setProductStara}
          formDataStara={formDataStara}
          setFormDataStara={setFormDataStara}
          validated={validated}
          findTrademarkByCode={findTrademarkByCode}
        />
      </div>

      <TechnicalSheetDetail
        technical_sheet={technical_sheet}
        processes={processes}
        errors={errors}
        models={models}
        statusCollection={statusCollection}
        details={details}
        setDetails={setDetails}
        dinamicValues={dinamicValues}
        setDinamicValues={setDinamicValues}
        validated={validated}
        staticValues={staticValues}
        setStaticValues={setStaticValues}
        catalogsData={catalogsData}
        dataGet={dataGet}
        loadCatalog={loadCatalog}
      />
    </CCard>
  )
}

export default Create
