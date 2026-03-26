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
  CFormSelect,
} from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import { Save, ArrowLeftCircle, BadgeCheck, BadgeAlert, TextInitial } from 'lucide-react'
import { Toast } from '../../../components/Toast'
import Swal from 'sweetalert2'

const Create = ({ onChangeView, onSubmit, errors, roles }) => {
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    role_id: '',
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Crear Permiso',
      html: `<div style="font-size:14px">
              Se guardará la información del permiso en el sistema.<br/>
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
          const response = await onSubmit(formData)
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
              role_id: '',
            })
            onChangeView({ name: 'list', title: 'Listar Permisos' })
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

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0">
      <div className="d-flex align-items-center mb-3">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Crear Permiso</span>
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
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            invalid={!!errors?.title}
            valid={!errors?.title && formData.title !== '' && validated}
            className="font-montserrat"
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
        <CCol md={6} className="mb-4">
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <TextInitial size={15} /> Descripción
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              invalid={!!errors?.description}
              valid={!errors?.description && formData.description !== '' && validated}
              className="font-montserrat"
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
        <CCol md={6} className="mb-4">
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <TextInitial size={15} /> Rol
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CInputGroup>
            <CFormSelect
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              disabled={!Array.isArray(roles)}
              options={
                !Array.isArray(roles)
                  ? [{ label: 'Cargando roles...', value: '' }]
                  : [
                      { label: 'Seleccione un rol', value: '' },
                      ...roles.map((role) => ({
                        label: role.title,
                        value: role.id,
                      })),
                    ]
              }
              invalid={!!errors?.role_id}
              valid={!errors?.role_id && formData.role_id !== '' && validated}
            />
            <CFormFeedback invalid>
              {errors?.role_id?.map((error, index) => (
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
        <div className="d-flex justify-content-between align-items-center mb-4 mt-6">
          <CButton
            className="d-flex align-items-center gap-2 font-poppins btn-primary-add "
            type="submit"
          >
            <Save size={16} /> Guardar
          </CButton>
          <CButton
            className="d-flex align-items-center gap-2 font-poppins  btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Roles' })
            }}
          >
            <ArrowLeftCircle size={16} /> Volver
          </CButton>
        </div>
      </CForm>
    </CCard>
  )
}

export default Create
