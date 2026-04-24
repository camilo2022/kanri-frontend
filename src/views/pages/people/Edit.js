import { useState, useEffect } from 'react'
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
import {
  UserRound,
  Save,
  ArrowLeftCircle,
  BadgeCheck,
  BadgeAlert,
  IdCard,
  VenusAndMars,
  Droplets,
  MapPinHouse,
  Phone,
  Camera,
} from 'lucide-react'
import { Toast } from '../../../components/Toast'
import Swal from 'sweetalert2'
import LoadingForm from '@/components/LoadingForm'

const Edit = ({ person, onChangeView, onSubmit, errors, genders, bloodTypes, loading }) => {
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({
    document: '',
    names: '',
    last_names: '',
    gender_id: '',
    birth_date: '',
    blood_type_id: '',
    address: '',
    phone: '',
    photo: '',
  })

  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (person) {
      setFormData({
        document: person.document || '',
        names: person.names || '',
        last_names: person.last_names || '',
        gender_id: person.gender_id || '',
        birth_date: person.birth_date || '',
        blood_type_id: person.blood_type_id || '',
        address: person.address || '',
        phone: person.phone || '',
        photo: person.photo || '',
      })
      setPreview(person?.photo?.path)
    }
  }, [person])

  const isInvalid = !!errors?.photo
  const isValid = !errors?.photo && validated

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, photo: file, photo_type_id: 1, photo_subtype_id: 8 })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Editar Persona',
      html: `<div style="font-size:14px">
              Se actualizará la información de la persona en el sistema.<br/>
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
          if (person.photo === formData.photo) formData.photo = ''
          const response = await onSubmit(person.id, formData)
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setTimeout(() => {
            setFormData({
              document: '',
              names: '',
              last_names: '',
              gender_id: '',
              birth_date: '',
              blood_type_id: '',
              address: '',
              phone: '',
              photo: '',
            })
            onChangeView({ name: 'list', title: 'Listar Personas' })
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

  const getBirthDateLimits = () => {
    const today = new Date()
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())

    const minDate = new Date(today.getFullYear() - 90, today.getMonth(), today.getDate())

    return {
      max: maxDate.toISOString().split('T')[0],
      min: minDate.toISOString().split('T')[0],
    }
  }

  const limits = getBirthDateLimits()

  if (!(person && Array.isArray(genders) && Array.isArray(bloodTypes))) {
    return (
      <LoadingForm
        title="Cargando formulario"
        subtitle="Un momento mientras se carga la información de la persona..."
        height="400px"
      />
    )
  }

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0 animate-fade-in">
      <div className="d-flex align-items-center mb-4">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Editar Persona</span>
      </div>
      <CForm className="needs-validation" onSubmit={handleSubmit}>
        <div className="row">
          <CCol md={3} className="text-center border-end">
            <div className="avatar-picker-container">
              <div className="d-flex flex-column align-items-center mt-4 mb-4">
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  Foto
                  <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                </CFormLabel>
                <div className="position-relative mb-3" style={{ width: '150px', height: '150px' }}>
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden"
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#f8f9fa',
                      border: isInvalid
                        ? '2px solid #dc3545'
                        : isValid
                          ? '2px solid #198754'
                          : '2px solid #ccc',
                      boxShadow: isInvalid
                        ? '0 0 10px rgba(220, 53, 69, 0.6)'
                        : isValid
                          ? '0 0 10px rgba(25, 135, 84, 0.6)'
                          : 'none',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Camera
                        size={40}
                        className={
                          isInvalid ? 'text-danger' : isValid ? 'text-success' : 'text-muted'
                        }
                      />
                    )}
                  </div>
                  <label
                    htmlFor="photo-upload"
                    className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow-sm"
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Camera size={16} />
                    <input
                      id="photo-upload"
                      type="file"
                      name="photo"
                      hidden
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <small className="text-muted font-inter">Haz clic en el icono para subir</small>
                <CFormFeedback invalid className={isInvalid ? 'd-block' : 'd-none'}>
                  {errors?.photo?.map((error, index) => (
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
          <CCol md={9} className="ps-md-4 ">
            <div className="row g-3 mb-4">
              <CCol md={6} sm={6}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <UserRound size={15} /> Nombres
                  <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="names"
                  value={formData.names}
                  onChange={handleChange}
                  invalid={!!errors?.names}
                  valid={!errors?.names && formData.names !== '' && validated}
                  className="font-montserrat input-custom"
                />
                <CFormFeedback invalid>
                  {errors?.names?.map((error, index) => (
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
              <CCol md={6} sm={6}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <UserRound size={15} /> Apellidos
                  <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="last_names"
                  value={formData.last_names}
                  onChange={handleChange}
                  invalid={!!errors?.last_names}
                  valid={!errors?.last_names && formData.last_names !== '' && validated}
                  className="font-montserrat input-custom"
                />
                <CFormFeedback invalid>
                  {errors?.last_names?.map((error, index) => (
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
              <CCol md={4} sm={6}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <IdCard size={15} /> N° de Documento
                  <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="document"
                  value={formData.document}
                  onChange={handleChange}
                  invalid={!!errors?.document}
                  valid={!errors?.document && formData.document !== '' && validated}
                  className="font-montserrat input-custom"
                />
                <CFormFeedback invalid>
                  {errors?.document?.map((error, index) => (
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

              <CCol md={4} sm={6}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <MapPinHouse size={15} /> Dirección
                  <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  invalid={!!errors?.address}
                  valid={!errors?.address && formData.address !== '' && validated}
                  className="font-montserrat input-custom"
                />
                <CFormFeedback invalid>
                  {errors?.address?.map((error, index) => (
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
              <CCol md={4} sm={6}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <Phone size={15} /> Telefono
                  <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  invalid={!!errors?.phone}
                  valid={!errors?.phone && formData.phone !== '' && validated}
                  className="font-montserrat input-custom"
                />
                <CFormFeedback invalid>
                  {errors?.phone?.map((error, index) => (
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
              <CCol md={4} sm={6}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <UserRound size={15} /> Fecha de Nacimiento
                  <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="date"
                  name="birth_date"
                  min={limits.min}
                  max={limits.max}
                  value={formData.birth_date}
                  onChange={handleChange}
                  invalid={!!errors?.birth_date}
                  valid={!errors?.birth_date && formData.birth_date !== '' && validated}
                  className="font-montserrat input-custom"
                />
                <CFormFeedback invalid>
                  {errors?.birth_date?.map((error, index) => (
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
              <CCol md={4} sm={6}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <Droplets size={15} /> Tipo de Sangre
                  <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                </CFormLabel>
                <CInputGroup>
                  <CFormSelect
                    className="font-montserrat input-custom"
                    name="blood_type_id"
                    value={formData.blood_type_id}
                    onChange={handleChange}
                    disabled={!Array.isArray(bloodTypes)}
                    options={
                      !Array.isArray(bloodTypes)
                        ? [{ label: 'Cargando Tipos de Sangre...', value: '' }]
                        : [
                            { label: 'Seleccione un Tipo de Sangre', value: '' },
                            ...bloodTypes.map((blood_type) => ({
                              label: blood_type.name,
                              value: blood_type.id,
                            })),
                          ]
                    }
                    invalid={!!errors?.blood_type_id}
                    valid={!errors?.blood_type_id && formData.blood_type_id !== '' && validated}
                    style={{ borderRadius: '5px 5px 5px 5px' }}
                  />
                  <CFormFeedback invalid>
                    {errors?.blood_type_id?.map((error, index) => (
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
              <CCol md={4} sm={6}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <VenusAndMars size={15} /> Género
                  <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                </CFormLabel>
                <CInputGroup>
                  <CFormSelect
                    className="font-montserrat input-custom"
                    name="gender_id"
                    value={formData.gender_id}
                    onChange={handleChange}
                    disabled={!Array.isArray(genders)}
                    options={
                      !Array.isArray(genders)
                        ? [{ label: 'Cargando Géneros...', value: '' }]
                        : [
                            { label: 'Seleccione un género', value: '' },
                            ...genders.map((gender) => ({
                              label: gender.description,
                              value: gender.id,
                            })),
                          ]
                    }
                    invalid={!!errors?.gender_id}
                    valid={!errors?.gender_id && formData.gender_id !== '' && validated}
                    style={{ borderRadius: '5px 5px 5px 5px' }}
                  />
                  <CFormFeedback invalid>
                    {errors?.gender_id?.map((error, index) => (
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
            </div>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-6">
              <CButton
                className="d-flex align-items-center gap-2 font-poppins  btn-primary-revolve me-2"
                onClick={() => {
                  onChangeView({ name: 'list', title: 'Listar Personas' })
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
          </CCol>
        </div>
      </CForm>
    </CCard>
  )
}

export default Edit
