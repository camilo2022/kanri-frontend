import api from '../../../API/api'
import { getConfig } from '../../../axiosConfig'
import { useState, useEffect } from 'react'
import { Toast } from '@/components/Toast'
import { IoMdArrowDropright } from 'react-icons/io'
import {
  ArrowLeftCircle,
  BetweenHorizontalStart,
  Trash2,
  GripVertical,
  Plus,
  Edit3,
  BadgeCheck,
  BadgeAlert,
  Info,
  Save,
  TextInitial,
} from 'lucide-react'
import {
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CCard,
  CButton,
  CRow,
  CFormFeedback,
  CFormSelect,
  CFormCheck,
} from '@coreui/react'
import Swal from 'sweetalert2'
import LoadingForm from '@/components/LoadingForm'
import FieldRules from '@/components/FieldRules'

const Settings = ({
  supply_type,
  onChangeView,
  errors,
  setting,
  models,
  fetchSupplyTypes,
  supply_types,
  supplier_types,
}) => {
  const [catalogsData, setCatalogsData] = useState({})
  const [validated, setValidated] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [structure, setStructure] = useState([])

  const handleAddField = () => {
    const currentForm = structure?.length ? structure : supply_type?.settings?.form || []
    const ids = new Set(currentForm.map((v) => v.id))
    let newId = 1
    while (ids.has(newId)) newId++
    setStructure([
      ...currentForm,
      {
        id: newId,
        label: '',
        field: '',
        type: '',
        rules: [],
      },
    ])
    setEditingIndex(currentForm.length)
  }

  const handleEditField = (index) => {
    const deepCopy = supply_type.settings.form.map((field) => ({ ...field }))
    setStructure(deepCopy)
    setEditingIndex(index)
  }

  const handleRemoveField = async (index) => {
    const result = await Swal.fire({
      title: 'Eliminar Elemento',
      html: `<div style="font-size:14px">
               Se eliminará el elemento de la estructura.<br/>
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
    const currentForm = structure.length ? structure : supply_type?.settings?.form || []

    const updated = currentForm.filter((_, i) => i !== index)

    const success = await handleSubmitEdit(updated, false)

    setTimeout(() => {
      if (success) {
        setValidated(false)
        setStructure(updated)
        if (editingIndex === index) {
          setEditingIndex(null)
        }
      }
    }, 1000)
  }

  const handleChangeField = (index, key, value) => {
    const newSchema = structure.map((item, i) =>
      i === index
        ? {
            ...item,
            [key]: value,
          }
        : item,
    )
    setStructure(newSchema)
  }

  const getCatalog = async (key, params = {}) => {
    try {
      const url = Object.entries(models).find(([_, value]) => value.model === key)?.[1]?.url
      const response = await api.get(url, {
        ...getConfig(),
        params,
      })

      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error desconocido' }
    }
  }

  const loadCatalog = async (key) => {
    const params = {}
    if (catalogsData[key]) return

    const res = await getCatalog(key, params)

    setCatalogsData((prev) => ({
      ...prev,
      [key]: res.data[Object.entries(models).find(([_, value]) => value.model === key)[0]],
    }))
  }

  useEffect(() => {
    const loadStructureCatalogs = async () => {
      const paramsToLoad = new Set(structure.map((field) => field?.param).filter(Boolean))

      for (const param of paramsToLoad) {
        await loadCatalog(param)
      }
    }

    loadStructureCatalogs()
  }, [structure, models])

  const handleSubmitEdit = async (data, message = true) => {
    if (message) {
      const result = await Swal.fire({
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
      })

      if (!result.isConfirmed) {
        Toast.fire({
          icon: 'error',
          title: 'Acción cancelada',
        })
        return false
      }
    }

    try {
      const updatedSettings = {
        ...supply_type,
        settings: {
          ...supply_type.settings,
          form: data,
        },
      }
      const response = await setting(supply_type.id, updatedSettings)

      setValidated(true)

      Toast.fire({
        icon: 'success',
        title: response.message,
      })
      setTimeout(() => {
        setValidated(false)
      }, 2510)

      return true
    } catch (error) {
      setValidated(true)
      return false
    }
  }

  if (!supply_type) {
    return (
      <LoadingForm
        title="Cargando información"
        subtitle="Un momento mientras se carga la información..."
        height="400px"
      />
    )
  }

  const dataGet = (path, data, defaultValue = undefined, separator = ' ') => {
    const getSingleValue = (singlePath) => {
      if (!singlePath) return undefined

      return singlePath
        .replace(/\[(\w+)\]/g, '.$1')
        .replace(/^\./, '')
        .split('.')
        .reduce((acc, key) => {
          if (acc === null || acc === undefined) {
            return undefined
          }

          return acc[key]
        }, data)
    }

    if (Array.isArray(path)) {
      const values = path
        .map((p) => getSingleValue(p))
        .filter((value) => value !== undefined && value !== null && value !== '')

      return values.length ? values.join(separator) : defaultValue
    }

    return getSingleValue(path) ?? defaultValue
  }

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
      options: [{ value: 'number', label: 'Número (number)', rule: 'numeric' }],
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

  const updateRules = (index, newRules, model = '') => {
    setStructure((prev) => {
      const newSchema = prev.map((item, i) =>
        i === index
          ? model !== ''
            ? {
                ...item,
                model: models[model].model,
                path: models[model].option,
                param: models[model].param,
                rules: newRules,
              }
            : { ...item, rules: newRules }
          : item,
      )
      return newSchema
    })
  }

  const updateField = (index, key, value, is_field = false) => {
    const newSchema = structure.map((item, i) => {
      if (i !== index) return item

      if (key === 'cardinality') {
        return {
          ...item,
          cardinality: value,
        }
      }

      if (is_field) {
        return {
          ...item,
          [key]: value,
        }
      }

      if (key === 'field') {
        return {
          ...item,
          field: value,
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

    setStructure(newSchema)
  }

  return (
    <div className="animate-fade-in">
      <CCard className="mb-4 p-3 shadow-sm border-0">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
            <span className="fw-bold fs-5 font-montserrat">Configuración del Tipo de Insumo</span>
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
            <CForm className="row g-3 needs-validation p-4">
              <CCol md={4}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <TextInitial size={15} /> Nombre
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={supply_type?.name}
                  disabled
                  className="font-montserrat custom-input"
                />
              </CCol>
              <CCol md={8}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <TextInitial size={15} /> Descripción
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="description"
                  value={supply_type?.description}
                  disabled
                  className="font-montserrat custom-input"
                />
              </CCol>
            </CForm>
          </CCol>
        </CRow>
        <CCol md={12}>
          <div className="mb-3 mt-3 px-4">
            <h6 className="mb-3 fw-bold d-flex align-items-center gap-2 font-poppins">
              <span style={{ position: 'relative', width: 20, height: 20 }}>
                <BetweenHorizontalStart size={18} style={{ color: '#C21111' }} />
              </span>
              Configuración de Estructura
            </h6>
            <small className="text-muted">
              Configura los datos que el usuario deberá llenar para este tipo de insumo.
            </small>
            <div
              className="mt-3 shadow-sm border-start border-4 rounded-end"
              style={{ borderLeftColor: '#C21111', backgroundColor: '#fcfcfc' }}
            >
              <div className="d-flex flex-column gap-3 max-w-4xl mx-auto p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <CButton
                    color="primary"
                    size="sm"
                    className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                    onClick={handleAddField}
                    disabled={editingIndex != null}
                  >
                    <Plus size={16} />
                    Añadir Campo
                  </CButton>

                  {editingIndex !== null && (
                    <div className="d-flex align-items-center gap-2">
                      <CButton
                        color="success"
                        size="sm"
                        className="d-flex align-items-center gap-2 font-inter btn-primary-revolve"
                        onClick={async () => {
                          const success = await handleSubmitEdit(structure)
                          setTimeout(() => {
                            if (success) {
                              setEditingIndex(null)
                              setValidated(true)
                            }
                          }, 1000)
                        }}
                      >
                        <Save size={16} />
                        Guardar Estructura
                      </CButton>
                      <CButton
                        color="secondary"
                        size="sm"
                        className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                        onClick={() => {
                          setEditingIndex(null)
                          setStructure([])
                          setValidated(false)
                        }}
                      >
                        Cancelar
                      </CButton>
                    </div>
                  )}
                </div>
                {(() => {
                  const fields =
                    editingIndex != null ? structure : supply_type?.settings?.form || []

                  return fields?.length > 0 ? (
                    <>
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="preview-cell bg-white border rounded-3 shadow-sm hover-shadow-md transition-all animate-fade-in mb-3 position-relative"
                          style={{ borderLeft: '5px solid #0934a8' }}
                        >
                          {editingIndex === null && (
                            <div
                              className="edit-overlay d-flex gap-1 position-absolute"
                              style={{
                                top: '5px',
                                right: '5px',
                                zIndex: 9999,
                              }}
                            >
                              <button
                                type="button"
                                className="btn text-primary btn-sm shadow-sm d-flex align-items-center justify-content-center border floating-action-btn"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                }}
                                onClick={() => {
                                  const deepCopy = supply_type.settings.form.map((field) => ({
                                    ...field,
                                  }))
                                  setStructure(deepCopy)
                                  setEditingIndex(index)
                                }}
                              >
                                <Edit3 size={12} />
                              </button>

                              <button
                                type="button"
                                className="btn text-danger btn-sm shadow-sm d-flex align-items-center justify-content-center border floating-action-btn"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                }}
                                onClick={() => handleRemoveField(index)}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                          <div
                            className="p-3"
                            style={{
                              borderColor: '#e2e8f0',
                              opacity: editingIndex !== index ? 0.6 : 1,
                              pointerEvents: editingIndex !== index ? 'none' : 'auto',
                              filter: editingIndex !== index ? 'grayscale(0.5)' : 'none',
                              backgroundColor: editingIndex !== index ? '#f8fafc' : 'transparent',
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="d-flex align-items-center gap-2">
                                <div className="text-muted cursor-grab">
                                  <GripVertical size={20} />
                                </div>
                                <span className="badge bg-light text-primary border fw-bold font-poppins">
                                  Campo #{index + 1}
                                </span>
                              </div>
                            </div>
                            <div className="row g-4">
                              <div className="col-md-5">
                                <div className="row g-3">
                                  <div className="col-md-12">
                                    <label
                                      className="text-muted fw-bold"
                                      style={{ fontSize: '9px' }}
                                    >
                                      NOMBRE VISIBLE
                                    </label>
                                    <CFormInput
                                      size="sm"
                                      className="font-montserrat fw-semibold custom-input"
                                      value={field.label}
                                      onChange={(e) =>
                                        handleChangeField(
                                          index,
                                          'label',
                                          e.target.value.toUpperCase(),
                                        )
                                      }
                                      invalid={
                                        !!errors?.errors?.[`settings.form.${index}.label`] &&
                                        validated
                                      }
                                      valid={
                                        !errors?.errors?.[`settings.form.${index}.label`] &&
                                        field?.label !== '' &&
                                        editingIndex === index &&
                                        validated
                                      }
                                    />
                                    <CFormFeedback invalid>
                                      {errors?.errors?.[`settings.form.${index}.label`]?.map(
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
                                  <div className="col-md-12">
                                    <label
                                      className="text-muted fw-bold"
                                      style={{ fontSize: '9px' }}
                                    >
                                      NOMBRE VALOR
                                    </label>
                                    <CFormInput
                                      size="sm"
                                      className="font-inter text-primary custom-input"
                                      style={{ fontSize: '12px' }}
                                      value={field.field}
                                      onChange={(e) =>
                                        handleChangeField(
                                          index,
                                          'field',
                                          e.target.value.toLowerCase(),
                                        )
                                      }
                                      invalid={
                                        !!errors?.errors?.[`settings.form.${index}.field`] &&
                                        validated
                                      }
                                      valid={
                                        !errors?.errors?.[`settings.form.${index}.field`] &&
                                        field?.label !== '' &&
                                        editingIndex === index &&
                                        validated
                                      }
                                    />
                                    <CFormFeedback invalid>
                                      {errors?.errors?.[`settings.form.${index}.field`]?.map(
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
                              </div>
                              <div className="col-md-7 border-start ps-4">
                                <label className="text-muted fw-bold" style={{ fontSize: '9px' }}>
                                  TIPO DE DATO
                                </label>
                                <CFormSelect
                                  size="sm"
                                  className="font-inter shadow-sm custom-input"
                                  style={{ fontSize: '12px' }}
                                  value={field.type}
                                  onChange={(e) => {
                                    const selected = fieldTypes
                                      .flatMap((group) => group.options)
                                      .find((option) => option.value === e.target.value)
                                    const newType = e.target.value
                                    const newSchema = structure.map((item, i) =>
                                      i === index
                                        ? {
                                            id: item.id,
                                            label: item.label,
                                            field: item.field,
                                            type: newType,
                                            rules: selected.rule ? [selected.rule] : [],
                                          }
                                        : item,
                                    )
                                    setStructure(newSchema)
                                  }}
                                  invalid={
                                    !!errors?.errors?.[`settings.form.${index}.type`] && validated
                                  }
                                  valid={
                                    !errors?.errors?.[`settings.form.${index}.type`] &&
                                    field?.label !== '' &&
                                    editingIndex === index &&
                                    validated
                                  }
                                >
                                  {Array.isArray(fieldTypes) ? (
                                    <>
                                      <option value="">Seleccione un tipo de dato</option>

                                      {fieldTypes.map((option) => (
                                        <optgroup key={option.name} label={option.name}>
                                          {option.options?.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                              {opt.label}
                                            </option>
                                          ))}
                                        </optgroup>
                                      ))}
                                    </>
                                  ) : (
                                    <option disabled>Cargando tipos...</option>
                                  )}
                                </CFormSelect>
                                <CFormFeedback invalid>
                                  {errors?.errors?.[`settings.form.${index}.type`]?.map(
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
                                <CRow className="g-2">
                                  <CCol
                                    md={field?.param ? 4 : field?.type === 'selectdinamic' ? 8 : 12}
                                  >
                                    <FieldRules
                                      type={field.type}
                                      element={field}
                                      field={field.rules}
                                      index={index}
                                      editingIndex={editingIndex}
                                      ind={'dinamic'}
                                      updateField={updateField}
                                      updateRules={updateRules}
                                      errors={errors?.errors}
                                      validated={validated}
                                      models={models}
                                      basePath={`settings.form.${index}`}
                                      clave={'supply'}
                                      setStructureAux={setStructure}
                                      itemRequired={false}
                                    />
                                  </CCol>
                                  {field?.param && (
                                    <CCol md={4}>
                                      <div className="d-flex flex-column gap-2 mt-3">
                                        <label
                                          className="text-muted fw-bold"
                                          style={{ fontSize: '9px' }}
                                        >
                                          {Object.values(models)
                                            .find((item) => item.model === field?.param)
                                            ?.label?.toUpperCase()}{' '}
                                          ASOCIADO
                                        </label>
                                        <CFormSelect
                                          size="sm"
                                          className="font-inter shadow-sm custom-input"
                                          style={{ fontSize: '12px' }}
                                          value={
                                            field[
                                              Object.values(models).find(
                                                (item) => item.model === field?.param,
                                              )?.field
                                            ] || ''
                                          }
                                          onChange={(e) => {
                                            updateField(
                                              index,
                                              Object.values(models).find(
                                                (item) => item.model === field?.param,
                                              )?.field,
                                              e.target.value,
                                              true,
                                            )
                                          }}
                                        >
                                          <option value="">Seleccione una opción</option>
                                          {catalogsData[field.param] &&
                                            catalogsData[field.param].map((item) => (
                                              <option value={item.id}>{item.name}</option>
                                            ))}
                                        </CFormSelect>
                                      </div>
                                    </CCol>
                                  )}
                                  <CCol md={4}>
                                    {field?.type === 'selectdinamic' && (
                                      <div className="d-flex flex-column gap-2 mt-3">
                                        <label
                                          className="text-muted fw-bold"
                                          style={{ fontSize: '9px' }}
                                        >
                                          CANTIDAD DE VALORES
                                        </label>
                                        <CFormSelect
                                          size="sm"
                                          className="font-inter shadow-sm custom-input"
                                          style={{ fontSize: '12px' }}
                                          value={field.cardinality || ''}
                                          onChange={(e) => {
                                            updateField(index, 'cardinality', e.target.value)

                                            /*ind !== 'static'
                                                    ? updateField(index, 'options', newOptions.join(','))
                                                    : updateFieldStatic('options', newOptions.join(','))*/
                                          }}
                                        >
                                          <option value="">Seleccione una opción</option>
                                          <option value="single">Un solo valor</option>
                                          <option value="multiple">Varios valores</option>

                                          {/*Object.entries(
                                        Object.values(models).find(
                                          (model) => model.field === element.depend,
                                        )?.columns || {},
                                      ).map(([key, value]) => (
                                        <option key={key} value={key}>
                                          {value}
                                        </option>
                                      ))*/}
                                        </CFormSelect>
                                      </div>
                                    )}
                                  </CCol>
                                </CRow>
                                <div
                                  className={`d-flex align-items-center justify-content-between mt-3 p-2 rounded mb-2 ${
                                    validated && editingIndex === index
                                      ? 'border border-success bg-success bg-opacity-10'
                                      : 'bg-white border'
                                  }`}
                                >
                                  <span
                                    className="small font-inter fw-medium text-secondary"
                                    style={{ fontSize: '11px' }}
                                  >
                                    ¿Es obligatorio?
                                  </span>
                                  <CFormCheck
                                    checked={field.rules.includes('required')}
                                    valid={validated && editingIndex === index}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked
                                      const cleanedRules = (field.rules || []).filter(
                                        (rule) => rule !== 'required' && rule !== 'nullable',
                                      )
                                      const newRules = [
                                        ...cleanedRules,
                                        ...(isChecked ? ['required'] : ['nullable']),
                                      ]
                                      updateRules(index, newRules)
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="p-5 text-center bg-light rounded-bottom">
                      <div className="mb-3">
                        <Info size={40} className="text-muted opacity-50" />
                      </div>

                      <h6 className="font-montserrat fw-bold text-secondary">
                        Aún no hay columnas definidas
                      </h6>

                      <p className="text-muted font-inter small mb-0">
                        Utiliza el botón "Agregar Columna" para empezar a construir la estructura
                        dinámica.
                      </p>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </CCol>
      </CCard>
    </div>
  )
}

export default Settings
