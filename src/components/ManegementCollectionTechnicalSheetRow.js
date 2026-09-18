import React, { useCallback, useState, useRef, useEffect } from 'react'
import { CFormInput, CFormTextarea, CTooltip, CPopover, CButton } from '@coreui/react'
import Select from 'react-select'
import {
  tableSelectStyles,
  tableSelectStylesCorrect,
  optionsProcess,
  optionsStatus,
  getProcessClass,
  getStatusClass,
} from '@/components/StyleManagementCollection'
import { Trash2, RefreshCw, BadgeCheck, BadgeAlert, XCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'
import { useDispatch, useSelector } from 'react-redux'
import PreviewPopover from './PreviewPopover'

const selectStylesWithPortal = {
  ...tableSelectStylesCorrect,
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
}

const ManagementCollectionTechnicalSheetRow = ({
  sheetId,
  sheet,
  trademark,
  category,
  subcategory,
  setData,
  garmentTypes,
  washTones,
  bootTypes,
  supplyTypes,
  processes,
  supplies,
  onOpenModal,
  modified,
  setModified,
  validated,
  errors,
}) => {
  const dispath = useDispatch()
  const [editingField, setEditingField] = useState(null)
  const [openPopover, setOpenPopover] = useState({})
  const sheetModified = useSelector((state) => state.technicalSheetsModified[sheetId])
  const errorIconRef = useRef(null)
  const errorPopoverRef = useRef(null)

  const inputRefs = useRef({})

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
    const handleClickOutside = (event) => {
      const clickedIcon = errorIconRef.current?.contains(event.target)
      const clickedPopover = errorPopoverRef.current?.contains(event.target)

      if (!clickedIcon && !clickedPopover) {
        setOpenPopover(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {}, [sheet.technical_sheet_details])

  const updateSheetField = useCallback(
    (field, value, item = '', aux = '') => {
      setData((prev) => {
        const newData = structuredClone(prev)
        const aux =
          newData[trademark.id].categories[category.id].subcategories[subcategory.id]
            .technical_sheets[sheetId]

        if (item !== '') {
          aux[item][field] = value
        } else {
          if (field === 'status') {
            const isNewSheet = String(sheetId).startsWith('temp-')

            if (!isNewSheet && sheet.status !== 'Pendiente' && value === 'Pendiente') {
              return prev
            }

            if (value !== 'Pendiente') {
              if (!aux.code && aux.product?.code) {
                aux.code = aux.product.code
                aux.product.code = ''
              }
            } else {
              if (aux.code) {
                aux.product.code = aux.code
                aux.code = ''
              }
            }
          }
          aux[field] = value
        }

        dispath({
          type: 'ADD_TECHNICAL_SHEET',
          payload: {
            id: sheetId,
            technicalSheet:
              newData[trademark.id].categories[category.id].subcategories[subcategory.id]
                .technical_sheets[sheetId],
          },
        })

        return newData
      })

      if (String(sheetId).startsWith('temp') && value === '') {
        setModified((prev) => {
          const updated = { ...prev }
          const key = aux !== '' ? aux : item !== '' ? item : field

          if (updated[sheetId]) {
            delete updated[sheetId][key]
            if (Object.keys(updated[sheetId]).length === 0) {
              delete updated[sheetId]
            }
          }

          return updated
        })
      } else {
        setModified((prev) => ({
          ...prev,
          [sheetId]: {
            ...prev[sheetId],
            ...(aux !== '' ? { [aux]: true } : item !== '' ? { [item]: true } : { [field]: true }),
          },
        }))
      }
    },
    [[sheetId, trademark.id, category.id, subcategory.id, setData, setModified]],
  )

  const updateSheetDeatilsField = useCallback(
    (process, value) => {
      setData((prev) => {
        const newData = structuredClone(prev)

        const trademarkData = (newData[trademark.id] ??= { categories: {} })
        const categoryData = (trademarkData.categories[category.id] ??= { subcategories: {} })
        const subcategoryData = (categoryData.subcategories[subcategory.id] ??= {
          technical_sheets: {},
        })

        const sheet = (subcategoryData.technical_sheets[sheetId] ??= {
          technical_sheet_details: {},
        })

        sheet.technical_sheet_details[process.id] ??= {
          model_id: process.id,
          model_type: 'App\\Models\\Process',
          status: '',
          settings: process.settings.schema || null,
        }

        sheet.technical_sheet_details[process.id].status = value

        dispath({
          type: 'ADD_TECHNICAL_SHEET',
          payload: {
            id: sheetId,
            technicalSheet: sheet,
          },
        })

        return newData
      })

      setModified((prev) => ({
        ...prev,
        [sheetId]: {
          ...prev[sheetId],
          ['technical_sheet_details']: true,
        },
      }))
    },
    [[sheetId, trademark.id, category.id, subcategory.id, setData, setModified]],
  )

  const updatePreviousProcessStatuses = (process, status, technicalSheetDetails) => {
    technicalSheetDetails[process.id] ??= {
      model_id: process.id,
      model_type: 'App\\Models\\Process',
      status: '',
      settings: process.settings?.schema || null,
    }

    technicalSheetDetails[process.id].status = status

    process.before_processes?.forEach((previousProcess) => {
      updatePreviousProcessStatuses(previousProcess, status, technicalSheetDetails)
    })
  }

  const getTechnicalSheetStatus = (details) => {
    const statuses = Object.values(details)
      .map((detail) => detail?.status)
      .filter(Boolean)

    if (statuses.length === 0) {
      return 'Pendiente'
    }

    if (statuses.some((status) => status === 'En revisión')) {
      return 'En revisión'
    }

    if (statuses.every((status) => status === 'Aprobado')) {
      return 'Aprobado'
    }

    if (statuses.every((status) => status === 'Pendiente')) {
      return 'Pendiente'
    }

    return 'En revisión'
  }

  const updateProcessStatus = useCallback(
    (process, value) => {
      setData((prev) => {
        const newData = structuredClone(prev)

        const trademarkData = (newData[trademark.id] ??= {
          categories: {},
        })

        const categoryData = (trademarkData.categories[category.id] ??= {
          subcategories: {},
        })

        const subcategoryData = (categoryData.subcategories[subcategory.id] ??= {
          technical_sheets: {},
        })

        const sheetData = (subcategoryData.technical_sheets[sheetId] ??= {
          technical_sheet_details: {},
        })

        const details = sheetData.technical_sheet_details

        const statusLevel = {
          Pendiente: 0,
          'En revision': 1,
          Aprobado: 2,
        }

        const updatePreviousProcesses = (currentProcess, isMainProcess = false) => {
          details[currentProcess.id] ??= {
            model_id: currentProcess.id,
            model_type: 'App\\Models\\Process',
            status: '',
            settings: currentProcess.settings?.schema || null,
          }

          const currentStatus = details[currentProcess.id].status

          if (isMainProcess) {
            details[currentProcess.id].status = value
          } else {
            if (!currentStatus || statusLevel[value] > statusLevel[currentStatus]) {
              details[currentProcess.id].status = value
            }
          }

          currentProcess.before_processes?.forEach((previousProcess) => {
            const detailPrevious = processes.find((item) => item.id === previousProcess.id)

            if (detailPrevious) {
              updatePreviousProcesses(detailPrevious)
            }
          })
        }

        updatePreviousProcesses(process, true)

        const statuses = Object.values(details)
          .map((detail) => detail?.status)
          .filter(Boolean)

        let technicalSheetStatus = 'Pendiente'

        if (statuses.some((status) => status === 'En revisión')) {
          technicalSheetStatus = 'En revisión'
        } else if (statuses.length > 0 && statuses.every((status) => status === 'Aprobado')) {
          technicalSheetStatus = 'Aprobado'
        } else if (statuses.length > 0 && statuses.every((status) => status === 'Pendiente')) {
          technicalSheetStatus = 'Pendiente'
        } else {
          technicalSheetStatus = 'En revision'
        }

        sheetData.status = technicalSheetStatus

        dispath({
          type: 'ADD_TECHNICAL_SHEET',
          payload: {
            id: sheetId,
            technicalSheet: sheetData,
          },
        })

        return newData
      })

      setModified((prev) => ({
        ...prev,
        [sheetId]: {
          ...prev[sheetId],
          technical_sheet_details: true,
        },
      }))
    },
    [sheetId, trademark.id, category.id, subcategory.id, setData, setModified, dispath],
  )

  const getCellClass = useCallback(
    (field, widthClass = 'cell-width-160') => {
      let classes = `table-cell ${widthClass}`

      const hasError = !!Object.keys(errors?.errors || {}).some((aux) => aux.startsWith(field))
      const isProcessed = !!validated

      if (hasError && isProcessed && sheetModified) {
        classes += ' table-cell-error'
      }

      if (modified) {
        classes += ' table-cell-row-modified'
        if (modified[field]) {
          classes += ' table-cell-modified'
        }
      }

      return classes
    },
    [modified, errors, validated],
  )

  const getErrorProcess = useCallback(
    (field) => {
      let classes = ''

      const hasError = !!Object.keys(errors?.errors || {}).some((aux) => aux.startsWith(field))
      const isProcessed = !!validated

      if (hasError && isProcessed && sheetModified) {
        classes += ' table-cell-error'
      }

      return classes
    },
    [errors, validated],
  )

  const getErrorIndex = useCallback(
    (field) => {
      let classes = ''

      const hasError = !!Object.keys(errors?.errors || {})
      const isProcessed = !!validated

      if (hasError && isProcessed && sheetModified) {
        classes += ' table-cell-error'
      }

      return classes
    },
    [errors, validated],
  )

  const handleDeleteRow = async () => {
    const result = await Swal.fire({
      title: 'Eliminar Fila',
      html: `<div style="font-size:14px">
               Se eliminará la fila. La información ingresada sera eliminada.<br/>
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

    setData((prev) => {
      const newData = structuredClone(prev)
      const trademarkAux = newData[trademark.id]
      const categoryAux = trademarkAux.categories[category.id]
      const subcategoryAux = categoryAux.subcategories[subcategory.id]
      const technicalSheetsAux = subcategoryAux.technical_sheets
      const { [sheetId]: deleted, ...restTechnicalSheets } = technicalSheetsAux
      newData[trademark.id].categories[category.id].subcategories[subcategory.id].technical_sheets =
        restTechnicalSheets
      return newData
    })

    dispath({
      type: 'REMOVE_TECHNICAL_SHEETS',
      payload: {
        id: sheetId,
      },
    })

    Toast.fire({
      icon: 'success',
      title: 'Fila eliminada correctamente',
    })
  }

  const getFieldErrors = (field) => {
    if (!errors?.errors) return []

    return Object.entries(errors.errors)
      .filter(([key]) => key.startsWith(field))
      .map(([, value]) => value)
  }

  const isLocked = sheet?.status === 'Aprobado' || sheet?.status === 'Cancelado'

  return (
    <tr key={sheetId}>
      <td className={`style-table-td sticky-actions cell-width-100 ${getErrorIndex('index')}`}>
        <div className="overlay-loading">
          <CTooltip content="Reasignar" placement="top">
            <button
              onClick={() => {
                onOpenModal(sheet)
              }}
              className="td-button-refresh"
            >
              <RefreshCw size={16} />
            </button>
          </CTooltip>
          <CTooltip content="Eliminar" placement="top">
            <button
              onClick={handleDeleteRow}
              className="td-button-delete"
              hidden={!String(sheetId).startsWith('temp')}
            >
              <Trash2 size={16} />
            </button>
          </CTooltip>
          {!!Object.keys(errors?.errors || {}).length > 0 && (
            <div style={{ position: 'relative' }}>
              <CTooltip content="Hay errorres en esta fila" placement="top">
                <span
                  style={{ cursor: 'pointer', color: '#ef4444' }}
                  onClick={() =>
                    setOpenPopover(openPopover === 'observation' ? null : 'observation')
                  }
                >
                  <BadgeAlert size={16} />
                </span>
              </CTooltip>
            </div>
          )}
        </div>
      </td>
      <td className={getCellClass('code')}>
        <div className="d-flex align-items-center gap-2">
          <div
            className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer me-auto w-100 h-100"
            onClick={() => {
              if (isLocked || sheet?.status === 'En Revision') return
              setEditingField('code')
            }}
          >
            {sheet?.code || '-'}
          </div>
          {getFieldErrors('code').length > 0 && (
            <div style={{ position: 'relative' }}>
              <span
                style={{ cursor: 'pointer', color: '#ef4444' }}
                onClick={() => setOpenPopover(openPopover === 'code' ? null : 'code')}
              >
                <BadgeAlert size={16} />
              </span>
              <CPopover
                visible={openPopover === 'code'}
                placement="top"
                onHide={() => setOpenPopover(null)}
                title={
                  <div
                    className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                    style={{
                      color: '#991B1B',
                      fontSize: '0.85rem',
                      padding: '2px 0',
                    }}
                  >
                    <BadgeAlert size={15} className="text-danger" />
                    <span>Errores de validación</span>
                  </div>
                }
                content={
                  <div
                    className="font-inter custom-popover-error"
                    style={{
                      maxWidth: '260px',
                      fontSize: '0.82rem',
                    }}
                  >
                    {getFieldErrors('code').map((err, i) => (
                      <div key={i} className="d-flex align-items-start gap-2 p-1 rounded-2">
                        <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                      </div>
                    ))}
                  </div>
                }
              >
                <span className="position-absolute" style={{ transform: 'translateY(-10px)' }} />
              </CPopover>
            </div>
          )}
        </div>
      </td>
      <td className={getCellClass('product')}>
        <div className="d-flex align-items-center gap-2">
          {editingField === 'product' ? (
            <CFormInput
              ref={(el) => (inputRefs.current.product = el)}
              disabled={isLocked || sheet?.status === 'En Revision'}
              type="text"
              value={sheet?.product?.code || ''}
              placeholder={sheet?.product?.code === '' ? 'Ingresar...' : ''}
              onChange={(e) => updateSheetField('code', e.target.value.toUpperCase(), 'product')}
              className="table-input border-0 shadow-none px-2 py-1 font-inter"
            />
          ) : (
            <div
              className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer me-auto w-100"
              onClick={() => {
                if (isLocked || sheet?.status === 'En Revision') return
                setEditingField('product')
              }}
            >
              {sheet?.product?.code && sheet.product.code !== ''
                ? sheet.product.code
                : 'Ingresar...'}
            </div>
          )}
          {getFieldErrors('product').length > 0 && (
            <div style={{ position: 'relative' }}>
              <span
                style={{ cursor: 'pointer', color: '#ef4444' }}
                onClick={() => setOpenPopover(openPopover === 'product' ? null : 'product')}
              >
                <BadgeAlert size={16} />
              </span>
              <CPopover
                visible={openPopover === 'product'}
                placement="top"
                onHide={() => setOpenPopover(null)}
                title={
                  <div
                    className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                    style={{
                      color: '#991B1B',
                      fontSize: '0.85rem',
                      padding: '2px 0',
                    }}
                  >
                    <BadgeAlert size={15} className="text-danger" />
                    <span>Errores de validación</span>
                  </div>
                }
                content={
                  <div
                    className="font-inter custom-popover-error"
                    style={{
                      maxWidth: '260px',
                      fontSize: '0.82rem',
                    }}
                  >
                    {getFieldErrors('product').map((err, i) => (
                      <div key={i} className="d-flex align-items-start gap-2 p-1 rounded-2">
                        <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                      </div>
                    ))}
                  </div>
                }
              >
                <span className="position-absolute" style={{ transform: 'translateY(-10px)' }} />
              </CPopover>
            </div>
          )}
        </div>
      </td>
      <td className={getCellClass('garment_type_id', 'cell-width-200')}>
        <div className="d-flex align-items-center gap-2 w-100">
          <div className="flex-grow-1">
            {editingField === 'garment_type' ? (
              <Select
                ref={(el) => (inputRefs.current.garment_type = el)}
                isDisabled={isLocked}
                options={Object.values(garmentTypes)}
                value={garmentTypes[sheet?.garment_type_id] || null}
                onChange={(selected) => {
                  updateSheetField('garment_type_id', selected.value)
                  setEditingField(null)
                }}
                onBlur={() => setEditingField(null)}
                isSearchable
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={selectStylesWithPortal}
              />
            ) : (
              <div
                className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer w-100"
                onClick={() => {
                  if (isLocked) return
                  setEditingField('garment_type')
                }}
              >
                {!!garmentTypes && sheet?.garment_type_id
                  ? garmentTypes?.[sheet?.garment_type_id]?.label
                  : sheet?.garment_type
                    ? `${sheet.garment_type?.settings?.code ?? 'N/A'} - ${sheet.garment_type?.name ?? 'N/A'}`
                    : 'Seleccionar...'}
              </div>
            )}
          </div>
          {getFieldErrors('garment_type_id').length > 0 && (
            <div style={{ position: 'relative' }}>
              <span
                style={{ cursor: 'pointer', color: '#ef4444' }}
                onClick={() =>
                  setOpenPopover(openPopover === 'garment_type_id' ? null : 'garment_type_id')
                }
              >
                <BadgeAlert size={16} />
              </span>
              <CPopover
                visible={openPopover === 'garment_type_id'}
                placement="top"
                onHide={() => setOpenPopover(null)}
                title={
                  <div
                    className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                    style={{
                      color: '#991B1B',
                      fontSize: '0.85rem',
                      padding: '2px 0',
                    }}
                  >
                    <BadgeAlert size={15} className="text-danger" />
                    <span>Errores de validación</span>
                  </div>
                }
                content={
                  <div
                    className="font-inter custom-popover-error"
                    style={{
                      maxWidth: '260px',
                      fontSize: '0.82rem',
                    }}
                  >
                    {getFieldErrors('garment_type_id').map((err, i) => (
                      <div key={i} className="d-flex align-items-start gap-2 p-1 rounded-2">
                        <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                      </div>
                    ))}
                  </div>
                }
              >
                <span className="position-absolute" style={{ transform: 'translateY(-10px)' }} />
              </CPopover>
            </div>
          )}
        </div>
      </td>
      <td className={getCellClass('wash_tone_id', 'cell-width-230')}>
        <div className="d-flex align-items-center gap-2 w-100">
          <div className="flex-grow-1">
            {editingField === 'wash_tone' ? (
              <Select
                ref={(el) => (inputRefs.current.wash_tone = el)}
                isDisabled={isLocked}
                options={Object.values(washTones)}
                value={washTones[sheet?.wash_tone_id] || null}
                onChange={(selected) => {
                  updateSheetField('wash_tone_id', selected.value)
                  setEditingField(null)
                }}
                onBlur={() => setEditingField(null)}
                isSearchable
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={selectStylesWithPortal}
              />
            ) : (
              <div
                className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer w-100"
                onClick={() => {
                  if (isLocked) return
                  setEditingField('wash_tone')
                }}
              >
                {!!washTones && sheet?.wash_tone_id
                  ? washTones?.[sheet?.wash_tone_id]?.label
                  : sheet?.wash_tone
                    ? `${sheet.wash_tone?.settings?.code ?? 'N/A'} - ${sheet.wash_tone?.name ?? 'N/A'}`
                    : 'Seleccionar...'}
              </div>
            )}
          </div>
          {getFieldErrors('wash_tone_id').length > 0 && (
            <div style={{ position: 'relative' }}>
              <span
                style={{ cursor: 'pointer', color: '#ef4444' }}
                onClick={() =>
                  setOpenPopover(openPopover === 'wash_tone_id' ? null : 'wash_tone_id')
                }
              >
                <BadgeAlert size={16} />
              </span>
              <CPopover
                visible={openPopover === 'wash_tone_id'}
                placement="top"
                onHide={() => setOpenPopover(null)}
                title={
                  <div
                    className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                    style={{
                      color: '#991B1B',
                      fontSize: '0.85rem',
                      padding: '2px 0',
                    }}
                  >
                    <BadgeAlert size={15} className="text-danger" />
                    <span>Errores de validación</span>
                  </div>
                }
                content={
                  <div
                    className="font-inter custom-popover-error"
                    style={{
                      maxWidth: '260px',
                      fontSize: '0.82rem',
                    }}
                  >
                    {getFieldErrors('wash_tone_id').map((err, i) => (
                      <div key={i} className="d-flex align-items-start gap-2 p-1 rounded-2">
                        <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                      </div>
                    ))}
                  </div>
                }
              >
                <span className="position-absolute" style={{ transform: 'translateY(-10px)' }} />
              </CPopover>
            </div>
          )}
        </div>
      </td>
      <td className={getCellClass('boot_type_id', 'cell-width-230')}>
        <div className="d-flex align-items-center gap-2 w-100">
          <div className="flex-grow-1">
            {editingField === 'boot_type' ? (
              <Select
                ref={(el) => (inputRefs.current.boot_type = el)}
                isDisabled={isLocked}
                options={Object.values(bootTypes)}
                value={bootTypes[sheet?.boot_type_id] || null}
                onChange={(selected) => {
                  updateSheetField('boot_type_id', selected.value)
                  setEditingField(null)
                }}
                onBlur={() => setEditingField(null)}
                isSearchable
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={selectStylesWithPortal}
              />
            ) : (
              <div
                className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer w-100"
                onClick={() => {
                  if (isLocked) return
                  setEditingField('boot_type')
                }}
              >
                {!!bootTypes && sheet?.boot_type_id
                  ? bootTypes?.[sheet?.boot_type_id]?.label
                  : sheet?.boot_type
                    ? `${sheet.boot_type?.settings?.code ?? 'N/A'} - ${sheet.boot_type?.name ?? 'N/A'}`
                    : 'Seleccionar...'}
              </div>
            )}
          </div>
          {getFieldErrors('boot_type_id').length > 0 && (
            <div style={{ position: 'relative' }}>
              <span
                style={{ cursor: 'pointer', color: '#ef4444' }}
                onClick={() =>
                  setOpenPopover(openPopover === 'boot_type_id' ? null : 'boot_type_id')
                }
              >
                <BadgeAlert size={16} />
              </span>
              <CPopover
                visible={openPopover === 'boot_type_id'}
                placement="top"
                onHide={() => setOpenPopover(null)}
                title={
                  <div
                    className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                    style={{
                      color: '#991B1B',
                      fontSize: '0.85rem',
                      padding: '2px 0',
                    }}
                  >
                    <BadgeAlert size={15} className="text-danger" />
                    <span>Errores de validación</span>
                  </div>
                }
                content={
                  <div
                    className="font-inter custom-popover-error"
                    style={{
                      maxWidth: '260px',
                      fontSize: '0.82rem',
                    }}
                  >
                    {getFieldErrors('boot_type_id').map((err, i) => (
                      <div key={i} className="d-flex align-items-start gap-2 p-1 rounded-2">
                        <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                      </div>
                    ))}
                  </div>
                }
              >
                <span className="position-absolute" style={{ transform: 'translateY(-10px)' }} />
              </CPopover>
            </div>
          )}
        </div>
      </td>
      <td className={`${getCellClass('observation', 'cell-width-260')} table-cell-ellipsis`}>
        <div className="d-flex align-items-center gap-2">
          {editingField === 'observation' ? (
            <CFormTextarea
              ref={(el) => (inputRefs.current.observation = el)}
              disabled={isLocked}
              rows={2}
              value={sheet?.observation || ''}
              placeholder={sheet?.observation === '' ? 'Ingresar...' : ''}
              onChange={(e) => updateSheetField('observation', e.target.value.toUpperCase())}
              className="table-input border-0 shadow-none px-2 py-1 font-inter"
            />
          ) : (
            <div
              className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer w-100 me-auto"
              onClick={() => {
                if (isLocked) return
                setEditingField('observation')
              }}
            >
              {sheet?.observation || 'Ingresar...'}
            </div>
          )}
          {getFieldErrors('observation').length > 0 && (
            <div style={{ position: 'relative' }}>
              <span
                style={{ cursor: 'pointer', color: '#ef4444' }}
                onClick={() => setOpenPopover(openPopover === 'observation' ? null : 'observation')}
              >
                <BadgeAlert size={16} />
              </span>
              <CPopover
                visible={openPopover === 'observation'}
                placement="top"
                onHide={() => setOpenPopover(null)}
                title={
                  <div
                    className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                    style={{
                      color: '#991B1B',
                      fontSize: '0.85rem',
                      padding: '2px 0',
                    }}
                  >
                    <BadgeAlert size={15} className="text-danger" />
                    <span>Errores de validación</span>
                  </div>
                }
                content={
                  <div
                    className="font-inter custom-popover-error"
                    style={{
                      maxWidth: '260px',
                      fontSize: '0.82rem',
                    }}
                  >
                    {getFieldErrors('observation').map((err, i) => (
                      <div key={i} className="d-flex align-items-start gap-2 p-1 rounded-2">
                        <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                      </div>
                    ))}
                  </div>
                }
              >
                <span className="position-absolute" style={{ transform: 'translateY(-10px)' }} />
              </CPopover>
            </div>
          )}
        </div>
      </td>
      <td className={`${getCellClass('photo_d')}`}>
        <div className="d-flex align-items-center justify-content-center gap-2">
          <PreviewPopover
            image={sheet['photo_d']}
            original={sheet['photo_d_original']}
            field={'photo_d'}
            updateSheetField={updateSheetField}
            isLocked={isLocked}
          />
          {getFieldErrors('photo_d').length > 0 && (
            <div style={{ position: 'relative' }}>
              <span
                ref={errorIconRef}
                style={{ cursor: 'pointer', color: '#ef4444' }}
                onClick={() => setOpenPopover(openPopover === 'photo_d' ? null : 'photo_d')}
              >
                <BadgeAlert size={16} />
              </span>
              <CPopover
                visible={openPopover === 'photo_d'}
                placement="top"
                onHide={() => setOpenPopover(null)}
                title={
                  <div
                    className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                    style={{
                      color: '#991B1B',
                      fontSize: '0.85rem',
                      padding: '2px 0',
                    }}
                  >
                    <BadgeAlert size={15} className="text-danger" />
                    <span>Errores de validación</span>
                  </div>
                }
                content={
                  <div
                    ref={errorPopoverRef}
                    className="font-inter custom-popover-error"
                    style={{
                      maxWidth: '260px',
                      fontSize: '0.82rem',
                    }}
                  >
                    {getFieldErrors('photo_d').map((err, i) => (
                      <div key={i} className="d-flex align-items-start gap-2 p-1 rounded-2">
                        <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                      </div>
                    ))}
                  </div>
                }
              >
                <span className="position-absolute" style={{ transform: 'translateY(-10px)' }} />
              </CPopover>
            </div>
          )}
        </div>
      </td>
      <td className={`${getCellClass('photo_t')}`}>
        <div className="d-flex align-items-center justify-content-center gap-2">
          <PreviewPopover
            image={sheet['photo_t']}
            original={sheet['photo_t_original']}
            field={'photo_t'}
            updateSheetField={updateSheetField}
            isLocked={isLocked}
          />
          {getFieldErrors('photo_t').length > 0 && (
            <div style={{ position: 'relative' }}>
              <span
                style={{ cursor: 'pointer', color: '#ef4444' }}
                onClick={() => setOpenPopover(openPopover === 'photo_t' ? null : 'photo_t')}
              >
                <BadgeAlert size={16} />
              </span>
              <CPopover
                visible={openPopover === 'photo_t'}
                placement="top"
                onHide={() => setOpenPopover(null)}
                title={
                  <div
                    className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                    style={{
                      color: '#991B1B',
                      fontSize: '0.85rem',
                      padding: '2px 0',
                    }}
                  >
                    <BadgeAlert size={15} className="text-danger" />
                    <span>Errores de validación</span>
                  </div>
                }
                content={
                  <div
                    className="font-inter custom-popover-error"
                    style={{
                      maxWidth: '260px',
                      fontSize: '0.82rem',
                    }}
                  >
                    {getFieldErrors('photo_t').map((err, i) => (
                      <div key={i} className="d-flex align-items-start gap-2 p-1 rounded-2">
                        <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                      </div>
                    ))}
                  </div>
                }
              >
                <span className="position-absolute" style={{ transform: 'translateY(-10px)' }} />
              </CPopover>
            </div>
          )}
        </div>
      </td>
      {supplyTypes.length === 0 ? (
        <td className="table-cell">
          <div
            className="d-flex flex-column align-items-center justify-content-center gap-1 py-1"
            style={{
              color: '#6b7280',
            }}
          >
            <BadgeAlert size={20} />
            <span
              style={{
                fontSize: '11px',
                textAlign: 'center',
                lineHeight: '1',
              }}
            >
              No hay tipos de insumo registrados.
            </span>
          </div>
        </td>
      ) : (
        supplyTypes.map((supplyType) => {
          return (
            <td key={supplyType.id} className={getCellClass(`supply.${supplyType.id}`)}>
              <div className="d-flex align-items-center gap-2 w-100">
                <div className="flex-grow-1">
                  {editingField === `supply.${supplyType.id}` ? (
                    <Select
                      ref={(el) => (inputRefs.current[`supply.${supplyType.id}`] = el)}
                      isDisabled={isLocked}
                      options={supplies[supplyType.id] || []}
                      value={
                        supplies[supplyType.id]?.find(
                          (opt) => opt.value === sheet?.supplies?.[supplyType.id]?.id,
                        ) || null
                      }
                      onChange={(selected) => {
                        updateSheetField(
                          supplyType.id,
                          selected.data,
                          'supplies',
                          `supply.${supplyType.id}`,
                        )
                        setEditingField(null)
                      }}
                      onBlur={() => setEditingField(null)}
                      isSearchable
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={selectStylesWithPortal}
                    />
                  ) : (
                    <div
                      className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer w-100"
                      onClick={() => {
                        if (isLocked) return
                        setEditingField(`supply.${supplyType.id}`)
                      }}
                    >
                      {supplies[supplyType.id]?.find(
                        (opt) => opt.value === sheet?.supplies?.[supplyType.id],
                      )?.label ||
                        (sheet?.supplies?.[supplyType.id]
                          ? `${sheet.supplies[supplyType.id]?.name ?? 'N/A'} - ${
                              sheet.supplies[supplyType.id]?.description ?? 'N/A'
                            }`
                          : 'Seleccionar...')}
                    </div>
                  )}
                </div>
                {getFieldErrors(`supply.${supplyType.id}`).length > 0 && (
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{ cursor: 'pointer', color: '#ef4444' }}
                      onClick={() =>
                        setOpenPopover(
                          openPopover === `supply.${supplyType.id}`
                            ? null
                            : `supply.${supplyType.id}`,
                        )
                      }
                    >
                      <BadgeAlert size={16} />
                    </span>
                    <CPopover
                      visible={openPopover === `supply.${supplyType.id}`}
                      placement="top"
                      onHide={() => setOpenPopover(null)}
                      title={
                        <div
                          className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                          style={{
                            color: '#991B1B',
                            fontSize: '0.85rem',
                            padding: '2px 0',
                          }}
                        >
                          <BadgeAlert size={15} className="text-danger" />
                          <span>Errores de validación</span>
                        </div>
                      }
                      content={
                        <div
                          className="font-inter custom-popover-error"
                          style={{
                            maxWidth: '260px',
                            fontSize: '0.82rem',
                          }}
                        >
                          {getFieldErrors(`supply.${supplyType.id}`).map((err, i) => (
                            <div key={i} className="d-flex align-items-start gap-2 p-1 rounded-2">
                              <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                            </div>
                          ))}
                        </div>
                      }
                    >
                      <span
                        className="position-absolute"
                        style={{ transform: 'translateY(-10px)' }}
                      />
                    </CPopover>
                  </div>
                )}
              </div>
            </td>
          )
        })
      )}
      {processes.map((process, index) => {
        return (
          <td
            key={process.id}
            className={`table-cell ${getProcessClass(sheet?.technical_sheet_details?.[process.id]?.status || '')} ${getErrorProcess(`technical_sheet_details.${index}`)}`}
          >
            <div className="d-flex align-items-center gap-2 w-100">
              <div className="flex-grow-1">
                {editingField === `process-${process.id}` ? (
                  <Select
                    ref={(el) => (inputRefs.current[`process-${process.id}`] = el)}
                    isDisabled={
                      isLocked ||
                      sheet?.technical_sheet_details?.[process.id]?.status === 'Aprobado'
                    }
                    options={optionsProcess}
                    value={optionsProcess.find(
                      (opt) => opt.value === sheet?.technical_sheet_details?.[process.id]?.status,
                    )}
                    onChange={(selected) => updateProcessStatus(process, selected.value)}
                    isSearchable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={selectStylesWithPortal}
                  />
                ) : (
                  <div
                    className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer w-100"
                    onClick={() => {
                      if (
                        isLocked ||
                        sheet?.technical_sheet_details?.[process.id]?.status === 'Aprobado'
                      ) {
                        return
                      }
                      setEditingField(`process-${process.id}`)
                    }}
                  >
                    {sheet?.technical_sheet_details?.[process.id]?.status.toUpperCase() ||
                      'Seleccionar...'}
                  </div>
                )}
              </div>
              {getFieldErrors(`technical_sheet_details.${index}`).length > 0 && (
                <div style={{ position: 'relative' }}>
                  <span
                    style={{ cursor: 'pointer', color: '#ef4444' }}
                    onClick={() =>
                      setOpenPopover(
                        openPopover === `technical_sheet_details.${index}`
                          ? null
                          : `technical_sheet_details.${index}`,
                      )
                    }
                  >
                    <BadgeAlert size={16} />
                  </span>
                  <CPopover
                    visible={openPopover === `technical_sheet_details.${index}`}
                    placement="top"
                    onHide={() => setOpenPopover(null)}
                    title={
                      <div
                        className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                        style={{
                          color: '#991B1B',
                          fontSize: '0.85rem',
                          padding: '2px 0',
                        }}
                      >
                        <BadgeAlert size={15} className="text-danger" />
                        <span>Errores de validación</span>
                      </div>
                    }
                    content={
                      <div
                        className="font-inter custom-popover-error"
                        style={{
                          maxWidth: '260px',
                          fontSize: '0.82rem',
                        }}
                      >
                        {getFieldErrors(`technical_sheet_details.${index}`).map((err, i) => (
                          <div key={i} className="d-flex align-items-start gap-2 p-1 rounded-2">
                            <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                          </div>
                        ))}
                      </div>
                    }
                  >
                    <span
                      className="position-absolute"
                      style={{ transform: 'translateY(-10px)' }}
                    />
                  </CPopover>
                </div>
              )}
            </div>
          </td>
        )
      })}
      <td className={`table-cell ${getStatusClass(sheet?.status)} ${getErrorProcess('status')}`}>
        <div className="d-flex align-items-center gap-2 w-100">
          <div className="flex-grow-1">
            {editingField === 'status' ? (
              <Select
                ref={(el) => (inputRefs.current.status = el)}
                isDisabled={sheet?.status === 'Aprobado' || sheet?.status === 'En revisión'}
                options={
                  String(sheetId).startsWith('temp-')
                    ? optionsStatus
                    : sheet?.status === 'Cancelado'
                      ? []
                      : sheet?.status === 'Pendiente'
                        ? optionsStatus
                        : optionsStatus.filter((option) => option.value !== 'Pendiente')
                }
                value={optionsStatus.find((opt) => opt.value === sheet?.status)}
                onChange={(selected) => {
                  updateSheetField('status', selected.value)
                  setEditingField(null)
                }}
                onBlur={() => setEditingField(null)}
                isSearchable
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={selectStylesWithPortal}
              />
            ) : (
              <div
                className="table-input border-0 shadow-none px-2 py-2 font-inter cursor-pointer w-100"
                onClick={() => setEditingField('status')}
              >
                {sheet?.status.toUpperCase() || 'Seleccionar...'}
              </div>
            )}
          </div>
          {getFieldErrors('status').length > 0 && (
            <div style={{ position: 'relative' }}>
              <span
                style={{ cursor: 'pointer', color: '#ef4444' }}
                onClick={() => setOpenPopover(openPopover === 'status' ? null : 'status')}
              >
                <BadgeAlert size={16} />
              </span>
              <CPopover
                visible={openPopover === 'status'}
                placement="top"
                onHide={() => setOpenPopover(null)}
                title={
                  <div
                    className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                    style={{
                      color: '#991B1B',
                      fontSize: '0.85rem',
                      padding: '2px 0',
                    }}
                  >
                    <BadgeAlert size={15} className="text-danger" />
                    <span>Errores de validación</span>
                  </div>
                }
                content={
                  <div
                    className="font-inter custom-popover-error"
                    style={{
                      maxWidth: '260px',
                      fontSize: '0.82rem',
                    }}
                  >
                    {getFieldErrors('status').map((err, i) => (
                      <div key={i} className="d-flex align-items-start gap-2 p-1 rounded-2">
                        <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                      </div>
                    ))}
                  </div>
                }
              >
                <span className="position-absolute" style={{ transform: 'translateY(-10px)' }} />
              </CPopover>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

export default React.memo(ManagementCollectionTechnicalSheetRow)
