import { useState } from 'react'
import { CCard, CFormInput, CCol, CButton, CForm, CFormFeedback, CFormLabel } from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import { useEffect } from 'react'
import { Save, ArrowLeftCircle, BadgeCheck, BadgeAlert, TextInitial } from 'lucide-react'
import { Toast } from '@/components/Toast'
import Swal from 'sweetalert2'
import Select from 'react-select'
import LoadingForm from '@/components/LoadingForm'

const Edit = ({ trademark, onChangeView, onSubmit, errors, groups }) => {
  const [previews, setPreviews] = useState({ logo: null, cover: null })
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (trademark) {
      setFormData({
        group_id: trademark.group[0]?.id || '',
        name: trademark.name || '',
        description: trademark.description || '',
        logo: trademark.logo || '',
        cover: trademark.cover || '',
      })
      setPreviews({ logo: trademark?.logo?.path, cover: trademark?.cover?.path })
    }
  }, [trademark])

  const isInvalid = !!errors?.group_id
  const isValid = !errors?.group_id && formData.group_id !== '' && validated

  const isInvalidLogo = !!errors?.logo
  const isValidLogo = !errors?.logo && formData.logo !== '' && validated

  const isInvalidCover = !!errors?.cover
  const isValidCover = !errors?.cover && formData.cover !== '' && validated

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      setFormData((prev) => ({ ...prev, [name]: file }))
      setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Editar Marca',
      html: `<div style="font-size:14px">
              Se guardará la nueva información de la marca en el sistema.<br/>
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
          const response = await onSubmit(trademark.id, formData)
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setTimeout(() => {
            setFormData({
              name: '',
              description: '',
            })
            onChangeView({ name: 'list', title: 'Listar Marcas' })
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

  const customFilterOption = (option, rawInput) => {
    const words = rawInput.toLowerCase().split(' ')
    const label = option.label.toLowerCase()
    return words.every((word) => label.includes(word))
  }

  if (!(trademark && Array.isArray(groups))) {
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
      <div className="d-flex align-items-center">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Editar Marca</span>
      </div>
      <CForm className="row g-3 needs-validation p-4" onSubmit={handleSubmit}>
        <div className="row g-4">
          <CCol md={8} lg={6} className="px-5">
            <CFormLabel className="d-flex gap-2 font-inter align-items-center">
              <TextInitial size={15} /> Portada del Catálogo
            </CFormLabel>
            <div
              className="position-relative rounded-3 d-flex align-items-center justify-content-center bg-light overflow-hidden shadow-sm shadow-hover"
              style={{
                height: '320px',
                backgroundColor: '#f8f9fa',
                border: isInvalidCover
                  ? '0.5px solid #dc3545'
                  : isValidCover
                    ? '0.5px solid #198754'
                    : '0.5px solid #ccc',
                boxShadow: isInvalidCover
                  ? '0 0 10px rgba(220, 53, 69, 0.6)'
                  : isValidCover
                    ? '0 0 10px rgba(25, 135, 84, 0.6)'
                    : 'none',
              }}
            >
              {previews.cover ? (
                <img
                  src={previews.cover}
                  className="w-100 h-100 object-fit-contain p-1"
                  alt="Cover"
                />
              ) : (
                <div className="text-center p-3">
                  <div className="bg-white rounded-circle shadow-sm d-inline-flex p-3 mb-2">
                    <Save size={24} className="text-primary" />
                  </div>
                  <p className="small mb-0 font-montserrat fw-medium">Subir Portada</p>
                  <small className="text-muted" style={{ fontSize: '10px' }}>
                    Recomendado: 800x1200px
                  </small>
                </div>
              )}
              <input
                type="file"
                name="cover"
                onChange={(e) => {
                  const file = e.target.files[0]
                  setFormData((prev) => ({
                    ...prev,
                    cover: {
                      file,
                      photo_type_id: 2,
                      photo_subtype_id: 10,
                    },
                  }))

                  setPreviews((prev) => ({
                    ...prev,
                    cover: URL.createObjectURL(file),
                  }))
                }}
                className="position-absolute w-100 h-100 opacity-0 cursor-pointer"
                accept=".jpg,.jpeg,.png"
              />
            </div>
            <CFormFeedback invalid className={isInvalidCover ? 'd-block' : 'd-none'}>
              {errors?.cover?.map((error, index) => (
                <div key={index} className="d-flex align-items-center gap-1">
                  <BadgeAlert size={13} />
                  <small className="font-inter">{error}</small>
                </div>
              ))}
            </CFormFeedback>
            <CFormFeedback valid className={isValidCover ? 'd-block' : 'd-none'}>
              <div className="d-flex align-items-center gap-1">
                <BadgeCheck size={13} />
                <small className="font-inter">Dato Válido</small>
              </div>
            </CFormFeedback>
          </CCol>
          <CCol md={4} lg={6} className="px-5">
            <div className="d-flex flex-column gap-3">
              <div>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div
                    className="position-relative rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm overflow-hidden"
                    style={{
                      width: '80px',
                      height: '80px',
                      flexShrink: 0,
                      border: isInvalidLogo
                        ? '0.5px solid #dc3545'
                        : isValidLogo
                          ? '0.5px solid #198754'
                          : '0.5px solid #ccc',
                      boxShadow: isInvalidLogo
                        ? '0 0 10px rgba(220, 53, 69, 0.6)'
                        : isValidLogo
                          ? '0 0 10px rgba(25, 135, 84, 0.6)'
                          : 'none',
                    }}
                  >
                    {previews.logo ? (
                      <img
                        src={previews.logo}
                        className="w-100 h-100 object-fit-contain p-1"
                        alt="Logo"
                      />
                    ) : (
                      <BadgeCheck size={20} className="text-muted" />
                    )}
                    <input
                      type="file"
                      name="logo"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        setFormData((prev) => ({
                          ...prev,
                          logo: {
                            file,
                            photo_type_id: 2,
                            photo_subtype_id: 9,
                          },
                        }))

                        setPreviews((prev) => ({
                          ...prev,
                          logo: URL.createObjectURL(file),
                        }))
                      }}
                      className="position-absolute w-100 h-100 opacity-0 cursor-pointer"
                      accept="image/*"
                    />
                  </div>
                  <div>
                    <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                      <TextInitial size={15} /> Logo de la Marca
                      <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                    </CFormLabel>
                    <small className="text-muted font-inter">
                      Click sobre el círculo para subir
                    </small>
                  </div>
                </div>
                <CFormFeedback invalid className={isInvalidLogo ? 'd-block' : 'd-none'}>
                  {errors?.logo?.map((error, index) => (
                    <div key={index} className="d-flex align-items-center gap-1">
                      <BadgeAlert size={13} />
                      <small className="font-inter">{error}</small>
                    </div>
                  ))}
                </CFormFeedback>
                <CFormFeedback valid className={isValidLogo ? 'd-block' : 'd-none'}>
                  <div className="d-flex align-items-center gap-1">
                    <BadgeCheck size={13} />
                    <small className="font-inter">Dato Válido</small>
                  </div>
                </CFormFeedback>
              </div>
              <div className="w-100">
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
              </div>
              <div className="w-100">
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
                  className="font-montserrat input-custom"
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
              </div>
              <div className="w-100">
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <TextInitial size={15} /> Grupo
                  <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                </CFormLabel>
                <Select
                  name="group_id"
                  value={
                    Array.isArray(groups)
                      ? (groups
                          ?.map((group) => ({
                            value: group.id,
                            label: group.name,
                          }))
                          .find((opt) => opt.value === formData.group_id) ?? null)
                      : null
                  }
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      ['group_id']: selected?.value,
                    }))
                  }
                  invalid={!!errors?.group_id}
                  valid={!errors?.group_id && formData.group_id !== '' && validated}
                  options={
                    Array.isArray(groups)
                      ? groups.map((group) => ({
                          value: group.id,
                          label: group.name,
                        }))
                      : []
                  }
                  isDisabled={!Array.isArray(groups)}
                  isSearchable
                  filterOption={customFilterOption}
                  className="w-100 font-montserrat"
                  placeholder={'Seleccione una categoría'}
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
                  {errors?.group_id?.map((error, index) => (
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
              </div>
            </div>
          </CCol>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-5">
          <CButton
            className="d-flex align-items-center gap-2 font-poppins  btn-primary-revolve me-2"
            onClick={() => onChangeView({ name: 'list', title: 'Listar Marcas' })}
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
