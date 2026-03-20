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
  CInputGroupText,
} from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import { useEffect } from 'react'
import {
  UserRound,
  Mail,
  Lock,
  Save,
  ArrowLeftCircle,
  BadgeCheck,
  BadgeAlert,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react'
import { Toast } from '../../../components/Toast'
import Swal from 'sweetalert2'

const Edit = ({ user, onChangeView, onSubmit, errors }) => {
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
      })
    }
  }, [user])

  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfir, setShowPasswordConfir] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Editar Usuario',
      html: `<div style="font-size:14px">
              Se guardará la nueva información del usuario en el sistema.<br/>
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
          const response = await onSubmit(user.id, formData)
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
        } catch (error) {
          console.log(error)
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
        <span className="fw-bold fs-5 font-montserrat">Editar Usuario</span>
      </div>
      <CForm className="row g-3 needs-validation p-4" onSubmit={handleSubmit}>
        <CCol md={8}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <UserRound size={15} /> Nombre Completo
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
        <CCol md={4}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <Mail size={15} /> Correo Electrónico
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            invalid={!!errors?.email}
            valid={!errors?.email && formData.email !== '' && validated}
            className="font-montserrat"
          />
          <CFormFeedback invalid>
            {errors?.email?.map((error, index) => (
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
        <CCol md={4}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <Lock size={15} /> Contraseña
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              invalid={!!errors?.password}
              valid={!errors?.password && formData.password !== '' && validated}
              className="font-montserrat"
            />
            <CInputGroupText
              style={{ cursor: 'pointer', borderRadius: '0px 5px 5px 0px' }}
              onClick={() => {
                if (!formData.password) return
                setShowPassword(!showPassword)
              }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </CInputGroupText>
            <CFormFeedback invalid>
              {errors?.password?.map((error, index) => (
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
        <CCol md={4}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <Lock size={15} /> Confirmación Contraseña
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type={showPasswordConfir ? 'text' : 'password'}
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              invalid={!!errors?.password_confirmation}
              valid={
                !errors?.password_confirmation && formData.password_confirmation !== '' && validated
              }
              className="font-montserrat"
            />
            <CInputGroupText
              style={{ cursor: 'pointer', borderRadius: '0px 5px 5px 0px' }}
              onClick={() => {
                if (!formData.password_confirmation) return
                setShowPasswordConfir(!showPasswordConfir)
              }}
            >
              {showPasswordConfir ? <EyeOff size={15} /> : <Eye size={15} />}
            </CInputGroupText>
            <CFormFeedback invalid>
              {errors?.password_confirmation?.map((error, index) => (
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
        <CCol md={8} className="mb-4 pt-md-4 -mt-2">
          <div
            className="p-2 rounded-3 shadow-sm font-inter"
            style={{
              backgroundColor: '#EBFBE9',
              borderLeft: '4px solid #238A19',
              fontSize: '12px',
              marginTop: '-30px',
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-1 fw-bold">
              <Info size={16} />
              <span>Actualización de contraseña</span>
            </div>
            <p className="m-0 text-muted">
              Si desea actualizar la contraseña, ingrese la contraseña y confirmación. De lo
              contrario, deje los campos vacíos.
            </p>
          </div>
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
            onClick={() => onChangeView({ name: 'list', title: 'Listar Usuarios', id: null })}
          >
            <ArrowLeftCircle size={16} /> Volver
          </CButton>
        </div>
      </CForm>
    </CCard>
  )
}

export default Edit
