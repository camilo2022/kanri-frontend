import {
  CFormInput,
  CButton,
  CTable,
  CFormSelect,
  CFormFeedback,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormTextarea,
  CFormCheck,
} from '@coreui/react'
import {
  Save,
  BadgeCheck,
  BadgeAlert,
  Database,
  Info,
  Plus,
  Edit3,
  Ruler,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import FieldRules from '@/components/FieldRules'
import Swal from 'sweetalert2'
import Select from 'react-select'

const TableDinamicComponent = ({
  data,
  handleSubmitEdit,
  errors,
  validated,
  setValidated,
  models,
  catalogsData,
  dataGet,
}) => {
  const [edit, setEdit] = useState(false)
  const [structure, setStructure] = useState({
    header: '',
    body: [],
  })

  const fieldTypes = [
    {
      name: 'Texto y Contenido',
      options: [
        { value: 'text', label: 'Texto Corto (text)' },
        { value: 'textarea', label: 'Área de Texto (textarea)' },
      ],
    },
    {
      name: 'Números y Medidas',
      options: [{ value: 'number', label: 'Número (number)' }],
    },
    {
      name: 'Fechas y Tiempo',
      options: [
        { value: 'date', label: 'Fecha (date)' },
        { value: 'datetime', label: 'Fecha y Hora (datetime)' },
      ],
    },
    {
      name: 'Especiales',
      options: [
        { value: 'boolean', label: 'Si / No (Switch/Check)' },
        { value: 'select', label: 'Select estático (opciones definidas)' },
        { value: 'selectdinamic', label: 'Select dinámico (dependiente de modelo)' },
        { value: 'derived', label: 'Campo derivado (calculado desde otra columna)' },
      ],
    },
  ]

  const updateRules = (index, newRules, model = '') => {
    setStructure((prev) => {
      const newSchema = prev.body?.map((item, i) =>
        i === index
          ? model !== ''
            ? { ...item, model: models[model].model, rules: newRules }
            : { ...item, rules: newRules }
          : item,
      )

      return {
        ...prev,
        body: newSchema,
      }
    })
  }

  const updateField = (index, key, value) => {
    const newSchema = structure.body.map((item, i) => {
      if (i !== index) return item

      if (key === 'depend') {
        const aux = {
          ...item,
          [key]: value,
        }
        return {
          ...item,
          depend: value,
        }
      }

      if (key === 'column') {
        const aux = {
          ...item,
          [key]: value,
        }
        return {
          ...item,
          column: value,
        }
      }

      if (key === 'options') {
        const options = Object.fromEntries(
          value.split(',').map((option) => {
            const trimmed = option.trim()
            return [trimmed, trimmed]
          }),
        )

        const rules = item.rules || []
        const exists = rules.some((r) => r.startsWith(`in:`))
        const updatedRules = exists
          ? rules.map((r) => (r.startsWith(`in:`) ? `in:${value}` : r))
          : [...rules, `in:${value}`]

        return {
          ...item,
          options,
          rules: updatedRules,
        }
      }

      const rules = item.rules || []

      const exists = rules.some((r) => r.startsWith(`${key}:`))
      const updatedRules = exists
        ? rules.map((r) => (r.startsWith(`${key}:`) ? `${key}:${value}` : r))
        : [...rules, `${key}:${value}`]
      return {
        ...item,
        rules: updatedRules,
      }
    })

    setStructure((prev) => {
      return { ...prev, body: newSchema }
    })
  }

  const deleteColumn = async (element) => {
    const result = await Swal.fire({
      title: 'Eliminar Columna',
      html: `<div style="font-size:14px">
                  Se eliminará la columna de la estructura.<br/>
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

    const deepCopy = {
      ...structure,
      body: structure?.body || [],
    }

    const aux = deepCopy.body.filter((cell) => cell.id !== element.id)

    setStructure({
      ...deepCopy,
      body: aux,
    })
  }

  const customFilterOption = (option, rawInput) => {
    const words = rawInput.toLowerCase().split(' ')
    const label = option.label.toLowerCase()
    return words.every((word) => label.includes(word))
  }

  return (
    <div className="bg-white rounded-3 border shadow-sm overflow-hidden mb-3">
      <div className="p-2 bg-light border-bottom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3 flex-grow-1">
          <div className="bg-white p-2 rounded shadow-sm">
            <Database size={18} style={{ color: '#C21111' }} />
          </div>
          <div className="d-flex flex-column w-100">
            <span
              className="text-muted small fw-bold font-montserrat uppercase"
              style={{ fontSize: '10px', letterSpacing: '0.5px' }}
            >
              Nombre de la Tabla
            </span>
            <div className="d-flex align-items-center gap-2">
              <div className="position-relative flex-grow-1" style={{ maxWidth: '300px' }}>
                <CFormInput
                  size="sm"
                  className={`fw-bold font-poppins shadow-none transition-all ${
                    edit
                      ? 'custom-input-editing p-2'
                      : 'border-0 p-0 bg-transparent custom-input-readonly'
                  }`}
                  style={{
                    fontSize: '17px',
                    color: '#C21111',
                    minWidth: '200px',
                  }}
                  value={edit ? structure?.header || '' : data?.header || ''}
                  disabled={!edit}
                  onChange={(e) =>
                    setStructure({ ...structure, header: e.target.value.toUpperCase() })
                  }
                  invalid={!!errors?.errors?.[`settings.schema.dinamic.header`] && validated}
                  valid={
                    !errors?.errors?.[`settings.schema.dinamic.header`] &&
                    data?.header !== '' &&
                    validated
                  }
                />
                <CFormFeedback invalid>
                  {errors?.errors?.[`settings.schema.dinamic.header`]?.map((error, i) => (
                    <div key={i} className="d-flex align-items-center gap-1">
                      <BadgeAlert size={13} />
                      <small className="font-inter fw-lighter">{error}</small>
                    </div>
                  ))}
                </CFormFeedback>
                <CFormFeedback valid>
                  <div className="d-flex align-items-center gap-1">
                    <BadgeCheck size={13} />
                    <small className="font-inter fw-lighter">Dato Válido</small>
                  </div>
                </CFormFeedback>
                {edit && <div className="input-focus-line"></div>}
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          {edit ? (
            <>
              <CButton
                color="success"
                size="sm"
                className="d-flex align-items-center gap-2 font-inter btn-primary-revolve"
                onClick={async () => {
                  const success = await handleSubmitEdit('dinamic', structure)
                  setTimeout(() => {
                    if (success) {
                      setEdit(false)
                      setValidated((prev) => ({
                        ...prev,
                        ['dinamic']: false,
                      }))
                    }
                  }, 1000)
                }}
              >
                <Save size={16} /> Guardar Estructura
              </CButton>
              <CButton
                color="secondary"
                size="sm"
                className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                onClick={() => {
                  setEdit(false)
                  setStructure({})
                  setValidated((prev) => ({
                    ...prev,
                    ['dinamic']: false,
                  }))
                }}
              >
                Cancelar
              </CButton>{' '}
            </>
          ) : (
            <>
              <CButton
                color="primary"
                size="sm"
                className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                onClick={() => {
                  const deepCopy = {
                    ...data,
                    body: data.body.map((field) => ({ ...field })),
                  }
                  setStructure(deepCopy)
                  setEdit(true)
                }}
                disabled={!data?.body?.length > 0}
              >
                <Edit3 size={16} /> Editar Estructura
              </CButton>
              <CButton
                color="dark"
                size="sm"
                className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                onClick={() => {
                  const deepCopy = {
                    ...data,
                    body:
                      data?.body?.map((field) => ({
                        ...field,
                      })) || [],
                  }

                  const ids = new Set(deepCopy.body.map((v) => v.id))
                  let newId = 1
                  while (ids.has(newId)) newId++

                  const newStructure = {
                    ...deepCopy,
                    body: [...deepCopy.body, { field: '', id: newId, label: '', rules: [] }],
                  }
                  setStructure(newStructure)
                  setEdit(true)
                }}
              >
                <Plus size={16} /> Agregar Columna
              </CButton>
            </>
          )}
        </div>
      </div>
      <div className="table-responsive">
        {data?.body?.length > 0 || structure.body?.length > 0 ? (
          <CTable align="middle" className="mb-0 border-0">
            <CTableHead style={{ backgroundColor: '#fdfdfd' }}>
              <CTableRow>
                {edit ? (
                  <>
                    {structure?.body?.map((field, index) => (
                      <CTableHeaderCell
                        key={field.id}
                        className="py-3 px-3 border-end border-light bg-light-subtle position-relative"
                        style={{ minWidth: '350px' }}
                      >
                        <div
                          className="edit-overlay d-flex gap-1 position-absolute"
                          style={{ top: '5px', right: '5px' }}
                        >
                          <button
                            onClick={() => {
                              deleteColumn(field)
                            }}
                            className="btn btn-sm btn-white border shadow-sm p-1 text-danger bg-white"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="d-flex flex-column gap-2 animate-fade-in">
                          <div className="d-flex flex-column">
                            <label
                              className="text-muted"
                              style={{ fontSize: '9px', fontWeight: 'bold' }}
                            >
                              NOMBRE VISIBLE
                            </label>
                            <CFormInput
                              size="sm"
                              className="font-montserrat fw-semibold custom-input"
                              value={field.label}
                              onChange={(e) => {
                                const newSchema = structure.body.map((field, i) => {
                                  if (i === index) {
                                    return { ...field, label: e.target.value.toUpperCase() }
                                  }
                                  return field
                                })
                                setStructure({ ...structure, body: newSchema })
                              }}
                              invalid={
                                !!errors?.errors?.[`settings.schema.dinamic.body.${index}.label`] &&
                                validated
                              }
                              valid={
                                !errors?.errors?.[`settings.schema.dinamic.body.${index}.label`] &&
                                field.label !== '' &&
                                validated
                              }
                            />
                            <CFormFeedback invalid>
                              {errors?.errors?.[`settings.schema.dinamic.body.${index}.label`]?.map(
                                (error, i) => (
                                  <div key={i} className="d-flex align-items-center gap-1">
                                    <BadgeAlert size={13} />
                                    <small className="font-inter fw-lighter">{error}</small>
                                  </div>
                                ),
                              )}
                            </CFormFeedback>
                            <CFormFeedback valid>
                              <div className="d-flex align-items-center gap-1">
                                <BadgeCheck size={13} />
                                <small className="font-inter fw-lighter">Dato Válido</small>
                              </div>
                            </CFormFeedback>
                          </div>
                          <div className="d-flex flex-column">
                            <label
                              className="text-muted"
                              style={{ fontSize: '9px', fontWeight: 'bold' }}
                            >
                              NOMBRE VALOR
                            </label>
                            <CFormInput
                              size="sm"
                              className="font-inter text-primary custom-input"
                              style={{ fontSize: '12px' }}
                              value={field.field}
                              onChange={(e) => {
                                const newSchema = [...structure.body]
                                newSchema[index].field = e.target.value.toLowerCase()
                                setStructure({ ...structure, body: newSchema })
                              }}
                              invalid={
                                !!errors?.errors?.[`settings.schema.dinamic.body.${index}.field`] &&
                                validated
                              }
                              valid={
                                !errors?.errors?.[`settings.schema.dinamic.body.${index}.field`] &&
                                field.field !== '' &&
                                validated
                              }
                            />
                            <CFormFeedback invalid>
                              {errors?.errors?.[`settings.schema.dinamic.body.${index}.field`]?.map(
                                (error, i) => (
                                  <div key={i} className="d-flex align-items-center gap-1">
                                    <BadgeAlert size={13} />
                                    <small className="font-inter fw-lighter">{error}</small>
                                  </div>
                                ),
                              )}
                            </CFormFeedback>
                            <CFormFeedback valid>
                              <div className="d-flex align-items-center gap-1">
                                <BadgeCheck size={13} />
                                <small className="font-inter fw-lighter">Dato Válido</small>
                              </div>
                            </CFormFeedback>
                          </div>
                        </div>
                      </CTableHeaderCell>
                    ))}
                  </>
                ) : (
                  <>
                    {data?.body?.map((field, index) => (
                      <CTableHeaderCell
                        key={field.id}
                        className="py-3 px-4 border-end border-light position-relative group-hover"
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
                  </>
                )}
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow>
                {(edit ? structure?.body || [] : data?.body || [])?.map((field, index) => (
                  <CTableDataCell
                    key={field.id}
                    className="py-2 px-4 text-muted border-end border-light align-top"
                    style={{ minWidth: '350px' }}
                  >
                    {edit ? (
                      <>
                        <div
                          className="position-relative p-3 pt-4 border rounded-3 mb-3 mt-3"
                          style={{ borderColor: '#e2e8f0' }}
                        >
                          <div
                            className="position-absolute bg-white px-2 d-flex align-items-center gap-2 fw-bold font-montserrat"
                            style={{
                              top: '-10px',
                              left: '15px',
                              fontSize: '0.75rem',
                              letterSpacing: '0.5px',
                              color: '#0934a8',
                            }}
                          >
                            <Ruler size={15} strokeWidth={2.5} />
                            PARAMETROS
                          </div>
                          <div className="d-flex flex-column gap-1 animate-fade-in">
                            <label className="text-muted fw-bold" style={{ fontSize: '9px' }}>
                              TIPO DE DATO
                            </label>
                            <CFormSelect
                              size="sm"
                              className="font-inter shadow-sm custom-input"
                              style={{ fontSize: '12px' }}
                              value={field.type}
                              invalid={
                                !!errors?.errors?.[`settings.schema.dinamic.body.${index}.type`] &&
                                validated
                              }
                              valid={
                                !errors?.errors?.[`settings.schema.dinamic.body.${index}.type`] &&
                                field.type !== '' &&
                                validated
                              }
                              onChange={(e) => {
                                const newType = e.target.value

                                const newSchema = structure.body.map((item, i) =>
                                  i === index
                                    ? {
                                        id: item.id,
                                        label: item.label,
                                        field: item.field,
                                        type: newType,
                                        rules: [],
                                      }
                                    : item,
                                )

                                setStructure({ ...structure, body: newSchema })
                              }}
                            >
                              {Array.isArray(fieldTypes) ? (
                                <>
                                  <option value="">Seleccione un tipo de dato</option>

                                  {fieldTypes.map((option) => (
                                    <optgroup label={option.name}>
                                      {option.options?.map((opt) => (
                                        <option value={opt.value}>{opt.label}</option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </>
                              ) : (
                                <option disabled>Cargando tipos...</option>
                              )}
                            </CFormSelect>
                            <CFormFeedback invalid>
                              {errors?.errors?.[`settings.schema.dinamic.body.${index}.type`]?.map(
                                (error, i) => (
                                  <div key={i} className="d-flex align-items-center gap-1">
                                    <BadgeAlert size={13} />
                                    <small className="font-inter fw-lighter">{error}</small>
                                  </div>
                                ),
                              )}
                            </CFormFeedback>
                            <FieldRules
                              type={field.type}
                              element={field}
                              field={field.rules}
                              index={index}
                              ind={'dinamic'}
                              updateField={updateField}
                              updateRules={updateRules}
                              errors={errors?.errors}
                              validated={validated}
                              models={models}
                              basePath={`settings.schema.dinamic.body.${index}`}
                              structure={structure}
                              setStructure={setStructure}
                              data={data}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="d-flex align-items-center gap-2 bg-light p-2 rounded-2 mb-3"
                          style={{ border: '1px dashed #dee2e6' }}
                        >
                          <Info size={12} className="text-secondary" />
                          <span className="font-inter small italic" style={{ fontSize: '12px' }}>
                            Tipo: <strong>{field.type}</strong>
                          </span>
                        </div>
                        <span className="font-inter small italic" style={{ fontSize: '12px' }}>
                          VISTA PREVIA
                        </span>
                        <div
                          className="d-flex align-items-center gap-2 bg-light p-2 rounded-2 mb-3 w-100"
                          style={{ minWidth: '100%', border: '1px dashed #dee2e6' }}
                        >
                          {field.type !== 'select' && field.type !== 'selectdinamic' ? (
                            field.type === 'textarea' ? (
                              <CFormTextarea
                                size="sm"
                                value={field.value}
                                className="custom-input"
                              />
                            ) : field.type === 'boolean' ? (
                              <CFormCheck
                                checked={field.value}
                                onChange={(e) => setValue(e.target.checked)}
                                className="custom-input"
                              />
                            ) : (
                              <CFormInput
                                size="sm"
                                type={field.type}
                                value={field.value}
                                className="custom-input"
                              />
                            )
                          ) : (
                            <Select
                              value={null}
                              options={
                                field.type === 'select'
                                  ? Object.values(field.options).map((opt) => ({
                                      value: opt.trim(),
                                      label: opt.trim(),
                                    }))
                                  : catalogsData[field.model]?.map((opt) => {
                                      const optionPath = Object.entries(models).find(
                                        ([_, value]) => value?.model === field?.model,
                                      )?.[1]?.option

                                      return {
                                        value: opt.id,
                                        label: dataGet(optionPath, opt, ''),
                                      }
                                    }) || []
                              }
                              isSearchable
                              filterOption={customFilterOption}
                              className="font-inter"
                              style={{ fontSize: '11px', with: '100%' }}
                              placeholder="Seleccione una opción"
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              styles={{
                                container: (base) => ({
                                  ...base,
                                  width: '100%',
                                }),

                                control: (base, state) => ({
                                  ...base,
                                  width: '100%',
                                  minHeight: '32px',
                                  height: '32px',
                                  borderRadius: '0.375rem',
                                  borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
                                  boxShadow: state.isFocused
                                    ? '0 0 0 0.15rem rgba(13, 110, 253, 0.15)'
                                    : 'none',
                                  '&:hover': {
                                    borderColor: '#86b7fe',
                                  },
                                  fontSize: '11px',
                                  fontFamily: 'Inter, sans-serif',
                                  backgroundColor: '#fff',
                                  overflow: 'hidden',
                                }),

                                valueContainer: (base) => ({
                                  ...base,
                                  height: '32px',
                                  padding: '0 6px',
                                  overflow: 'hidden',
                                  flexWrap: 'nowrap',
                                }),

                                input: (base) => ({
                                  ...base,
                                  margin: 0,
                                  padding: 0,
                                }),

                                indicatorsContainer: (base) => ({
                                  ...base,
                                  height: '32px',
                                }),

                                placeholder: (base) => ({
                                  ...base,
                                  color: '#6c757d',
                                  fontSize: '11px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }),

                                singleValue: (base) => ({
                                  ...base,
                                  color: '#212529',
                                  fontSize: '11px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }),

                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),

                                menu: (base) => ({
                                  ...base,
                                  borderRadius: '0.375rem',
                                  overflow: 'hidden',
                                  fontFamily: 'Inter, sans-serif',
                                  fontSize: '12px',
                                }),

                                option: (base, state) => ({
                                  ...base,
                                  backgroundColor: state.isFocused ? '#f8f9fa' : '#fff',
                                  color: '#212529',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                }),
                              }}
                            />
                          )}
                        </div>
                      </>
                    )}
                  </CTableDataCell>
                ))}
              </CTableRow>
            </CTableBody>
          </CTable>
        ) : (
          <div className="p-5 text-center bg-light rounded-bottom">
            <div className="mb-3">
              <Info size={40} className="text-muted opacity-50" />
            </div>
            <h6 className="font-montserrat fw-bold text-secondary">
              Aún no hay columnas definidas
            </h6>
            <p className="text-muted font-inter small mb-0">
              Utiliza el botón "Agregar Columna" para empezar a construir la estructura de la tabla.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TableDinamicComponent
