import { useState } from 'react'
import {
  CCard,
  CFormInput,
  CCol,
  CButton,
  CForm,
  CFormFeedback,
  CFormLabel,
  CInputGroup,
} from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import { useEffect } from 'react'
import { Save, ArrowLeftCircle, BadgeCheck, BadgeAlert, TextInitial } from 'lucide-react'
import { Toast } from '@/components/Toast'
import Swal from 'sweetalert2'
import LoadingForm from '@/components/LoadingForm'

const Edit = ({ role, onChangeView, onSubmit, errors }) => {
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        title: role.title || '',
        description: role.description || '',
      })
    }
  }, [role])

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Editar Rol',
      html: `<div style="font-size:14px">
              Se guardará la nueva información del rol en el sistema.<br/>
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
          const response = await onSubmit(role.id, formData)
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setTimeout(() => {
            setFormData({
              name: '',
              title: '',
              description: '',
            })
            onChangeView({ name: 'list', title: 'Listar Roles' })
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
      [name]: value,
    }))
  }

  if (!role) {
    return (
      <LoadingForm
        title="Cargando formulario"
        subtitle="Un momento mientras se carga la información del rol..."
        height="400px"
      />
    )
  }

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0 animate-fade-in">
      <div className="d-flex align-items-center mb-3">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Editar Rol</span>
      </div>
      <CForm className="row g-3 needs-validation p-4" onSubmit={handleSubmit}>
        <CCol md={6}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <TextInitial size={15} /> Nombre
          </CFormLabel>
          <CFormInput
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            invalid={!!errors?.name}
            valid={!errors?.name && formData.name !== '' && validated}
            className="font-montserrat"
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
            <TextInitial size={15} /> Título
          </CFormLabel>
          <CFormInput
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            invalid={!!errors?.title}
            valid={!errors?.title && formData.title !== '' && validated}
            className="font-montserrat input-custom"
          />
          <CFormFeedback invalid>
            {errors?.title?.map((error, index) => (
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
        <CCol md={12}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <TextInitial size={15} /> Descripción
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              invalid={!!errors?.description}
              valid={!errors?.description && formData.description !== '' && validated}
              className="font-montserrat input-custom"
            />
            <CFormFeedback invalid>
              {errors?.description?.map((error, index) => (
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
            onClick={() => onChangeView({ name: 'list', title: 'Listar Roles' })}
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
