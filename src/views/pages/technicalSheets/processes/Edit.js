import api from '../../../../API/api'
import { getConfig } from '../../../../axiosConfig'
import { useState } from 'react'
import { CCard, CButton, CPopover, CFormSelect } from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import { useEffect } from 'react'
import { ArrowLeftCircle, CheckCircle2, Clock, AlertCircle, Save, BadgeAlert } from 'lucide-react'
import LoadingForm from '@/components/LoadingForm'
import { useRef } from 'react'
import InformationTechnicalSheetProcess from '@/components/InformationTechnicalSheetProcess'
import TechnicalSheetDetailProcess from '@/components/TechnicalSheetDetailProcess'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'

export const EditProcess = ({
  product,
  technical_sheet,
  processes,
  supplies,
  onChangeView,
  edit,
  errors,
  models,
  statusCollection,
  process,
}) => {
  const [editingField, setEditingField] = useState(null)
  const inputRefs = useRef({})
  const [formData, setFormData] = useState({
    product_id: product?.id || '',
    collection_id: '',
    subgroup_id: '',
    garment_type_id: '',
    wash_tone_id: '',
    color_id: '',
    back_type_id: '',
    boot_type_id: '',
    yoke_type_id: '',
    waistband_type_id: '',
    date: '',
    measure_of_waistband: 1,
    physical_sample: false,
    number_of_buttons: 1,
    pattern_maker_id: '',
    observation: '',
    description: '',
    photo_d: '',
    photo_t: '',
    code: '',
    status: '',
  })
  const [photoDPreview, setPhotoDPreview] = useState(null)
  const [photoTPreview, setPhotoTPreview] = useState(null)
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

  const handleSubmit = async () => {
    Swal.fire({
      title: 'Editar Ficha Técnica',
      html: `<div style="font-size:14px">
                Se guardará la información actualizada de la ficha técnica del producto en el sistema.<br/>
                <strong>¿Deseas continuar?</strong>
              </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, actualizar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await edit(technical_sheet.id, {
            ...formData,
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

  if (!product || !technical_sheet || !process) {
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
          <span className="fw-bold fs-5 font-montserrat">Editar Proceso</span>
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
        <InformationTechnicalSheetProcess
          product={product}
          technical_sheet={technical_sheet}
          errors={errors}
          validated={validated}
          formData={formData}
          setFormData={setFormData}
          photoDPreview={photoDPreview}
          setPhotoDPreview={setPhotoDPreview}
          photoTPreview={photoTPreview}
          setPhotoTPreview={setPhotoTPreview}
        />
      </div>
      <TechnicalSheetDetailProcess
        product={product}
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
        process={process}
      />
    </CCard>
  )
}

export default EditProcess
