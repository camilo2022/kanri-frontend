import { CFormInput, CButton, CTooltip } from '@coreui/react'
import { Plus, Trash2, ClipboardPaste, ScissorsLineDashed } from 'lucide-react'
import { useEffect, useState } from 'react'
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
  structure,
  models,
  errors,
  validated,
}) => {
  const [editing, setEditing] = useState({})
  const [rows, setRows] = useState([])
  const [openPopover, setOpenPopover] = useState({
    row: null,
    field: null,
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

  useEffect(() => {
    const closePopover = () => setOpenPopover(null)
    document.addEventListener('click', closePopover)
    return () => {
      document.removeEventListener('click', closePopover)
    }
  }, [])

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
          </div>
          <div className="d-flex align-items-center gap-2">
            <CButton
              color="success"
              size="sm"
              className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter text-white"
              onClick={() => setModalPaste(true)}
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
                  {Object.entries(piecesAux).map(([index, value]) => (
                    <tr key={index}>
                      <td
                        key={`${index}-piece`}
                        className={`py-2 px-4 text-muted border-end border-light align-top ${validated && errors?.[index]?.[field.field] ? 'table-cell-errors' : ''} ${validated === false ? (editing[index]?.includes(field.field) ? 'table-cell-modified' : rows.includes(index) ? 'table-cell-row-modified' : '') : ''}`}
                        style={{ minWidth: '350px' }}
                      >
                        <div className="d-flex align-items-center gap-2">
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
                            >
                              <Trash2 size={16} />
                            </button>
                          </CTooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
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
