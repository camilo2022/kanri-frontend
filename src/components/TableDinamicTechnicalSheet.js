import {
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormTextarea,
  CFormCheck,
  CTooltip,
  CPopover,
} from '@coreui/react'
import { BadgeAlert, Database, Info, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'
import Select from 'react-select'
import { getSelectStylesInsert } from '@/components/StyleManagementCollection'

const TableDinamicTechnicalSheet = ({
  process_id,
  structure,
  values,
  catalogsData,
  models,
  status,
  setDinamicValues,
  dataGet,
  errors,
  validated,
  loadCatalog,
}) => {
  const [editing, setEditing] = useState({})
  const [rows, setRows] = useState([])
  const [openPopover, setOpenPopover] = useState({
    row: null,
    field: null,
  })

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

  const handleChange = (aux, field, value) => {
    setRows((prev) => (prev.includes(aux) ? prev : [...prev, aux]))
    setEditing((prev) => ({
      ...prev,
      [aux]: prev[aux]?.includes(field) ? prev[aux] : [...(prev[aux] || []), field],
    }))
    setDinamicValues((prev) => {
      prev[process_id][aux][field] = value
      structure.body
        .filter((f) => f.type === 'derived')
        .forEach((f) => {
          const modelDepend = Object.values(models).find((model) => model.field === f.depend)

          const auxModelDepend = Object.values(models).find(
            (model) => model.model === modelDepend?.param,
          )

          const derivedValue =
            catalogsData[
              modelDepend?.param
                ? `${modelDepend.model}_${prev[process_id][aux][auxModelDepend?.field]}`
                : modelDepend?.model
            ]?.[prev[process_id][aux][f.depend]]?.[f.column]
          if (!Array.isArray(derivedValue)) {
            prev[process_id][aux][f.field] = derivedValue ?? null
          }
        })

      clearChildren(prev[process_id][aux], field)
      return prev
    })
  }

  const handleDeleteRow = async (index) => {
    const result = await Swal.fire({
      title: 'Eliminar Fila',
      html: `<div style="font-size:14px">
                 Se eliminará la fila. La información ingresada sera eliminada.<br/>
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

    setDinamicValues((prev) => {
      const { [index]: deleted, ...restPrev } = prev[process_id]
      return {
        ...prev,
        [process_id]: {
          ...restPrev,
        },
      }
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
      {structure?.header && (
        <div className="p-2 bg-light border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3 flex-grow-1">
            <div className="bg-white p-2 rounded shadow-sm">
              <Database size={18} style={{ color: '#C21111' }} />
            </div>
            <div className="d-flex flex-column w-100">
              <div className="d-flex align-items-center gap-2">
                <div className="position-relative flex-grow-1" style={{ maxWidth: '300px' }}>
                  <span
                    size="sm"
                    className="fw-bold font-poppins shadow-none transition-all border-0 p-0 bg-transparent custom-input-readonly"
                    style={{
                      fontSize: '17px',
                      color: '#C21111',
                      minWidth: '200px',
                    }}
                  >
                    {structure?.header || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <CButton
              color="primary"
              size="sm"
              className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
              onClick={() => {
                const ids = Object.values(values ?? {}).map((item) => Number(item.id))
                const newId = ids.length === 0 ? 1 : Math.max(...ids) + 1

                setDinamicValues((prev) => ({
                  ...prev,
                  [process_id]: {
                    ...prev[process_id],
                    [newId]: {
                      id: newId,
                    },
                  },
                }))
              }}
              disabled={!status}
            >
              <Plus size={16} /> Agregar Fila
            </CButton>
          </div>
        </div>
      )}
      <div className="table-responsive">
        {structure?.body?.length > 0 ? (
          <CTable align="middle" className="mb-0 border-0">
            <CTableHead style={{ backgroundColor: '#fdfdfd' }}>
              <CTableRow>
                {structure?.body?.map((field, index) => (
                  <CTableHeaderCell
                    key={field.id}
                    className="py-3 px-4 border-end border-light position-relative group-hover"
                    style={{ minWidth: '350px' }}
                  >
                    <div className="d-flex align-items-center justify-content-between gap-3 w-100">
                      <div className="d-flex align-items-center gap-1">
                        <span
                          className="text-dark fw-bold font-montserrat"
                          style={{ fontSize: '14px', whiteSpace: 'nowrap' }}
                        >
                          {field.label}
                        </span>
                        {field.rules.includes('required') && (
                          <span className="text-danger fw-bold" title="Requerido">
                            *
                          </span>
                        )}
                      </div>
                    </div>
                  </CTableHeaderCell>
                ))}
                <CTableHeaderCell className="py-3 px-4 border-end border-light position-relative group-hover">
                  <div className="d-flex align-items-center justify-content-between gap-3 w-100">
                    <span
                      className="text-dark fw-bold font-montserrat"
                      style={{ fontSize: '14px', whiteSpace: 'nowrap' }}
                    >
                      {'ACCIONES'}
                    </span>
                  </div>
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {!!values && Object.values(values).length > 0 ? (
                Object.entries(values).map(([index, value]) => (
                  <CTableRow key={index}>
                    {structure?.body?.map((field, aux) => {
                      const modelParam = Object.values(models).find(
                        (model) => model.model === field.param,
                      )?.field

                      const dependencyValue = field.param ? value?.[modelParam] : null
                      const catalogKey =
                        field.param && dependencyValue
                          ? `${field.model}_${dependencyValue}`
                          : field.model

                      if (
                        field.type === 'selectdinamic' &&
                        field.param &&
                        dependencyValue &&
                        !catalogsData[catalogKey]
                      ) {
                        loadCatalog(field.model, modelParam, dependencyValue)
                      }

                      const options =
                        field.type === 'select'
                          ? Object.values(field.options || {}).map((opt) => ({
                              value: opt.trim(),
                              label: opt.trim(),
                            }))
                          : !field.param
                            ? Object.values(catalogsData?.[field.model] || {}).map((opt) => {
                                const optionPath = Object.entries(models).find(
                                  ([_, value]) => value?.model === field?.model,
                                )?.[1]?.option
                                return {
                                  value: opt.id,
                                  label: dataGet(optionPath, opt, ''),
                                }
                              })
                            : Object.values(
                                catalogsData?.[`${field.model}_${dependencyValue}`] || {},
                              ).map((opt) => {
                                const optionPath = Object.entries(models).find(
                                  ([_, value]) => value?.model === field?.model,
                                )?.[1]?.option
                                return {
                                  value: opt.id,
                                  label: dataGet(optionPath, opt, ''),
                                }
                              })

                      const isParamReady = !field.param || !!value?.[modelParam]

                      const modelDepend = Object.values(models).find(
                        (model) => model.field === field.depend,
                      )

                      const auxModelDepend = Object.values(models).find(
                        (model) => model.model === modelDepend.param,
                      )

                      const derivedValue =
                        catalogsData[
                          modelDepend.param
                            ? `${modelDepend?.model}_${value?.[auxModelDepend?.field]}`
                            : `${modelDepend?.model}`
                        ]?.[value?.[field?.depend]]?.[field.column.replace(/_id$/, '')]
                      const isArray = Array.isArray(derivedValue)

                      const error_data_cell =
                        errors?.[
                          `technical_sheet_details.${process_id}.settings.dinamic.values.${index}.${field.field}`
                        ]

                      return (
                        <CTableDataCell
                          key={aux}
                          className={`py-2 px-4 text-muted border-end border-light align-middle ${validated && error_data_cell ? 'table-cell-errors' : ''} ${validated === false ? (editing[index]?.includes(field.field) ? 'table-cell-modified' : rows.includes(index) ? 'table-cell-row-modified' : '') : ''}`}
                          style={{ minWidth: '350px' }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            {field.type !== 'select' && field.type !== 'selectdinamic' ? (
                              field.type === 'textarea' ? (
                                <CFormTextarea
                                  size="sm"
                                  rows={1}
                                  value={value?.[field.field]}
                                  placeholder="Ingrese..."
                                  onChange={(e) => handleChange(index, field.field, e.target.value)}
                                  disabled={!status}
                                  className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer me-auto w-100 h-100 custom-input"
                                />
                              ) : field.type === 'boolean' ? (
                                <CFormCheck
                                  checked={
                                    value?.[field.field] === true || value?.[field.field] === 'true'
                                  }
                                  onChange={(e) =>
                                    handleChange(index, field.field, e.target.checked)
                                  }
                                  disabled={!status}
                                  className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer me-auto w-100 h-100 custom-input"
                                />
                              ) : field.type === 'derived' ? (
                                isArray ? (
                                  <Select
                                    value={
                                      derivedValue
                                        .map((opt) => ({
                                          value: opt.id,
                                          label: !opt.settings.code
                                            ? opt.name
                                            : `${opt.settings.code} - ${opt.name}`,
                                        }))
                                        .find(
                                          (opt) =>
                                            String(opt.value) === String(value?.[field.field]),
                                        ) || ''
                                    }
                                    options={derivedValue.map((opt) => ({
                                      value: opt.id,
                                      label: !opt.settings.code
                                        ? opt.name
                                        : `${opt.settings.code} - ${opt.name}`,
                                    }))}
                                    onChange={(selected) =>
                                      handleChange(index, field.field, selected?.value ?? null)
                                    }
                                    isSearchable
                                    filterOption={customFilterOption}
                                    className="font-inter w-100"
                                    style={{ fontSize: '11px', with: '100%' }}
                                    placeholder="Seleccione una opción"
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={getSelectStylesInsert()}
                                    isDisabled={!status || !isParamReady}
                                  />
                                ) : (
                                  <CFormInput
                                    size="sm"
                                    type="text"
                                    value={derivedValue?.name ?? derivedValue ?? ''}
                                    disabled
                                    className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer me-auto w-100 h-100 custom-input"
                                  />
                                )
                              ) : (
                                <CFormInput
                                  size="sm"
                                  type={field.type}
                                  value={value?.[field.field]}
                                  placeholder="Ingrese..."
                                  disabled={!status}
                                  onChange={(e) => handleChange(index, field.field, e.target.value)}
                                  className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer me-auto w-100 h-100 custom-input"
                                />
                              )
                            ) : (
                              <Select
                                value={
                                  options.find(
                                    (opt) => String(opt.value) === String(value?.[field.field]),
                                  ) || ''
                                }
                                options={options}
                                onChange={(selected) => {
                                  handleChange(index, field.field, selected?.value ?? null)
                                }}
                                isSearchable
                                filterOption={customFilterOption}
                                className="font-inter w-100"
                                style={{ fontSize: '11px', with: '100%' }}
                                placeholder="Seleccione una opción"
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={getSelectStylesInsert()}
                                isDisabled={!status || !isParamReady}
                              />
                            )}
                            {error_data_cell && (
                              <CPopover
                                visible={
                                  openPopover?.row === index && openPopover?.field === field.field
                                }
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
                                      if (prev?.row === index && prev?.field === field.field) {
                                        return null
                                      }
                                      return {
                                        row: index,
                                        field: field.field,
                                      }
                                    })
                                  }}
                                >
                                  <BadgeAlert size={16} />
                                </span>
                              </CPopover>
                            )}
                          </div>
                        </CTableDataCell>
                      )
                    })}
                    <CTableDataCell
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
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell
                    colSpan={999}
                    className="text-center"
                    style={{ minWidth: '350px' }}
                  >
                    Sin registros
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        ) : (
          <div className="p-5 text-center bg-light rounded-bottom">
            <div className="mb-3">
              <Info size={40} className="text-muted opacity-50" />
            </div>
            <h6 className="font-montserrat fw-bold text-secondary">Tabla no definida</h6>
          </div>
        )}
      </div>
    </>
  )
}

export default TableDinamicTechnicalSheet
