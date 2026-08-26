import { useState } from 'react'
import {
  CCard,
  CFormInput,
  CCol,
  CButton,
  CForm,
  CFormFeedback,
  CFormLabel,
  CFormCheck,
  CInputGroup,
  CFormSelect,
} from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import { useEffect } from 'react'
import {
  Save,
  ArrowLeftCircle,
  BadgeCheck,
  BadgeAlert,
  TextInitial,
  ListChecks,
  FileCheckCorner,
} from 'lucide-react'
import { Toast } from '@/components/Toast'
import Swal from 'sweetalert2'
import LoadingForm from '@/components/LoadingForm'

const Edit = ({ supply_type, onChangeView, onSubmit, errors }) => {
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (supply_type) {
      setFormData({
        name: supply_type.name || '',
        description: supply_type.description || '',
        settings: supply_type.settings || {},
      })
    }
  }, [supply_type])

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Editar Tipo de Insumo',
      html: `<div style="font-size:14px">
              Se guardará la nueva información del tipo de insumo en el sistema.<br/>
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
          const inf = {
            name: formData.name,
            description: formData.description,
            settings: {
              ...formData.settings,
              has_supplies: formData.settings.has_supplies,
              in_technical_sheet: formData.settings.in_technical_sheet,
              in_production_order: formData.settings.in_production_order,
              paragraph: formData.settings.paragraph,
            },
          }
          const response = await onSubmit(supply_type.id, inf)
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setTimeout(() => {
            onChangeView({ name: 'list', title: 'Listar Tipos de Insumo' })
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

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }))
  }

  if (!supply_type) {
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
      <div className="d-flex align-items-center mb-3">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Editar Tipo de Insumo</span>
      </div>
      <CForm className="row g-3 needs-validation p-4" onSubmit={handleSubmit}>
        <CCol md={6}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <TextInitial size={15} /> Nombre
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            invalid={!!errors?.name}
            valid={!errors?.name && formData.name !== '' && validated}
            className="font-montserrat custom-input"
          />
          <CFormFeedback invalid>
            {errors?.name?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback valid>
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </CCol>
        <CCol md={6}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <TextInitial size={15} /> Descripción
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            invalid={!!errors?.description}
            valid={!errors?.description && formData.description !== '' && validated}
            className="font-montserrat custom-input"
          />
          <CFormFeedback invalid>
            {errors?.description?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback valid>
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </CCol>
        <CCol md={6}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <ListChecks size={15} /> ¿Tiene insumos?
          </CFormLabel>
          <div
            className="px-2 border rounded-3 d-flex align-items-center bg-white"
            style={{
              minHeight: '40px',
              borderColor: '#dbdfea',
            }}
          >
            <CFormCheck
              id="has_supplies"
              name="has_supplies"
              checked={formData?.settings?.has_supplies}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    has_supplies: e.target.checked,
                  },
                }))
              }}
              label={
                <label
                  htmlFor="has_supplies"
                  className="font-montserrat cursor-pointer"
                  style={{ marginBottom: 0 }}
                >
                  Selecciona si el tipo de insumo tendrá insumos
                </label>
              }
              valid={formData?.settings?.has_supplies && validated}
            />
          </div>
          <CFormFeedback valid>
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </CCol>
        <CCol md={6}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <FileCheckCorner size={15} /> ¿Pertenece a la ficha técnica?
          </CFormLabel>
          <div
            className="px-2 border rounded-3 d-flex align-items-center bg-white"
            style={{
              minHeight: '40px',
              borderColor: '#dbdfea',
            }}
          >
            <CFormCheck
              name="in_technical_sheet"
              label={
                <span className="font-montserrat">Selecciona si pertenece a la ficha tecnica</span>
              }
              checked={formData?.settings?.in_technical_sheet}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    in_technical_sheet: e.target.checked,
                  },
                }))
              }}
              valid={formData?.settings?.in_technical_sheet && validated}
            />
          </div>
          <CFormFeedback valid>
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </CCol>
        <CCol md={6}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <ListChecks size={15} /> ¿Pertenece a la orden de producción?
          </CFormLabel>
          <div
            className="px-2 border rounded-3 d-flex align-items-center bg-white"
            style={{
              minHeight: '40px',
              borderColor: '#dbdfea',
            }}
          >
            <CFormCheck
              name="in_production_order"
              label={
                <span className="font-montserrat">
                  Selecciona si pertenece a la orden de producción
                </span>
              }
              checked={formData?.settings?.in_production_order}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    in_production_order: e.target.checked,
                    paragraph: '',
                  },
                }))
              }}
              valid={formData?.settings?.in_production_order && validated}
            />
          </div>
          <CFormFeedback valid>
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </CCol>
        <CCol md={6}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <ListChecks size={15} /> ¿A que apartado pertenece?
          </CFormLabel>
          <CInputGroup>
            <CFormSelect
              name="paragraph"
              value={formData?.settings?.paragraph}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    paragraph: e.target.value,
                  },
                }))
              }}
              disabled={!formData.settings?.in_production_order}
              options={[
                { label: 'Seleccione una opción', value: '' },
                { label: 'TELA', value: 'fabric' },
                { label: 'ROLLO', value: 'roll' },
              ]}
              invalid={!!errors?.paragraph}
              valid={!errors?.paragraph && formData.settings?.paragraph !== '' && validated}
              style={{ borderRadius: '5px 5px 5px 5px' }}
              className="font-montserrat input-custom"
            />
            <CFormFeedback invalid>
              {errors?.paragraph?.map((error, index) => (
                <div key={index} className="d-flex align-items-center gap-1">
                  <BadgeAlert size={13} />
                  <small className="font-inter" style={{ whiteSpace: 'pre-line' }}>
                    {error}
                  </small>
                </div>
              ))}
            </CFormFeedback>
            <CFormFeedback valid>
              <div className="d-flex align-items-center gap-1">
                <BadgeCheck size={13} />
                <small className="font-inter">Dato Válido</small>
              </div>
            </CFormFeedback>
          </CInputGroup>
        </CCol>
        <div className="d-flex justify-content-between align-items-center mt-5">
          <CButton
            className="d-flex align-items-center gap-2 font-poppins  btn-primary-revolve me-2"
            onClick={() => onChangeView({ name: 'list', title: 'Listar Tipos de Insumo' })}
          >
            <ArrowLeftCircle size={16} /> Volver
          </CButton>
          <CButton
            className="d-flex align-items-center gap-2 font-poppins btn-primary-add "
            type="submit"
          >
            <Save size={16} /> Guardar
          </CButton>
        </div>
      </CForm>
    </CCard>
  )
}

export default Edit
