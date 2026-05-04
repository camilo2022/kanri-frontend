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
}

function FieldRules({ type, field, index, updateField, updateRules, errors, validated, models }) {
  const [options, setOptions] = useState([''])

  const getRuleValue = (rules, key) => {
    const rule = rules.find((r) => r.startsWith(`${key}:`))
    if (!rule) return ''

    const index = rule.indexOf(':')
    return rule.slice(index + 1)
  }

  const config = FIELD_RULES[type]

  if (!config) return null

  useEffect(() => {
    const existing = getRuleValue(field, 'options')
    if (existing) {
      setOptions(existing.split(','))
    }
  }, [])

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
    updateField(index, 'options', newOptions.join(','))
  }

  return (
    <div className="d-flex flex-column gap-2 mt-2">
      {config.rules.includes('min') && (
        <>
          <label className="text-muted fw-bold" style={{ fontSize: '9px' }}>
            {type === 'number' ? 'INICIO DE RANGO' : 'MINIMO DE CARACTERES'}
            <span style={{ color: 'red', fontSize: '10px', marginLeft: '3px' }}>*</span>
          </label>
          <CFormInput
            size="sm"
            type="number"
            placeholder="Min"
            value={getRuleValue(field, 'min') ?? ''}
            onChange={(e) => {
              updateField(index, 'min', e.target.value)
            }}
            className="custom-input"
            style={{ marginTop: '-0.35rem' }}
            invalid={!!errors?.[`settings.structure.schema.${index}.rules.min`] && validated}
            valid={
              !errors?.[`settings.structure.schema.${index}.rules.min`] &&
              getRuleValue(field, 'min') !== '' &&
              validated
            }
          />
          <CFormFeedback invalid style={{ marginTop: '-0.35rem' }}>
            {errors?.[`settings.structure.schema.${index}.rules.min`]?.map((error, i) => (
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
            <span style={{ color: 'red', fontSize: '10px', marginLeft: '3px' }}>*</span>
          </label>
          <CFormInput
            size="sm"
            type="number"
            placeholder="Max"
            value={getRuleValue(field, 'max') ?? ''}
            onChange={(e) => updateField(index, 'max', Number(e.target.value))}
            className="custom-input"
            style={{ marginTop: '-0.35rem' }}
            invalid={!!errors?.[`settings.structure.schema.${index}.rules.max`] && validated}
            valid={
              !errors?.[`settings.structure.schema.${index}.rules.max`] &&
              getRuleValue(field, 'max') !== '' &&
              validated
            }
          />
          <CFormFeedback invalid style={{ marginTop: '-0.35rem' }}>
            {errors?.[`settings.structure.schema.${index}.rules.max`]?.map((error, i) => (
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
            onChange={(e) => updateField(index, 'regex', e.target.value)}
            style={{ marginTop: '-0.35rem' }}
            invalid={!!errors?.[`settings.structure.schema.${index}.rules.regex`] && validated}
            valid={
              !errors?.[`settings.structure.schema.${index}.rules.regex`] &&
              validated &&
              getRuleValue(field, 'regex') !== ''
            }
          />
          <CFormFeedback invalid style={{ marginTop: '-0.35rem' }}>
            {errors?.[`settings.structure.schema.${index}.rules.regex`]?.map((error, i) => (
              <div key={i} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter fw-lighter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          {!errors?.[`settings.structure.schema.${index}.rules.regex`] &&
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
            <span style={{ color: 'red', fontSize: '10px', marginLeft: '3px' }}>*</span>
          </label>
          <CFormInput
            size="sm"
            type={type === 'date' ? 'date' : 'datetime-local'}
            value={getRuleValue(field, 'after') ?? ''}
            onChange={(e) => {
              updateField(index, 'after', e.target.value.replace('T', ' '))
            }}
            style={{ marginTop: '-0.35rem' }}
            className="custom-input"
            invalid={!!errors?.[`settings.structure.schema.${index}.rules.after`] && validated}
            valid={
              !errors?.[`settings.structure.schema.${index}.rules.after`] &&
              getRuleValue(field, 'after') !== '' &&
              validated
            }
          />
          <CFormFeedback invalid style={{ marginTop: '-0.35rem' }}>
            {errors?.[`settings.structure.schema.${index}.rules.after`]?.map((error, i) => (
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
            <span style={{ color: 'red', fontSize: '10px', marginLeft: '3px' }}>*</span>
          </label>
          <CFormInput
            size="sm"
            type={type === 'date' ? 'date' : 'datetime-local'}
            value={getRuleValue(field, 'before') ?? ''}
            onChange={(e) => {
              updateField(index, 'before', e.target.value.replace('T', ' '))
            }}
            className="custom-input"
            style={{ marginTop: '-0.35rem' }}
            invalid={!!errors?.[`settings.structure.schema.${index}.rules.before`] && validated}
            valid={
              !errors?.[`settings.structure.schema.${index}.rules.before`] &&
              getRuleValue(field, 'before') !== '' &&
              validated
            }
          />
          <CFormFeedback invalid style={{ marginTop: '-0.35rem' }}>
            {errors?.[`settings.structure.schema.${index}.rules.before`]?.map((error, i) => (
              <div key={i} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter fw-lighter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          {!errors?.[`settings.structure.schema.${index}.rules.before`] &&
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
          {options?.map((opt, i) => (
            <div key={i} className="d-flex align-items-center gap-2 p-2 border rounded-2 bg-light">
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
      )}

      {config.rules.includes('select') && (
        <div className="d-flex flex-column gap-2 mt-2">
          <label className="text-muted fw-bold" style={{ fontSize: '9px' }}>
            SELECCIONAR MODELO
          </label>
          <CFormSelect
            size="sm"
            className="font-inter shadow-sm custom-input"
            style={{ fontSize: '12px' }}
            value={getRuleValue(field, 'key') || ''}
            invalid={!!errors?.errors?.[`settings.structure.schema.${index}.rules`]}
            valid={
              !errors?.errors?.[`settings.structure.schema.${index}.rules`] &&
              field.type !== '' &&
              validated
            }
            onChange={(e) => {
              const cleanedRules = (field || []).filter(
                (rule) => !rule.startsWith('model') && !rule.startsWith('key'),
              )
              const newRules = [
                ...cleanedRules,
                `key:${e.target.value}`,
                `model:${models[e.target.value].model}`,
              ]
              updateRules(index, newRules)
            }}
          >
            <option value="">Seleccione un modelo</option>
            {Object.entries(models).map(([key, value]) => (
              <option value={key}>{value.label}</option>
            ))}
          </CFormSelect>
        </div>
      )}

      <div
        className={`d-flex align-items-center justify-content-between mt-1 p-2 rounded mb-2 ${
          validated ? 'border border-success bg-success bg-opacity-10' : 'bg-white border'
        }`}
      >
        <span className="small font-inter fw-medium text-secondary" style={{ fontSize: '11px' }}>
          ¿Es obligatorio?
        </span>
        <CFormCheck
          checked={field.includes('required')}
          valid={validated}
          onChange={(e) => {
            const isChecked = e.target.checked
            const cleanedRules = (field || []).filter(
              (rule) => rule !== 'required' && rule !== 'nullable',
            )
            const newRules = [...cleanedRules, ...(isChecked ? ['required'] : ['nullable'])]
            updateRules(index, newRules)
          }}
        />
      </div>
    </div>
  )
}

export default FieldRules
