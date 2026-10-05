import { CFormInput, CButton, CTooltip, CPopover } from '@coreui/react'
import {
  Plus,
  Trash2,
  ChartNetwork,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  BadgeAlert,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'
import {
  thStyle,
  thStyleGroup,
  thStyleSpc,
  thStyleSpcf,
} from '@/components/StyleManagementCollection'

const TableCurveGroupings = ({ sizes, data, fabric, rows, setRows, color, errors }) => {
  const [info, setInfo] = useState(null)
  const [focusedInput, setFocusedInput] = useState(null)
  const [limits, setLimits] = useState(null)
  const [totalPresupuestado, setTotalPresupuestado] = useState(0)
  const [openPopover, setOpenPopover] = useState({
    id: null,
  })

  const handleChange = (rowIndex, sizeId, value) => {
    const quantity = value === '' ? 0 : Number(value)

    setRows((prev) =>
      prev.map((row, index) => {
        if (index !== rowIndex) return row

        return {
          ...row,
          sizes: {
            ...row.sizes,
            [sizeId]: {
              ...row.sizes[sizeId],
              quantity: Math.max(0, quantity),
            },
          },
        }
      }),
    )
  }

  const buildSizes = () =>
    sizes.reduce((acc, size) => {
      acc[size.id] = {
        id: null,
        size_id: size.id,
        name: size.name,
        quantity: 0,
      }

      return acc
    }, {})

  useEffect(() => {
    setInfo({
      id: 1,
      fabric_name: fabric,
      color: color,
    })

    if (rows.length !== 0) return

    setRows([
      {
        id: 1,
        sizes: buildSizes(),
      },
    ])
  }, [fabric, color])

  useEffect(() => {
    if (!data) return

    setLimits(
      sizes.reduce((accAux, size) => {
        accAux[size.id] = {
          quantity: data.reduce((acc, row) => {
            return acc + row.sizes[size.id].quantity
          }, 0),
        }

        return accAux
      }, {}),
    )

    setTotalPresupuestado(
      data?.reduce((total, row) => {
        return (
          total +
          sizes.reduce((subtotal, size) => {
            return subtotal + Number(row.sizes[size.id].quantity || 0)
          }, 0)
        )
      }, 0),
    )
  }, [data])

  const totalProducido = rows?.reduce((total, row) => {
    return (
      total +
      sizes.reduce((subtotal, size) => {
        return subtotal + Number(row.sizes[size.id].quantity || 0)
      }, 0)
    )
  }, 0)

  const getCellStyle = (producido, esperado) => {
    if (info === null) return
    const diff = (producido ?? 0) - (esperado ?? 0)
    if (diff === 0) {
      return { backgroundColor: '#F0FDF4', color: '#166534' }
    } else if (diff < 0) {
      return { backgroundColor: '#FEF2F2', color: '#991B1B' }
    } else {
      return { backgroundColor: '#EFF6FF', color: '#1E40AF' }
    }
  }

  const renderStatusBadge = (producido, esperado) => {
    if (info === null) return
    const diferencia = (producido ?? 0) - (esperado ?? 0)
    if (diferencia === 0) {
      return (
        <div
          className="d-flex align-items-center justify-content-center gap-1 cursor-pointer"
          style={{ cursor: 'pointer' }}
        >
          <span className="fw-bold text-success" style={{ fontSize: '13px' }}>
            0
          </span>
          <CheckCircle2 size={13} className="text-success" />
        </div>
      )
    } else if (diferencia < 0) {
      const unidadesFaltantes = Math.abs(diferencia)
      return (
        <div
          className="d-flex align-items-center justify-content-center gap-1"
          style={{ cursor: 'pointer' }}
        >
          <span className="fw-bold text-danger" style={{ fontSize: '13px' }}>
            {diferencia}
          </span>
          <AlertTriangle size={13} className="text-danger" />
        </div>
      )
    } else {
      return (
        <div
          className="d-flex align-items-center justify-content-center gap-1"
          style={{ cursor: 'pointer' }}
        >
          <span className="fw-bold" style={{ color: '#0d6efd', fontSize: '13px' }}>
            +{diferencia}
          </span>
          <TrendingUp size={13} style={{ color: '#0d6efd' }} />
        </div>
      )
    }
  }

  const handleDeleteRow = async (index) => {
    const result = await Swal.fire({
      title: 'Eliminar Fila',
      html: `<div style="font-size:14px"> Se eliminará la fila. La información de la fila sera eliminada.<br/> <strong>¿Deseas continuar?</strong></div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) {
      Toast.fire({
        icon: 'error',
        title: 'Acción cancelada',
      })
      return false
    }

    setRows((prev) => {
      return prev.filter((item) => item.id !== index)
    })

    Toast.fire({
      icon: 'success',
      title: 'Fila eliminada correctamente',
    })
  }

  return (
    <>
      <div
        className="bg-white border rounded-3 overflow-hidden mt-3"
        style={{ borderColor: '#E2E8F0' }}
      >
        <div
          className={`d-flex align-items-center justify-content-between px-3 py-2 ${errors?.length > 0 ? 'header-switch-container-error' : ''}`}
          style={{ borderBottom: '1px solid #E2E8F0' }}
        >
          <div className="d-flex align-items-center text-center gap-2">
            <div className="bg-white p-2 rounded shadow-sm">
              <ChartNetwork size={18} style={{ color: '#C21111' }} />
            </div>
            <span
              className="fw-semibold font-montserrat justify-content-center gap-2"
              style={{
                fontSize: '.88rem',
                color: '#0F172A',
              }}
            >
              AGRUPACIONES DE CURVA
            </span>
            {errors?.length > 0 && (
              <CPopover
                visible={openPopover?.table === 'gorup'}
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
                    {errors?.map((err, i) => (
                      <div key={i} className="d-flex align-items-start gap-2 p-1 rounded-2">
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
                      if (prev?.table === 'group') {
                        return null
                      }
                      return { table: 'group' }
                    })
                  }}
                >
                  <BadgeAlert size={16} />
                </span>
              </CPopover>
            )}
          </div>
          <div className="d-flex align-items-center gap-2">
            <CButton
              color="primary"
              disabled={(rows?.length ?? 0) === 0 || (rows?.length ?? 0) === 4}
              size="sm"
              className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
              onClick={() => {
                setRows((prev) => {
                  const ids = prev.map((item) => item.id)
                  const newId = ids.length === 0 ? 1 : Math.max(...ids) + 1

                  return [
                    ...prev,
                    {
                      id: newId,
                      sizes: buildSizes(),
                    },
                  ]
                })
              }}
            >
              <Plus size={16} /> Agregar Fila
            </CButton>
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
                  className="text-center border-bottom align-middle"
                  style={{ ...thStyle, minWidth: '90px' }}
                  hidden={(rows?.length ?? 0) === 0 || (rows?.length ?? 0) === 1}
                >
                  ACCIONES
                </th>
                <th colSpan={2} className="text-center align-middle" style={{ ...thStyleGroup }}>
                  TELA
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
                  style={{ ...thStyleSpc, minWidth: '90px' }}
                >
                  TOTAL
                </th>
              </tr>
              <tr className="font-poppins">
                <th
                  className="text-center"
                  style={{
                    ...thStyleGroup,
                    minWidth: '250px',
                  }}
                >
                  NOMBRE
                </th>
                <th
                  className="text-center"
                  style={{
                    ...thStyleGroup,
                    minWidth: '150px',
                  }}
                >
                  COLOR
                </th>
                {sizes.map((size) => {
                  return (
                    <th
                      className="text-center"
                      style={{
                        ...thStyleGroup,
                        minWidth: '60px',
                      }}
                    >
                      {size.name}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rows?.map((row, rowIndex) => (
                <tr key={row.id} className="font-inter">
                  <td
                    className="py-2 px-4 border-light border-end align-middle"
                    hidden={(rows?.length ?? 0) === 0 || (rows?.length ?? 0) === 1}
                  >
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <CTooltip content="Eliminar" placement="top" className="font-inter">
                        <button
                          className="td-button-delete"
                          onClick={() => handleDeleteRow(row.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </CTooltip>
                    </div>
                  </td>
                  {rowIndex === 0 && (
                    <>
                      <td
                        className="py-2 px-2 text-muted text-center border-end border-light align-middle"
                        style={{ fontSize: '0.82rem' }}
                        rowSpan={rows.length || 0}
                      >
                        {info?.fabric_name || '-'}
                      </td>

                      <td
                        className="py-2 px-2 text-muted text-center border-end border-light align-middle"
                        style={{ fontSize: '0.875rem' }}
                        rowSpan={rows?.length || 0}
                      >
                        <div className="d-flex text-center align-items-center gap-2">
                          <span>{info?.color || '-'}</span>
                        </div>
                      </td>
                    </>
                  )}
                  {sizes.map((size) => (
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
                        className="table-input-spc border-0 shadow-none py-1 font-inter w-100 text-center"
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
                        disabled={limits && limits[size.id]?.quantity === 0}
                      />
                    </td>
                  ))}
                  <td className="table-input-spc py-2 px-2 text-muted text-center border-light align-middle fw-bold">
                    {Object.values(row.sizes).reduce((acc, size) => acc + size.quantity, 0)}
                  </td>
                </tr>
              ))}
              <tr className="font-poppins">
                <td
                  colSpan={(rows?.length ?? 0) === 0 || (rows?.length ?? 0) === 1 ? 2 : 3}
                  className="text-center align-middle"
                  style={{ ...thStyle }}
                >
                  TOTALES
                </td>
                {sizes.map((size) => {
                  return (
                    <td
                      className="py-3 px-2 text-center border-end border-light fw-bold font-inter"
                      style={{
                        fontSize: '13px',
                        ...getCellStyle(
                          rows?.reduce((acc, row) => acc + row.sizes[size.id].quantity, 0) || 0,
                          data?.reduce((acc, row) => acc + row.sizes[size.id].quantity, 0) || 0,
                        ),
                      }}
                    >
                      {rows?.reduce((acc, row) => acc + row.sizes[size.id].quantity, 0) || 0}
                    </td>
                  )
                })}
                <td
                  className="py-3 px-2 text-center border-light fw-bold font-inter"
                  style={{ fontSize: '13px', ...getCellStyle(totalProducido, totalPresupuestado) }}
                >
                  {totalProducido || 0}
                </td>
              </tr>
              <tr className="font-poppins">
                <td
                  colSpan={(rows?.length ?? 0) === 0 || (rows?.length ?? 0) === 1 ? 2 : 3}
                  className="text-center align-middle border-bottom-0"
                  style={{ ...thStyleSpcf }}
                >
                  DIFERENCIA
                </td>
                {sizes.map((size) => {
                  return (
                    <td
                      className="py-3 px-1 text-center border-end border-light font-inter align-middle border-bottom-0"
                      style={{ fontSize: '13px' }}
                    >
                      {renderStatusBadge(
                        rows?.reduce((acc, row) => acc + row.sizes[size.id].quantity, 0) || 0,
                        data?.reduce((acc, row) => acc + row.sizes[size.id].quantity, 0) || 0,
                      ) || 0}
                    </td>
                  )
                })}
                <td
                  className="py-3 px-2 text-center border-end border-light fw-extrabold font-inter align-middle"
                  style={{ backgroundColor: '#F1F5F9', fontSize: '13.5px' }}
                >
                  {renderStatusBadge(totalProducido, totalPresupuestado) || 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default TableCurveGroupings
