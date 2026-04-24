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

export const Record = ({ data, models, audit, loading, fetchAudits, findAudit, users }) => {
  const groupedMap = {}

  data?.audits?.forEach((audit) => {
    const key = audit.auditable_type

    if (audit.auditable_type === 'App\\Models\\User') {
    }

    if (!groupedMap[key]) {
      groupedMap[key] = {
        auditable_type: audit.auditable_type,
        auditable_name: audit.auditable_name,
        elements: [],
      }
    }

    const exists = groupedMap[key].elements.some((el) => el?.id === audit.auditable?.id)

    if (!exists) {
      groupedMap[key].elements.push(audit.auditable)
    }
  })

  const user = useSelector((state) => state.user)
  const [visible, setVisible] = useState(false)
  const [model, setModel] = useState('')
  const [tags, setTags] = useState()
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [params, setParams] = useState({
    search: '',
    per_page: null,
    page: '',
    column: 'created_at',
    dir: 'desc',
    event: '',
    start_date: '',
    end_date: '',
    user_id: '',
    auditable_name: '',
  })
  let grouped = {}

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
                  <CFormSelect className="font-inter" name="auditable_type">
                    {groupedMap ? (
                      <>
                        <option value="">Seleccione un elemento</option>
                        {Object.entries(groupedMap).map(([auditableType, audit]) => (
                          <optgroup key={auditableType} label={audit.auditable_name}>
                            {audit.elements
                              ?.slice()
                              .sort((a, b) => a?.id - b?.id)
                              .map(
                                (a) =>
                                  a && (
                                    <option key={a.id} value={a.id}>
                                      {auditableType === 'App\\Models\\Person'
                                        ? `${a.id} - ${a.names} ${a.last_names}`
                                        : `${a.id} - ${a.name}`}
                                    </option>
                                  ),
                              )}
                          </optgroup>
                        ))}
                      </>
                    ) : (
                      <option disabled>Cargando elementos...</option>
                    )}
                  </CFormSelect>
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
    </CCard>
  )
}

export default Record
