import api from '../../../API/api'
import { getConfig } from '../../../axiosConfig'
import { useState } from 'react'
import { CCard, CButton, CPopover, CFormSelect } from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import { useEffect } from 'react'
import { ArrowLeftCircle, CheckCircle2, Clock, AlertCircle, Save, BadgeAlert } from 'lucide-react'
import LoadingForm from '@/components/LoadingForm'
import { useRef } from 'react'
import InformationTechnicalSheet from '@/components/InformationTechnicalSheet'
import TechnicalSheetDetail from '@/components/TechnicalSheetDetail'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'

export const Create = ({
  product,
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
  create,
  errors,
  models,
  statusCollection,
  statusTechnical,
}) => {
  console.log(errors)
  const [editingField, setEditingField] = useState(null)
  const inputRefs = useRef({})
  const [formData, setFormData] = useState({ status: 'Pendiente' })
  const [photoDPreview, setPhotoDPreview] = useState(null)
  const [photoTPreview, setPhotoTPreview] = useState(null)
  const [details, setDetails] = useState({})
  const [validated, setValidated] = useState(false)
  const [editingSupplies, setEditingSupplies] = useState(null)
  const [tecSupplies, setTecSupplies] = useState({})
  const [dinamicValues, setDinamicValues] = useState({})
  const [staticValues, setStaticValues] = useState({})
  const [openPopoverSupply, setOpenPopoverSupply] = useState({
    id: null,
  })
  const [catalogsData, setCatalogsData] = useState({})
  const [dependentFields, setDependentFields] = useState({})

  useEffect(() => {
    if (!processes) return

    const aux_details = {}

    Object.values(processes).forEach((process) => {
      aux_details[process.id] = {
        model_id: process.id,
        model_type: 'App\\Models\\Process',
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
    })

    setDetails({ ...aux_details })
  }, [processes])

  useEffect(() => {
    if (!product) return

    setFormData((prev) => ({
      ...prev,
      product_id: product.id,
    }))
  }, [product])

  useEffect(() => {
    if (!details) return

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
      throw error.response?.data || { message: 'Error desconocido' }
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

  const handleSubmit = async (data) => {
    Swal.fire({
      title: 'Crear Ficha Técnica',
      html: `<div style="font-size:14px">
                Se guardará la información de la ficha técnica del producto en el sistema.<br/>
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
          const response = await create({
            ...data,
            photo_d: { ...photoDPreview },
            photo_t: { ...photoTPreview },
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
            supplies: Object.values(tecSupplies)
              .map((item) => item?.id)
              .filter(Boolean),
          })
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setTimeout(() => {
            onChangeView({ name: 'back', title: 'Listar Productos' })
          }, 2510)
        } catch (error) {
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

  if (!product && !processes) {
    return (
      <LoadingForm
        title="Cargando formulario"
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
          <span className="fw-bold fs-5 font-montserrat">Crear Ficha Tecnica</span>
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
        <InformationTechnicalSheet
          product={product}
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
          photoDPreview={photoDPreview}
          setPhotoDPreview={setPhotoDPreview}
          photoTPreview={photoTPreview}
          setPhotoTPreview={setPhotoTPreview}
          statusTechnical={statusTechnical}
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
                  style={{ fontSize: '14px', whiteSpace: 'nowrap', width: '30%' }}
                >
                  Tipo de Insumo
                </th>
                <th
                  scope="col"
                  className="text-dark fw-bold font-montserrat"
                  style={{ fontSize: '14px', width: '30%' }}
                >
                  Descripción
                </th>
                <th
                  scope="col"
                  className="text-dark fw-bold font-montserrat"
                  style={{ fontSize: '14px' }}
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
                    <td className="d-flex gap-2 align-items-center justify-content-between position-relative">
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
                          {tecSupplies[supply_type.id]
                            ? `${tecSupplies?.[supply_type.id]?.name} - ${tecSupplies?.[supply_type.id]?.description}`
                            : 'Seleccione...'}
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
      <TechnicalSheetDetail
        product={product}
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
