import React, { useState } from 'react'
import { X } from 'lucide-react'

const TechnicalSheetWithoutOrder = ({ technical_sheet, sizes }) => {
  const [showFullscreen, setShowFullscreen] = useState(false)

  const renderValue = (value) => {
    if (!value) {
      return <span className="text-muted">N/A</span>
    }

    return value
  }

  return (
    <>
      <tr>
        <td className="table-cell cell-width-160">
          <div className="d-flex align-items-center justify-content-center h-100">
            <span className="font-inter text-center table-input">
              {renderValue(technical_sheet?.code)}
            </span>
          </div>
        </td>

        <td className="table-cell cell-width-160">
          <div className="d-flex align-items-center justify-content-center h-100">
            <span className="font-inter text-center table-input">
              {renderValue(technical_sheet?.garment_type?.name)}
            </span>
          </div>
        </td>

        <td className="table-cell cell-width-160">
          <div className="d-flex align-items-center justify-content-center h-100">
            <span className="font-inter text-center table-input">
              {renderValue(technical_sheet?.wash_tone?.name)}
            </span>
          </div>
        </td>

        <td className="table-cell cell-width-160">
          <div className="d-flex align-items-center justify-content-center h-100">
            <span className="font-inter text-center table-input">
              {renderValue(technical_sheet?.boot_type?.name)}
            </span>
          </div>
        </td>

        <td className="table-cell cell-width-160">
          <div className="d-flex align-items-center justify-content-center h-100">
            <span className="font-inter text-center table-input">
              {renderValue(technical_sheet?.observation)}
            </span>
          </div>
        </td>

        <td className="table-cell cell-width-230">
          <div className="d-flex justify-content-center align-items-center h-100">
            {technical_sheet?.photo_d?.path ? (
              <div
                style={{
                  width: '110px',
                  height: '125px',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  border: '1px solid #dee2e6',
                  background: '#fff',
                  padding: '3px',
                }}
              >
                <img
                  src={technical_sheet.photo_d.path}
                  alt="Foto delantera"
                  onClick={() => setShowFullscreen(technical_sheet.photo_d.path)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    cursor: 'pointer',
                    borderRadius: '9px',
                  }}
                />
              </div>
            ) : (
              <span
                className="font-inter"
                style={{
                  color: '#94A3B8',
                  fontSize: '14px',
                }}
              >
                N/A
              </span>
            )}
          </div>
        </td>

        <td className="table-cell cell-width-160">
          <div className="d-flex justify-content-center align-items-center h-100">
            {technical_sheet?.photo_t?.path ? (
              <div
                style={{
                  width: '110px',
                  height: '125px',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  border: '1px solid #dee2e6',
                  background: '#fff',
                  padding: '3px',
                }}
              >
                <img
                  src={technical_sheet.photo_t.path}
                  alt="Foto delantera"
                  onClick={() => setShowFullscreen(technical_sheet.photo_t.path)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    cursor: 'pointer',
                    borderRadius: '9px',
                  }}
                />
              </div>
            ) : (
              <span
                className="font-inter"
                style={{
                  color: '#94A3B8',
                  fontSize: '14px',
                }}
              >
                N/A
              </span>
            )}
          </div>
        </td>

        <td colSpan={sizes.length + 10} className="table-cell text-center align-middle">
          <span className="font-inter text-muted">No hay órdenes de producción</span>
        </td>
      </tr>

      {showFullscreen && (
        <div
          onClick={() => setShowFullscreen(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 99999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          <button
            type="button"
            onClick={() => setShowFullscreen(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="style-btn-action-image"
          >
            <X size={20} />
          </button>

          <img
            src={showFullscreen}
            alt="Vista ampliada"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: '12px',
              background: '#fff',
              padding: '4px',
            }}
          />
        </div>
      )}
    </>
  )
}

export default React.memo(TechnicalSheetWithoutOrder)
