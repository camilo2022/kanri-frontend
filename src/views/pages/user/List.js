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
} from 'lucide-react'
import no_data from '../../../assets/images/no-data.png'
import Swal from 'sweetalert2'
import { Toast } from '../../../components/Toast'

export const List = ({ data, loading, fetchUsers, onChangeView, deleteUser, restore }) => {
  const [params, setParams] = useState({
    search: '',
    per_page: 10,
    page: 1,
    column: 'id',
    dir: 'asc',
  })
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      const currentParams = { ...params, search: searchInput, page: 1 }
      fetchUsers(currentParams)
    }, 500)

    return () => clearTimeout(handler)
  }, [searchInput, params.page, params.per_page, params.column, params.dir])

  const handleConfirmDelete = (user) => {
    Swal.fire({
      title:
        '<span class="font-montserrat fw-bold" style="color: #1f2937;">Desactivar Usuario</span>',
      html: `
      <div class="font-inter" style="font-size: 15px; color: #4b5563; line-height: 1.6;">
        Estás a punto de desactivar a <strong>${user.name}</strong>.<br/>
        El usuario ya no podrá acceder al sistema.
        <div className="mt-2" style="font-weight: 600; color: #111827;">¿Deseas continuar?</div>
      </div>`,
      icon: 'warning',
      iconColor: '#f0dc2b',
      showCancelButton: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn btn-danger px-4 py-2 mx-2 shadow-sm fw-bold font-poppins',
        cancelButton: 'btn btn-light px-4 py-2 mx-2 shadow-sm fw-bold font-poppins',
        popup: 'rounded-4 border-0 shadow-lg',
      },
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true,
      backdrop: `rgba(0,0,10,0.4)`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteUser(user.id)
        } catch (error) {
          console.error(error)
        }
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Acción cancelada',
        })
      }
    })
  }

  const handleConfirmRestore = (user) => {
    Swal.fire({
      title: '<span class="font-montserrat fw-bold" style="color: #1f2937;">Activar Usuario</span>',
      html: `
      <div class="font-inter" style="font-size: 15px; color: #4b5563; line-height: 1.6;">
        Estás a punto de activar a <strong>${user.name}</strong>.<br/>
        El usuario volvera a acceder al sistema.
        <div className="mt-2" style="font-weight: 600; color: #111827;">¿Deseas continuar?</div>
      </div>`,
      icon: 'warning',
      iconColor: '#f0dc2b',
      showCancelButton: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn btn-success px-4 py-2 mx-2 shadow-sm fw-bold font-poppins',
        cancelButton: 'btn btn-light px-4 py-2 mx-2 shadow-sm fw-bold font-poppins',
        popup: 'rounded-4 border-0 shadow-lg',
      },
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true,
      backdrop: `rgba(0,0,10,0.4)`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          restore(user.id)
        } catch (error) {
          console.error(error)
        }
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Acción cancelada',
        })
      }
    })
  }

  const formattedData = data?.users?.map((user) => ({
    ...user,
    acciones: (
      <div className="d-flex gap-2 justify-content-center">
        <CTooltip content="Editar" placement="top">
          <button
            className="action-btn edit-btn"
            disabled={
              !!user.deleted_at ||
              !user.permissions.some((p) => p.name === 'users.find') ||
              !user.permissions.some((p) => p.name === 'users.update')
            }
            onClick={() => onChangeView({ name: 'edit', title: 'Editar Usuario', user: user })}
          >
            <Pencil size={18} strokeWidth={1.5} />
          </button>
        </CTooltip>
        <CTooltip content="Gestionar permisos" placement="top">
          <button
            className="action-btn permisos-btn"
            disabled={
              !!user.deleted_at ||
              !user.permissions.some((p) => p.name === 'authorization.roles.all') ||
              !user.permissions.some((p) => p.name === 'users.authorization.assign') ||
              !user.permissions.some((p) => p.name === 'users.authorization.remove')
            }
            onClick={() => onChangeView({ name: 'show', title: 'Ver Usuario', user: user })}
          >
            <ShieldCheck size={18} strokeWidth={1.5} />
          </button>
        </CTooltip>
        {user.deleted_at === null ? (
          <CTooltip content="Desactivar" placement="top">
            <button
              className="action-btn delete-btn"
              disabled={!user.permissions.some((p) => p.name === 'users.delete')}
              onClick={() => handleConfirmDelete(user)}
            >
              <Trash2 size={18} strokeWidth={1.5} />
            </button>
          </CTooltip>
        ) : (
          <CTooltip content="Activar" placement="top">
            <button
              className="action-btn restore-btn"
              disabled={!user.permissions.some((p) => p.name === 'users.restore')}
              onClick={() => handleConfirmRestore(user)}
            >
              <RotateCcw size={18} strokeWidth={1.5} />
            </button>
          </CTooltip>
        )}
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
      key: 'email',
      label: (
        <div className="sortable-header text-center" onClick={() => handleSort('email')}>
          Email{' '}
          {params.column === 'email' &&
            (params.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      ),
    },
    {
      key: 'acciones',
      label: (
        <div className="sortable-header text-center" onClick={() => handleSort('email')}>
          Aciones{' '}
        </div>
      ),
    },
  ]

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0">
      <div className="d-flex align-items-center mb-3">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Usuarios</span>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2 w-50 ms-4">
          <CFormInput
            className="custom-input"
            placeholder="Buscar usuario..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <CButton
          variant="outline"
          className="me-2 font-poppins btn-primary-dark"
          onClick={() => onChangeView({ name: 'create', title: 'Crear Usuario', usuario: null })}
        >
          <CirclePlus /> Agregar Usuario
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
                <p className="mt-2 font-poppins">Buscando usuarios...</p>
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
  )
}

export default List
