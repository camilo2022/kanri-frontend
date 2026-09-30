import {
  CFormInput,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CCol,
  CRow,
  CFormLabel,
  CBadge,
  CCard,
  CCardBody,
  CFormFeedback,
} from '@coreui/react'
import {
  Save,
  AlertCircle,
  CheckCircle2,
  CircleMinus,
  Layers,
  Tag,
  Grid,
  Pencil,
  BadgeAlert,
  BadgeCheck,
  Trash,
} from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import Select, { components } from 'react-select'
import { tableSelectStyles, thStyle } from '@/components/StyleManagementCollection'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'

const CustomValueContainer = ({ children, getValue, ...props }) => {
  const selected = getValue()

  return (
    <components.ValueContainer {...props}>
      {selected.length > 0 ? (
        <div
          className="text-truncate text-dark small"
          style={{
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '0.85rem',
          }}
          title={selected.map((item) => item.label).join(', ')}
        >
          {selected.map((item) => item.label).join(', ')}
        </div>
      ) : null}
      {Array.isArray(children)
        ? children.filter((child) => child && child.type !== components.MultiValue)
        : children}
    </components.ValueContainer>
  )
}

const CustomOption = (props) => {
  return (
    <components.Option {...props}>
      <div className="d-flex align-items-center gap-2">
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
          className="form-check-input mt-0 cursor-pointer"
          style={{ pointerEvents: 'none' }}
        />
        <span style={{ fontSize: '0.85rem' }}>{props.label}</span>
      </div>
    </components.Option>
  )
}

const ModalBuilderCurveProgramationManagement = ({
  trademarks = [],
  categories = [],
  subcategories = [],
  fetchSubcategories,
  openModalBuilder,
  setOpenModalBuilder,
  create_builder,
  update_builder,
  delete_builder,
  errors_builder,
  builders,
}) => {
  const [editingBuilderId, setEditingBuilderId] = useState(null)
  const [selectedTrademarks, setSelectedTrademarks] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedSubcategories, setSelectedSubcategories] = useState([])
  const [sizePercentages, setSizePercentages] = useState({})
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subcategoriesGroup, setSubcategoriesGroup] = useState([])
  const [focusedInput, setFocusedInput] = useState(null)
  const [validated, setValidated] = useState(false)

  const isInvalidTrademark = !!errors_builder?.trademark_ids
  const isValidTrademark =
    !errors_builder?.trademark_ids && selectedTrademarks.length > 0 && validated
  const isInvalidCategory = !!errors_builder?.category_ids
  const isValidCategory =
    !errors_builder?.category_ids && selectedCategories.length > 0 && validated
  const isInvalidSubcategory = !!errors_builder?.subcategory_ids
  const isValidSubcategory =
    !errors_builder?.subcategory_ids && selectedSubcategories.length > 0 && validated

  const getNormalizedSizes = (trademark) => {
    const rawSizes = trademark?.sizes || []
    return rawSizes.map((size) => String(typeof size === 'object' ? size.id : size)).sort()
  }

  const trademarkOptions = useMemo(() => {
    if (!trademarks || trademarks.length === 0) return []

    let filteredTrademarks = trademarks

    if (selectedTrademarks.length > 0) {
      const firstSelectedId = String(selectedTrademarks[0].value)
      const firstTrademarkObj = trademarks.find((t) => String(t.id || t.value) === firstSelectedId)

      if (firstTrademarkObj) {
        const referenceSizes = getNormalizedSizes(firstTrademarkObj)
        const referenceSizesString = referenceSizes.join(',')

        filteredTrademarks = trademarks.filter((tm) => {
          const tmSizes = getNormalizedSizes(tm)
          return tmSizes.join(',') === referenceSizesString
        })
      }
    }

    const opts = filteredTrademarks.map((t) => ({ value: t.id, label: t.name }))
    return opts.length > 0 ? [...opts] : []
  }, [trademarks, selectedTrademarks])

  const categoryOptions = useMemo(() => {
    const opts = categories.map((c) => ({ value: c.id, label: c.name }))
    return opts.length > 0
      ? [{ value: 'SELECT_ALL', label: '--- Seleccionar Todo ---' }, ...opts]
      : []
  }, [categories])

  const subcategoryOptions = useMemo(() => {
    if (!subcategoriesGroup || subcategoriesGroup.length === 0) {
      return []
    }

    const opts = subcategoriesGroup.map((sub) => ({
      value: sub.id,
      label: sub.name,
      category_id: sub.category_id,
    }))

    return opts.length > 0
      ? [{ value: 'SELECT_ALL', label: '--- Seleccionar Todo ---' }, ...opts]
      : []
  }, [subcategoriesGroup])

  const handleMultiSelectChange = (selectedOptions, allOptions, setter, callback) => {
    if (!selectedOptions) {
      setter([])
      if (callback) callback([])
      return
    }

    const hasSelectAll = selectedOptions.some((item) => item.value === 'SELECT_ALL')
    const realOptions = allOptions.filter((item) => item.value !== 'SELECT_ALL')

    if (hasSelectAll) {
      const currentRealSelected = selectedOptions.filter((item) => item.value !== 'SELECT_ALL')
      if (currentRealSelected.length === realOptions.length) {
        setter([])
        if (callback) callback([])
      } else {
        setter(realOptions)
        if (callback) callback(realOptions)
      }
    } else {
      setter(selectedOptions)
      if (callback) callback(selectedOptions)
    }
  }

  const handleCategoryChange = (options) => {
    handleMultiSelectChange(
      options,
      categoryOptions,
      setSelectedCategories,
      async (newCategories) => {
        const activeCatIds = newCategories.map((c) => String(c.value))

        setSelectedSubcategories((prev) =>
          prev.filter((sub) => activeCatIds.includes(String(sub.category_id))),
        )

        if (newCategories.length > 0) {
          setLoadingSubcategories(true)
          try {
            const responses = await Promise.all(
              newCategories.map((cat) => fetchSubcategories(cat.value)),
            )

            const allFetchedSubcategories = responses.flatMap((res) => {
              return Array.isArray(res) ? res : res?.data || []
            })

            const uniqueSubcategories = Array.from(
              new Map(allFetchedSubcategories.map((sub) => [sub.id, sub])).values(),
            )

            setSubcategoriesGroup(uniqueSubcategories)
          } catch (error) {
            console.error('Error al cargar subcategorías:', error)
          } finally {
            setLoadingSubcategories(false)
          }
        } else {
          setSubcategoriesGroup([])
        }
      },
    )
  }

  const availableSizes = useMemo(() => {
    if (!selectedTrademarks || selectedTrademarks.length === 0) return []

    const trademarkIds = selectedTrademarks.map((t) => String(t.value))
    const selectedTrademarkObjects = trademarks.filter((t) =>
      trademarkIds.includes(String(t.id || t.value)),
    )

    const sizesMap = new Map()
    selectedTrademarkObjects.forEach((tm) => {
      const sizesList = tm?.sizes || []
      sizesList.forEach((size) => {
        const key = typeof size === 'object' ? size.id : size
        const label = typeof size === 'object' ? size.name : size
        if (!sizesMap.has(key)) {
          sizesMap.set(key, { key, label, raw: size })
        }
      })
    })

    return Array.from(sizesMap.values())
  }, [selectedTrademarks, trademarks])

  useEffect(() => {
    if (availableSizes.length > 0) {
      setSizePercentages((prev) => {
        const newMap = {}
        availableSizes.forEach((sizeObj) => {
          newMap[sizeObj.key] = prev[sizeObj.key] ?? 0
        })
        return newMap
      })
    } else {
      setSizePercentages({})
    }
  }, [availableSizes])

  const handlePercentageChange = (sizeKey, value) => {
    const numValue = parseFloat(value) || 0
    setSizePercentages((prev) => ({
      ...prev,
      [sizeKey]: Math.max(0, Math.min(100, numValue)),
    }))
  }

  const totalPercentage = useMemo(() => {
    return Object.values(sizePercentages).reduce((acc, curr) => acc + (Number(curr) || 0), 0)
  }, [sizePercentages])

  const resetForm = () => {
    setEditingBuilderId(null)
    setSelectedTrademarks([])
    setSelectedCategories([])
    setSelectedSubcategories([])
    setSizePercentages({})
    setSubcategoriesGroup([])
  }

  const handleClose = () => {
    resetForm()
    setOpenModalBuilder(false)
  }

  const handleEditBuilder = async (builder) => {
    setValidated(false)
    setEditingBuilderId(builder.id)

    const mappedTrademarks = (builder.trademarks || []).map((t) => ({
      value: t.id,
      label: t.name,
    }))
    setSelectedTrademarks(mappedTrademarks)

    const mappedCategories = (builder.categories || []).map((c) => ({
      value: c.id,
      label: c.name,
    }))
    setSelectedCategories(mappedCategories)

    if (mappedCategories.length > 0) {
      setLoadingSubcategories(true)
      try {
        const responses = await Promise.all(
          mappedCategories.map((cat) => fetchSubcategories(cat.value)),
        )

        const allFetchedSubcategories = responses.flatMap((res) => {
          return Array.isArray(res) ? res : res?.data || []
        })

        const uniqueSubcategories = Array.from(
          new Map(allFetchedSubcategories.map((sub) => [sub.id, sub])).values(),
        )

        setSubcategoriesGroup(uniqueSubcategories)

        const mappedSubcategories = (builder.subcategories || []).map((s) => ({
          value: s.id,
          label: s.name,
          category_id: s.category_id,
        }))
        setSelectedSubcategories(mappedSubcategories)
      } catch (error) {
        console.error('Error al cargar subcategorías para edición:', error)
      } finally {
        setLoadingSubcategories(false)
      }
    }

    const percentageMap = {}
    if (Array.isArray(builder.percentages)) {
      builder.percentages.forEach((p) => {
        const sizeId = p.size?.id || p.size_id
        if (sizeId) {
          percentageMap[sizeId] = p.percentage
        }
      })
    }
    setSizePercentages(percentageMap)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      id: editingBuilderId,
      trademark_id: selectedTrademarks.map((t) => t.value),
      category_id: selectedCategories.map((c) => c.value),
      subcategory_id: selectedSubcategories.map((s) => s.value),
      percentages: sizePercentages,
    }

    console.log('CUERPO DEL CONSTRUCTOR', payload)

    setIsSubmitting(true)
    try {
      if (editingBuilderId && update_builder) {
        await update_builder(payload, editingBuilderId)
        Toast.fire({
          icon: 'success',
          title: 'Constructor editado correctamente',
        })
        setOpenModalBuilder(false)
      } else if (create_builder) {
        await create_builder(payload)
        Toast.fire({
          icon: 'success',
          title: 'Constructor creado correctamente',
        })
        setOpenModalBuilder(false)
      }
      resetForm()
    } catch (error) {
      console.error('Error al guardar el constructor:', error)
      setValidated(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBuilder = async (builder_id) => {
    const result = await Swal.fire({
      title: 'Eliminar Constructor',
      html: `<div style="font-size:14px">
                   Se eliminará el constructor. La información ingresada sera eliminada.<br/>
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
      return
    }

    try {
      await delete_builder(builder_id)
      Toast.fire({
        icon: 'success',
        title: 'Constructor eliminado correctamente',
      })
      setOpenModalBuilder(false)
    } catch (error) {}
  }

  const getCustomSelectStyles = (isInvalid, isValid) => {
    let borderColor = '#E2E8F0'
    let focusBorderColor = '#24247f'
    let focusBoxShadow = '0 0 0 3px rgba(36, 36, 127, 0.12)'

    if (isInvalid) {
      borderColor = '#dc3545'
      focusBorderColor = '#dc3545'
      focusBoxShadow = '0 0 0 3px rgba(220, 53, 69, 0.25)'
    } else if (isValid) {
      borderColor = '#198754'
      focusBorderColor = '#198754'
      focusBoxShadow = '0 0 0 3px rgba(25, 135, 84, 0.25)'
    }

    return {
      ...tableSelectStyles,
      control: (provided, state) => ({
        ...provided,
        minHeight: '40px',
        maxHeight: '40px',
        borderRadius: '10px',
        border: `1px solid ${borderColor}`,
        borderColor: borderColor,
        '&:hover': {
          borderColor: borderColor,
        },
        boxShadow: state.isFocused ? focusBoxShadow : 'none',
      }),
      valueContainer: (provided) => ({
        ...provided,
        padding: '2px 8px',
        maxHeight: '38px',
        overflow: 'hidden',
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap',
      }),
      multiValue: () => ({
        display: 'none',
      }),
    }
  }

  return (
    <CModal
      visible={openModalBuilder}
      onClose={handleClose}
      alignment="center"
      className="font-montserrat"
      size="xl"
    >
      <CModalHeader
        style={{
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
        }}
      >
        <CModalTitle
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#0F172A',
          }}
        >
          Gestión de Constructor
        </CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit}>
        <CModalBody className="px-4 py-3">
          <CRow className="g-3">
            <CCol md={4}>
              <CFormLabel className="fw-semibold text-secondary small">Marca(s)</CFormLabel>
              <Select
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                options={trademarkOptions}
                value={selectedTrademarks}
                onChange={(opts) =>
                  handleMultiSelectChange(opts, trademarkOptions, setSelectedTrademarks)
                }
                placeholder="Seleccionar marca(s)..."
                components={{ Option: CustomOption, ValueContainer: CustomValueContainer }}
                styles={getCustomSelectStyles(isInvalidTrademark, isValidTrademark)}
                isClearable={false}
              />
              <CFormFeedback invalid className={isInvalidTrademark ? 'd-block' : 'd-none'}>
                {errors_builder?.trademark_ids?.map((error, index) => (
                  <div key={index} className="d-flex align-items-center gap-1">
                    <BadgeAlert size={13} />
                    <small className="font-inter">{error}</small>
                  </div>
                ))}
              </CFormFeedback>
              <CFormFeedback valid className={isValidTrademark ? 'd-block' : 'd-none'}>
                <div className="d-flex align-items-center gap-1">
                  <BadgeCheck size={13} />
                  <small className="font-inter">Dato Válido</small>
                </div>
              </CFormFeedback>
            </CCol>

            <CCol md={4}>
              <CFormLabel className="fw-semibold text-secondary small">Categoría(s)</CFormLabel>
              <Select
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                options={categoryOptions}
                value={selectedCategories}
                onChange={handleCategoryChange}
                placeholder="Seleccionar categoría(s)..."
                components={{ Option: CustomOption, ValueContainer: CustomValueContainer }}
                styles={getCustomSelectStyles(isInvalidCategory, isValidCategory)}
                isClearable={false}
              />
              <CFormFeedback invalid className={isInvalidCategory ? 'd-block' : 'd-none'}>
                {errors_builder?.category_ids?.map((error, index) => (
                  <div key={index} className="d-flex align-items-center gap-1">
                    <BadgeAlert size={13} />
                    <small className="font-inter">{error}</small>
                  </div>
                ))}
              </CFormFeedback>
              <CFormFeedback valid className={isValidCategory ? 'd-block' : 'd-none'}>
                <div className="d-flex align-items-center gap-1">
                  <BadgeCheck size={13} />
                  <small className="font-inter">Dato Válido</small>
                </div>
              </CFormFeedback>
            </CCol>

            <CCol md={4}>
              <CFormLabel className="fw-semibold text-secondary small">Subcategoría(s)</CFormLabel>
              <Select
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                options={subcategoryOptions}
                value={selectedSubcategories}
                onChange={(opts) =>
                  handleMultiSelectChange(opts, subcategoryOptions, setSelectedSubcategories)
                }
                isLoading={loadingSubcategories}
                placeholder={
                  loadingSubcategories
                    ? 'Cargando subcategorías...'
                    : selectedCategories.length > 0
                      ? 'Seleccionar subcategoría(s)...'
                      : 'Primero selecciona una categoría'
                }
                isDisabled={selectedCategories.length === 0 || loadingSubcategories}
                components={{ Option: CustomOption, ValueContainer: CustomValueContainer }}
                styles={getCustomSelectStyles(isInvalidSubcategory, isValidSubcategory)}
                isClearable={false}
              />
              <CFormFeedback invalid className={isInvalidSubcategory ? 'd-block' : 'd-none'}>
                {errors_builder?.subcategory_ids?.map((error, index) => (
                  <div key={index} className="d-flex align-items-center gap-1">
                    <BadgeAlert size={13} />
                    <small className="font-inter">{error}</small>
                  </div>
                ))}
              </CFormFeedback>
              <CFormFeedback valid className={isValidSubcategory ? 'd-block' : 'd-none'}>
                <div className="d-flex align-items-center gap-1">
                  <BadgeCheck size={13} />
                  <small className="font-inter">Dato Válido</small>
                </div>
              </CFormFeedback>
            </CCol>
          </CRow>

          <div className="mt-4">
            {selectedTrademarks.length > 0 ? (
              availableSizes.length > 0 ? (
                <div className="table-responsive">
                  <table className="table align-middle mb-0 border">
                    <thead>
                      <tr className="font-poppins">
                        <th className="text-center align-middle" style={{ ...thStyle }}>
                          Talla
                        </th>
                        {availableSizes.map((sizeObj) => (
                          <th
                            key={sizeObj.key}
                            className="text-center align-middle"
                            style={{ ...thStyle }}
                          >
                            {sizeObj.label}
                          </th>
                        ))}
                        <th className="text-center align-middle" style={{ ...thStyle }}>
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="font-inter">
                      <tr>
                        <td className="text-center align-middle" style={{ fontSize: '0.8rem' }}>
                          %
                        </td>
                        {availableSizes.map((sizeObj) => {
                          const isFocused = focusedInput?.size === sizeObj.key

                          return (
                            <td key={sizeObj.key} className="table-cell text-center align-middle">
                              <CFormInput
                                type="number"
                                min={0}
                                step={1}
                                max="100"
                                className="table-input border-0 shadow-none py-2px font-inter w-100 text-center"
                                value={
                                  isFocused && sizePercentages[sizeObj.key] === 0
                                    ? ''
                                    : (sizePercentages[sizeObj.key] ?? 0)
                                }
                                onFocus={() => {
                                  setFocusedInput({
                                    size: sizeObj.key,
                                  })
                                }}
                                onBlur={() => {
                                  if (
                                    sizePercentages[sizeObj.key] === '' ||
                                    sizePercentages[sizeObj.key] === null
                                  ) {
                                    handlePercentageChange(sizeObj.key, 0)
                                  }

                                  setFocusedInput(null)
                                }}
                                onKeyDown={(e) => {
                                  if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                                    e.preventDefault()
                                  }
                                }}
                                onChange={(e) =>
                                  handlePercentageChange(sizeObj.key, e.target.value)
                                }
                              />
                            </td>
                          )
                        })}
                        <td className="table-cell text-center align-middle">
                          <CBadge
                            color={
                              Math.round(totalPercentage) === 100
                                ? 'success'
                                : Math.round(totalPercentage) > 100
                                  ? 'danger'
                                  : 'warning'
                            }
                            className="d-inline-flex align-items-center gap-1 px-2 py-1"
                            style={{ fontSize: '0.85rem' }}
                          >
                            {Math.round(totalPercentage) === 100 ? (
                              <CheckCircle2 size={14} />
                            ) : Math.round(totalPercentage) > 100 ? (
                              <AlertCircle size={14} />
                            ) : (
                              <CircleMinus size={14} />
                            )}
                            {totalPercentage}%
                          </CBadge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-3 bg-light text-center rounded text-muted small border">
                  Las marcas seleccionadas no tienen tallas asociadas.
                </div>
              )
            ) : (
              <div className="p-3 bg-light text-center rounded text-muted small border">
                Selecciona al menos una marca para cargar la tabla de tallas y sus porcentajes.
              </div>
            )}
          </div>
        </CModalBody>

        <CModalFooter className="mt-2">
          <CButton
            color="secondary"
            size="sm"
            onClick={editingBuilderId ? resetForm : handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </CButton>
          <CButton
            type="submit"
            size="sm"
            className="text-white d-flex align-items-center gap-2"
            style={{
              backgroundColor: '#24247F',
              border: 'none',
            }}
            disabled={isSubmitting || Math.round(totalPercentage) !== 100}
          >
            <Save size={16} />
            {isSubmitting
              ? 'Guardando...'
              : editingBuilderId
                ? 'Actualizar Constructor'
                : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CForm>

      {/* LISTADO DE CONSTRUCTORES CONFIGURADOS */}
      {Array.isArray(builders) && builders.length > 0 && (
        <div className="mb-5 px-4">
          <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.9rem' }}>
            Constructores Configurados ({builders.length})
          </h6>
          <div
            className="d-flex flex-column gap-3"
            style={{ maxHeight: '300px', overflowY: 'auto' }}
          >
            {builders.map((item, index) => {
              const isBeingEdited = editingBuilderId === item.id

              return (
                <CCard
                  key={item.id || index}
                  className={`border shadow-sm ${isBeingEdited ? 'border-primary bg-light' : ''}`}
                >
                  <CCardBody className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                      <span className="fw-bold text-secondary small">
                        Constructor #{item.id || index + 1}
                      </span>
                      <div className="d-flex gap-2">
                        <CButton
                          color="primary"
                          variant="outline"
                          size="sm"
                          className="d-flex align-items-center gap-1 py-1 px-2"
                          onClick={() => handleEditBuilder(item)}
                        >
                          <Pencil size={13} /> Editar
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          size="sm"
                          className="d-flex align-items-center gap-1 py-1 px-2"
                          style={{
                            '--cui-btn-hover-color': '#fff',
                            '--bs-btn-hover-color': '#fff',
                          }}
                          onClick={() => handleDeleteBuilder(item.id)}
                        >
                          <Trash size={13} /> Eliminar
                        </CButton>
                      </div>
                    </div>

                    <CRow className="g-3 align-items-center">
                      <CCol md={6} className="border-end pe-md-3">
                        <div className="d-flex flex-column gap-2">
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <Tag size={15} className="text-primary" />
                              <span className="fw-bold small text-secondary">Marcas:</span>
                            </div>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {item.trademarks?.map((t) => (
                                <CBadge key={t.id} color="info" className="text-dark bg-opacity-10">
                                  {t.name}
                                </CBadge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <Layers size={15} className="text-primary" />
                              <span className="fw-bold small text-secondary">Categorías:</span>
                            </div>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {item.categories?.map((c) => (
                                <CBadge key={c.id} color="secondary">
                                  {c.name}
                                </CBadge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <Grid size={15} className="text-primary" />
                              <span className="fw-bold small text-secondary">Subcategorías:</span>
                            </div>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {item.subcategories?.map((s) => (
                                <CBadge key={s.id} color="dark">
                                  {s.name}
                                </CBadge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CCol>

                      <CCol md={6} className="ps-md-3">
                        <span
                          className="fw-semibold text-muted d-block mb-2"
                          style={{ fontSize: '0.78rem' }}
                        >
                          Distribución de Porcentajes:
                        </span>
                        {Array.isArray(item.percentages) && item.percentages.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table table-sm table-bordered align-middle mb-0 font-inter">
                              <thead>
                                <tr className="bg-light text-center">
                                  {item.percentages.map((p, idx) => (
                                    <th
                                      key={p.size?.id || idx}
                                      style={{ ...thStyle, fontSize: '0.75rem' }}
                                      className="text-center px-2"
                                    >
                                      {p.size?.name || p.size?.description || '-'}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  {item.percentages.map((p, idx) => (
                                    <td
                                      key={p.size?.id || idx}
                                      className="text-center fw-bold text-dark px-2 py-3"
                                      style={{ fontSize: '0.8rem' }}
                                    >
                                      {p.percentage}%
                                    </td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-muted small italic">Sin porcentajes registrados</div>
                        )}
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              )
            })}
          </div>
        </div>
      )}
    </CModal>
  )
}

export default ModalBuilderCurveProgramationManagement
