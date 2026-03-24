import { useState } from 'react'
import {
  CCard,
  CFormInput,
  CCol,
  CButton,
  CForm,
  CFormFeedback,
  CFormLabel,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import {
  Save,
  ArrowLeftCircle,
  BadgeCheck,
  BadgeAlert,
  TextInitial,
  CirclePile,
  Search,
} from 'lucide-react'
import { Toast } from '../../../components/Toast'
import Swal from 'sweetalert2'
import * as FaIcons from 'react-icons/fa'

const Create = ({ onChangeView, onSubmit, errors }) => {
  const [validated, setValidated] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Crear Módulo',
      html: `<div style="font-size:14px">
              Se guardará la información del módulo en el sistema.<br/>
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
          console.log(formData)
          const response = await onSubmit(formData)
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setTimeout(() => {
            setFormData({
              name: '',
              icon: '',
            })
            onChangeView({ name: 'list', title: 'Listar Módulos' })
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

  const iconList = Object.keys(FaIcons)
    .filter((iconName) => iconName.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 50)

  const selectIcon = (iconName) => {
    setFormData({ ...formData, icon: iconName })
  }

  const SelectedIcon = formData.icon ? FaIcons[formData.icon] : null

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0">
      <div className="d-flex align-items-center mb-3">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Crear Módulo</span>
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
            <CirclePile size={15} />
            Icono
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CDropdown className="w-100">
            <CInputGroup>
              <CInputGroupText className="bg-white">
                {SelectedIcon ? (
                  <SelectedIcon size={20} className="text-primary" />
                ) : (
                  <Search size={18} />
                )}
              </CInputGroupText>

              <CDropdownToggle
                caret={false}
                className="form-control text-start font-montserrat d-flex align-items-center justify-content-between"
                variant="outline"
              >
                {formData.icon || 'Selecciona un icono...'}
              </CDropdownToggle>
            </CInputGroup>

            <CDropdownMenu
              className="w-100 p-3 shadow border-0 rounded-3"
              style={{ maxHeight: '300px', overflowY: 'auto' }}
            >
              <CFormInput
                placeholder="Buscar icono..."
                className="mb-3 sticky-top"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                {iconList.map((iconName) => {
                  const IconComponent = FaIcons[iconName]
                  return (
                    <CButton
                      key={iconName}
                      variant="ghost"
                      className={`p-2 rounded-2 ${formData.icon === iconName ? 'bg-primary text-white' : 'text-secondary'}`}
                      title={iconName}
                      onClick={() => selectIcon(iconName)}
                    >
                      <IconComponent size={22} />
                    </CButton>
                  )
                })}
              </div>
            </CDropdownMenu>
          </CDropdown>
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
              onChangeView({ name: 'list', title: 'Listar Módulos' })
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
