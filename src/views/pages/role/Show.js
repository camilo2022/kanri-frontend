import { useEffect, useState } from 'react'
import {
  CCard,
  CTable,
  CRow,
  CCol,
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
  CSpinner,
  CPagination,
  CPaginationItem,
  CFormSelect,
} from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import {
  ShieldCheck,
  ArrowLeftCircle,
  TextInitial,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Toast } from '../../../components/Toast'

const Show = ({ role, loading, onChangeView, errors, permissions = [], allPermissions }) => {
  const [params, setParams] = useState({
    role_id: '',
    search: '',
    per_page: 10,
    page: 1,
    column: 'id',
    dir: 'asc',
  })
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    if (!role) return
    params.role_id = role.id

    const handler = setTimeout(() => {
      const currentParams = { ...params, search: searchInput }
      allPermissions(currentParams)
    }, 500)

    return () => clearTimeout(handler)
  }, [searchInput, role, params.page, params.per_page, params.column, params.dir])

  useEffect(() => {
    if (Object.keys(errors).length !== 0) {
      Toast.fire({
        icon: 'error',
        title: errors.message,
      })
    }
  }, [errors])

  const handleSort = (column) => {
    setParams((prev) => ({
      ...prev,
      column: column,
      dir: prev.column === column && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  const columns = [
    {
      key: 'name',
      label: (
        <div className="sortable-header text-center" onClick={() => handleSort('name')}>
          Nombre{' '}
          {params.column === 'name' &&
            (params.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      ),
    },
    {
      key: 'title',
      label: (
        <div className="sortable-header text-center" onClick={() => handleSort('title')}>
          Titulo{' '}
          {params.column === 'title' &&
            (params.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      ),
    },
    {
      key: 'description',
      label: (
        <div className="sortable-header text-center" onClick={() => handleSort('description')}>
          Descripción{' '}
          {params.column === 'description' &&
            (params.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      ),
    },
  ]

  const totalPages = permissions?.meta?.pagination?.total_pages || 1
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

  return (
    <div className="fade-in">
      <CCard className="mb-4 p-3 shadow-sm border-0">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
            <span className="fw-bold fs-5 font-montserrat">Detalles del Rol</span>
          </div>
          <CButton
            className="d-flex align-items-center gap-2 font-poppins btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Usuarios', user: null })
            }}
          >
            <ArrowLeftCircle size={16} /> Volver
          </CButton>
        </div>
        <CRow>
          <CCol md={12}>
            <CForm className="row g-3 needs-validation p-4">
              <CCol md={6}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <TextInitial size={15} />
                  Nombre
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={role?.name || ''}
                  disabled
                  className="font-montserrat"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <TextInitial size={15} />
                  Título
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="title"
                  value={role?.title || ''}
                  disabled
                  className="font-montserrat"
                />
              </CCol>
              <CCol md={12}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <TextInitial size={15} />
                  Descripción
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="description"
                  value={role?.description || ''}
                  disabled
                  className="font-montserrat"
                />
              </CCol>
            </CForm>
          </CCol>
          <CCol md={12} className="mb-4">
            <CCard className="h-100 p-4 shadow-sm border-0">
              <h6 className="mb-3 fw-bold d-flex align-items-center gap-2 font-poppins">
                <ShieldCheck size={18} className="text-primary" />
                Permisos
              </h6>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex gap-2 w-50 ms-4">
                  <CFormInput
                    className="custom-input"
                    placeholder="Buscar permiso..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              </div>

              {!Array.isArray(permissions.permissions) ? (
                <div className="text-center">
                  <CSpinner />
                  <br />
                  <span>Cargando permisos...</span>
                </div>
              ) : permissions.permissions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    No hay permisos para este rol
                  </td>
                </tr>
              ) : (
                <>
                  <CTable hover responsive align="middle" className="small border">
                    <thead className="table-light font-poppins">
                      <tr>
                        {columns.map((col) => (
                          <th key={col.key}>{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={columns.length} className="text-center p-5">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-2 font-poppins">Buscando Permisos...</p>
                          </td>
                        </tr>
                      ) : permissions?.permissions?.length > 0 ? (
                        permissions.permissions.map((item, index) => (
                          <tr key={index}>
                            {columns.map((col) => (
                              <td key={col.key}>{item[col.key]}</td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={columns.length} className="text-muted p-4">
                            <img
                              src={no_data}
                              className="img-fluid"
                              style={{ maxHeight: '120px' }}
                            />
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
                          onChange={(e) =>
                            setParams({ ...params, per_page: e.target.value, page: 1 })
                          }
                        >
                          <option value="10">10</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
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
                </>
              )}
            </CCard>
          </CCol>
        </CRow>
      </CCard>
    </div>
  )
}

export default Show
