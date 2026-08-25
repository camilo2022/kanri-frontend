import {
  CFormInput,
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
import {
  ChartSpline,
  ArrowRightLeft,
  X,
  Plus,
  TextInitial,
  BadgeAlert,
  BadgeCheck,
  Save,
  Regex,
  Layers,
  ArrowDownRight,
  SolarPanel,
  Edit,
  CircleX,
} from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { thStyle, thStyleGroup } from '@/components/StyleManagementCollection'
import { Toast } from '@/components/Toast'
import Swal from 'sweetalert2'
import Select from 'react-select'
import LoadingForm from '@/components/LoadingForm'
import { getSelectStylesInsertUniq } from '@/components/StyleManagementCollection'

const ModalAddReassignmentCurveProgramation = ({
  products,
  production_order,
  fetchProducts,
  product,
  product_stara,
  sizes_data,
  curve,
  setCurve,
  onReassignmentsChange,
  onOrderChange,
  technical_sheet,
  dataModal,
  setDataModal,
  selectedReference,
  setSelectedReference,
  production_changes,
  getCurveActualized,

  sizes,
  data,
  setData,
  errors,
  openModalReasigned,
  setOpenModalReasigned,
  setModalAddProduct,
}) => {
  const [optReasigned, setOptReasigned] = useState([])
  const [selectedRows, setSelectedRows] = useState({
    NACIONAL: false,
    MEDELLIN: false,
    STARA: false,
  })

  const [dataOrigin, setDataOrigin] = useState(null)
  const [reasigned, setReasigned] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    setSelectedRows({
      NACIONAL: selectedReference?.selectedRows?.NACIONAL ?? false,
      MEDELLIN: selectedReference?.selectedRows?.MEDELLIN ?? false,
      STARA: selectedReference?.selectedRows?.STARA ?? false,
    })
  }, [selectedReference])

  useEffect(() => {
    if (!products) return

    const aux = new Map()

    products
      ?.filter((product) => product.original)
      .forEach((item) => {
        item.technical_sheet?.production_orders?.forEach((production_order_item) => {
          if (production_order_item.id === production_order.id) {
            return
          }

          aux.set(production_order_item.id, {
            label: `${item.code} - ${production_order_item.cut}`,
            code: item.code,
            value: production_order_item.id,
            specification_curve: production_order_item.production_order_details.filter(
              (item) => item.model_type === 'App\\Models\\Product',
            ),
            sizes: item.trademark?.sizes || [],
            production_order_id: production_order_item.id,
            production_order: production_order_item,
          })
        })
      })

    setOptReasigned([...aux.values()])

    const options = [...aux.values()]
  }, [products])

  useEffect(() => {
    if (!selectedReference?.specification_curve) {
      setDataOrigin(null)
      setSelectedRows({
        NACIONAL: false,
        MEDELLIN: false,
        STARA: false,
      })
      return
    }

    const curve_selected_reference = getCurveActualized?.(
      selectedReference?.production_order?.technical_sheet_id,
      selectedReference?.production_order?.id,
    )

    if (curve_selected_reference) {
      const curveData = curve_selected_reference.map((item) => ({
        id: item.id ?? null,
        location: item.destination,
        product_id: item.reference_id,
        reference: item.code,
        sizes: item.quantities.reduce((acc, aux) => {
          acc[aux.size_id] = {
            quantity: Number(aux.quantity ?? 0),
            size_id: aux.size_id,
          }

          return acc
        }, {}),
      }))

      if (selectedReference.isAvailableEdit) {
        const productionCurve = production_changes?.curve ?? []

        const curveData = curve_selected_reference.map((item) => ({
          id: item.id ?? null,
          location: item.destination,
          product_id: item.reference_id,
          reference: item.code,
          sizes: item.quantities.reduce((acc, aux) => {
            acc[aux.size_id] = {
              quantity: Number(aux.quantity ?? 0),
              size_id: aux.size_id,
            }

            return acc
          }, {}),
        }))

        const selectedLocations = ['NACIONAL', 'MEDELLIN', 'STARA'].filter(
          (location) => selectedReference.selectedRows?.[location],
        )

        const reassignedBySize = {}

        selectedReference.sizes.forEach((size) => {
          reassignedBySize[size.id] = productionCurve.reduce((total, change) => {
            const quantity = change.quantities?.find((item) => item.size_id === size.id)

            return total + Number(quantity?.quantity ?? 0)
          }, 0)
        })

        const updatedCurve = curveData.map((row) => ({
          ...row,
          sizes: Object.fromEntries(
            Object.entries(row.sizes).map(([sizeId, sizeData]) => [sizeId, { ...sizeData }]),
          ),
        }))

        selectedLocations.forEach((location) => {
          const originRow = updatedCurve.find((row) => row.location === location)

          if (!originRow) return

          selectedReference.sizes.forEach((size) => {
            const sizeId = size.id
            const amountToReturn = reassignedBySize[sizeId] ?? 0

            if (amountToReturn <= 0) return

            if (!originRow.sizes[sizeId]) {
              originRow.sizes[sizeId] = {
                quantity: 0,
                size_id: sizeId,
              }
            }

            originRow.sizes[sizeId].quantity =
              Number(originRow.sizes[sizeId].quantity ?? 0) + amountToReturn

            reassignedBySize[sizeId] = 0
          })
        })

        setDataOrigin(updatedCurve)

        return
      } else {
        setDataOrigin(curveData)
      }

      return
    }

    const data = selectedReference?.specification_curve
      .filter((item) => item.model_type === 'App\\Models\\Product')
      .map((item) => ({
        id: item.id ?? null,
        location: item.destination,
        reference: item.model?.code ?? null,
        product_id: item.model_id,

        sizes: (selectedReference.sizes ?? []).reduce((acc, size) => {
          const quantity = item.production_order_detail_quantities?.find(
            (aux) => aux.size_id === size.id,
          )

          acc[size.id] = {
            id: quantity?.id ?? null,
            size_id: size.id,
            name: size.name,
            quantity: Number(quantity?.quantity ?? 0),
          }

          return acc
        }, {}),
      }))

    const locations = ['NACIONAL', 'MEDELLIN', 'STARA']

    locations.forEach((location) => {
      if (!data.some((item) => item.location === location)) {
        data.push({
          id: null,
          location,
          reference: null,
          product_id: null,

          sizes: (selectedReference.sizes ?? []).reduce((acc, size) => {
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

    setDataOrigin(data)

    if (selectedReference.isAvailableEdit) return

    setDataModal(createEmptyDataModal())
    setSelectedRows({
      NACIONAL: false,
      MEDELLIN: false,
      STARA: false,
    })
    setReasigned(false)
  }, [selectedReference])

  useEffect(() => {
    if (!sizes_data || selectedReference?.isAvailableEdit) return

    setDataModal(
      [
        {
          location: 'NACIONAL',
          product_id: null,
        },
        {
          location: 'MEDELLIN',
          product_id: null,
        },
        {
          location: 'STARA',
          product_id: null,
        },
      ].map((item) => ({
        ...item,
        sizes: sizes_data.reduce((acc, size) => {
          acc[size.id] = {
            id: null,
            size_id: size.id,
            name: size.name,
            quantity: 0,
          }

          return acc
        }, {}),
      })),
    )
  }, [sizes_data, selectedReference])

  const [focusedInput, setFocusedInput] = useState(null)
  const [openPopover, setOpenPopover] = useState({
    id: null,
  })

  const toggleRowSelect = (location) => {
    const row = dataOrigin?.find((row) => row.location === location)

    if (!row || !hasAvailableUnits(row)) {
      return
    }

    setSelectedRows((prev) => ({
      ...prev,
      [location]: !prev[location],
    }))
  }

  useEffect(() => {
    const hasSelectedRow = Object.values(selectedRows).some(Boolean)

    setReasigned(hasSelectedRow)
  }, [selectedRows, setReasigned])

  const handleChange = (rowIndex, sizeId, value) => {
    const inputQuantity = value === '' ? 0 : Number(value)
    const currentQuantityInRow = Number(dataModal[rowIndex]?.sizes?.[sizeId]?.quantity || 0)

    const currentAssignedOthers = (sizeLimits[sizeId]?.assigned || 0) - currentQuantityInRow
    const maxAllowedForThisInput = (sizeLimits[sizeId]?.maxAvailable || 0) - currentAssignedOthers

    if (inputQuantity > maxAllowedForThisInput) {
      return
    }

    setDataModal((prev) =>
      prev.map((row, index) => {
        if (index !== rowIndex) return row
        return {
          ...row,
          sizes: {
            ...row.sizes,
            [sizeId]: {
              ...row.sizes[sizeId],
              quantity: Number(value),
            },
          },
        }
      }),
    )
  }

  const handleChangeReference = (location, value) => {
    setDataModal((prev) =>
      prev.map((row) => {
        if (row.location !== location) return row

        return {
          ...row,
          ['product_id']: value,
        }
      }),
    )
  }

  const handleChangeData = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      ['code']: value.toUpperCase(),
    }))
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
          console.log(selectedReference)

          const updatedOriginCurve = dataOrigin.map((row) => {
            const updatedSizes = {}

            selectedReference?.sizes?.forEach((size) => {
              const sizeBalances = calculateCascadeStockForSize(size.id, dataOrigin, dataModal)
              const remainingQty = sizeBalances[row.location] ?? (row.sizes[size.id]?.quantity || 0)

              updatedSizes[size.id] = {
                ...row.sizes[size.id],
                quantity: remainingQty,
              }
            })

            return {
              ...row,
              sizes: updatedSizes,
            }
          })

          onReassignmentsChange?.(technical_sheet.id, production_order.id, 'selected_reference', {
            ...selectedReference,
            isAvailableEdit: true,
            selectedRows: {
              ...selectedRows,
            },
          })

          const selectedKeys = onOrderChange?.(
            technical_sheet.id,
            production_order,
            'reasigned_curve',
            {
              reasigned_curve: true,
              production_order_id: selectedReference.production_order.id,
              selected_rows: Object.entries(selectedRows)
                .filter(([key, value]) => value === true)
                .map(([key]) => key),
            },
          )

          onOrderChange?.(
            selectedReference.production_order.technical_sheet_id,
            selectedReference.production_order,
            'curve',
            [
              ...updatedOriginCurve.map((item) => ({
                id: item.id ?? null,
                destination: item.location,
                code: item.reference,
                reference_id: item.product_id,
                quantities: Object.values(item.sizes),
              })),
            ],
          )

          onOrderChange?.(technical_sheet.id, production_order, 'curve', [
            ...dataModal.map((item) => ({
              id: item.id ?? null,
              destination: item.location,
              reference_id: item.product_id,
              quantities: Object.values(item.sizes),
            })),
          ])

          setOpenModalReasigned(false)
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
    if (!selectedReference?.sizes || !dataOrigin || !dataModal) return {}

    const result = {}

    selectedReference.sizes.forEach((size) => {
      const sizeId = size.id

      let stockAvailable = dataOrigin.reduce((sum, row) => {
        if (selectedRows[row.location]) {
          return sum + Number(row.sizes?.[sizeId]?.quantity || 0)
        }
        return sum
      }, 0)

      const requested = dataModal.reduce((sum, row) => {
        return sum + Number(row.sizes?.[sizeId]?.quantity || 0)
      }, 0)

      const remaining = stockAvailable - requested

      result[sizeId] = {
        totalSelected: stockAvailable,
        remaining: remaining,
        isNegative: remaining < 0,
      }
    })

    return result
  }, [selectedReference, dataOrigin, dataModal, selectedRows])

  const sizeLimits = useMemo(() => {
    if (!selectedReference?.sizes || !dataOrigin || !dataModal) return {}

    const limits = {}

    selectedReference.sizes.forEach((size) => {
      const sizeId = size.id

      const originalTotal = dataOrigin.reduce((sum, row) => {
        return selectedRows[row.location] ? sum + Number(row.sizes?.[sizeId]?.quantity || 0) : sum
      }, 0)

      const assignedTotal = dataModal.reduce((sum, row) => {
        return sum + Number(row.sizes?.[sizeId]?.quantity || 0)
      }, 0)

      limits[sizeId] = {
        maxAvailable: originalTotal,
        assigned: assignedTotal,
        remaining: originalTotal - assignedTotal,
      }
    })

    return limits
  }, [selectedReference, dataOrigin, dataModal, selectedRows])

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

  const hasAvailableUnits = (row) => {
    return selectedReference?.sizes?.some(
      (size) => Number(row?.sizes?.[size.id]?.quantity || 0) > 0,
    )
  }

  const calculateCascadeStockForSize = (sizeId, dataOrigin, dataModal) => {
    if (!reasigned) {
      return dataOrigin.reduce((acc, row) => {
        acc[row.location] = Number(row.sizes?.[sizeId]?.quantity || 0)
        return acc
      }, {})
    }

    const locationOrder = ['NACIONAL', 'MEDELLIN', 'STARA']

    let pendingDemand = dataModal.reduce((total, row) => {
      return total + Number(row.sizes?.[sizeId]?.quantity || 0)
    }, 0)

    const finalBalances = {}

    locationOrder.forEach((loc) => {
      const auxRow = dataOrigin.find((r) => r.location === loc)
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

  const createEmptyDataModal = () => {
    return ['NACIONAL', 'MEDELLIN', 'STARA'].map((location) => ({
      location,
      product_id: null,

      sizes: (sizes_data ?? []).reduce((acc, size) => {
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

  return (
    <>
      <CModal
        visible={openModalReasigned}
        onClose={() => {
          setOpenModalReasigned(false)
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
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="d-inline-flex align-items-center rounded bg-primary text-white">
              <div
                className="d-flex align-items-center px-2"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                <Layers size={14} className="me-1" />
                TABLA DE ORIGEN (STOCK DISPONIBLE)
              </div>

              <div
                style={{
                  width: '1px',
                  height: '22px',
                  backgroundColor: 'rgba(255,255,255,0.35)',
                }}
              />

              <div
                style={{
                  minWidth: '230px',
                  height: '100%',
                }}
              >
                <Select
                  options={optReasigned}
                  value={selectedReference}
                  onChange={(selected) => {
                    const reference = optReasigned.find(
                      (option) => option.value === selected?.value,
                    )

                    setSelectedReference(reference ?? null)
                  }}
                  isSearchable
                  placeholder="Seleccionar curva..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      height: '38px',
                      minHeight: '38px',
                      border: 'none',
                      borderRadius: 0,
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                      cursor: 'pointer',
                    }),

                    valueContainer: (base) => ({
                      ...base,
                      padding: '0 8px',
                    }),

                    singleValue: (base) => ({
                      ...base,
                      color: '#fff',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }),

                    placeholder: (base) => ({
                      ...base,
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '0.78rem',
                    }),

                    input: (base) => ({
                      ...base,
                      color: '#fff',
                      fontSize: '0.78rem',
                    }),

                    indicatorSeparator: () => ({
                      display: 'none',
                    }),

                    dropdownIndicator: (base) => ({
                      ...base,
                      color: '#fff',
                      padding: '4px 8px',
                      '&:hover': {
                        color: '#fff',
                      },
                    }),

                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 999999,
                    }),

                    menu: (base) => ({
                      ...base,
                      minWidth: '70px',
                    }),

                    option: (base, state) => ({
                      ...base,
                      fontFamily: 'Inter',
                      fontSize: '0.9rem',
                      color: '#334155',
                      backgroundColor: state.isSelected
                        ? '#EFF6FF'
                        : state.isFocused
                          ? '#F8FAFC'
                          : '#fff',
                    }),
                  }}
                />
              </div>
            </div>
          </div>
          {selectedReference && (
            <div className="table-responsive mb-4 border rounded">
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
                      colSpan={selectedReference?.sizes?.length}
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
                    {selectedReference?.sizes?.map((size) => {
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
                  {dataOrigin?.map((row, rowIndex) => {
                    const isChecked = !!selectedRows[row.location]
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
                              !hasAvailableUnits(row) ||
                              dataModal?.reduce((total, row) => {
                                return (
                                  total +
                                  sizes_data?.reduce((subtotal, size) => {
                                    return subtotal + Number(row.sizes[size.id]?.quantity || 0)
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
                        {selectedReference?.sizes?.map((size) => {
                          const sizeBalances = calculateCascadeStockForSize(
                            size.id,
                            dataOrigin,
                            dataModal,
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
                            return acc + Number(size.quantity)
                          }, 0)}
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="font-poppins">
                    <td colSpan={3} className="text-center align-middle" style={{ ...thStyle }}>
                      TOTALES:
                    </td>
                    {selectedReference?.sizes?.map((size) => {
                      return (
                        <td
                          className="py-3 px-2 text-center border-end border-light fw-bold font-inter"
                          style={{ fontSize: '13px' }}
                        >
                          {dataOrigin?.reduce((acc, row) => {
                            return acc + Number(row.sizes?.[size.id]?.quantity ?? 0)
                          }, 0)}
                        </td>
                      )
                    })}
                    <td
                      className="text-primary py-3 px-2 text-center border-end border-light fw-bold font-inter"
                      style={{ fontSize: '13px' }}
                    >
                      {dataOrigin?.reduce((total, row) => {
                        return (
                          total +
                          selectedReference?.sizes?.reduce((subtotal, size) => {
                            return subtotal + Number(row.sizes?.[size.id]?.quantity ?? 0)
                          }, 0)
                        )
                      }, 0)}
                    </td>
                  </tr>
                  {reasigned && (
                    <tr className="font-poppins">
                      <td colSpan={3} className="text-center align-middle" style={{ ...thStyle }}>
                        DISPONIBLE PARA REASIGNAR:
                      </td>
                      {selectedReference?.sizes?.map((size) => {
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
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-success text-white fw-bold px-2 py-2 rounded">
              <ArrowDownRight size={14} className="me-1" /> TABLA DE DESTINO (REASIGNACIÓN)
            </span>
          </div>
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
                  {sizes_data.map((size) => {
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
                {dataModal?.map((row, rowIndex) => (
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
                          value={options.find((option) => option.value === row.product_id) ?? null}
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
                            options_stara.find((option) => option.value === row.product_id) ?? null
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
                    {sizes_data.map((size) => (
                      <td
                        key={size.id}
                        className="py-2 px-2 text-muted text-center border-end border-light align-middle"
                      >
                        <CFormInput
                          type="number"
                          min={0}
                          step={1}
                          value={
                            focusedInput?.row === rowIndex &&
                            focusedInput?.size === size.id &&
                            row.sizes[size.id].quantity === 0
                              ? ''
                              : row.sizes[size.id].quantity
                          }
                          className="table-input border-0 shadow-none py-1 font-inter w-100 text-center"
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
                    ))}
                    <td className="table-input-spc py-2 px-2 text-muted text-center border-end border-light align-middle fw-bold">
                      {Object.values(row.sizes || {}).reduce((acc, size) => {
                        return acc + Number(size.quantity)
                      }, 0)}
                    </td>
                  </tr>
                ))}
                <tr className="font-poppins">
                  <td colSpan={2} className="text-center align-middle" style={{ ...thStyle }}>
                    TOTALES:
                  </td>
                  {sizes_data.map((size) => {
                    return (
                      <td
                        className="py-3 px-2 text-center border-end border-light fw-bold font-inter"
                        style={{ fontSize: '13px' }}
                      >
                        {dataModal?.reduce((acc, row) => {
                          return acc + Number(row.sizes?.[size.id]?.quantity ?? 0)
                        }, 0)}
                      </td>
                    )
                  })}
                  <td
                    className="text-primary py-3 px-2 text-center border-end border-light fw-bold font-inter"
                    style={{ fontSize: '13px' }}
                  >
                    {dataModal?.reduce((total, row) => {
                      return (
                        total +
                        sizes.reduce((subtotal, size) => {
                          return subtotal + Number(row.sizes[size.id].quantity || 0)
                        }, 0)
                      )
                    }, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CModalBody>
        <CModalFooter className="mt-2">
          <CButton
            color="secondary"
            size="sm"
            onClick={() => {
              setOpenModalReasigned(false)
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

export default ModalAddReassignmentCurveProgramation
