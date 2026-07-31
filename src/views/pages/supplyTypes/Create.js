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
  CFormSelect,
  CInputGroup,
} from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
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

const Create = ({ onChangeView, onSubmit, errors }) => {
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    has_variants: true,
    in_technical_sheet: true,
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Crear Tipo de Insumo',
      html: `<div style="font-size:14px">
              Se guardará la información del tipo de insumo en el sistema.<br/>
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
          const inf = {
            name: formData.name,
            description: formData.description,
            settings: {
              has_variants: formData.has_variants,
              in_technical_sheet: formData.in_technical_sheet,
              in_production_order: formData.in_production_order,
              paragraph: formData.paragraph,
              form: [
                {
                  id: 1,
                  path: 'settings.code',
                  type: 'selectdinamic',
                  field: 'supplier_id',
                  label: 'PROVEEDOR',
                  model: 'App\\Models\\Supplier',
                  rules: ['required', 'exists:subitems,id,item_id,App\\Models\\Supplier::ITEM_ID'],
                  option: 'name',
                  cardinality: 'single',
                },
              ],
            },
          }
          const response = await onSubmit(inf)
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setTimeout(() => {
            setFormData({
              name: '',
              description: '',
              has_variants: true,
              in_technical_sheet: false,
            })
            onChangeView({ name: 'list', title: 'Listar Tipos de Insumo' })
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

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0 animate-fade-in">
      <div className="d-flex align-items-center mb-3">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Crear Tipo de Insumo</span>
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
            <ListChecks size={15} /> ¿Tiene variantes?
          </CFormLabel>
          <div
            className="px-2 border rounded-3 d-flex align-items-center bg-white"
            style={{
              minHeight: '40px',
              borderColor: '#dbdfea',
            }}
          >
            <CFormCheck
              id="has_variants"
              name="has_variants"
              checked={formData.has_variants}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  has_variants: e.target.checked,
                }))
              }}
              label={
                <label
                  htmlFor="has_variants"
                  className="font-montserrat cursor-pointer"
                  style={{ marginBottom: 0 }}
                >
                  Selecciona si el tipo de insumo tendrá variantes
                </label>
              }
              valid={formData.has_variants && validated}
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
            <ListChecks size={15} /> ¿Pertenece a la ficha técnica?
          </CFormLabel>
          <div
            className="px-2 border rounded-3 d-flex align-items-center bg-white"
            style={{
              minHeight: '40px',
              borderColor: '#dbdfea',
            }}
          >
            <CFormCheck
              name="in_technical_sheet"
              label={
                <span className="font-montserrat">Selecciona si pertenece a la ficha tecnica</span>
              }
              checked={formData.in_technical_sheet}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  in_technical_sheet: e.target.checked,
                }))
              }}
              valid={formData.in_technical_sheet && validated}
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
                { label: 'TELA', value: 'fabric' },
                { label: 'ROLLO', value: 'roll' },
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
            className="d-flex align-items-center gap-2 font-poppins btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Tipos de Insumo' })
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
