import api from '../../../API/api'
import { getConfig } from '../../../axiosConfig'
import { useState, useEffect } from 'react'
import { Toast } from '@/components/Toast'
import { IoMdArrowDropright } from 'react-icons/io'
import {
  Save,
  ArrowLeftCircle,
  BadgeCheck,
  BadgeAlert,
  ClipboardX,
  ClipboardCheck,
  Layers,
  ArrowRight,
  BetweenHorizontalStart,
  Database,
  Info,
  Plus,
  Edit3,
  Ruler,
  View,
} from 'lucide-react'
import {
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CCard,
  CButton,
  CTable,
  CRow,
  CFormSelect,
  CFormFeedback,
  CBadge,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import Swal from 'sweetalert2'
import LoadingForm from '@/components/LoadingForm'
import FieldRules from '@/components/FieldRules'

const Settings = ({ process, onChangeView, errors, setting, models }) => {
  const [catalogsData, setCatalogsData] = useState({})
  const [edit, setEdit] = useState(false)
  const [validated, setValidated] = useState(false)
  const [structure, setStructure] = useState({
    entity: '',
    schema: [],
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
      ],
    },
  ]

  const getCatalog = async (key, params = {}) => {
    try {
      const response = await api.get(`${models[key].url}`, {
        ...getConfig(),
        params,
      })

      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error desconocido' }
    }
  }

  const loadCatalog = async (key /*, form*/) => {
    /*const catalog = CATALOGS[field.source.name]

    if (!catalog) return



    if (field.depends_on) {
      params[field.depends_on] = form[field.depends_on]
    }
    */
    const params = {}
    if (catalogsData[key]) return

    const res = await getCatalog(key, params)

    setCatalogsData((prev) => ({
      ...prev,
      [key]: res.data[key],
    }))
  }

  useEffect(() => {
    const loadAllCatalogs = async () => {
      const schema = process?.settings?.structure?.schema || []

      for (const field of schema) {
        if (field.type === 'selectdinamic') {
          const keyRule = field.rules.find((v) => v.startsWith('key'))
          if (!keyRule) continue

          const key = keyRule.substring('key:'.length)

          if (!catalogsData[key]) {
            await loadCatalog(key)
          }
        }
      }
    }

    loadAllCatalogs()
  }, [process])

  const handleSubmitEdit = async (data) => {
    Swal.fire({
      title: 'Actualizar Estructura',
      html: `<div style="font-size:14px">
                Se guardará la información de la estructura en el sistema.<br/>
                <strong>¿Deseas continuar?</strong>
              </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, guardar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const updatedProcess = {
            ...process,
            settings: {
              ...process.settings,
              structure: data,
            },
          }
          const response = await setting(process.id, updatedProcess)
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setStructure({})
          setEdit(false)
          setValidated(false)
        } catch (error) {
          setValidated(true)
        }
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Acción cancelada',
        })
      }
    })
  }

  if (!process) {
    return (
      <LoadingForm
        title="Cargando información"
        subtitle="Un momento mientras se carga la información..."
        height="400px"
      />
    )
  }

  const updateRules = (index, newRules) => {
    const newSchema = structure.schema.map((item, i) =>
      i === index ? { ...item, rules: newRules } : item,
    )
    setStructure({ ...structure, schema: newSchema })
  }

  const updateField = (index, key, value) => {
    const newSchema = structure.schema.map((item, i) => {
      if (i !== index) return item

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

    setStructure((prev) => ({
      ...prev,
      schema: newSchema,
    }))
  }

  return (
    <div className="animate-fade-in">
      <CCard className="mb-4 p-3 shadow-sm border-0">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
            <span className="fw-bold fs-5 font-montserrat">Información del Proceso</span>
            <CBadge
              color={process?.settings?.in_technical_sheet ? 'success' : 'secondary'}
              variant="outline"
              className="ms-3 p-2 d-flex align-items-center gap-1 font-inter"
            >
              {process?.settings?.in_technical_sheet ? (
                <>
                  <ClipboardCheck size={14} /> Pertenece a Ficha Técnica
                </>
              ) : (
                <>
                  <ClipboardX size={14} /> Proceso General
                </>
              )}
            </CBadge>
          </div>
          <CButton
            className="d-flex align-items-center gap-2 font-poppins btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Procesos' })
            }}
          >
            <ArrowLeftCircle size={16} /> Volver
          </CButton>
        </div>
        <CRow>
          <CCol md={12}>
            <CForm className="row g-3 p-3">
              <CCol md={4} style={{ marginTop: '0px' }}>
                <CFormLabel className="fw-semibold text-muted font-inter">Nombre</CFormLabel>
                <CFormInput
                  value={process?.name}
                  disabled
                  className="bg-white border-0 shadow-sm font-poppins"
                />
              </CCol>
              <CCol md={8} style={{ marginTop: '0px' }}>
                <CFormLabel className="fw-semibold text-muted font-inter">Descripción</CFormLabel>
                <CFormInput
                  value={process?.description}
                  disabled
                  className="bg-white border-0 shadow-sm font-poppins"
                />
              </CCol>
            </CForm>
          </CCol>
        </CRow>
        <div className="p-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <h6 className="m-0 d-flex align-items-center gap-2 font-poppins">
              <span style={{ position: 'relative', width: 20, height: 20 }}>
                <Layers size={18} style={{ color: '#C21111' }} />
              </span>
              Línea de Secuencia
            </h6>
          </div>
          <div className="d-flex align-items-center justify-content-center gap-4">
            {process?.before_processes?.length > 0 && (
              <div className="d-flex flex-column gap-2">
                {process.before_processes.map((prev) => (
                  <div key={prev.id} className="node node-secondary border-dashed">
                    <span className="node-label">Proceso Anterior</span>
                    <div className="node-content text-truncate">{prev.name}</div>
                  </div>
                ))}
              </div>
            )}
            {process?.before_processes?.length > 0 && (
              <ArrowRight className="text-muted opacity-50" size={30} />
            )}
            <div className="node node-active shadow-lg">
              <span className="node-label text-white-50">Proceso Actual</span>
              <div className="node-content text-white fs-5">{process?.name}</div>
            </div>
            {process?.after_processes?.length > 0 && (
              <ArrowRight className="text-muted opacity-50" size={30} />
            )}
            {process?.after_processes?.length > 0 && (
              <div className="d-flex flex-column gap-2">
                {process.after_processes.map((after) => (
                  <div key={after.id} className="node node-secondary">
                    <span className="node-label">Proceso Siguiente</span>
                    <div className="node-content text-truncate">{after.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="d-flex align-items-center gap-2 mb-4">
            <h6 className="m-0 d-flex align-items-center gap-2 font-poppins">
              <span style={{ position: 'relative', width: 20, height: 20 }}>
                <BetweenHorizontalStart size={18} style={{ color: '#C21111' }} />
              </span>
              Configuración de Estructura
            </h6>
          </div>
          <div className="bg-white rounded-3 border shadow-sm overflow-hidden">
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
                        value={
                          edit
                            ? structure?.entity || ''
                            : process?.settings?.structure?.entity || ''
                        }
                        disabled={!edit}
                        onChange={(e) => setStructure({ ...structure, entity: e.target.value })}
                        placeholder="Ej: usuarios_sistema"
                        invalid={!!errors?.errors?.[`settings.structure.entity`]}
                        valid={
                          !errors?.errors?.[`settings.structure.entity`] &&
                          structure?.entity !== '' &&
                          validated
                        }
                      />
                      <CFormFeedback invalid>
                        {errors?.errors?.[`settings.structure.entity`]?.map((error, i) => (
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
                      onClick={() => handleSubmitEdit(structure)}
                    >
                      <Save size={16} /> Guardar Estructura
                    </CButton>
                    <CButton
                      variant="ghost"
                      color="secondary"
                      size="sm"
                      className="py-1 px-2 font-inter"
                      onClick={() => {
                        setEdit(false)
                        setStructure({})
                        setValidated(false)
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
                          ...process.settings.structure,
                          schema: process.settings.structure.schema.map((field) => ({ ...field })),
                        }
                        setStructure(deepCopy)
                        setEdit(true)
                      }}
                    >
                      <Edit3 size={16} /> Editar Estructura
                    </CButton>
                    <CButton
                      color="dark"
                      size="sm"
                      className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                      onClick={() => {
                        console.log('Click aqui')
                      }}
                    >
                      <Plus size={16} /> Agregar Columna
                    </CButton>
                  </>
                )}
              </div>
            </div>
            <div className="table-responsive">
              {process.settings.structure?.schema?.length > 0 ? (
                <CTable align="middle" className="mb-0 border-0">
                  <CTableHead style={{ backgroundColor: '#fdfdfd' }}>
                    <CTableRow>
                      {edit ? (
                        <>
                          {structure?.schema?.map((field, index) => (
                            <CTableHeaderCell
                              key={field.id}
                              className="py-3 px-3 border-end border-light bg-light-subtle"
                              style={{ minWidth: '250px' }}
                            >
                              <div className="d-flex flex-column gap-2 animate-fade-in">
                                <div className="d-flex flex-column">
                                  <label
                                    className="text-muted"
                                    style={{ fontSize: '9px', fontWeight: 'bold' }}
                                  >
                                    NOMBRE COLUMNA
                                  </label>
                                  <CFormInput
                                    size="sm"
                                    className="font-montserrat fw-semibold custom-input"
                                    value={field.label}
                                    onChange={(e) => {
                                      const newSchema = structure.schema.map((field, i) => {
                                        if (i === index) {
                                          return { ...field, label: e.target.value }
                                        }
                                        return field
                                      })
                                      setStructure({ ...structure, schema: newSchema })
                                    }}
                                    invalid={
                                      !!errors?.errors?.[`settings.structure.schema.${index}.label`]
                                    }
                                    valid={
                                      !errors?.errors?.[
                                        `settings.structure.schema.${index}.label`
                                      ] &&
                                      field.label !== '' &&
                                      validated
                                    }
                                  />
                                  <CFormFeedback invalid>
                                    {errors?.errors?.[
                                      `settings.structure.schema.${index}.label`
                                    ]?.map((error, i) => (
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
                                </div>
                                <div className="d-flex flex-column">
                                  <label
                                    className="text-muted"
                                    style={{ fontSize: '9px', fontWeight: 'bold' }}
                                  >
                                    NOMBRE CAMPO
                                  </label>
                                  <CFormInput
                                    size="sm"
                                    className="font-inter text-primary custom-input"
                                    style={{ fontSize: '12px' }}
                                    value={field.field}
                                    onChange={(e) => {
                                      const newSchema = [...structure.schema]
                                      newSchema[index].field = e.target.value
                                      setStructure({ ...structure, schema: newSchema })
                                    }}
                                    invalid={
                                      !!errors?.errors?.[
                                        `settings.structure.schema.${index}.field` && validated
                                      ]
                                    }
                                    valid={
                                      !errors?.errors?.[
                                        `settings.structure.schema.${index}.field`
                                      ] &&
                                      field.field !== '' &&
                                      validated
                                    }
                                  />
                                  <CFormFeedback invalid>
                                    {errors?.errors?.[
                                      `settings.structure.schema.${index}.field`
                                    ]?.map((error, i) => (
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
                                </div>
                              </div>
                            </CTableHeaderCell>
                          ))}
                        </>
                      ) : (
                        <>
                          {process.settings.structure?.schema?.map((field, index) => (
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
                      {(edit
                        ? structure?.schema || []
                        : process?.settings?.structure?.schema || []
                      )?.map((field, index) => (
                        <CTableDataCell
                          key={field.id}
                          className="py-2 px-4 text-muted border-end border-light align-top"
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
                                      !!errors?.errors?.[`settings.structure.schema.${index}.type`]
                                    }
                                    valid={
                                      !errors?.errors?.[
                                        `settings.structure.schema.${index}.type`
                                      ] &&
                                      field.type !== '' &&
                                      validated
                                    }
                                    onChange={(e) => {
                                      const newType = e.target.value

                                      const newSchema = structure.schema.map((item, i) =>
                                        i === index
                                          ? {
                                              ...item,
                                              type: newType,
                                              rules: [],
                                            }
                                          : item,
                                      )

                                      setStructure({ ...structure, schema: newSchema })
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
                                      <option disabled>Cargando roles...</option>
                                    )}
                                  </CFormSelect>
                                  <CFormFeedback invalid>
                                    {errors?.errors?.[
                                      `settings.structure.schema.${index}.type`
                                    ]?.map((error, i) => (
                                      <div key={i} className="d-flex align-items-center gap-1">
                                        <BadgeAlert size={13} />
                                        <small className="font-inter fw-lighter">{error}</small>
                                      </div>
                                    ))}
                                  </CFormFeedback>
                                  <FieldRules
                                    type={field.type}
                                    field={field.rules}
                                    index={index}
                                    updateField={updateField}
                                    updateRules={updateRules}
                                    errors={errors?.errors}
                                    validated={validated}
                                    models={models}
                                  />
                                </div>
                              </div>
                            </>
                          ) : (
                            <div
                              className="d-flex align-items-center gap-2 bg-light p-2 rounded-2"
                              style={{ border: '1px dashed #dee2e6' }}
                            >
                              <Info size={12} className="text-secondary" />
                              <span
                                className="font-inter small italic"
                                style={{ fontSize: '12px' }}
                              >
                                Tipo: <strong>{field.type}</strong>
                              </span>
                            </div>
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
                    Utiliza el botón "Agregar Columna" para empezar a construir la estructura de la
                    tabla.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="d-flex align-items-center gap-2 mb-4">
            <h6 className="m-0 d-flex align-items-center gap-2 font-poppins">
              <span style={{ position: 'relative', width: 20, height: 20 }}>
                <View size={18} style={{ color: '#C21111' }} />
              </span>
              Vista Previa de la Estructura
            </h6>
          </div>
          <div className="bg-white rounded-3 border shadow-sm overflow-hidden">
            <div className="p-2 bg-light border-bottom d-flex justify-content-center">
              <CFormInput
                size="sm"
                className="fw-bold font-poppins shadow-none border-0 bg-transparent text-center"
                style={{
                  fontSize: '17px',
                  color: '#C21111',
                  minWidth: '200px',
                }}
                value={process?.settings?.structure?.entity || ''}
              />
            </div>
            <div className="table-responsive">
              {process.settings.structure?.schema?.length > 0 ? (
                <CTable align="middle" className="mb-0 border-0">
                  <CTableHead style={{ backgroundColor: '#fdfdfd' }}>
                    <CTableRow>
                      {process.settings.structure?.schema?.map((field, index) => (
                        <CTableHeaderCell
                          key={field.id}
                          className="py-2 border-end border-light group-hover"
                        >
                          <div className="d-flex justify-content-center gap-3 w-100">
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
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow>
                      {process?.settings?.structure?.schema.map((field, index) => (
                        <CTableDataCell
                          key={field.id}
                          className="py-2 px-4 text-muted border-end border-light align-top"
                        >
                          <div
                            className="d-flex align-items-center gap-2 bg-light p-2 rounded-2"
                            style={{ border: '1px dashed #dee2e6' }}
                          >
                            {field.type !== 'select' && field.type !== 'selectdinamic' ? (
                              <CFormInput
                                size="sm"
                                type={field.type}
                                value={field.type}
                                className="custom-input"
                              />
                            ) : (
                              <CFormSelect
                                size="sm"
                                className="font-inter shadow-sm custom-input"
                                style={{ fontSize: '12px' }}
                              >
                                {field.rules?.some((val) => val.startsWith('options')) ? (
                                  <>
                                    <option value="">Seleccione una opción</option>
                                    {field.rules
                                      .find((val) => val.startsWith('options'))
                                      ?.substring('options:'.length)
                                      .split(',')
                                      .map((opt, i) => (
                                        <option key={i} value={opt.trim()}>
                                          {opt.trim()}
                                        </option>
                                      ))}
                                  </>
                                ) : (
                                  <>
                                    <option value="">Seleccione una opción</option>
                                    {catalogsData[
                                      field.rules
                                        .find((v) => v.startsWith('key'))
                                        ?.substring('key:'.length)
                                    ]?.map((opt) => (
                                      <option key={opt.id} value={opt.id}>
                                        {opt.name}
                                      </option>
                                    ))}
                                  </>
                                )}
                              </CFormSelect>
                            )}
                          </div>
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
                    Utiliza el botón "Agregar Columna" para empezar a construir la estructura de la
                    tabla.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CCard>
    </div>
  )
}

export default Settings
