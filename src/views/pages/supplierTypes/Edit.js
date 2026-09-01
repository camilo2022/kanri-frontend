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
import Select from 'react-select'
import LoadingForm from '@/components/LoadingForm'

const Edit = ({ supplier_type, onChangeView, onSubmit, errors }) => {
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    if (supplier_type) {
      setFormData({
        name: supplier_type.name || '',
        description: supplier_type.description || '',
        has_person: supplier_type.settings.has_person || false,
        has_account_bank: supplier_type.settings.has_account_bank || false,
        in_production_order: supplier_type.settings.in_production_order || false,
        paragraph: supplier_type.settings.paragraph || false,
      })
    }
  }, [supplier_type])

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Editar Tipo de Proveedor',
      html: `<div style="font-size:14px">
              Se guardará la nueva información del tipo de proveedor en el sistema.<br/>
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
              has_person: formData.has_person,
              has_account_bank: formData.has_account_bank,
              in_production_order: formData.in_production_order,
              paragraph: formData.paragraph,
            },
          }
          const response = await onSubmit(supplier_type.id, inf)
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setTimeout(() => {
            setFormData({})
            onChangeView({ name: 'list', title: 'Listar Tipos de Proveedores' })
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

  if (!supplier_type) {
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
        <span className="fw-bold fs-5 font-montserrat">Editar Tipo de Proveedor</span>
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
            <FileCheckCorner size={15} /> ¿Solicita datos de persona?
          </CFormLabel>
          <div
            className="px-2 border rounded-3 d-flex align-items-center bg-white"
            style={{
              minHeight: '40px',
              borderColor: '#dbdfea',
            }}
          >
            <CFormCheck
              name="has_person"
              label={
                <span className="font-montserrat">
                  Selecciona si al crear un proveedor se le debe solicitar datos de persona
                </span>
              }
              checked={formData.has_person}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  has_person: e.target.checked,
                }))
              }}
              valid={formData.has_person && validated}
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
            <FileCheckCorner size={15} /> ¿Solicita datos de cuenta bancaria?
          </CFormLabel>
          <div
            className="px-2 border rounded-3 d-flex align-items-center bg-white"
            style={{
              minHeight: '40px',
              borderColor: '#dbdfea',
            }}
          >
            <CFormCheck
              name="has_account_bank"
              label={
                <span className="font-montserrat">
                  Selecciona si al crear un proveedor se le debe solicitar datos de cuenta bancaria
                </span>
              }
              checked={formData.has_account_bank}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  has_account_bank: e.target.checked,
                }))
              }}
              valid={formData.has_account_bank && validated}
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
              checked={formData.in_production_order}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  in_production_order: e.target.checked,
                  paragraph: '',
                }))
              }}
              valid={formData.in_production_order && validated}
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
              value={formData.paragraph}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  paragraph: e.target.value,
                }))
              }}
              disabled={!formData.in_production_order}
              options={[
                { label: 'Seleccione una opción', value: '' },
                { label: 'LUGAR DE PRODUCCION', value: 'production' },
              ]}
              invalid={!!errors?.paragraph}
              valid={!errors?.paragraph && formData.paragraph !== '' && validated}
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
            onClick={() => onChangeView({ name: 'list', title: 'Listar Tipos de Proveedores' })}
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
