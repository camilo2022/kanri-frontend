import { CFormInput, CButton, CTooltip, CPopover } from '@coreui/react'
import { Plus, Trash2, ClipboardPaste, ScissorsLineDashed, BadgeAlert } from 'lucide-react'
import { useState } from 'react'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'
import Select from 'react-select'
import { getSelectStylesInsert } from '@/components/StyleManagementCollection'
import { thStyle } from '@/components/StyleManagementCollection'

const TablePieces = ({
  pieces,
  piecesAux,
  setPiecesAux,
  setModalPaste,
  errors,
  validated,
  formData,
}) => {
  const [editing, setEditing] = useState({})
  const [rows, setRows] = useState([])
  const [openPopover, setOpenPopover] = useState({
    id: null,
  })

  const totalQuantities = Object.values(piecesAux).reduce((sum, item) => {
    const qty = parseFloat(item?.quantity)
    return !isNaN(qty) ? sum + qty : sum
  }, 0)

  const customFilterOption = (option, rawInput) => {
    const words = rawInput.toLowerCase().split(' ')
    const label = option.label.toLowerCase()
    return words.every((word) => label.includes(word))
  }

  const handleChange = (index, field, value) => {
    setPiecesAux((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value,
      },
    }))
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

    setPiecesAux((prev) => {
      const { [index]: deleted, ...restPrev } = prev
      return restPrev
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
          className={`d-flex align-items-center justify-content-between px-3 py-2 ${errors?.['pieces'] ? 'header-switch-container-error' : ''}`}
          style={{ borderBottom: '1px solid #E2E8F0' }}
        >
          <div className="d-flex align-items-center text-center gap-2">
            <div className="bg-white p-2 rounded shadow-sm">
              <ScissorsLineDashed size={18} style={{ color: '#C21111' }} />
            </div>
            <span
              className="fw-semibold font-montserrat justify-content-center gap-2"
              style={{
                fontSize: '.88rem',
                color: '#0F172A',
              }}
            >
              PIEZAS DE LA REFERENCIA
            </span>
            {errors?.['pieces'] && (
              <CPopover
                visible={openPopover?.table === 'pieces'}
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
                    {errors?.['pieces'].map((err, i) => (
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
                      if (prev?.table === 'pieces') {
                        return null
                      }
                      return { table: 'pieces' }
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
              color="success"
              size="sm"
              className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter text-white"
              onClick={() => setModalPaste(true)}
              disabled={formData?.cut !== 'A'}
            >
              <ClipboardPaste size={16} /> Insertar filas
            </CButton>
            <CButton
              color="primary"
              size="sm"
              className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
              onClick={() => {
                const ids = Object.keys(piecesAux ?? {})
                const newId = ids.length === 0 ? 1 : Math.max(...ids) + 1

                setPiecesAux((prev) => ({
                  ...prev,
                  [newId]: {
                    piece: null,
                    quantity: 1,
                  },
                }))
              }}
              disabled={formData?.cut !== 'A'}
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
                <th className="text-center align-middle" style={{ ...thStyle, minWidth: '350px' }}>
                  PIEZA
                </th>
                <th className="text-center align-middle" style={{ ...thStyle, minWidth: '350px' }}>
                  CANTIDAD
                </th>
                <th className="text-center align-middle" style={{ ...thStyle, minWidth: '100px' }}>
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {!!piecesAux && Object.values(piecesAux).length > 0 ? (
                <>
                  {Object.entries(piecesAux).map(([index, value]) => {
                    const hasError = !!errors?.[value.piece]

                    return (
                      <tr key={index} className={hasError ? 'table-row-error' : ''}>
                        <td
                          key={`${index}-piece`}
                          className="d-flex justify-content-between py-2 px-4 text-muted border-end border-light align-middle"
                          style={{ minWidth: '350px' }}
                        >
                          <div className="w-100 d-flex align-items-center gap-2">
                            <Select
                              value={pieces?.[value?.piece] ?? null}
                              options={
                                pieces
                                  ? Object.values(pieces).filter(
                                      (piece) =>
                                        !Object.values(piecesAux).some(
                                          (aux) => aux.piece === piece.value,
                                        ),
                                    )
                                  : ''
                              }
                              onChange={(selected) => handleChange(index, 'piece', selected.value)}
                              isSearchable
                              filterOption={customFilterOption}
                              className="font-inter w-100"
                              style={{ fontSize: '11px', with: '100%' }}
                              placeholder="Seleccione una pieza"
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              styles={getSelectStylesInsert()}
                            />
                          </div>
                          {hasError && (
                            <CPopover
                              visible={openPopover?.id === value?.piece}
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
                                  {errors?.[value.piece].map((err, i) => (
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
                                    if (prev?.id === value?.piece) {
                                      return null
                                    }
                                    return { id: value?.piece }
                                  })
                                }}
                              >
                                <BadgeAlert size={16} />
                              </span>
                            </CPopover>
                          )}
                        </td>
                        <td
                          key={`${index}-quantity`}
                          className={`py-2 px-4 text-muted border-end border-light align-top ${validated && errors?.[index]?.[field.field] ? 'table-cell-errors' : ''} ${validated === false ? (editing[index]?.includes(field.field) ? 'table-cell-modified' : rows.includes(index) ? 'table-cell-row-modified' : '') : ''}`}
                          style={{ minWidth: '350px' }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <CFormInput
                              size="sm"
                              type="text"
                              value={value?.quantity}
                              placeholder="Ingrese..."
                              onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                              className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer me-auto w-100 h-100 custom-input"
                            />
                          </div>
                        </td>
                        <td
                          className={`py-2 px-4 border-light align-middle ${rows.includes(index) ? 'table-cell-row-modified' : ''}`}
                          style={{ width: '100px' }}
                        >
                          <div className="d-flex justify-content-center align-items-center h-100">
                            <CTooltip content="Eliminar" placement="top" className="font-inter">
                              <button
                                className="td-button-delete"
                                onClick={() => handleDeleteRow(index)}
                                disabled={formData?.cut !== 'A'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </CTooltip>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  <tr style={{ backgroundColor: '#F8FAFC', borderTop: '2px solid #E2E8F0' }}>
                    <td className="py-3 px-4 border-end border-light fw-bold font-montserrat text-dark">
                      <span style={{ fontSize: '13px' }}>
                        Total piezas usadas:
                        <span className="text-primary ms-1">{Object.values(piecesAux).length}</span>
                      </span>
                    </td>
                    <td
                      className="py-3 px-4 border-end border-light fw-bold font-montserrat text-dark"
                      colSpan={2}
                    >
                      <span style={{ fontSize: '13px' }}>
                        Total cantidades:{' '}
                        <span className="text-primary ms-1">{totalQuantities}</span>
                      </span>
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td
                    colSpan={999}
                    className="font-inter p-2 text-center"
                    style={{ minWidth: '350px' }}
                  >
                    Sin registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default TablePieces
