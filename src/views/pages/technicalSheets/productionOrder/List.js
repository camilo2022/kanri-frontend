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
  CirclePlus,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  ChevronUp,
  ArrowLeftCircle,
  FileDown,
  FileBox,
  SquareBottomDashedScissors,
} from 'lucide-react'
import no_data from '../../../../assets/images/no-data.png'
import { Toast } from '@/components/Toast'
import { useSelector } from 'react-redux'
import LoadingForm from '@/components/LoadingForm'

export const List = ({
  data,
  loading,
  fetchProductionOrders,
  onChangeView,
  errors,
  technical_sheet,
  pdf_production_order,
  pdf_technical_sheet,
}) => {
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
  const [showEditMenu, setShowEditMenu] = useState(null)

  useEffect(() => {
    if (!technical_sheet) return
    const handler = setTimeout(() => {
      const currentParams = { ...params, search: searchInput }
      technical_sheet && fetchProductionOrders(technical_sheet?.id, currentParams)
    }, 200)

    return () => clearTimeout(handler)
  }, [technical_sheet, params.page, params.per_page, params.column, params.dir, params.search])

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

  useEffect(() => {
    if (Object.keys(errors).length !== 0) {
      Toast.fire({
        icon: 'error',
        title: errors.message,
      })
    }
  }, [errors])

  const getStatusClass = (status) => {
    switch (status) {
      case 'Aprobado':
        return 'status-badge-approved'

      case 'En revision':
        return 'status-badge-review'

      case 'Pendiente':
        return 'status-badge-pending'

      case 'Cancelado':
        return 'status-badge-rejected'

      default:
        return 'status-badge-empty'
    }
  }

  const formattedData = data?.production_orders?.map((production_order) => {
    return {
      ...production_order,
      references: `${production_order.technical_sheet.product.code}${
        production_order.production_order_details.some((item) => item.destination === 'STARA')
          ? ` | ${production_order.technical_sheet.products[0].code}`
          : ''
      }`,
      consecutive: production_order.consecutive || '-',
      cut: production_order.cut || '-',
      total: production_order.production_order_details
        .find((item) => item.model_type === 'App\\Models\\Supply')
        ?.production_order_detail_quantities?.reduce((acc, item) => {
          return acc + item.quantity
        }, 0),
      status: (
        <div className={`status-badge ${getStatusClass(production_order.status)}`}>
          {production_order.status}
        </div>
      ),
      acciones: (
        <div className="d-flex gap-2 justify-content-center">
          <div className="position-relative">
            <CTooltip content="Editar" placement="top">
              <button
                className="action-btn edit-btn"
                disabled={
                  !!production_order.deleted_at ||
                  !user_active?.permissions.some((p) => p.name === 'products.find') ||
                  !user_active?.permissions.some((p) => p.name === 'products.update')
                }
                onClick={() =>
                  onChangeView({
                    name: 'edit',
                    title: 'Editar Orden de Producción',
                    production_order: production_order.id,
                  })
                }
              >
                <Pencil size={18} strokeWidth={1.5} />
              </button>
            </CTooltip>
          </div>
          <div className="position-relative">
            <CTooltip content="Descargar PDF Orden de Producción" placement="top">
              <button
                className="action-btn download-btn"
                disabled={
                  !!production_order.deleted_at ||
                  !user_active?.permissions.some((p) => p.name === 'products.find') ||
                  !user_active?.permissions.some((p) => p.name === 'products.update')
                }
                onClick={() => pdf_production_order(production_order.uuid)}
              >
                <SquareBottomDashedScissors size={18} strokeWidth={1.5} />
              </button>
            </CTooltip>
          </div>
          <div className="position-relative">
            <CTooltip content="Descargar PDF Ficha Técnica" placement="top">
              <button
                className="action-btn download-btn"
                disabled={
                  !!production_order.deleted_at ||
                  !user_active?.permissions.some((p) => p.name === 'products.find') ||
                  !user_active?.permissions.some((p) => p.name === 'products.update')
                }
                onClick={() => {
                  pdf_technical_sheet(production_order.uuid)
                }}
              >
                <FileBox size={18} strokeWidth={1.5} />
              </button>
            </CTooltip>
          </div>
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

  const columns = [
    {
      key: 'id',
      label: (
        <div className="sortable-header text-center" onClick={() => handleSort('id')}>
          #
          {params.column === 'id' &&
            (params.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      ),
    },
    {
      key: 'consecutive',
      label: <div className="text-center">Código</div>,
    },
    {
      key: 'cut',
      label: <div className="text-center">Lote</div>,
    },
    {
      key: 'references',
      label: <div className="text-center">Referencias</div>,
    },
    {
      key: 'total',
      label: <div className="text-center">Cantidad</div>,
    },
    {
      key: 'status',
      label: <div className="text-center">Estado</div>,
    },
    {
      key: 'acciones',
      label: <div className="sortable-header text-center">Acciones </div>,
    },
  ]

  const getProcessClass = (status) => {
    switch (status) {
      case 'Aprobado':
        return 'status-badge-approved'

      case 'Cancelado':
        return 'status-badge-rejected'

      case 'Pendiente':
        return 'status-badge-pending'

      default:
        return 'status-badge-empty'
    }
  }

  if (!technical_sheet || !data) {
    return (
      <LoadingForm
        title="Cargando ordenes de producción"
        subtitle="Un momento mientras se carga la información..."
        height="400px"
      />
    )
  }

  return (
    <>
      <CCard className="mb-4 p-4 shadow-sm border-0 animate-fade-in">
        <div className="d-flex align-items-center mb-3">
          <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
          <span className="fw-bold fs-5 font-montserrat">Ordenes de Producción</span>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex gap-2 w-50 ms-4">
            <CFormInput
              className="custom-input font-inter"
              placeholder="Buscar orden de producción..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
            />
          </div>
          <div className="d-flex">
            <CButton
              className="d-flex align-items-center gap-2 font-poppins  btn-primary-revolve me-2"
              onClick={() => {
                onChangeView({ name: 'back', title: 'Listar Productos' })
              }}
            >
              <ArrowLeftCircle size={16} /> Volver
            </CButton>
            <CButton
              variant="outline"
              className="me-2 font-poppins btn-primary-dark"
              disabled={
                !user_active?.permissions.some(
                  (p) => p.name === 'technical_sheets.production_orders.store',
                )
              }
              onClick={() => onChangeView({ name: 'create', title: 'Crear orden de producción' })}
            >
              <CirclePlus /> Crear Orden
            </CButton>
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
            {!data?.production_orders?.length && loading ? (
              <tr>
                <td colSpan="6" className="py-5 border-0">
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
      </CCard>
    </>
  )
}

export default List
