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
  CFormSelect,
} from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
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
} from 'lucide-react'
import { Toast } from '@/components/Toast'
import Swal from 'sweetalert2'
import Select from 'react-select'
import LoadingForm from '@/components/LoadingForm'

const Create = ({ onChangeView, onSubmit, errors, employees }) => {
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfir, setShowPasswordConfir] = useState(false)
  const isInvalid = !!errors?.employee_id
  const isValid = !errors?.employee_id && formData.employee_id !== '' && validated

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Crear usuario',
      html: `<div style="font-size:14px">
              Se guardará la información del usuario en el sistema.<br/>
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
              employee_id: '',
              email: '',
              password: '',
              password_confirmation: '',
            })
            onChangeView({ name: 'list', title: 'Listar Usuarios', id: null })
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

  const customFilterOption = (option, rawInput) => {
    const words = rawInput.toLowerCase().split(' ')
    const label = option.label.toLowerCase()
    return words.every((word) => label.includes(word))
  }

  if (!Array.isArray(employees)) {
    return (
      <LoadingForm
        title="Cargando formulario"
        subtitle="Un momento mientras se carga el formulario..."
        height="400px"
      />
    )
  }

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0 animate-fade-in">
      <div className="d-flex align-items-center mb-3">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Crear Usuario</span>
      </div>
      <CForm className="row g-3 needs-validation p-4" onSubmit={handleSubmit}>
        <CCol md={12}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <UserRound size={15} /> Empleado
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <Select
            name="employee_id"
            value={
              Array.isArray(employees)
                ? (employees
                    ?.map((employee) => ({
                      value: employee.id,
                      label: `${employee?.person?.names || ''} ${employee?.person?.last_names || ''} | ${employee?.person?.document || ''} | ${employee?.position?.name || ''}`,
                    }))
                    .find((opt) => opt.value === formData.employee_id) ?? null)
                : null
            }
            onChange={(selected) =>
              handleChange({
                target: {
                  name: 'employee_id',
                  value: selected?.value || '',
                },
              })
            }
            invalid={!!errors?.employee_id}
            valid={!errors?.employee_id && formData.employee_id !== '' && validated}
            options={
              Array.isArray(employees)
                ? employees.map((employee) => ({
                    value: employee.id,
                    label: `${employee?.person?.names || ''} ${employee?.person?.last_names || ''} | ${employee?.person?.document || ''} | ${employee?.position?.name || ''}`,
                  }))
                : []
            }
            isDisabled={!Array.isArray(employees)}
            isSearchable
            filterOption={customFilterOption}
            className="w-100 font-montserrat"
            placeholder={'Seleccione un empleado'}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: isInvalid ? '#dc3545' : isValid ? '#198754' : '#dbdfe6',
                boxShadow: 'none',
                borderRadius: '0.375rem',
                '&:hover': {
                  borderColor: '#1857b6',
                  boxShadow: '0 0 0 0.2rem rgba(13, 110, 253, 0.25)',
                },
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
                fontFamily: 'Montserrat, sans-serif',
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
                borderRadius: '0.375rem',
                overflow: 'hidden',
              }),
              menuList: (base) => ({
                ...base,
                padding: 0,
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? '#f1f3f5' : 'white',
                color: state.isSelected ? '#1b3761' : '#212529',
                fontWeight: state.isSelected ? 'bold' : '',
                borderRadius: '0px',
              }),
            }}
          />
          <CFormFeedback invalid className={isInvalid ? 'd-block' : 'd-none'}>
            {errors?.employee_id?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>

          <CFormFeedback valid className={isValid ? 'd-block' : 'd-none'}>
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
            className="font-montserrat input-custom"
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
        <CCol md={4} className="mb-4">
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <Lock size={15} /> Contraseña
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              invalid={!!errors?.password}
              valid={!errors?.password && formData.password !== '' && validated}
              className="font-montserrat input-custom"
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
        <CCol md={4} className="mb-4">
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <Lock size={15} /> Confirmación Contraseña
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CInputGroup>
            <CFormInput
              type={showPasswordConfir ? 'text' : 'password'}
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              invalid={!!errors?.password_confirmation || !!errors?.password}
              valid={
                !errors?.password_confirmation &&
                formData.password_confirmation !== '' &&
                !errors?.password &&
                validated
              }
              className="font-montserrat input-custom"
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
              {[
                ...(errors?.password_confirmation || []),
                ...(errors?.password?.filter(
                  (error) => error === 'Las contraseñas no coinciden.',
                ) || []),
              ].map((error, index) => (
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
            className="d-flex align-items-center gap-2 font-poppins  btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Usuarios', id: null })
            }}
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

export default Create
