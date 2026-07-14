import { useState, useRef, useEffect } from 'react'
import { CButton, CCard, CCardBody, CTooltip } from '@coreui/react'
import { Images, ImageUp, ZoomIn, X, ImageMinus } from 'lucide-react'

const PreviewPopover = ({ image, original, field, updateSheetField, isLocked }) => {
  const [open, setOpen] = useState(false)
  const popoverRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const buttonRef = useRef(null)
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  })
  const [showFullscreen, setShowFullscreen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedPopover = popoverRef.current?.contains(event.target)
      const clickedButton = buttonRef.current?.contains(event.target)

      if (!clickedPopover && !clickedButton) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleFileChange = (e) => {
    if (isLocked) return
    const file = e.target.files?.[0]

    if (!file) return

    const localUrl = URL.createObjectURL(file)

    updateSheetField(field, {
      file,
      photo_type_id: 3,
      photo_subtype_id: 9,
    })

    setPreview(localUrl)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {!image ? (
        <>
          <CButton
            disabled={isLocked}
            ref={buttonRef}
            color="primary"
            size="sm"
            onClick={() => {
              if (isLocked) return
              if (!open && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect()
                setPosition({
                  top: rect.top - 20,
                  left: rect.left + rect.width / 2,
                })
              }
              setOpen(!open)
            }}
            className="d-flex align-items-center gap-2"
          >
            <ImageUp size={14} />
            Cargar
          </CButton>
        </>
      ) : (
        <>
          <CButton
            ref={buttonRef}
            color="light"
            size="sm"
            onClick={() => {
              if (!open && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect()
                setPosition({
                  top: rect.top - 20,
                  left: rect.left + rect.width / 2,
                })
              }
              setOpen(!open)
            }}
            className="d-flex align-items-center gap-2"
          >
            <Images size={14} />
            Visualizar
          </CButton>
        </>
      )}

      {open && (
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            transform: 'translate(-50%, -100%)',
            zIndex: 999999,
            width: '320px',
            pointerEvents: 'auto',
          }}
        >
          <CCard
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: 'none',
              background: '#000',
              boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                height: '220px',
                overflow: 'hidden',
                background: '#e5e7eb',
                position: 'relative',
              }}
            >
              {(image || preview) && (
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
                      setShowFullscreen(true)
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
                      marginBottom: '3px',
                    }}
                  >
                    <ZoomIn size={16} />
                  </div>

                  {preview && (
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setPreview(null)
                        updateSheetField(field, original)
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
              )}
              <label
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  opacity: isLocked ? 0.5 : 1,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  position: 'relative',
                }}
              >
                {image || preview ? (
                  <>
                    <img
                      src={preview || image?.path}
                      alt="preview"
                      className="object-fit-contain p-3"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        background: '#e5e7eb',
                      }}
                    />

                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        opacity: 0,
                        transition: '0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                      className="preview-overlay"
                    >
                      Cambiar imagen
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      color: '#6b7280',
                    }}
                  >
                    <ImageUp size={42} />
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Cargar imagen
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                      }}
                    >
                      Click para seleccionar
                    </div>
                  </div>
                )}

                <input
                  disabled={isLocked}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </CCard>
        </div>
      )}
      {showFullscreen && (
        <div
          onClick={() => setShowFullscreen(false)}
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
            onClick={() => setShowFullscreen(false)}
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
          >
            <X size={20} />
          </button>

          <img
            src={preview || image?.path}
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

export default PreviewPopover
