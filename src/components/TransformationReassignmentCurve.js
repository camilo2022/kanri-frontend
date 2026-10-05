import {
  CFormInput,
  CButton,
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
  Plus,
  TextInitial,
  BadgeAlert,
  BadgeCheck,
  Save,
  Layers,
  ArrowDownRight,
} from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { thStyle, thStyleGroup } from '@/components/StyleManagementCollection'
import Select from 'react-select'
import { getSelectStylesInsertUniq } from '@/components/StyleManagementCollection'

const TransformationReassignmentCurve = ({
  production_order,
  technical_sheet,
  product,
  sizes,
  sizes_now,
  dataOrigin,
  errors,
  trademarks,
  product_stara,
  data,
  setData,
  formData,
  reasigned,
  setReasigned,
  validated,
  formDataStara,
  setFormDataStara,
  findTrademarkByCode,
  productStara,
  setProductStara,
}) => {
  const [modalAddProductStara, setModalAddProductStara] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)
  const [openPopover, setOpenPopover] = useState({
    id: null,
  })
  const [selectedRows, setSelectedRows] = useState({
    NACIONAL: false,
    MEDELLIN: false,
    STARA: false,
  })

  const isInvalidTrademarkStara = !!errors?.['product_stara.trademark_id']
  const isValidTrademarkStara =
    !errors?.['product_stara.trademark_id'] && formDataStara.trademark_id !== '' && validated
  const isInvalidCategoryStara = validated
  const isValidCategoryStara = validated
  const isInvalidSubcategoryStara = !!errors?.['product_stara.subcategory_id']
  const isValidSubcategoryStara =
    !errors?.['product_stara.subcategory_id'] && formDataStara.subcategory_id !== '' && validated

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

  const hasAvailableUnits = (row) => {
    return sizes?.some((size) => Number(row?.sizes?.[size.id]?.quantity || 0) > 0)
  }

  const handleChange = (rowIndex, sizeId, value) => {
    const inputQuantity = value === '' ? 0 : Number(value)
    const currentQuantityInRow = Number(data[rowIndex]?.sizes?.[sizeId]?.quantity || 0)

    if (!sizeLimits[sizeId]) {
      setData((prev) =>
        prev.map((row, index) => {
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
      )

      return
    }

    const currentAssignedOthers = (sizeLimits[sizeId].assigned || 0) - currentQuantityInRow
    const maxAllowedForThisInput = (sizeLimits[sizeId].maxAvailable || 0) - currentAssignedOthers

    if (inputQuantity > maxAllowedForThisInput) {
      return
    }

    setData((prev) =>
      prev.map((row, index) => {
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
    )
  }

  const handleChangeReference = (location, value) => {
    setData((prev) =>
      prev.map((row) => {
        if (row.location !== location) return row

        return {
          ...row,
          ['product_id']: value,
        }
      }),
    )
  }

  const availablePerSize = useMemo(() => {
    if (!reasigned || !sizes || !dataOrigin || !data) {
      return {}
    }

    const result = {}

    sizes.forEach((size) => {
      const sizeId = size.id

      const stockAvailable = dataOrigin.reduce((sum, row) => {
        if (!selectedRows[row.location]) {
          return sum
        }

        return sum + Number(row.sizes?.[sizeId]?.quantity || 0)
      }, 0)

      const requested = data.reduce((sum, row) => {
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
  }, [reasigned, sizes, dataOrigin, data, selectedRows])

  const sizeLimits = useMemo(() => {
    if (!reasigned || !sizes_now || !dataOrigin || !data) {
      return {}
    }

    const limits = {}

    sizes_now.forEach((size) => {
      const sizeId = size.id

      const sizeExistsInOrigin = dataOrigin.some(
        (row) => selectedRows[row.location] && row.sizes?.[sizeId] !== undefined,
      )

      if (!sizeExistsInOrigin) {
        return
      }

      const originalTotal = dataOrigin.reduce((sum, row) => {
        if (!selectedRows[row.location]) {
          return sum
        }

        return sum + Number(row.sizes?.[sizeId]?.quantity || 0)
      }, 0)

      const assignedTotal = data.reduce((sum, row) => {
        return sum + Number(row.sizes?.[sizeId]?.quantity || 0)
      }, 0)

      limits[sizeId] = {
        maxAvailable: originalTotal,
        assigned: assignedTotal,
        remaining: originalTotal - assignedTotal,
      }
    })

    return limits
  }, [reasigned, sizes_now, dataOrigin, data, selectedRows])

  const options = formData.reference
    ? [
        {
          value: null,
          label: '-',
        },
        {
          value: formData.reference,
          label: formData.reference,
        },
      ]
    : []

  const options_stara = productStara
    ? [
        {
          value: null,
          label: '-',
        },
        {
          value: productStara.code,
          label: productStara.code,
        },
      ]
    : []

  const calculateCascadeStockForSize = (sizeId, dataOrigin, data) => {
    if (!reasigned) {
      return dataOrigin.reduce((acc, row) => {
        acc[row.location] = Number(row.sizes?.[sizeId]?.quantity || 0)
        return acc
      }, {})
    }

    const locationOrder = ['NACIONAL', 'MEDELLIN', 'STARA']

    let pendingDemand = data?.reduce((total, row) => {
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

  return (
    <>
      <div>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary text-white fw-bold px-2 py-2 rounded">
              <Layers size={14} className="me-1" />{' '}
              {`CURVA DE ORIGEN REF. ${technical_sheet.product.code} - ${production_order.cut}`}
            </span>
          </div>
        </div>
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
                  colSpan={technical_sheet?.product?.trademark?.sizes?.length}
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
                {technical_sheet?.product?.trademark?.sizes?.map((size) => {
                  return (
                    <th
                      key={size.id}
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
                          data?.reduce((total, row) => {
                            return (
                              total +
                              sizes_now?.reduce((subtotal, size) => {
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
                    {sizes?.map((size) => {
                      const sizeBalances = calculateCascadeStockForSize(size.id, dataOrigin, data)

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
                                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
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
                <td colSpan={3} className="text-center align-middle" style={{ ...thStyle }}>
                  TOTALES:
                </td>
                {sizes?.map((size) => {
                  return (
                    <td
                      key={size.id}
                      className="py-3 px-2 text-center border-end border-light fw-bold font-inter"
                      style={{ fontSize: '13px' }}
                    >
                      {dataOrigin?.reduce((acc, row) => {
                        return acc + row.sizes[size.id].quantity
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
                      sizes?.reduce((subtotal, size) => {
                        return subtotal + Number(row.sizes[size.id].quantity || 0)
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
                  {sizes?.map((size) => {
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
        {sizes_now?.length > 0 && (
          <>
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
                      colSpan={sizes_now.length}
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
                    {sizes_now.map((size) => {
                      return (
                        <th
                          key={size.id}
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
                  {data?.map((row, rowIndex) => (
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
                            onChange={(selected) =>
                              handleChangeReference(row.location, selected.value)
                            }
                            isSearchable
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
                            onChange={(selected) =>
                              handleChangeReference(row.location, selected.value)
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
                      {sizes_now.map((size) => (
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
                                : row.sizes[size.id]?.quantity
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
                          return acc + size.quantity
                        }, 0)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-poppins">
                    <td colSpan={2} className="text-center align-middle" style={{ ...thStyle }}>
                      TOTALES:
                    </td>
                    {sizes_now.map((size) => {
                      return (
                        <td
                          key={size.id}
                          className="py-3 px-2 text-center border-end border-light fw-bold font-inter"
                          style={{ fontSize: '13px' }}
                        >
                          {data?.reduce((acc, row) => {
                            return acc + row.sizes[size.id]?.quantity
                          }, 0)}
                        </td>
                      )
                    })}
                    <td
                      className="text-primary py-3 px-2 text-center border-end border-light fw-bold font-inter"
                      style={{ fontSize: '13px' }}
                    >
                      {data?.reduce((total, row) => {
                        return (
                          total +
                          sizes_now.reduce((subtotal, size) => {
                            return subtotal + Number(row.sizes[size.id]?.quantity || 0)
                          }, 0)
                        )
                      }, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
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
                invalid={!!errors?.['product_stara.code']}
                valid={!errors?.['product_stara.code'] && formDataStara.code !== '' && validated}
                className="font-montserrat input-custom"
              />
              <CFormFeedback invalid>
                {errors?.['product_stara.code']?.map((error, index) => (
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
                invalid={!!errors?.['product_stara.trademark_id']}
                valid={
                  !errors?.['product_stara.trademark_id'] &&
                  formDataStara.trademark_id !== '' &&
                  validated
                }
              />
              <CFormFeedback invalid className={isInvalidTrademarkStara ? 'd-block' : 'd-none'}>
                {errors?.['product_stara.trademark_id']?.map((error, index) => (
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
                invalid={!!errors?.['product_stara.trademark_id']}
                valid={
                  !errors?.['product_stara.trademark_id'] &&
                  formDataStara.trademark_id !== '' &&
                  validated
                }
              />
              <CFormFeedback invalid>
                {errors?.['product_stara.trademark_id']?.map((error, index) => (
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
                value={formData.category ? formData.category : ''}
                disabled
                className="font-montserrat custom-input"
                invalid={!!errors?.['product_stara.category_id']}
                valid={
                  !errors?.['product_stara.category_id'] &&
                  formDataStara.category_id !== '' &&
                  validated
                }
              />
              <CFormFeedback invalid className={isInvalidCategoryStara ? 'd-block' : 'd-none'}>
                {errors?.['product_stara.category_id']?.map((error, index) => (
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
                value={formData.subcategory ? formData.subcategory : ''}
                disabled
                className="font-montserrat custom-input"
                invalid={!!errors?.['product_stara.subcategory_id']}
                valid={
                  !errors?.['product_stara.subcategory_id'] &&
                  formDataStara.subcategory_id !== '' &&
                  validated
                }
              />
              <CFormFeedback invalid className={isInvalidSubcategoryStara ? 'd-block' : 'd-none'}>
                {errors?.['product_stara.subcategory_id']?.map((error, index) => (
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
              setModalAddProductStara(false)
              setProductStara({
                code: formDataStara.code,
                trademark_id: formDataStara.trademark_id,
              })
            }}
          >
            <Save size={16} />
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default TransformationReassignmentCurve
