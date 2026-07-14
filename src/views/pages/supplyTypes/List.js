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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import { useEffect } from 'react'
import {
  Pencil,
  Trash2,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  CirclePlus,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings,
  FolderCog,
  ListTree,
  ArrowUpToLine,
  ArrowDownFromLine,
  Upload,
} from 'lucide-react'
import no_data from '../../../assets/images/no-data.png'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'
import { useSelector } from 'react-redux'

export const List = ({
  data,
  loading,
  fetchSupplyTypes,
  onChangeView,
  deleteSupplyType,
  restore,
  errors,
  generateExcel,
  importExcel,
}) => {
  const [modalUpload, setModalUpload] = useState(false)
  const [file, setFile] = useState(null)
  const [supplyTypeSeleted, setSupplyTypeSelected] = useState(null)
  const user_active = useSelector((state) => state.user)
  const [params, setParams] = useState({
    search: '',
    per_page: 10,
    page: 1,
    column: 'id',
    dir: 'asc',
    with_trashed: true,
  })
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      const currentParams = { ...params, search: searchInput }
      fetchSupplyTypes(currentParams)
    }, 500)

    return () => clearTimeout(handler)
  }, [params.page, params.per_page, params.column, params.dir, params.search])

  useEffect(() => {
    const handler = setTimeout(() => {
      setParams((prev) => ({
        ...prev,
        search: searchInput,
        page: 1,
      }))
    }, 500)

    return () => clearTimeout(handler)
  }, [searchInput])

  const handleConfirmDelete = (supply_type) => {
    Swal.fire({
      title:
        '<span class="font-montserrat fw-bold" style="color: #1f2937;">Desactivar Tipo de Insumo</span>',
      html: `
        <div class="font-inter" style="font-subline: 15px; color: #4b5563; line-height: 1.6;">
          Estás a punto de desactivar el tipo de insumo <strong>${supply_type.name}</strong>.<br/>
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
          await deleteSupplyType(supply_type.id)
          fetchSupplyTypes(params)
          Toast.fire({
            icon: 'success',
            title: 'Tipo de Insumo desactivado con exito',
          })
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

  const handleConfirmRestore = (supply_type) => {
    Swal.fire({
      title:
        '<span class="font-montserrat fw-bold" style="color: #1f2937;">Activar Tipo de Insumo</span>',
      html: `
        <div class="font-inter" style="font-line: 15px; color: #4b5563; line-height: 1.6;">
          Estás a punto de activar el tipo de insumo <strong>${supply_type.name}</strong>.<br/>
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
          await restore(supply_type.id)
          fetchSupplyTypes(params)
          Toast.fire({
            icon: 'success',
            title: 'Tipo de Insumo activado con exito',
          })
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

  const handleImportExcel = async (file, supply_type) => {
    try {
      await importExcel(file, supply_type.id)
      Toast.fire({
        icon: 'success',
        title: 'Datos cargados con éxito',
      })
      setModalUpload(false)
      setFile(null)
    } catch (error) {
      console.error(error)
    }
  }

  const formattedData = data?.supply_types?.map((supply_type) => {
    return {
      ...supply_type,
      description: supply_type.description || '-',
      acciones: (
        <div className="d-flex gap-2 justify-content-center">
          <CTooltip content="Editar" placement="top">
            <button
              className="action-btn edit-btn"
              disabled={
                !!supply_type.deleted_at ||
                !user_active?.permissions.some(
                  (p) => p.name === 'typification.supply_types.find',
                ) ||
                !user_active?.permissions.some((p) => p.name === 'typification.supply_types.update')
              }
              onClick={() =>
                onChangeView({
                  name: 'edit',
                  title: 'Editar Tipo de Insumo',
                  supply_type: supply_type,
                })
              }
            >
              <Pencil size={18} strokeWidth={1.5} />
            </button>
          </CTooltip>
          <CTooltip content="Gestionar Variantes" placement="top">
            <button
              className="action-btn permisos-btn"
              disabled={
                !supply_type.settings['has_variants'] ||
                !user_active?.permissions.some(
                  (p) => p.name === 'typification.supply_types.variants.all',
                )
              }
              onClick={() =>
                onChangeView({ name: 'show', title: 'Variantes', supply_type: supply_type })
              }
            >
              <ListTree size={18} strokeWidth={1.5} />
            </button>
          </CTooltip>
          <CTooltip content="Configuraciones" placement="top">
            <button
              className="action-btn show-btn"
              disabled={
                !user_active?.permissions.some(
                  (p) => p.name === 'typification.supply_types.settings',
                )
              }
              onClick={() =>
                onChangeView({
                  name: 'settings',
                  title: 'Configurar Tipo de Insumo',
                  supply_type: supply_type,
                })
              }
            >
              <FolderCog size={18} strokeWidth={1.5} />
            </button>
          </CTooltip>
          {supply_type.deleted_at === null ? (
            <CTooltip content="Desactivar" placement="top">
              <button
                className="action-btn delete-btn"
                disabled={
                  !user_active?.permissions.some(
                    (p) => p.name === 'typification.supply_types.delete',
                  )
                }
                onClick={() => handleConfirmDelete(supply_type)}
              >
                <Trash2 size={18} strokeWidth={1.5} />
              </button>
            </CTooltip>
          ) : (
            <CTooltip content="Activar" placement="top">
              <button
                className="action-btn restore-btn"
                disabled={
                  !user_active?.permissions.some(
                    (p) => p.name === 'typification.supply_types.restore',
                  )
                }
                onClick={() => handleConfirmRestore(supply_type)}
              >
                <RotateCcw size={18} strokeWidth={1.5} />
              </button>
            </CTooltip>
          )}
          <CTooltip content="Cargar Información" placement="top">
            <button
              className="action-btn upload-btn"
              disabled={
                !!supply_type.deleted_at ||
                !user_active?.permissions.some(
                  (p) => p.name === 'typification.supply_types.find',
                ) ||
                !user_active?.permissions.some((p) => p.name === 'typification.supply_types.update')
              }
              onClick={() => {
                setSupplyTypeSelected(supply_type)
                setModalUpload(true)
              }}
            >
              <ArrowUpToLine size={18} strokeWidth={1.5} />
            </button>
          </CTooltip>
          <CTooltip content="Descargar Información" placement="top">
            <button
              className="action-btn download-btn"
              disabled={
                !!supply_type.deleted_at ||
                !user_active?.permissions.some(
                  (p) => p.name === 'typification.supply_types.find',
                ) ||
                !user_active?.permissions.some((p) => p.name === 'typification.supply_types.update')
              }
              onClick={() => generateExcel(supply_type.id)}
            >
              <ArrowDownFromLine size={18} strokeWidth={1.5} />
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
      <CCard className="mb-4 p-4 shadow-sm border-0 animate-fade-in">
        <div className="d-flex align-items-center mb-3">
          <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
          <span className="fw-bold fs-5 font-montserrat">Tipos de Insumo</span>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex gap-2 w-50 ms-4">
            <CFormInput
              className="custom-input font-inter"
              placeholder="Buscar tipo de insumo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <CButton
            variant="outline"
            className="me-2 font-poppins btn-primary-dark"
            disabled={
              !user_active?.permissions.some((p) => p.name === 'typification.supply_types.store')
            }
            onClick={() => onChangeView({ name: 'create', title: 'Crear Tipo de Insumo' })}
          >
            <CirclePlus /> Agregar Tipo de Insumo
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
                supply_type="sm"
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
            <CPagination supply_type="sm" aria-label="Navegación de páginas">
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
          visible={modalUpload}
          onClose={() => setModalUpload(false)}
          alignment="center"
          className="font-montserrat"
        >
          <CModalHeader
            style={{
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
            }}
          >
            <CModalTitle
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#0F172A',
              }}
            >
              Cargar información
            </CModalTitle>
          </CModalHeader>
          <CModalBody className="p-4">
            <p
              className="font-inter mb-4"
              style={{
                fontSize: '.87rem',
                color: '#64748B',
                lineHeight: '1.5',
              }}
            >
              Selecciona el archivo con la información que deseas importar. Solo se permiten
              archivos Excel (.xlsx).
            </p>
            <div
              className="border rounded-3 p-4 text-center"
              style={{
                borderStyle: 'dashed',
                borderColor: '#CBD5E1',
                background: '#F8FAFC',
              }}
            >
              <Upload
                size={28}
                style={{
                  color: '#6366F1',
                  marginBottom: '10px',
                }}
              />
              <div
                className="font-inter fw-semibold mb-1"
                style={{
                  color: '#334155',
                  fontSize: '.9rem',
                }}
              >
                Selecciona un archivo
              </div>
              <div
                className="font-inter mb-3"
                style={{
                  color: '#64748B',
                  fontSize: '.8rem',
                }}
              >
                Arrastra el archivo aquí o selecciónalo desde tu equipo.
              </div>
              <CFormInput
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </CModalBody>
          <CModalFooter
            style={{
              borderTop: '1px solid #E2E8F0',
              gap: '8px',
            }}
          >
            <CButton color="secondary" size="sm" onClick={() => setModalUpload(false)}>
              Cancelar
            </CButton>

            <CButton
              size="sm"
              className="text-white d-flex align-items-center gap-2"
              style={{
                backgroundColor: '#24247F',
                border: 'none',
              }}
              onClick={() => handleImportExcel(file, supplyTypeSeleted)}
            >
              <Upload size={15} />
              Cargar información
            </CButton>
          </CModalFooter>
        </CModal>
      </CCard>
    </>
  )
}

export default List
