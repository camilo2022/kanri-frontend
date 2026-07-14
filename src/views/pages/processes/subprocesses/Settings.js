import api from '../../../../API/api'
import { getConfig } from '../../../../axiosConfig'
import { useState, useEffect } from 'react'
import { Toast } from '@/components/Toast'
import { IoMdArrowDropright } from 'react-icons/io'
import { ArrowLeftCircle, Layers, BetweenHorizontalStart, TextInitial } from 'lucide-react'
import { CCol, CForm, CFormLabel, CFormInput, CCard, CButton, CRow } from '@coreui/react'
import Swal from 'sweetalert2'
import LoadingForm from '@/components/LoadingForm'
import TableDinamicComponent from '@/components/TableDinamicComponent'
import TableStaticComponent from '@/components/TableStaticComponent'

const Settings = ({ subprocess, onChangeView, errors, setting, models }) => {
  const [catalogsData, setCatalogsData] = useState({})
  const [validated, setValidated] = useState({})

  const getCatalog = async (key, params = {}) => {
    try {
      const response = await api.get(`${models[key].url}`, {
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
      [key]: res.data[key],
    }))
  }

  useEffect(() => {
    const loadAllCatalogs = async () => {
      const schema = subprocess?.settings?.structure?.schema || []

      for (const field of schema) {
        if (field.type === 'selectdinamic') {
          const keyRule = field.rules.find((v) => v.startsWith('key'))
          if (!keyRule) continue

          const key = keyRule.substring('key:'.length)

          if (!catalogsData[key]) {
            await loadCatalog(key)
          }
        }
      }
    }

    loadAllCatalogs()
  }, [subprocess])

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
      const currentStructure = subprocess?.settings?.schema
      const newStructure = { ...currentStructure }
      newStructure[index] = data
      const updatedSubprocess = {
        ...subprocess,
        settings: {
          ...subprocess.settings,
          schema: newStructure,
        },
      }

      const response = await setting(subprocess.id, updatedSubprocess)

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

  if (!subprocess) {
    return (
      <LoadingForm
        title="Cargando información"
        subprocesstitle="Un momento mientras se carga la información..."
        height="400px"
      />
    )
  }

  return (
    <div className="animate-fade-in">
      <CCard className="mb-4 p-3 shadow-sm border-0">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
            <span className="fw-bold fs-5 font-montserrat">Información del Subproceso</span>
          </div>
          <CButton
            className="d-flex align-items-center gap-2 font-poppins btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Subprocesos' })
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
                  value={subprocess?.name}
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
                  value={subprocess?.description}
                  disabled
                  className="font-montserrat custom-input"
                />
              </CCol>
            </CForm>
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
                    data={subprocess?.settings?.schema?.dinamic}
                    ind={'dinamic'}
                    handleSubmitEdit={handleSubmitEdit}
                    errors={errors}
                    validated={validated['dinamic']}
                    setValidated={setValidated}
                    catalogsData={catalogsData}
                    models={models}
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
                    data={subprocess?.settings?.schema?.static}
                    ind={'static'}
                    handleSubmitEdit={handleSubmitEdit}
                    errors={errors}
                    validated={validated['static']}
                    setValidated={setValidated}
                    catalogsData={catalogsData}
                    models={models}
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
