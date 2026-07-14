import api from '../../../../API/api'
import { getConfig } from '../../../../axiosConfig'
import { useState } from 'react'
import {
  CCard,
  CButton,
  CFormSelect,
  CRow,
  CCol,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CTooltip,
  CPagination,
  CPaginationItem,
  CFormCheck,
} from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import { useEffect } from 'react'
import {
  ArrowLeftCircle,
  Save,
  Trash2,
  Plus,
  Clipboard,
  ChevronDown,
  ChevronUp,
  FileText,
  ChevronsLeft,
  ChevronLeft,
  Pencil,
  RotateCcw,
  CirclePlus,
  ChevronsRight,
  ChevronRight,
} from 'lucide-react'
import LoadingForm from '@/components/LoadingForm'
import { useRef } from 'react'
import InformationProductionOrder from '@/components/InformationProductionOrder'
import TablePieces from '@/components/TablePieces'
import TableRolls from '@/components/TableRolls'
import TableCurveSpecifications from '@/components/TableCurveSpecifications'
import TableCurveGroupings from '@/components/TableCurveGroupings'
import TechnicalSheetDetailAux from '@/components/TechnicalSheetDetailAux'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'
import no_data from '../../../../assets/images/no-data.png'

export const Create = ({
  technical_sheet,
  status_orders,
  fabrics,
  fetchFabrics,
  pieces,
  rolls,
  fetchRolls,
  supply_type,
  loading_rolls,
  products,
  fetchProducts,
  product,
  sizes,
  fabric,
  findFabric,

  fetchCollections,
  collections,
  fetchSubgroups,
  subgroups,
  fetchGarmentTypes,
  garment_types,
  fetchWashTones,
  wash_tones,
  fetchColors,
  colors,
  fetchBackTypes,
  back_types,
  fetchBootTypes,
  boot_types,
  fetchYokeTypes,
  yoke_types,
  fetchWaistbandTypes,
  waistband_types,
  fetchEmployees,
  employees,
  processes,
  supply_types,
  variants,
  onChangeView,
  create,
  errors,
  models,
  statusCollection,
  statusTechnical,
}) => {
  console.log(fabric)
  const [validated, setValidated] = useState(false)
  const [modalPaste, setModalPaste] = useState(false)
  const [modalAddRoll, setModalAddRoll] = useState(false)
  const [pasteData, setPasteData] = useState('')
  const [previewRows, setPreviewRows] = useState([])
  const [formData, setFormData] = useState({
    technical_sheet_id: technical_sheet?.id || '',
  })
  const [piecesAux, setPiecesAux] = useState({})
  const [rollsAux, setRollsAux] = useState({})
  const [paramsRolls, setParamsRolls] = useState({
    search: '',
    per_page: 10,
    page: 1,
    column: 'id',
    dir: 'asc',
    with_trashed: true,
  })
  const [searchInputRolls, setSearchInputRolls] = useState('')
  const [selectedRolls, setSelectedRolls] = useState({})

  const [data, setData] = useState(null)

  useEffect(() => {
    if (!sizes || !product) return

    setData(
      [
        {
          location: 'NACIONAL',
          reference: product.code,
        },
        {
          location: 'MEDELLIN',
          reference: product.code,
        },
        {
          location: 'STARA',
          reference: '',
        },
      ].map((item) => ({
        ...item,
        sizes: sizes.reduce((acc, size) => {
          acc[size.id] = {
            id: size.id,
            name: size.name,
            quantity: 0,
          }

          return acc
        }, {}),
      })),
    )
  }, [sizes, product])

  useEffect(() => {
    const handler = setTimeout(() => {
      const currentParams = { ...paramsRolls, search: searchInputRolls }
      fetchRolls(400, currentParams)
    }, 500)

    return () => clearTimeout(handler)
  }, [
    paramsRolls.page,
    paramsRolls.per_page,
    paramsRolls.column,
    paramsRolls.dir,
    paramsRolls.search,
  ])

  useEffect(() => {
    const handler = setTimeout(() => {
      setParamsRolls((prev) => ({
        ...prev,
        search: searchInputRolls,
        page: 1,
      }))
    }, 500)

    return () => clearTimeout(handler)
  }, [searchInputRolls])

  const handleSubmit = async (data) => {
    Swal.fire({
      title: 'Crear Ficha Técnica',
      html: `<div style="font-size:14px">
                  Se guardará la información de la ficha técnica del producto en el sistema.<br/>
                  <strong>¿Deseas continuar?</strong>
                </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, crear',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await create(data)
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setTimeout(() => {
            onChangeView({ name: 'back', title: 'Listar Productos' })
          }, 2510)
        } catch (error) {
          setValidated(true)
        }
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Acción cancelada',
        })
      }
    })
  }

  const handlePasteChange = (e) => {
    const text = e.target.value
    setPasteData(text)

    if (!text.trim()) {
      setPreviewRows([])
      return
    }

    const lines = text.split(/\r?\n/)
    const parsed = lines
      .map((line) => {
        if (!line.trim()) return null
        const columns = line.split('\t')
        return {
          piece: columns[0] || '',
          quantity: columns[1] || '1',
        }
      })
      .filter(Boolean)

    setPreviewRows(parsed)
  }

  const handleInsert = () => {
    if (previewRows.length === 0) {
      Toast.fire({ icon: 'warning', title: 'No hay datos válidos para insertar' })
      return
    }

    const filter_preview = previewRows
      .filter((item) =>
        Object.values(pieces).some(
          (aux) => aux.label?.trim().toLowerCase() === item.piece?.trim().toLowerCase(),
        ),
      )
      .map((item) => ({
        piece: Object.values(pieces).find(
          (aux) => aux.label?.trim().toLowerCase() === item.piece?.trim().toLowerCase(),
        )?.value,
        quantity: item.quantity,
      }))

    setPiecesAux((prev) => {
      const aux = { ...prev }

      let ids = Object.keys(aux).map(Number)
      let nextId = ids.length === 0 ? 1 : Math.max(...ids) + 1

      filter_preview.forEach((row) => {
        const existingKey = Object.keys(aux).find((key) => aux[key].piece === row.piece)

        if (existingKey !== undefined) {
          aux[existingKey] = {
            piece: row.piece,
            quantity: row.quantity,
          }
        } else {
          aux[nextId] = {
            piece: row.piece,
            quantity: row.quantity,
          }
          nextId++
        }
      })

      return aux
    })

    setModalPaste(false)
    setPasteData('')
    setPreviewRows([])

    Toast.fire({
      icon: 'success',
      title: `Se agregaron ${previewRows.length} filas correctamente`,
    })
  }

  const dataGet = (path, data, defaultValue = undefined, separator = ' ') => {
    const getSingleValue = (singlePath) => {
      if (!singlePath) return undefined

      return singlePath
        .replace(/\[(\w+)\]/g, '.$1')
        .replace(/^\./, '')
        .split('.')
        .reduce((acc, key) => {
          if (acc === null || acc === undefined) {
            return undefined
          }

          return acc[key]
        }, data)
    }

    if (Array.isArray(path)) {
      const values = path
        .map((p) => getSingleValue(p))
        .filter((value) => value !== undefined && value !== null && value !== '')
      return values.length ? values.join(separator) : defaultValue
    }

    return getSingleValue(path) ?? defaultValue
  }

  const formattedData = rolls?.variants
    .filter((item) => item.variant_id.id === formData.fabric_id)
    .filter((item) => !Object.keys(rollsAux || {}).includes(String(item.id)))
    .map((variant) => {
      const dynamicFields =
        supply_type?.settings?.form
          ?.filter((item) => item.type !== 'selectdinamic' || item.cardinality === 'single')
          ?.reduce((acc, item) => {
            const value =
              item.cardinality === 'single'
                ? dataGet(item.path, variant[item.field], '')
                : variant.settings?.values?.[item.field]

            acc[item.field] = value || '-'

            return acc
          }, {}) ?? {}
      return {
        ...variant,
        available: dynamicFields.meters - 10,
        used: dynamicFields.meters - 10,
        roll:
          variant.name && variant.description ? `${variant.name} - ${variant.description}` : '-',
        ...dynamicFields,
      }
    })
  const handleSort = (column) => {
    setParams((prev) => ({
      ...prev,
      column: column,
      dir: prev.column === column && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  const dynamicColumns =
    supply_type?.settings?.form
      ?.filter((item) => item.type !== 'selectdinamic' || item.cardinality === 'single')
      ?.map((item) => ({
        key: item.field,
        label: (
          <div className="sortable-header text-center" onClick={() => handleSort(item.field)}>
            {item.label?.toUpperCase()}
            {paramsRolls.column === item.field &&
              (paramsRolls.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
          </div>
        ),
      })) ?? []

  const columns = [
    {
      key: 'id',
      label: (
        <div className="sortable-header text-center" onClick={() => handleSort('id')}>
          #{' '}
          {paramsRolls.column === 'id' &&
            (paramsRolls.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      ),
    },
    {
      key: 'name',
      label: (
        <div className="sortable-header text-center" onClick={() => handleSort('name')}>
          NOMBRE{' '}
          {paramsRolls.column === 'name' &&
            (paramsRolls.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      ),
    },
    {
      key: 'description',
      label: (
        <div className="sortable-header text-center" onClick={() => handleSort('description')}>
          DESCRIPCIÓN{' '}
          {paramsRolls.column === 'description' &&
            (paramsRolls.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      ),
    },
    ...dynamicColumns,
  ]

  const totalPages = rolls?.meta?.pagination?.total_pages || 1
  const currentPage = paramsRolls.page

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

  if (!supply_type || !sizes || !product) {
    return (
      <LoadingForm
        title="Cargando variantes"
        subtitle="Un momento mientras se carga la información..."
        height="400px"
      />
    )
  }

  const handleSelectRow = (item) => {
    if (Object.keys(selectedRolls).includes(String(item.id))) {
      setSelectedRolls((prev) => {
        const { [item.id]: deleted, ...rest } = prev
        return rest
      })
    } else {
      setSelectedRolls((prev) => ({
        ...prev,
        [item.id]: item,
      }))
    }
  }

  const handleInsertRolls = (new_rolls) => {
    setRollsAux((prev) => ({
      ...prev,
      ...new_rolls,
    }))
    setModalAddRoll(false)
    setSelectedRolls([])
  }

  return (
    <CCard className="mb-3 p-4 shadow-sm border-0 animate-fade-in">
      <div className="d-flex align-items-center mb-3">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Crear Orden de Producción</span>
      </div>
      <CRow className="g-3 mt-1">
        <CCol md={4}>
          <div
            className="p-3 rounded-3 text-center border-0 style-kpi-card"
            style={{ backgroundColor: '#f8fafc' }}
          >
            <small className="text-muted font-inter fw-semibold d-block mb-1">METROS REALES</small>
            <span className="fs-4 fw-bold text-dark font-montserrat">{0} m</span>
          </div>
        </CCol>
        <CCol md={4}>
          <div
            className="p-3 rounded-3 text-center border-0 style-kpi-card"
            style={{ backgroundColor: '#f8fafc' }}
          >
            <small className="text-muted font-inter fw-semibold d-block mb-1">PROMEDIO</small>
            <span className="fs-4 fw-bold text-dark font-montserrat">{0}</span>
          </div>
        </CCol>
        <CCol md={4}>
          <div
            className="p-3 rounded-3 text-center border-0 style-kpi-card"
            style={{ backgroundColor: '#f8fafc' }}
          >
            <small className="text-muted font-inter fw-semibold d-block mb-1">CANTIDAD CM²</small>
            <span className="fs-4 fw-bold text-dark font-montserrat">{0} cm²</span>
          </div>
        </CCol>
      </CRow>
      <InformationProductionOrder
        technical_sheet={technical_sheet}
        status_orders={status_orders}
        fabrics={fabrics}
        fetchFabrics={fetchFabrics}
        errors={errors}
        validated={validated}
        formData={formData}
        setFormData={setFormData}
        findFabric={findFabric}
      />
      <TablePieces
        pieces={pieces}
        piecesAux={piecesAux}
        setPiecesAux={setPiecesAux}
        modalPaste={modalPaste}
        setModalPaste={setModalPaste}
      />
      <TableRolls
        supply_type={supply_type}
        piecesAux={piecesAux}
        setPiecesAux={setPiecesAux}
        rollsAux={rollsAux}
        setRollsAux={setRollsAux}
        modalAddRoll={modalAddRoll}
        setModalAddRoll={setModalAddRoll}
        rolls={rolls}
        fetchRolls={fetchRolls}
        fabric_id={formData.fabric_id}
      />
      <TableCurveSpecifications
        supply_type={supply_type}
        piecesAux={piecesAux}
        setPiecesAux={setPiecesAux}
        rollsAux={rollsAux}
        setRollsAux={setRollsAux}
        modalAddRoll={modalAddRoll}
        setModalAddRoll={setModalAddRoll}
        rolls={rolls}
        fetchRolls={fetchRolls}
        fabric_id={formData.fabric_id}
        products={products}
        fetchProducts={fetchProducts}
        product={product}
        sizes={sizes}
        technical_sheet={technical_sheet}
        data={data}
        setData={setData}
      />
      <TableCurveGroupings
        supply_type={supply_type}
        piecesAux={piecesAux}
        setPiecesAux={setPiecesAux}
        rollsAux={rollsAux}
        setRollsAux={setRollsAux}
        modalAddRoll={modalAddRoll}
        setModalAddRoll={setModalAddRoll}
        rolls={rolls}
        fetchRolls={fetchRolls}
        fabric_id={formData.fabric_id}
        products={products}
        fetchProducts={fetchProducts}
        product={product}
        sizes={sizes}
        technical_sheet={technical_sheet}
        data={data}
        fabric={fabric}
      />
      <CModal
        visible={modalPaste}
        onClose={() => {
          setModalPaste(false)
          setPreviewRows([])
          setPasteData('')
        }}
        alignment="center"
        className="font-montserrat"
        size="lg"
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
            Insertar filas
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="row g-4">
            <div className={previewRows.length > 0 ? 'col-md-5' : 'col-md-12'}>
              <CFormTextarea
                rows={12}
                value={pasteData}
                onChange={handlePasteChange}
                placeholder="Pegar información aquí..."
                className="font-inter h-100"
                style={{ minHeight: '250px', resize: 'none' }}
              />
            </div>
            {previewRows.length > 0 && (
              <div className="col-md-7 border-start ps-4">
                <h6 className="font-poppins text-dark border-bottom pb-2 mb-2 d-flex justify-content-between align-items-center">
                  <span>Vista previa</span>
                  <span
                    className="badge bg-primary rounded-pill small"
                    style={{ fontSize: '12px' }}
                  >
                    {previewRows.length} filas detectadas
                  </span>
                </h6>
                <div className="mb-2 small text-muted lh-sm d-flex align-items-start gap-2">
                  <span
                    style={{
                      display: 'inline-block',
                      width: 14,
                      height: 14,
                      backgroundColor: '#f5b4b4',
                      border: '1px solid #ccc',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <span>
                    Las filas resaltadas corresponden a piezas que no están registradas en el
                    sistema.
                  </span>
                </div>

                <div
                  className="table-responsive border rounded"
                  style={{ maxHeight: '280px', overflowY: 'auto' }}
                >
                  <CTable striped hover align="middle" size="sm" className="mb-0">
                    <CTableHead
                      className="bg-light"
                      style={{ position: 'sticky', top: 0, zIndex: 1 }}
                    >
                      <CTableRow>
                        <CTableHeaderCell className="p-2">Pieza</CTableHeaderCell>
                        <CTableHeaderCell className="p-2" style={{ width: '120px' }}>
                          Cantidad
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {previewRows.map((row, idx) => {
                        const exists = Object.values(pieces ?? {}).some(
                          (item) =>
                            item.label?.trim().toLowerCase() === row.piece?.trim().toLowerCase(),
                        )
                        return (
                          <CTableRow key={idx}>
                            <CTableDataCell
                              className="p-2 text-truncate"
                              style={{
                                maxWidth: '220px',
                                background: exists ? '#ffffff' : '#f5b4b4',
                              }}
                            >
                              {row.piece || <span className="text-danger style-italic">Vacío</span>}
                            </CTableDataCell>
                            <CTableDataCell
                              className="p-2 fw-bold"
                              style={{
                                background: exists ? '#ffffff' : '#f5b4b4',
                              }}
                            >
                              {row.quantity || (
                                <span className="text-danger style-italic">Vacío</span>
                              )}
                            </CTableDataCell>
                          </CTableRow>
                        )
                      })}
                    </CTableBody>
                  </CTable>
                </div>
              </div>
            )}
          </div>
        </CModalBody>
        <CModalFooter className="mt-2">
          <CButton
            color="secondary"
            size="sm"
            onClick={() => {
              setModalPaste(false)
              setPreviewRows([])
              setPasteData('')
            }}
          >
            Cancelar
          </CButton>
          <CButton
            size="sm"
            className="text-white d-flex align-items-center gap-2"
            style={{
              backgroundColor: '#24247F',
              border: 'none',
            }}
            disabled={previewRows.length === 0}
            onClick={handleInsert}
          >
            Confirmar e Ingresar Datos
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal
        visible={modalAddRoll}
        onClose={() => {
          setModalAddRoll(false)
          setSelectedRolls([])
        }}
        alignment="center"
        className="font-montserrat"
        size="xl"
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
            Listado de Rollos Disponibles
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="px-4 py-3">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="position-relative w-50">
              <CFormInput
                className="custom-input font-inter shadow-sm"
                placeholder="Buscar rollo..."
                value={searchInputRolls}
                onChange={(e) => setSearchInputRolls(e.target.value)}
                style={{ borderRadius: '6px' }}
              />
            </div>
            {selectedRolls.length > 0 && (
              <span className="badge bg-primary-subtle text-primary border border-primary-grow small font-poppins px-3 py-2 rounded">
                {selectedRolls.length} seleccionados
              </span>
            )}
          </div>

          <div
            className="table-responsive border rounded shadow-sm mb-4 bg-white"
            style={{ maxHeight: '400px' }}
          >
            <CTable hover align="middle" className="text-center font-inter mb-0 border-0">
              <CTableHead
                style={{ backgroundColor: '#F8FAFC', position: 'sticky', top: 0, zIndex: 2 }}
              >
                <CTableRow className="border-bottom border-light">
                  <CTableHeaderCell
                    className="py-3 px-3 text-center"
                    style={{ width: '50px' }}
                  ></CTableHeaderCell>
                  {columns.map((col) => (
                    <CTableHeaderCell
                      className="py-3 px-2 text-dark fw-bold text-nowrap"
                      key={col.key}
                    >
                      {col.label}
                    </CTableHeaderCell>
                  ))}
                  <CTableHeaderCell className="py-3 px-2 text-dark fw-bold text-nowrap">
                    UTILIZADOS
                  </CTableHeaderCell>
                  <CTableHeaderCell className="py-3 px-2 text-dark fw-bold text-nowrap">
                    DISPONIBLES
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {loading_rolls ? (
                  <CTableRow>
                    <CTableDataCell colSpan={columns.length + 3} className="py-5 border-0">
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
                    </CTableDataCell>
                  </CTableRow>
                ) : formattedData?.length > 0 ? (
                  formattedData.map((item, index) => {
                    const isChecked = Object.keys(selectedRolls).includes(String(item.id))

                    const metrosTotales = parseFloat(item.meters || 0)
                    const utilizados = 0
                    const disponibles = metrosTotales - utilizados

                    return (
                      <CTableRow
                        key={index}
                        className={
                          isChecked ? 'table-active border-light transition-all' : 'border-light'
                        }
                        style={{ transition: 'background-color 0.15s ease-in-out' }}
                      >
                        <CTableDataCell className="p-3 text-center">
                          <CFormCheck
                            checked={isChecked}
                            onChange={() => handleSelectRow(item)}
                            style={{ cursor: 'pointer' }}
                          />
                        </CTableDataCell>
                        {columns.map((col) => (
                          <CTableDataCell className="p-3 text-secondary" key={col.key}>
                            {item[col.key] || <span className="text-muted italic small">-</span>}
                          </CTableDataCell>
                        ))}
                        <CTableDataCell className="p-3 text-dark fw-medium">
                          {utilizados} m
                        </CTableDataCell>
                        <CTableDataCell className="p-3 text-success fw-bold">
                          {disponibles > 0 ? `${disponibles} m` : 'Agotado'}
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })
                ) : (
                  <CTableRow>
                    <CTableDataCell
                      colSpan={columns.length + 3}
                      className="text-muted py-5 border-0 bg-white"
                    >
                      <img src={no_data} className="img-fluid" style={{ maxHeight: '110px' }} />
                      <div className="mt-3 text-secondary small">No hay datos para mostrar</div>
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
          <CRow className="align-items-center bg-light p-2 rounded border border-light mx-0 shadow-sm">
            <CCol xs={12} md={4}>
              <div className="d-flex align-items-center gap-2 text-muted small font-poppins px-2">
                Ver
                <CFormSelect
                  size="sm"
                  style={{ width: '75px', borderRadius: '4px' }}
                  value={paramsRolls.per_page}
                  onChange={(e) =>
                    setParamsRolls({ ...paramsRolls, per_page: e.target.value, page: 1 })
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
              <CPagination size="sm" aria-label="Navegación de páginas" className="mb-0">
                <CPaginationItem
                  disabled={currentPage === 1}
                  onClick={() => setParamsRolls((prev) => ({ ...prev, page: 1 }))}
                >
                  <ChevronsLeft size={14} />
                </CPaginationItem>
                <CPaginationItem
                  disabled={currentPage === 1}
                  onClick={() => setParamsRolls((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  <ChevronLeft size={14} />
                </CPaginationItem>
                {start > 1 && <CPaginationItem disabled>...</CPaginationItem>}
                {pages.map((p) => (
                  <CPaginationItem
                    key={p}
                    active={p === currentPage}
                    onClick={() => setParamsRolls((prev) => ({ ...prev, page: p }))}
                    style={{ cursor: 'pointer' }}
                  >
                    {p}
                  </CPaginationItem>
                ))}
                {end < totalPages && <CPaginationItem disabled>...</CPaginationItem>}
                <CPaginationItem
                  disabled={currentPage === totalPages}
                  onClick={() => setParamsRolls((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  <ChevronRight size={14} />
                </CPaginationItem>
                <CPaginationItem
                  disabled={currentPage === totalPages}
                  onClick={() => setParamsRolls((prev) => ({ ...prev, page: totalPages }))}
                >
                  <ChevronsRight size={14} />
                </CPaginationItem>
              </CPagination>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter className="mt-2">
          <CButton
            color="secondary"
            size="sm"
            onClick={() => {
              setModalAddRoll(false)
              setSelectedRolls([])
            }}
          >
            Cancelar
          </CButton>
          <CButton
            size="sm"
            className="text-white d-flex align-items-center gap-2"
            style={{
              backgroundColor: '#24247F',
              border: 'none',
            }}
            disabled={Object.values(selectedRolls).length === 0}
            onClick={() => handleInsertRolls(selectedRolls)}
          >
            Agregar Rollo(s) ({Object.values(selectedRolls).length})
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default Create
