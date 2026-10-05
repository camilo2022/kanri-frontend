import { useState } from 'react'
import {
  CFormInput,
  CRow,
  CCol,
  CFormLabel,
  CFormTextarea,
  CFormCheck,
  CTooltip,
} from '@coreui/react'
import { useEffect } from 'react'
import {
  Sheet,
  ImagePlus,
  BadgeCheck,
  BadgeAlert,
  Images,
  ImageMinus,
  ZoomIn,
  X,
  Check,
} from 'lucide-react'
import Select from 'react-select'
import { useRef } from 'react'
import { getSelectStyles } from '@/components/StyleManagementCollection'

const EditableField = ({
  label,
  is_required = true,
  editing,
  display,
  editor,
  error,
  valid,
  validated,
}) => {
  return (
    <>
      <div className={`d-flex flex-column ${validated ? 'gap-1' : 'gap-2'}`}>
        <CFormLabel className="d-flex gap-2 font-inter mb-0">
          {label}
          {is_required ? <span style={{ color: 'red', marginLeft: '-5px' }}>*</span> : ''}
        </CFormLabel>
        <div className="position-relative">
          {editing ? editor : display}
          {!editing && !error && valid && (
            <Check size={16} strokeWidth={5} className="editable-field-check" />
          )}
        </div>
        {error && (
          <div className="invalid-feedback d-block" style={{ marginTop: '0.05rem' }}>
            {error.map((message, index) => (
              <div key={index} className="d-flex align-items-center gap-1">
                <BadgeAlert size={13} className="flex-shrink-0" />
                <small className="font-inter" style={{ whiteSpace: 'pre-line' }}>
                  {message}
                </small>
              </div>
            ))}
          </div>
        )}

        {!error && valid && (
          <div className="valid-feedback d-block" style={{ marginTop: '0.05rem' }}>
            <div className="d-flex align-items-center gap-1">
              <BadgeCheck size={13} />
              <small className="font-inter">Dato válido</small>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const InformationTransformation = ({
  product,
  technical_sheet,
  fetchCollections,
  collections,
  fetchSubgroups,
  subgroups,
  fetchGarmentTypes,
  garment_types,
  fetchWashTones,
  wash_tones,
  fetchColors,
  colors,
  fetchBackTypes,
  back_types,
  fetchBootTypes,
  boot_types,
  fetchYokeTypes,
  yoke_types,
  fetchWaistbandTypes,
  waistband_types,
  fetchEmployees,
  employees,
  errors,
  validated,
  formData,
  setFormData,
  statusTechnical,
  trademarks,
  categories,
  fetchCategories,
  subcategories,
  fetchSubcategories,
  findTrademarkByCode,
}) => {
  const [editingField, setEditingField] = useState(null)
  const inputRefs = useRef({})

  const [photoDPreview, setPhotoDPreview] = useState(null)
  const [photoTPreview, setPhotoTPreview] = useState(null)

  const [showFullscreen, setShowFullscreen] = useState(false)

  const isInvalidSubcategory = !!errors?.['product.subcategory_id']
  const isValidSubcategory =
    !errors?.['product.subcategory_id'] && formData?.subcategory_id !== '' && validated
  const isInvalidCollection = !!errors?.['technical_sheet.collection_id']
  const isValidCollection =
    !errors?.['technical_sheet.collection_id'] && formData?.collection_id !== '' && validated
  const isInvalidStatus = !!errors?.['technical_sheet.status']
  const isValidStatus = !errors?.['technical_sheet.status'] && formData?.status !== '' && validated
  const isInvalidSubgroup = !!errors?.['technical_sheet.subgroup_id']
  const isValidSubgroup =
    !errors?.['technical_sheet.subgroup_id'] && formData?.subgroup_id !== '' && validated
  const isInvalidGarmentType = !!errors?.['technical_sheet.garment_type_id']
  const isValidGarmentType =
    !errors?.garment_type_id && formData?.['technical_sheet.garment_type_id'] !== '' && validated
  const isInvalidWashTone = !!errors?.['technical_sheet.wash_tone_id']
  const isValidWashTone =
    !errors?.['technical_sheet.wash_tone_id'] && formData?.wash_tone_id !== '' && validated
  const isInvalidColor = !!errors?.['technical_sheet.color_id']
  const isValidColor =
    !errors?.['technical_sheet.color_id'] && formData?.color_id !== '' && validated
  const isInvalidBackType = !!errors?.['technical_sheet.back_type_id']
  const isValidBackType =
    !errors?.['technical_sheet.back_type_id'] && formData?.back_type_id !== '' && validated
  const isInvalidBootType = !!errors?.['technical_sheet.boot_type_id']
  const isValidBootType =
    !errors?.['technical_sheet.boot_type_id'] && formData?.boot_type_id !== '' && validated
  const isInvalidYokeType = !!errors?.['technical_sheet.yoke_type_id']
  const isValidYokeType =
    !errors?.['technical_sheet.yoke_type_id'] && formData?.yoke_type_id !== '' && validated
  const isInvalidWaistbandType = !!errors?.['technical_sheet.waistband_type_id']
  const isValidWaistbandType =
    !errors?.['technical_sheet.waistband_type_id'] &&
    formData?.waistband_type_id !== '' &&
    validated
  const isInvalidEmployee = !!errors?.['technical_sheet.pattern_maker_id']
  const isValidEmployee =
    !errors?.['technical_sheet.pattern_maker_id'] && formData?.pattern_maker_id !== '' && validated
  const isInvalidPhotoD = !!errors?.['photo_d.file']
  const isValidPhotoD = !errors?.['photo_d.file'] && photoDPreview !== '' && validated
  const isInvalidPhotoT = !!errors?.['photo_t.file']
  const isValidPhotoT = !errors?.['photo_t.file'] && photoTPreview !== '' && validated

  const STATUS_BADGE_STYLES = {
    Pendiente: 'badge-status-pending',
    'En revision': 'badge-status-review',
    Aprobado: 'badge-status-approved',
    Cancelado: 'badge-status-cancelled',
  }

  const handleImageChange = (field, file) => {
    if (!file) return

    const preview = URL.createObjectURL(file)

    if (field === 'photo_d') {
      setPhotoDPreview({ preview, file, photo_type_id: 3, photo_subtype_id: 9 })
    } else {
      setPhotoTPreview({ preview, file, photo_type_id: 3, photo_subtype_id: 9 })
    }
  }

  useEffect(() => {
    if (!editingField) return

    const ref = inputRefs.current[editingField]

    if (ref) {
      ref.focus()
      if (typeof ref.openMenu === 'function') {
        ref.openMenu('first')
      }
    }
  }, [editingField])

  useEffect(() => {
    if (Object.values(technical_sheet || {}).length !== 0) {
      setFormData((prev) => ({
        ...prev,
        collection_id: technical_sheet.collection_id,
        subgroup_id: technical_sheet.subgroup_id,
        garment_type_id: technical_sheet.garment_type_id,
        wash_tone_id: technical_sheet.wash_tone_id,
        color_id: technical_sheet.color_id,
        back_type_id: technical_sheet.back_type_id,
        boot_type_id: technical_sheet.boot_type_id,
        yoke_type_id: technical_sheet.yoke_type_id,
        waistband_type_id: technical_sheet.waistband_type_id,
        date: technical_sheet.date,
        measure_of_waistband: technical_sheet.measure_of_waistband,
        physical_sample: technical_sheet.physical_sample,
        number_of_buttons: technical_sheet.number_of_buttons,
        pattern_maker_id: technical_sheet.pattern_maker_id,
        observation: technical_sheet.observation,
        description: technical_sheet.description,
        photo_d: technical_sheet.photo_d,
        photo_t: technical_sheet.photo_t,
        status: technical_sheet.status,
      }))
      setPhotoDPreview(technical_sheet.photo_d)
      setPhotoTPreview(technical_sheet.photo_t)
    }
  }, [technical_sheet])

  useEffect(() => {
    if (!formData.reference && technical_sheet) {
      setFormData((prev) => {
        return { ...prev, trademark_id: null }
      })
      return
    }

    const trademark = findTrademarkByCode(formData.reference)

    if (trademark) {
      setFormData((prev) => ({
        ...prev,
        trademark_id: trademark.id,
        group_id: trademark.group[0].id,
        trademark: trademark.name,
        sizes: trademark.sizes,
        group: trademark.group[0].name,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        trademark_id: null,
        group_id: null,
        trademark: null,
        sizes: null,
        group: null,
      }))
    }
  }, [formData.reference, trademarks])

  const loadCollections = async () => {
    if (collections) return
    try {
      await fetchCollections()
    } catch (error) {
      console.error(error)
    }
  }

  const loadSubgroups = async () => {
    if (subgroups) return
    try {
      await fetchSubgroups()
    } catch (error) {
      console.error(error)
    }
  }

  const loadGarmentTypes = async () => {
    if (garment_types) return
    try {
      await fetchGarmentTypes()
    } catch (error) {
      console.error(error)
    }
  }

  const loadWashTones = async () => {
    if (wash_tones) return
    try {
      await fetchWashTones()
    } catch (error) {
      console.error(error)
    }
  }

  const loadColors = async () => {
    if (colors) return
    try {
      await fetchColors()
    } catch (error) {
      console.error(error)
    }
  }

  const loadBackTypes = async () => {
    if (back_types) return
    try {
      await fetchBackTypes()
    } catch (error) {
      console.error(error)
    }
  }

  const loadBootTypes = async () => {
    if (boot_types) return
    try {
      await fetchBootTypes()
    } catch (error) {
      console.error(error)
    }
  }

  const loadYokeTypes = async () => {
    if (yoke_types) return
    try {
      await fetchYokeTypes()
    } catch (error) {
      console.error(error)
    }
  }

  const loadWaistbandTypes = async () => {
    if (waistband_types) return
    try {
      await fetchWaistbandTypes()
    } catch (error) {
      console.error(error)
    }
  }

  const loadEmployees = async () => {
    if (employees) return
    try {
      await fetchEmployees()
    } catch (error) {
      console.error(error)
    }
  }

  const loadCategories = async () => {
    if (categories) return
    try {
      await fetchCategories()
    } catch (error) {
      console.error(error)
    }
  }

  const loadSubcategories = async () => {
    if (subcategories) return
    try {
      await fetchSubcategories(formData.category_id)
    } catch (error) {
      console.error(error)
    }
  }

  const customFilterOption = (option, rawInput) => {
    const words = rawInput.toLowerCase().split(' ')
    const label = option.label.toLowerCase()
    return words.every((word) => label.includes(word))
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="position-relative p-4 border rounded-3" style={{ borderColor: '#e2e8f0' }}>
      <CRow className="g-3 mb-1">
        <CCol md={12} lg={3}>
          <CRow className="g-3">
            <CCol md={6} lg={12}>
              <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                Foto Delantera
                <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
              </CFormLabel>
              <div className="image-upload-container">
                <input
                  type="file"
                  accept="image/*"
                  id="photo_d"
                  hidden
                  onChange={(e) => handleImageChange('photo_d', e.target.files?.[0])}
                />
                <label htmlFor="photo_d" className="image-wrapper">
                  {photoDPreview ? (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          gap: '8px',
                          zIndex: 2,
                        }}
                      >
                        <div
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowFullscreen(
                              photoDPreview.preview || technical_sheet?.photo_d?.path,
                            )
                          }}
                          className="style-btn-action-image"
                        >
                          <ZoomIn size={16} />
                        </div>
                        {!!photoDPreview.preview && (
                          <div
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setPhotoDPreview(technical_sheet.photo_d)
                            }}
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: 'rgba(0,0,0,.65)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#fff',
                            }}
                          >
                            <CTooltip
                              content="Eliminar imagen cargada"
                              style={{
                                zIndex: 999999,
                              }}
                            >
                              <ImageMinus size={16} />
                            </CTooltip>
                          </div>
                        )}
                      </div>
                      <img
                        src={photoDPreview.preview || photoDPreview.path}
                        alt="Foto Delantera"
                        className={`img-fluid rounded ${isValidPhotoD ? 'image-valid' : isInvalidPhotoD ? 'image-invalid' : 'border'}`}
                        style={{
                          width: '100%',
                          height: validated ? '375px' : '365px',
                          objectFit: 'contain',
                          background: '#f8f9fa',
                        }}
                      />
                      <div className="image-overlay gap-2">
                        <Images />
                        Cambiar foto
                      </div>
                    </>
                  ) : (
                    <div
                      className={`rounded d-flex flex-column align-items-center justify-content-center ${isValidPhotoD ? 'image-valid' : isInvalidPhotoD ? 'image-invalid' : 'border'}`}
                      style={{
                        height: validated ? '375px' : '365px',
                        background: '#fafafa',
                      }}
                    >
                      <ImagePlus size={40} className="mb-2 text-secondary" />
                      <span className="font-inter">Seleccionar foto delantera</span>
                    </div>
                  )}
                </label>
                {errors?.['photo_d.file'] && (
                  <div className="invalid-feedback d-block">
                    {errors?.['photo_d.file'].map((message, index) => (
                      <div key={index} className="d-flex gap-1 align-items-start">
                        <BadgeAlert size={13} className="flex-shrink-0 mt-1" />
                        <small className="font-inter" style={{ whiteSpace: 'pre-line' }}>
                          {message}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
                {!errors?.['photo_d.file'] && validated && (
                  <div className="valid-feedback d-block">
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter">Dato válido</small>
                    </div>
                  </div>
                )}
              </div>
            </CCol>
            <CCol md={6} lg={12}>
              <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                Foto Trasera
                <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
              </CFormLabel>
              <div className="image-upload-container">
                <input
                  type="file"
                  accept="image/*"
                  id="photo_t"
                  hidden
                  onChange={(e) => handleImageChange('photo_t', e.target.files?.[0])}
                />
                <label htmlFor="photo_t" className="image-wrapper">
                  {photoTPreview ? (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          gap: '8px',
                          zIndex: 2,
                        }}
                      >
                        <div
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowFullscreen(photoTPreview.preview)
                          }}
                          className="style-btn-action-image"
                        >
                          <ZoomIn size={16} />
                        </div>
                        {!!photoTPreview.preview && (
                          <div
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setPhotoTPreview(technical_sheet.photo_d)
                            }}
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: 'rgba(0,0,0,.65)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#fff',
                            }}
                          >
                            <CTooltip
                              content="Eliminar imagen cargada"
                              style={{
                                zIndex: 999999,
                              }}
                            >
                              <ImageMinus size={16} />
                            </CTooltip>
                          </div>
                        )}
                      </div>
                      <img
                        src={photoTPreview.preview || photoTPreview.path}
                        alt="Foto Trasera"
                        className={`img-fluid rounded ${isValidPhotoT ? 'image-valid' : isInvalidPhotoT ? 'image-invalid' : 'border'}`}
                        style={{
                          width: '100%',
                          height: validated ? '375px' : '365px',
                          objectFit: 'contain',
                          background: '#f8f9fa',
                        }}
                      />
                      <div className="image-overlay gap-2">
                        <Images />
                        Cambiar foto
                      </div>
                    </>
                  ) : (
                    <div
                      className={`rounded d-flex flex-column align-items-center justify-content-center ${isValidPhotoT ? 'image-valid' : isInvalidPhotoT ? 'image-invalid' : 'border'}`}
                      style={{
                        height: validated ? '375px' : '365px',
                        background: '#fafafa',
                      }}
                    >
                      <ImagePlus size={40} className="mb-2 text-secondary" />
                      <span className="font-inter">Seleccionar foto trasera</span>
                    </div>
                  )}
                </label>
                {errors?.['photo_t.file'] && (
                  <div className="invalid-feedback d-block">
                    {errors?.['photo_t.file'].map((message, index) => (
                      <div key={index} className="d-flex gap-1 align-items-start">
                        <BadgeAlert size={13} className="flex-shrink-0 mt-1" />
                        <small className="font-inter" style={{ whiteSpace: 'pre-line' }}>
                          {message}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
                {!errors?.['photo_t.file'] && validated && (
                  <div className="valid-feedback d-block">
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter">Dato válido</small>
                    </div>
                  </div>
                )}
              </div>
            </CCol>
          </CRow>
        </CCol>
        <CCol md={12} lg={9}>
          <CRow className={`${validated ? 'g-2' : 'g-3'} `}>
            <CCol md={4}>
              <EditableField
                label={'Código'}
                editing={editingField === 'code'}
                error={errors?.code}
                valid={formData?.code !== '' && validated}
                validated={validated}
                editor={
                  <CFormInput
                    ref={(el) => (inputRefs.current.code = el)}
                    type="text"
                    name="code"
                    value={formData?.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                    invalid={!!errors?.code}
                    valid={!errors?.code && formData?.code !== '' && validated}
                    className="font-montserrat input-custom"
                    placeholder="Ingrese un código"
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.code ? 'placeholder' : ''
                    } ${validated ? (errors?.code ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={() => setEditingField('code')}
                  >
                    {!!formData?.code
                      ? formData?.code
                      : technical_sheet?.code || 'Ingrese un código'}
                  </span>
                }
              />
            </CCol>
            <CCol md={3} xxl={4}>
              <EditableField
                label={'Referencia'}
                editing={editingField === 'reference'}
                error={errors?.['product.code']}
                valid={formData?.reference !== '' && validated}
                validated={validated}
                editor={
                  <CFormInput
                    ref={(el) => (inputRefs.current.reference = el)}
                    type="text"
                    name="reference"
                    value={formData?.reference}
                    onChange={(e) => handleChange('reference', e.target.value)}
                    invalid={!!errors?.['product.code']}
                    valid={!errors?.['product.code'] && formData?.reference !== '' && validated}
                    className="font-montserrat input-custom"
                    placeholder="Ingrese la referencia"
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.reference ? 'placeholder' : ''
                    } ${validated ? (errors?.['product.code'] ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={() => setEditingField('reference')}
                  >
                    {formData?.reference || 'Ingrese la referencia'}
                  </span>
                }
              />
            </CCol>
            <CCol md={5} xxl={4}>
              <div className={`d-flex flex-column ${validated ? 'gap-1' : 'gap-2'}`}>
                <CFormLabel className="font-inter mb-0">Marca</CFormLabel>
                <CFormInput
                  type="text"
                  name="trademark_id"
                  value={formData.trademark ?? ''}
                  invalid={!!errors?.['product.trademark_id']}
                  valid={
                    !errors?.['product.trademark_id'] && formData?.trademark_id !== '' && validated
                  }
                  className="font-montserrat input-custom"
                  placeholder="Ingrese la marca"
                />
                {errors?.['product.trademark_id'] && (
                  <div className="invalid-feedback d-block" style={{ marginTop: '0.1rem' }}>
                    {errors?.['product.trademark_id'].map((message, index) => (
                      <div key={index} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter" style={{ whiteSpace: 'pre-line' }}>
                          {message}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
                {!errors?.['product.trademark_id'] && validated && (
                  <div className="valid-feedback d-block" style={{ marginTop: '0.1rem' }}>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter">Dato válido</small>
                    </div>
                  </div>
                )}
              </div>
            </CCol>
            <CCol md={4}>
              <div className={`d-flex flex-column ${validated ? 'gap-1' : 'gap-2'}`}>
                <CFormLabel className="font-inter mb-0">Grupo</CFormLabel>
                <CFormInput
                  type="text"
                  name="trademark_id"
                  value={formData.group ?? ''}
                  valid={formData?.group_id !== '' && validated}
                  className="font-montserrat input-custom"
                  placeholder="Ingrese la marca"
                />
                {formData?.group_id !== '' && validated && (
                  <div className="valid-feedback d-block" style={{ marginTop: '0.1rem' }}>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter">Dato válido</small>
                    </div>
                  </div>
                )}
              </div>
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Categoría'}
                editing={editingField === 'category'}
                error={errors?.['product.category_id']}
                valid={formData?.category_id !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.category = el)}
                    name="category_id"
                    value={categories?.[formData?.category_id] ?? null}
                    onChange={(selected) => {
                      handleChange('category_id', selected?.value)
                      handleChange('category', selected?.label)
                    }}
                    options={categories ? Object.values(categories) : []}
                    isDisabled={!categories}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione una categoría'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={getSelectStyles({})}
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.category_id ? 'placeholder' : ''
                    } ${validated ? (errors?.category_id ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={async () => {
                      await loadCategories()
                      setEditingField('category')
                    }}
                  >
                    {!!categories && formData?.category_id
                      ? categories?.[formData?.category_id]?.label
                      : product?.subcategory.category[0]?.name || 'Seleccione una categoría'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Subcategoría'}
                editing={editingField === 'subcategory'}
                error={errors?.['product.subcategory_id']}
                valid={formData?.subcategory_id !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.subcategory = el)}
                    name="subcategory_id"
                    value={subcategories?.[formData?.subcategory_id] ?? null}
                    onChange={(selected) => {
                      handleChange('subcategory_id', selected?.value)
                      handleChange('subcategory', selected?.label)
                    }}
                    options={subcategories ? Object.values(subcategories) : []}
                    isDisabled={!subcategories || !formData.category_id}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione una subcategoría'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={getSelectStyles({
                      isInvalid: isInvalidSubcategory,
                      isValid: isValidSubcategory,
                    })}
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.subcategory_id ? 'placeholder' : ''
                    } ${validated ? (errors?.['product.subcategory_id'] ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={async () => {
                      await loadSubcategories()
                      setEditingField('subcategory')
                    }}
                  >
                    {!!subcategories && formData?.subcategory_id
                      ? subcategories?.[formData?.subcategory_id]?.label
                      : product?.subcategory?.name || 'Seleccione una subcategoría'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Subgrupo'}
                editing={editingField === 'subgroup'}
                error={errors?.['technical_sheet.subgroup_id']}
                valid={formData?.subgroup_id !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.subgroup = el)}
                    name="subgroup_id"
                    value={subgroups?.[formData?.subgroup_id] ?? null}
                    onChange={(selected) => handleChange('subgroup_id', selected?.value)}
                    options={subgroups ? Object.values(subgroups) : []}
                    isDisabled={!subgroups}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione un subgrupo'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={getSelectStyles({
                      isInvalid: isInvalidSubgroup,
                      isValid: isValidSubgroup,
                    })}
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.subgroup_id ? 'placeholder' : ''
                    } ${validated ? (errors?.['technical_sheet.subgroup_id'] ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={async () => {
                      await loadSubgroups()
                      setEditingField('subgroup')
                    }}
                  >
                    {!!subgroups && formData?.subgroup_id
                      ? subgroups?.[formData?.subgroup_id]?.label
                      : technical_sheet?.subgroup?.name || 'Seleccione un subgrupo'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Fecha'}
                editing={editingField === 'date'}
                error={errors?.['technical_sheet.date']}
                valid={formData?.date !== '' && validated}
                validated={validated}
                editor={
                  <CFormInput
                    ref={(el) => (inputRefs.current.date = el)}
                    type="date"
                    name="date"
                    value={formData?.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    invalid={!!errors?.['technical_sheet.date']}
                    valid={!errors?.['technical_sheet.date'] && formData?.date !== '' && validated}
                    className="font-montserrat input-custom"
                    placeholder="Seleccione una fecha"
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.date ? 'placeholder' : ''
                    } ${validated ? (errors?.['technical_sheet.date'] ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={() => setEditingField('date')}
                  >
                    {!!formData?.date
                      ? formData?.date
                      : technical_sheet?.date || 'Seleccione una fecha'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Estado'}
                editing={editingField === 'status'}
                error={errors?.['technical_sheet.status']}
                valid={formData?.status !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.status = el)}
                    name="status"
                    value={statusTechnical?.find((option) => option.value === formData?.status)}
                    onChange={(selected) => handleChange('status', selected?.value)}
                    options={statusTechnical}
                    isDisabled={!statusTechnical}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione estado'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={getSelectStyles({
                      isInvalid: isInvalidStatus,
                      isValid: isValidStatus,
                    })}
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={(() => {
                  const currentStatus = formData?.status || technical_sheet?.status
                  const badgeClass = STATUS_BADGE_STYLES[currentStatus] || ''

                  return (
                    <span
                      className={`editable-field input-custom ${badgeClass} ${
                        !currentStatus ? 'placeholder' : ''
                      } ${validated ? (errors?.['technical_sheet.status'] ? 'is-invalid' : 'is-valid') : ''}`}
                      onClick={async () => {
                        await loadSubgroups()
                        setEditingField('status')
                      }}
                    >
                      {!!statusTechnical && formData?.status
                        ? statusTechnical?.find((stat) => stat.value === formData?.status).label
                        : technical_sheet?.status || 'Seleccione un estado'}
                    </span>
                  )
                })()}
              />
            </CCol>
            <CCol md={8}>
              <EditableField
                label={'Colección'}
                editing={editingField === 'collection'}
                error={errors?.['technical_sheet.collection_id']}
                valid={formData?.collection_id !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.collection = el)}
                    name="collection_id"
                    value={collections?.[formData?.collection_id] ?? null}
                    onChange={(selected) => handleChange('collection_id', selected?.value)}
                    options={collections ? Object.values(collections) : []}
                    isDisabled={!collections}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione una colección'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={getSelectStyles({
                      isInvalid: isInvalidCollection,
                      isValid: isValidCollection,
                    })}
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.collection_id ? 'placeholder' : ''
                    } ${validated ? (errors?.['technical_sheet.collection_id'] ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={async () => {
                      await loadCollections()
                      setEditingField('collection')
                    }}
                  >
                    {!!collections && formData?.collection_id
                      ? collections?.[formData?.collection_id]?.label
                      : !!technical_sheet
                        ? `${technical_sheet?.collection?.name} - ${technical_sheet?.collection?.description}`
                        : 'Seleccione una colección'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Medida de Pretina'}
                editing={editingField === 'measure_of_waistband'}
                error={errors?.['technical_sheet.measure_of_waistband']}
                valid={formData?.measure_of_waistband !== '' && validated}
                validated={validated}
                editor={
                  <CFormInput
                    ref={(el) => (inputRefs.current.measure_of_waistband = el)}
                    type="number"
                    min={1}
                    name="measure_of_waistband"
                    value={formData?.measure_of_waistband}
                    onChange={(e) => handleChange('measure_of_waistband', e.target.value)}
                    invalid={!!errors?.['technical_sheet.measure_of_waistband']}
                    valid={
                      !errors?.['technical_sheet.measure_of_waistband'] &&
                      formData?.measure_of_waistband !== '' &&
                      validated
                    }
                    className="font-montserrat input-custom"
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${!formData?.measure_of_waistband && 'placeholder'} ${validated ? (errors?.['technical_sheet.measure_of_waistband'] ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={() => setEditingField('measure_of_waistband')}
                  >
                    {!!formData?.measure_of_waistband
                      ? formData?.measure_of_waistband
                      : technical_sheet?.measure_of_waistband || 'Ingrese la medida'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'N° de Botones'}
                editing={editingField === 'number_of_buttons'}
                error={errors?.['technical_sheet.number_of_buttons']}
                valid={formData?.number_of_buttons !== '' && validated}
                validated={validated}
                editor={
                  <CFormInput
                    ref={(el) => (inputRefs.current.number_of_buttons = el)}
                    type="number"
                    min={1}
                    name="number_of_buttons"
                    value={formData?.number_of_buttons}
                    onChange={(e) => handleChange('number_of_buttons', e.target.value)}
                    invalid={!!errors?.['technical_sheet.number_of_buttons']}
                    valid={
                      !errors?.['technical_sheet.number_of_buttons'] &&
                      formData?.number_of_buttons !== '' &&
                      validated
                    }
                    className="font-montserrat input-custom"
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.number_of_buttons ? 'placeholder' : ''
                    } ${validated ? (errors?.['technical_sheet.number_of_buttons'] ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={() => setEditingField('number_of_buttons')}
                  >
                    {!!formData?.number_of_buttons
                      ? formData?.number_of_buttons
                      : technical_sheet?.number_of_buttons || 'Ingrese un número'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <div className={`d-flex flex-column ${validated ? 'gap-1' : 'gap-2'}`}>
                <CFormLabel className="font-inter mb-0">Muestra Física</CFormLabel>
                <div
                  className={`editable-field input-custom ${validated && (errors?.['technical_sheet.physical_sample'] ? 'is-invalid' : 'is-valid')} ${!formData?.physical_sample && 'placeholder'}`}
                >
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <CFormCheck
                      id="physical_sample"
                      label="¿Muestra física?"
                      checked={!!formData?.physical_sample}
                      onChange={(e) => handleChange('physical_sample', e.target.checked)}
                    />

                    {!errors?.['technical_sheet.physical_sample'] && validated && (
                      <Check size={16} strokeWidth={5} color="#198754" />
                    )}
                  </div>
                </div>
                {errors?.['technical_sheet.physical_sample'] && (
                  <div className="invalid-feedback d-block" style={{ marginTop: '0.1rem' }}>
                    {errors?.['technical_sheet.physical_sample'].map((message, index) => (
                      <div key={index} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter" style={{ whiteSpace: 'pre-line' }}>
                          {message}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
                {!errors?.['technical_sheet.physical_sample'] && validated && (
                  <div className="valid-feedback d-block" style={{ marginTop: '0.1rem' }}>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter">Dato válido</small>
                    </div>
                  </div>
                )}
              </div>
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Color'}
                editing={editingField === 'color'}
                error={errors?.['technical_sheet.color_id']}
                valid={formData?.color_id !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.color = el)}
                    name="color_id"
                    value={colors?.[formData?.color_id] ?? null}
                    onChange={(selected) => handleChange('color_id', selected?.value)}
                    options={colors ? Object.values(colors) : []}
                    isDisabled={!colors}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione un color'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={getSelectStyles({
                      isInvalid: isInvalidColor,
                      isValid: isValidColor,
                    })}
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.color_id ? 'placeholder' : ''
                    } ${validated ? (errors?.['technical_sheet.color_id'] ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={async () => {
                      await loadColors()
                      setEditingField('color')
                    }}
                  >
                    {!!colors && formData?.color_id
                      ? colors?.[formData?.color_id]?.label
                      : technical_sheet?.color?.name || 'Seleccione un color'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Tipo de Prenda'}
                editing={editingField === 'garment_type'}
                error={errors?.['technical_sheet.garment_type_id']}
                valid={formData?.garment_type_id !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.garment_type = el)}
                    name="garment_type_id"
                    value={garment_types?.[formData?.garment_type_id] ?? null}
                    onChange={(selected) => handleChange('garment_type_id', selected?.value)}
                    options={garment_types ? Object.values(garment_types) : []}
                    isDisabled={!garment_types}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione un tipo de prenda'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={getSelectStyles({
                      isInvalid: isInvalidGarmentType,
                      isValid: isValidGarmentType,
                    })}
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.garment_type_id ? 'placeholder' : ''
                    } ${validated ? (errors?.['technical_sheet.garment_type_id'] ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={async () => {
                      await loadGarmentTypes()
                      setEditingField('garment_type')
                    }}
                  >
                    {!!garment_types && formData?.garment_type_id
                      ? garment_types?.[formData?.garment_type_id]?.label
                      : technical_sheet?.garment_type?.name || 'Seleccione un tipo de prenda'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Tono de Lavado'}
                editing={editingField === 'wash_tone'}
                error={errors?.['technical_sheet.wash_tone_id']}
                valid={formData?.wash_tone_id !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.wash_tone = el)}
                    name="wash_tone_id"
                    value={wash_tones?.[formData?.wash_tone_id] ?? null}
                    onChange={(selected) => handleChange('wash_tone_id', selected?.value)}
                    options={wash_tones ? Object.values(wash_tones) : []}
                    isDisabled={!wash_tones}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione un tono de lavado'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={getSelectStyles({
                      isInvalid: isInvalidWashTone,
                      isValid: isValidWashTone,
                    })}
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.wash_tone_id ? 'placeholder' : ''
                    } ${validated ? (errors?.['technical_sheet.wash_tone_id'] ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={async () => {
                      await loadWashTones()
                      setEditingField('wash_tone')
                    }}
                  >
                    {!!wash_tones && formData?.wash_tone_id
                      ? wash_tones?.[formData?.wash_tone_id]?.label
                      : technical_sheet?.wash_tone?.name || 'Seleccione un tono de lavado'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Tipo de Trasero'}
                editing={editingField === 'back_type'}
                error={errors?.['technical_sheet.back_type_id']}
                valid={formData?.back_type_id !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.back_type = el)}
                    name="back_type_id"
                    value={back_types?.[formData?.back_type_id] ?? null}
                    onChange={(selected) => handleChange('back_type_id', selected?.value)}
                    options={back_types ? Object.values(back_types) : []}
                    isDisabled={!back_types}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione un tipo de trasero'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={getSelectStyles({
                      isInvalid: isInvalidBackType,
                      isValid: isValidBackType,
                    })}
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.back_type_id ? 'placeholder' : ''
                    } ${validated ? (errors?.['technical_sheet.back_type_id'] ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={async () => {
                      await loadBackTypes()
                      setEditingField('back_type')
                    }}
                  >
                    {!!back_types && formData?.back_type_id
                      ? back_types?.[formData?.back_type_id]?.label
                      : technical_sheet?.back_type?.name || 'Seleccione un tipo de trasero'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Tipo de Bota'}
                editing={editingField === 'boot_type'}
                error={errors?.['technical_sheet.boot_type_id']}
                valid={formData?.boot_type_id !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.boot_type = el)}
                    name="boot_type_id"
                    value={boot_types?.[formData?.boot_type_id] ?? null}
                    onChange={(selected) => handleChange('boot_type_id', selected?.value)}
                    options={boot_types ? Object.values(boot_types) : ''}
                    isDisabled={!boot_types}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione un tipo de bota'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={getSelectStyles({
                      isInvalid: isInvalidBootType,
                      isValid: isValidBootType,
                    })}
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.boot_type_id ? 'placeholder' : ''
                    } ${validated ? (errors?.['technical_sheet.boot_type_id'] ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={async () => {
                      await loadBootTypes()
                      setEditingField('boot_type')
                    }}
                  >
                    {!!boot_types && formData?.boot_type_id
                      ? boot_types?.[formData?.boot_type_id]?.label
                      : technical_sheet?.boot_type?.name || 'Seleccione un tipo de bota'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Tipo de Cotilla'}
                editing={editingField === 'yoke_type'}
                error={errors?.['technical_sheet.yoke_type_id']}
                valid={formData?.yoke_type_id !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.yoke_type = el)}
                    name="yoke_type_id"
                    value={yoke_types?.[formData?.yoke_type_id] ?? null}
                    onChange={(selected) => handleChange('yoke_type_id', selected?.value)}
                    options={yoke_types ? Object.values(yoke_types) : []}
                    isDisabled={!yoke_types}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione un tipo de cotilla'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={getSelectStyles({
                      isInvalid: isInvalidYokeType,
                      isValid: isValidYokeType,
                    })}
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.yoke_type_id ? 'placeholder' : ''
                    } ${validated ? (errors?.['technical_sheet.yoke_type_id'] ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={async () => {
                      await loadYokeTypes()
                      setEditingField('yoke_type')
                    }}
                  >
                    {!!yoke_types && formData?.yoke_type_id
                      ? yoke_types?.[formData?.yoke_type_id]?.label
                      : technical_sheet?.yoke_type?.name || 'Seleccione un tipo de cotilla'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Tipo de Pretina'}
                editing={editingField === 'waistband_type'}
                error={errors?.['technical_sheet.waistband_type_id']}
                valid={formData?.waistband_type_id !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.waistband_type = el)}
                    name="waistband_type_id"
                    value={waistband_types?.[formData?.waistband_type_id] ?? null}
                    onChange={(selected) => handleChange('waistband_type_id', selected?.value)}
                    options={waistband_types ? Object.values(waistband_types) : []}
                    isDisabled={!waistband_types}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione un tipo de pretina'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={getSelectStyles({
                      isInvalid: isInvalidWaistbandType,
                      isValid: isValidWaistbandType,
                    })}
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.waistband_type_id ? 'placeholder' : ''
                    } ${validated ? (errors?.['technical_sheet.waistband_type_id'] ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={async () => {
                      await loadWaistbandTypes()
                      setEditingField('waistband_type')
                    }}
                  >
                    {!!waistband_types && formData?.waistband_type_id
                      ? waistband_types?.[formData?.waistband_type_id]?.label
                      : technical_sheet?.waistband_type?.name || 'Seleccione un tipo de pretina'}
                  </span>
                }
              />
            </CCol>
            <CCol md={12}>
              <EditableField
                label={'Patronista'}
                editing={editingField === 'pattern_maker'}
                error={errors?.['technical_sheet.pattern_maker_id']}
                valid={formData?.pattern_maker_id !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.pattern_maker = el)}
                    name="pattern_maker_id"
                    value={employees?.[formData?.pattern_maker_id] ?? null}
                    onChange={(selected) => handleChange('pattern_maker_id', selected?.value)}
                    options={employees ? Object.values(employees) : []}
                    isDisabled={!employees}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione un empleado'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={getSelectStyles({
                      isInvalid: isInvalidEmployee,
                      isValid: isValidEmployee,
                    })}
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.pattern_maker_id ? 'placeholder' : ''
                    } ${validated ? (errors?.['technical_sheet.pattern_maker_id'] ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={async () => {
                      await loadEmployees()
                      setEditingField('pattern_maker')
                    }}
                  >
                    {!!employees && formData?.pattern_maker_id
                      ? employees?.[formData?.pattern_maker_id]?.label
                      : !!technical_sheet
                        ? `${technical_sheet?.pattern_maker?.person?.names} ${technical_sheet?.pattern_maker?.person?.last_names} | ${technical_sheet?.pattern_maker?.person?.document} | ${technical_sheet?.pattern_maker?.position?.name || '-'}`
                        : 'Seleccione un empleado'}
                  </span>
                }
              />
            </CCol>
            <CCol md={6}>
              <div className={`d-flex flex-column ${validated ? 'gap-1' : 'gap-2'}`}>
                <CFormLabel className="font-inter mb-0">Observación</CFormLabel>
                <CFormTextarea
                  ref={(el) => (inputRefs.current.observation = el)}
                  name="observation"
                  value={
                    !!formData?.observation
                      ? formData?.observation
                      : (technical_sheet?.observation ?? '')
                  }
                  onChange={(e) => handleChange('observation', e.target.value)}
                  invalid={!!errors?.['technical_sheet.observation']}
                  valid={
                    !errors?.['technical_sheet.observation'] &&
                    formData?.observation !== '' &&
                    validated
                  }
                  className={`font-montserrat input-custom editable-field-textarea ${validated && (errors?.['technical_sheet.observation'] ? 'is-invalid' : 'is-valid')} ${!formData?.observation && 'placeholder'}`}
                  onBlur={() => setEditingField(null)}
                  rows={validated ? 2 : 3}
                  placeholder="Ingrese una observación"
                />
                {errors?.['technical_sheet.observation'] && (
                  <div className="invalid-feedback d-block" style={{ marginTop: '0.1rem' }}>
                    {errors?.['technical_sheet.observation'].map((message, index) => (
                      <div key={index} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter" style={{ whiteSpace: 'pre-line' }}>
                          {message}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
                {!errors?.['technical_sheet.observation'] && validated && (
                  <div className="valid-feedback d-block" style={{ marginTop: '0.1rem' }}>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter">Dato válido</small>
                    </div>
                  </div>
                )}
              </div>
            </CCol>
            <CCol md={6}>
              <div className={`d-flex flex-column ${validated ? 'gap-1' : 'gap-2'}`}>
                <CFormLabel className="font-inter mb-0">Descripción</CFormLabel>
                <CFormTextarea
                  ref={(el) => (inputRefs.current.description = el)}
                  name="description"
                  value={
                    !!formData?.description
                      ? formData?.description
                      : (technical_sheet?.description ?? '')
                  }
                  onChange={(e) => handleChange('description', e.target.value)}
                  invalid={!!errors?.['technical_sheet.description']}
                  valid={
                    !errors?.['technical_sheet.description'] &&
                    formData?.description !== '' &&
                    validated
                  }
                  className={`font-montserrat input-custom editable-field-textarea ${validated ? (errors?.['technical_sheet.description'] ? 'is-invalid' : 'is-valid') : ''} ${!formData?.description && 'placeholder'}`}
                  onBlur={() => setEditingField(null)}
                  placeholder="Ingrese una descripción"
                  rows={validated ? 2 : 3}
                />
                {errors?.['technical_sheet.description'] && (
                  <div className="invalid-feedback d-block" style={{ marginTop: '0.1rem' }}>
                    {errors?.['technical_sheet.description'].map((message, index) => (
                      <div key={index} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter" style={{ whiteSpace: 'pre-line' }}>
                          {message}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
                {!errors?.['technical_sheet.description'] && validated && (
                  <div className="valid-feedback d-block" style={{ marginTop: '0.1rem' }}>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter">Dato válido</small>
                    </div>
                  </div>
                )}
              </div>
            </CCol>
          </CRow>
        </CCol>
      </CRow>
      {showFullscreen && (
        <div
          onClick={() => setShowFullscreen()}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.9)',
            zIndex: 99999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          <button
            onClick={() => setShowFullscreen()}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              border: 'none',
              background: 'rgba(255,255,255,.15)',
              color: '#fff',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
            className="style-btn-action-image"
          >
            <X size={20} />
          </button>

          <img
            src={showFullscreen}
            alt="preview"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '95vw',
              maxHeight: '95vh',
              objectFit: 'contain',
              borderRadius: '12px',
            }}
          />
        </div>
      )}
    </div>
  )
}

export default InformationTransformation
