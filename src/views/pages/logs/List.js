import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
  FunnelX,
  User,
  Component,
} from 'lucide-react'
import {
  CCard,
  CTable,
  CFormInput,
  CPagination,
  CPaginationItem,
  CFormSelect,
  CRow,
  CCol,
  CTooltip,
  CBadge,
  CCardBody,
} from '@coreui/react'
import { CModal, CModalHeader, CModalTitle, CModalBody } from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import no_data from '../../../assets/images/no-data.png'
import Select from 'react-select'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

export const List = ({ data, models, audit, loading, fetchAudits, findAudit, users }) => {
  const user = useSelector((state) => state.user)
  const [visible, setVisible] = useState(false)
  const [model, setModel] = useState('')
  const [tags, setTags] = useState()
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [params, setParams] = useState({
    search: '',
    per_page: 10,
    page: 1,
    column: 'created_at',
    dir: 'desc',
    event: '',
    start_date: '',
    end_date: '',
    user_id: '',
    auditable_name: '',
  })

  useEffect(() => {
    fetchAudits(params)
  }, [params.page, params.per_page, params.column, params.dir, params.start_date, params.end_date])

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      page: 1,
    }))
    fetchAudits(params)
  }, [params.user_id, params.auditable_name, params.event])

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      start_date: startDate,
      end_date: endDate,
      page: 1,
    }))
  }, [startDate, endDate])

  const eventStyles = {
    created: { label: 'Creado', color: 'success' },
    updated: { label: 'Actualizado', color: 'info' },
    deleted: { label: 'Eliminado', color: 'danger' },
    restored: { label: 'Restaurado', color: 'warning' },

    attach: { label: 'Asociado', color: 'primary' },
    detach: { label: 'Desasociado', color: 'dark' },
    sync: { label: 'Sincronizado', color: 'secondary' },

    default: { label: 'No Aplica', color: 'light' },
  }

  const events = {
    updated: 'Actualizado',
    created: 'Creado',
    deleted: 'Eliminado',
    restored: 'Restaurado',
    attach: 'Asociado',
    detach: 'Desasociado',
    sync: 'Sincronizado',
  }

  const formattedData = data?.audits?.map((log) => {
    const config = eventStyles[log.event] || eventStyles.default
    return {
      ...log,
      user: `${log.user?.employee?.person?.names || ''} ${log.user?.employee?.person?.last_names || ''}`,
      event: (
        <span className={`badge rounded-pill bg-${config.color} px-3 py-2`}>{config.label}</span>
      ),
      created_at: (
        <div className="d-flex flex-column">
          <span className="fw-semibold">{dayjs.utc(log.created_at).format('DD/MM/YYYY')}</span>
          <span className="text-muted small">{dayjs.utc(log.created_at).format('hh:mm A')}</span>
        </div>
      ),
      acciones: (
        <div className="d-flex gap-2 justify-content-center">
          <CTooltip content="Ver detalles del cambio" placement="top">
            <button
              className="action-btn show-btn"
              disabled={!user?.permissions.some((p) => p.name === 'audits.find')}
              onClick={() => {
                findAudit(log.id)
                setModel(log.auditable_name)
                setTags(log.audit_tag)
                setVisible(true)
              }}
            >
              <Eye size={18} strokeWidth={1.5} />
            </button>
          </CTooltip>
        </div>
      ),
    }
  })

  const handleSort = (column) => {
    setParams((prev) => ({
      ...prev,
      column: column,
      dir: prev.column === column && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  const columns = [
    {
      key: 'id',
      label: <div className="sortable-header text-center">#</div>,
    },
    {
      key: 'user',
      label: <div className="sortable-header text-center">Usuario</div>,
    },
    {
      key: 'event',
      label: <div className="sortable-header text-center">Evento</div>,
    },
    {
      key: 'created_at',
      label: (
        <div className="sortable-header text-center" onClick={() => handleSort('created_at')}>
          Fecha{' '}
          {params.column === 'created_at' &&
            (params.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      ),
    },
    {
      key: 'auditable_name',
      label: <div className="sortable-header text-center">Sección Modificada</div>,
    },
    {
      key: 'acciones',
      label: <div className="sortable-header text-center">Acciones</div>,
    },
  ]

  const totalPages = data?.meta?.pagination?.total_pages || 1
  const currentPage = params.page

  const getPages = () => {
    const pages = []
    const maxVisible = 5

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = start + maxVisible - 1

    if (end > totalPages) {
      end = totalPages
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return { pages, start, end }
  }

  const { pages, start, end } = getPages()

  const customFilterOption = (option, rawInput) => {
    const words = rawInput.toLowerCase().split(' ')
    const label = option.label.toLowerCase()
    return words.every((word) => label.includes(word))
  }

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0">
      <div className="d-flex align-items-center mb-3">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Auditoria</span>
      </div>
      <div className="container-fluid px-3 mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-lg-9">
            <div className="row g-2 align-items-end">
              <div className="col-12 col-sm-5">
                <div className="d-flex flex-column">
                  <label className="text-muted small mb-1">Usuario que realizo el cambio</label>
                  <Select
                    name="user_id"
                    value={
                      Array.isArray(users)
                        ? (users
                            ?.map((user) => ({
                              value: user.id,
                              label: `${user?.employee?.person?.names || ''} ${user?.employee?.person?.last_names || ''} `,
                            }))
                            .find((opt) => opt.value === params.user_id) ?? {
                            value: '',
                            label: 'Todos los usuarios',
                          })
                        : null
                    }
                    onChange={(e) => {
                      const { value } = e
                      setParams((prev) => ({
                        ...prev,
                        user_id: value,
                      }))
                    }}
                    options={
                      Array.isArray(users)
                        ? [
                            { label: 'Todos los usuarios', value: '' },
                            ...users?.map((user) => ({
                              value: user.id,
                              label: `${user.employee?.person?.names || ''} ${user.employee?.person?.last_names || ''}`,
                            })),
                          ]
                        : []
                    }
                    isDisabled={!Array.isArray(users)}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={null}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      control: (base) => ({
                        ...base,
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
                </div>
              </div>
              <div className="col-12 col-sm-4">
                <div className="d-flex flex-column">
                  <label className="text-muted small mb-1">Sección modificada</label>
                  <Select
                    name="auditable_name"
                    value={
                      Object.keys(models)
                        .map((model) => ({
                          value: model,
                          label: models[model],
                        }))
                        .find((opt) => opt.value === params.auditable_name.split('\\')[2]) ?? {
                        value: '',
                        label: 'Todas las secciones',
                      }
                    }
                    onChange={(e) => {
                      const { value } = e
                      setParams((prev) => ({
                        ...prev,
                        auditable_name: value ? `App\\Models\\${value}` : '',
                      }))
                    }}
                    options={[
                      { label: 'Todas las secciones', value: '' },
                      ...Object.keys(models).map((model) => ({
                        value: model,
                        label: models[model],
                      })),
                    ]}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={null}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      control: (base) => ({
                        ...base,
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
                </div>
              </div>
              <div className="col-12 col-sm-3">
                <div className="d-flex flex-column">
                  <label className="text-muted small mb-1">Eventos</label>
                  <Select
                    name="event"
                    value={
                      Object.keys(events)
                        .map((event) => ({
                          value: event,
                          label: events[event],
                        }))
                        .find((opt) => opt.value === params.event) ?? {
                        value: '',
                        label: 'Todos los eventos',
                      }
                    }
                    onChange={(e) => {
                      const { value } = e
                      setParams((prev) => ({
                        ...prev,
                        event: value,
                      }))
                    }}
                    options={[
                      { label: 'Todos los eventos', value: '' },
                      ...Object.keys(events).map((event) => ({
                        value: event,
                        label: events[event],
                      })),
                    ]}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={null}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      control: (base) => ({
                        ...base,
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
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-3">
            <div className="row g-2 align-items-end">
              <div className="col-6 col-sm-6">
                <div className="d-flex flex-column">
                  <label className="text-muted small mb-1">Desde</label>
                  <CFormInput
                    type="date"
                    className="custom-input"
                    value={startDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-5 col-sm-5">
                <div className="d-flex flex-column">
                  <label className="text-muted small mb-1">Hasta</label>
                  <CFormInput
                    type="date"
                    className="custom-input"
                    value={endDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-1">
                <button
                  className="btn btn-outline-secondary p-2 d-flex justify-content-center align-items-center"
                  style={{ height: '38px' }}
                  onClick={() => {
                    setStartDate()
                    setEndDate()
                    setParams((prev) => ({
                      ...prev,
                      auditable_name: '',
                      user_id: '',
                      event: '',
                    }))
                  }}
                  title="Limpiar filtros"
                >
                  <FunnelX size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CTable hover responsive align="middle" className="text-center font-inter">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading || !Array.isArray(formattedData) ? (
            <tr>
              <td colSpan={columns.length} className="py-5 border-0">
                <div className="d-flex flex-column align-items-center justify-content-center">
                  <div className="data-loader-container mb-3">
                    <div className="radar-circle"></div>
                    <div className="radar-scanner"></div>
                    <FileText size={30} className="text-primary radar-icon" />
                  </div>
                  <div className="loader-text-wrapper">
                    <span className="loader-text">Cargando Datos...</span>
                  </div>
                  <div className="loader-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </td>
            </tr>
          ) : formattedData?.length > 0 ? (
            formattedData.map((item, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col.key}>{item[col.key]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-muted p-4">
                <img src={no_data} className="img-fluid" style={{ maxHeight: '120px' }} />
                <br />
                No hay datos para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </CTable>
      <CRow className="align-items-center">
        <CCol xs={12} md={4}>
          <div className="d-flex align-items-center gap-2 text-muted small font-poppins">
            Ver
            <CFormSelect
              size="sm"
              style={{ width: '70px' }}
              value={params.per_page}
              onChange={(e) => setParams({ ...params, per_page: e.target.value, page: 1 })}
            >
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </CFormSelect>
            registros por página
          </div>
        </CCol>

        <CCol xs={12} md={8} className="d-flex justify-content-md-end mt-2 mt-md-0 font-poppins">
          <CPagination size="sm" aria-label="Navegación de páginas">
            <CPaginationItem
              disabled={currentPage === 1}
              onClick={() => setParams((prev) => ({ ...prev, page: 1 }))}
            >
              <ChevronsLeft size={14} />
            </CPaginationItem>
            <CPaginationItem
              disabled={currentPage === 1}
              onClick={() => setParams((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              <ChevronLeft size={14} />
            </CPaginationItem>
            {start > 1 && <CPaginationItem disabled>...</CPaginationItem>}
            {pages.map((p) => (
              <CPaginationItem
                key={p}
                active={p === currentPage}
                onClick={() => setParams((prev) => ({ ...prev, page: p }))}
                style={{ cursor: 'pointer' }}
              >
                {p}
              </CPaginationItem>
            ))}
            {end < totalPages && <CPaginationItem disabled>...</CPaginationItem>}
            <CPaginationItem
              disabled={currentPage === totalPages}
              onClick={() => setParams((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              <ChevronRight size={14} />
            </CPaginationItem>
            <CPaginationItem
              disabled={currentPage === totalPages}
              onClick={() => setParams((prev) => ({ ...prev, page: totalPages }))}
            >
              <ChevronsRight size={14} />
            </CPaginationItem>
          </CPagination>
        </CCol>
      </CRow>
      <CModal
        visible={visible}
        onClose={() => {
          setVisible(false)
        }}
        size="lg"
        scrollable
      >
        <CModalHeader className="bg-light">
          <CModalTitle className="fs-5 font-poppins">Detalle de Auditoría</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {audit && (
            <div className="audit-detail-container font-inter">
              <CRow className="g-3 mb-3 align-items-stretch">
                <CCol md={3}>
                  <div className="p-3 border-start border-4 border-primary rounded shadow-sm bg-white d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center">
                        <span
                          className="text-uppercase text-muted fw-bold tracking-wider"
                          style={{ fontSize: '9.5px' }}
                        >
                          Identificación Log
                        </span>
                      </div>
                      <h4 className="text-dark fw-bolder mb-0">
                        <span className="text-primary op-50">#</span>
                        {audit.id}
                      </h4>
                    </div>
                    <div>
                      <span
                        className="text-uppercase text-muted fw-bold tracking-wider"
                        style={{ fontSize: '9.5px' }}
                      >
                        Estado del Evento
                      </span>
                      <CBadge
                        shape="rounded-pill"
                        color={eventStyles[audit.event]?.color}
                        className="px-3 py-2 shadow-sm"
                        style={{ fontSize: '0.75rem', fontWeight: '600' }}
                      >
                        {events[audit.event]?.toUpperCase()}
                      </CBadge>
                    </div>
                  </div>
                </CCol>
                <CCol md={9}>
                  <div className="p-4 bg-white border rounded shadow-sm d-flex align-items-center">
                    <CRow className="g-3">
                      <CCol sm={3} className="border-end-md">
                        <div className="d-flex flex-column">
                          <small
                            className="text-muted fw-bold mb-2"
                            style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}
                          >
                            <i className="cil-calendar me-1"></i> FECHA Y HORA
                          </small>
                          <div className="ps-1">
                            <div className="fw-bold text-dark fs-5 mb-0">
                              {dayjs(audit.created_at).format('DD/MM/YYYY')}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                              <i className="cil-clock me-1"></i>
                              {dayjs(audit.created_at).format('hh:mm A')}
                            </div>
                          </div>
                        </div>
                      </CCol>
                      <CCol sm={3} className="border-end-md">
                        <div className="d-flex flex-column">
                          <small
                            className="text-muted fw-bold mb-2"
                            style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}
                          >
                            <i className="cil-lan me-1"></i> DIRECCIÓN IP
                          </small>
                          <div>
                            <code className="bg-danger bg-opacity-10 text-danger px-2 py-1 rounded fw-bold fs-5">
                              {audit.ip_address}
                            </code>
                          </div>
                        </div>
                      </CCol>
                      <CCol sm={6}>
                        <div className="d-flex flex-column">
                          <small
                            className="text-muted fw-bold mb-2"
                            style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}
                          >
                            <i className="cil-code me-1"></i> RUTA DEL SISTEMA
                          </small>
                          <div className="ps-1">
                            <span
                              className="badge bg-light text-primary border border-primary border-opacity-25 px-2 py-1 font-monospace"
                              style={{
                                fontSize: '0.85rem',
                                whiteSpace: 'normal',
                                wordBreak: 'break-all',
                                textAlign: 'left',
                                display: 'inline-block',
                              }}
                            >
                              {audit.url || 'inicio'}
                            </span>
                          </div>
                        </div>
                      </CCol>
                    </CRow>
                  </div>
                </CCol>
              </CRow>
              <CRow className="g-4 mb-4 align-items-stretch">
                <CCol md={6}>
                  <CCard
                    className="h-100 shadow-sm border-0"
                    style={{ borderRadius: '12px', overflow: 'hidden' }}
                  >
                    <CCardBody className="px-4 py-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <User size={16} strokeWidth={2.5} style={{ color: '#0934a8' }} />
                        <h6
                          className="mb-0 fw-bold font-montserrat text-uppercase"
                          style={{ color: '#0934a8', fontSize: '0.8rem', letterSpacing: '0.5px' }}
                        >
                          ¿Quién hizo el cambio?
                        </h6>
                      </div>
                      <div className="d-grid gap-2 font-inter">
                        <div className="p-2 border-bottom">
                          <span className="text-muted d-block small fw-medium mb-1">
                            Nombre Completo
                          </span>
                          <span className="fw-bold text-dark fs-6">
                            {audit.user?.employee?.person
                              ? `${audit.user.employee.person.names} ${audit.user.employee.person.last_names}`
                              : 'Super Admin'}
                          </span>
                        </div>
                        <div className="p-2 rounded-3" style={{ backgroundColor: '#f8fafc' }}>
                          <span
                            className="text-muted d-block small fw-medium mb-1"
                            style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}
                          >
                            Área
                          </span>
                          <span className="fw-semibold text-dark d-block">
                            {audit.user?.employee?.position?.area[0].name || 'No aplica'}
                          </span>
                        </div>
                        <div className="p-2 rounded-3" style={{ backgroundColor: '#f8fafc' }}>
                          <span
                            className="text-muted d-block small fw-medium mb-1"
                            style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}
                          >
                            Cargo
                          </span>
                          <span className="fw-semibold text-dark d-block">
                            {audit.user?.employee?.position?.name || 'No aplica'}
                          </span>
                        </div>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol md={6}>
                  <CCard
                    className="h-100 shadow-sm border-0"
                    style={{ borderRadius: '12px', overflow: 'hidden' }}
                  >
                    <CCardBody className="px-4 py-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Component size={18} strokeWidth={2.5} style={{ color: '#0934a8' }} />
                        <h6
                          className="mb-0 fw-bold font-montserrat text-uppercase"
                          style={{ color: '#0934a8', fontSize: '0.8rem', letterSpacing: '0.5px' }}
                        >
                          ¿Qué elemento fue alterado?
                        </h6>
                      </div>
                      <div className="d-grid gap-2 font-inter">
                        <div className="p-2 border-bottom bg-light bg-opacity-10">
                          <CRow className="align-items-start">
                            <CCol>
                              <span
                                className="text-muted d-block small fw-medium mb-1 text-uppercase"
                                style={{ letterSpacing: '0.5px' }}
                              >
                                Sección
                              </span>
                              <span className="fw-bold text-dark fs-5">{model || 'No existe'}</span>
                            </CCol>
                            {audit?.tags && (
                              <CCol className="border-start ps-4">
                                <span
                                  className="text-muted d-block small fw-medium mb-1 text-uppercase"
                                  style={{ letterSpacing: '0.5px' }}
                                >
                                  Etiqueta
                                </span>
                                <CBadge color="primary" shape="rounded-pill" className="px-3 py-2">
                                  {tags}
                                </CBadge>
                              </CCol>
                            )}
                          </CRow>
                        </div>
                        <div className="-mt-2">
                          <span className="text-muted d-block small fw-medium mb-1">Elemento</span>
                          {Object.keys(audit.auditable || {})
                            .slice(2, 3)
                            .map((key) => (
                              <code
                                key={key}
                                className="d-block p-2 bg-light rounded text-primary small"
                                style={{ wordBreak: 'break-all', border: '1px solid #e2e8f0' }}
                              >
                                {key}: {JSON.stringify(audit.auditable[key])}
                              </code>
                            ))}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                          <span className="text-muted small fw-medium">ID del Elemento</span>
                          <div className="d-flex gap-2 align-items-center">
                            <span className="badge bg-secondary rounded-pill px-3 py-2">
                              {audit.auditable?.id || 'No existe'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
              <CRow className="g-0 border rounded-3 overflow-hidden shadow-sm bg-white">
                <CCol md={6} className="p-0 border-end border-light">
                  <div
                    className="px-3 py-2 d-flex align-items-center justify-content-between"
                    style={{ backgroundColor: '#fff5f5', borderBottom: '1px solid #fee2e2' }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-danger"
                        style={{ width: '8px', height: '8px' }}
                      ></div>
                      <span
                        className="text-danger fw-bold"
                        style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}
                      >
                        VALORES ANTERIORES
                      </span>
                    </div>
                    <small className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                      JSON
                    </small>
                  </div>
                  <div className="json-container bg-white p-3">
                    {!audit.old_values || Object.keys(audit.old_values).length === 0 ? (
                      <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted opacity-50">
                        <FunnelX size={32} strokeWidth={1} />
                        <span className="small mt-2">Sin datos registrados</span>
                      </div>
                    ) : (
                      <pre
                        className="m-0 p-3 rounded-3 shadow-inner"
                        style={{
                          maxHeight: '350px',
                          fontSize: '0.85rem',
                          lineHeight: '1.6',
                          backgroundColor: '#1e1e1e',
                          color: '#9cdcfe',
                          overflowX: 'auto',
                          border: '1px solid #2d2d2d',
                          fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                        }}
                      >
                        <code style={{ color: '#ce9178' }}>
                          {JSON.stringify(audit.old_values, null, 2)}
                        </code>
                      </pre>
                    )}
                  </div>
                </CCol>
                <CCol md={6}>
                  <div
                    className="px-3 py-2 d-flex align-items-center justify-content-between"
                    style={{ backgroundColor: '#f5fff8', borderBottom: '1px solid #e2feef' }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-success"
                        style={{ width: '8px', height: '8px' }}
                      ></div>
                      <span
                        className="text-success fw-bold"
                        style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}
                      >
                        VALORES NUEVOS
                      </span>
                    </div>
                    <small className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                      JSON
                    </small>
                  </div>
                  <div className="json-container bg-white p-3">
                    {!audit.new_values || Object.keys(audit.new_values).length === 0 ? (
                      <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted opacity-50">
                        <FunnelX size={32} strokeWidth={1} />
                        <span className="small mt-2">Sin datos registrados</span>
                      </div>
                    ) : (
                      <pre
                        className="m-0 p-3 rounded-3 shadow-inner"
                        style={{
                          maxHeight: '350px',
                          fontSize: '0.85rem',
                          lineHeight: '1.6',
                          backgroundColor: '#1e1e1e',
                          color: '#9cdcfe',
                          overflowX: 'auto',
                          border: '1px solid #2d2d2d',
                          fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                        }}
                      >
                        <code style={{ color: '#78ce84' }}>
                          {JSON.stringify(audit.new_values, null, 2)}
                        </code>
                      </pre>
                    )}
                  </div>
                </CCol>
              </CRow>
            </div>
          )}
        </CModalBody>
      </CModal>
    </CCard>
  )
}

export default List
