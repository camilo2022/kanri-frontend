import { useState } from 'react'
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
  CButton,
} from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import { useEffect } from 'react'
import {
  Pencil,
  ShieldCheck,
  Trash2,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  CirclePlus,
  Eye,
} from 'lucide-react'
import no_data from '../../../assets/images/no-data.png'
import Swal from 'sweetalert2'
import { Toast } from '../../../components/Toast'
import { useSelector } from 'react-redux'

export const List = ({ data, loading, fetchUsers, onChangeView }) => {
  const user_active = useSelector((state) => state.user)
  const [params, setParams] = useState({
    search: '',
    per_page: 10,
    page: 1,
    column: 'id',
    dir: 'asc',
  })
  const [searchInput, setSearchInput] = useState('')

  console.log(data)

  useEffect(() => {
    const handler = setTimeout(() => {
      const currentParams = { ...params, search: searchInput }
      fetchUsers(currentParams)
    }, 500)

    return () => clearTimeout(handler)
  }, [searchInput, params.page, params.per_page, params.column, params.dir])

  const formattedData = data?.roles?.map((rol) => ({
    ...rol,
    acciones: (
      <div className="d-flex gap-2 justify-content-center">
        <CTooltip content="Visualizar" placement="top">
          <button
            className="action-btn show-btn"
            disabled={
              !!rol.deleted_at ||
              !user_active?.permissions.some((p) => p.name === 'authorization.roles.find') ||
              !user_active?.permissions.some((p) => p.name === 'authorization.permissions.all') ||
              !user_active?.permissions.some((p) => p.name === 'authorization.permissions.store') ||
              !user_active?.permissions.some((p) => p.name === 'authorization.permissions.update')
            }
            onClick={() => onChangeView({ name: 'show', title: 'Ver Rol', rol: rol })}
          >
            <Eye size={18} strokeWidth={1.5} />
          </button>
        </CTooltip>
        <CTooltip content="Editar" placement="top">
          <button
            className="action-btn edit-btn"
            disabled={
              !!rol.deleted_at ||
              !user_active?.permissions.some((p) => p.name === 'authorization.roles.find') ||
              !user_active?.permissions.some((p) => p.name === 'authorization.roles.update')
            }
            onClick={() => onChangeView({ name: 'edit', title: 'Editar Rol', rol: rol })}
          >
            <Pencil size={18} strokeWidth={1.5} />
          </button>
        </CTooltip>
      </div>
    ),
  }))

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
      label: (
        <div className="sortable-header text-center" onClick={() => handleSort('id')}>
          #{' '}
          {params.column === 'id' &&
            (params.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      ),
    },
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
    {
      key: 'acciones',
      label: <div className="sortable-header text-center">Aciones </div>,
    },
  ]

  return (
    <>
      <CCard className="mb-4 p-4 shadow-sm border-0">
        <div className="d-flex align-items-center mb-3">
          <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
          <span className="fw-bold fs-5 font-montserrat">Roles</span>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex gap-2 w-50 ms-4">
            <CFormInput
              className="custom-input"
              placeholder="Buscar rol..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <CButton
            variant="outline"
            className="me-2 font-poppins btn-primary-dark"
            onClick={() => onChangeView({ name: 'create', title: 'Crear Usuario', usuario: null })}
          >
            <CirclePlus /> Agregar Rol
          </CButton>
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
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2 font-poppins">Buscando Roles...</p>
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

          <CCol xs={12} md={8} className="d-flex justify-content-md-end mt-md-0 font-poppins">
            <CPagination aria-label="Navegación de páginas" className="mt-2">
              <CPaginationItem
                disabled={params.page === 1}
                onClick={() => setParams({ ...params, page: params.page - 1 })}
                style={{ cursor: 'pointer' }}
              >
                <span aria-hidden="true">&laquo;</span>
              </CPaginationItem>
              <CPaginationItem style={{ background: '#24247F', color: 'white' }}>
                {params.page}
              </CPaginationItem>
              <CPaginationItem
                disabled={data?.meta?.pagination?.total_pages === params.page}
                onClick={() => setParams({ ...params, page: params.page + 1 })}
                style={{ cursor: 'pointer' }}
              >
                <span aria-hidden="true">&raquo;</span>
              </CPaginationItem>
            </CPagination>
          </CCol>
        </CRow>
      </CCard>
      <CCard className="mb-4 p-4 shadow-sm border-0">
        <div className="d-flex align-items-center mb-3">
          <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
          <span className="fw-bold fs-5 font-montserrat">Permisos</span>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex gap-2 w-50 ms-4">
            <CFormInput
              className="custom-input"
              placeholder="Buscar rol..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <CButton
            variant="outline"
            className="me-2 font-poppins btn-primary-dark"
            onClick={() => onChangeView({ name: 'create', title: 'Crear Usuario', usuario: null })}
          >
            <CirclePlus /> Agregar Rol
          </CButton>
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
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2 font-poppins">Buscando Roles...</p>
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

          <CCol xs={12} md={8} className="d-flex justify-content-md-end mt-md-0 font-poppins">
            <CPagination aria-label="Navegación de páginas" className="mt-2">
              <CPaginationItem
                disabled={params.page === 1}
                onClick={() => setParams({ ...params, page: params.page - 1 })}
                style={{ cursor: 'pointer' }}
              >
                <span aria-hidden="true">&laquo;</span>
              </CPaginationItem>
              <CPaginationItem style={{ background: '#24247F', color: 'white' }}>
                {params.page}
              </CPaginationItem>
              <CPaginationItem
                disabled={data?.meta?.pagination?.total_pages === params.page}
                onClick={() => setParams({ ...params, page: params.page + 1 })}
                style={{ cursor: 'pointer' }}
              >
                <span aria-hidden="true">&raquo;</span>
              </CPaginationItem>
            </CPagination>
          </CCol>
        </CRow>
      </CCard>
    </>
  )
}

export default List
