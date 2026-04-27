import { useState, useEffect } from 'react'
import { CCard, CFormInput, CCol, CButton, CForm, CFormFeedback, CFormLabel } from '@coreui/react'
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
  Settings,
} from 'lucide-react'
import { Toast } from '@/components/Toast'
import Swal from 'sweetalert2'
import Select from 'react-select'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const Edit = ({
  employee,
  onChangeView,
  onSubmit,
  errors,
  allPositions,
  people,
  positions,
  risk_managers,
  health_entities,
  pension_funds,
  compensation_funds,
  areas,
  loading,
}) => {
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({
    person_id: '',
    operation_center: '',
    position_id: '',
    risk_manager_id: '',
    health_entity_id: '',
    pension_fund_id: '',
    compensation_fund_id: '',
    area_id: employee?.position?.area[0].id,
    start_date: '',
    end_date: '',
  })

  useEffect(() => {
    if (employee) {
      setFormData({
        person_id: employee.person_id || '',
        operation_center: employee.operation_center || '',
        position_id: employee.position_id || '',
        risk_manager_id: employee.risk_manager_id || '',
        health_entity_id: employee.health_entity_id || '',
        pension_fund_id: employee.pension_fund_id || '',
        compensation_fund_id: employee.compensation_fund_id || '',
        area_id: employee?.position?.area[0].id || '',
        start_date: employee.start_date ? employee.start_date.split(' ')[0] : '',
        end_date: employee.end_date ? employee.end_date.split(' ')[0] : '',
      })
    }
  }, [employee])

  useEffect(() => {
    if (formData.area_id === '') return
    allPositions(formData.area_id)
  }, [formData.area_id])

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Editar Empleado',
      html: `<div style="font-size:14px">
              Se actualizará la información del empleado en el sistema.<br/>
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
          const response = await onSubmit(employee.id, formData)
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
              risk_manager_id: '',
              health_entity_id: '',
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

  const isDataReady =
    employee &&
    Array.isArray(people) &&
    Array.isArray(areas) &&
    Array.isArray(risk_managers) &&
    Array.isArray(health_entities) &&
    Array.isArray(pension_funds) &&
    Array.isArray(compensation_funds)
  if (!isDataReady) {
    return (
      <CCard
        className="mb-4 p-4 shadow-sm border-0 d-flex justify-content-center align-items-center"
        style={{ minHeight: '500px' }}
      >
        <div className="text-center">
          <div className="gears-loader mb-3">
            <div className="gears-container mb-3">
              <Settings size={40} className="gear gear-large text-primary" />
              <Settings size={24} className="gear gear-small text-secondary" />
            </div>
          </div>
          <h5 className="fw-bold font-montserrat text-secondary">Preparando Formulario</h5>
          <p className="text-muted font-inter small">
            Estamos cargando la información necesaria...
          </p>
        </div>
      </CCard>
    )
  }

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0 animate-fade-in">
      <div className="d-flex align-items-center mb-4">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Editar Empleado</span>
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
            isDisabled
            onChange={(selected) =>
              handleChange({
                target: {
                  name: 'person_id',
                  value: selected?.value || '',
                },
              })
            }
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
            className="font-montserrat input-custom"
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
            className="font-montserrat input-custom"
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
            placeholder={'Seleccione un área'}
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
            placeholder={'Seleccione un cargo'}
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
            className="font-montserrat input-custom"
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
            <Hospital size={15} /> Administradora de Riesgos
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <Select
            classNamePrefix="react-select"
            name="risk_manager_id"
            value={
              Array.isArray(risk_managers)
                ? (risk_managers
                    ?.map((a) => ({
                      value: a.id,
                      label: `${a?.name} `,
                    }))
                    .find((opt) => opt.value === formData.risk_manager_id) ?? null)
                : null
            }
            onChange={(selected) =>
              handleChange({
                target: {
                  name: 'risk_manager_id',
                  value: selected?.value || '',
                },
              })
            }
            invalid={!!errors?.risk_manager_id}
            valid={!errors?.risk_manager_id && formData.risk_manager_id !== '' && validated}
            options={
              Array.isArray(risk_managers)
                ? risk_managers.map((a) => ({
                    value: a.id,
                    label: `${a.name}`,
                  }))
                : []
            }
            isDisabled={!Array.isArray(risk_managers)}
            isSearchable
            filterOption={customFilterOption}
            className="w-100 font-montserrat"
            placeholder={'Seleccione una administradora'}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: !!errors?.risk_manager_id
                  ? '#dc3545'
                  : !errors?.risk_manager_id && formData.risk_manager_id !== '' && validated
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
          <CFormFeedback invalid className={!!errors?.risk_manager_id ? 'd-block' : 'd-none'}>
            {errors?.risk_manager_id?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback
            valid
            className={
              !errors?.risk_manager_id && formData.risk_manager_id !== '' && validated
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
            <Hospital size={15} /> Entidad de Salud
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <Select
            classNamePrefix="react-select"
            name="health_entity_id"
            value={
              Array.isArray(health_entities)
                ? (health_entities
                    ?.map((e) => ({
                      value: e.id,
                      label: `${e?.name} `,
                    }))
                    .find((opt) => opt.value === formData.health_entity_id) ?? null)
                : null
            }
            onChange={(selected) =>
              handleChange({
                target: {
                  name: 'health_entity_id',
                  value: selected?.value || '',
                },
              })
            }
            invalid={!!errors?.health_entity_id}
            valid={!errors?.health_entity_id && formData.health_entity_id !== '' && validated}
            options={
              Array.isArray(health_entities)
                ? health_entities.map((e) => ({
                    value: e.id,
                    label: `${e?.name} `,
                  }))
                : []
            }
            isDisabled={!Array.isArray(health_entities) && formData.health_entity_id === ''}
            isSearchable
            filterOption={customFilterOption}
            className="w-100 font-montserrat"
            placeholder={'Seleccione una entidad'}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: !!errors?.health_entity_id
                  ? '#dc3545'
                  : !errors?.health_entity_id && formData.health_entity_id !== '' && validated
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
          <CFormFeedback invalid className={!!errors?.health_entity_id ? 'd-block' : 'd-none'}>
            {errors?.health_entity_id?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback
            valid
            className={
              !errors?.health_entity_id && formData.health_entity_id !== '' && validated
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
            placeholder={'Seleccione un fondo de compensación'}
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
            placeholder={'Seleccione una caja de compensación'}
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
            className="d-flex align-items-center gap-2 font-poppins  btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Empleados' })
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
