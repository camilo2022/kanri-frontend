import { useState } from 'react'
import {
  CFormInput,
  CRow,
  CCol,
  CFormLabel,
  CFormTextarea,
  CFormCheck,
  CFormFeedback,
  CTooltip,
  CButton,
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
  UploadCloud,
  FileText,
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
      <div className="d-flex flex-column gap-1">
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

const InformationProductionOrder = ({
  production_order = null,
  technical_sheet,
  status_orders,
  fabrics,
  fetchFabrics,
  errors,
  validated,
  formData,
  setFormData,
  findFabric,
  findColor,
  setRollsAux,
  trazosFile,
  setTrazosFile,
  strokesCutA,
  suppliers,
}) => {
  const [editingField, setEditingField] = useState(null)
  const inputRefs = useRef({})

  const [photoDPreview, setPhotoDPreview] = useState(null)
  const [photoTPreview, setPhotoTPreview] = useState(null)

  const [showFullscreen, setShowFullscreen] = useState(false)

  const isInvalidFabric = !!errors?.fabric_id
  const isValidFabric = !errors?.fabric_id && formData?.fabric_id !== '' && validated
  const isInvalidColor = !!errors?.color_id
  const isValidColor = !errors?.color_id && formData?.color_id !== '' && validated
  const isInvalidProductionPlace = !!errors?.production_place
  const isValidProductionPlace =
    !errors?.production_place && formData?.production_place !== '' && validated
  const isInvalidSatellite = !!errors?.production_place
  const isValidSatellite =
    !errors?.production_place && formData?.production_place !== '' && validated
  const isInvalidStatus = !!errors?.status
  const isValidStatus = !errors?.status && formData?.status !== '' && validated
  const isInvalidPhotoD = !!errors?.['photo_d.file']
  const isValidPhotoD = !errors?.['photo_d.file'] && photoDPreview !== '' && validated
  const isInvalidPhotoT = !!errors?.['photo_t.file']
  const isValidPhotoT = !errors?.['photo_t.file'] && photoTPreview !== '' && validated

  const STATUS_BADGE_STYLES = {
    Pendiente: 'badge-status-pending',
    Aprobado: 'badge-status-approved',
    Cancelado: 'badge-status-cancelled',
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
    if (!formData.fabric_id) return
    findFabric(formData.fabric_id)
  }, [formData.fabric_id])

  useEffect(() => {
    if (!formData.color_id) return
    findColor(formData.color_id)
  }, [formData.color_id])

  useEffect(() => {
    if (Object.values(production_order || {}).length !== 0) {
      setFormData((prev) => ({
        ...prev,
        date: production_order.date,
        status: production_order.status || 'Pendiente',
        consecutive: production_order.consecutive,
        pocket_fabric: production_order.pocket_fabric,
        fabric_id: production_order.fabric?.model?.id,
        color_id: production_order.color[0]?.id,
        fabric: production_order.fabric?.model,
        color: production_order.color[0],
        width: production_order.width,
        efficiency: production_order.efficiency,
        cut: production_order.cut,
        production_place: production_order.production_place,
        supplier_id: production_order.supplier_id ?? null,
        observation: production_order.observation,
        trazos_file: null,
      }))
      if (production_order.strokes) {
        setTrazosFile(production_order.strokes)
      }
    }
  }, [production_order])

  useEffect(() => {
    if (!strokesCutA) return
    setTrazosFile(strokesCutA)
    setFormData((prev) => ({
      ...prev,
      trazos_file: strokesCutA.id,
    }))
  }, [strokesCutA])

  const loadFabrics = async () => {
    if (fabrics) return
    try {
      await fetchFabrics()
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
    if (field === 'fabric_id') {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        ['color_id']: null,
        ['color']: null,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleTrazosChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setTrazosFile(file)
      handleChange('trazos_file', file)
    }
  }

  const removeTrazosFile = () => {
    setTrazosFile(null)
    handleChange('trazos_file', null)
  }

  return (
    <div className="position-relative mt-4 p-4 border rounded-3" style={{ borderColor: '#e2e8f0' }}>
      <div
        className="position-absolute d-flex align-items-center text-white fw-bold font-montserrat shadow-sm"
        style={{
          top: '-14px',
          right: '20px',
          backgroundColor: '#0934a8',
          padding: '6px 16px',
          borderRadius: '50px',
          fontSize: '0.8rem',
          letterSpacing: '1px',
        }}
      >
        <span style={{ opacity: 0.85, marginRight: '6px', fontSize: '0.75rem' }}>LOTE</span>
        <span
          style={{
            fontSize: '0.9rem',
            borderLeft: '1px solid rgba(255,255,255,0.3)',
            paddingLeft: '6px',
          }}
        >
          {formData.cut || ''}
        </span>
      </div>
      <CRow className="g-3 mb-1">
        <CCol md={12} lg={3}>
          <CRow className="g-3">
            <CCol md={6} lg={12}>
              <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                Foto Delantera
                <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
              </CFormLabel>
              <div className="image-upload-container">
                <label htmlFor="photo_d" className="image-wrapper">
                  {technical_sheet?.photo_d && (
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
                            setShowFullscreen(technical_sheet?.photo_d?.path || '')
                          }}
                          className="style-btn-action-image"
                        >
                          <ZoomIn size={16} />
                        </div>
                      </div>
                      <img
                        src={technical_sheet?.photo_d?.path || ''}
                        alt="Foto Delantera"
                        className={`img-fluid rounded ${isValidPhotoD ? 'image-valid' : isInvalidPhotoD ? 'image-invalid' : 'border'}`}
                        style={{
                          width: '100%',
                          height: validated ? '270px' : '255px',
                          objectFit: 'contain',
                          background: '#f8f9fa',
                        }}
                      />
                    </>
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
                <label htmlFor="photo_t" className="image-wrapper">
                  {technical_sheet?.photo_t && (
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
                            setShowFullscreen(technical_sheet?.photo_t?.path || '')
                          }}
                          className="style-btn-action-image"
                        >
                          <ZoomIn size={16} />
                        </div>
                      </div>
                      <img
                        src={technical_sheet?.photo_t?.path || ''}
                        alt="Foto Trasera"
                        className={`img-fluid rounded ${isValidPhotoT ? 'image-valid' : isInvalidPhotoT ? 'image-invalid' : 'border'}`}
                        style={{
                          width: '100%',
                          height: validated ? '270px' : '255px',
                          objectFit: 'contain',
                          background: '#f8f9fa',
                        }}
                      />
                    </>
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
          <CRow className={validated ? 'g-2' : 'g-3'}>
            <CCol md={4}>
              <div className="d-flex flex-column gap-1">
                <CFormLabel className="font-inter mb-0">Referencia</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.product?.code ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.product?.code}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="d-flex flex-column gap-1">
                <CFormLabel className="font-inter mb-0">Marca</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${!technical_sheet?.product?.trademark?.name ? 'placeholder' : ''}`}
                >
                  {technical_sheet?.product?.trademark?.name}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="d-flex flex-column gap-1">
                <CFormLabel className="font-inter mb-0">Grupo</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.product?.trademark?.group[0]?.name ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.product?.trademark?.group[0]?.name}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="d-flex flex-column gap-1">
                <CFormLabel className="font-inter mb-0">Tipo de Prenda</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${!technical_sheet?.garment_type?.name ? 'placeholder' : ''}`}
                >
                  {technical_sheet?.garment_type?.name}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="d-flex flex-column gap-1">
                <CFormLabel className="font-inter mb-0">Categoría</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.product?.subcategory?.category[0]?.name ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.product?.subcategory?.category[0]?.name}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="d-flex flex-column gap-1">
                <CFormLabel className="font-inter mb-0">Subcategoría</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${!technical_sheet?.product?.subcategory?.name ? 'placeholder' : ''}`}
                >
                  {technical_sheet?.product?.subcategory?.name}
                </span>
              </div>
            </CCol>
            <CCol md={formData.production_place === 'SATELITE' ? 4 : 8}>
              <div className="d-flex flex-column gap-2">
                <CFormLabel className="font-inter mb-0">Colección</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.collection?.name ? 'placeholder' : ''
                  }`}
                >
                  {`${technical_sheet?.collection?.name} - ${technical_sheet?.collection?.description}`}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Lugar de Producción'}
                editing={editingField === 'production_place'}
                error={errors?.production_place}
                valid={formData?.production_place !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.production_place = el)}
                    name="production_place"
                    value={
                      formData?.production_place
                        ? {
                            label: formData.production_place === 'BLESS' ? 'BLESS' : 'SATÉLITE',
                            value: formData.production_place,
                          }
                        : null
                    }
                    onChange={(option) => {
                      const productionPlace = option?.value ?? ''
                      setFormData((prev) => ({
                        ...prev,
                        production_place: productionPlace,
                        supplier_id: productionPlace === 'BLESS' ? '' : prev.supplier_id,
                      }))
                    }}
                    invalid={!!errors?.production_place}
                    valid={
                      !errors?.production_place && formData?.production_place !== '' && validated
                    }
                    options={[
                      {
                        label: 'BLESS',
                        value: 'BLESS',
                      },
                      {
                        label: 'SATÉLITE',
                        value: 'SATELITE',
                      },
                    ]}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione una color'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={getSelectStyles({
                      isInvalid: isInvalidProductionPlace,
                      isValid: isValidProductionPlace,
                    })}
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.production_place ? 'placeholder' : ''
                    } ${validated ? (errors?.production_place ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={() => {
                      setEditingField('production_place')
                    }}
                  >
                    {formData?.production_place === 'BLESS'
                      ? 'BLESS'
                      : formData?.production_place === 'SATELITE'
                        ? 'SATÉLITE'
                        : 'Seleccione un lugar de producción'}
                  </span>
                }
              />
            </CCol>
            {formData.production_place === 'SATELITE' && (
              <CCol md={4}>
                <EditableField
                  label={'Satélite'}
                  editing={editingField === 'supplier_id'}
                  error={errors?.supplier_id}
                  valid={formData?.supplier_id !== '' && validated}
                  validated={validated}
                  editor={
                    <Select
                      ref={(el) => (inputRefs.current.supplier_id = el)}
                      name="supplier_id"
                      value={
                        Object.values(suppliers ?? {}).find(
                          (item) => item.value === formData?.supplier_id,
                        ) ?? null
                      }
                      onChange={(option) => {
                        setFormData((prev) => ({
                          ...prev,
                          supplier_id: option?.value ?? '',
                        }))
                      }}
                      options={Object.values(suppliers ?? {}).map((item) => ({
                        label: item.label,
                        value: item.value,
                      }))}
                      isSearchable
                      filterOption={customFilterOption}
                      className="w-100 font-montserrat"
                      placeholder={'Seleccione un proveedor'}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={getSelectStyles({
                        isInvalid: isInvalidSatellite,
                        isValid: isValidSatellite,
                      })}
                      onBlur={() => setEditingField(null)}
                    />
                  }
                  display={
                    <span
                      className={`editable-field input-custom ${
                        !formData?.supplier_id ? 'placeholder' : ''
                      } ${validated ? (errors?.supplier_id ? 'is-invalid' : 'is-valid') : ''}`}
                      onClick={() => {
                        setEditingField('supplier_id')
                      }}
                    >
                      {formData?.supplier_id
                        ? Object.values(suppliers || {})?.find(
                            (item) => item.value === formData.supplier_id,
                          )?.label
                        : 'Seleccione un proveedor'}
                    </span>
                  }
                />
              </CCol>
            )}
            <CCol md={4}>
              <EditableField
                label={'Eficiencia'}
                editing={editingField === 'efficiency'}
                error={errors?.efficiency}
                valid={formData?.efficiency !== '' && validated}
                validated={validated}
                editor={
                  <CFormInput
                    ref={(el) => (inputRefs.current.efficiency = el)}
                    type="number"
                    min={1}
                    name="efficiency"
                    value={formData?.efficiency}
                    onChange={(e) => handleChange('efficiency', e.target.value)}
                    invalid={!!errors?.efficiency}
                    valid={!errors?.efficiency && formData?.efficiency !== '' && validated}
                    className="font-montserrat input-custom"
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.efficiency ? 'placeholder' : ''
                    } ${validated ? (errors?.efficiency ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={() => setEditingField('efficiency')}
                  >
                    {!!formData?.efficiency
                      ? formData?.efficiency
                      : technical_sheet?.efficiency || 'Ingrese un número'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Ancho'}
                editing={editingField === 'width'}
                error={errors?.width}
                valid={formData?.width !== '' && validated}
                validated={validated}
                editor={
                  <CFormInput
                    ref={(el) => (inputRefs.current.width = el)}
                    type="number"
                    min={1}
                    name="width"
                    value={formData?.width}
                    onChange={(e) => handleChange('width', e.target.value)}
                    invalid={!!errors?.width}
                    valid={!errors?.width && formData?.width !== '' && validated}
                    className="font-montserrat input-custom"
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.width ? 'placeholder' : ''
                    } ${validated ? (errors?.width ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={() => setEditingField('width')}
                  >
                    {!!formData?.width
                      ? formData?.width
                      : technical_sheet?.width || 'Ingrese un número'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Estado'}
                editing={editingField === 'status'}
                error={errors?.status}
                valid={formData?.status !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.status = el)}
                    name="status"
                    value={status_orders?.find((option) => option.value === formData?.status)}
                    onChange={(selected) => handleChange('status', selected?.value)}
                    invalid={!!errors?.status}
                    valid={!errors?.status && formData?.status !== '' && validated}
                    options={status_orders}
                    isDisabled={!status_orders}
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
                  const currentStatus = formData?.status || production_order?.status
                  const badgeClass = STATUS_BADGE_STYLES[currentStatus] || ''

                  return (
                    <span
                      className={`editable-field input-custom ${badgeClass} ${
                        !currentStatus ? 'placeholder' : ''
                      } ${validated ? (errors?.status ? 'is-invalid' : 'is-valid') : ''}`}
                      onClick={() => setEditingField('status')}
                    >
                      {!!status_orders && formData?.status
                        ? status_orders?.find((stat) => stat.value === formData?.status).label
                        : production_order?.status || 'Seleccione un estado'}
                    </span>
                  )
                })()}
              />
            </CCol>
            <CCol md={3}>
              <div className="d-flex flex-column gap-2">
                <CFormLabel className="font-inter mb-0">¿Tela Bolsillo?</CFormLabel>
                <div
                  className={`editable-field input-custom ${validated && (errors?.pocket_fabric ? 'is-invalid' : 'is-valid')} ${!formData?.pocket_fabric && 'placeholder'}`}
                >
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <CFormCheck
                      id="pocket_fabric"
                      label="¿Tela bolsillo?"
                      checked={!!formData?.pocket_fabric}
                      onChange={(e) => handleChange('pocket_fabric', e.target.checked)}
                    />

                    {!errors?.pocket_fabric && validated && (
                      <Check size={16} strokeWidth={5} color="#198754" />
                    )}
                  </div>
                </div>
                {errors?.pocket_fabric && (
                  <div className="invalid-feedback d-block" style={{ marginTop: '0.1rem' }}>
                    {errors?.pocket_fabric.map((message, index) => (
                      <div key={index} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter" style={{ whiteSpace: 'pre-line' }}>
                          {message}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
                {!errors?.pocket_fabric && validated && (
                  <div className="valid-feedback d-block" style={{ marginTop: '0.1rem' }}>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter">Dato válido</small>
                    </div>
                  </div>
                )}
              </div>
            </CCol>
            <CCol md={5}>
              <EditableField
                label={'Tela'}
                editing={editingField === 'fabric'}
                error={errors?.fabric_id}
                valid={formData?.fabric_id !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.fabric = el)}
                    name="fabric_id"
                    value={fabrics?.[formData?.fabric_id] ?? null}
                    onChange={(selected) => {
                      handleChange('fabric_id', selected?.value)
                      setRollsAux({})
                    }}
                    invalid={!!errors?.fabric_id}
                    valid={!errors?.fabric_id && formData?.fabric_id !== '' && validated}
                    options={fabrics ? Object.values(fabrics) : []}
                    isDisabled={!fabrics}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione una tela'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={getSelectStyles({
                      isInvalid: isInvalidFabric,
                      isValid: isValidFabric,
                    })}
                    onBlur={() => setEditingField(null)}
                  />
                }
                display={
                  <span
                    className={`editable-field input-custom ${
                      !formData?.fabric_id ? 'placeholder' : ''
                    } ${validated ? (errors?.fabric_id ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={async () => {
                      await loadFabrics()
                      setEditingField('fabric')
                    }}
                  >
                    {!fabrics && formData?.fabric
                      ? `${formData.fabric.name} - ${formData.fabric.description}`
                      : fabrics?.[formData?.fabric_id]?.label || 'Seleccione una tela'}
                  </span>
                }
              />
            </CCol>
            <CCol md={4}>
              <EditableField
                label={'Color'}
                editing={editingField === 'color'}
                error={errors?.color_id}
                valid={formData?.color_id !== '' && validated}
                validated={validated}
                editor={
                  <Select
                    ref={(el) => (inputRefs.current.color = el)}
                    name="color_id"
                    value={
                      fabrics && formData?.fabric_id
                        ? (fabrics[formData.fabric_id].data.color_id
                            ?.map((item) => ({
                              label: `${item.settings?.code ?? ''} - ${item.name}`,
                              value: item.id,
                            }))
                            .find((item) => item.value === formData.color_id) ?? null)
                        : null
                    }
                    onChange={(selected) => handleChange('color_id', selected?.value)}
                    invalid={!!errors?.color_id}
                    valid={!errors?.color_id && formData?.color_id !== '' && validated}
                    options={
                      fabrics && formData?.fabric_id
                        ? fabrics?.[formData?.fabric_id]?.data?.color_id?.map((item) => ({
                            label: `${item.settings.code} - ${item.name}`,
                            value: item.id,
                          }))
                        : []
                    }
                    isDisabled={!formData?.fabric_id}
                    isSearchable
                    filterOption={customFilterOption}
                    className="w-100 font-montserrat"
                    placeholder={'Seleccione una color'}
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
                    } ${validated ? (errors?.color_id ? 'is-invalid' : 'is-valid') : ''}`}
                    onClick={() => {
                      setEditingField('color')
                    }}
                  >
                    {formData?.color
                      ? `${formData.color.settings?.code} - ${formData.color.name}`
                      : !!fabrics && formData.fabric_id && formData.color_id
                        ? `${fabrics?.[formData?.fabric_id]?.data?.color_id.find((item) => item.id === formData?.color_id)?.settings?.code}
                       - ${
                         fabrics?.[formData?.fabric_id]?.data?.color_id.find(
                           (item) => item.id === formData?.color_id,
                         )?.name
                       }`
                        : 'Seleccione un color'}
                  </span>
                }
              />
            </CCol>
            <CCol md={8}>
              <div className="d-flex flex-column gap-2">
                <CFormLabel className="font-inter mb-0">Observación</CFormLabel>
                <CFormTextarea
                  ref={(el) => (inputRefs.current.observation = el)}
                  name="observation"
                  value={
                    !!formData?.observation ? formData?.observation : production_order?.observation
                  }
                  onChange={(e) => handleChange('observation', e.target.value)}
                  invalid={!!errors?.observation}
                  valid={!errors?.observation && formData?.observation !== '' && validated}
                  className={`font-montserrat input-custom editable-field-textarea ${validated && (errors?.observation ? 'is-invalid' : 'is-valid')} ${!formData?.observation && 'placeholder'}`}
                  onBlur={() => setEditingField(null)}
                  rows={5}
                  placeholder="Ingrese una observación"
                />
                {errors?.observation && (
                  <div className="invalid-feedback d-block" style={{ marginTop: '0.1rem' }}>
                    {errors?.observation.map((message, index) => (
                      <div key={index} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter" style={{ whiteSpace: 'pre-line' }}>
                          {message}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
                {!errors?.observation && validated && (
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
              <div className="d-flex flex-column gap-2">
                <CFormLabel className="font-inter mb-0">Trazos</CFormLabel>
                <div className="flex-grow-1 d-flex flex-column">
                  {trazosFile ? (
                    <div
                      className="d-flex align-items-center justify-content-between p-4 rounded-3 flex-grow-1 border"
                      style={{
                        backgroundColor: '#f8fafc',
                        borderColor: '#cbd5e1',
                        borderStyle: 'solid',
                        minHeight: '130px',
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-2 rounded bg-danger bg-opacity-10 text-danger">
                          <FileText size={24} />
                        </div>
                        <div className="d-flex flex-column">
                          <span
                            className="fw-medium text-dark font-inter text-break"
                            style={{ fontSize: '0.875rem' }}
                          >
                            {trazosFile.name}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn p-1 rounded-circle hover-bg-gray d-flex align-items-center justify-content-center"
                        style={{ width: '32px', height: '32px', transition: 'all 0.2s' }}
                        onClick={removeTrazosFile}
                      >
                        <X size={18} className="text-secondary" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="trazos_pdf"
                      className="d-flex flex-column align-items-center justify-content-center p-3 rounded-3 flex-grow-1 text-center cursor-pointer editable-field-textarea"
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        minHeight: '130px',
                      }}
                    >
                      <input
                        type="file"
                        id="trazos_pdf"
                        accept=".pdf"
                        hidden
                        onChange={handleTrazosChange}
                      />
                      <UploadCloud size={28} className="text-muted mb-2" />
                      <span
                        className="fw-semibold font-inter text-secondary"
                        style={{ fontSize: '0.85rem' }}
                      >
                        Cargar archivo con los trazos
                      </span>
                    </label>
                  )}
                </div>
                {errors?.strokes && (
                  <div className="invalid-feedback d-block" style={{ marginTop: '0.1rem' }}>
                    {errors?.strokes.map((message, index) => (
                      <div key={index} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter" style={{ whiteSpace: 'pre-line' }}>
                          {message}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
                {!errors?.strokes && validated && (
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

export default InformationProductionOrder
