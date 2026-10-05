import { CFormInput, CFormTextarea, CFormCheck, CPopover } from '@coreui/react'
import { BadgeAlert, Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import Select from 'react-select'
import { getSelectStylesInsert } from '@/components/StyleManagementCollection'

const TableStaticTechnicalSheet = ({
  process_id,
  structure,
  setStaticValues,
  values,
  catalogsData,
  models,
  status,
  dataGet,
  errors,
}) => {
  const [openPopover, setOpenPopover] = useState({
    field: null,
  })

  const customFilterOption = (option, rawInput) => {
    const words = rawInput.toLowerCase().split(' ')
    const label = option.label.toLowerCase()
    return words.every((word) => label.includes(word))
  }

  const handleChange = (field, value) => {
    setStaticValues((prev) => ({
      ...prev,
      [process_id]: {
        ...prev[process_id],
        [field]: value,
      },
    }))
  }

  useEffect(() => {
    const closePopover = () => setOpenPopover(null)
    document.addEventListener('click', closePopover)
    return () => {
      document.removeEventListener('click', closePopover)
    }
  }, [])

  return (
    <div
      className="border rounded-3 shadow-sm bg-white font-inter"
      style={{
        width: '100%',
        overflowX: 'auto',
      }}
    >
      {(structure?.body?.length ?? 0) > 0 || Object.keys(structure?.header || {}).length > 0 ? (
        <table
          style={{
            width: '100%',
            minWidth: 'max-content',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              <th
                colSpan={structure?.header?.colspan}
                className="p-3 text-center font-inter position-relative fw-bold"
                style={{
                  fontSize: '17px',
                  color: '#C21111',
                  textTransform: 'uppercase',
                }}
              >
                {structure?.header.label || ''}
              </th>
            </tr>
          </thead>
          {structure.body?.length > 0 ? (
            <tbody>
              {structure.body?.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => {
                    const cellBaseStyle = {
                      padding: '15px',
                      border: '1px solid #e9ecef',
                      verticalAlign: 'middle',
                      textAlign: 'center',
                      position: 'relative',
                    }
                    const options =
                      cell.type === 'select'
                        ? Object.values(cell.options).map((opt) => ({
                            value: opt.trim(),
                            label: opt.trim(),
                          }))
                        : Object.values(catalogsData[cell.model] || {})?.map((opt) => {
                            const optionPath = Object.entries(models).find(
                              ([_, value]) => value?.model === cell?.model,
                            )?.[1]?.option

                            return {
                              value: opt.id,
                              label: dataGet(optionPath, opt, ''),
                            }
                          }) || []

                    const nextCell = row[j + 1]
                    const isRequired =
                      cell.cell === 'th' &&
                      nextCell?.cell === 'td' &&
                      nextCell?.rules?.includes('required')

                    const error_data_cell =
                      cell.cell === 'td'
                        ? errors?.[
                            `technical_sheet_details.${process_id}.settings.static.values.${cell.field}`
                          ]
                        : null

                    return (
                      <td
                        key={j}
                        colSpan={cell.colspan}
                        rowSpan={cell.rowspan}
                        style={{
                          ...cellBaseStyle,
                          backgroundColor:
                            cell.cell === 'th' ? '#f8f9fa' : error_data_cell ? '#fee2e2' : '#fff',
                        }}
                        className="preview-cell"
                      >
                        <div className="d-flex align-items-center w-100 gap-2">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center justify-content-center">
                              {cell.cell === 'th' ? (
                                <span
                                  className="fw-bold text-secondary font-poppins"
                                  style={{ fontSize: '13px' }}
                                >
                                  {cell.label}{' '}
                                  {isRequired && (
                                    <span className="text-danger fw-bold" title="Requerido">
                                      *
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <div
                                  className="d-flex align-items-center gap-2"
                                  style={{ minWidth: '100%' }}
                                >
                                  {cell.type !== 'select' && cell.type !== 'selectdinamic' ? (
                                    cell.type === 'textarea' ? (
                                      <CFormTextarea
                                        size="sm"
                                        value={values?.[cell.field]}
                                        placeholder="Ingrese..."
                                        onChange={(e) => handleChange(cell.field, e.target.value)}
                                        disabled={!status}
                                        className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer me-auto w-100 h-100 custom-input"
                                      />
                                    ) : cell.type === 'boolean' ? (
                                      <CFormCheck
                                        checked={values?.[cell.field]}
                                        onChange={(e) => handleChange(cell.field, e.target.checked)}
                                        disabled={!status}
                                        className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer me-auto w-100 h-100 custom-input"
                                      />
                                    ) : (
                                      <CFormInput
                                        size="sm"
                                        type={cell.type}
                                        placeholder="Ingrese..."
                                        onChange={(e) => handleChange(cell.field, e.target.value)}
                                        value={values?.[cell.field]}
                                        disabled={!status}
                                        className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer me-auto w-100 h-100 custom-input"
                                      />
                                    )
                                  ) : (
                                    <Select
                                      value={options.find(
                                        (opt) => String(opt.value) === String(values?.[cell.field]),
                                      )}
                                      options={options}
                                      onChange={(selected) =>
                                        handleChange(cell.field, selected?.value ?? null)
                                      }
                                      isSearchable
                                      filterOption={customFilterOption}
                                      className="font-inter w-100"
                                      style={{ fontSize: '11px', with: '100%' }}
                                      placeholder="Seleccione..."
                                      menuPortalTarget={document.body}
                                      menuPosition="fixed"
                                      styles={getSelectStylesInsert()}
                                      isDisabled={!status}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          {error_data_cell && (
                            <CPopover
                              visible={openPopover?.field === cell?.field}
                              placement="top"
                              onHide={() => setOpenPopover(null)}
                              trigger="focus"
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
                                  {error_data_cell.map((err, i) => (
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
                                    if (prev?.field === cell?.field) {
                                      return null
                                    }
                                    return { field: cell?.field }
                                  })
                                }}
                              >
                                <BadgeAlert size={16} />
                              </span>
                            </CPopover>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={structure.header?.colspan}>
                  <div className="p-5 text-center bg-light rounded-bottom">
                    <div className="mb-3">
                      <Info size={40} className="text-muted opacity-50" />
                    </div>

                    <h6 className="font-montserrat fw-bold text-secondary">
                      Aún no hay una estructura definida
                    </h6>
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      ) : (
        <div className="p-5 text-center bg-light rounded-bottom">
          <div className="mb-3">
            <Info size={40} className="text-muted opacity-50" />
          </div>
          <h6 className="font-montserrat fw-bold text-secondary">Tabla no definida</h6>
        </div>
      )}
    </div>
  )
}

export default TableStaticTechnicalSheet
