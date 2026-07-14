import { CFormInput, CButton, CFormSelect } from '@coreui/react'
import { ChartSpline, ArrowRightLeft, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { thStyle, thStyleGroup } from '@/components/StyleManagementCollection'
import LoadingForm from '@/components/LoadingForm'

const TableCurveSpecifications = ({
  pieces,
  piecesAux,
  setPiecesAux,
  rollsAux,
  setRollsAux,
  setModalAddRoll,
  structure,
  models,
  errors,
  validated,
  rolls,
  fetchRolls,
  supply_type,
  products,
  fetchProducts,
  product,
  sizes,
  data,
  setData,
}) => {
  const [focusedInput, setFocusedInput] = useState(null)
  const [openPopover, setOpenPopover] = useState({
    row: null,
    field: null,
  })

  const clearChildren = (row, parentField) => {
    structure.body.forEach((item) => {
      let depends = false

      if (item.param) {
        const modelParam = Object.values(models).find((model) => model.model === item.param)?.field

        if (modelParam === parentField) {
          depends = true
        }
      }

      if (item.depend === parentField) {
        depends = true
      }

      if (depends) {
        row[item.field] = null

        clearChildren(row, item.field)
      }
    })
  }

  useEffect(() => {
    const closePopover = () => setOpenPopover(null)
    document.addEventListener('click', closePopover)
    return () => {
      document.removeEventListener('click', closePopover)
    }
  }, [])

  const loadReferences = async () => {
    if (products) return
    try {
      await fetchProducts()
    } catch (error) {
      console.error(error)
    }
  }

  if (!supply_type) {
    return (
      <LoadingForm
        title="Cargando variantes"
        subtitle="Un momento mientras se carga la información..."
        height="400px"
      />
    )
  }

  const [isSelectingRef, setIsSelectingRef] = useState(false)
  const [selectedReference, setSelectedReference] = useState('')

  const handleChange = (rowIndex, sizeId, value) => {
    setData((prev) =>
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

  return (
    <>
      <div
        className="bg-white border rounded-3 overflow-hidden mt-3"
        style={{ borderColor: '#E2E8F0' }}
      >
        <div
          className="d-flex align-items-center justify-content-between px-3 py-2"
          style={{ borderBottom: '1px solid #E2E8F0' }}
        >
          <div className="d-flex align-items-center text-center gap-2">
            <div className="bg-white p-2 rounded shadow-sm">
              <ChartSpline size={18} style={{ color: '#C21111' }} />
            </div>
            <span
              className="fw-semibold font-montserrat justify-content-center gap-2"
              style={{
                fontSize: '.88rem',
                color: '#0F172A',
              }}
            >
              ESPECIFICACIONES DE CURVA
            </span>
          </div>
          <div className="d-flex align-items-center gap-2 font-inter">
            {!isSelectingRef && selectedReference ? (
              <div className="d-flex align-items-center gap-2 bg-light py-2 px-2 border-0 shadow-sm rounded-2 smooth-transition">
                <span
                  className="small font-poppins text-dark fw-medium smooth-transition"
                  style={{ fontSize: '0.82rem' }}
                >
                  <span className="text-muted fw-normal me-1">Ref. reasignada:</span>
                  <span className="text-dark fw-semibold">{products[selectedReference].label}</span>
                </span>
                <CButton
                  size="sm"
                  color="light"
                  className="rounded-circle p-0 d-flex align-items-center justify-content-center border-0 btn-close-ref"
                  onClick={() => {
                    setSelectedReference('')
                    setIsSelectingRef(false)
                  }}
                >
                  <X size={12} className="text-secondary" />
                </CButton>
              </div>
            ) : isSelectingRef ? (
              <div className="d-flex flex-column align-items-end smooth-transition position-relative">
                <span
                  className="text-muted font-poppins fw-medium mb-1 px-1"
                  style={{ fontSize: '0.68rem', letterSpacing: '0.3px' }}
                >
                  SELECCIONE REFERENCIA PARA REASIGNAR LOTE
                </span>

                <div className="d-flex align-items-center gap-2">
                  <CFormSelect
                    size="sm"
                    className="custom-select-clean font-inter shadow-sm"
                    style={{
                      minWidth: '280px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      paddingTop: '0.35rem',
                      paddingBottom: '0.35rem',
                    }}
                    value={selectedReference ?? ''}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setSelectedReference(val)
                      setIsSelectingRef(false)
                    }}
                  >
                    <option value="">Seleccionar referencia</option>
                    {Array.isArray(Object.values(products || {})) &&
                      Object.values(products || {}).map((ref) => (
                        <option key={ref.value} value={ref.value}>
                          {ref.label}
                        </option>
                      ))}
                  </CFormSelect>

                  <CButton
                    size="sm"
                    variant="ghost"
                    className="border-0 text-muted px-2 font-poppins fw-medium"
                    style={{ fontSize: '0.8rem' }}
                    onClick={() => setIsSelectingRef(false)}
                  >
                    Cancelar
                  </CButton>
                </div>
              </div>
            ) : (
              <CButton
                size="sm"
                className="d-flex align-items-center gap-2 px-3 shadow-sm text-white fw-normal btn-reasignar-lote smooth-transition"
                onClick={async () => {
                  setIsSelectingRef(true)
                  await loadReferences()
                }}
              >
                <ArrowRightLeft size={14} style={{ color: '#FFFFFF' }} /> Reasignar Lote
              </CButton>
            )}
          </div>
        </div>
        <div className="table-responsive">
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
              {data?.map((row, rowIndex) => (
                  <tr key={row.location} className="font-inter">
                    <td
                      className="text-center align-middle"
                      style={{ ...thStyle, minWidth: '100px' }}
                    >
                      {row.location || '-'}
                    </td>
                    <td
                      className="py-2 px-2 text-muted text-center border-end border-light align-middle"
                      style={{ fontSize: '0.875rem' }}
                    >
                      {row.reference || '-'}
                    </td>
                    {sizes.map((size) => (
                      <td
                        key={size.id}
                        className="py-2 px-2 text-muted text-center border-end border-light align-middle"
                      >
                        <CFormInput
                          type="number"
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
                          onChange={(e) => handleChange(rowIndex, size.id, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="table-input py-2 px-2 text-muted text-center border-end border-light align-middle fw-bold">
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
                      style={{ fontSize: '13px' }}
                    >
                      {data?.reduce((acc, row) => {
                        return acc + row.sizes[size.id].quantity
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
      </div>
    </>
  )
}

export default TableCurveSpecifications
