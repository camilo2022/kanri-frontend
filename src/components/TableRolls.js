import { CFormInput, CButton, CTooltip, CPopover } from '@coreui/react'
import { Plus, Trash2, ClipboardPaste, ScissorsLineDashed, Shell, BadgeAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'
import Select from 'react-select'
import { getSelectStylesInsert } from '@/components/StyleManagementCollection'
import { thStyle, thStyleGroup } from '@/components/StyleManagementCollection'
import LoadingForm from '@/components/LoadingForm'

const TableRolls = ({
  rollsAux,
  setRollsAux,
  setModalAddRoll,
  errors,
  validated,
  rolls,
  fetchRolls,
  supply_type,
  fabric_id,
}) => {
  const [editing, setEditing] = useState({})
  const [rows, setRows] = useState([])
  const [openPopover, setOpenPopover] = useState({
    id: null,
  })

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

  const loadRolls = async () => {
    if (rolls) return
    try {
      await fetchRolls(supply_type.id)
    } catch (error) {
      console.error(error)
    }
  }

  if (!supply_type) {
    return (
      <LoadingForm
        title="Cargando tipos de insumos"
        subtitle="Un momento mientras se carga la información..."
        height="400px"
      />
    )
  }

  const rollsArray = rollsAux ? Object.values(rollsAux) : []

  const totalMetros = rollsArray.reduce((sum, item) => {
    const val = parseFloat(item?.meters)
    return !isNaN(val) ? sum + val : sum
  }, 0)

  const totalDisponibles = rollsArray.reduce((sum, item) => {
    const val = parseFloat(item?.available)
    return !isNaN(val) ? sum + val : sum
  }, 0)

  const totalUtilizados = rollsArray.reduce((sum, item) => {
    const val = parseFloat(item?.utilized)
    return !isNaN(val) ? sum + val : sum
  }, 0)

  return (
    <>
      <div
        className="bg-white border rounded-3 overflow-hidden mt-3"
        style={{ borderColor: '#E2E8F0' }}
      >
        <div
          className={`d-flex align-items-center justify-content-between px-3 py-2 ${errors?.['rolls'] ? 'header-switch-container-error' : ''}`}
          style={{ borderBottom: '1px solid #E2E8F0' }}
        >
          <div className="d-flex align-items-center text-center gap-2">
            <div className="bg-white p-2 rounded shadow-sm">
              <Shell size={18} style={{ color: '#C21111' }} />
            </div>
            <span
              className="fw-semibold font-montserrat justify-content-center gap-2"
              style={{
                fontSize: '.88rem',
                color: '#0F172A',
              }}
            >
              ROLLOS DE TELA A UTILIZAR
            </span>
            {errors?.['rolls'] && (
              <CPopover
                visible={openPopover?.table === 'rolls'}
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
                    {errors?.['rolls'].map((err, i) => (
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
                      if (prev?.table === 'rolls') {
                        return null
                      }
                      return { table: 'rolls' }
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
              size="sm"
              className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
              disabled={!fabric_id}
              onClick={async () => {
                setModalAddRoll(true)
                await loadRolls()
              }}
            >
              <Plus size={16} /> Agregar Rollo
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
                  style={{ ...thStyle, minWidth: '250px' }}
                >
                  TELA
                </th>
                <th colSpan={5} className="text-center align-middle" style={{ ...thStyleGroup }}>
                  ROLLO
                </th>
                <th
                  rowSpan={2}
                  className="text-center align-middle"
                  style={{ ...thStyle, minWidth: '90px' }}
                >
                  ACCIONES
                </th>
              </tr>
              <tr className="font-poppins">
                <th
                  className="text-center"
                  style={{
                    ...thStyleGroup,
                    minWidth: '120px',
                  }}
                >
                  NOMBRE
                </th>
                <th
                  className="text-center"
                  style={{
                    ...thStyleGroup,
                    minWidth: '120px',
                  }}
                >
                  ANCHO
                </th>
                <th
                  className="text-center"
                  style={{
                    ...thStyleGroup,
                    minWidth: '120px',
                  }}
                >
                  METROS
                </th>
                <th
                  className="text-center"
                  style={{
                    ...thStyleGroup,
                    minWidth: '100px',
                  }}
                >
                  DISPONIBLES
                </th>
                <th
                  className="text-center"
                  style={{
                    ...thStyleGroup,
                    minWidth: '100px',
                  }}
                >
                  UTILIZAR
                </th>
              </tr>
            </thead>
            <tbody>
              {!!rollsAux && Object.values(rollsAux).length > 0 ? (
                <>
                  {Object.entries(rollsAux).map(([index, value]) => (
                    <tr key={index}>
                      <td
                        key={`${index}-fabric`}
                        className={`py-2 px-2 text-muted text-center border-end border-light align-middle ${validated && errors?.[index]?.[field.field] ? 'table-cell-errors' : ''} ${validated === false ? (editing[index]?.includes(field.field) ? 'table-cell-modified' : rows.includes(index) ? 'table-cell-row-modified' : '') : ''}`}
                        style={{ minWidth: '350px' }}
                      >
                        <span className="table-input font-inter">
                          {`${value.supply_id.name} - ${value.supply_id.description}`}{' '}
                        </span>
                      </td>
                      <td
                        key={`${index}-name`}
                        className={`py-2 px-2 text-muted text-center border-end border-light align-middle ${validated && errors?.[index]?.[field.field] ? 'table-cell-errors' : ''} ${validated === false ? (editing[index]?.includes(field.field) ? 'table-cell-modified' : rows.includes(index) ? 'table-cell-row-modified' : '') : ''}`}
                      >
                        <span className="table-input font-inter">{value.name}</span>
                      </td>
                      <td
                        key={`${index}-width`}
                        className={`py-2 px-2 text-muted text-center border-end border-light align-middle ${validated && errors?.[index]?.[field.field] ? 'table-cell-errors' : ''} ${validated === false ? (editing[index]?.includes(field.field) ? 'table-cell-modified' : rows.includes(index) ? 'table-cell-row-modified' : '') : ''}`}
                      >
                        <span className=" table-input font-inter">{value.width}</span>
                      </td>
                      <td
                        key={`${index}-meters`}
                        className={`py-2 px-2 text-muted text-center border-end border-light align-middle ${validated && errors?.[index]?.[field.field] ? 'table-cell-errors' : ''} ${validated === false ? (editing[index]?.includes(field.field) ? 'table-cell-modified' : rows.includes(index) ? 'table-cell-row-modified' : '') : ''}`}
                      >
                        <span className="table-input font-inter">{value.meters}</span>
                      </td>
                      <td
                        key={`${index}-available`}
                        className={`py-2 px-2 text-muted text-center border-end border-light align-middle ${validated && errors?.[index]?.[field.field] ? 'table-cell-errors' : ''} ${validated === false ? (editing[index]?.includes(field.field) ? 'table-cell-modified' : rows.includes(index) ? 'table-cell-row-modified' : '') : ''}`}
                      >
                        <span className="table-input font-inter">{value.available}</span>
                      </td>
                      <td
                        key={`${index}-used`}
                        className={`py-2 px-2 text-muted text-center border-end border-light align-middle ${validated && errors?.[index]?.[field.field] ? 'table-cell-errors' : ''} ${validated === false ? (editing[index]?.includes(field.field) ? 'table-cell-modified' : rows.includes(index) ? 'table-cell-row-modified' : '') : ''}`}
                      >
                        <CFormInput
                          type="number"
                          min={0}
                          max={value.available}
                          value={value.utilized || ''}
                          onChange={(e) => {
                            const input = e.target.value
                            if (input === '') {
                              setRollsAux((prev) => ({
                                ...prev,
                                [index]: {
                                  ...prev[index],
                                  utilized: 0,
                                },
                              }))
                              return
                            }
                            const utilized = Number(input)
                            if (utilized <= value.available) {
                              setRollsAux((prev) => ({
                                ...prev,
                                [index]: {
                                  ...prev[index],
                                  utilized,
                                },
                              }))
                            }
                          }}
                          className="table-input border-0 shadow-none py-1 font-inter w-100 text-center"
                        />
                      </td>
                      <td
                        className={`py-2 px-4 border-light align-middle ${rows.includes(index) ? 'table-cell-row-modified' : ''}`}
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
                    <td
                      colSpan={3}
                      className="py-3 px-4 border-end border-light text-end fw-bold font-montserrat text-dark"
                      style={{ fontSize: '13px' }}
                    >
                      TOTALES:
                    </td>

                    <td
                      className="py-3 px-2 text-center border-end border-light fw-bold font-inter"
                      style={{ fontSize: '13px' }}
                    >
                      {totalMetros} m
                    </td>
                    <td
                      className="py-3 px-2 text-center border-end border-light fw-bold font-inter"
                      style={{ fontSize: '13px' }}
                    >
                      {totalDisponibles} m
                    </td>
                    <td
                      className="py-3 px-2 text-center border-end border-light fw-bold font-inter"
                      style={{ fontSize: '13px' }}
                    >
                      {totalUtilizados} m
                    </td>
                    <td className=""></td>
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

export default TableRolls
