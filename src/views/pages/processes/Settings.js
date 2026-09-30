import api from '../../../API/api'
import { getConfig } from '../../../axiosConfig'
import { useState, useEffect } from 'react'
import { Toast } from '@/components/Toast'
import { IoMdArrowDropright } from 'react-icons/io'
import {
  ArrowLeftCircle,
  ClipboardX,
  ClipboardCheck,
  Layers,
  ArrowRight,
  BetweenHorizontalStart,
  ListTree,
  TextInitial,
} from 'lucide-react'
import { CCol, CForm, CFormLabel, CFormInput, CCard, CButton, CRow, CBadge } from '@coreui/react'
import Swal from 'sweetalert2'
import LoadingForm from '@/components/LoadingForm'
import TableDinamicComponent from '@/components/TableDinamicComponent'
import TableStaticComponent from '@/components/TableStaticComponent'

const Settings = ({ process, onChangeView, errors, setting, models }) => {
  const [catalogsData, setCatalogsData] = useState({})
  const [validated, setValidated] = useState({})

  const getCatalog = async (key, params = {}) => {
    try {
      const url = Object.entries(models).find(([_, value]) => value.model === key)?.[1]?.url
      const response = await api.get(url, {
        ...getConfig(),
        params,
      })

      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error desconocido' }
    }
  }

  const loadCatalog = async (key /*, form*/) => {
    /*const catalog = CATALOGS[field.source.name]

    if (!catalog) return



    if (field.depends_on) {
      params[field.depends_on] = form[field.depends_on]
    }
    */
    const params = {}
    if (catalogsData[key]) return

    const res = await getCatalog(key, params)

    setCatalogsData((prev) => ({
      ...prev,
      [key]: res.data[Object.entries(models).find(([_, value]) => value.model === key)[0]],
    }))
  }

  useEffect(() => {
    const loadAllCatalogs = async () => {
      const schema = process?.settings?.schema || {}

      const modelsToLoad = new Set()

      if (schema.dinamic) {
        for (const field of schema?.dinamic?.body || []) {
          if (field.type === 'selectdinamic' && !catalogsData[field.model]) {
            modelsToLoad.add(field.model)
          }
        }
      }

      if (schema.static) {
        for (const row of schema?.static?.body || []) {
          for (const field of row || []) {
            if (field.type === 'selectdinamic' && !catalogsData[field.model]) {
              modelsToLoad.add(field.model)
            }
          }
        }
      }
      for (const model of modelsToLoad) {
        await loadCatalog(model)
      }
    }

    loadAllCatalogs()
  }, [process])

  const handleSubmitEdit = async (index, data, message = true) => {
    if (message) {
      const result = await Swal.fire({
        title: 'Actualizar Estructura',
        html: `<div style="font-size:14px">
                Se guardará la información de la estructura en el sistema.<br/>
                <strong>¿Deseas continuar?</strong>
              </div>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, guardar',
        cancelButtonText: 'Cancelar',
      })

      if (!result.isConfirmed) {
        Toast.fire({
          icon: 'error',
          title: 'Acción cancelada',
        })
        return false
      }
    }

    try {
      const currentStructure = process?.settings?.schema
      const newStructure = { ...currentStructure }
      newStructure[index] = data
      const updatedProcess = {
        ...process,
        settings: {
          ...process.settings,
          schema: newStructure,
        },
      }

      const response = await setting(process.id, updatedProcess)

      setValidated((prev) => ({
        ...prev,
        [index]: true,
      }))

      Toast.fire({
        icon: 'success',
        title: response.message,
      })

      return true
    } catch (error) {
      setValidated((prev) => ({
        ...prev,
        [index]: true,
      }))

      return false
    }
  }

  if (!process) {
    return (
      <LoadingForm
        title="Cargando información"
        subtitle="Un momento mientras se carga la información..."
        height="400px"
      />
    )
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

  return (
    <div className="animate-fade-in">
      <CCard className="mb-4 p-3 shadow-sm border-0">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
            <span className="fw-bold fs-5 font-montserrat">Información del Proceso</span>
            <CBadge
              color={process?.settings?.in_technical_sheet ? 'success' : 'secondary'}
              variant="outline"
              className="ms-3 p-2 d-flex align-items-center gap-1 font-inter"
            >
              {process?.settings?.in_technical_sheet ? (
                <>
                  <ClipboardCheck size={14} /> Pertenece a Ficha Técnica
                </>
              ) : (
                <>
                  <ClipboardX size={14} /> Proceso General
                </>
              )}
            </CBadge>
          </div>
          <CButton
            className="d-flex align-items-center gap-2 font-poppins btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Procesos' })
            }}
          >
            <ArrowLeftCircle size={16} /> Volver
          </CButton>
        </div>
        <CRow>
          <CCol md={12}>
            <CForm className="row g-3 needs-validation p-4">
              <CCol md={4}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <TextInitial size={15} /> Nombre
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={process?.name}
                  disabled
                  className="font-montserrat custom-input"
                />
              </CCol>
              <CCol md={8}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <TextInitial size={15} /> Descripción
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="description"
                  value={process?.description}
                  disabled
                  className="font-montserrat custom-input"
                />
              </CCol>
            </CForm>
          </CCol>
          <CCol md={12}>
            <div className="mb-3 mt-3 px-4">
              <h6 className="mb-3 fw-bold d-flex align-items-center gap-2 font-poppins">
                <Layers size={18} style={{ color: '#C21111' }} />
                Línea de Secuencia
              </h6>
              <div className="d-flex align-items-center justify-content-center gap-4">
                {process?.before_processes?.length > 0 && (
                  <div className="d-flex flex-column gap-2">
                    {process.before_processes.map((prev) => (
                      <div key={prev.id} className="node node-secondary border-dashed">
                        <span className="node-label">Proceso Anterior</span>
                        <div className="node-content text-truncate">{prev.name}</div>
                      </div>
                    ))}
                  </div>
                )}
                {process?.before_processes?.length > 0 && (
                  <ArrowRight className="text-muted opacity-50" size={30} />
                )}
                <div className="node node-active shadow-lg">
                  <span className="node-label text-white-50">Proceso Actual</span>
                  <div className="node-content text-white fs-5">{process?.name}</div>
                </div>
                {process?.after_processes?.length > 0 && (
                  <ArrowRight className="text-muted opacity-50" size={30} />
                )}
                {process?.after_processes?.length > 0 && (
                  <div className="d-flex flex-column gap-2">
                    {process.after_processes.map((after) => (
                      <div key={after.id} className="node node-secondary">
                        <span className="node-label">Proceso Siguiente</span>
                        <div className="node-content text-truncate">{after.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CCol>
          <CCol md={12}>
            <div className="mb-3 mt-3 px-4">
              <h6 className="mb-3 fw-bold d-flex align-items-center gap-2 font-poppins">
                <BetweenHorizontalStart size={18} style={{ color: '#C21111' }} />
                Configuración de Estructura
              </h6>
              <div
                className="mb-5 shadow-sm border-start border-4 rounded-end"
                style={{ borderLeftColor: '#C21111', backgroundColor: '#fcfcfc' }}
              >
                <div className="p-3 d-flex align-items-center gap-2 border-bottom bg-white rounded-top">
                  <Layers size={18} className="text-muted" />
                  <span className="fw-semibold font-poppins text-dark">Tabla Dinámica</span>
                </div>
                <div className="p-3">
                  <TableDinamicComponent
                    data={process?.settings?.schema?.dinamic}
                    ind={'dinamic'}
                    handleSubmitEdit={handleSubmitEdit}
                    errors={errors}
                    validated={validated['dinamic']}
                    setValidated={setValidated}
                    catalogsData={catalogsData}
                    models={models}
                    dataGet={dataGet}
                  />
                </div>
              </div>

              <div
                className="mb-4 shadow-sm border-start border-4 rounded-end"
                style={{ borderLeftColor: '#4A5568', backgroundColor: '#fcfcfc' }}
              >
                <div className="p-3 d-flex align-items-center gap-2 border-bottom bg-white rounded-top">
                  <Layers size={18} className="text-muted" />
                  <span className="fw-semibold font-poppins text-dark">Tabla Estática</span>
                </div>
                <div className="p-3">
                  <TableStaticComponent
                    data={process?.settings?.schema?.static}
                    ind={'dinamic'}
                    handleSubmitEdit={handleSubmitEdit}
                    errors={errors}
                    validated={validated['static']}
                    setValidated={setValidated}
                    catalogsData={catalogsData}
                    models={models}
                    dataGet={dataGet}
                  />
                </div>
              </div>
            </div>
          </CCol>
        </CRow>
      </CCard>
    </div>
  )
}

export default Settings
