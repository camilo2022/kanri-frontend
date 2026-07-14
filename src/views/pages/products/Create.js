import { useEffect, useState } from 'react'
import { CCard, CFormInput, CCol, CButton, CForm, CFormFeedback, CFormLabel } from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import { Save, ArrowLeftCircle, BadgeCheck, BadgeAlert, TextInitial } from 'lucide-react'
import { Toast } from '@/components/Toast'
import Swal from 'sweetalert2'
import Select from 'react-select'
import LoadingForm from '@/components/LoadingForm'

const Create = ({
  trademarks,
  categories,
  subcategories,
  onChangeView,
  onSubmit,
  errors,
  fetchSubcategories,
}) => {
  const [categorySelected, setCategorySelected] = useState(null)
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    trademark_id: '',
    subcategory_id: '',
  })

  const isInvalidTrademark = !!errors?.trademark_id
  const isValidTrademark = !errors?.trademark_id && formData.trademark_id !== '' && validated

  const isInvalidCategory = validated && !categorySelected
  const isValidCategory = validated && !!categorySelected

  const isInvalidSubcategory = !!errors?.subcategory_id
  const isValidSubcategory = !errors?.subcategory_id && formData.subcategory_id !== '' && validated

  useEffect(() => {
    if (!categorySelected) return
    fetchSubcategories(categorySelected)
  }, [categorySelected])

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Crear Producto',
      html: `<div style="font-size:14px">
              Se guardará la información del producto en el sistema.<br/>
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
              code: '',
              trademark_id: '',
              subcategory_id: '',
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

  if (!Array.isArray(trademarks) || !Array.isArray(categories)) {
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
        <span className="fw-bold fs-5 font-montserrat">Crear Producto</span>
      </div>
      <CForm className="row g-3 needs-validation p-4" onSubmit={handleSubmit}>
        <CCol md={4}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <TextInitial size={15} /> Referencia
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            invalid={!!errors?.code}
            valid={!errors?.code && formData.code !== '' && validated}
            className="font-montserrat input-custom"
          />
          <CFormFeedback invalid>
            {errors?.code?.map((error, index) => (
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
        </CCol>
        <CCol md={4}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <TextInitial size={15} /> Marca
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <Select
            name="trademark_id"
            value={
              Array.isArray(trademarks)
                ? (trademarks.find((opt) => opt.value === formData.trademark_id) ?? null)
                : null
            }
            onChange={(selected) =>
              setFormData((prev) => ({
                ...prev,
                ['trademark_id']: selected?.value,
              }))
            }
            invalid={!!errors?.trademark_id}
            valid={!errors?.trademark_id && formData.trademark_id !== '' && validated}
            options={trademarks}
            isDisabled={!Array.isArray(trademarks)}
            isSearchable
            filterOption={customFilterOption}
            className="w-100 font-montserrat"
            placeholder={'Seleccione una marca'}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: isInvalidTrademark
                  ? '#dc3545'
                  : isValidTrademark
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
          <CFormFeedback invalid className={isInvalidTrademark ? 'd-block' : 'd-none'}>
            {errors?.trademark_id?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback valid className={isValidTrademark ? 'd-block' : 'd-none'}>
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </CCol>
        <CCol md={4}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <TextInitial size={15} /> Grupo
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            name="group"
            value={trademarks.find((trademark) => trademark.value === formData.trademark_id)?.group}
            disabled
            className="font-montserrat custom-input"
            invalid={!!errors?.trademark_id}
            valid={!errors?.trademark_id && formData.trademark_id !== '' && validated}
          />
          <CFormFeedback invalid>
            {errors?.trademark_id?.map((error, index) => (
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
        </CCol>
        <CCol md={6}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <TextInitial size={15} /> Categoria
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <Select
            name="category"
            value={
              Array.isArray(categories)
                ? (categories.find((opt) => opt.value === categorySelected) ?? null)
                : null
            }
            onChange={(selected) => setCategorySelected(selected?.value)}
            invalid={isInvalidCategory}
            valid={isValidCategory}
            options={categories}
            isDisabled={!Array.isArray(categories)}
            isSearchable
            filterOption={customFilterOption}
            className="w-100 font-montserrat"
            placeholder={'Seleccione una categoría'}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: isInvalidCategory
                  ? '#dc3545'
                  : isValidCategory
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
          <CFormFeedback invalid className={isInvalidCategory ? 'd-block' : 'd-none'}>
            {errors?.subcategory_id?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback valid className={isValidCategory ? 'd-block' : 'd-none'}>
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </CCol>
        <CCol md={6}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <TextInitial size={15} /> Subcategoría
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <Select
            name="subcategory_id"
            value={
              Array.isArray(subcategories)
                ? (subcategories.find((opt) => opt.value === formData.subcategory_id) ?? null)
                : null
            }
            onChange={(selected) =>
              setFormData((prev) => ({
                ...prev,
                ['subcategory_id']: selected?.value,
              }))
            }
            invalid={!!errors?.subcategory_id}
            valid={!errors?.subcategory_id && formData.subcategory_id !== '' && validated}
            options={subcategories}
            isDisabled={!Array.isArray(subcategories)}
            isSearchable
            filterOption={customFilterOption}
            className="w-100 font-montserrat"
            placeholder={'Seleccione una subcategoría'}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: isInvalidTrademark
                  ? '#dc3545'
                  : isValidTrademark
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
          <CFormFeedback invalid className={isInvalidSubcategory ? 'd-block' : 'd-none'}>
            {errors?.subcategory_id?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback valid className={isValidSubcategory ? 'd-block' : 'd-none'}>
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </CCol>
        <div className="d-flex justify-content-between align-items-center mt-5">
          <CButton
            className="d-flex align-items-center gap-2 font-poppins  btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Productos' })
            }}
          >
            <ArrowLeftCircle size={16} /> Volver
          </CButton>
          <CButton
            className="d-flex align-items-center gap-2 font-poppins btn-primary-add"
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
