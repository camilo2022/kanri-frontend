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
  Save,
  Check,
} from 'lucide-react'
import Select from 'react-select'
import { useRef } from 'react'
import { getSelectStyles } from '@/components/StyleManagementCollection'

const InformationTechnicalSheetProcess = ({
  product,
  technical_sheet,
  errors,
  validated,
  formData,
  setFormData,
  photoDPreview,
  setPhotoDPreview,
  photoTPreview,
  setPhotoTPreview,
}) => {
  const [editingField, setEditingField] = useState(null)
  const inputRefs = useRef({})

  const [showFullscreen, setShowFullscreen] = useState(false)

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
        product_id: technical_sheet.product_id,
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
        code: technical_sheet.code,
        status: technical_sheet.status,
      }))
      setPhotoDPreview(technical_sheet.photo_d)
      setPhotoTPreview(technical_sheet.photo_t)
    }
  }, [technical_sheet])

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
                        {!!photoDPreview.preview && !!technical_sheet && (
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
                        className="img-fluid rounded border"
                        style={{
                          width: '100%',
                          height: '365px',
                          objectFit: 'contain',
                          background: '#f8f9fa',
                        }}
                      />
                    </>
                  ) : (
                    <div
                      className="rounded d-flex flex-column align-items-center justify-content-center border"
                      style={{
                        height: '365px',
                        background: '#fafafa',
                      }}
                    >
                      <ImagePlus size={40} className="mb-2 text-secondary" />
                      <span className="font-inter">No hay foto</span>
                    </div>
                  )}
                </label>
              </div>
            </CCol>
            <CCol md={6} lg={12}>
              <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                Foto Trasera
                <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
              </CFormLabel>
              <div className="image-upload-container">
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
                            setShowFullscreen(
                              photoTPreview.preview || technical_sheet?.photo_t?.path,
                            )
                          }}
                          className="style-btn-action-image"
                        >
                          <ZoomIn size={16} />
                        </div>
                        {!!photoTPreview.preview && !!technical_sheet && (
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
                        className="img-fluid rounded border"
                        style={{
                          width: '100%',
                          height: '365px',
                          objectFit: 'contain',
                          background: '#f8f9fa',
                        }}
                      />
                    </>
                  ) : (
                    <div
                      className="rounded d-flex flex-column align-items-center justify-content-center border"
                      style={{
                        height: '365px',
                        background: '#fafafa',
                      }}
                    >
                      <ImagePlus size={40} className="mb-2 text-secondary" />
                      <span className="font-inter">No hay foto</span>
                    </div>
                  )}
                </label>
              </div>
            </CCol>
          </CRow>
        </CCol>
        <CCol md={12} lg={9}>
          <CRow className="g-3 mb-1">
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Código</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !formData?.code ? 'placeholder' : ''
                  }`}
                >
                  {formData?.code}
                </span>
              </div>
            </CCol>
            <CCol md={3} xxl={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Referencia</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !product?.code ? 'placeholder' : ''
                  }`}
                >
                  {product?.code}
                </span>
              </div>
            </CCol>
            <CCol md={5} xxl={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Marca</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${!product?.trademark?.name ? 'placeholder' : ''}`}
                >
                  {product?.trademark?.name}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Grupo</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${!product?.trademark?.group?.[0]?.name ? 'placeholder' : ''}`}
                >
                  {product?.trademark?.group?.[0]?.name}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Categoría</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${!product?.subcategory_id ? 'placeholder' : ''}`}
                >
                  {product?.subcategory?.category[0]?.name}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Subcategoría</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${!product?.subcategory_id ? 'placeholder' : ''}`}
                >
                  {product?.subcategory?.name}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Subgrupo</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.subgroup?.name ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.subgroup?.name || '-'}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Fecha</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.date ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.date || '-'}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Estado</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${STATUS_BADGE_STYLES[technical_sheet?.status || '']} ${
                    !technical_sheet?.status ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.status || '-'}
                </span>
              </div>
            </CCol>
            <CCol md={8}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Colección</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.collection?.name ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.collection?.name
                    ? `${technical_sheet.collection.name} - ${
                        technical_sheet.collection.description ?? ''
                      }`
                    : '-'}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Medida de Pretina</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.measure_of_waistband ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.measure_of_waistband || '-'}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">N° de Botones</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.number_of_buttons ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.number_of_buttons || '-'}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Muestra Física</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.physical_sample ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.physical_sample ? 'Sí' : 'No'}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Color</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.color?.name ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.color?.name
                    ? `${technical_sheet?.color?.settings?.code} - ${technical_sheet.color.name ?? ''}`
                    : '-'}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Tipo de Prenda</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.garment_type?.name ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.garment_type?.name
                    ? `${technical_sheet?.garment_type?.settings?.code} - ${technical_sheet.garment_type.name ?? ''}`
                    : '-'}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Tono de Lavado</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.wash_tone?.name ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.wash_tone?.name
                    ? `${technical_sheet?.wash_tone?.settings?.code} - ${technical_sheet.wash_tone.name ?? ''}`
                    : '-'}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Tipo de Trasero</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.back_type?.name ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.back_type?.name
                    ? `${technical_sheet?.back_type?.settings?.code || 'N/A'} - ${technical_sheet.back_type.name ?? ''}`
                    : '-'}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Tipo de Bota</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.boot_type?.name ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.boot_type?.name
                    ? `${technical_sheet?.boot_type?.settings?.code || 'N/A'} - ${technical_sheet.boot_type.name ?? ''}`
                    : '-'}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Tipo de Cotilla</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.yoke_type?.name ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.yoke_type?.name
                    ? `${technical_sheet?.yoke_type?.settings?.code || 'N/A'} - ${technical_sheet.yoke_type.name ?? ''}`
                    : '-'}
                </span>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Tipo de Pretina</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.waistband_type?.name ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet?.waistband_type?.name
                    ? `${technical_sheet?.waistband_type?.settings?.code || 'N/A'} - ${technical_sheet.waistband_type.name ?? ''}`
                    : '-'}
                </span>
              </div>
            </CCol>
            <CCol md={12}>
              <div className="gap-2">
                <CFormLabel className="font-inter mb-2">Patronista</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet ? 'placeholder' : ''
                  }`}
                >
                  {technical_sheet
                    ? `${technical_sheet?.pattern_maker?.person?.names} ${technical_sheet?.pattern_maker?.person?.last_names} | ${technical_sheet?.pattern_maker?.person?.document} | ${technical_sheet?.pattern_maker?.position?.name || '-'}`
                    : '-'}
                </span>
              </div>
            </CCol>
            <CCol md={6}>
              <div className="d-flex flex-column gap-2">
                <CFormLabel className="font-inter mb-2">Observación</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.observation ? 'placeholder' : ''
                  }`}
                  style={{
                    whiteSpace: 'pre-line',
                    minHeight: '80px',
                  }}
                >
                  {technical_sheet?.observation || '-'}
                </span>
              </div>
            </CCol>
            <CCol md={6}>
              <div className="d-flex flex-column gap-2">
                <CFormLabel className="font-inter mb-2">Descripción</CFormLabel>
                <span
                  className={`editable-field-disabled input-custom ${
                    !technical_sheet?.description ? 'placeholder' : ''
                  }`}
                  style={{
                    whiteSpace: 'pre-line',
                    minHeight: '80px',
                  }}
                >
                  {technical_sheet?.description || '-'}
                </span>
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

export default InformationTechnicalSheetProcess
