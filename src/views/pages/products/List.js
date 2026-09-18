import api from '../../../API/api'
import { getConfig } from '../../../axiosConfig'
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
  CModalFooter,
  CModalTitle,
  CModalBody,
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
  Plus,
  X,
  RefreshCcw,
  ClipboardList,
  FileDown,
  Recycle,
  ChartNetwork,
} from 'lucide-react'
import no_data from '../../../assets/images/no-data.png'
import { Toast } from '@/components/Toast'
import { useSelector } from 'react-redux'
import { tableSelectStyles } from '@/components/StyleManagementCollection'
import Select from 'react-select'
import ProductionOrders from '../ProductionOrders'
import { createPortal } from 'react-dom'

export const List = ({ data, processes, loading, fetchProducts, onChangeView, errors, status }) => {
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
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [showEditMenu, setShowEditMenu] = useState(null)
  const [showTransforMenu, setShowTransforMenu] = useState(null)
  const [changeStatus, setChangeStatus] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const [showProcessMenu, setShowProcessMenu] = useState(null)
  const [processMenuPosition, setProcessMenuPosition] = useState(null)

  useEffect(() => {
    const handler = setTimeout(() => {
      const currentParams = { ...params, search: searchInput }
      fetchProducts(currentParams)
    }, 200)

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

  useEffect(() => {
    if (Object.keys(errors).length !== 0) {
      Toast.fire({
        icon: 'error',
        title: errors.message,
      })
    }
  }, [errors])

  const update_status = async (id, data) => {
    try {
      const response = await api.put(`/technical_sheets/update/${id}`, data, getConfig())
      return response.data
    } catch (error) {
      console.log(error)
      throw error.response?.data || { message: 'Error desconocido' }
    }
  }

  const handleChangeStatus = async (id, status, product) => {
    try {
      const aux = {
        ...product.technical_sheet,
        status: status,
        supplies: Object.values(product.technical_sheet.supplies)
          .map((item) => item?.id)
          .filter(Boolean),
      }

      const res = await update_status(product.technical_sheet.id, aux)

      setChangeStatus(false)
      setSelectedProduct(null)
      setSelectedStatus(null)

      Toast.fire({
        icon: 'success',
        title: 'Estado de la ficha técnica actualizado',
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleShowProcessMenu = (productId, event) => {
    const rect = event.currentTarget.getBoundingClientRect()

    const menuWidth = 230
    const menuHeight = Math.min(processes.length * 42 + 12, 350)
    const gap = 6

    let top = rect.bottom + gap
    let left = rect.left

    if (top + menuHeight > window.innerHeight - 10) {
      top = rect.top - menuHeight - gap
    }

    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10
    }

    if (left < 10) {
      left = 10
    }

    if (showProcessMenu !== null) {
      setShowProcessMenu(null)
    } else {
      setShowProcessMenu(productId)
    }

    setProcessMenuPosition({
      top,
      left,
    })
  }

  const formattedData = data?.products?.map((product) => {
    const details =
      product.technical_sheet?.technical_sheet_details?.reduce((acc, detail) => {
        acc[`technical_sheet_detail_${detail.model_id}`] = detail.status
        return acc
      }, {}) || {}
    return {
      ...product,
      ...details,
      reference: product.code || '-',
      trademark: product.trademark?.name || '-',
      group: product.trademark?.group[0]?.name || '-',
      category: product.subcategory?.category[0]?.name || '-',
      subcategory: product.subcategory?.name || '-',
      technical_sheet_code: product.technical_sheet?.code ? product.technical_sheet?.code : '-',
      technical_sheet_consecutive: product.technical_sheet?.consecutive
        ? product.technical_sheet?.consecutive
        : '-',
      technical_sheet_collection: product.technical_sheet?.collection?.name
        ? `${product.technical_sheet.collection.name} - ${product.technical_sheet.collection.description ?? ''}`
        : '-',
      technical_sheet_photo_d:
        (
          <div className="d-flex justify-content-center align-items-center">
            {product.technical_sheet?.photo_d ? (
              <div
                style={{
                  width: '90px',
                  height: '102.5px',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  border: '1px solid #dee2e6',
                  background: '#fff',
                }}
              >
                <img
                  src={product.technical_sheet?.photo_d?.path}
                  alt="Foto Delantera"
                  onClick={() => setShowFullscreen(product.technical_sheet?.photo_d?.path)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    cursor: 'pointer',
                  }}
                />
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100">-</div>
            )}
          </div>
        ) || '-',
      technical_sheet_photo_t:
        (
          <div className="d-flex justify-content-center align-items-center">
            {product.technical_sheet?.photo_t ? (
              <div
                style={{
                  width: '90px',
                  height: '102.5px',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  border: '1px solid #dee2e6',
                  background: '#fff',
                }}
              >
                <img
                  src={product.technical_sheet?.photo_t?.path}
                  alt="Foto Trasera"
                  onClick={() => setShowFullscreen(product.technical_sheet?.photo_t?.path)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    cursor: 'pointer',
                  }}
                />
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100">-</div>
            )}
          </div>
        ) || '-',
      technical_sheet_garment_type: product.technical_sheet?.garment_type?.name || '-',
      technical_sheet_wash_tone: product.technical_sheet?.wash_tone?.name || '-',
      technical_sheet_boot_type: product.technical_sheet?.boot_type?.name || '-',
      technical_sheet_status: product.technical_sheet?.status || 'No definido',
      acciones: (
        <div className="d-flex gap-2 justify-content-center">
          <div className="position-relative">
            <CTooltip content="Editar" placement="top">
              <button
                className="action-btn edit-btn"
                disabled={
                  !!product.deleted_at ||
                  !user_active?.permissions.some((p) => p.name === 'products.find') ||
                  !user_active?.permissions.some((p) => p.name === 'products.update') ||
                  !product.original
                }
                onClick={() => {
                  if (showEditMenu === product.id) {
                    setShowEditMenu(null)
                    setShowProcessMenu(null)
                    setProcessMenuPosition(null)
                  } else {
                    setShowEditMenu(product.id)
                    setShowProcessMenu(null)
                    setProcessMenuPosition(null)
                  }
                }}
              >
                <Pencil size={18} strokeWidth={1.5} />
              </button>
            </CTooltip>
            {showEditMenu === product.id && (
              <div className="edit-menu">
                <button
                  className="edit-menu-item"
                  onClick={() => {
                    setShowEditMenu(null)
                    onChangeView({
                      name: 'edit',
                      title: 'Editar Producto',
                      product: product,
                    })
                  }}
                >
                  <Pencil size={16} />
                  <span>Editar producto</span>
                </button>
                {!!product.technical_sheet && (
                  <>
                    <button
                      className="edit-menu-item"
                      onClick={() => {
                        setShowEditMenu(null)
                        onChangeView({
                          name: 'technical_sheet',
                          title: 'Editar Ficha Técnica',
                          product: product,
                          action: 'edit_technical_sheet',
                        })
                      }}
                    >
                      <FileText size={16} />
                      <span>Editar ficha técnica</span>
                    </button>
                    <button
                      className="edit-menu-item process-menu-trigger"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleShowProcessMenu(product.id, event)
                      }}
                    >
                      <ChartNetwork size={16} />
                      <span>Editar proceso</span>
                      <ChevronRight size={14} className="ms-auto" />
                    </button>
                  </>
                )}
              </div>
            )}
            {showProcessMenu === product.id &&
              processMenuPosition &&
              createPortal(
                <div
                  className="process-submenu"
                  style={{
                    position: 'fixed',
                    top: `${processMenuPosition.top}px`,
                    left: `${processMenuPosition.left}px`,
                    zIndex: 999999999,
                  }}
                >
                  {processes.map((process, index) => (
                    <button
                      key={process.key ?? process.id ?? index}
                      className="process-submenu-item"
                      onClick={(event) => {
                        event.stopPropagation()

                        setShowProcessMenu(null)
                        setProcessMenuPosition(null)
                        setShowEditMenu(null)

                        onChangeView({
                          name: 'technical_sheet',
                          title: `Editar Proceso ${process.label}`,
                          product: product,
                          process: process,
                          action: 'edit_process',
                        })
                      }}
                    >
                      <span className="process-number">{index + 1}</span>
                      {console.log(process)}
                      <span>{process.label}</span>
                    </button>
                  ))}
                </div>,
                document.body,
              )}
          </div>
          <CTooltip content="Agregar Ficha Tecnica" placement="top">
            <button
              className="action-btn show-btn"
              hidden={product.technical_sheet}
              disabled={
                !!product.deleted_at ||
                !user_active?.permissions.some((p) => p.name === 'products.find') ||
                !user_active?.permissions.some((p) => p.name === 'products.update')
              }
              onClick={() =>
                onChangeView({
                  name: 'technical_sheet',
                  title: 'Crear Ficha Técnica',
                  product: product,
                  action: 'create_technical_sheet',
                })
              }
            >
              <Plus size={18} strokeWidth={1.5} />
            </button>
          </CTooltip>
          <CTooltip content="Cambiar Estado de Ficha Técnica" placement="top">
            <button
              className="action-btn gestion-btn"
              hidden={!product.technical_sheet}
              disabled={
                !!product.deleted_at ||
                !user_active?.permissions.some((p) => p.name === 'products.find') ||
                !user_active?.permissions.some((p) => p.name === 'products.update') ||
                !product.original
              }
              onClick={() => {
                setChangeStatus(true)
                setSelectedStatus(product.technical_sheet.status)
                setSelectedProduct(product)
              }}
            >
              <RefreshCcw size={18} strokeWidth={1.5} />
            </button>
          </CTooltip>
          {!!product.technical_sheet && product.technical_sheet.production_orders?.length > 0 && (
            <div className="position-relative">
              <CTooltip content="Transformar" placement="top">
                <button
                  className="action-btn btn-teal"
                  disabled={
                    !!product.deleted_at ||
                    !user_active?.permissions.some((p) => p.name === 'products.find') ||
                    !user_active?.permissions.some((p) => p.name === 'products.update') ||
                    !product.original
                  }
                  onClick={() =>
                    setShowTransforMenu(showTransforMenu === product.id ? null : product.id)
                  }
                >
                  <Recycle size={18} strokeWidth={1.5} />
                </button>
              </CTooltip>
              {showTransforMenu === product.id && (
                <div className="transfor-menu">
                  {product.technical_sheet.production_orders.map((production_order) => {
                    return (
                      <button
                        key={production_order.id}
                        className="transfor-menu-item"
                        onClick={() => {
                          setShowTransforMenu(null)
                          onChangeView({
                            name: 'transformation',
                            title: 'Crear Transformación',
                            product: product,
                            production_order: production_order.id,
                            action: 'create',
                          })
                        }}
                      >
                        <Recycle size={16} />
                        <span>{`Lote ${production_order.cut}`} </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
          <CTooltip content="Listar ordenes de producción" placement="top">
            <button
              className="action-btn restore-btn"
              hidden={!product.technical_sheet}
              disabled={
                !!product.deleted_at ||
                !user_active?.permissions.some((p) => p.name === 'products.find') ||
                !user_active?.permissions.some((p) => p.name === 'products.update') ||
                !product.original
              }
              onClick={() => {
                onChangeView({
                  name: 'technical_sheet',
                  title: 'Listar ordenes de producción',
                  product: product,
                  action: 'list_production_orders',
                })
              }}
            >
              <ClipboardList size={18} strokeWidth={1.5} />
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

  const headers = [
    {
      title: 'Información del Producto',
      columns: [
        { key: 'id', label: '#' },
        { key: 'code', label: 'Referencia' },
        { key: 'trademark', label: 'Marca' },
        { key: 'group', label: 'Grupo' },
        { key: 'category', label: 'Categoría' },
        { key: 'subcategory', label: 'Subcategoría' },
      ],
    },
    {
      title: 'Información de la Ficha Técnica',
      columns: [
        { key: 'technical_sheet_code', label: 'Código' },
        { key: 'technical_sheet_consecutive', label: 'Consecutivo' },
        { key: 'technical_sheet_collection', label: 'Colección' },
        { key: 'technical_sheet_photo_d', label: 'Foto Delantera' },
        { key: 'technical_sheet_photo_t', label: 'Foto Trasera' },
        { key: 'technical_sheet_garment_type', label: 'Tipo Prenda' },
        { key: 'technical_sheet_wash_tone', label: 'Tono Lavado' },
        { key: 'technical_sheet_boot_type', label: 'Tipo Bota' },
        { key: 'technical_sheet_status', label: 'Estado' },
      ],
    },
    {
      title: 'Procesos',
      columns: processes,
    },
  ]

  const columns = headers.flatMap((header) => header.columns)
  const dataColumns = headers.filter((header) => header.title).flatMap((header) => header.columns)

  const getProcessClass = (status) => {
    switch (status) {
      case 'Aprobado':
        return 'status-badge-approved'

      case 'En revision':
        return 'status-badge-review'

      case 'Pendiente':
        return 'status-badge-pending'

      default:
        return 'status-badge-empty'
    }
  }

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!showEditMenu && !showProcessMenu) return

      const clickedInsideMenu =
        event.target.closest('.edit-menu') ||
        event.target.closest('.process-submenu') ||
        event.target.closest('.edit-btn')

      if (!clickedInsideMenu) {
        setShowEditMenu(null)
        setShowProcessMenu(null)
        setProcessMenuPosition(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEditMenu, showProcessMenu])

  return (
    <>
      <CCard className="mb-4 p-4 shadow-sm border-0 animate-fade-in">
        <div className="d-flex align-items-center mb-3">
          <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
          <span className="fw-bold fs-5 font-montserrat">Productos</span>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex gap-2 w-50 ms-4">
            <CFormInput
              className="custom-input font-inter"
              placeholder="Buscar productos..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
            />
          </div>
          <CButton
            variant="outline"
            className="me-2 font-poppins btn-primary-dark"
            disabled={!user_active?.permissions.some((p) => p.name === 'products.store')}
            onClick={() => onChangeView({ name: 'create', title: 'Crear Producto' })}
          >
            <CirclePlus /> Agregar Producto
          </CButton>
        </div>
        <CTable
          hover
          responsive
          align="middle"
          className="text-center font-inter technical-sheet-table"
        >
          <thead>
            <tr>
              {headers
                .filter((header) => header.title)
                .map((header) => (
                  <th key={header.title} colSpan={header.columns.length} className="group-header">
                    {header.title}
                  </th>
                ))}
              <th rowSpan={2} className="group-actions sticky-actions-products">
                Acciones
              </th>
            </tr>
            <tr>
              {columns.map((column, index) => (
                <th key={index} className={index === 5 || index === 14 ? 'group-divider' : ''}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading || !formattedData ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-5 border-0">
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
              formattedData?.map((item, index) => (
                <tr key={index}>
                  {dataColumns.map((column, colIndex) => {
                    const isPhoto = ['photo_d', 'photo_t'].some((suffix) =>
                      String(column.key).endsWith(suffix),
                    )
                    const isProcess = String(column.key).startsWith('technical_sheet_detail')
                    return (
                      <td
                        key={column.key}
                        className={colIndex === 5 || colIndex === 14 ? 'group-divider' : ''}
                      >
                        {isProcess ? (
                          <div className={`status-badge ${getProcessClass(item[column.key])}`}>
                            {item[column.key] || 'No asociado'}
                          </div>
                        ) : column.key === 'technical_sheet_status' ? (
                          <div className={`status-badge ${getStatusClass(item[column.key])}`}>
                            {item[column.key] || 'No asociado'}
                          </div>
                        ) : (
                          item[column.key]
                        )}
                      </td>
                    )
                  })}
                  <td className="actions-column sticky-actions-products">{item.acciones}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="text-muted p-4">
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
      {showFullscreen && (
        <div
          onClick={() => setShowFullscreen()}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.9)',
            zIndex: 99999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          <button
            onClick={() => setShowFullscreen()}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              border: 'none',
              background: 'rgba(255,255,255,.15)',
              color: '#fff',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
            className="style-btn-action-image"
          >
            <X size={20} />
          </button>
          <img
            src={showFullscreen}
            alt="preview"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '95vw',
              maxHeight: '95vh',
              objectFit: 'contain',
              borderRadius: '12px',
            }}
          />
        </div>
      )}
      <CModal
        visible={changeStatus}
        onClose={() => {
          setChangeStatus(false)
          setSelectedProduct(null)
          setSelectedStatus(null)
        }}
        alignment="center"
        className="font-montserrat"
      >
        <CModalHeader style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <CModalTitle style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
            Cambiar Estado
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <div className="mb-3">
            <label
              className="form-label font-inter fw-semibold mb-2"
              style={{ fontSize: '0.85rem', color: '#334155' }}
            >
              Selecciona el nuevo estado de la ficha técnica:
            </label>
            <Select
              options={
                Array.isArray(status)
                  ? status.map((item) => ({
                      value: item,
                      label: item,
                    }))
                  : []
              }
              value={
                selectedStatus
                  ? {
                      value: selectedStatus,
                      label: selectedStatus,
                    }
                  : null
              }
              onChange={(option) => setSelectedStatus(option.value)}
              placeholder="Buscar o seleccionar estado..."
              isSearchable
              styles={{
                ...tableSelectStyles,
                control: (provided, state) => ({
                  ...provided,
                  minHeight: '40px',
                  borderRadius: '10px',
                  border: state.isFocused ? '1px solid #24247f' : '1px solid #E2E8F0',
                  boxShadow: state.isFocused ? '0 0 0 3px rgba(36, 36, 127, 0.12)' : 'none',
                }),
                valueContainer: (provided) => ({ ...provided, padding: '0 12px' }),
                indicatorsContainer: (provided) => ({ ...provided, opacity: 1 }),
              }}
            />
          </div>
        </CModalBody>
        <CModalFooter style={{ borderTop: '1px solid #E2E8F0', gap: '8px' }}>
          <CButton
            color="secondary"
            size="sm"
            className="font-inter fw-medium"
            onClick={() => {
              setChangeStatus(false)
              setSelectedProduct(null)
              setSelectedStatus(null)
            }}
          >
            Cancelar
          </CButton>
          <CButton
            size="sm"
            className="font-inter fw-semibold px-3 text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: '#24247f', border: 'none' }}
            onClick={() => handleChangeStatus(selectedDetail, selectedStatus, selectedProduct)}
          >
            <RefreshCcw size={14} />
            Cambiar Estado
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default List
