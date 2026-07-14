import { cibVisualStudioCode } from '@coreui/icons'
import { CFormInput, CFormFeedback, CFormCheck, CButton, CFormSelect } from '@coreui/react'
import { BadgeCheck, BadgeAlert, Plus, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

const FIELD_RULES = {
  text: {
    rules: ['min', 'max', 'regex'],
  },

  textarea: {
    rules: ['min', 'max', 'regex'],
  },

  number: {
    rules: ['min', 'max'],
  },

  date: {
    rules: ['after', 'before'],
  },

  datetime: {
    rules: ['after', 'before'],
  },

  boolean: {
    rules: [],
  },

  select: {
    rules: ['options'],
  },

  selectdinamic: {
    rules: ['select'],
  },

  derived: {
    rules: ['derived'],
  },
}

function FieldRules({
  type,
  element,
  field,
  ind,
  index,
  editingIndex,
  updateField,
  updateFieldStatic,
  updateRules,
  updateRulesStatic,
  errors,
  validated,
  models,
  basePath,
  structure,
  setStructure,
  setStructureAux,
  clave,
  itemRequired = true,
}) {
  const [options, setOptions] = useState([''])

  const isInvalid = errors && !!errors[`${basePath}.rules.options`] && validated
  const isValid =
    errors &&
    !errors[`${basePath}.rules.options`] &&
    options?.some((opt) => opt.trim() !== '') &&
    validated &&
    (ind === 'static' || editingIndex === index)

  const getRuleValue = (rules, key) => {
    const rule = rules.find((r) => r.startsWith(`${key}:`))
    if (!rule) return ''

    const index = rule.indexOf(':')
    return rule.slice(index + 1)
  }

  const config = FIELD_RULES[type]

  useEffect(() => {
    if (element?.options) {
      setOptions(Object.values(element.options))
    }
  }, [])

  useEffect(() => {
    if (element.type === 'derived') {
      const newRules = [
        ...(field || []).filter((rule) => !['required', 'nullable'].includes(rule)),
        'required',
      ]

      ind !== 'static' ? updateRules(index, newRules) : updateRulesStatic(newRules)
    }
  }, [element.type])

  if (!config) return null

  const addOption = () => {
    setOptions((prev) => [...prev, ''])
  }

  const removeOption = (aux) => {
    setOptions((prev) => prev.filter((_, i) => i !== aux))
    updateField(index, 'options', options.filter((_, i) => i !== aux).join(','))
  }

  const updateOption = (indexField, value) => {
    const newOptions = [...options]
    newOptions[indexField] = value
    setOptions(newOptions)
    ind !== 'static'
      ? updateField(index, 'options', newOptions.join(','))
      : updateFieldStatic('options', newOptions.join(','))
  }

  return (
    <div className="d-flex flex-column gap-2 mt-2">
      {config.rules.includes('min') && (
        <>
          <label className="text-muted fw-bold" style={{ fontSize: '9px' }}>
            {type === 'number' ? 'INICIO DE RANGO' : 'MINIMO DE CARACTERES'}
          </label>
          <CFormInput
            size="sm"
            type="number"
            placeholder="Min"
            value={getRuleValue(field, 'min') ?? ''}
            onChange={(e) => {
              ind !== 'static'
                ? updateField(index, 'min', Number(e.target.value))
                : updateFieldStatic('min', Number(e.target.value))
            }}
            className="custom-input"
            style={{ marginTop: '-0.35rem' }}
            invalid={!!errors?.[`${basePath}.rules.min`] && validated}
            valid={
              !errors?.[`${basePath}.rules.min`] &&
              getRuleValue(field, 'min') !== '' &&
              validated &&
              (ind === 'static' || editingIndex === index)
            }
          />
          <CFormFeedback invalid style={{ marginTop: '-0.35rem' }}>
            {errors?.[`${basePath}.rules.min`]?.map((error, i) => (
              <div key={i} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter fw-lighter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback valid style={{ marginTop: '-0.35rem' }}>
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter fw-lighter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </>
      )}

      {config.rules.includes('max') && (
        <>
          <label className="text-muted fw-bold" style={{ fontSize: '9px' }}>
            {type === 'number' ? 'FIN DE RANGO' : 'MÁXIMO DE CARACTERES'}
          </label>
          <CFormInput
            size="sm"
            type="number"
            placeholder="Max"
            value={getRuleValue(field, 'max') ?? ''}
            onChange={(e) =>
              ind !== 'static'
                ? updateField(index, 'max', Number(e.target.value))
                : updateFieldStatic('max', Number(e.target.value))
            }
            className="custom-input"
            style={{ marginTop: '-0.35rem' }}
            invalid={!!errors?.[`${basePath}.rules.max`] && validated}
            valid={
              !errors?.[`${basePath}.rules.max`] &&
              getRuleValue(field, 'max') !== '' &&
              validated &&
              (ind === 'static' || editingIndex === index)
            }
          />
          <CFormFeedback invalid style={{ marginTop: '-0.35rem' }}>
            {errors?.[`${basePath}.rules.max`]?.map((error, i) => (
              <div key={i} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter fw-lighter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback valid style={{ marginTop: '-0.35rem' }}>
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter fw-lighter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </>
      )}

      {config.rules.includes('regex') && (
        <>
          <label className="text-muted fw-bold" style={{ fontSize: '9px' }}>
            EXPRESIÓN REGULAR (REGEX)
          </label>
          <CFormInput
            size="sm"
            type="text"
            placeholder="Regex"
            value={getRuleValue(field, 'regex') ?? ''}
            onChange={(e) =>
              ind !== 'static'
                ? updateField(index, 'regex', e.target.value)
                : updateFieldStatic('regex', e.target.value)
            }
            style={{ marginTop: '-0.35rem' }}
            invalid={!!errors?.[`${basePath}.rules.regex`] && validated}
            valid={
              !errors?.[`${basePath}.rules.regex`] &&
              validated &&
              getRuleValue(field, 'regex') !== '' &&
              (ind === 'static' || editingIndex === index)
            }
          />
          <CFormFeedback invalid style={{ marginTop: '-0.35rem' }}>
            {errors?.[`${basePath}.rules.regex`]?.map((error, i) => (
              <div key={i} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter fw-lighter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          {!errors?.[`${basePath}.rules.regex`] &&
            validated &&
            getRuleValue(field, 'regex') !== '' && (
              <CFormFeedback valid style={{ marginTop: '-0.35rem' }}>
                <div className="d-flex align-items-center gap-1">
                  <BadgeCheck size={13} />
                  <small className="font-inter fw-lighter">Dato Válido</small>
                </div>
              </CFormFeedback>
            )}
        </>
      )}

      {config.rules.includes('after') && (
        <>
          <label className="text-muted fw-bold" style={{ fontSize: '9px' }}>
            FECHA INICIO LIMITE
          </label>
          <CFormInput
            size="sm"
            type={type === 'date' ? 'date' : 'datetime-local'}
            value={getRuleValue(field, 'after') ?? ''}
            onChange={(e) => {
              ind !== 'static'
                ? updateField(index, 'after', e.target.value.replace('T', ' '))
                : updateFieldStatic('after', e.target.value.replace('T', ' '))
            }}
            style={{ marginTop: '-0.35rem' }}
            className="custom-input"
            invalid={!!errors?.[`${basePath}.rules.after`] && validated}
            valid={
              !errors?.[`${basePath}.rules.after`] &&
              getRuleValue(field, 'after') !== '' &&
              validated &&
              (ind === 'static' || editingIndex === index)
            }
          />
          <CFormFeedback invalid style={{ marginTop: '-0.35rem' }}>
            {errors?.[`${basePath}.rules.after`]?.map((error, i) => (
              <div key={i} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter fw-lighter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback valid style={{ marginTop: '-0.35rem' }}>
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter fw-lighter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </>
      )}

      {config.rules.includes('before') && (
        <>
          <label className="text-muted fw-bold" style={{ fontSize: '9px' }}>
            FECHA FIN LIMITE
          </label>
          <CFormInput
            size="sm"
            type={type === 'date' ? 'date' : 'datetime-local'}
            value={getRuleValue(field, 'before') ?? ''}
            onChange={(e) => {
              ind !== 'static'
                ? updateField(index, 'before', e.target.value.replace('T', ' '))
                : updateFieldStatic('before', e.target.value.replace('T', ' '))
            }}
            className="custom-input"
            style={{ marginTop: '-0.35rem' }}
            invalid={!!errors?.[`${basePath}.rules.before`] && validated}
            valid={
              !errors?.[`${basePath}.rules.before`] &&
              getRuleValue(field, 'before') !== '' &&
              validated &&
              (ind === 'static' || editingIndex === index)
            }
            min={getRuleValue(field, 'after')}
            disabled={!getRuleValue(field, 'after')}
          />
          <CFormFeedback invalid style={{ marginTop: '-0.35rem' }}>
            {errors?.[`${basePath}.rules.before`]?.map((error, i) => (
              <div key={i} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter fw-lighter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          {!errors?.[`${basePath}.rules.before`] &&
            getRuleValue(field, 'before') !== '' &&
            validated && (
              <CFormFeedback valid style={{ marginTop: '-0.35rem' }}>
                <div className="d-flex align-items-center gap-1">
                  <BadgeCheck size={13} />
                  <small className="font-inter fw-lighter">Dato Válido</small>
                </div>
              </CFormFeedback>
            )}
        </>
      )}

      {config.rules.includes('options') && (
        <div className="d-flex flex-column gap-2 mt-2">
          <label className="text-muted fw-bold" style={{ fontSize: '9px' }}>
            OPCIONES
          </label>
          <div
            className={`d-flex flex-column gap-2 p-2 rounded-3 border ${
              isInvalid
                ? 'border-danger bg-opacity-10'
                : isValid
                  ? 'border-success bg-opacity-10'
                  : 'border-light'
            }`}
          >
            {options?.map((opt, i) => (
              <div
                key={i}
                className="d-flex align-items-center gap-2 p-2 border rounded-2 bg-light"
              >
                <CFormInput
                  size="sm"
                  type="text"
                  value={opt}
                  placeholder={`Opción ${i + 1}`}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="custom-input"
                />
                {options?.length > 1 && (
                  <CButton size="sm" color="danger" variant="ghost" onClick={() => removeOption(i)}>
                    <Trash2 size={14} />
                  </CButton>
                )}
              </div>
            ))}
            <CButton
              size="sm"
              color="success"
              variant="outline"
              className="d-flex align-items-center justify-content-center gap-1 mt-1"
              onClick={addOption}
            >
              <Plus size={14} />
              Agregar opción
            </CButton>
          </div>
          <CFormFeedback
            invalid
            className={isInvalid ? 'd-block' : 'd-none'}
            style={{ marginTop: '-6px' }}
          >
            {(errors?.[`${basePath}.rules.options`] || []).map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback
            valid
            className={isValid ? 'd-block' : 'd-none'}
            style={{ marginTop: '-6px' }}
          >
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </div>
      )}

      {config.rules.includes('select') && (
        <>
          <div className="d-flex flex-column gap-2 mt-2">
            <label className="text-muted fw-bold" style={{ fontSize: '9px' }}>
              SELECCIONAR MODELO
            </label>
            <CFormSelect
              size="sm"
              className="font-inter shadow-sm custom-input"
              style={{ fontSize: '12px' }}
              value={
                Object.entries(models).find(([_, value]) => value?.model === element?.model)?.[0] ||
                ''
              }
              invalid={!!errors?.[`${basePath}.rules.model`] && validated}
              valid={
                !errors?.[`${basePath}.rules.model`] &&
                Object.entries(models).find(
                  ([_, value]) => value?.model === element?.model,
                )?.[0] !== '' &&
                validated &&
                (ind === 'static' || editingIndex === index)
              }
              onChange={(e) => {
                if (!clave) {
                  setStructure((prev) => {
                    prev.body[index].field = models[e.target.value].field || ''
                    prev.body[index].param = models[e.target.value].param || ''
                    return prev
                  })
                } else {
                  updateField(index, 'field', models[e.target.value].field)
                }

                const cleanedRules = (field || []).filter(
                  (rule) => !rule.startsWith('exists') && !rule.startsWith('unique'),
                )
                let newRules = []
                if (models[e.target.value].field === 'employee_id') {
                  newRules = [
                    ...cleanedRules,
                    'exists:employees,id,deleted_at,NULL',
                    'unique:users,employee_id',
                  ]
                } else {
                  newRules = [
                    ...cleanedRules,
                    `exists:subitems,id,item_id,${models[e.target.value].model}::ITEM_ID`,
                  ]
                }

                ind !== 'static'
                  ? updateRules(index, newRules, e.target.value)
                  : updateRulesStatic(newRules, e.target.value)
              }}
            >
              <option value="">Seleccione un modelo</option>
              {Object.entries(models).map(([key, value]) => (
                <option value={key}>{value.label}</option>
              ))}
            </CFormSelect>
            <CFormFeedback invalid style={{ marginTop: '-0.35rem' }}>
              {errors?.[`${basePath}.rules.model`]?.map((error, i) => (
                <div key={i} className="d-flex align-items-center gap-1">
                  <BadgeAlert size={13} />
                  <small className="font-inter fw-lighter">{error}</small>
                </div>
              ))}
            </CFormFeedback>
            {!errors?.[`${basePath}.rules.model`] &&
              Object.entries(models).find(([_, value]) => value?.model === element?.model)?.[0] !==
                '' &&
              validated &&
              (ind === 'static' || editingIndex === index) && (
                <CFormFeedback valid style={{ marginTop: '-0.35rem' }}>
                  <div className="d-flex align-items-center gap-1">
                    <BadgeCheck size={13} />
                    <small className="font-inter fw-lighter">Dato Válido</small>
                  </div>
                </CFormFeedback>
              )}
          </div>
        </>
      )}

      {config.rules.includes('derived') && (
        <>
          <div className="d-flex flex-column gap-2 mt-2">
            <label className="text-muted fw-bold" style={{ fontSize: '9px' }}>
              SELECCIONAR COLUMNA
            </label>
            <CFormSelect
              size="sm"
              className="font-inter shadow-sm custom-input"
              style={{ fontSize: '12px' }}
              value={element?.depend || ''}
              invalid={!!errors?.[`${basePath}.rules.model`] && validated}
              valid={
                !errors?.[`${basePath}.rules.model`] &&
                Object.entries(models).find(
                  ([_, value]) => value?.model === element?.model,
                )?.[0] !== '' &&
                validated &&
                (ind === 'static' || editingIndex === index)
              }
              onChange={(e) => {
                updateField(index, 'depend', e.target.value)

                /*ind !== 'static'
                  ? updateField(index, 'options', newOptions.join(','))
                  : updateFieldStatic('options', newOptions.join(','))*/
              }}
            >
              <option value="">Seleccione una columna</option>
              {Object.values(structure?.body)
                .filter((val) => val.field !== element?.field)
                .map((value) => (
                  <option value={value.field}>{value.label}</option>
                ))}
            </CFormSelect>
            <CFormFeedback invalid style={{ marginTop: '-0.35rem' }}>
              {errors?.[`${basePath}.rules.model`]?.map((error, i) => (
                <div key={i} className="d-flex align-items-center gap-1">
                  <BadgeAlert size={13} />
                  <small className="font-inter fw-lighter">{error}</small>
                </div>
              ))}
            </CFormFeedback>
            {!errors?.[`${basePath}.rules.model`] &&
              Object.entries(models).find(([_, value]) => value?.model === element?.model)?.[0] !==
                '' &&
              validated &&
              (ind === 'static' || editingIndex === index) && (
                <CFormFeedback valid style={{ marginTop: '-0.35rem' }}>
                  <div className="d-flex align-items-center gap-1">
                    <BadgeCheck size={13} />
                    <small className="font-inter fw-lighter">Dato Válido</small>
                  </div>
                </CFormFeedback>
              )}
          </div>
          <div className="d-flex flex-column gap-2 mt-2">
            <label className="text-muted fw-bold" style={{ fontSize: '9px' }}>
              SELECCIONAR PROPIEDAD
            </label>
            <CFormSelect
              size="sm"
              className="font-inter shadow-sm custom-input"
              style={{ fontSize: '12px' }}
              value={element?.column || ''}
              invalid={!!errors?.[`${basePath}.rules.model`] && validated}
              valid={
                !errors?.[`${basePath}.rules.model`] &&
                Object.entries(models).find(
                  ([_, value]) => value?.model === element?.model,
                )?.[0] !== '' &&
                validated &&
                (ind === 'static' || editingIndex === index)
              }
              onChange={(e) => {
                const newSchema = [...structure.body]
                newSchema[index].field = e.target.value
                setStructure({ ...structure, body: newSchema })
                updateField(index, 'column', e.target.value)

                /*ind !== 'static'
                  ? updateField(index, 'options', newOptions.join(','))
                  : updateFieldStatic('options', newOptions.join(','))*/
              }}
            >
              <option value="">Seleccione un modelo</option>
              {Object.entries(
                Object.values(models).find((model) => model.field === element.depend)?.columns ||
                  {},
              ).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </CFormSelect>
            <CFormFeedback invalid style={{ marginTop: '-0.35rem' }}>
              {errors?.[`${basePath}.rules.model`]?.map((error, i) => (
                <div key={i} className="d-flex align-items-center gap-1">
                  <BadgeAlert size={13} />
                  <small className="font-inter fw-lighter">{error}</small>
                </div>
              ))}
            </CFormFeedback>
            {!errors?.[`${basePath}.rules.model`] &&
              Object.entries(models).find(([_, value]) => value?.model === element?.model)?.[0] !==
                '' &&
              validated &&
              (ind === 'static' || editingIndex === index) && (
                <CFormFeedback valid style={{ marginTop: '-0.35rem' }}>
                  <div className="d-flex align-items-center gap-1">
                    <BadgeCheck size={13} />
                    <small className="font-inter fw-lighter">Dato Válido</small>
                  </div>
                </CFormFeedback>
              )}
          </div>
        </>
      )}

      {element.type !== 'derived' && itemRequired && (
        <div
          className={`d-flex align-items-center justify-content-between mt-1 p-2 rounded mb-2 ${
            validated && (ind === 'static' || editingIndex === index)
              ? 'border border-success bg-success bg-opacity-10'
              : 'bg-white border'
          }`}
        >
          <span className="small font-inter fw-medium text-secondary" style={{ fontSize: '11px' }}>
            ¿Es obligatorio?
          </span>
          <CFormCheck
            checked={field.includes('required')}
            valid={validated && (ind === 'static' || editingIndex === index)}
            onChange={(e) => {
              const isChecked = e.target.checked
              const cleanedRules = (field || []).filter(
                (rule) => rule !== 'required' && rule !== 'nullable',
              )
              const newRules = [...cleanedRules, ...(isChecked ? ['required'] : ['nullable'])]
              ind !== 'static' ? updateRules(index, newRules) : updateRulesStatic(newRules)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default FieldRules
