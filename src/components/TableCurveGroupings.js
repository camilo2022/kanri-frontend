import { CFormInput, CButton, CTooltip, CFormSelect, CBadge } from '@coreui/react'
import {
  Plus,
  Trash2,
  ClipboardPaste,
  ScissorsLineDashed,
  Shell,
  ChartSpline,
  ArrowRightLeft,
  X,
  ChartNetwork,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'
import Select from 'react-select'
import { getSelectStylesInsertSpec } from '@/components/StyleManagementCollection'
import { thStyle, thStyleGroup } from '@/components/StyleManagementCollection'
import LoadingForm from '@/components/LoadingForm'

const TableCurveGroupings = ({
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
  fabric_id,
  products,
  fetchProducts,
  product,
  sizes,
  data,
  fabric,
}) => {
  const [info, setInfo] = useState(null)
  const [focusedInput, setFocusedInput] = useState(null)
  const [editing, setEditing] = useState({})
  const [openPopover, setOpenPopover] = useState({
    row: null,
    field: null,
  })
  const [quantityAux, setQuantityAux] = useState(null)
  const [limits, setLimits] = useState(null)
  const [totalPresupuestado, setTotalPresupuestado] = useState(0)

  const customFilterOption = (option, rawInput) => {
    const words = rawInput.toLowerCase().split(' ')
    const label = option.label.toLowerCase()
    return words.every((word) => label.includes(word))
  }

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

  const handleDeleteRow = async (index) => {
    const result = await Swal.fire({
      title: 'Eliminar Fila',
      html: `<div style="font-size:14px">
                 Se eliminará la fila. La información de la fila sera eliminada.<br/>
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
      Toast.fire({
        icon: 'error',
        title: 'Acción cancelada',
      })
      return false
    }

    setRollsAux((prev) => {
      const { [index]: deleted, ...restPrev } = prev
      return restPrev
    })

    Toast.fire({
      icon: 'success',
      title: 'Fila eliminada correctamente',
    })
  }

  useEffect(() => {
    const closePopover = () => setOpenPopover(null)
    document.addEventListener('click', closePopover)
    return () => {
      document.removeEventListener('click', closePopover)
    }
  }, [])

  if (!supply_type) {
    return (
      <LoadingForm
        title="Cargando informacion"
        subtitle="Un momento mientras se carga la información..."
        height="400px"
      />
    )
  }

  const handleChangeColor = (index, value) => {
    setInfo((prev) =>
      prev.map((row, ind) => {
        if (ind !== index) return row

        return {
          ...row,
          color: value,
        }
      }),
    )
  }

  const handleChange = (rowIndex, sizeId, value) => {
    setInfo((prev) =>
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

  useEffect(() => {
    if (!fabric) return

    setInfo(
      [
        {
          id: 1,
          fabric_name: `${fabric.name} - ${fabric.description}`,
          color: '',
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
  }, [fabric])

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

  const totalProducido = info?.reduce((total, row) => {
    return (
      total +
      sizes.reduce((subtotal, size) => {
        return subtotal + Number(row.sizes[size.id].quantity || 0)
      }, 0)
    )
  }, 0)

  const getDiferenciaEstilo = (diferencia) => {
    if (diferencia < 0) {
      return {
        bg: '#FEF2F2',
        border: '#FCA5A5',
        text: '#991B1B',
        icon: <TrendingDown size={18} className="text-danger me-1.5" />,
        mensaje: `Faltaron ${Math.abs(diferencia)} unidades por producir`,
        badgeColor: 'danger',
      }
    } else if (diferencia === 0) {
      return {
        bg: '#F0FDF4',
        border: '#86EFAC',
        text: '#166534',
        icon: <CheckCircle2 size={18} className="text-success me-1.5" />,
        mensaje: '¡Excelente! Se produjo la cantidad exacta presupuestada',
        badgeColor: 'success',
      }
    } else {
      return {
        bg: '#EFF6FF', // Azul pastel muy suave
        border: '#93C5FD',
        text: '#1E40AF', // Azul oscuro elegante
        icon: <TrendingUp size={18} className="text-primary me-1.5" />,
        mensaje: `Excedente de ${diferencia} unidades producidas`,
        badgeColor: 'info',
      }
    }
  }

  const configTotal = getDiferenciaEstilo(totalProducido - totalPresupuestado)

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
          </div>
          <div className="d-flex align-items-center gap-2">
            <CButton
              color="primary"
              size="sm"
              className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
              onClick={() => {
                /*
                const ids = Object.keys(piecesAux ?? {})
                const newId = ids.length === 0 ? 1 : Math.max(...ids) + 1

                setPiecesAux((prev) => ({
                  ...prev,
                  [newId]: {
                    piece: null,
                    quantity: 1,
                  },
                }))*/
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
                  className="text-center align-middle"
                  style={{ ...thStyle, minWidth: '40px' }}
                >
                  N°
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
                  style={{ ...thStyle, minWidth: '90px' }}
                >
                  TOTAL
                </th>
              </tr>
              <tr className="font-poppins">
                <th
                  className="text-center"
                  style={{
                    ...thStyleGroup,
                    minWidth: '300px',
                  }}
                >
                  NOMBRE
                </th>
                <th
                  className="text-center"
                  style={{
                    ...thStyleGroup,
                    minWidth: '200px',
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
                        minWidth: '70px',
                      }}
                    >
                      {size.name}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {info?.map((row, rowIndex) => (
                <tr key={row.id} className="font-inter">
                  <td
                    className="py-2 px-2 text-muted text-center border-end border-light align-middle"
                    style={{ minWidth: '40px', fontSize: '0.82rem' }}
                  >
                    {row.id || '-'}
                  </td>
                  <td
                    className="py-2 px-2 text-muted text-center border-end border-light align-middle"
                    style={{ minWidth: '300px', fontSize: '0.82rem' }}
                  >
                    {row.fabric_name || '-'}
                  </td>
                  <td
                    className="py-2 px-2 text-muted text-center border-end border-light align-middle"
                    style={{ fontSize: '0.875rem', minWidth: '200px' }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <Select
                        value={
                          fabric
                            ? fabric?.colors
                                ?.map((item) => ({
                                  label: `${item?.settings?.code || ''} - ${item.name}`,
                                  value: item.id,
                                }))
                                .find((item) => item.value === row.color)
                            : ''
                        }
                        options={
                          fabric
                            ? fabric?.colors?.map((item) => ({
                                label: `${item?.settings?.code || ''} - ${item.name}`,
                                value: item.id,
                              }))
                            : ''
                        }
                        onChange={(selected) => handleChangeColor(rowIndex, selected.value)}
                        isSearchable
                        filterOption={customFilterOption}
                        className="font-inter w-100 text-muted"
                        style={{ fontSize: '0.82rem', with: '100%' }}
                        placeholder="Seleccione un color"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={getSelectStylesInsertSpec()}
                      />
                    </div>
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
                        onChange={(e) => handleChange(rowIndex, size.id, e.target.value)}
                        disabled={limits && limits[size.id]?.quantity === 0}
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
                <td colSpan={3} className="text-center align-middle" style={{ ...thStyle }}>
                  TOTALES
                </td>
                {sizes.map((size) => {
                  console.log(limits)
                  console.log(
                    limits[size.id]?.quantity -
                      info?.reduce((acc, row) => {
                        return acc + row.sizes[size.id].quantity
                      }, 0),
                  )
                  return (
                    <td
                      className="py-3 px-2 text-center border-end border-light fw-bold font-inter"
                      style={{
                        fontSize: '13px',
                      }}
                    >
                      {info?.reduce((acc, row) => {
                        return acc + row.sizes[size.id].quantity
                      }, 0)}
                    </td>
                  )
                })}
                <td
                  className="text-primary py-3 px-2 text-center border-end border-light fw-bold font-inter"
                  style={{ fontSize: '13px' }}
                >
                  {info?.reduce((total, row) => {
                    return (
                      total +
                      sizes.reduce((subtotal, size) => {
                        return subtotal + Number(row.sizes[size.id].quantity || 0)
                      }, 0)
                    )
                  }, 0)}
                </td>
              </tr>
              <tr className="font-poppins">
                <td colSpan={3} className="text-center align-middle" style={{ ...thStyle }}>
                  DIFERENCIA
                </td>
                {sizes.map((size) => {
                  return (
                    <td
                      className="py-3 px-2 text-center border-end border-light fw-bold font-inter"
                      style={{ fontSize: '13px' }}
                    >
                      {Number(
                        info?.reduce((acc, row) => {
                          return acc + row.sizes[size.id].quantity
                        }, 0),
                      ) -
                        Number(
                          data?.reduce((acc, row) => {
                            return acc + row.sizes[size.id].quantity
                          }, 0),
                        )}
                    </td>
                  )
                })}
                <td
                  className="py-3 px-2 text-center border-end border-light fw-extrabold font-inter align-middle"
                  style={{
                    fontSize: '13px',
                    color: configTotal.text,
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  }}
                >
                  {totalProducido - totalPresupuestado > 0
                    ? `+${totalProducido - totalPresupuestado}`
                    : totalProducido - totalPresupuestado}
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
