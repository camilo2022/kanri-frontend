import { CFormInput, CBadge, CPopover } from '@coreui/react'
import { RulerDimensionLine, BadgeAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { thStyle } from '@/components/StyleManagementCollection'

const TableLengthCurveGroup = ({ sizes, rows, aux, setAux, errors, larges }) => {
  const [focusedInput, setFocusedInput] = useState(null)
  const [openPopover, setOpenPopover] = useState({})

  const handleChange = (quantity, value) => {
    setAux((prev) =>
      prev.map((item) =>
        item.quantity === quantity
          ? {
              ...item,
              large: value,
            }
          : item,
      ),
    )
  }

  useEffect(() => {
    if (rows.length === 0) return

    const cantidades = {}

    rows.forEach((row) => {
      Object.values(row.sizes).forEach((size) => {
        if (size.quantity === 0) return

        if (!cantidades[size.quantity]) {
          cantidades[size.quantity] = []
        }

        cantidades[size.quantity].push(size.name)
      })
    })

    setAux((prev) =>
      Object.entries(cantidades).map(([quantity, sizes]) => ({
        quantity: Number(quantity),
        sizes,
        large:
          prev.find((x) => x.quantity === Number(quantity))?.large ??
          larges?.[quantity]?.large ??
          '',
      })),
    )
  }, [rows, larges])

  return (
    <>
      <div className="bg-white border rounded-3 overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <div
          className="d-flex align-items-center justify-content-between px-3 py-2"
          style={{ borderBottom: '1px solid #E2E8F0' }}
        >
          <div className="d-flex align-items-center text-center gap-2">
            <div className="bg-white p-2 rounded shadow-sm">
              <RulerDimensionLine size={18} style={{ color: '#C21111' }} />
            </div>
            <span
              className="fw-semibold font-montserrat justify-content-center gap-2"
              style={{
                fontSize: '.88rem',
                color: '#0F172A',
              }}
            >
              LARGO POR AGRUPACIÓN DE CURVA
            </span>
          </div>
        </div>
        <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
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
                  className="text-center border-bottom align-middle"
                  style={{ ...thStyle, minWidth: '200px' }}
                >
                  LARGO
                </th>
                <th
                  className="text-center border-bottom align-middle"
                  style={{ ...thStyle, minWidth: '200px' }}
                >
                  CANTIDAD
                </th>
                <th
                  className="text-center border-bottom align-middle"
                  style={{ ...thStyle, minWidth: '200px' }}
                >
                  TALLAS
                </th>
              </tr>
            </thead>
            <tbody>
              {aux?.map((item, index) => {
                const sortedSizes = [...(item.sizes || [])].sort((a, b) => Number(a) - Number(b))
                return (
                  <tr key={item.id} className="font-inter">
                    <td
                      className={`d-flex justify-content-between py-2 px-2 text-muted text-center border-end border-light align-middle ${errors?.[index]?.large ? 'table-cell-have-errors' : ''}`}
                    >
                      <CFormInput
                        type="number"
                        step="0.01"
                        value={
                          focusedInput?.row === index && item.large === 0 ? '' : (item.large ?? '')
                        }
                        className="table-input border-0 shadow-none py-1 font-inter w-100 text-center"
                        onFocus={() =>
                          setFocusedInput({
                            row: index,
                          })
                        }
                        onBlur={() => {
                          if (item.large === '') {
                            handleChange(item.quantity, 0)
                          }

                          setFocusedInput(null)
                        }}
                        onKeyDown={(e) => {
                          if (['e', 'E', '+', '-'].includes(e.key)) {
                            e.preventDefault()
                          }
                        }}
                        onChange={(e) => {
                          const value = e.target.value

                          if (/^\d*(\.\d*)?$/.test(value)) {
                            handleChange(item.quantity, value)
                          }
                        }}
                      />
                      {errors?.[index]?.['large'] && (
                        <CPopover
                          visible={openPopover?.id === item.quantity}
                          placement="left"
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
                              {errors?.[index]?.['large']?.map((err, i) => (
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
                              paddingLeft: '4px',
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenPopover((prev) => {
                                if (prev?.id === item.quantity) {
                                  return null
                                }
                                return { id: item.quantity }
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
                      style={{ fontSize: '0.82rem' }}
                    >
                      {item.quantity || '0'}
                    </td>
                    <td
                      className="py-2 px-2 text-muted text-center border-end border-light align-middle"
                      style={{ fontSize: '0.82rem' }}
                    >
                      {sortedSizes.length > 0 ? (
                        <div className="d-flex justify-content-center flex-wrap gap-1">
                          {sortedSizes.map((size, sIdx) => (
                            <CBadge
                              key={sIdx}
                              color="light"
                              className="text-dark border"
                              style={{ fontSize: '0.75rem', fontWeight: '500' }}
                            >
                              {size}
                            </CBadge>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default TableLengthCurveGroup
