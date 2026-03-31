import { useState, useEffect } from 'react'
import {
  CCard,
  CFormInput,
  CCol,
  CButton,
  CForm,
  CFormFeedback,
  CFormLabel,
} from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import {
  UserRound,
  Save,
  ArrowLeftCircle,
  BadgeCheck,
  BadgeAlert,
  MapPinHouse,
  Factory,
  Briefcase,
  Hospital,
  BanknoteArrowDown,
  CalendarRange,
} from 'lucide-react'
import { Toast } from '../../../components/Toast'
import Swal from 'sweetalert2'
import Select from 'react-select'

const Create = ({
  onChangeView,
  onSubmit,
  errors,
  allPositions,
  people,
  positions,
  arl,
  eps,
  pension_funds,
  compensation_funds,
  areas,
}) => {
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({
    person_id: '',
    operation_center: '',
    position_id: '',
    arl_id: '',
    eps_id: '',
    pension_fund_id: '',
    compensation_fund_id: '',
    area_id: '',
    start_date: '',
    end_date: '',
  })

  useEffect(() => {
    allPositions({ area_id: formData.area_id })
  }, [formData.area_id])

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Crear Empleado',
      html: `<div style="font-size:14px">
              Se guardará la información del empleado en el sistema.<br/>
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
              person_id: '',
              operation_center: '',
              position_id: '',
              arl_id: '',
              eps_id: '',
              pension_fund_id: '',
              compensation_fund_id: '',
              area_id: '',
              start_date: '',
              end_date: '',
            })
            onChangeView({ name: 'list', title: 'Listar Empleados' })
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

  const customFilterOption = (option, rawInput) => {
    const words = rawInput.toLowerCase().split(' ')
    const label = option.label.toLowerCase()
    return words.every((word) => label.includes(word))
  }

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0">
      <div className="d-flex align-items-center mb-3">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Crear Empleado</span>
      </div>
      <CForm className="row g-3 needs-validation p-4" onSubmit={handleSubmit}>
        <CCol md={6} sm={12}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <UserRound size={15} /> Persona
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <Select
            name="person_id"
            value={
              Array.isArray(people)
                ? (people
                    ?.map((person) => ({
                      value: person.id,
                      label: `${person?.document || ''} | ${person?.names || ''} ${person?.last_names || ''} `,
                    }))
                    .find((opt) => opt.value === formData.person_id) ?? null)
                : null
            }
            onChange={(selected) =>
              handleChange({
                target: {
                  name: 'person_id',
                  value: selected?.value || '',
                },
              })
            }
            options={
              Array.isArray(people)
                ? people.map((person) => ({
                    value: person.id,
                    label: `${person?.document || ''} | ${person?.names || ''} ${person?.last_names || ''}`,
                  }))
                : []
            }
            isDisabled={!Array.isArray(people)}
            isSearchable
            filterOption={customFilterOption}
            className="w-100 font-montserrat"
            classNamePrefix="react-select"
            placeholder={null}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: !!errors?.person_id
                  ? '#dc3545'
                  : !errors?.person_id && formData.person_id !== '' && validated
                    ? '#198754'
                    : '#dbdfe6',
                boxShadow: 'none',
                borderRadius: '0.375rem',
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
                fontFamily: 'sans-serif',
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
          />
          <CFormFeedback invalid className={!!errors?.person_id ? 'd-block' : 'd-none'}>
            {errors?.person_id?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>

          <CFormFeedback
            valid
            className={
              !errors?.person_id && formData.person_id !== '' && validated ? 'd-block' : 'd-none'
            }
          >
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </CCol>
        <CCol md={3} sm={4}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <CalendarRange size={15} /> Fecha Inicio de Contrato
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CFormInput
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            invalid={!!errors?.start_date}
            valid={!errors?.start_date && formData.start_date !== '' && validated}
            className="font-montserrat"
          />
          <CFormFeedback invalid>
            {errors?.start_date?.map((error, index) => (
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
        <CCol md={3} sm={4}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <CalendarRange size={15} /> Fecha Fin de Contrato
          </CFormLabel>
          <CFormInput
            type="date"
            name="end_date"
            disabled={!formData.start_date}
            min={formData.start_date}
            value={formData.end_date}
            onChange={handleChange}
            invalid={!!errors?.end_date}
            valid={!errors?.end_date && formData.end_date !== '' && validated}
            className="font-montserrat"
          />
          <CFormFeedback invalid>
            {errors?.end_date?.map((error, index) => (
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
        <CCol md={5} sm={4}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <MapPinHouse size={15} /> Área
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <Select
            classNamePrefix="react-select"
            name="area_id"
            value={
              Array.isArray(areas)
                ? (areas
                    ?.map((area) => ({
                      value: area.id,
                      label: `${area?.name} `,
                    }))
                    .find((opt) => opt.value === formData.area_id) ?? null)
                : null
            }
            onChange={(selected) =>
              handleChange({
                target: {
                  name: 'area_id',
                  value: selected?.value || '',
                },
              })
            }
            options={
              Array.isArray(areas)
                ? areas.map((area) => ({
                    value: area.id,
                    label: `${area.name}`,
                  }))
                : []
            }
            isDisabled={!Array.isArray(areas)}
            isSearchable
            filterOption={customFilterOption}
            className="w-100 font-montserrat"
            placeholder={null}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                borderColor:
                  formData.area_id === '' && errors.position_id
                    ? '#dc3545'
                    : formData.area_id !== '' && validated
                      ? '#198754'
                      : '#dbdfe6',
                boxShadow: 'none',
                borderRadius: '0.375rem',
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
                fontFamily: 'sans-serif',
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
          />
          <CFormFeedback
            invalid
            className={formData.area_id === '' && errors.position_id ? 'd-block' : 'd-none'}
          >
            <div className="d-flex align-items-center gap-1">
              <BadgeAlert size={13} />
              <small className="font-inter">Es obligatorio</small>
            </div>
          </CFormFeedback>
          <CFormFeedback
            valid
            className={formData.area_id !== '' && validated ? 'd-block' : 'd-none'}
          >
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </CCol>
        <CCol md={7} sm={4}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <Briefcase size={15} /> Cargo
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <Select
            classNamePrefix="react-select"
            name="position_id"
            value={
              Array.isArray(positions)
                ? (positions
                    ?.map((position) => ({
                      value: position.id,
                      label: `${position?.name} `,
                    }))
                    .find((opt) => opt.value === formData.position_id) ?? null)
                : null
            }
            onChange={(selected) =>
              handleChange({
                target: {
                  name: 'position_id',
                  value: selected?.value || '',
                },
              })
            }
            options={
              Array.isArray(positions)
                ? positions.map((position) => ({
                    value: position.id,
                    label: `${position?.name} `,
                  }))
                : []
            }
            isDisabled={!Array.isArray(positions) || formData.area_id === ''}
            isSearchable
            filterOption={customFilterOption}
            className="w-100 font-montserrat"
            placeholder={null}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: !!errors?.position_id
                  ? '#dc3545'
                  : !errors?.position_id && formData.position_id !== '' && validated
                    ? '#198754'
                    : '#dbdfe6',
                boxShadow: 'none',
                borderRadius: '0.375rem',
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
                fontFamily: 'sans-serif',
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
          />
          <CFormFeedback invalid className={!!errors?.position_id ? 'd-block' : 'd-none'}>
            {errors?.position_id?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>

          <CFormFeedback
            valid
            className={
              !errors?.position_id && formData.position_id !== '' && validated
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
        <CCol md={3} sm={4}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <Factory size={15} /> Centro de Operación
          </CFormLabel>
          <CFormInput
            type="text"
            name="operation_center"
            value={formData.operation_center}
            onChange={handleChange}
            invalid={!!errors?.operation_center}
            valid={!errors?.operation_center && formData.operation_center !== '' && validated}
            className="font-montserrat"
          />
          <CFormFeedback invalid>
            {errors?.operation_center?.map((error, index) => (
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
        <CCol md={3} sm={4}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <Hospital size={15} /> Arl
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <Select
            classNamePrefix="react-select"
            name="arl_id"
            value={
              Array.isArray(arl)
                ? (arl
                    ?.map((a) => ({
                      value: a.id,
                      label: `${a?.name} `,
                    }))
                    .find((opt) => opt.value === formData.arl_id) ?? null)
                : null
            }
            onChange={(selected) =>
              handleChange({
                target: {
                  name: 'arl_id',
                  value: selected?.value || '',
                },
              })
            }
            invalid={!!errors?.arl_id}
            valid={!errors?.arl_id && formData.arl_id !== '' && validated}
            options={
              Array.isArray(arl)
                ? arl.map((a) => ({
                    value: a.id,
                    label: `${a.name}`,
                  }))
                : []
            }
            isDisabled={!Array.isArray(arl)}
            isSearchable
            filterOption={customFilterOption}
            className="w-100 font-montserrat"
            placeholder={null}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: !!errors?.arl_id
                  ? '#dc3545'
                  : !errors?.arl_id && formData.arl_id !== '' && validated
                    ? '#198754'
                    : '#dbdfe6',
                boxShadow: 'none',
                borderRadius: '0.375rem',
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
                fontFamily: 'sans-serif',
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
          />
          <CFormFeedback invalid className={!!errors?.arl_id ? 'd-block' : 'd-none'}>
            {errors?.arl_id?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback
            valid
            className={
              !errors?.arl_id && formData.arl_id !== '' && validated ? 'd-block' : 'd-none'
            }
          >
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </CCol>
        <CCol md={6} sm={6}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <Hospital size={15} /> Eps
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <Select
            classNamePrefix="react-select"
            name="eps_id"
            value={
              Array.isArray(eps)
                ? (eps
                    ?.map((e) => ({
                      value: e.id,
                      label: `${e?.name} `,
                    }))
                    .find((opt) => opt.value === formData.eps_id) ?? null)
                : null
            }
            onChange={(selected) =>
              handleChange({
                target: {
                  name: 'eps_id',
                  value: selected?.value || '',
                },
              })
            }
            invalid={!!errors?.eps_id}
            valid={!errors?.eps_id && formData.eps_id !== '' && validated}
            options={
              Array.isArray(eps)
                ? eps.map((e) => ({
                    value: e.id,
                    label: `${e?.name} `,
                  }))
                : []
            }
            isDisabled={!Array.isArray(eps) && formData.eps_id === ''}
            isSearchable
            filterOption={customFilterOption}
            className="w-100 font-montserrat"
            placeholder={null}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: !!errors?.eps_id
                  ? '#dc3545'
                  : !errors?.eps_id && formData.eps_id !== '' && validated
                    ? '#198754'
                    : '#dbdfe6',
                boxShadow: 'none',
                borderRadius: '0.375rem',
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
                fontFamily: 'sans-serif',
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
          />
          <CFormFeedback invalid className={!!errors?.eps_id ? 'd-block' : 'd-none'}>
            {errors?.eps_id?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback
            valid
            className={
              !errors?.eps_id && formData.eps_id !== '' && validated ? 'd-block' : 'd-none'
            }
          >
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </CCol>
        <CCol md={6} sm={6}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <BanknoteArrowDown size={15} /> Fondo de Pensión
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <Select
            classNamePrefix="react-select"
            name="pension_fund_id"
            value={
              Array.isArray(pension_funds)
                ? (pension_funds
                    ?.map((p) => ({
                      value: p.id,
                      label: `${p?.name} `,
                    }))
                    .find((opt) => opt.value === formData.pension_fund_id) ?? null)
                : null
            }
            onChange={(selected) =>
              handleChange({
                target: {
                  name: 'pension_fund_id',
                  value: selected?.value || '',
                },
              })
            }
            invalid={!!errors?.pension_fund_id}
            valid={!errors?.pension_fund_id && formData.pension_fund_id !== '' && validated}
            options={
              Array.isArray(pension_funds)
                ? pension_funds.map((p) => ({
                    value: p.id,
                    label: `${p.name}`,
                  }))
                : []
            }
            isDisabled={!Array.isArray(pension_funds)}
            isSearchable
            filterOption={customFilterOption}
            className="w-100 font-montserrat"
            placeholder={null}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: !!errors?.pension_fund_id
                  ? '#dc3545'
                  : !errors?.pension_fund_id && formData.pension_fund_id !== '' && validated
                    ? '#198754'
                    : '#dbdfe6',
                boxShadow: 'none',
                borderRadius: '0.375rem',
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
                fontFamily: 'sans-serif',
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
          />
          <CFormFeedback invalid className={!!errors?.pension_fund_id ? 'd-block' : 'd-none'}>
            {errors?.pension_fund_id?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback
            valid
            className={
              !errors?.pension_fund_id && formData.pension_fund_id !== '' && validated
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
        <CCol md={6} sm={6}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <BanknoteArrowDown size={15} /> Caja de Compensación
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <Select
            classNamePrefix="react-select"
            name="compensation_fund_id"
            value={
              Array.isArray(compensation_funds)
                ? (compensation_funds
                    ?.map((c) => ({
                      value: c.id,
                      label: `${c?.name} `,
                    }))
                    .find((opt) => opt.value === formData.compensation_fund_id) ?? null)
                : null
            }
            onChange={(selected) =>
              handleChange({
                target: {
                  name: 'compensation_fund_id',
                  value: selected?.value || '',
                },
              })
            }
            invalid={!!errors?.compensation_fund_id}
            valid={
              !errors?.compensation_fund_id && formData.compensation_fund_id !== '' && validated
            }
            options={
              Array.isArray(compensation_funds)
                ? compensation_funds.map((c) => ({
                    value: c.id,
                    label: `${c?.name} `,
                  }))
                : []
            }
            isDisabled={!Array.isArray(compensation_funds) && formData.compensation_fund_id === ''}
            isSearchable
            filterOption={customFilterOption}
            className="w-100 font-montserrat"
            placeholder={null}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: !!errors?.compensation_fund_id
                  ? '#dc3545'
                  : !errors?.compensation_fund_id &&
                      formData.compensation_fund_id !== '' &&
                      validated
                    ? '#198754'
                    : '#dbdfe6',
                boxShadow: 'none',
                borderRadius: '0.375rem',
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
                fontFamily: 'sans-serif',
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
          />
          <CFormFeedback invalid className={!!errors?.compensation_fund_id ? 'd-block' : 'd-none'}>
            {errors?.compensation_fund_id?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback
            valid
            className={
              !errors?.compensation_fund_id && formData.compensation_fund_id !== '' && validated
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
            className="d-flex align-items-center gap-2 font-poppins btn-primary-add "
            type="submit"
          >
            <Save size={16} /> Guardar
          </CButton>
          <CButton
            className="d-flex align-items-center gap-2 font-poppins  btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Empleados' })
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
