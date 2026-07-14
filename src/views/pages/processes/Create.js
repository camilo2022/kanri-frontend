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
} from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import {
  Save,
  ArrowLeftCircle,
  BadgeCheck,
  BadgeAlert,
  TextInitial,
  ListTree,
  Workflow,
  FileCheckCorner,
} from 'lucide-react'
import { Toast } from '@/components/Toast'
import Swal from 'sweetalert2'
import Select from 'react-select'

const Create = ({ onChangeView, onSubmit, errors, processes }) => {
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subprocesses: false,
    in_technical_sheet: false,
    after_processes: [],
  })

  const isInvalid = Object.keys(errors).some((key) => key.startsWith('after_processes'))
  const isValid =
    !Object.keys(errors).some((key) => key.startsWith('after_processes')) &&
    formData.after_processes.length > 0 &&
    validated

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Crear Proceso',
      html: `<div style="font-size:14px">
              Se guardará la información del proceso en el sistema.<br/>
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
            after_processes: formData.after_processes.map((p) => p.value),
            settings: {
              subprocesses: formData.subprocesses,
              in_technical_sheet: formData.in_technical_sheet,
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
              subprocesses: false,
              in_technical_sheet: false,
              after_processes: [],
            })
            onChangeView({ name: 'list', title: 'Listar Procesos' })
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

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0 animate-fade-in">
      <div className="d-flex align-items-center mb-3">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Crear Proceso</span>
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
            className="font-montserrat"
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
            <FileCheckCorner size={15} /> ¿Pertenece a la ficha técnica?
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
                <span className="font-montserrat">
                  Selecciona si el proceso pertenece a la ficha tecnica
                </span>
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
            <Workflow size={15} /> ¿Tiene Subprocesos?
          </CFormLabel>
          <div
            className="px-2 border rounded-3 d-flex align-items-center bg-white"
            style={{
              minHeight: '40px',
              borderColor: '#dbdfea',
            }}
          >
            <CFormCheck
              name="subprocesses"
              label={<span className="font-montserrat">Selecciona si tiene subprocesos</span>}
              checked={formData.subprocesses}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  subprocesses: e.target.checked,
                }))
              }}
              valid={formData.subprocesses && validated}
            />
          </div>
          <CFormFeedback valid>
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </CCol>
        <CCol md={12}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <ListTree size={15} /> Siguientes Procesos
          </CFormLabel>
          <Select
            isMulti
            name="after_processes"
            value={formData.after_processes}
            onChange={(selectedOptions) => {
              setFormData({
                ...formData,
                after_processes: selectedOptions,
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
            className="d-flex align-items-center gap-2 font-poppins  btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Procesos' })
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
