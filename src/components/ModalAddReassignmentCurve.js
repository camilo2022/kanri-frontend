import {
  CFormInput,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CPopover,
  CFormCheck,
} from '@coreui/react'
import { X, Plus, BadgeAlert, Save, Layers, ArrowDownRight } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { thStyle, thStyleGroup } from '@/components/StyleManagementCollection'
import { Toast } from '@/components/Toast'
import Swal from 'sweetalert2'
import Select from 'react-select'
import { getSelectStylesInsertUniq } from '@/components/StyleManagementCollection'

const ModalAddReassignmentCurve = ({
  technical_sheet,
  products,
  product,
  sizes,
  data,
  setData,
  errors,
  modalAddSpecification,
  setModalAddSpecification,
  selectedReference,
  setSelectedReference,
  dataAux,
  setDataAux,
  product_stara,
  setModalAddProduct,
  dataModal,
  setDataModal,
  dataNew,
  setDataNew,
  selectedReferences,
  setSelectedReferences,
  hasReassignment,
  setHasReassignment,
}) => {
  console.log(sizes)
  console.log(data, dataNew)
  const [focusedInput, setFocusedInput] = useState(null)
  const [openPopover, setOpenPopover] = useState({
    id: null,
  })
  const [optReasigned, setOptReasigned] = useState(null)
  const [selectedRows, setSelectedRows] = useState({
    NACIONAL: true,
    MEDELLIN: true,
    STARA: true,
  })
  const [activeReferenceId, setActiveReferenceId] = useState(null)
  const [curvesByReference, setCurvesByReference] = useState({})
  const [destinationDataByReference, setDestinationDataByReference] = useState({})
  const [selectedRowsByReference, setSelectedRowsByReference] = useState({})
  const activeReference = curvesByReference[activeReferenceId]?.reference
  const activeDataAux = curvesByReference[activeReferenceId]?.data
  const activeDataModal = destinationDataByReference[activeReferenceId] || []
  const activeSelectedRows = selectedRowsByReference[activeReferenceId] || {
    NACIONAL: true,
    MEDELLIN: true,
    STARA: true,
  }

  const toggleRowSelect = (location) => {
    if (!activeReferenceId) return

    setSelectedRowsByReference((prev) => ({
      ...prev,
      [activeReferenceId]: {
        ...(prev[activeReferenceId] || {
          NACIONAL: true,
          MEDELLIN: true,
          STARA: true,
        }),
        [location]: !(prev[activeReferenceId]?.[location] ?? true),
      },
    }))
  }

  useEffect(() => {
    if (!products || !product) return

    const aux = new Map()

    products?.forEach((item) => {
      if (
        !item.original ||
        !item.technical_sheet ||
        item.subcategory_id !== product.subcategory_id ||
        item.trademark.group[0].id !== product.trademark.group[0].id
      ) {
        return
      }

      item.technical_sheet.production_orders.forEach((production_order) => {
        aux.set(production_order.id, {
          label: `${item.code}-${production_order.cut}`,
          value: production_order.id,
          specification_curve: production_order.production_order_details.filter(
            (item) => item.model_type === 'App\\Models\\Product',
          ),
          sizes: item.trademark?.sizes || [],
        })
      })
    })

    setOptReasigned([...aux.values()])
  }, [products, product])

  useEffect(() => {
    if (!modalAddSpecification) return
    if (!hasReassignment) return
    if (!dataNew?.length) return
    if (!optReasigned?.length) return

    const references = dataNew
      .map((item) => {
        const reference = optReasigned.find((option) => option.value === item.production_order_id)

        return reference || null
      })
      .filter(Boolean)

    if (!references.length) return

    setSelectedReferences(references)

    const curves = {}
    const destinations = {}
    const selectedRows = {}

    references.forEach((reference) => {
      const reassignment = dataNew.find((item) => item.production_order_id === reference.value)

      curves[reference.value] = {
        reference,
        data: buildCurveData(reference),
      }

      destinations[reference.value] = buildDestinationDataFromExisting(reference, reassignment)

      console.log(reassignment?.selected_rows)

      selectedRows[reference.value] = reassignment?.selected_rows?.reduce(
        (acc, item) => {
          acc[item] = true
          return acc
        },
        {
          NACIONAL: false,
          MEDELLIN: false,
          STARA: false,
        },
      ) || {
        NACIONAL: true,
        MEDELLIN: true,
        STARA: true,
      }
    })

    console.log(selectedRows)

    setCurvesByReference(curves)
    setDestinationDataByReference(destinations)
    setSelectedRowsByReference(selectedRows)

    setActiveReferenceId(references[0].value)
  }, [modalAddSpecification, hasReassignment, dataNew, optReasigned])

  const handleChange = (rowIndex, sizeId, value) => {
    if (!activeReferenceId) return

    const inputQuantity = value === '' ? 0 : Number(value)

    const currentQuantityInRow = Number(activeDataModal[rowIndex]?.sizes?.[sizeId]?.quantity || 0)

    const currentAssignedOthers = (sizeLimits[sizeId]?.assigned || 0) - currentQuantityInRow

    const maxAllowedForThisInput = (sizeLimits[sizeId]?.maxAvailable || 0) - currentAssignedOthers

    if (inputQuantity > maxAllowedForThisInput) {
      return
    }

    setDestinationDataByReference((prev) => ({
      ...prev,
      [activeReferenceId]: prev[activeReferenceId].map((row, index) => {
        if (index !== rowIndex) return row

        return {
          ...row,
          sizes: {
            ...row.sizes,
            [sizeId]: {
              ...row.sizes[sizeId],
              quantity: inputQuantity,
            },
          },
        }
      }),
    }))
  }

  const handleChangeReference = (location, value) => {
    setDestinationDataByReference((prev) => {
      const updated = { ...prev }

      selectedReferences.forEach((reference) => {
        const referenceId = reference.value

        updated[referenceId] = (updated[referenceId] || []).map((row) => {
          if (row.location !== location) return row

          return {
            ...row,
            product_id: value,
          }
        })
      })

      return updated
    })
  }

  console.log(destinationDataByReference)

  const buildReassignmentPayload = () => {
    const originCurves = selectedReferences.map((reference) => {
      const referenceId = reference.value

      const originalCurve = curvesByReference[referenceId]?.data || []

      const reassignedDetails = destinationDataByReference[referenceId] || []

      const selectedRows = Object.entries(selectedRowsByReference[referenceId] || {})
        .filter(([, selected]) => selected)
        .map(([location]) => location)

      const updatedCurve = originalCurve.map((originRow) => {
        const reassignedRow = reassignedDetails.find((row) => row.location === originRow.location)

        const updatedSizes = {}

        sizes.forEach((size) => {
          const originalQuantity = Number(originRow.sizes?.[size.id]?.quantity || 0)

          const quantityReassigned = Number(reassignedRow?.sizes?.[size.id]?.quantity || 0)

          updatedSizes[size.id] = {
            ...originRow.sizes?.[size.id],
            size_id: size.id,
            quantity: Math.max(0, originalQuantity - quantityReassigned),
          }
        })

        return {
          ...originRow,
          sizes: updatedSizes,
        }
      })

      return {
        production_order_id: referenceId,

        curve: updatedCurve,

        reassigned_details: reassignedDetails,

        selected_rows: selectedRows,
      }
    })

    return {
      production_order_id: product_stara?.production_order_id ?? null,

      origin_curves: originCurves,

      destination_curve: totalDestinationData,
    }
  }

  const buildUpdatedOriginCurves = () => {
    return selectedReferences.map((reference) => {
      const referenceId = reference.value

      const originalCurve = curvesByReference[referenceId]?.data || []
      const reassignedCurve = destinationDataByReference[referenceId] || []

      const updatedCurve = originalCurve.map((originRow) => {
        const reassignedRow = reassignedCurve.find((row) => row.location === originRow.location)

        const updatedSizes = {}

        sizes.forEach((size) => {
          const originalQuantity = Number(originRow.sizes?.[size.id]?.quantity || 0)

          const reassignedQuantity = Number(reassignedRow?.sizes?.[size.id]?.quantity || 0)

          updatedSizes[size.id] = {
            ...originRow.sizes?.[size.id],
            size_id: size.id,
            quantity: Math.max(0, originalQuantity - reassignedQuantity),
          }
        })

        return {
          ...originRow,
          sizes: updatedSizes,
        }
      })

      return {
        production_order_id: referenceId,
        reference: reference.label,
        curve: updatedCurve,
        reassigned_details: reassignedCurve,
        selected_rows: selectedRowsByReference[referenceId] || {
          NACIONAL: true,
          MEDELLIN: true,
          STARA: true,
        },
      }
    })
  }

  const handleSubmit = async () => {
    Swal.fire({
      title: 'Reasignar Curva',
      html: `<div style="font-size:14px">
                Se guardará la información de la reasignacion de la curva de la referencia ${selectedReference.label}.<br/>
                <strong>¿Deseas continuar?</strong>
              </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, guardar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const originCurves = selectedReferences.map((reference) => {
            const referenceId = reference.value

            const originalCurve = curvesByReference[referenceId]?.data || []

            const reassignedDetails = destinationDataByReference[referenceId] || []

            const selectedRows = Object.entries(selectedRowsByReference[referenceId] || {})
              .filter(([, selected]) => selected)
              .map(([location]) => location)

            const updatedCurve = originalCurve.map((originRow) => {
              const reassignedRow = reassignedDetails.find(
                (row) => row.location === originRow.location,
              )

              const updatedSizes = {}

              sizes.forEach((size) => {
                const originalQuantity = Number(originRow.sizes?.[size.id]?.quantity || 0)

                const quantityReassigned = Number(reassignedRow?.sizes?.[size.id]?.quantity || 0)

                updatedSizes[size.id] = {
                  ...originRow.sizes?.[size.id],
                  size_id: size.id,
                  quantity: Math.max(0, originalQuantity - quantityReassigned),
                }
              })

              return {
                ...originRow,
                sizes: updatedSizes,
              }
            })

            return {
              production_order_id: referenceId,
              curve: updatedCurve,
              reassigned_details: reassignedDetails,
              selected_rows: selectedRows,
            }
          })

          setDataNew(originCurves)
          setData(totalDestinationData)
          setHasReassignment(true)

          console.log('ORDENES ORIGEN:', originCurves)
          console.log('CURVA NUEVA ORDEN:', totalDestinationData)

          setModalAddSpecification(false)
        } catch (error) {
          console.log(error)
        }
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Acción cancelada',
        })
      }
    })
  }

  const customFilterOption = (option, rawInput) => {
    const words = rawInput.toLowerCase().split(' ')
    const label = option.label.toLowerCase()
    return words.every((word) => label.includes(word))
  }

  const availablePerSize = useMemo(() => {
    if (!activeReference?.sizes || !activeDataAux || !activeDataModal) {
      return {}
    }

    const result = {}

    activeReference.sizes.forEach((size) => {
      const sizeId = size.id

      const stockAvailable = activeDataAux.reduce((sum, row) => {
        if (activeSelectedRows[row.location]) {
          return sum + Number(row.sizes?.[sizeId]?.quantity || 0)
        }

        return sum
      }, 0)

      const requested = activeDataModal.reduce((sum, row) => {
        return sum + Number(row.sizes?.[sizeId]?.quantity || 0)
      }, 0)

      const remaining = stockAvailable - requested

      result[sizeId] = {
        totalSelected: stockAvailable,
        remaining,
        isNegative: remaining < 0,
      }
    })

    return result
  }, [activeReference, activeDataAux, activeDataModal, activeSelectedRows])

  const sizeLimits = useMemo(() => {
    if (!activeReference?.sizes || !activeDataAux || !activeDataModal) {
      return {}
    }

    const limits = {}

    activeReference.sizes.forEach((size) => {
      const sizeId = size.id

      const originalTotal = activeDataAux.reduce((sum, row) => {
        return activeSelectedRows[row.location]
          ? sum + Number(row.sizes?.[sizeId]?.quantity || 0)
          : sum
      }, 0)

      const assignedTotal = activeDataModal.reduce((sum, row) => {
        return sum + Number(row.sizes?.[sizeId]?.quantity || 0)
      }, 0)

      limits[sizeId] = {
        maxAvailable: originalTotal,
        assigned: assignedTotal,
        remaining: originalTotal - assignedTotal,
      }
    })

    return limits
  }, [activeReference, activeDataAux, activeDataModal, activeSelectedRows])

  const totalDestinationData = useMemo(() => {
    if (!selectedReferences.length) return []

    const totals = ['NACIONAL', 'MEDELLIN', 'STARA'].map((location) => ({
      location,
      product_id: null,
      sizes: {},
    }))

    selectedReferences.forEach((reference) => {
      const destinationRows = destinationDataByReference[reference.value] || []

      destinationRows.forEach((row) => {
        const totalRow = totals.find((item) => item.location === row.location)

        if (!totalRow) return

        if (row.product_id) {
          totalRow.product_id = row.product_id
        }

        sizes.forEach((size) => {
          const quantity = Number(row.sizes?.[size.id]?.quantity || 0)

          if (!totalRow.sizes[size.id]) {
            totalRow.sizes[size.id] = {
              size_id: size.id,
              name: size.name,
              quantity: 0,
            }
          }

          totalRow.sizes[size.id].quantity += quantity
        })
      })
    })

    return totals
  }, [selectedReferences, destinationDataByReference, sizes])

  const totalDestinationBySize = useMemo(() => {
    const totals = {}

    sizes.forEach((size) => {
      totals[size.id] = totalDestinationData.reduce((total, row) => {
        return total + Number(row.sizes?.[size.id]?.quantity || 0)
      }, 0)
    })

    return totals
  }, [totalDestinationData, sizes])

  const options = product
    ? [
        {
          value: null,
          label: '-',
        },
        {
          value: product.id,
          label: product.code,
        },
      ]
    : []

  const options_stara =
    product_stara !== null
      ? [
          {
            value: null,
            label: '-',
          },
          {
            value: product_stara.id,
            label: product_stara.code,
          },
        ]
      : []

  const calculateCascadeStockForSize = (sizeId, dataAux, dataModal) => {
    const locationOrder = ['NACIONAL', 'MEDELLIN', 'STARA']

    let pendingDemand = dataModal.reduce((total, row) => {
      return total + Number(row.sizes?.[sizeId]?.quantity || 0)
    }, 0)

    const finalBalances = {}

    locationOrder.forEach((loc) => {
      const auxRow = dataAux.find((r) => r.location === loc)

      const availableStock = Number(auxRow?.sizes?.[sizeId]?.quantity || 0)

      if (pendingDemand > 0) {
        if (availableStock >= pendingDemand) {
          finalBalances[loc] = availableStock - pendingDemand
          pendingDemand = 0
        } else {
          finalBalances[loc] = 0
          pendingDemand -= availableStock
        }
      } else {
        finalBalances[loc] = availableStock
      }
    })

    return finalBalances
  }

  const buildCurveData = (reference) => {
    const curve = reference.specification_curve
      .filter((item) => item.model_type === 'App\\Models\\Product')
      .map((item) => ({
        location: item.destination,
        reference: item.model.code,
        product_id: item.model_id,
        sizes: reference.sizes.reduce((acc, size) => {
          const quantity = item.production_order_detail_quantities.find(
            (aux) => aux.size_id === size.id,
          )

          acc[size.id] = {
            id: quantity?.id ?? null,
            size_id: size.id,
            name: size.name,
            quantity: quantity?.quantity ?? 0,
          }

          return acc
        }, {}),
      }))

    ;['NACIONAL', 'MEDELLIN', 'STARA'].forEach((location) => {
      if (!curve.some((item) => item.location === location)) {
        curve.push({
          location,
          reference: null,
          product_id: null,
          sizes: reference.sizes.reduce((acc, size) => {
            acc[size.id] = {
              id: null,
              size_id: size.id,
              name: size.name,
              quantity: 0,
            }

            return acc
          }, {}),
        })
      }
    })

    return curve
  }

  const buildDestinationDataFromExisting = (reference, reassignment) => {
    if (!reference || !reassignment) return []

    const reassignedDetails = reassignment.reassigned_details || []

    return ['NACIONAL', 'MEDELLIN', 'STARA'].map((location) => {
      const existingRow = reassignedDetails.find((row) => row.location === location)

      return {
        location,
        reference: existingRow?.reference ?? null,
        product_id: existingRow?.product_id ?? null,

        sizes: reference.sizes.reduce((acc, size) => {
          const existingSize = existingRow?.sizes?.[size.id]

          acc[size.id] = {
            id: existingSize?.id ?? null,
            size_id: size.id,
            name: size.name,
            quantity: Number(existingSize?.quantity || 0),
          }

          return acc
        }, {}),
      }
    })
  }

  const buildDestinationData = (reference) => {
    if (!reference) return []

    return ['NACIONAL', 'MEDELLIN', 'STARA'].map((location) => ({
      location,
      reference: null,
      product_id: null,
      sizes: reference.sizes.reduce((acc, size) => {
        acc[size.id] = {
          id: null,
          size_id: size.id,
          name: size.name,
          quantity: 0,
        }

        return acc
      }, {}),
    }))
  }

  const handleSelectReferences = (references) => {
    const selected = references || []

    setSelectedReferences(selected)

    setCurvesByReference((prev) => {
      const next = {}

      selected.forEach((reference) => {
        next[reference.value] = {
          reference,
          data: prev[reference.value]?.data || buildCurveData(reference),
        }
      })

      return next
    })

    setDestinationDataByReference((prev) => {
      const next = {}

      selected.forEach((reference) => {
        next[reference.value] = prev[reference.value] || buildDestinationData(reference)
      })

      return next
    })

    setSelectedRowsByReference((prev) => {
      const next = {}

      selected.forEach((reference) => {
        next[reference.value] = prev[reference.value] || {
          NACIONAL: true,
          MEDELLIN: true,
          STARA: true,
        }
      })

      return next
    })

    if (selected.length > 0) {
      const currentActiveExists = selected.some(
        (reference) => reference.value === activeReferenceId,
      )

      if (!currentActiveExists) {
        setActiveReferenceId(selected[0].value)
      }
    } else {
      setActiveReferenceId(null)
    }
  }

  console.log(optReasigned)
  console.log(activeDataModal)
  console.log(activeSelectedRows)
  console.log(selectedRowsByReference)

  const hasSizeInActiveReference = (sizeId) => {
    return activeReference?.sizes?.some((size) => size.id === sizeId) ?? false
  }

  return (
    <>
      <CModal
        visible={modalAddSpecification}
        onClose={() => {
          setModalAddSpecification(false)
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
            Reasignación de Curva
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="px-4 py-3">
          <div
            className="p-3 rounded-3"
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div
                  className="font-montserrat fw-bold"
                  style={{
                    fontSize: '0.85rem',
                    color: '#0F172A',
                  }}
                >
                  Referencias a reasignar
                </div>

                <div
                  className="font-inter text-muted"
                  style={{
                    fontSize: '0.75rem',
                  }}
                >
                  Seleccione una o varias referencias para consultar sus curvas.
                </div>
              </div>

              {selectedReferences.length > 0 && (
                <span
                  className="badge rounded-pill"
                  style={{
                    backgroundColor: '#EEF2FF',
                    color: '#24247F',
                    fontSize: '0.72rem',
                  }}
                >
                  {selectedReferences.length}{' '}
                  {selectedReferences.length === 1 ? 'referencia' : 'referencias'}
                </span>
              )}
            </div>
            <Select
              options={optReasigned || []}
              value={selectedReferences}
              onChange={handleSelectReferences}
              isMulti
              isClearable
              isSearchable
              filterOption={customFilterOption}
              placeholder="Seleccione las referencias..."
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              components={{
                Option: ({ children, isSelected, innerProps }) => (
                  <div
                    {...innerProps}
                    className="d-flex align-items-center"
                    style={{
                      padding: '9px 12px',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      color: '#334155',
                      fontSize: '0.82rem',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8FAFC'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white'
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center me-2"
                      style={{
                        width: '16px',
                        height: '16px',
                        border: isSelected ? '1px solid #24247F' : '1px solid #CBD5E1',
                        borderRadius: '3px',
                        backgroundColor: isSelected ? '#24247F' : 'white',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && (
                        <span
                          style={{
                            color: 'white',
                            fontSize: '11px',
                            lineHeight: 1,
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <span>{children}</span>
                  </div>
                ),

                MultiValue: ({ data, index, getValue }) => {
                  const values = getValue()

                  return (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: '0.82rem',
                        color: '#334155',
                        marginRight: '4px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        minWidth: 'max-content',
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{data.label}</span>

                      {index < values.length - 1 ? ', ' : ''}
                    </span>
                  )
                },

                MultiValueContainer: ({ children }) => <span>{children}</span>,

                MultiValueRemove: () => null,
              }}
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: '38px',
                  height: '38px',
                  borderColor: state.hasValue ? '#24247F' : '#DBDFE6',
                  boxShadow: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.82rem',
                  '&:hover': {
                    borderColor: '#1857b6',
                    boxShadow: '0 0 0 0.2rem rgba(13, 110, 253, 0.25)',
                  },
                }),

                valueContainer: (base) => ({
                  ...base,
                  minHeight: '38px',
                  height: '38px',
                  padding: '0 10px',
                  overflow: 'hidden',
                  flexWrap: 'nowrap',
                  whiteSpace: 'nowrap',
                }),

                indicatorsContainer: (base) => ({
                  ...base,
                  height: '38px',
                }),

                multiValue: (base) => ({
                  ...base,
                  backgroundColor: 'transparent',
                  borderRadius: 0,
                  margin: 0,
                  padding: 0,
                }),

                multiValueLabel: (base) => ({
                  ...base,
                  padding: 0,
                  color: '#334155',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }),

                multiValueRemove: (base) => ({
                  ...base,
                  display: 'none',
                }),

                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),

                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                  borderRadius: '0.375rem',
                  overflow: 'hidden',
                  fontFamily: 'Inter',
                }),

                menuList: (base) => ({
                  ...base,
                  padding: 0,
                }),
              }}
            />
          </div>

          {selectedReferences.length > 0 && (
            <>
              <div className="d-flex align-items-center justify-content-between mb-2 mt-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary text-white fw-bold px-2 py-2 rounded">
                    <Layers size={14} className="me-1" />{' '}
                    {selectedReferences.length > 1
                      ? 'TABLAS DE ORIGEN (STOCK DISPONIBLE)'
                      : 'TABLA DE ORIGEN (STOCK DISPONIBLE)'}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <div
                  className="d-flex gap-1"
                  style={{
                    overflowX: 'auto',
                    borderBottom: '1px solid #E2E8F0',
                    paddingLeft: '4px',
                  }}
                >
                  {selectedReferences.map((reference) => {
                    const isActive = activeReferenceId === reference.value

                    return (
                      <button
                        key={reference.value}
                        type="button"
                        onClick={() => setActiveReferenceId(reference.value)}
                        className="border-0"
                        style={{
                          backgroundColor: isActive ? '#24247F' : '#F8FAFC',
                          color: isActive ? '#FFFFFF' : '#64748B',
                          padding: '9px 14px',
                          borderRadius: '8px 8px 0 0',
                          fontSize: '0.76rem',
                          fontFamily: 'Poppins',
                          fontWeight: isActive ? 600 : 500,
                          whiteSpace: 'nowrap',
                          transition: 'all .2s ease',
                        }}
                      >
                        {reference.label}
                      </button>
                    )
                  })}
                </div>
                <div
                  style={{
                    border: '1px solid #E2E8F0',
                    borderTop: 'none',
                    borderRadius: '0 0 10px 10px',
                    backgroundColor: '#FFFFFF',
                    padding: '16px',
                  }}
                >
                  <div className="table-responsive border rounded">
                    <table
                      className="table align-middle mb-0"
                      style={{
                        width: '100%',
                        borderCollapse: 'separate',
                        borderSpacing: 0,
                      }}
                    >
                      <thead style={{ backgroundColor: '#fdfdfd' }}>
                        <tr className="font-poppins">
                          <th
                            rowSpan={2}
                            className="text-center align-middle"
                            style={{ ...thStyle, width: '50px' }}
                          >
                            USAR
                          </th>
                          <th
                            rowSpan={2}
                            className="text-center align-middle"
                            style={{ ...thStyle, minWidth: '100px' }}
                          >
                            -
                          </th>
                          <th
                            rowSpan={2}
                            className="text-center align-middle"
                            style={{ ...thStyle, minWidth: '200px' }}
                          >
                            REFERENCIA
                          </th>
                          <th
                            colSpan={activeReference?.sizes?.length || 0}
                            className="text-center align-middle"
                            style={{ ...thStyleGroup }}
                          >
                            TALLAS
                          </th>
                          <th
                            rowSpan={2}
                            className="text-center align-middle"
                            style={{ ...thStyle, minWidth: '90px' }}
                          >
                            TOTAL
                          </th>
                        </tr>
                        <tr className="font-poppins">
                          {activeReference?.sizes?.map((size) => {
                            return (
                              <th
                                className="text-center"
                                style={{
                                  ...thStyleGroup,
                                  minWidth: '100px',
                                }}
                              >
                                {size.name}
                              </th>
                            )
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {activeDataAux?.map((row, rowIndex) => {
                          const isChecked = !!activeSelectedRows[row.location]
                          return (
                            <tr
                              key={row.location}
                              style={{ backgroundColor: isChecked ? '#fafafa' : '#FFFFFF' }}
                              className="font-inter"
                            >
                              <td className="table-input-spc text-center align-middle border-end">
                                <CFormCheck
                                  checked={isChecked}
                                  onChange={() => toggleRowSelect(row.location)}
                                  disabled={
                                    activeDataModal?.reduce((total, row) => {
                                      return (
                                        total +
                                        activeReference?.sizes?.reduce((subtotal, size) => {
                                          return (
                                            subtotal + Number(row.sizes?.[size.id]?.quantity || 0)
                                          )
                                        }, 0)
                                      )
                                    }, 0) > 0
                                  }
                                />
                              </td>
                              <td
                                className={`justify-content-between gap-2 text-center align-middle ${errors?.[row.location] ? 'd-flex' : ''}`}
                                style={{ ...thStyle, minWidth: '100px' }}
                              >
                                {row.location || '-'}
                              </td>
                              <td
                                className="table-input-spc py-2 px-2 text-muted text-center border-end border-light align-middle"
                                style={{ fontSize: '0.875rem' }}
                              >
                                {row.reference || '-'}
                              </td>
                              {activeReference?.sizes?.map((size) => {
                                const sizeBalances = calculateCascadeStockForSize(
                                  size.id,
                                  activeDataAux,
                                  activeDataModal,
                                )

                                const originalQty = row.sizes[size.id]?.quantity || 0
                                const remainingQty = sizeBalances[row.location] ?? originalQty
                                const isModified = remainingQty !== originalQty
                                return (
                                  <td
                                    key={size.id}
                                    className="table-input-spc py-2 px-2 text-muted text-center border-end border-light align-middle"
                                  >
                                    <div className="d-flex align-items-center justify-content-center gap-1 table-input border-0 shadow-none py-1 font-inter w-100 text-center">
                                      {isModified && (
                                        <>
                                          <span className="text-muted text-decoration-line-through small">
                                            {originalQty}
                                          </span>
                                          <span
                                            className="text-muted small"
                                            style={{ fontSize: '0.75rem' }}
                                          >
                                            ➔
                                          </span>
                                        </>
                                      )}

                                      <span
                                        className={`${
                                          remainingQty === 0
                                            ? 'text-danger'
                                            : isModified
                                              ? 'text-success'
                                              : 'text-dark'
                                        }`}
                                      >
                                        {remainingQty}
                                      </span>
                                    </div>
                                  </td>
                                )
                              })}
                              <td className="table-input-spc py-2 px-2 text-muted text-center border-end border-light align-middle fw-bold">
                                {Object.values(row.sizes || {}).reduce((acc, size) => {
                                  return acc + size.quantity
                                }, 0)}
                              </td>
                            </tr>
                          )
                        })}
                        <tr className="font-poppins">
                          <td
                            colSpan={3}
                            className="text-center align-middle"
                            style={{ ...thStyle }}
                          >
                            TOTALES:
                          </td>
                          {activeReference?.sizes?.map((size) => {
                            return (
                              <td
                                className="py-3 px-2 text-center border-end border-light fw-bold font-inter"
                                style={{ fontSize: '13px' }}
                              >
                                {activeDataAux?.reduce((acc, row) => {
                                  return acc + row.sizes[size.id].quantity
                                }, 0)}
                              </td>
                            )
                          })}
                          <td
                            className="text-primary py-3 px-2 text-center border-end border-light fw-bold font-inter"
                            style={{ fontSize: '13px' }}
                          >
                            {activeDataAux?.reduce((total, row) => {
                              return (
                                total +
                                activeReference?.sizes?.reduce((subtotal, size) => {
                                  return subtotal + Number(row.sizes[size.id].quantity || 0)
                                }, 0)
                              )
                            }, 0)}
                          </td>
                        </tr>
                        <tr className="font-poppins">
                          <td
                            colSpan={3}
                            className="text-center align-middle"
                            style={{ ...thStyle }}
                          >
                            DISPONIBLE PARA REASIGNAR:
                          </td>
                          {activeReference?.sizes?.map((size) => {
                            const state = availablePerSize[size.id]
                            return (
                              <td
                                key={size.id}
                                className={`py-3 px-2 text-center border-end border-light fw-bold font-inter ${state?.isNegative ? 'text-danger bg-danger-subtle' : 'text-success'}`}
                                style={{ fontSize: '13px' }}
                              >
                                {state?.remaining ?? 0}
                              </td>
                            )
                          })}
                          <td
                            className="text-primary py-3 px-2 text-center border-end border-light fw-bold font-inter"
                            style={{ fontSize: '13px' }}
                          >
                            {Object.values(availablePerSize).reduce(
                              (acc, curr) => acc + (curr.remaining || 0),
                              0,
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="table-responsive border rounded mt-2">
                    <table
                      className="table align-middle mb-0"
                      style={{
                        width: '100%',
                        borderCollapse: 'separate',
                        borderSpacing: 0,
                      }}
                    >
                      <thead style={{ backgroundColor: '#fdfdfd' }}>
                        <tr className="font-poppins">
                          <th
                            rowSpan={2}
                            className="text-center align-middle"
                            style={{ ...thStyle, minWidth: '100px' }}
                          >
                            -
                          </th>
                          <th
                            rowSpan={2}
                            className="text-center align-middle"
                            style={{ ...thStyle, minWidth: '200px' }}
                          >
                            REFERENCIA
                          </th>
                          <th
                            colSpan={sizes.length}
                            className="text-center align-middle"
                            style={{ ...thStyleGroup }}
                          >
                            TALLAS
                          </th>
                          <th
                            rowSpan={2}
                            className="text-center align-middle"
                            style={{ ...thStyle, minWidth: '90px' }}
                          >
                            TOTAL
                          </th>
                        </tr>
                        <tr className="font-poppins">
                          {sizes.map((size) => {
                            const isSizeAvailable = hasSizeInActiveReference(size.id)
                            return (
                              <th
                                className="text-center"
                                style={{
                                  ...thStyleGroup,
                                  backgroundColor: isSizeAvailable
                                    ? '#F8FAFC'
                                    : 'rgb(250, 250, 250)',
                                  color: isSizeAvailable ? undefined : 'rgb(195 195 195)',
                                  minWidth: '100px',
                                }}
                              >
                                {size.name}
                              </th>
                            )
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {activeDataModal?.map((row, rowIndex) => (
                          <tr
                            key={row.location}
                            className={`font-inter ${errors?.[row.location] ? 'table-row-error' : ''}`}
                          >
                            <td
                              className={`justify-content-between gap-2 text-center align-middle ${errors?.[row.location] ? 'd-flex' : ''}`}
                              style={{ ...thStyle, minWidth: '100px' }}
                            >
                              {row.location || '-'}
                              {errors?.[row.location] && (
                                <CPopover
                                  visible={openPopover?.location === row.location}
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
                                      {errors?.[row.location].map((err, i) => (
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
                                    style={{
                                      cursor: 'pointer',
                                      color: '#ef4444',
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setOpenPopover((prev) => {
                                        if (prev?.location === row.location) {
                                          return null
                                        }
                                        return { location: row.location }
                                      })
                                    }}
                                  >
                                    <BadgeAlert size={16} />
                                  </span>
                                </CPopover>
                              )}
                            </td>
                            <td
                              className="py-2 px-2 text-muted text-center border-end border-light align-middle"
                              style={{ fontSize: '0.875rem' }}
                            >
                              {row.location !== 'STARA' ? (
                                <Select
                                  value={
                                    options.find((option) => option.value === row.product_id) ??
                                    null
                                  }
                                  options={options}
                                  onChange={(selected) =>
                                    handleChangeReference(row.location, selected.value)
                                  }
                                  isSearchable
                                  filterOption={customFilterOption}
                                  className="font-inter w-100"
                                  placeholder="Seleccione..."
                                  menuPortalTarget={document.body}
                                  menuPosition="fixed"
                                  styles={getSelectStylesInsertUniq()}
                                />
                              ) : options_stara.length > 0 ? (
                                <Select
                                  value={
                                    options_stara.find(
                                      (option) => option.value === row.product_id,
                                    ) ?? null
                                  }
                                  options={options_stara}
                                  onChange={(selected) =>
                                    handleChangeReference(row.location, selected.value)
                                  }
                                  isSearchable
                                  filterOption={customFilterOption}
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
                                    setModalAddProduct(true)
                                  }}
                                >
                                  <Plus size={14} />
                                  <span>Agregar producto</span>
                                </CButton>
                              )}
                            </td>
                            {console.log(row.sizes)}
                            {sizes.map((size) => {
                              const isSizeAvailable = hasSizeInActiveReference(size.id)
                              return (
                                <td
                                  key={size.id}
                                  className="py-2 px-2 text-muted text-center border-end border-light align-middle"
                                  style={{
                                    backgroundColor: isSizeAvailable
                                      ? '#FFFFFF'
                                      : 'rgb(250, 250, 250)',

                                    transition: 'background-color 0.2s ease',
                                  }}
                                >
                                  <CFormInput
                                    type="number"
                                    min={0}
                                    step={1}
                                    value={
                                      focusedInput?.row === rowIndex &&
                                      focusedInput?.size === size.id &&
                                      row.sizes?.[size.id]?.quantity === 0
                                        ? ''
                                        : (row.sizes?.[size.id]?.quantity ?? 0)
                                    }
                                    style={{
                                      color: isSizeAvailable
                                        ? undefined
                                        : 'rgb(195 195 195) !important',
                                    }}
                                    className={`table-input border-0 shadow-none py-1 font-inter w-100 text-center ${!isSizeAvailable ? 'size-unavailable' : ''}`}
                                    onFocus={() =>
                                      setFocusedInput({
                                        row: rowIndex,
                                        size: size.id,
                                      })
                                    }
                                    onBlur={() => {
                                      if (row.sizes[size.id].quantity === '') {
                                        handleChange(rowIndex, size.id, 0)
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
                                        handleChange(rowIndex, size.id, value)
                                      }
                                    }}
                                    disabled={!row.product_id}
                                  />
                                </td>
                              )
                            })}
                            <td className="table-input-spc py-2 px-2 text-muted text-center border-end border-light align-middle fw-bold">
                              {Object.values(row.sizes || {}).reduce((acc, size) => {
                                return acc + size.quantity
                              }, 0)}
                            </td>
                          </tr>
                        ))}
                        <tr className="font-poppins">
                          <td
                            colSpan={2}
                            className="text-center align-middle"
                            style={{ ...thStyle }}
                          >
                            TOTALES:
                          </td>
                          {sizes.map((size) => {
                            const isSizeAvailable = hasSizeInActiveReference(size.id)
                            return (
                              <td
                                className="py-3 px-2 text-center border-end border-light fw-bold font-inter"
                                style={{
                                  fontSize: '13px',
                                  backgroundColor: isSizeAvailable
                                    ? '#FFFFFF'
                                    : 'rgb(250, 250, 250)',
                                  color: isSizeAvailable ? undefined : 'rgb(195 195 195)',
                                }}
                              >
                                {activeDataModal?.reduce((acc, row) => {
                                  return acc + (row.sizes?.[size.id]?.quantity ?? 0)
                                }, 0)}
                              </td>
                            )
                          })}
                          <td
                            className="text-primary py-3 px-2 text-center border-end border-light fw-bold font-inter"
                            style={{ fontSize: '13px' }}
                          >
                            {activeDataModal?.reduce((total, row) => {
                              return (
                                total +
                                sizes.reduce((subtotal, size) => {
                                  return subtotal + Number(row.sizes?.[size.id]?.quantity ?? 0)
                                }, 0)
                              )
                            }, 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-success text-white fw-bold px-2 py-2 rounded">
                  <ArrowDownRight size={14} className="me-1" /> TABLA DE DESTINO (REASIGNACIÓN)
                </span>
              </div>
              <div className="table-responsive border rounded mb-2">
                <table
                  className="table align-middle mb-0"
                  style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: 0,
                  }}
                >
                  <thead style={{ backgroundColor: '#fdfdfd' }}>
                    <tr className="font-poppins">
                      <th
                        rowSpan={2}
                        className="text-center align-middle"
                        style={{ ...thStyle, minWidth: '100px' }}
                      >
                        -
                      </th>
                      <th
                        rowSpan={2}
                        className="text-center align-middle"
                        style={{ ...thStyle, minWidth: '200px' }}
                      >
                        REFERENCIA
                      </th>
                      <th
                        colSpan={sizes.length}
                        className="text-center align-middle"
                        style={{ ...thStyleGroup }}
                      >
                        TALLAS
                      </th>
                      <th
                        rowSpan={2}
                        className="text-center align-middle"
                        style={{ ...thStyle, minWidth: '90px' }}
                      >
                        TOTAL
                      </th>
                    </tr>
                    <tr className="font-poppins">
                      {sizes.map((size) => {
                        return (
                          <th
                            className="text-center"
                            style={{
                              ...thStyleGroup,
                              minWidth: '100px',
                            }}
                          >
                            {size.name}
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {totalDestinationData?.map((row, rowIndex) => (
                      <tr
                        key={row.location}
                        className={`font-inter ${errors?.[row.location] ? 'table-row-error' : ''}`}
                      >
                        <td
                          className={`justify-content-between gap-2 text-center align-middle ${errors?.[row.location] ? 'd-flex' : ''}`}
                          style={{ ...thStyle, minWidth: '100px' }}
                        >
                          {row.location || '-'}
                          {errors?.[row.location] && (
                            <CPopover
                              visible={openPopover?.location === row.location}
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
                                  {errors?.[row.location].map((err, i) => (
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
                                style={{
                                  cursor: 'pointer',
                                  color: '#ef4444',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenPopover((prev) => {
                                    if (prev?.location === row.location) {
                                      return null
                                    }
                                    return { location: row.location }
                                  })
                                }}
                              >
                                <BadgeAlert size={16} />
                              </span>
                            </CPopover>
                          )}
                        </td>
                        <td
                          className="py-2 px-2 text-muted text-center border-end border-light align-middle"
                          style={{ fontSize: '0.875rem' }}
                        >
                          {row.location !== 'STARA' ? (
                            <Select
                              value={
                                options.find((option) => option.value === row.product_id) ?? null
                              }
                              options={options}
                              isSearchable
                              filterOption={customFilterOption}
                              className="font-inter w-100"
                              placeholder="Seleccione..."
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              styles={getSelectStylesInsertUniq()}
                            />
                          ) : options_stara.length > 0 ? (
                            <Select
                              value={
                                options_stara.find((option) => option.value === row.product_id) ??
                                null
                              }
                              options={options_stara}
                              isSearchable
                              filterOption={customFilterOption}
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
                                setModalAddProduct(true)
                              }}
                            >
                              <Plus size={14} />
                              <span>Agregar producto</span>
                            </CButton>
                          )}
                        </td>
                        {sizes.map((size) => {
                          return (
                            <td
                              key={size.id}
                              className="py-2 px-2 text-muted text-center border-end border-light align-middle"
                            >
                              <span className="table-input border-0 shadow-none py-1 font-inter w-100 text-center">
                                {row.sizes?.[size.id]?.quantity ?? 0}
                              </span>
                            </td>
                          )
                        })}
                        <td className="table-input-spc py-2 px-2 text-muted text-center border-end border-light align-middle fw-bold">
                          {Object.values(row.sizes || {}).reduce((acc, size) => {
                            return acc + size.quantity
                          }, 0)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-poppins">
                      <td colSpan={2} className="text-center align-middle" style={{ ...thStyle }}>
                        TOTALES:
                      </td>
                      {sizes.map((size) => {
                        return (
                          <td
                            className="py-3 px-2 text-center border-end border-light fw-bold font-inter"
                            style={{
                              fontSize: '13px',
                            }}
                          >
                            {totalDestinationBySize[size.id] ?? 0}
                          </td>
                        )
                      })}
                      <td
                        className="text-primary py-3 px-2 text-center border-end border-light fw-bold font-inter"
                        style={{ fontSize: '13px' }}
                      >
                        {Object.values(totalDestinationBySize).reduce(
                          (total, quantity) => total + Number(quantity || 0),
                          0,
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            size="sm"
            onClick={() => {
              setModalAddSpecification(false)
              setSelectedReference(null)
              setDataAux(null)
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
            onClick={() => handleSubmit()}
          >
            <Save size={16} />
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ModalAddReassignmentCurve
