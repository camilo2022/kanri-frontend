import api from '../../../../API/api'
import { getConfig } from '../../../../axiosConfig'
import { useState, useEffect } from 'react'
import { CCard, CFormInput, CCol, CButton, CForm, CFormFeedback, CFormLabel } from '@coreui/react'
import { IoIosReturnRight, IoMdArrowDropright } from 'react-icons/io'
import { Save, ArrowLeftCircle, BadgeCheck, BadgeAlert, TextInitial } from 'lucide-react'
import { Toast } from '@/components/Toast'
import Swal from 'sweetalert2'
import Select from 'react-select'

const Create = ({ supply_type, onChangeView, onSubmit, errors, models }) => {
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    supply_type_id: supply_type.id,
    values: {},
    class: {},
  })
  const [catalogsData, setCatalogsData] = useState({})

  useEffect(() => {
    if (!supply_type?.settings) return

    const loadAllCatalogs = async () => {
      const modelsToLoad = new Set()
      const dependentFieldsAux = []
      const settings = supply_type?.settings || []

      for (const field of settings?.form) {
        if (field.type === 'selectdinamic' && !field.param && !catalogsData[field.model]) {
          modelsToLoad.add(field.model)
        }

        if (field.type === 'selectdinamic' && field.param && !catalogsData[field.model]) {
          const aux = Object.values(models).find((item) => item.model === field.param)
          dependentFieldsAux.push({
            model: field.model,
            dependency: { model: field.param, param: field[aux.field] },
          })
        }
      }

      for (const model of modelsToLoad) {
        await loadCatalog(model)
      }

      for (const depent of dependentFieldsAux) {
        await loadCatalog(depent.model, depent.dependency)
      }
    }

    loadAllCatalogs()
  }, [supply_type?.settings])

  const getCatalog = async (key, dependencyValue = null) => {
    try {
      let url = Object.entries(models).find(([_, value]) => value.model === key)?.[1]?.url

      if (dependencyValue) {
        const aux = Object.values(models).find((value) => value.model === dependencyValue.model)
        url = url.replace(`{${aux.field}}`, dependencyValue.param)
      }

      const response = await api.get(url, {
        ...getConfig(),
      })

      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Error desconocido' }
    }
  }

  const loadCatalog = async (key, dependencyValue = null) => {
    const cacheKey = dependencyValue ? `${dependencyValue.model}_${dependencyValue.value}` : key
    if (catalogsData[cacheKey]) return
    const res = await getCatalog(key, dependencyValue)
    const aux = Array.isArray(
      res.data[Object.entries(models).find(([_, value]) => value.model === key)[0]],
    )
      ? res.data[Object.entries(models).find(([_, value]) => value.model === key)[0]].reduce(
          (acc, item) => {
            acc[item.id] = {
              id: item.id,
              ...(!item.person ? { name: item.name } : { person: item.person }),
            }
            return acc
          },
          {},
        )
      : {}

    setCatalogsData((prev) => ({
      ...prev,
      [key]: aux,
    }))
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    Swal.fire({
      title: 'Crear Insumo',
      html: `<div style="font-size:14px">
              Se guardará la información del insumo en el sistema.<br/>
              <strong>¿Deseas continuar?</strong>
            </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, crear',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await onSubmit({
            ...formData,
            settings: {
              ['values']: { ...formData.values },
            },
          })
          setValidated(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setTimeout(() => {
            setFormData({
              name: '',
              description: '',
              supply_type_id: supply_type.id,
            })
            onChangeView({ name: 'list', title: 'Listar Insumos' })
          }, 2510)
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

  const handleChange = (e, ind, type) => {
    const { name, value } = e.target
    if (!type) {
      setFormData((prev) => ({
        ...prev,
        [name]: value.toUpperCase(),
      }))
    }

    if (!!type) {
      setFormData((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          [name]: value.toUpperCase(),
        },
      }))
    }
  }

  const normalize = (title = '') => {
    return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()
  }

  const customFilterOption = (option, rawInput) => {
    const words = rawInput.toLowerCase().split(' ')
    const label = option.label.toLowerCase()
    return words.every((word) => label.includes(word))
  }

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0 animate-fade-in">
      <div className="d-flex align-items-center mb-3">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Crear Insumos</span>
      </div>
      <CForm className="row g-3 needs-validation p-4" onSubmit={handleSubmit}>
        <CCol md={6}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <TextInitial size={15} /> Nombre
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            invalid={!!errors?.name}
            valid={!errors?.name && formData.name !== '' && validated}
            className="font-montserrat custom-input"
          />
          <CFormFeedback invalid>
            {errors?.name?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback valid>
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </CCol>
        <CCol md={6}>
          <CFormLabel className="d-flex gap-2 font-inter align-items-center">
            <TextInitial size={15} /> Descripción
            <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            invalid={!!errors?.description}
            valid={!errors?.description && formData.description !== '' && validated}
            className="font-montserrat custom-input"
          />
          <CFormFeedback invalid>
            {errors?.description?.map((error, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} />
                <small className="font-inter">{error}</small>
              </div>
            ))}
          </CFormFeedback>
          <CFormFeedback valid>
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato Válido</small>
            </div>
          </CFormFeedback>
        </CCol>
        {supply_type?.settings?.form?.map((input) => {
          const options =
            input.type === 'select'
              ? Object.values(input.options || {}).map((opt) => ({
                  value: opt.trim(),
                  label: opt.trim(),
                }))
              : Object.values(catalogsData?.[input.model] || {}).map((opt) => {
                  const optionPath = Object.entries(models).find(
                    ([_, value]) => value?.model === input?.model,
                  )?.[1]?.option
                  return {
                    value: opt.id,
                    label: dataGet(optionPath, opt, ''),
                  }
                })
          const isInvalid =
            !!errors?.[!input.model ? `values.${input.field}` : `class.${input.field}`]
          const isValid =
            !errors?.[!input.model ? `values.${input.field}` : `class.${input.field}`] &&
            formData[!input.model ? `values` : `class`][input.field] &&
            validated
          return (
            <CCol md={6} key={input.id}>
              <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                <TextInitial size={15} /> {normalize(input.label)}
                <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
              </CFormLabel>
              {input.type !== 'select' && input.type !== 'selectdinamic' ? (
                input.type === 'textarea' ? (
                  <CFormTextarea
                    rows={1}
                    name={`${input.field}`}
                    value={formData?.[`${input.field}`]}
                    onChange={(e) => handleChange(e, input.cardinality, input.type)}
                    invalid={
                      !!errors?.[!input.model ? `values.${input.field}` : `class.${input.field}`]
                    }
                    valid={
                      !errors?.[!input.model ? `values.${input.field}` : `class.${input.field}`] &&
                      formData[!input.model ? `values` : `class`][input.field] &&
                      validated
                    }
                    placeholder="Ingrese..."
                    className="font-montserrat custom-input"
                  />
                ) : input.type === 'boolean' ? (
                  <CFormCheck
                    name={`${input.field}`}
                    value={formData?.[`${input.field}`]}
                    onChange={handleChange}
                    checked={formData?.[`${input.field}`]}
                    className="font-montserrat custom-input"
                  />
                ) : (
                  <CFormInput
                    type={input.type}
                    name={`${input.field}`}
                    value={formData?.[`${input.field}`]}
                    onChange={(e) => handleChange(e, input.cardinality, input.type)}
                    invalid={
                      !!errors?.[!input.model ? `values.${input.field}` : `class.${input.field}`]
                    }
                    valid={
                      !errors?.[!input.model ? `values.${input.field}` : `class.${input.field}`] &&
                      formData[!input.model ? `values` : `class`][input.field] &&
                      validated
                    }
                    placeholder="Ingrese..."
                    className="font-montserrat custom-input"
                  />
                )
              ) : (
                <Select
                  isMulti={input.cardinality === 'multiple'}
                  name={`${input.field}`}
                  value={options.find(
                    (opt) => String(opt.value) === String(formData?.[input.field]),
                  )}
                  options={options}
                  isDisabled={!options}
                  onChange={(selectedOptions) => {
                    setFormData((prev) => ({
                      ...prev,
                      class: {
                        ...prev.class,
                        [input.field]:
                          input.cardinality === 'multiple'
                            ? (selectedOptions ?? []).map((item) => item.value)
                            : (selectedOptions?.value ?? null),
                      },
                    }))
                  }}
                  isSearchable
                  filterOption={customFilterOption}
                  className="font-montserrat"
                  placeholder={'Selecciona uno o varios...'}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: isInvalid ? '#dc3545' : isValid ? '#198754' : '#dbdfe6',
                      boxShadow: 'none',
                      borderRadius: '0.375rem',
                      minHeight: '38px',
                      maxHeight: '38px',
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: '#1857b6',
                        boxShadow: '0 0 0 0.2rem rgba(13, 110, 253, 0.25)',
                      },
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      flexWrap: 'nowrap',
                      overflowX: 'auto',
                    }),
                    multiValue: (base) => ({
                      ...base,
                      minWidth: 'max-content',
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      whiteSpace: 'nowrap',
                    }),
                    input: (base) => ({
                      ...base,
                      margin: 0,
                    }),
                    indicatorsContainer: (base) => ({
                      ...base,
                      height: '38px',
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                      fontFamily: 'Montserrat, sans-serif',
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                      borderRadius: '0.375rem',
                      overflow: 'hidden',
                    }),
                    menuList: (base) => ({
                      ...base,
                      padding: 0,
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? '#f1f3f5' : 'white',
                      color: state.isSelected ? '#1b3761' : '#212529',
                      fontWeight: state.isSelected ? 'bold' : '',
                    }),
                  }}
                />
              )}
              {errors?.[!input.model ? `values.${input.field}` : `class.${input.field}`] && (
                <div className="invalid-feedback d-block">
                  {errors[!input.model ? `values.${input.field}` : `class.${input.field}`].map(
                    (error, index) => (
                      <div key={index} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter">{error}</small>
                      </div>
                    ),
                  )}
                </div>
              )}
              {!errors?.[!input.model ? `values.${input.field}` : `class.${input.field}`] &&
                formData[!input.model ? `values` : `class`][input.field] &&
                validated && (
                  <div className="valid-feedback d-block">
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter">Dato válido</small>
                    </div>
                  </div>
                )}
            </CCol>
          )
        })}
        <div className="d-flex justify-content-between align-items-center mt-5">
          <CButton
            className="d-flex align-items-center gap-2 font-poppins btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Insumos' })
            }}
          >
            <ArrowLeftCircle size={16} /> Volver
          </CButton>
          <CButton
            className="d-flex align-items-center gap-2 font-poppins btn-primary-add "
            type="submit"
          >
            <Save size={16} /> Guardar
          </CButton>
        </div>
      </CForm>
    </CCard>
  )
}

export default Create
