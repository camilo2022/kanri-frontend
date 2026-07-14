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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
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
  CirclePile,
  Search,
  ChevronsLeft,
  ChevronsRight,
  Link,
} from 'lucide-react'
import { Toast } from '@/components/Toast'
import Swal from 'sweetalert2'
import * as FaIcons from 'react-icons/fa'
import LoadingForm from '@/components/LoadingForm'
import Select from 'react-select'

const Edit = ({ submodule, onChangeView, onSubmit, errors, moduleId, roles }) => {
  const [validated, setValidated] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const iconsPerPage = 80
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    url: '',
    permission_id: '',
    module_id: moduleId,
  })

  useEffect(() => {
    if (submodule) {
      setFormData({
        name: submodule.name || '',
        icon: submodule.icon || '',
        url: submodule.url,
        permission_id: submodule.permission.id,
        module_id: submodule.module.id,
      })
    }
  }, [submodule])

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Editar Submódulo',
      html: `<div style="font-size:14px">
              Se guardará la nueva información del submódulo en el sistema.<br/>
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
          const response = await onSubmit(submodule.id, formData)
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setTimeout(() => {
            setFormData({
              name: '',
              icon: '',
              url: '',
              permission_id: '',
            })
            onChangeView({ name: 'list', title: 'Listar Submódulos' })
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

  const filteredIcons = Object.keys(FaIcons).filter((iconName) =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const indexOfLastIcon = currentPage * iconsPerPage
  const indexOfFirstIcon = indexOfLastIcon - iconsPerPage
  const currentIcons = filteredIcons.slice(indexOfFirstIcon, indexOfLastIcon)

  const totalPages = Math.ceil(filteredIcons.length / iconsPerPage)

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  if (!(submodule && Array.isArray(roles))) {
    return (
      <LoadingForm
        title="Cargando formulario"
        subtitle="Un momento mientras se carga el formulario..."
        height="400px"
      />
    )
  }

  const customFilterOption = (option, rawInput) => {
    const words = rawInput.toLowerCase().split(' ')
    const label = option.label.toLowerCase()
    return words.every((word) => label.includes(word))
  }

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0 animate-fade-in">
      <div className="d-flex align-items-center mb-3">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Editar Submódulo</span>
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
            className="font-montserrat input-custom"
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
          </CFormLabel>
          <CDropdown className="w-100" autoClose="outside">
            <CInputGroup
              className={`${errors?.icon ? 'is-invalid' : ''}
                          ${!errors?.icon && formData.icon && validated ? 'is-valid' : ''}`}
            >
              <CInputGroupText
                className={`
                  bg-white
                  ${errors?.icon ? 'border-danger text-danger' : ''}
                  ${!errors?.icon && formData.icon && validated ? 'border-success text-success' : ''}
                `}
              >
                {formData.icon ? (
                  (() => {
                    const Icon = FaIcons[formData.icon]
                    return <Icon size={20} className="text-primary" />
                  })()
                ) : (
                  <Search size={18} className="text-muted" />
                )}
              </CInputGroupText>
              <CDropdownToggle
                caret={false}
                className={`
                  form-control text-start font-montserrat d-flex align-items-center justify-content-between input-custom
                  ${errors?.icon ? 'is-invalid' : ''}
                  ${!errors?.icon && formData.icon && validated ? 'is-valid' : ''}
                `}
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
                placeholder="Escribe para filtrar (ej: home, user...)"
                className="mb-3 sticky-top shadow-sm"
                value={searchTerm}
                onChange={handleSearch}
                onClick={(e) => e.stopPropagation()}
              />
              <div
                className="d-flex flex-wrap gap-2 justify-content-center mb-3"
                style={{ minHeight: '150px' }}
              >
                {currentIcons.length > 0 ? (
                  currentIcons.map((iconName) => {
                    const IconComponent = FaIcons[iconName]
                    return (
                      <CButton
                        key={iconName}
                        variant="ghost"
                        className={`p-2 rounded-3 ${formData.icon === iconName ? 'bg-primary text-white' : 'btn-light'}`}
                        title={iconName}
                        onClick={() => setFormData({ ...formData, icon: iconName })}
                      >
                        <IconComponent size={22} />
                      </CButton>
                    )
                  })
                ) : (
                  <div className="text-muted small p-4">No se encontraron iconos.</div>
                )}
              </div>
              {totalPages > 1 && (
                <div
                  className="d-flex align-items-center justify-content-between border-top pt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CButton
                    size="sm"
                    variant="ghost"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    <ChevronsLeft size={16} />
                  </CButton>

                  <span className="text-muted small font-poppins">
                    Pág. <strong>{currentPage}</strong> de {totalPages}
                  </span>

                  <CButton
                    size="sm"
                    variant="ghost"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    <ChevronsRight size={16} />
                  </CButton>
                </div>
              )}
            </CDropdownMenu>
          </CDropdown>
          {errors?.icon && (
            <div className="invalid-feedback d-block">
              {errors.icon.map((error, index) => (
                <div key={index} className="d-flex align-items-center gap-1">
                  <BadgeAlert size={13} />
                  <small className="font-inter">{error}</small>
                </div>
              ))}
            </div>
          )}
          {!errors?.icon && formData.icon && validated && (
            <div className="valid-feedback d-block">
              <div className="d-flex align-items-center gap-1">
                <BadgeCheck size={13} />
                <small className="font-inter">Dato válido</small>
              </div>
            </div>
          )}
        </CCol>
        <CCol md={4}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <Link size={15} />
            URL
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            name="url"
            value={formData.url}
            onChange={(e) => {
              let value = e.target.value
              value = value.replace(/^\/+/, '')
              value = '/' + value
              handleChange({
                target: {
                  name: 'url',
                  value,
                },
              })
            }}
            invalid={!!errors?.url}
            valid={!errors?.url && formData.url !== '' && validated}
            className="font-montserrat custom-input"
          />
          <CFormFeedback invalid>
            {errors?.url?.map((error, index) => (
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
        <CCol md={8}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <CirclePile size={15} />
            Permiso Asociado
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <Select
            name="permission_id"
            placeholder="Seleccione un permiso"
            options={
              Array.isArray(roles)
                ? roles.map((role) => ({
                    label: role.title,
                    options: role.permissions?.map((perm) => ({
                      value: perm.id,
                      label: `${perm.title} (${perm.name})`,
                    })),
                  }))
                : []
            }
            value={
              Array.isArray(roles)
                ? roles
                    .flatMap((role) => role.permissions || [])
                    .map((perm) => ({
                      value: perm.id,
                      label: `${perm.title} (${perm.name})`,
                    }))
                    .find((opt) => opt.value == formData.permission_id)
                : null
            }
            onChange={(selected) =>
              setFormData((prev) => ({
                ...prev,
                permission_id: selected?.value || '',
              }))
            }
            isDisabled={!Array.isArray(roles)}
            isSearchable
            filterOption={customFilterOption}
            className="w-100 font-montserrat"
            classNamePrefix="react-select"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: !!errors?.permission_id
                  ? '#dc3545'
                  : !errors?.permission_id && formData.permission_id !== '' && validated
                    ? '#198754'
                    : '#dbdfe6',
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
          <CFormFeedback invalid className={!!errors?.permission_id ? 'd-block' : 'd-none'}>
            {errors?.permission_id?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback
            valid
            className={
              !errors?.permission_id && formData.permission_id !== '' && validated
                ? 'd-block'
                : 'd-none'
            }
          >
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
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
