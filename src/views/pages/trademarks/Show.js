import { useEffect, useState } from 'react'
import { Toast } from '../../../components/Toast'
import { IoMdArrowDropright } from 'react-icons/io'
import no_data from '../../../assets/images/no-data.png'
import {
  Settings,
  Save,
  Trash2,
  X,
  Terminal,
  MessageSquare,
  ArrowLeftCircle,
  TextInitial,
  CirclePlus,
  Pencil,
  RotateCcw,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react'
import {
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CCard,
  CButton,
  CTable,
  CTooltip,
  CRow,
  CFormSelect,
  CPagination,
  CPaginationItem,
} from '@coreui/react'

const Show = ({ trademark, onChangeView, onSubmit, errors, loading }) => {
  const [showForm, setShowForm] = useState(false)
  const [rule, setRule] = useState({
    id: '',
    regex: '',
    message: '',
    created_at: '',
    updated_at: '',
    deleted_at: '',
  })
  const [perPage, setPerPage] = useState(5)
  const [page, setPage] = useState(1)
  const [current, setCurrent] = useState(1)
  const startIndex = (current - 1) * perPage
  const currentItems = trademark.settings?.validations?.slice(startIndex, startIndex + perPage)

  useEffect(() => {
    if (Object.keys(errors).length !== 0) {
      Toast.fire({
        icon: 'error',
        title: errors.message,
      })
    }
  }, [errors])

  const createValidationRule = async (rule) => {
    try {
      let count = 1
      const ids = new Set(trademark.settings.validations.map((v) => v.id))
      while (ids.has(count)) count++

      const data = {
        ...rule,
        id: count,
        created_at: new Date().toISOString(),
      }

      console.log(data)
    } catch (error) {
      throw error
    }
  }

  const formattedData = currentItems?.map((setting) => {
    return {
      ...setting,
      acciones: (
        <div className="d-flex gap-2 justify-content-center">
          <CTooltip content="Editar" placement="top">
            <button
              className="action-btn edit-btn"
              disabled={!!setting.deleted_at}
              onClick={() => {
                setRule({ regex: setting.name, message: setting.name })
                setShowForm(true)
              }}
            >
              <Pencil size={18} strokeWidth={1.5} />
            </button>
          </CTooltip>
          {setting.deleted_at === null ? (
            <CTooltip content="Desactivar" placement="top">
              <button
                className="action-btn delete-btn"
                onClick={() => handleConfirmDelete(trademark)}
              >
                <Trash2 size={18} strokeWidth={1.5} />
              </button>
            </CTooltip>
          ) : (
            <CTooltip content="Activar" placement="top">
              <button
                className="action-btn restore-btn"
                onClick={() => handleConfirmRestore(trademark)}
              >
                <RotateCcw size={18} strokeWidth={1.5} />
              </button>
            </CTooltip>
          )}
        </div>
      ),
    }
  })

  const columns = [
    {
      key: 'id',
      label: <div className="sortable-header text-center">#</div>,
    },
    {
      key: 'regex',
      label: <div className="sortable-header text-center">Regex</div>,
    },
    {
      key: 'message',
      label: <div className="sortable-header text-center">Mensaje</div>,
    },
    {
      key: 'acciones',
      label: <div className="sortable-header text-center">Acciones</div>,
    },
  ]

  const totalPages = Math.ceil(trademark.settings?.validations?.length / perPage) || 1
  const currentPage = page

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

  return (
    <div className="fade-in">
      <CCard className="mb-4 p-3 shadow-sm border-0">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
            <span className="fw-bold fs-5 font-montserrat">Información de la Marca</span>
          </div>
          <CButton
            className="d-flex align-items-center gap-2 font-poppins btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Marcas' })
            }}
          >
            <ArrowLeftCircle size={16} /> Volver
          </CButton>
        </div>
        <CRow>
          <CCol md={12}>
            <CForm className="row g-3 needs-validation p-4">
              <CCol md={4}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <TextInitial size={15} /> Nombre
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={trademark?.name}
                  disabled
                  className="font-montserrat"
                />
              </CCol>
              <CCol md={8}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <TextInitial size={15} /> Descripción
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="email"
                  value={trademark?.description || ''}
                  disabled
                  className="font-montserrat"
                />
              </CCol>
            </CForm>
          </CCol>
          <CCol md={12} className="mb-4">
            <CCard className="h-100 p-4 shadow-sm border-0">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="m-0 fw-bold d-flex align-items-center gap-2 font-poppins">
                  <span style={{ position: 'relative', width: 20, height: 20 }}>
                    <Settings size={18} style={{ color: '#C21111' }} />
                    <Settings
                      size={10}
                      style={{ position: 'absolute', bottom: -4, right: -5, color: '#7B1E3A' }}
                    />
                  </span>
                  Configuración de Validaciones
                </h6>
                {!showForm && (
                  <CButton
                    variant="outline"
                    className="me-2 font-poppins btn-primary-dark btn-sm"
                    style={{ borderRadius: '7px 7px 7px 7px' }}
                    onClick={() => setShowForm(true)}
                  >
                    <CirclePlus size={16} /> Agregar Validación
                  </CButton>
                )}
              </div>
              {showForm && (
                <div
                  className="position-relative p-4 border rounded-3 mb-5 mt-3 animate-fade-in"
                  style={{ borderColor: '#124385', background: '#f1f1f1' }}
                >
                  <div
                    className="position-absolute px-2 d-flex align-items-center gap-2 fw-bold font-montserrat"
                    style={{
                      top: '-10px',
                      left: '15px',
                      fontSize: '0.75rem',
                      letterSpacing: '0.5px',
                      color: '#0934a8',
                      background: 'linear-gradient(to bottom, #ffffff 50%, #f1f1f1 50%)',
                      zIndex: 1,
                    }}
                  >
                    DATOS REGLA DE VALIDACIÓN
                  </div>
                  <CButton
                    size="sm"
                    color="light"
                    onClick={() => setShowForm(false)}
                    className="position-absolute d-flex align-items-center justify-content-center p-1"
                    style={{
                      top: '-12px',
                      right: '10px',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#fff',
                    }}
                  >
                    <X size={14} color="#64748b" />
                  </CButton>
                  <div className="row g-3 justify-content-center">
                    <CCol md={5}>
                      <CFormLabel className="d-flex gap-2 small font-inter align-items-center">
                        <Terminal size={15} /> Expresión Regular (Regex)
                      </CFormLabel>
                      <CFormInput
                        type="text"
                        name="name"
                        size="sm"
                        placeholder="Ej: ^[a-zA-Z]+$"
                        value={rule.regex}
                        onChange={(e) => setRule({ ...rule, regex: e.target.value })}
                        //invalid={!!errors?.name}
                        //valid={!errors?.name && formData.name !== '' && validated}
                        className="font-montserrat"
                      />
                      {/*<CFormFeedback invalid>
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
                      </CFormFeedback>*/}
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel className="d-flex gap-2 small font-inter align-items-center">
                        <MessageSquare size={14} /> Mensaje de Error
                      </CFormLabel>
                      <CFormInput
                        type="text"
                        name="name"
                        size="sm"
                        placeholder="Ej: Formato inválido"
                        value={rule.message}
                        onChange={(e) => setRule({ ...rule, message: e.target.value })}
                        //invalid={!!errors?.name}
                        //valid={!errors?.name && formData.name !== '' && validated}
                        className="font-montserrat"
                      />
                      {/*<CFormFeedback invalid>
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
                      </CFormFeedback>*/}
                    </CCol>
                    <CCol
                      md={1}
                      className="d-flex align-items-end"
                      style={{ marginTop: '0px', height: '75px' }}
                    >
                      <CButton
                        className="d-flex btn-sm align-items-center gap-2 font-poppins  btn-primary-add"
                        type="submit"
                        onClick={() => createValidationRule(rule)}
                      >
                        <Save size={16} /> Guardar
                      </CButton>
                    </CCol>
                  </div>
                </div>
              )}
              <CTable hover responsive align="middle" className="text-center font-inter">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-5 border-0">
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
                      value={perPage}
                      onChange={(e) => setPerPage(e.target.value)}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="15">15</option>
                    </CFormSelect>
                    registros por página
                  </div>
                </CCol>

                <CCol
                  xs={12}
                  md={8}
                  className="d-flex justify-content-md-end mt-2 mt-md-0 font-poppins"
                >
                  <CPagination size="sm" aria-label="Navegación de páginas">
                    <CPaginationItem disabled={currentPage === 1} onClick={() => setPage(1)}>
                      <ChevronsLeft size={14} />
                    </CPaginationItem>
                    <CPaginationItem
                      disabled={currentPage === 1}
                      onClick={() => {
                        setPage(currentPage - 1)
                        setCurrent(currentPage - 1)
                      }}
                    >
                      <ChevronLeft size={14} />
                    </CPaginationItem>
                    {start > 1 && <CPaginationItem disabled>...</CPaginationItem>}
                    {pages.map((p) => (
                      <CPaginationItem
                        key={p}
                        active={p === currentPage}
                        onClick={() => {
                          setPage(p)
                          setCurrent(p)
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {p}
                      </CPaginationItem>
                    ))}
                    {end < totalPages && <CPaginationItem disabled>...</CPaginationItem>}
                    <CPaginationItem
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setPage(currentPage + 1)
                        setCurrent(currentPage + 1)
                      }}
                    >
                      <ChevronRight size={14} />
                    </CPaginationItem>
                    <CPaginationItem
                      disabled={currentPage === totalPages}
                      onClick={() => setPage(totalPages)}
                    >
                      <ChevronsRight size={14} />
                    </CPaginationItem>
                  </CPagination>
                </CCol>
              </CRow>
            </CCard>
          </CCol>
        </CRow>
      </CCard>
    </div>
  )
}

export default Show
