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
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Boxes,
  CirclePile,
} from 'lucide-react'
import no_data from '../../../assets/images/no-data.png'
import Swal from 'sweetalert2'
import { Toast } from '../../../components/Toast'
import { useSelector } from 'react-redux'
import * as FaIcons from 'react-icons/fa'

export const List = ({
  data,
  loading,
  fetchModules,
  onChangeView,
  deleteModule,
  restore,
  errors,
}) => {
  console.log('Errores en list', errors)
  const user_active = useSelector((state) => state.user)
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
      const currentParams = { ...params, search: searchInput }
      fetchModules(currentParams)
    }, 500)

    return () => clearTimeout(handler)
  }, [searchInput, params.page, params.per_page, params.column, params.dir])

  useEffect(() => {
    if (Object.keys(errors).length !== 0) {
      Toast.fire({
        icon: 'error',
        title: errors.message,
      })
    }
  }, [errors])

  const handleConfirmDelete = (module) => {
    Swal.fire({
      title:
        '<span class="font-montserrat fw-bold" style="color: #1f2937;">Desactivar Módulo</span>',
      html: `
        <div class="font-inter" style="font-size: 15px; color: #4b5563; line-height: 1.6;">
          Estás a punto de desactivar el módulo <strong>${module.name}</strong>.<br/>
          <div className="mt-2" style="font-weight: 600; color: #111827;">¿Deseas continuar?</div>
        </div>`,
      icon: 'warning',
      iconColor: '#f0dc2b',
      showCancelButton: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn btn-danger px-4 py-2 mx-2 shadow-sm fw-bold font-poppins text-white',
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
          await deleteModule(module.id)
          fetchModules(params)
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

  const handleConfirmRestore = (module) => {
    Swal.fire({
      title: '<span class="font-montserrat fw-bold" style="color: #1f2937;">Activar Módulo</span>',
      html: `
        <div class="font-inter" style="font-size: 15px; color: #4b5563; line-height: 1.6;">
          Estás a punto de activar el módulo <strong>${module.name}</strong>.<br/>
          <div className="mt-2" style="font-weight: 600; color: #111827;">¿Deseas continuar?</div>
        </div>`,
      icon: 'warning',
      iconColor: '#f0dc2b',
      showCancelButton: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn btn-success px-4 py-2 mx-2 shadow-sm fw-bold font-poppins text-white',
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
          await restore(module.id)
          fetchModules(params)
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

  const formattedData = data?.modules?.map((modulo) => {
    const icon = modulo.icon
    const IconComponent = (icon && FaIcons[icon]) || FaIcons.FaRegCircle
    return {
      ...modulo,
      icono: (
        <>
          {IconComponent ? (
            <span className="nav-icon">
              <IconComponent />
            </span>
          ) : (
            <span className="nav-icon">
              <span className="nav-icon-bullet"></span>
            </span>
          )}
        </>
      ),
      acciones: (
        <div className="d-flex gap-2 justify-content-center">
          <CTooltip content="Editar" placement="top">
            <button
              className="action-btn edit-btn"
              disabled={
                !!modulo.deleted_at ||
                !user_active?.permissions.some((p) => p.name === 'navegation.modules.find') ||
                !user_active?.permissions.some((p) => p.name === 'navegation.modules.update')
              }
              onClick={() => onChangeView({ name: 'edit', title: 'Editar Módulo', module: modulo })}
            >
              <Pencil size={18} strokeWidth={1.5} />
            </button>
          </CTooltip>
          <CTooltip content="Visualizar" placement="top">
            <button
              className="action-btn permisos-btn"
              disabled={
                !!modulo.deleted_at ||
                !user_active?.permissions.some(
                  (p) => p.name === 'navegation.modules.submodules.all',
                ) ||
                !user_active?.permissions.some(
                  (p) => p.name === 'navegation.modules.submodules.find',
                ) ||
                !user_active?.permissions.some(
                  (p) => p.name === 'navegation.modules.submodules.store',
                ) ||
                !user_active?.permissions.some(
                  (p) => p.name === 'navegation.modules.submodules.update',
                ) ||
                !user_active?.permissions.some(
                  (p) => p.name === 'navegation.modules.submodules.delete',
                ) ||
                !user_active?.permissions.some(
                  (p) => p.name === 'navegation.modules.submodules.restore',
                )
              }
              onClick={() => onChangeView({ name: 'show', title: 'Submódulos', module: modulo })}
            >
              <Boxes size={18} strokeWidth={1.5} />
            </button>
          </CTooltip>
          {modulo.deleted_at === null ? (
            <CTooltip content="Desactivar" placement="top">
              <button
                className="action-btn delete-btn"
                disabled={
                  !user_active?.permissions.some((p) => p.name === 'navegation.modules.delete')
                }
                onClick={() => handleConfirmDelete(modulo)}
              >
                <Trash2 size={18} strokeWidth={1.5} />
              </button>
            </CTooltip>
          ) : (
            <CTooltip content="Activar" placement="top">
              <button
                className="action-btn restore-btn"
                disabled={
                  !user_active?.permissions.some((p) => p.name === 'navegation.modules.restore')
                }
                onClick={() => handleConfirmRestore(modulo)}
              >
                <RotateCcw size={18} strokeWidth={1.5} />
              </button>
            </CTooltip>
          )}
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
      key: 'icono',
      label: <div className="sortable-header text-center">Icono</div>,
    },
    {
      key: 'acciones',
      label: <div className="sortable-header text-center">Acciones </div>,
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

  return (
    <>
      <CCard className="mb-4 p-4 shadow-sm border-0">
        <div className="d-flex align-items-center mb-3">
          <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
          <span className="fw-bold fs-5 font-montserrat">Módulos</span>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex gap-2 w-50 ms-4">
            <CFormInput
              className="custom-input"
              placeholder="Buscar módulo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <CButton
            variant="outline"
            className="me-2 font-poppins btn-primary-dark"
            disabled={!user_active?.permissions.some((p) => p.name === 'navegation.modules.store')}
            onClick={() => onChangeView({ name: 'create', title: 'Crear Módulo' })}
          >
            <CirclePlus /> Agregar Módulo
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
                  <p className="mt-2 font-poppins">Buscando Módulos...</p>
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
      </CCard>
    </>
  )
}

export default List
