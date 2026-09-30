import { useState } from 'react'
import { CCard, CFormInput, CCol, CButton, CForm, CFormFeedback, CFormLabel } from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import { useEffect } from 'react'
import { Save, ArrowLeftCircle, BadgeCheck, BadgeAlert, TextInitial, ListTree } from 'lucide-react'
import { Toast } from '@/components/Toast'
import Swal from 'sweetalert2'
import LoadingForm from '@/components/LoadingForm'
import Select from 'react-select'

const Edit = ({ typology, onChangeView, onSubmit, errors, processes }) => {
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (typology) {
      setFormData({
        name: typology.name || '',
        description: typology.description || '',
        processes: typology.processes.map((p) => ({ value: p.id, label: p.name })),
        code: typology.settings.code || '',
      })
    }
  }, [typology])

  const isInvalid = Object.keys(errors).some((key) => key.startsWith('processes'))
  const isValid =
    !Object.keys(errors).some((key) => key.startsWith('processes')) &&
    formData?.processes?.length > 0 &&
    validated

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Editar Tipología',
      html: `<div style="font-size:14px">
              Se guardará la nueva información la tipología en el sistema.<br/>
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
          const response = await onSubmit(typology.id, {
            name: formData.name,
            description: formData.description,
            processes: formData.processes.map((p) => p.value),
            settings: {
              code: formData.code,
            },
          })
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setTimeout(() => {
            onChangeView({ name: 'list', title: 'Listar Tipologías' })
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

  if (!typology) {
    return (
      <LoadingForm
        title="Cargando formulario"
        subtitle="Un momento mientras se carga la información..."
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
        <span className="fw-bold fs-5 font-montserrat">Editar Tipología</span>
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
        <CCol md={4}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <TextInitial size={15} /> Código
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            invalid={!!errors['settings.code']}
            valid={!errors['settings.code'] && formData.code !== '' && validated}
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
        <CCol md={12}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <ListTree size={15} /> Procesos Asociados
          </CFormLabel>
          <Select
            isMulti
            name="processes"
            value={formData.processes}
            onChange={(selectedOptions) => {
              setFormData({
                ...formData,
                processes: selectedOptions,
              })
            }}
            options={processes.map((p) => ({ value: p.id, label: p.name }))}
            isDisabled={!processes}
            isSearchable
            filterOption={customFilterOption}
            className="font-montserrat"
            placeholder="Selecciona uno o varios..."
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: isInvalid ? '#dc3545' : isValid ? '#198754' : '#dbdfe6',
                boxShadow: 'none',
                borderRadius: '0.375rem',
                minHeight: '38px',
                maxHeight: '38px',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: '#1857b6',
                  boxShadow: '0 0 0 0.2rem rgba(13, 110, 253, 0.25)',
                },
              }),
              valueContainer: (base) => ({
                ...base,
                flexWrap: 'nowrap',
                overflowX: 'auto',
              }),
              multiValue: (base) => ({
                ...base,
                minWidth: 'max-content',
              }),
              multiValueLabel: (base) => ({
                ...base,
                whiteSpace: 'nowrap',
              }),
              input: (base) => ({
                ...base,
                margin: 0,
              }),
              indicatorsContainer: (base) => ({
                ...base,
                height: '38px',
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
              }),
            }}
          />
          <CFormFeedback invalid className={isInvalid ? 'd-block' : 'd-none'}>
            {Object.keys(errors)
              .filter((key) => key.startsWith('after_processes'))
              .map((e) => (
                <div className="d-flex align-items-center gap-1">
                  <BadgeAlert size={13} />
                  <small className="font-inter">
                    Elemento {+e.split('.')[1] + 1}. {errors[e]}
                  </small>
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
        <div className="d-flex justify-content-between align-items-center mt-5">
          <CButton
            className="d-flex align-items-center gap-2 font-poppins btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Tipologías' })
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

export default Edit
