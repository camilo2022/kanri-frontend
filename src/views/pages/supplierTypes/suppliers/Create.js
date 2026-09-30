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
import {
  Save,
  ArrowLeftCircle,
  BadgeCheck,
  BadgeAlert,
  TextInitial,
  User,
  UserRound,
  IdCard,
  VenusAndMars,
  Droplets,
  MapPinHouse,
  Phone,
  Landmark,
  WalletCards,
  Upload,
  Banknote,
} from 'lucide-react'
import { Toast } from '@/components/Toast'
import Swal from 'sweetalert2'
import Select from 'react-select'
import LoadingForm from '@/components/LoadingForm'

const Create = ({
  supplier_type,
  onChangeView,
  onSubmit,
  errors,
  genders,
  blood_types,
  person_types,
  banks,
  account_types,
  fecthDocumentTypes,
  document_types,
}) => {
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({
    supplier_type_id: supplier_type.id,
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Crear Proveedor',
      html: `<div style="font-size:14px">
              Se guardará la información del proveedor en el sistema.<br/>
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
          const response = await onSubmit({
            ...formData,
          })
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setTimeout(() => {
            setFormData({
              name: '',
              description: '',
              supplier_type_id: supplier_type.id,
              person: {},
              bank_account: {},
            })
            onChangeView({ name: 'list', title: 'Listar Proveedores' })
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

  const handleChange = (e, index) => {
    const { name, value } = e.target

    if (!index) {
      setFormData((prev) => ({
        ...prev,
        [name]: value.toUpperCase(),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          [name]: value.toUpperCase(),
        },
      }))
    }
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

  const hasDataPerson = supplier_type?.settings?.has_person
  const hasDataBank = supplier_type?.settings?.has_account_bank

  const loadingPersonData =
    hasDataPerson &&
    (!Array.isArray(blood_types) || !Array.isArray(genders) || !Array.isArray(person_types))

  const loadingBankData = hasDataBank && (!Array.isArray(banks) || !Array.isArray(account_types))

  if (loadingPersonData || loadingBankData) {
    return (
      <LoadingForm
        title="Cargando formulario"
        subtitle="Un momento mientras se carga la información..."
        height="400px"
      />
    )
  }

  const loadDocumentTypes = async (id) => {
    if (document_types) return
    try {
      await fecthDocumentTypes(id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0 animate-fade-in">
      <div className="d-flex align-items-center mb-3">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Crear Proveedor</span>
      </div>
      <CForm className="row g-3 needs-validation p-4" onSubmit={handleSubmit}>
        <CCol md={4}>
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
        </CCol>
        <CCol md={4}>
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
        </CCol>
        <CCol md={4}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <TextInitial size={15} /> Código
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            name="code"
            value={formData.settings?.code}
            onChange={(e) => handleChange(e, 'settings')}
            invalid={!!errors['settings.code']}
            valid={!errors['settings.code'] && formData.settings?.code !== '' && validated}
            className="font-montserrat custom-input"
          />
          <CFormFeedback invalid>
            {errors['settings.code']?.map((error, index) => (
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
        {supplier_type.settings.has_person && (
          <CCol md={12} className="mb-2 mt-4">
            <div
              className="position-relative p-3 border rounded-3"
              style={{ borderColor: '#e2e8f0' }}
            >
              <div
                className="position-absolute bg-white px-2 d-flex align-items-center gap-2 fw-bold font-montserrat"
                style={{
                  top: '-10px',
                  left: '15px',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  color: '#0934a8',
                }}
              >
                <User size={15} strokeWidth={2.5} />
                DATOS PERSONALES
              </div>
              <div className="row g-3">
                <CCol md={4} sm={6}>
                  <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                    <UserRound size={15} /> Nombres
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="names"
                    value={formData.person?.names}
                    onChange={(e) => handleChange(e, 'person')}
                    invalid={!!errors?.['person.names']}
                    valid={!errors?.['person.names'] && formData.person?.names !== '' && validated}
                    className="font-montserrat input-custom"
                  />
                  <CFormFeedback invalid>
                    {errors?.['person.names']?.map((error, index) => (
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
                    <UserRound size={15} /> Apellidos
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="last_names"
                    value={formData.person?.last_names}
                    onChange={(e) => handleChange(e, 'person')}
                    invalid={!!errors?.['person.last_names']}
                    valid={
                      !errors?.['person.last_names'] &&
                      formData.person?.last_names !== '' &&
                      validated
                    }
                    className="font-montserrat input-custom"
                  />
                  <CFormFeedback invalid>
                    {errors?.['person.last_names']?.map((error, index) => (
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
                    <UserRound size={15} /> Tipo de Persona
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CInputGroup>
                    <CFormSelect
                      className="font-montserrat input-custom"
                      name="person_type_id"
                      value={formData.person?.person_type_id}
                      onChange={(e) => {
                        handleChange(e, 'person')
                        loadDocumentTypes(e.target.value)
                      }}
                      disabled={!Array.isArray(person_types)}
                      options={
                        !Array.isArray(person_types)
                          ? [{ label: 'Cargando Tipos de Persona...', value: '' }]
                          : [
                              { label: 'Seleccione un Tipo de Persona', value: '' },
                              ...person_types.map((person_type) => ({
                                label: person_type.name,
                                value: person_type.id,
                              })),
                            ]
                      }
                      invalid={!!errors?.['person.document_type_id']}
                      valid={
                        !errors?.['person.document_type_id'] &&
                        formData.person?.person_type_id !== '' &&
                        validated
                      }
                      style={{ borderRadius: '5px 5px 5px 5px' }}
                    />
                    <CFormFeedback invalid>
                      {errors?.['person.document_type_id']?.map((error, index) => (
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
                    <IdCard size={15} /> T. de Documento
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CInputGroup>
                    <CFormSelect
                      className="font-montserrat input-custom"
                      name="document_type_id"
                      value={formData.person?.document_type_id}
                      onChange={(e) => handleChange(e, 'person')}
                      disabled={!Array.isArray(document_types)}
                      options={
                        !Array.isArray(document_types)
                          ? [{ label: 'Cargando Tipos de Documentos...', value: '' }]
                          : [
                              { label: 'Seleccione un Tipo de Persona', value: '' },
                              ...document_types.map((document_type) => ({
                                label: document_type.name,
                                value: document_type.id,
                              })),
                            ]
                      }
                      invalid={!!errors?.['person.document_type_id']}
                      valid={
                        !errors?.['person.document_type_id'] &&
                        formData.person?.document_type_id !== '' &&
                        validated
                      }
                      style={{ borderRadius: '5px 5px 5px 5px' }}
                    />
                    <CFormFeedback invalid>
                      {errors?.['person.document_type_id']?.map((error, index) => (
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
                    <IdCard size={15} /> N° de Documento
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="document"
                    value={formData.person?.document}
                    onChange={(e) => handleChange(e, 'person')}
                    invalid={!!errors?.['person.document']}
                    valid={
                      !errors?.['person.document'] && formData.person?.document !== '' && validated
                    }
                    className="font-montserrat input-custom"
                  />
                  <CFormFeedback invalid>
                    {errors?.['person.document']?.map((error, index) => (
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
                    value={formData.person?.address}
                    onChange={(e) => handleChange(e, 'person')}
                    invalid={!!errors?.['person.address']}
                    valid={
                      !errors?.['person.address'] && formData.person?.address !== '' && validated
                    }
                    className="font-montserrat input-custom"
                  />
                  <CFormFeedback invalid>
                    {errors?.['person.address']?.map((error, index) => (
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
                <CCol md={3} sm={6}>
                  <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                    <Phone size={15} /> Telefono
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="phone"
                    value={formData.person?.phone}
                    onChange={(e) => handleChange(e, 'person')}
                    invalid={!!errors?.['person.phone']}
                    valid={!errors?.['person.phone'] && formData.person?.phone !== '' && validated}
                    className="font-montserrat input-custom"
                  />
                  <CFormFeedback invalid>
                    {errors?.['person.phone']?.map((error, index) => (
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
                <CCol md={3} sm={6}>
                  <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                    <UserRound size={15} /> F. de Nacimiento
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="date"
                    name="birth_date"
                    min={limits.min}
                    max={limits.max}
                    value={formData.person?.birth_date}
                    onChange={(e) => handleChange(e, 'person')}
                    invalid={!!errors?.['person.birth_date']}
                    valid={
                      !errors?.['person.birth_date'] &&
                      formData.person?.birth_date !== '' &&
                      validated
                    }
                    className="font-montserrat input-custom"
                  />
                  <CFormFeedback invalid>
                    {errors?.['person.birth_date']?.map((error, index) => (
                      <div key={index} className="invalid-feedback d-flex align-items-start gap-1">
                        <BadgeAlert size={13} className="flex-shrink-0" />
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
                </CCol>
                <CCol md={3} sm={6}>
                  <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                    <Droplets size={15} /> Tipo de Sangre
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CInputGroup>
                    <CFormSelect
                      className="font-montserrat input-custom"
                      name="blood_type_id"
                      value={formData.person?.blood_type_id}
                      onChange={(e) => handleChange(e, 'person')}
                      disabled={!Array.isArray(blood_types)}
                      options={
                        !Array.isArray(blood_types)
                          ? [{ label: 'Cargando Tipos de Sangre...', value: '' }]
                          : [
                              { label: 'Seleccione un Tipo de Sangre', value: '' },
                              ...blood_types.map((blood_type) => ({
                                label: blood_type.name,
                                value: blood_type.id,
                              })),
                            ]
                      }
                      invalid={!!errors?.['person.blood_type_id']}
                      valid={
                        !errors?.['person.blood_type_id'] &&
                        formData.person?.blood_type_id !== '' &&
                        validated
                      }
                      style={{ borderRadius: '5px 5px 5px 5px' }}
                    />
                    <CFormFeedback invalid>
                      {errors?.['person.blood_type_id']?.map((error, index) => (
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
                <CCol md={3} sm={6}>
                  <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                    <VenusAndMars size={15} /> Género
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CInputGroup>
                    <CFormSelect
                      className="font-montserrat input-custom"
                      name="gender_id"
                      value={formData.person?.gender_id}
                      onChange={(e) => handleChange(e, 'person')}
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
                      invalid={!!errors?.['person.gender_id']}
                      valid={
                        !errors?.['person.gender_id'] &&
                        formData.person?.gender_id !== '' &&
                        validated
                      }
                      style={{ borderRadius: '5px 5px 5px 5px' }}
                    />
                    <CFormFeedback invalid>
                      {errors?.['person.gender_id']?.map((error, index) => (
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
            </div>
          </CCol>
        )}
        {supplier_type.settings.has_account_bank && (
          <CCol md={12}>
            <div
              className="position-relative p-3 border rounded-3"
              style={{ borderColor: '#e2e8f0' }}
            >
              <div
                className="position-absolute bg-white px-2 d-flex align-items-center gap-2 fw-bold font-montserrat"
                style={{
                  top: '-10px',
                  left: '15px',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  color: '#0934a8',
                }}
              >
                <Landmark size={15} strokeWidth={2.5} />
                DATOS BANCARIOS
              </div>
              <div className="row g-3">
                <CCol md={4} sm={6}>
                  <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                    <WalletCards size={15} /> Banco
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CInputGroup>
                    <CFormSelect
                      className="font-montserrat input-custom"
                      name="bank_id"
                      value={formData.account_bank?.bank_id}
                      onChange={(e) => handleChange(e, 'account_bank')}
                      disabled={!Array.isArray(banks)}
                      options={
                        !Array.isArray(banks)
                          ? [{ label: 'Cargando Bancos...', value: '' }]
                          : [
                              { label: 'Seleccione un banco', value: '' },
                              ...banks.map((bank) => ({
                                label: bank.name,
                                value: bank.id,
                              })),
                            ]
                      }
                      invalid={!!errors?.['account_bank.bank_id']}
                      valid={
                        !errors?.['account_bank.bank_id'] &&
                        formData.account_bank?.bank_id !== '' &&
                        validated
                      }
                      style={{ borderRadius: '5px 5px 5px 5px' }}
                    />
                    <CFormFeedback invalid>
                      {errors?.['account_bank.bank_id']?.map((error, index) => (
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
                    <Banknote size={15} /> Tipo de Cuenta
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CInputGroup>
                    <CFormSelect
                      className="font-montserrat input-custom"
                      name="account_type_id"
                      value={formData.account_bank?.account_type_id}
                      onChange={(e) => handleChange(e, 'account_bank')}
                      disabled={!Array.isArray(account_types)}
                      options={
                        !Array.isArray(account_types)
                          ? [{ label: 'Cargando Tipos de cuenta...', value: '' }]
                          : [
                              { label: 'Seleccione un tipo de cuenta', value: '' },
                              ...account_types.map((account_type) => ({
                                label: account_type.name,
                                value: account_type.id,
                              })),
                            ]
                      }
                      invalid={!!errors?.['account_bank.account_type_id']}
                      valid={
                        !errors?.['account_bank.account_type_id'] &&
                        formData.account_bank?.account_type_id !== '' &&
                        validated
                      }
                      style={{ borderRadius: '5px 5px 5px 5px' }}
                    />
                    <CFormFeedback invalid>
                      {errors?.['account_bank.account_type_id']?.map((error, index) => (
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
                    <Banknote size={15} /> N° de Cuenta
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="account_number"
                    value={formData.account_bank?.account_number}
                    onChange={(e) => handleChange(e, 'account_bank')}
                    invalid={!!errors?.['account_bank.account_number']}
                    valid={
                      !errors?.['account_bank.account_number'] &&
                      formData.account_bank?.account_number !== '' &&
                      validated
                    }
                    className="font-montserrat input-custom"
                  />
                  <CFormFeedback invalid>
                    {errors?.['account_bank.account_number']?.map((error, index) => (
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
                  <div>
                    <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                      <Upload size={15} /> Certificado Bancario
                      <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                    </CFormLabel>
                    <div
                      className="border rounded-3 p-3"
                      style={{
                        borderColor: '#e2e8f0',
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      <CFormInput
                        type="file"
                        name="bank_certificate"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setFormData((prev) => ({
                            ...prev,
                            account_bank: {
                              ...prev.account_bank,
                              bank_certificate: { file, file_subtype_id: 455 },
                            },
                          }))
                        }}
                        invalid={!!errors?.['account_bank.bank_certificate']}
                        valid={
                          !errors?.['account_bank.bank_certificate'] &&
                          formData.account_bank?.bank_certificate &&
                          validated
                        }
                        className="font-montserrat input-custom"
                      />
                      <small className="text-muted font-inter d-block mt-2">
                        Formatos permitidos: PDF.
                      </small>
                      <CFormFeedback invalid>
                        {errors?.['account_bank.bank_certificate']?.map((error, index) => (
                          <div key={index} className="d-flex align-items-center gap-1">
                            <BadgeAlert size={13} />
                            <small className="font-inter">{error}</small>
                          </div>
                        ))}
                      </CFormFeedback>
                      <CFormFeedback valid>
                        <div className="d-flex align-items-center gap-1">
                          <BadgeCheck size={13} />
                          <small className="font-inter">Archivo válido</small>
                        </div>
                      </CFormFeedback>
                    </div>
                  </div>
                </CCol>
              </div>
            </div>
          </CCol>
        )}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <CButton
            className="d-flex align-items-center gap-2 font-poppins  btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Proveedores' })
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
