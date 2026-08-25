import React, { useState, useEffect, useRef } from 'react'
import {
  CFormInput,
  CTooltip,
  CButton,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CCol,
  CFormLabel,
  CFormFeedback,
  CPopover,
  CFormCheck,
} from '@coreui/react'
import { createPortal } from 'react-dom'
import {
  X,
  RefreshCw,
  Trash2,
  ArrowRightLeft,
  Plus,
  TextInitial,
  Save,
  BadgeCheck,
  BadgeAlert,
  Edit,
  CircleX,
} from 'lucide-react'
import Select from 'react-select'
import {
  getSelectStylesInsertUniq,
  tableSelectStyles,
} from '@/components/StyleManagementCollection'
import ModalAddReassignmentCurveProgramation from './ModalAddReassignmentCurveProgramation'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'

const selectStylesWithPortal = {
  ...tableSelectStyles,
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
}

const ProductionOrderRow = ({
  key,
  technical_sheet,
  production_order,
  rowSpan,
  technicalSheetRowSpan,
  showTechnicalSheetData,
  isEditing,
  onEdit,
  onCancelEdit,
  sizes,
  fabrics,
  products,
  trademarks,
  onOrderChange,
  onReassignmentsChange,
  onDeleteOrder,
  onDeleteReassignment,
  fetchProducts,
  errors_create,
  createProduct,
  production_changes,
  production_reassignments,
  getCurveActualized,
  is_reference_reasigned,
  errors,
  opt_status,
}) => {
  const curveDestinations = ['NACIONAL', 'MEDELLIN', 'STARA']
  const errorIconRef = useRef(null)
  const errorPopoverRef = useRef(null)
  const [openPopover, setOpenPopover] = useState({})
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)
  const [validatedAdd, setValidatedAdd] = useState(null)
  const [openModalReasigned, setOpenModalReasigned] = useState(false)
  const [dataModal, setDataModal] = useState(null)
  const [selectedReference, setSelectedReference] = useState(null)
  const [modalAddProductStara, setModalAddProductStara] = useState(false)
  const [builderTotal, setBuilderTotal] = useState('')
  const [builderTotals, setBuilderTotals] = useState({})
  const [formData, setFormData] = useState({
    date: production_changes.date ?? production_order.date?.split('T')[0] ?? '',
    fabric_id: production_changes.fabric_id ?? production_order.fabric?.model_id ?? null,
    color_id: production_changes.color_id ?? production_order.color?.[0]?.id ?? null,
    status: production_changes.status ?? production_order.status ?? null,
  })
  const [formDataStara, setFormDataStara] = useState({
    reference_relation: true,
    subcategory_id: technical_sheet.product.subcategory_id,
    technical_sheet_id: technical_sheet.id,
  })

  const isInvalidTrademarkStara = !!errors_create?.trademark_id
  const isValidTrademarkStara =
    !errors_create?.trademark_id && formData.trademark_id !== '' && validatedAdd
  const isInvalidCategoryStara = validatedAdd
  const isValidCategoryStara = validatedAdd
  const isInvalidSubcategoryStara = !!errors_create?.subcategory_id
  const isValidSubcategoryStara =
    !errors_create?.subcategory_id && formData.subcategory_id !== '' && validatedAdd

  const [curve, setCurve] = useState(() => {
    if (production_changes?.curve) {
      return production_changes.curve
    }

    return curveDestinations.map((destination) => {
      const detail = production_order.production_order_details?.find(
        (item) => item.destination === destination,
      )

      return {
        id: detail?.id ?? null,
        destination,
        reference_id: detail?.model?.id ?? null,
        quantities: sizes.map((size) => {
          const detail_quantity = detail?.production_order_detail_quantities?.find(
            (item) => item.size_id === size.id,
          )

          return {
            id: detail_quantity?.id ?? null,
            size_id: size.id,
            quantity: detail_quantity?.quantity ?? 0,
          }
        }),
      }
    })
  })

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedIcon = errorIconRef.current?.contains(event.target)
      const clickedPopover = errorPopoverRef.current?.contains(event.target)

      if (!clickedIcon && !clickedPopover) {
        setOpenPopover(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (production_changes?.curve) {
      setCurve(production_changes.curve)
    }
  }, [production_changes?.curve])

  useEffect(() => {
    if (!formDataStara.code) {
      setFormDataStara((prev) => {
        return { ...prev, trademark_id: null }
      })
      return
    }

    const trademark = findTrademarkByCode(formDataStara.code)

    if (trademark) {
      setFormDataStara((prev) => ({
        ...prev,
        trademark_id: trademark.id,
      }))
    }
  }, [formDataStara.code, trademarks])

  const findTrademarkByCode = (reference) => {
    if (!reference || !trademarks) return null

    reference = reference.toUpperCase()

    const matches = trademarks.filter((trademark) => {
      const validations = trademark.settings?.validations ?? []

      return validations.some((validation) => {
        const match = validation.regex.match(/\/\^([A-Z0-9]+)\[0-9/)

        if (!match) return false

        const prefix = match[1]

        return prefix.startsWith(reference) || reference.startsWith(prefix)
      })
    })

    return matches.length === 1 ? matches[0] : null
  }

  const handleChangeReference = (destination, referenceId) => {
    setCurve((prev) => {
      const updatedCurve = prev.map((row) =>
        row.destination === destination
          ? {
              ...row,
              reference_id: referenceId,
            }
          : row,
      )

      onOrderChange?.(technical_sheet.id, production_order, 'curve', updatedCurve)

      return updatedCurve
    })
  }

  const handleQuantityChange = (destination, sizeId, value) => {
    setCurve((prev) => {
      const updatedCurve = prev.map((row) =>
        row.destination === destination
          ? {
              ...row,
              quantities: row.quantities.map((item) =>
                item.size_id === sizeId
                  ? {
                      ...item,
                      quantity: value,
                    }
                  : item,
              ),
            }
          : row,
      )

      onOrderChange?.(technical_sheet.id, production_order, 'curve', updatedCurve)

      return updatedCurve
    })
  }

  const getDestinationTotal = (destination) => {
    const row = getCurveRow(destination)

    return row?.quantities.reduce((total, item) => total + (Number(item.quantity) || 0), 0) ?? 0
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    onOrderChange?.(technical_sheet.id, production_order, field, value)
  }

  const renderValue = (value) => {
    if (!value) {
      return <span className="text-muted">N/A</span>
    }

    return value
  }

  const handleDeleteReassignment = async () => {
    const result = await Swal.fire({
      title: 'Eliminar Reasignacion',
      html: `<div style="font-size:14px">
                 Se eliminará reasigncación de la orden de producción. La información ingresada sera eliminada.<br/>
                 <strong>¿Deseas continuar?</strong>
               </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) {
      return
    }

    const originalTechnicalSheetId =
      production_reassignments.selected_reference?.production_order?.technical_sheet_id

    const originalOrderId = production_reassignments.selected_reference?.production_order?.id

    if (!originalTechnicalSheetId || !originalOrderId) {
      return
    }

    const originalCurve = getCurveActualized?.(originalTechnicalSheetId, originalOrderId)

    if (!originalCurve) {
      console.error('No se encontró la curva original')
      return
    }

    const selectedOriginalLocations = ['NACIONAL', 'MEDELLIN', 'STARA'].filter(
      (location) => production_reassignments.selected_reference?.selectedRows?.[location],
    )

    const reassignedBySize = {}

    sizes.forEach((size) => {
      reassignedBySize[size.id] = curve.reduce((total, row) => {
        const quantity = row.quantities?.find((item) => item.size_id === size.id)

        return total + Number(quantity?.quantity ?? 0)
      }, 0)
    })

    const specificationCurve =
      production_reassignments.selected_reference?.specification_curve ?? []

    const originalLimits = {}

    specificationCurve.forEach((item) => {
      const destination = item.destination

      if (!destination) return

      originalLimits[destination] = {}
      ;(item.production_order_detail_quantities ?? []).forEach((quantity) => {
        originalLimits[destination][quantity.size_id] = Number(quantity.quantity ?? 0)
      })
    })

    const restoredCurve = originalCurve.map((row) => ({
      ...row,

      quantities: row.quantities.map((quantity) => ({
        ...quantity,
        quantity: Number(quantity.quantity ?? 0),
      })),
    }))

    selectedOriginalLocations.forEach((location) => {
      const currentRow = restoredCurve.find((row) => row.destination === location)

      if (!currentRow) return

      const originalLimitRow = originalLimits[location]

      if (!originalLimitRow) return

      sizes.forEach((size) => {
        const sizeId = size.id

        const amountToReturn = reassignedBySize[sizeId] ?? 0

        if (amountToReturn <= 0) return

        const currentQuantity = currentRow.quantities.find((item) => item.size_id === sizeId)

        if (!currentQuantity) return

        // Máximo histórico de esta talla en este destino
        const originalMaximum = Number(originalLimitRow[sizeId] ?? 0)

        // Cantidad actual
        const currentAmount = Number(currentQuantity.quantity ?? 0)

        // Espacio disponible hasta llegar al máximo
        const availableSpace = Math.max(originalMaximum - currentAmount, 0)

        // Nunca superar el máximo original
        const amountToRestore = Math.min(amountToReturn, availableSpace)

        if (amountToRestore <= 0) return

        currentQuantity.quantity = currentAmount + amountToRestore

        // Descontamos lo que ya devolvimos
        reassignedBySize[sizeId] = amountToReturn - amountToRestore
      })
    })

    onOrderChange?.(
      originalTechnicalSheetId,
      production_reassignments.selected_reference?.production_order,
      'curve',
      restoredCurve,
    )

    onDeleteReassignment?.(technical_sheet.id, production_order.id)

    const emptyCurve = curveDestinations.map((destination) => ({
      destination,
      reference_id: null,
      quantities: sizes.map((size) => ({
        id: null,
        size_id: size.id,
        quantity: 0,
      })),
    }))

    setCurve(emptyCurve)

    setOpenModalReasigned(false)
    setDataModal(null)
    setSelectedReference(null)

    Toast.fire({
      icon: 'success',
      title: 'Reasignación eliminada correctamente',
    })
  }

  const destinationStyles = {
    NACIONAL: {
      border: '#3B82F6',
      background: 'rgba(239, 246, 255, 0.9)',
    },

    MEDELLIN: {
      border: '#10B981',
      background: 'rgba(236, 253, 245, 0.9)',
    },

    STARA: {
      border: '#F59E0B',
      background: 'rgba(255, 251, 235, 0.9)',
    },
  }

  const STATUS_SELECT_STYLES = {
    Pendiente: {
      backgroundColor: '#fff7e6',
      color: '#b26a00',
      borderColor: '#ffd591',
    },
    Aprobado: {
      backgroundColor: '#f6ffed',
      color: '#389e0d',
      borderColor: '#b7eb8f',
    },
    Cancelado: {
      backgroundColor: '#fff1f0',
      color: '#cf1322',
      borderColor: '#ffa39e',
    },
  }

  const statusStyle = STATUS_SELECT_STYLES[formData?.status] ?? {
    backgroundColor: '#f8fafc',
    color: '#64748b',
    borderColor: '#cbd5e1',
  }

  const CUT_COLORS = [
    {
      background: '#F1F5F9',
      color: '#475569',
      border: '#CBD5E1',
    },
    {
      background: '#EFF6FF',
      color: '#1D4ED8',
      border: '#BFDBFE',
    },
    {
      background: '#F0FDFA',
      color: '#0F766E',
      border: '#99F6E4',
    },
    {
      background: '#FFF7ED',
      color: '#C2410C',
      border: '#FED7AA',
    },
    {
      background: '#FDF4FF',
      color: '#A21CAF',
      border: '#F5D0FE',
    },
  ]

  const getCutColor = (cut) => {
    if (!cut) return CUT_COLORS[0]

    const value = String(cut).trim().toUpperCase()

    const index = [...value].reduce((acc, char) => acc + char.charCodeAt(0), 0)

    return CUT_COLORS[index % CUT_COLORS.length]
  }

  const getCurveRow = (destination) => {
    return curve.find((item) => item.destination === destination)
  }

  useEffect(() => {
    setBuilderTotals((prev) => {
      const updated = { ...prev }

      curveDestinations.forEach((destination) => {
        if (updated[destination] === undefined) {
          updated[destination] = getDestinationTotal(destination)
        }
      })

      return updated
    })
  }, [production_order.id])

  const handleSubmit = async () => {
    Swal.fire({
      title: 'Crear Producto',
      html: `<div style="font-size:14px">
                  Se guardará la información del producto en el sistema.<br/>
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
          const response = await createProduct(formDataStara)
          onOrderChange?.(technical_sheet.id, null, null, null, {
            code: response.data.product.code,
            id: response.data.product.id,
          })
          setValidatedAdd(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setTimeout(() => {
            setFormDataStara({})
            setModalAddProductStara(false)
          }, 2510)
        } catch (error) {
          setValidatedAdd(true)
        }
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Acción cancelada',
        })
      }
    })
  }

  const executeBuilder = (destination, total) => {
    const numericTotal = Number(total)

    if (!Number.isFinite(numericTotal) || numericTotal < 0) {
      return
    }

    if (
      !production_order?.builder_id ||
      !production_order?.builder_percentages ||
      Object.keys(production_order.builder_percentages).length === 0
    ) {
      return
    }

    const currentRow = getCurveRow(destination)

    if (!currentRow) {
      return
    }

    const updatedQuantities = currentRow.quantities.map((item) => {
      const percentage = Number(production_order.builder_percentages[item.size_id].percentage ?? 0)

      return {
        ...item,
        quantity: Math.round((numericTotal * percentage) / 100),
      }
    })

    const calculatedTotal = updatedQuantities.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    )

    const updatedCurve = curve.map((row) =>
      row.destination === destination
        ? {
            ...row,
            quantities: updatedQuantities,
          }
        : row,
    )

    setBuilderTotals((prev) => ({
      ...prev,
      [destination]: calculatedTotal,
    }))

    setCurve(updatedCurve)

    onOrderChange?.(technical_sheet.id, production_order, 'curve', updatedCurve)
  }

  const handleBuilderTotalChange = (destination, value) => {
    if (/^\d*$/.test(value)) {
      setBuilderTotals((prev) => ({
        ...prev,
        [destination]: value,
      }))
    }
  }

  const handleBuilderTotalKeyDown = (event, destination) => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()

    const total = builderTotals[destination]

    executeBuilder(destination, total)
  }

  return (
    <>
      {curveDestinations.map((destination, index) => {
        const detail = production_order.production_order_details?.find(
          (item) => item.destination === destination,
        )

        const curveRow = curve.find((item) => item.destination === destination)
        const destinationStyle = destinationStyles[destination]
        const curveCellStyle = {
          background: destinationStyle.background,
        }

        const cut = production_order?.cut
        const cutStyle = getCutColor(cut)

        const options = technical_sheet
          ? [
              {
                value: null,
                label: '-',
              },
              ...(destination === 'STARA'
                ? technical_sheet.products?.length
                  ? technical_sheet.products.map((product) => ({
                      value: product.id,
                      label: product.code,
                    }))
                  : production_changes?.product_stara
                    ? [
                        {
                          value: production_changes.product_stara.id,
                          label: production_changes.product_stara.code,
                        },
                      ]
                    : []
                : technical_sheet.product
                  ? [
                      {
                        value: technical_sheet.product.id,
                        label: technical_sheet.product.code,
                      },
                    ]
                  : []),
            ]
          : []

        return (
          <tr
            key={`${production_order.id}-${destination}`}
            className={index === curveDestinations.length - 1 ? 'production-order-end' : ''}
          >
            {showTechnicalSheetData && index === 0 && (
              <>
                {/*<td
                  rowSpan={technicalSheetRowSpan}
                  className="sticky-actions text-center align-middle"
                >
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <CTooltip content="Reasignar" placement="top">
                      <button className="td-button-refresh">
                        <RefreshCw size={16} />
                      </button>
                    </CTooltip>

                    <CTooltip content="Eliminar" placement="top">
                      <button className="td-button-delete">
                        <Trash2 size={16} />
                      </button>
                    </CTooltip>
                  </div>
                </td>*/}

                <td rowSpan={technicalSheetRowSpan} className="table-cell cell-width-160">
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span className="font-inter text-center table-input">
                      {renderValue(technical_sheet?.code)}
                    </span>
                  </div>
                </td>

                {/*<td
                  rowSpan={technicalSheetRowSpan}
                  className="table-cell cell-width-160 sticky-reference"
                >
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span className="font-inter text-center table-input">
                      {renderValue(technical_sheet?.product?.code)}
                    </span>
                  </div>
                </td>*/}

                <td rowSpan={technicalSheetRowSpan} className="table-cell cell-width-160">
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span className="font-inter text-center table-input">
                      {renderValue(technical_sheet?.garment_type?.name)}
                    </span>
                  </div>
                </td>

                <td rowSpan={technicalSheetRowSpan} className="table-cell cell-width-160">
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span className="font-inter text-center table-input">
                      {renderValue(technical_sheet?.wash_tone?.name)}
                    </span>
                  </div>
                </td>

                <td rowSpan={technicalSheetRowSpan} className="table-cell cell-width-160">
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span className="font-inter text-center table-input">
                      {renderValue(technical_sheet?.boot_type?.name)}
                    </span>
                  </div>
                </td>

                <td rowSpan={technicalSheetRowSpan} className="table-cell cell-width-160">
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span className="font-inter text-center table-input">
                      {renderValue(technical_sheet?.observation)}
                    </span>
                  </div>
                </td>

                <td rowSpan={technicalSheetRowSpan} className="table-cell cell-width-230">
                  <div className="d-flex justify-content-center align-items-center h-100">
                    {technical_sheet?.photo_d?.path ? (
                      <div
                        style={{
                          width: '110px',
                          height: '125px',
                          overflow: 'hidden',
                          borderRadius: '12px',
                          border: '1px solid #dee2e6',
                          background: '#fff',
                          padding: '3px',
                        }}
                      >
                        <img
                          src={technical_sheet.photo_d.path}
                          alt="Foto delantera"
                          onClick={() => setShowFullscreen(technical_sheet.photo_d.path)}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            cursor: 'pointer',
                            borderRadius: '9px',
                          }}
                        />
                      </div>
                    ) : (
                      <span
                        className="font-inter"
                        style={{
                          color: '#94A3B8',
                          fontSize: '14px',
                        }}
                      >
                        N/A
                      </span>
                    )}
                  </div>
                </td>

                <td rowSpan={technicalSheetRowSpan} className="table-cell cell-width-160">
                  <div className="d-flex justify-content-center align-items-center h-100">
                    {technical_sheet?.photo_t?.path ? (
                      <div
                        style={{
                          width: '110px',
                          height: '125px',
                          overflow: 'hidden',
                          borderRadius: '12px',
                          border: '1px solid #dee2e6',
                          background: '#fff',
                          padding: '3px',
                        }}
                      >
                        <img
                          src={technical_sheet.photo_t.path}
                          alt="Foto delantera"
                          onClick={() => setShowFullscreen(technical_sheet.photo_t.path)}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            cursor: 'pointer',
                            borderRadius: '9px',
                          }}
                        />
                      </div>
                    ) : (
                      <span
                        className="font-inter"
                        style={{
                          color: '#94A3B8',
                          fontSize: '14px',
                        }}
                      >
                        N/A
                      </span>
                    )}
                  </div>
                </td>
              </>
            )}

            {index === 0 && (
              <>
                <td
                  rowSpan={3}
                  className={`table-cell ${errors?.['fabric_id'] ? 'table-cell-error' : ''}`}
                  style={{ width: '200px' }}
                >
                  <div className="d-flex align-items-center justify-content-center h-100 px-2">
                    <Select
                      value={fabrics[formData.fabric_id] ?? null}
                      options={Object.values(fabrics)}
                      onChange={(selected) => handleChange('fabric_id', selected.value)}
                      isSearchable
                      className="font-inter w-100"
                      placeholder="Seleccione tela..."
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{
                        ...getSelectStylesInsertUniq(),
                        singleValue: (base) => ({
                          ...base,
                          whiteSpace: 'normal',
                          overflow: 'visible',
                          textOverflow: 'unset',
                          wordBreak: 'break-word',
                          lineHeight: '1.3',
                          margin: 0,
                          textAlign: 'center',
                        }),
                        option: (base) => ({
                          ...base,
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                        }),
                      }}
                    />
                    {errors?.['fabric_id']?.length > 0 && (
                      <div style={{ position: 'relative' }}>
                        <span
                          style={{ cursor: 'pointer', color: '#ef4444' }}
                          onClick={() =>
                            setOpenPopover(openPopover === 'fabric_id' ? null : 'fabric_id')
                          }
                        >
                          <BadgeAlert size={16} />
                        </span>
                        <CPopover
                          visible={openPopover === 'fabric_id'}
                          placement="top"
                          onHide={() => setOpenPopover(null)}
                          title={
                            <div
                              className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                              style={{
                                color: '#991B1B',
                                fontSize: '0.85rem',
                                padding: '2px 0',
                              }}
                            >
                              <BadgeAlert size={15} className="text-danger" />
                              <span>Errores de validación</span>
                            </div>
                          }
                          content={
                            <div
                              className="font-inter custom-popover-error"
                              style={{
                                maxWidth: '260px',
                                fontSize: '0.82rem',
                              }}
                            >
                              {errors?.['fabric_id'].map((err, i) => (
                                <div
                                  key={i}
                                  className="d-flex align-items-start gap-2 p-1 rounded-2"
                                >
                                  <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                                </div>
                              ))}
                            </div>
                          }
                        >
                          <span
                            className="position-absolute"
                            style={{ transform: 'translateY(-10px)' }}
                          />
                        </CPopover>
                      </div>
                    )}
                  </div>
                </td>

                <td
                  rowSpan={3}
                  className={`table-cell ${errors?.['color_id'] ? 'table-cell-error' : ''}`}
                >
                  <div className="d-flex align-items-center justify-content-center h-100 px-2">
                    <Select
                      value={
                        fabrics && formData?.fabric_id
                          ? (fabrics[formData.fabric_id].data.color
                              ?.map((item) => ({
                                label: `${item.settings?.code ?? ''} - ${item.name}`,
                                value: item.id,
                              }))
                              .find((item) => item.value === formData.color_id) ?? null)
                          : null
                      }
                      options={
                        fabrics && formData?.fabric_id
                          ? fabrics?.[formData?.fabric_id]?.data?.color?.map((item) => ({
                              label: `${item.settings.code} - ${item.name}`,
                              value: item.id,
                            }))
                          : []
                      }
                      onChange={(selected) => handleChange('color_id', selected.value)}
                      isSearchable
                      className="font-inter w-100"
                      placeholder="Seleccione color..."
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{
                        ...getSelectStylesInsertUniq(),
                        singleValue: (base) => ({
                          ...base,
                          whiteSpace: 'normal',
                          overflow: 'visible',
                          textOverflow: 'unset',
                          wordBreak: 'break-word',
                          lineHeight: '1.3',
                          margin: 0,
                          textAlign: 'center',
                        }),
                        option: (base) => ({
                          ...base,
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                        }),
                      }}
                    />
                    {errors?.['color_id']?.length > 0 && (
                      <div style={{ position: 'relative' }}>
                        <span
                          style={{ cursor: 'pointer', color: '#ef4444' }}
                          onClick={() =>
                            setOpenPopover(openPopover === 'color_id' ? null : 'color_id')
                          }
                        >
                          <BadgeAlert size={16} />
                        </span>
                        <CPopover
                          visible={openPopover === 'color_id'}
                          placement="top"
                          onHide={() => setOpenPopover(null)}
                          title={
                            <div
                              className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                              style={{
                                color: '#991B1B',
                                fontSize: '0.85rem',
                                padding: '2px 0',
                              }}
                            >
                              <BadgeAlert size={15} className="text-danger" />
                              <span>Errores de validación</span>
                            </div>
                          }
                          content={
                            <div
                              className="font-inter custom-popover-error"
                              style={{
                                maxWidth: '260px',
                                fontSize: '0.82rem',
                              }}
                            >
                              {errors?.['color_id'].map((err, i) => (
                                <div
                                  key={i}
                                  className="d-flex align-items-start gap-2 p-1 rounded-2"
                                >
                                  <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                                </div>
                              ))}
                            </div>
                          }
                        >
                          <span
                            className="position-absolute"
                            style={{ transform: 'translateY(-10px)' }}
                          />
                        </CPopover>
                      </div>
                    )}
                  </div>
                </td>

                <td
                  rowSpan={3}
                  className={`table-cell ${errors?.['cut'] ? 'table-cell-error' : ''}`}
                >
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span
                      className="font-inter"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '32px',
                        height: '35px',
                        padding: '2px 10px',
                        borderRadius: '8px',
                        backgroundColor: cutStyle.background,
                        color: cutStyle.color,
                        border: `1px solid ${cutStyle.border}`,
                        fontWeight: 600,
                        fontSize: '25px',
                      }}
                    >
                      {cut ?? 'N/A'}
                    </span>
                    {errors?.['cut']?.length > 0 && (
                      <div style={{ position: 'relative' }}>
                        <span
                          style={{ cursor: 'pointer', color: '#ef4444' }}
                          onClick={() => setOpenPopover(openPopover === 'cut' ? null : 'cut')}
                        >
                          <BadgeAlert size={16} />
                        </span>
                        <CPopover
                          visible={openPopover === 'cut'}
                          placement="top"
                          onHide={() => setOpenPopover(null)}
                          title={
                            <div
                              className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                              style={{
                                color: '#991B1B',
                                fontSize: '0.85rem',
                                padding: '2px 0',
                              }}
                            >
                              <BadgeAlert size={15} className="text-danger" />
                              <span>Errores de validación</span>
                            </div>
                          }
                          content={
                            <div
                              className="font-inter custom-popover-error"
                              style={{
                                maxWidth: '260px',
                                fontSize: '0.82rem',
                              }}
                            >
                              {errors?.['cut'].map((err, i) => (
                                <div
                                  key={i}
                                  className="d-flex align-items-start gap-2 p-1 rounded-2"
                                >
                                  <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                                </div>
                              ))}
                            </div>
                          }
                        >
                          <span
                            className="position-absolute"
                            style={{ transform: 'translateY(-10px)' }}
                          />
                        </CPopover>
                      </div>
                    )}
                  </div>
                </td>

                <td
                  rowSpan={3}
                  className={`table-cell ${errors?.['date'] ? 'table-cell-error' : ''}`}
                >
                  <div className="d-flex align-items-center justify-content-center h-100 px-2">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      className="font-inter text-center border-0 shadow-none"
                      style={{
                        width: '100%',
                        background: 'transparent',
                        outline: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#334155',
                      }}
                    />
                    {errors?.['date']?.length > 0 && (
                      <div style={{ position: 'relative' }}>
                        <span
                          style={{ cursor: 'pointer', color: '#ef4444' }}
                          onClick={() => setOpenPopover(openPopover === 'date' ? null : 'date')}
                        >
                          <BadgeAlert size={16} />
                        </span>
                        <CPopover
                          visible={openPopover === 'date'}
                          placement="top"
                          onHide={() => setOpenPopover(null)}
                          title={
                            <div
                              className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                              style={{
                                color: '#991B1B',
                                fontSize: '0.85rem',
                                padding: '2px 0',
                              }}
                            >
                              <BadgeAlert size={15} className="text-danger" />
                              <span>Errores de validación</span>
                            </div>
                          }
                          content={
                            <div
                              className="font-inter custom-popover-error"
                              style={{
                                maxWidth: '260px',
                                fontSize: '0.82rem',
                              }}
                            >
                              {errors?.['date'].map((err, i) => (
                                <div
                                  key={i}
                                  className="d-flex align-items-start gap-2 p-1 rounded-2"
                                >
                                  <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                                </div>
                              ))}
                            </div>
                          }
                        >
                          <span
                            className="position-absolute"
                            style={{ transform: 'translateY(-10px)' }}
                          />
                        </CPopover>
                      </div>
                    )}
                  </div>
                </td>
              </>
            )}

            <td
              className={`table-cell paddig-unique ${errors?.['curve'] ? 'table-cell-error' : ''}`}
              style={{
                borderLeft: `4px solid ${destinationStyle.border}`,
                background: destinationStyle.background,
              }}
            >
              <div className="d-flex align-items-center justify-content-center h-100">
                <span className="font-inter text-center table-input fw-medium">{destination}</span>
              </div>
            </td>

            <td
              className={`table-cell text-center align-middle ${errors?.['curve'] ? 'table-cell-error' : ''}`}
              style={curveCellStyle}
            >
              {destination !== 'STARA' ? (
                <Select
                  value={options.find((option) => option.value === curveRow?.reference_id) ?? null}
                  options={options}
                  onChange={(selected) =>
                    handleChangeReference(destination, selected?.value ?? null)
                  }
                  isSearchable
                  className="font-inter w-100"
                  placeholder="Seleccione..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={getSelectStylesInsertUniq()}
                />
              ) : technical_sheet?.products?.length > 0 || !!production_changes?.product_stara ? (
                <Select
                  value={options.find((option) => option.value === curveRow?.reference_id) ?? null}
                  options={options}
                  onChange={(selected) =>
                    handleChangeReference(destination, selected?.value ?? null)
                  }
                  isSearchable
                  className="font-inter w-100"
                  placeholder="Seleccione..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={getSelectStylesInsertUniq()}
                />
              ) : (
                <CButton
                  color="primary"
                  variant="outline"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1 py-1 px-2 border-dashed"
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: '500',
                    borderStyle: 'dashed',
                  }}
                  onClick={() => {
                    setModalAddProductStara(true)
                  }}
                >
                  <Plus size={14} />
                  <span>Agregar producto</span>
                </CButton>
              )}
            </td>

            {sizes.map((size) => {
              const isFocused =
                focusedInput?.destination === destination && focusedInput?.size === size.id

              const curveRow = getCurveRow(destination)

              const quantity =
                curveRow?.quantities.find((item) => item.size_id === size.id)?.quantity ?? 0

              return (
                <td
                  key={size.id}
                  className={`table-cell text-center align-middle ${errors?.['curve'] ? 'table-cell-error' : ''}`}
                  style={curveCellStyle}
                >
                  <CFormInput
                    type="number"
                    min={0}
                    step={1}
                    value={isFocused && quantity === 0 ? '' : quantity}
                    className="table-input border-0 shadow-none py-2px font-inter w-100 text-center"
                    style={{
                      background: 'transparent',
                      outline: 'none',
                      cursor: 'text',
                    }}
                    onFocus={() => {
                      setFocusedInput({
                        destination,
                        size: size.id,
                      })
                    }}
                    onBlur={() => {
                      if (quantity === '' || quantity === null) {
                        handleQuantityChange(destination, size.id, 0)
                      }

                      setFocusedInput(null)
                    }}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                        e.preventDefault()
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value

                      if (/^\d*$/.test(value)) {
                        handleQuantityChange(destination, size.id, value)
                      }
                    }}
                    disabled={!curveRow?.reference_id}
                  />
                </td>
              )
            })}

            <td
              className={`table-cell text-center align-middle ${errors?.['curve'] ? 'table-cell-error' : ''}`}
              style={curveCellStyle}
            >
              {!!production_order.builder_id ? (
                <CFormInput
                  type="number"
                  min={0}
                  step={1}
                  disabled={!curveRow?.reference_id}
                  value={
                    getDestinationTotal(destination) > 0
                      ? getDestinationTotal(destination)
                      : (builderTotals[destination] ?? '')
                  }
                  className="table-input border-0 shadow-none py-2px font-inter w-100 text-center fw-semibold"
                  style={{
                    background: 'transparent',
                    outline: 'none',
                  }}
                  onChange={(e) => handleBuilderTotalChange(destination, e.target.value)}
                  onKeyDown={(e) => handleBuilderTotalKeyDown(e, destination)}
                />
              ) : (
                <span className="table-input fw-semibold">{getDestinationTotal(destination)}</span>
              )}
            </td>

            {index === 0 && (
              <>
                <td rowSpan={3} className="table-cell cell-width-160 align-middle">
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <Select
                      options={opt_status}
                      value={opt_status.find((opt) => opt.value === formData?.status)}
                      onChange={(selected) => handleChange('status', selected.value)}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{
                        ...selectStylesWithPortal,
                        control: (base, state) => ({
                          ...base,
                          minHeight: 'auto',
                          height: 'auto',
                          minWidth: '80px',
                          padding: '0',
                          borderRadius: '999px',
                          backgroundColor: statusStyle.backgroundColor,
                          border: `1px solid ${statusStyle.borderColor}`,
                          boxShadow: 'none',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: statusStyle.borderColor,
                          },
                          ...(state.isFocused && {
                            borderColor: statusStyle.borderColor,
                            boxShadow: `0 0 0 1px ${statusStyle.borderColor}`,
                          }),
                        }),

                        valueContainer: (base) => ({
                          ...base,
                          padding: '4px 10px',
                        }),

                        singleValue: (base) => ({
                          ...base,
                          margin: 0,
                          color: statusStyle.color,
                          fontSize: '12px',
                          fontWeight: 600,
                          lineHeight: 1.2,
                        }),

                        indicatorsContainer: (base) => ({
                          ...base,
                          paddingRight: '6px',
                        }),

                        dropdownIndicator: (base) => ({
                          ...base,
                          padding: '0 4px',
                          color: statusStyle.color,
                        }),

                        indicatorSeparator: () => ({
                          display: 'none',
                        }),

                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),
                      }}
                    />
                  </div>
                </td>
                <td rowSpan={3} className="table-cell text-center align-middle">
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    {String(production_order.id).startsWith('new') ? (
                      production_reassignments &&
                      Object.keys(production_reassignments).length > 0 ? (
                        <>
                          <CTooltip content="Editar Reasignación" placement="top">
                            <button
                              className="td-button-reasigned-edit"
                              onClick={() => {
                                setDataModal(
                                  production_changes.curve.map((item) => ({
                                    location: item.destination,
                                    product_id: item.reference_id,
                                    sizes: item.quantities.reduce((acc, aux) => {
                                      acc[aux.size_id] = {
                                        quantity: aux.quantity,
                                        size_id: aux.size_id,
                                      }

                                      return acc
                                    }, {}),
                                  })),
                                )

                                setSelectedReference({
                                  ...production_reassignments.selected_reference,
                                })

                                setOpenModalReasigned(true)
                              }}
                            >
                              <Edit size={16} />
                            </button>
                          </CTooltip>

                          <CTooltip content="Eliminar Reasignación" placement="top">
                            <button className="td-button-delete" onClick={handleDeleteReassignment}>
                              <CircleX size={16} />
                            </button>
                          </CTooltip>
                        </>
                      ) : (
                        <>
                          <CTooltip content="Reasignar" placement="top">
                            <button
                              className="td-button-reasigned"
                              onClick={() => setOpenModalReasigned(true)}
                            >
                              <ArrowRightLeft size={16} />
                            </button>
                          </CTooltip>

                          <CTooltip content="Eliminar" placement="top">
                            <button
                              className="td-button-delete"
                              onClick={() => onDeleteOrder?.(production_order.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </CTooltip>
                        </>
                      )
                    ) : (
                      production_order.model === null && (
                        <CTooltip content="Reasignar" placement="top">
                          <button
                            disabled={is_reference_reasigned}
                            className="td-button-reasigned"
                            onClick={() => setOpenModalReasigned(true)}
                          >
                            <ArrowRightLeft size={16} />
                          </button>
                        </CTooltip>
                      )
                    )}
                  </div>
                </td>
              </>
            )}
          </tr>
        )
      })}

      {openModalReasigned && (
        <ModalAddReassignmentCurveProgramation
          openModalReasigned={openModalReasigned}
          setOpenModalReasigned={setOpenModalReasigned}
          products={products}
          /*setModalAddProduct={setModalAddProduct}
        product={product}
        product_stara={product_stara}
        setData={setData}
        setDataNew={setDataNew}
        setDataAux={setDataAux}
        dataModal={dataModal}
        setDataModal={setDataModal}*/
          sizes={sizes}
          production_order={production_order}
          fetchProducts={fetchProducts}
          product={technical_sheet.product ?? null}
          product_stara={technical_sheet.products?.[0] ?? null}
          sizes_data={technical_sheet.product.trademark.sizes ?? null}
          curve={curve}
          setCurve={setCurve}
          onReassignmentsChange={onReassignmentsChange}
          onOrderChange={onOrderChange}
          technical_sheet={technical_sheet}
          dataModal={dataModal}
          setDataModal={setDataModal}
          selectedReference={selectedReference}
          setSelectedReference={setSelectedReference}
          curve={curve}
          production_changes={production_changes}
          getCurveActualized={getCurveActualized}
        />
      )}

      {modalAddProductStara &&
        createPortal(
          <CModal
            visible={modalAddProductStara}
            onClose={() => {
              setModalAddProductStara(false)
              setFormDataStara({})
            }}
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
                Crear Producto
              </CModalTitle>
            </CModalHeader>
            <CModalBody className="px-4 py-1">
              <CForm className="row g-3 needs-validation p-4">
                <CCol md={12}>
                  <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                    <TextInitial size={15} /> Referencia
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="code"
                    value={formDataStara.code}
                    onChange={(e) => {
                      const { name, value } = e.target
                      setFormDataStara((prev) => ({
                        ...prev,
                        ['code']: value.toUpperCase(),
                      }))
                    }}
                    invalid={!!errors_create?.['code']}
                    valid={!errors_create?.['code'] && formDataStara.code !== '' && validatedAdd}
                    className="font-montserrat input-custom"
                  />

                  <CFormFeedback invalid>
                    {errors_create?.['code']?.map((error, index) => (
                      <div key={index} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter" style={{ whiteSpace: 'pre-line' }}>
                          {error}
                        </small>
                      </div>
                    ))}
                  </CFormFeedback>
                  <CFormFeedback valid>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter">Dato Válido</small>
                    </div>
                  </CFormFeedback>
                </CCol>
                <CCol md={12}>
                  <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                    <TextInitial size={15} /> Marca
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="trademark_id"
                    value={
                      !!trademarks && formDataStara.code
                        ? trademarks.find((opt) => opt.id === formDataStara.trademark_id)?.name
                        : ''
                    }
                    disabled
                    className="font-montserrat custom-input"
                    invalid={!!errors_create?.['trademark_id']}
                    valid={
                      !errors_create?.['trademark_id'] &&
                      formDataStara.trademark_id !== '' &&
                      validatedAdd
                    }
                  />
                  <CFormFeedback invalid className={isInvalidTrademarkStara ? 'd-block' : 'd-none'}>
                    {errors_create?.['trademark_id']?.map((error, index) => (
                      <div key={index} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter">{error}</small>
                      </div>
                    ))}
                  </CFormFeedback>
                  <CFormFeedback valid className={isValidTrademarkStara ? 'd-block' : 'd-none'}>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter">Dato Válido</small>
                    </div>
                  </CFormFeedback>
                </CCol>
                <CCol md={12}>
                  <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                    <TextInitial size={15} /> Grupo
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="group"
                    value={
                      !!trademarks && formDataStara.code
                        ? trademarks.find((opt) => opt.id === formDataStara.trademark_id)?.group[0]
                            ?.name
                        : ''
                    }
                    disabled
                    className="font-montserrat custom-input"
                    invalid={!!errors_create?.['trademark_id']}
                    valid={
                      !errors_create?.['trademark_id'] &&
                      formDataStara.trademark_id !== '' &&
                      validatedAdd
                    }
                  />
                  <CFormFeedback invalid>
                    {errors_create?.['trademark_id']?.map((error, index) => (
                      <div key={index} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter" style={{ whiteSpace: 'pre-line' }}>
                          {error}
                        </small>
                      </div>
                    ))}
                  </CFormFeedback>
                  <CFormFeedback valid>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter">Dato Válido</small>
                    </div>
                  </CFormFeedback>
                </CCol>
                <CCol md={12}>
                  <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                    <TextInitial size={15} /> Categoria
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="category_id"
                    value={
                      technical_sheet?.product?.subcategory?.category[0].name
                        ? technical_sheet?.product?.subcategory?.category[0].name
                        : ''
                    }
                    disabled
                    className="font-montserrat custom-input"
                    invalid={!!errors_create?.['category_id']}
                    valid={
                      !errors_create?.['category_id'] &&
                      formDataStara.category_id !== '' &&
                      validatedAdd
                    }
                  />
                  <CFormFeedback invalid className={isInvalidCategoryStara ? 'd-block' : 'd-none'}>
                    {errors_create?.['category_id']?.map((error, index) => (
                      <div key={index} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter">{error}</small>
                      </div>
                    ))}
                  </CFormFeedback>
                  <CFormFeedback valid className={isValidCategoryStara ? 'd-block' : 'd-none'}>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter">Dato Válido</small>
                    </div>
                  </CFormFeedback>
                </CCol>
                <CCol md={12}>
                  <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                    <TextInitial size={15} /> Subcategoría
                    <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    name="trademark_id"
                    value={
                      technical_sheet?.product?.subcategory?.name
                        ? technical_sheet?.product?.subcategory?.name
                        : ''
                    }
                    disabled
                    className="font-montserrat custom-input"
                    invalid={!!errors_create?.['subcategory_id']}
                    valid={
                      !errors_create?.['subcategory_id'] &&
                      formDataStara.subcategory_id !== '' &&
                      validatedAdd
                    }
                  />
                  <CFormFeedback
                    invalid
                    className={isInvalidSubcategoryStara ? 'd-block' : 'd-none'}
                  >
                    {errors_create?.['subcategory_id']?.map((error, index) => (
                      <div key={index} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter">{error}</small>
                      </div>
                    ))}
                  </CFormFeedback>
                  <CFormFeedback valid className={isValidSubcategoryStara ? 'd-block' : 'd-none'}>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter">Dato Válido</small>
                    </div>
                  </CFormFeedback>
                </CCol>
              </CForm>
            </CModalBody>
            <CModalFooter className="mt-2">
              <CButton
                color="secondary"
                size="sm"
                onClick={() => {
                  setModalAddProductStara(false)
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
                onClick={() => {
                  handleSubmit()
                }}
              >
                <Save size={16} />
                Guardar
              </CButton>
            </CModalFooter>
          </CModal>,
          document.body,
        )}

      {showFullscreen &&
        createPortal(
          <div
            onClick={() => setShowFullscreen(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.9)',
              zIndex: 99999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
            }}
          >
            <button
              type="button"
              onClick={() => setShowFullscreen(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="style-btn-action-image"
            >
              <X size={20} />
            </button>

            <img
              src={showFullscreen}
              alt="Vista ampliada"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '12px',
                background: '#fff',
                padding: '4px',
              }}
            />
          </div>,
          document.body,
        )}
    </>
  )
}

export default React.memo(ProductionOrderRow)
