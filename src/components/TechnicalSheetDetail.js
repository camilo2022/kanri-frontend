import api from '../API/api'
import { getConfig } from '../axiosConfig'
import { useState } from 'react'
import {
  CButton,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CFormSwitch,
  CTooltip,
  CPopover,
  CModal,
  CModalHeader,
  CModalFooter,
  CModalTitle,
  CModalBody,
} from '@coreui/react'
import { useEffect } from 'react'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  RefreshCcw,
  BadgeAlert,
  AlertTriangle,
  Plus,
  RefreshCw,
} from 'lucide-react'
import LoadingForm from '@/components/LoadingForm'
import { useRef } from 'react'
import TableDinamicTechnicalSheet from '@/components/TableDinamicTechnicalSheet'
import TableStaticTechnicalSheet from '@/components/TableStaticTechnicalSheet'
import Swal from 'sweetalert2'
import isEqual from 'lodash.isequal'
import { Toast } from '@/components/Toast'
import Select from 'react-select'
import { tableSelectStyles } from '@/components/StyleManagementCollection'

export const TechnicalSheetDetail = ({
  product,
  technical_sheet = null,
  processes,
  errors,
  models,
  statusCollection,
  details,
  setDetails,
  dinamicValues,
  setDinamicValues,
  staticValues,
  setStaticValues,
  validated,
  catalogsData,
  dataGet,
  loadCatalog,
  process_edit = null,
}) => {
  const [editingField, setEditingField] = useState(null)
  const inputRefs = useRef({})
  const [openPopover, setOpenPopover] = useState({ process: null, type: null })
  const [changeStatus, setChangeStatus] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [selectedDetail, setSelectedDetail] = useState(null)

  const [selectedSubprocess, setSelectedSubprocess] = useState(null)
  const [addSubprocess, setAddSubprocess] = useState(false)
  const [subprocesses, setSubprocesses] = useState({})

  const [selectedOperation, setSelectedOperation] = useState(null)
  const [addOperation, setAddOperation] = useState(false)
  const [operations, setOperations] = useState({})

  useEffect(() => {
    const closePopover = () => setOpenPopover(null)
    document.addEventListener('click', closePopover)
    return () => {
      document.removeEventListener('click', closePopover)
    }
  }, [])

  const STATUS_CONFIG = {
    Aprobado: {
      label: 'Aprobado',
      className: 'tag-success',
      icon: <CheckCircle2 size={14} className="me-1" />,
    },
    'En revision': {
      label: 'En revision',
      className: 'tag-muted',
      icon: <Clock size={14} className="me-1" />,
    },
    Pendiente: {
      label: 'Pendiente',
      className: 'tag-warning',
      icon: <AlertCircle size={14} className="me-1" />,
    },
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

  const handleAddSubprocess = (subprocess) => {
    setDetails((prev) => ({
      ...prev,
      [subprocess.id]: {
        model_id: Number(subprocess.id),
        model_type: 'App\\Models\\Subprocess',
        technical_sheet_id: technical_sheet?.id,
        settings: {
          dinamic: {
            ...subprocess?.settings?.schema?.dinamic,
            insert_values: false,
            values: [],
          },
          static: {
            ...subprocess?.settings?.schema?.static,
            insert_values: false,
            values: {},
          },
        },
        status: 'Pendiente',
      },
    }))
    Toast.fire({
      icon: 'success',
      title: `Subproceso ${subprocess.name} añadido exitosamente.`,
    })

    setAddSubprocess(false)
    setSelectedSubprocess(null)
  }

  const handleAddOperation = (operation) => {
    setDetails((prev) => ({
      ...prev,
      [operation.id]: {
        model_id: Number(operation.id),
        model_type: 'App\\Models\\Operations',
        technical_sheet_id: technical_sheet?.id,
        settings: {
          static: {
            ...operation?.settings?.schema?.static,
            insert_values: false,
            values: {},
          },
        },
        status: 'Pendiente',
      },
    }))

    Toast.fire({
      icon: 'success',
      title: `Operación añadida exitosamente.`,
    })

    setAddOperation(false)
    setSelectedOperation(null)
  }

  const handleChangeStructure = async (process_id, type) => {
    Swal.fire({
      title: 'Actualizar tabla',
      html: `<div style="font-size:14px">
        La estructura de la ficha técnica será actualizada según la configuración actual.<br/><br/>
        <strong>Advertencia:</strong> Esta acción es irreversible y puede modificar o eliminar información asociada a la estructura actual. Una vez guardados los cambios, no será posible volver a la versión anterior.<br/><br/>
        <strong>¿Deseas continuar?</strong>
      </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, continuar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setDetails((prev) => {
            const aux = prev[process_id].settings?.[type]
            const original = processes[process_id]?.settings?.schema?.[type]

            return {
              ...prev,
              [process_id]: {
                ...prev[process_id],
                settings: {
                  ...prev[process_id]?.settings,
                  [type]: {
                    body: original?.body,
                    header: original?.header,
                    values: aux?.values,
                    insert_values: aux?.insert_values,
                  },
                },
              },
            }
          })
          Toast.fire({
            icon: 'success',
            title: 'Estructura actualizada',
          })
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

  const handleChangeStructureSubprocess = async (process_id, subprocess_id, type) => {
    Swal.fire({
      title: 'Actualizar tabla',
      html: `<div style="font-size:14px">
        La estructura de la ficha técnica será actualizada según la configuración actual.<br/><br/>
        <strong>Advertencia:</strong> Esta acción es irreversible y puede modificar o eliminar información asociada a la estructura actual. Una vez guardados los cambios, no será posible volver a la versión anterior.<br/><br/>
        <strong>¿Deseas continuar?</strong>
      </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, continuar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setDetails((prev) => {
            const aux = prev[subprocess_id].settings?.[type]
            const original =
              processes[process_id].subprocesses[subprocess_id]?.settings?.schema?.[type]

            return {
              ...prev,
              [subprocess_id]: {
                ...prev[subprocess_id],
                settings: {
                  ...prev[subprocess_id]?.settings,
                  [type]: {
                    body: original?.body,
                    header: original?.header,
                    values: aux?.values,
                    insert_values: aux?.insert_values,
                  },
                },
              },
            }
          })
          Toast.fire({
            icon: 'success',
            title: 'Estructura actualizada',
          })
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

  const handleChangeStructureOperation = async (process_id, subprocess_id, operation_id, type) => {
    Swal.fire({
      title: 'Actualizar tabla',
      html: `<div style="font-size:14px">
        La estructura de la ficha técnica será actualizada según la configuración actual.<br/><br/>
        <strong>Advertencia:</strong> Esta acción es irreversible y puede modificar o eliminar información asociada a la estructura actual. Una vez guardados los cambios, no será posible volver a la versión anterior.<br/><br/>
        <strong>¿Deseas continuar?</strong>
      </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, continuar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setDetails((prev) => {
            const aux = prev[operation_id].settings?.[type]
            const original =
              processes[process_id].subprocesses[subprocess_id]?.operations[operation_id]?.settings
                ?.schema?.[type]

            return {
              ...prev,
              [operation_id]: {
                ...prev[operation_id],
                settings: {
                  ...prev[operation_id]?.settings,
                  [type]: {
                    body: original?.body,
                    header: original?.header,
                    values: aux?.values,
                    insert_values: aux?.insert_values,
                  },
                },
              },
            }
          })
          Toast.fire({
            icon: 'success',
            title: 'Estructura actualizada',
          })
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

  const handleChangeStatus = async (id, status) => {
    try {
      setDetails((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          status: status,
        },
      }))

      setChangeStatus(false)
      setSelectedDetail(null)
      setSelectedStatus(null)

      Toast.fire({
        icon: 'success',
        title: 'Estructura actualizada',
      })
    } catch (error) {
      setValidated(true)
    }
  }

  const hasProcessErrors = (process) => {
    const errorKeys = Object.keys(errors || {})

    if (errorKeys.length === 0) return false

    if (errorKeys.some((key) => key.startsWith(`technical_sheet_details.${process.id}`))) {
      return true
    }
    return (Object.values(process.subprocesses) || []).some((subprocess) => {
      if (errorKeys.some((key) => key.startsWith(`technical_sheet_details.${subprocess.id}`))) {
        return true
      }
      return (Object.values(subprocess.operations) || []).some((operation) =>
        errorKeys.some((key) => key.startsWith(`technical_sheet_details.${operation.id}`)),
      )
    })
  }

  const hasSubprocessErrors = (subprocess) => {
    const errorKeys = Object.keys(errors || {})

    if (errorKeys.length === 0) return false

    if (errorKeys.some((key) => key.startsWith(`technical_sheet_details.${subprocess.id}`))) {
      return true
    }

    return (Object.values(subprocess.operations) || []).some((operation) => {
      if (errorKeys.some((key) => key.startsWith(`technical_sheet_details.${operation.id}`))) {
        return true
      }
    })
  }

  return (
    <>
      <div className="mb-4 p-4">
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              flex: 0.02,
              height: '2px',
              backgroundColor: '#e9ecef',
            }}
          />
          <h5 className="mb-0 fw-bold font-montserrat">Procesos</h5>
          <div
            style={{
              flex: 1,
              height: '2px',
              backgroundColor: '#e9ecef',
            }}
          />
        </div>

        <p className="text-muted mt-2 mb-3 font-poppins" style={{ fontSize: '13px' }}>
          Configure los procesos requeridos para la elaboración de esta ficha técnica.
        </p>

        <CAccordion alwaysOpen className="process-accordion" flush>
          {!!processes &&
            Object.values(processes)
              .filter((process) => {
                if (process_edit?.id) {
                  return process.id === process_edit.id
                }
                return true
              })
              .map((process) => {
                const status =
                  STATUS_CONFIG[details?.[process.id]?.status] || STATUS_CONFIG['Pendiente']

                const equalDinamic = isEqual(
                  {
                    header: process?.settings?.schema?.dinamic?.header,
                    body: process?.settings?.schema?.dinamic?.body,
                  },
                  {
                    header: details?.[process?.id]?.settings?.dinamic?.header,
                    body: details?.[process?.id]?.settings?.dinamic?.body,
                  },
                )

                const equalStatic = isEqual(
                  {
                    header: process?.settings?.schema?.static?.header,
                    body: process?.settings?.schema?.static?.body,
                  },
                  {
                    header: details?.[process?.id]?.settings?.static?.header,
                    body: details?.[process?.id]?.settings?.static?.body,
                  },
                )

                const dynamicErrorPrefixProcess = `technical_sheet_details.${process.id}.settings.dinamic.values`
                const dynamicGeneralErrorProcess = errors?.[dynamicErrorPrefixProcess]
                const hasDynamicRecordErrorsProcess = Object.keys(errors || {}).some((key) =>
                  key.startsWith(`${dynamicErrorPrefixProcess}.`),
                )
                const hasDynamicErrorsProcess =
                  !!dynamicGeneralErrorProcess || hasDynamicRecordErrorsProcess

                const staticErrorPrefixProcess = `technical_sheet_details.${process.id}.settings.static.values`
                const staticGeneralErrorProcess = errors?.[staticErrorPrefixProcess]
                const hasStaticRecordErrorsProcess = Object.keys(errors || {}).some((key) =>
                  key.startsWith(`${staticErrorPrefixProcess}.`),
                )
                const hasStaticErrorsProcess =
                  !!staticGeneralErrorProcess || hasStaticRecordErrorsProcess

                return (
                  <CAccordionItem
                    key={process.id}
                    itemKey={`process-${process.id}`}
                    className="process-accordion-item mb-3"
                  >
                    <CAccordionHeader className="font-inter">
                      <div className="d-flex align-items-center justify-content-between w-100 pe-3">
                        <span className="process-title">
                          <strong>{process.name}</strong>
                        </span>
                        <div className="d-flex align-items-center gap-2">
                          {hasProcessErrors(process) && (
                            <span className="process-tag tag-error animate-pulse-subtle">
                              <AlertTriangle size={14} className="me-1" /> Errores
                            </span>
                          )}
                          <span
                            className={`process-tag ${status.className}`}
                            onClick={(e) => {
                              e.stopPropagation()

                              setChangeStatus(true)
                              setSelectedStatus(status.label)
                              setSelectedDetail(process.id)
                            }}
                          >
                            {status.icon} {status.label}
                          </span>
                        </div>
                      </div>
                    </CAccordionHeader>
                    <CAccordionBody className="font-inter ps-4 pe-3 pb-3">
                      <div
                        className={`mb-5 shadow-sm border-start border-4 rounded-end ${
                          hasDynamicErrorsProcess ? 'header-switch-container-error-border' : ''
                        }`}
                        style={{ borderLeftColor: '#C21111', backgroundColor: '#fcfcfc' }}
                      >
                        <div
                          className={`p-3 d-flex align-items-center justify-content-between border-bottom bg-white rounded-top header-switch-container ${
                            hasDynamicErrorsProcess ? 'header-switch-container-error' : ''
                          }`}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <Layers size={18} className="text-muted" />
                            <span className="fw-semibold font-poppins text-dark">
                              Tabla Dinámica
                            </span>
                            {hasDynamicErrorsProcess && (
                              <CPopover
                                visible={
                                  openPopover?.process === process.id &&
                                  openPopover?.type === 'dynamic'
                                }
                                placement="top"
                                onHide={() => setOpenPopover(null)}
                                trigger="focus"
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
                                      maxWidth: '280px',
                                      fontSize: '0.82rem',
                                    }}
                                  >
                                    {dynamicGeneralErrorProcess ? (
                                      dynamicGeneralErrorProcess.map((err, i) => (
                                        <div
                                          key={i}
                                          className="d-flex align-items-start gap-2 p-1 rounded-2"
                                        >
                                          <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                                        </div>
                                      ))
                                    ) : hasDynamicRecordErrorsProcess ? (
                                      <div className="p-1">
                                        Hay errores de validación en los registros de la tabla.
                                      </div>
                                    ) : null}
                                  </div>
                                }
                              >
                                <span
                                  style={{
                                    cursor: 'pointer',
                                    color: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenPopover((prev) => {
                                      if (
                                        prev?.process === process.id &&
                                        prev?.type === 'dynamic'
                                      ) {
                                        return null
                                      }

                                      return {
                                        process: process.id,
                                        type: 'dynamic',
                                      }
                                    })
                                  }}
                                >
                                  <BadgeAlert size={16} />
                                </span>
                              </CPopover>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center gap-2">
                              <span className="text-muted small font-inter">
                                ¿Esta tabla va a recibir información?
                              </span>
                              <CFormSwitch
                                id={`switch-ingreso-datos-${process.id}`}
                                className="custom-corporate-switch"
                                checked={
                                  details?.[process?.id]?.settings?.dinamic?.insert_values || false
                                }
                                disabled={details?.[process.id]?.status === 'Pendiente'}
                                onChange={(e) =>
                                  setDetails((prev) => ({
                                    ...prev,
                                    [process.id]: {
                                      ...prev[process.id],
                                      settings: {
                                        ...prev[process.id].settings,
                                        dinamic: {
                                          ...prev[process.id].settings.dinamic,
                                          insert_values: e.target.checked,
                                        },
                                      },
                                    },
                                  }))
                                }
                                disabled={
                                  (!details?.[process?.id]?.settings?.dinamic?.body?.length &&
                                    !details?.[process?.id]?.settings?.dinamic?.header?.length) ||
                                  details?.[process.id]?.status === 'Pendiente'
                                }
                              />
                            </div>
                            {technical_sheet && (
                              <>
                                <div
                                  className="border-start"
                                  style={{ height: '20px', borderColor: '#e2e8f0' }}
                                ></div>
                                {!equalDinamic ? (
                                  <CTooltip
                                    className="tooltip-technical_sheet font-inter"
                                    content="Existe una versión más reciente de la estructura."
                                    placement="top"
                                  >
                                    <span>
                                      <CButton
                                        type="button"
                                        className="btn-update-structure font-inter d-flex align-items-center gap-2"
                                        onClick={() => handleChangeStructure(process.id, 'dinamic')}
                                        disabled={
                                          equalDinamic ||
                                          details?.[process.id]?.status === 'Pendiente'
                                        }
                                      >
                                        <RefreshCcw size={15} className="icon-load" />
                                        <span className="small fw-semibold">
                                          Actualizar estructura
                                        </span>
                                      </CButton>
                                    </span>
                                  </CTooltip>
                                ) : (
                                  <span>
                                    <CButton
                                      type="button"
                                      className="btn-update-structure font-inter d-flex align-items-center gap-2"
                                      onClick={() =>
                                        console.log('Actualizando estructura de:', process.id)
                                      }
                                      disabled={
                                        equalDinamic ||
                                        details?.[process.id]?.status === 'Pendiente'
                                      }
                                    >
                                      <RefreshCcw size={15} className="icon-load" />
                                      <span className="small fw-semibold">
                                        Actualizar estructura
                                      </span>
                                    </CButton>
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="p-3">
                          <TableDinamicTechnicalSheet
                            process_id={process.id}
                            structure={
                              details?.[process.id]?.settings?.dinamic ||
                              processes[process.id]?.settings?.schema?.dinamic
                            }
                            values={dinamicValues[process.id]}
                            catalogsData={catalogsData}
                            models={models}
                            dataGet={dataGet}
                            status={details?.[process?.id]?.settings?.dinamic?.insert_values}
                            setDinamicValues={setDinamicValues}
                            errors={Object.fromEntries(
                              Object.entries(errors || {}).filter(([key]) =>
                                key.startsWith(
                                  `technical_sheet_details.${process?.id}.settings.dinamic`,
                                ),
                              ),
                            )}
                            validated={validated}
                            setDetails={setDetails}
                            loadCatalog={loadCatalog}
                          />
                        </div>
                      </div>
                      <div
                        className={`mb-2 shadow-sm border-start border-4 rounded-end ${
                          hasStaticErrorsProcess ? 'header-switch-container-error-border' : ''
                        }`}
                        style={{ borderLeftColor: '#C21111', backgroundColor: '#fcfcfc' }}
                      >
                        <div
                          className={`p-3 d-flex align-items-center justify-content-between border-bottom bg-white rounded-top header-switch-container ${
                            hasStaticErrorsProcess ? 'header-switch-container-error' : ''
                          }`}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <Layers size={18} className="text-muted" />
                            <span className="fw-semibold font-poppins text-dark">
                              Tabla Estatica
                            </span>
                            {hasStaticErrorsProcess && (
                              <CPopover
                                visible={
                                  openPopover?.process === process.id &&
                                  openPopover?.type === 'static'
                                }
                                placement="top"
                                onHide={() => setOpenPopover(null)}
                                trigger="focus"
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
                                    style={{ maxWidth: '260px', fontSize: '0.82rem' }}
                                  >
                                    {staticGeneralErrorProcess ? (
                                      staticGeneralErrorProcess.map((err, i) => (
                                        <div
                                          key={i}
                                          className="d-flex align-items-start gap-2 p-1 rounded-2"
                                        >
                                          <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                                        </div>
                                      ))
                                    ) : hasStaticRecordErrorsProcess ? (
                                      <div className="p-1">
                                        Hay errores de validación en los registros de la tabla.
                                      </div>
                                    ) : null}
                                  </div>
                                }
                              >
                                <span
                                  style={{
                                    cursor: 'pointer',
                                    color: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenPopover((prev) => {
                                      if (prev?.process === process.id && prev?.type === 'static') {
                                        return null
                                      }
                                      return { process: process.id, type: 'static' }
                                    })
                                  }}
                                >
                                  <BadgeAlert size={16} />
                                </span>
                              </CPopover>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center gap-2">
                              <span className="text-muted small font-inter">
                                ¿Esta tabla va a recibir información?
                              </span>
                              <CFormSwitch
                                id={`switch-ingreso-datos-${process.id}`}
                                className="custom-corporate-switch"
                                checked={
                                  details?.[process?.id]?.settings?.static?.insert_values || false
                                }
                                onChange={(e) =>
                                  setDetails((prev) => ({
                                    ...prev,
                                    [process.id]: {
                                      ...prev[process.id],
                                      settings: {
                                        ...prev[process.id].settings,
                                        static: {
                                          ...prev[process.id].settings.static,
                                          insert_values: e.target.checked,
                                        },
                                      },
                                    },
                                  }))
                                }
                                disabled={
                                  (!details?.[process?.id]?.settings?.static?.body?.length &&
                                    !details?.[process?.id]?.settings?.static?.header?.length) ||
                                  details?.[process.id]?.status === 'Pendiente'
                                }
                              />
                            </div>
                            {technical_sheet && (
                              <>
                                <div
                                  className="border-start"
                                  style={{ height: '20px', borderColor: '#e2e8f0' }}
                                ></div>
                                {!equalStatic ? (
                                  <CTooltip
                                    className="tooltip-technical_sheet font-inter"
                                    content="Existe una versión más reciente de la estructura."
                                    placement="top"
                                  >
                                    <span>
                                      <CButton
                                        type="button"
                                        className="btn-update-structure font-inter d-flex align-items-center gap-2"
                                        onClick={() => handleChangeStructure(process.id, 'static')}
                                        disabled={
                                          equalStatic ||
                                          details?.[process.id]?.status === 'Pendiente'
                                        }
                                      >
                                        <RefreshCcw size={15} className="icon-load" />
                                        <span className="small fw-semibold">
                                          Actualizar estructura
                                        </span>
                                      </CButton>
                                    </span>
                                  </CTooltip>
                                ) : (
                                  <span>
                                    <CButton
                                      type="button"
                                      className="btn-update-structure font-inter d-flex align-items-center gap-2"
                                      onClick={() =>
                                        console.log('Actualizando estructura de:', process.id)
                                      }
                                      disabled={
                                        equalStatic || details?.[process.id]?.status === 'Pendiente'
                                      }
                                    >
                                      <RefreshCcw size={15} className="icon-load" />
                                      <span className="small fw-semibold">
                                        Actualizar estructura
                                      </span>
                                    </CButton>
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="p-3">
                          <TableStaticTechnicalSheet
                            process_id={process.id}
                            structure={
                              details?.[process.id]?.settings?.static ||
                              processes[process.id]?.settings?.schema?.static
                            }
                            values={staticValues[process.id]}
                            catalogsData={catalogsData}
                            models={models}
                            dataGet={dataGet}
                            status={details?.[process?.id]?.settings?.static?.insert_values}
                            setStaticValues={setStaticValues}
                            errors={Object.fromEntries(
                              Object.entries(errors || {}).filter(([key]) =>
                                key.startsWith(
                                  `technical_sheet_details.${process?.id}.settings.static`,
                                ),
                              ),
                            )}
                            validated={validated}
                          />
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-3 p-3">
                        <h5 className="mb-0 fw-bold font-montserrat">Subprocesos</h5>
                        <div
                          style={{
                            flex: 1,
                            height: '2px',
                            backgroundColor: '#e9ecef',
                          }}
                        />
                        <div className="d-flex align-items-center gap-2">
                          <CButton
                            color="primary"
                            size="sm"
                            className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                            onClick={() => {
                              setSubprocesses(process.subprocesses || {})
                              setAddSubprocess(true)
                            }}
                            disabled={details?.[process.id]?.status === 'Pendiente'}
                          >
                            <Plus size={16} /> Agregar Subproceso
                          </CButton>
                        </div>
                      </div>
                      <div className="subprocess-wrapper">
                        {Object.values(process.subprocesses || {}).filter((subprocess) =>
                          Object.keys(details).includes(String(subprocess.id)),
                        ).length > 0 ? (
                          <CAccordion alwaysOpen flush>
                            {Object.values(process.subprocesses || {})
                              .filter((subprocess) =>
                                Object.keys(details).includes(String(subprocess.id)),
                              )
                              .map((subprocess) => {
                                const equalDinamicSubprocess = isEqual(
                                  {
                                    header: subprocess?.settings?.schema?.dinamic?.header,
                                    body: subprocess?.settings?.schema?.dinamic?.body,
                                  },
                                  {
                                    header: details?.[subprocess.id]?.settings?.dinamic?.header,
                                    body: details?.[subprocess.id]?.settings?.dinamic?.body,
                                  },
                                )

                                const equalStaticSubprocess = isEqual(
                                  {
                                    header: subprocess?.settings?.schema?.static?.header,
                                    body: subprocess?.settings?.schema?.static?.body,
                                  },
                                  {
                                    header: details?.[subprocess.id]?.settings?.static?.header,
                                    body: details?.[subprocess.id]?.settings?.static?.body,
                                  },
                                )

                                const subStatus =
                                  STATUS_CONFIG[details?.[subprocess.id]?.status] ||
                                  STATUS_CONFIG['Pendiente']

                                const dynamicErrorPrefixSubprocess = `technical_sheet_details.${subprocess.id}.settings.dinamic.values`
                                const dynamicGeneralErrorSubprocess =
                                  errors?.[dynamicErrorPrefixSubprocess]
                                const hasDynamicRecordErrorsSubprocess = Object.keys(
                                  errors || {},
                                ).some((key) => key.startsWith(`${dynamicErrorPrefixSubprocess}.`))
                                const hasDynamicErrorsSubprocess =
                                  !!dynamicGeneralErrorSubprocess ||
                                  hasDynamicRecordErrorsSubprocess

                                const staticErrorPrefixSubprocess = `technical_sheet_details.${subprocess.id}.settings.static.values`
                                const staticGeneralErrorSubprocess =
                                  errors?.[staticErrorPrefixSubprocess]
                                const hasStaticRecordErrorsSubprocess = Object.keys(
                                  errors || {},
                                ).some((key) => key.startsWith(`${staticErrorPrefixSubprocess}.`))
                                const hasStaticErrorsSubprocess =
                                  !!staticGeneralErrorSubprocess || hasStaticRecordErrorsSubprocess

                                return (
                                  <CAccordionItem
                                    key={subprocess.id}
                                    itemKey={`subprocess-${subprocess.id}`}
                                    className="subprocess-accordion-item"
                                  >
                                    <CAccordionHeader className="font-inter">
                                      <div className="d-flex align-items-center justify-content-between w-100 pe-3">
                                        <span className="subprocess-title">{subprocess.name}</span>
                                        <div className="d-flex align-items-center gap-2">
                                          {hasSubprocessErrors(subprocess) && (
                                            <span className="process-tag tag-error animate-pulse-subtle">
                                              <AlertTriangle size={14} className="me-1" /> Errores
                                            </span>
                                          )}
                                          <span
                                            className={`process-tag tag-sm ${subStatus.className}`}
                                            onClick={(e) => {
                                              e.stopPropagation()

                                              setChangeStatus(true)
                                              setSelectedStatus(status.label)
                                              setSelectedDetail(subprocess.id)
                                            }}
                                          >
                                            {subStatus.icon} {subStatus.label}
                                          </span>
                                        </div>
                                      </div>
                                    </CAccordionHeader>
                                    <CAccordionBody className="font-inter ps-4 pe-3 pb-3">
                                      <div
                                        className={`mb-5 shadow-sm border-start border-4 rounded-end ${
                                          hasDynamicErrorsSubprocess
                                            ? 'header-switch-container-error-border'
                                            : ''
                                        }`}
                                        style={{
                                          borderLeftColor: '#C21111',
                                          backgroundColor: '#fcfcfc',
                                        }}
                                      >
                                        <div
                                          className={`p-3 d-flex align-items-center justify-content-between border-bottom bg-white rounded-top header-switch-container ${
                                            hasDynamicErrorsSubprocess
                                              ? 'header-switch-container-error'
                                              : ''
                                          }`}
                                        >
                                          <div className="d-flex align-items-center gap-2">
                                            <Layers size={18} className="text-muted" />
                                            <span className="fw-semibold font-poppins text-dark">
                                              Tabla Dinámica
                                            </span>
                                            {hasDynamicErrorsSubprocess && (
                                              <CPopover
                                                visible={
                                                  openPopover?.process === subprocess.id &&
                                                  openPopover?.type === 'dynamic'
                                                }
                                                placement="top"
                                                onHide={() => setOpenPopover(null)}
                                                trigger="focus"
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
                                                    {dynamicGeneralErrorSubprocess ? (
                                                      dynamicGeneralErrorSubprocess.map(
                                                        (err, i) => (
                                                          <div
                                                            key={i}
                                                            className="d-flex align-items-start gap-2 p-1 rounded-2"
                                                          >
                                                            <span
                                                              style={{ whiteSpace: 'pre-line' }}
                                                            >
                                                              {err}
                                                            </span>
                                                          </div>
                                                        ),
                                                      )
                                                    ) : hasDynamicRecordErrorsSubprocess ? (
                                                      <div className="p-1">
                                                        Hay errores de validación en los registros
                                                        de la tabla.
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                }
                                              >
                                                <span
                                                  style={{
                                                    cursor: 'pointer',
                                                    color: '#ef4444',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                  }}
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    setOpenPopover((prev) => {
                                                      if (
                                                        prev?.process === subprocess.id &&
                                                        prev?.type === 'dynamic'
                                                      ) {
                                                        return null
                                                      }
                                                      return {
                                                        process: subprocess.id,
                                                        type: 'dynamic',
                                                      }
                                                    })
                                                  }}
                                                >
                                                  <BadgeAlert size={16} />
                                                </span>
                                              </CPopover>
                                            )}
                                          </div>
                                          <div className="d-flex align-items-center gap-3">
                                            <div className="d-flex align-items-center gap-2">
                                              <span className="text-muted small font-inter">
                                                ¿Esta tabla va a recibir información?
                                              </span>
                                              <CFormSwitch
                                                id={`switch-ingreso-datos-${subprocess.id}`}
                                                className="custom-corporate-switch"
                                                checked={
                                                  details?.[subprocess?.id]?.settings?.dinamic
                                                    ?.insert_values || false
                                                }
                                                onChange={(e) =>
                                                  setDetails((prev) => ({
                                                    ...prev,
                                                    [subprocess.id]: {
                                                      ...prev[subprocess.id],
                                                      settings: {
                                                        ...prev[subprocess.id].settings,
                                                        dinamic: {
                                                          ...prev[subprocess.id].settings.dinamic,
                                                          insert_values: e.target.checked,
                                                        },
                                                      },
                                                    },
                                                  }))
                                                }
                                                disabled={
                                                  !details?.[subprocess?.id]?.settings?.dinamic
                                                    ?.body?.length &&
                                                  !details?.[subprocess?.id]?.settings?.dinamic
                                                    ?.header?.length
                                                }
                                              />
                                            </div>
                                            {technical_sheet && (
                                              <>
                                                <div
                                                  className="border-start"
                                                  style={{ height: '20px', borderColor: '#e2e8f0' }}
                                                ></div>
                                                {!equalDinamic ? (
                                                  <CTooltip
                                                    className="tooltip-technical_sheet font-inter"
                                                    content="Existe una versión más reciente de la estructura."
                                                    placement="top"
                                                  >
                                                    <span>
                                                      <CButton
                                                        type="button"
                                                        className="btn-update-structure font-inter d-flex align-items-center gap-2"
                                                        onClick={() =>
                                                          handleChangeStructure(
                                                            subprocess.id,
                                                            'dinamic',
                                                          )
                                                        }
                                                        disabled={equalDinamic}
                                                      >
                                                        <RefreshCcw
                                                          size={15}
                                                          className="icon-load"
                                                        />
                                                        <span className="small fw-semibold">
                                                          Actualizar estructura
                                                        </span>
                                                      </CButton>
                                                    </span>
                                                  </CTooltip>
                                                ) : (
                                                  <span>
                                                    <CButton
                                                      type="button"
                                                      className="btn-update-structure font-inter d-flex align-items-center gap-2"
                                                      onClick={() => {}}
                                                      disabled={equalDinamic}
                                                    >
                                                      <RefreshCcw size={15} className="icon-load" />
                                                      <span className="small fw-semibold">
                                                        Actualizar estructura
                                                      </span>
                                                    </CButton>
                                                  </span>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        <div className="p-3">
                                          <TableDinamicTechnicalSheet
                                            process_id={subprocess.id}
                                            structure={
                                              details?.[subprocess.id]?.settings?.dinamic ||
                                              processes[process.id]?.subprocesses[subprocess.id]
                                                ?.settings?.schema?.dinamic
                                            }
                                            values={dinamicValues[subprocess.id]}
                                            catalogsData={catalogsData}
                                            models={models}
                                            dataGet={dataGet}
                                            status={
                                              details?.[subprocess?.id]?.settings?.dinamic
                                                ?.insert_values
                                            }
                                            setDinamicValues={setDinamicValues}
                                            errors={Object.fromEntries(
                                              Object.entries(errors || {}).filter(([key]) =>
                                                key.startsWith(
                                                  `technical_sheet_details.${subprocess?.id}.settings.dinamic`,
                                                ),
                                              ),
                                            )}
                                            validated={validated}
                                            setDetails={setDetails}
                                            loadCatalog={loadCatalog}
                                          />
                                        </div>
                                      </div>
                                      <div
                                        className={`mb-2 shadow-sm border-start border-4 rounded-end ${
                                          hasStaticErrorsSubprocess
                                            ? 'header-switch-container-error-border'
                                            : ''
                                        }`}
                                        style={{
                                          borderLeftColor: '#C21111',
                                          backgroundColor: '#fcfcfc',
                                        }}
                                      >
                                        <div
                                          className={`p-3 d-flex align-items-center justify-content-between border-bottom bg-white rounded-top header-switch-container ${
                                            hasStaticErrorsSubprocess
                                              ? 'header-switch-container-error'
                                              : ''
                                          }`}
                                        >
                                          <div className="d-flex align-items-center gap-2">
                                            <Layers size={18} className="text-muted" />
                                            <span className="fw-semibold font-poppins text-dark">
                                              Tabla Estatica
                                            </span>
                                            {hasStaticErrorsSubprocess && (
                                              <CPopover
                                                visible={
                                                  openPopover?.process === subprocess.id &&
                                                  openPopover?.type === 'static'
                                                }
                                                placement="top"
                                                onHide={() => setOpenPopover(null)}
                                                trigger="focus"
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
                                                    {errors?.[
                                                      `technical_sheet_details.${subprocess.id}.settings.static.values`
                                                    ].map((err, i) => (
                                                      <div
                                                        key={i}
                                                        className="d-flex align-items-start gap-2 p-1 rounded-2"
                                                      >
                                                        <span style={{ whiteSpace: 'pre-line' }}>
                                                          {err}
                                                        </span>
                                                      </div>
                                                    ))}
                                                    {staticGeneralErrorSubprocess ? (
                                                      staticGeneralErrorSubprocess.map((err, i) => (
                                                        <div
                                                          key={i}
                                                          className="d-flex align-items-start gap-2 p-1 rounded-2"
                                                        >
                                                          <span style={{ whiteSpace: 'pre-line' }}>
                                                            {err}
                                                          </span>
                                                        </div>
                                                      ))
                                                    ) : hasStaticRecordErrorsSubprocess ? (
                                                      <div className="p-1">
                                                        Hay errores de validación en los registros
                                                        de la tabla.
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                }
                                              >
                                                <span
                                                  style={{
                                                    cursor: 'pointer',
                                                    color: '#ef4444',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                  }}
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    setOpenPopover((prev) => {
                                                      if (
                                                        prev?.process === subprocess.id &&
                                                        prev?.type === 'static'
                                                      ) {
                                                        return null
                                                      }
                                                      return {
                                                        process: subprocess.id,
                                                        type: 'static',
                                                      }
                                                    })
                                                  }}
                                                >
                                                  <BadgeAlert size={16} />
                                                </span>
                                              </CPopover>
                                            )}
                                          </div>
                                          <div className="d-flex align-items-center gap-3">
                                            <div className="d-flex align-items-center gap-2">
                                              <span className="text-muted small font-inter">
                                                ¿Esta tabla va a recibir información?
                                              </span>
                                              <CFormSwitch
                                                id={`switch-ingreso-datos-${subprocess.id}`}
                                                className="custom-corporate-switch"
                                                checked={
                                                  details?.[subprocess?.id]?.settings?.static
                                                    ?.insert_values || false
                                                }
                                                onChange={(e) =>
                                                  setDetails((prev) => ({
                                                    ...prev,
                                                    [subprocess.id]: {
                                                      ...prev[subprocess.id],
                                                      settings: {
                                                        ...prev[subprocess.id].settings,
                                                        static: {
                                                          ...prev[subprocess.id].settings.static,
                                                          insert_values: e.target.checked,
                                                        },
                                                      },
                                                    },
                                                  }))
                                                }
                                                disabled={
                                                  !details?.[subprocess?.id]?.settings?.static?.body
                                                    ?.length &&
                                                  !details?.[subprocess?.id]?.settings?.static
                                                    ?.header?.length
                                                }
                                              />
                                            </div>
                                            {technical_sheet && (
                                              <>
                                                <div
                                                  className="border-start"
                                                  style={{ height: '20px', borderColor: '#e2e8f0' }}
                                                ></div>
                                                {!equalStaticSubprocess ? (
                                                  <CTooltip
                                                    className="tooltip-technical_sheet font-inter"
                                                    content="Existe una versión más reciente de la estructura."
                                                    placement="top"
                                                  >
                                                    <span>
                                                      <CButton
                                                        type="button"
                                                        className="btn-update-structure font-inter d-flex align-items-center gap-2"
                                                        onClick={() =>
                                                          handleChangeStructureSubprocess(
                                                            process.id,
                                                            subprocess.id,
                                                            'static',
                                                          )
                                                        }
                                                        disabled={equalStaticSubprocess}
                                                      >
                                                        <RefreshCcw
                                                          size={15}
                                                          className="icon-load"
                                                        />
                                                        <span className="small fw-semibold">
                                                          Actualizar estructura
                                                        </span>
                                                      </CButton>
                                                    </span>
                                                  </CTooltip>
                                                ) : (
                                                  <span>
                                                    <CButton
                                                      type="button"
                                                      className="btn-update-structure font-inter d-flex align-items-center gap-2"
                                                      onClick={() =>
                                                        console.log(
                                                          'Actualizando estructura de:',
                                                          subprocess.id,
                                                        )
                                                      }
                                                      disabled={equalStaticSubprocess}
                                                    >
                                                      <RefreshCcw size={15} className="icon-load" />
                                                      <span className="small fw-semibold">
                                                        Actualizar estructura
                                                      </span>
                                                    </CButton>
                                                  </span>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        <div className="p-3">
                                          <TableStaticTechnicalSheet
                                            process_id={subprocess.id}
                                            structure={
                                              details?.[subprocess.id]?.settings?.static ||
                                              processes[process.id]?.subprocesses[subprocess.id]
                                                ?.settings?.schema?.static
                                            }
                                            values={staticValues[subprocess.id]}
                                            catalogsData={catalogsData}
                                            models={models}
                                            dataGet={dataGet}
                                            status={
                                              details?.[subprocess?.id]?.settings?.static
                                                ?.insert_values
                                            }
                                            setStaticValues={setStaticValues}
                                            errors={Object.fromEntries(
                                              Object.entries(errors || {}).filter(([key]) =>
                                                key.startsWith(
                                                  `technical_sheet_details.${subprocess?.id}.settings.static`,
                                                ),
                                              ),
                                            )}
                                            validated={validated}
                                          />
                                        </div>
                                      </div>
                                      <div className="d-flex align-items-center gap-3 p-3">
                                        <h5 className="mb-0 fw-bold font-montserrat">
                                          Operaciones
                                        </h5>
                                        <div
                                          style={{
                                            flex: 1,
                                            height: '2px',
                                            backgroundColor: '#e9ecef',
                                          }}
                                        />
                                        <div className="d-flex align-items-center gap-2">
                                          <CButton
                                            color="primary"
                                            size="sm"
                                            className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                                            onClick={() => {
                                              setOperations(subprocess.operations || {})
                                              setAddOperation(true)
                                            }}
                                          >
                                            <Plus size={16} /> Agregar Operaciones
                                          </CButton>
                                        </div>
                                      </div>
                                      <div className="subprocess-wrapper">
                                        {Object.values(subprocess.operations || {}).filter(
                                          (operation) =>
                                            Object.keys(details).includes(String(operation.id)),
                                        ).length > 0 ? (
                                          <CAccordion alwaysOpen flush>
                                            {Object.values(subprocess.operations || {})
                                              .filter((operation) =>
                                                Object.keys(details).includes(String(operation.id)),
                                              )
                                              .map((operation) => {
                                                const equalDinamicOperation = isEqual(
                                                  {
                                                    header:
                                                      operation?.settings?.schema?.dinamic?.header,
                                                    body: operation?.settings?.schema?.dinamic
                                                      ?.body,
                                                  },
                                                  {
                                                    header:
                                                      details?.[operation.id]?.settings?.dinamic
                                                        ?.header,
                                                    body: details?.[operation.id]?.settings?.dinamic
                                                      ?.body,
                                                  },
                                                )

                                                const equalStaticOperation = isEqual(
                                                  {
                                                    header:
                                                      operation?.settings?.schema?.static?.header,
                                                    body: operation?.settings?.schema?.static?.body,
                                                  },
                                                  {
                                                    header:
                                                      details?.[operation.id]?.settings?.static
                                                        ?.header,
                                                    body: details?.[operation.id]?.settings?.static
                                                      ?.body,
                                                  },
                                                )

                                                const subStatus =
                                                  STATUS_CONFIG[details?.[operation.id]?.status] ||
                                                  STATUS_CONFIG['Pendiente']

                                                const has_errors_operations = Object.keys(
                                                  errors || {},
                                                ).some((key) =>
                                                  key.startsWith(
                                                    `technical_sheet_details.${operation.id}`,
                                                  ),
                                                )

                                                const staticErrorPrefixOperation = `technical_sheet_details.${operation.id}.settings.static.values`
                                                const staticGeneralErrorOperation =
                                                  errors?.[staticErrorPrefixOperation]
                                                const hasStaticRecordErrorsOperation = Object.keys(
                                                  errors || {},
                                                ).some((key) =>
                                                  key.startsWith(`${staticErrorPrefixOperation}.`),
                                                )
                                                const hasStaticErrorsOperation =
                                                  !!staticGeneralErrorOperation ||
                                                  hasStaticRecordErrorsOperation

                                                return (
                                                  <CAccordionItem
                                                    key={operation.id}
                                                    itemKey={`subprocess-${operation.id}`}
                                                    className="subprocess-accordion-item"
                                                  >
                                                    <CAccordionHeader className="font-inter">
                                                      <div className="d-flex align-items-center justify-content-between w-100 pe-3">
                                                        <span className="subprocess-title">
                                                          {operation.name}
                                                        </span>
                                                        <div className="d-flex align-items-center gap-2">
                                                          {has_errors_operations && (
                                                            <span className="process-tag tag-error animate-pulse-subtle">
                                                              <AlertTriangle
                                                                size={14}
                                                                className="me-1"
                                                              />
                                                              Errores
                                                            </span>
                                                          )}
                                                          <span
                                                            className={`process-tag tag-sm ${subStatus.className}`}
                                                            onClick={(e) => {
                                                              e.stopPropagation()

                                                              setChangeStatus(true)
                                                              setSelectedStatus(status.label)
                                                              setSelectedDetail(operation.id)
                                                            }}
                                                          >
                                                            {subStatus.icon}
                                                            {subStatus.label}
                                                          </span>
                                                        </div>
                                                      </div>
                                                    </CAccordionHeader>

                                                    <CAccordionBody className="font-inter ps-3 py-2">
                                                      <div
                                                        className={`mb-2 shadow-sm border-start border-4 rounded-end ${
                                                          hasStaticErrorsOperation
                                                            ? 'header-switch-container-error-border'
                                                            : ''
                                                        }`}
                                                        style={{
                                                          borderLeftColor: '#C21111',
                                                          backgroundColor: '#fcfcfc',
                                                        }}
                                                      >
                                                        <div
                                                          className={`p-3 d-flex align-items-center justify-content-between border-bottom bg-white rounded-top header-switch-container ${
                                                            hasStaticErrorsOperation
                                                              ? 'header-switch-container-error'
                                                              : ''
                                                          }`}
                                                        >
                                                          <div className="d-flex align-items-center gap-2">
                                                            <Layers
                                                              size={18}
                                                              className="text-muted"
                                                            />
                                                            <span className="fw-semibold font-poppins text-dark">
                                                              Tabla Estatica
                                                            </span>
                                                            {hasStaticErrorsOperation && (
                                                              <CPopover
                                                                visible={
                                                                  openPopover?.process ===
                                                                    operation.id &&
                                                                  openPopover?.type === 'static'
                                                                }
                                                                placement="top"
                                                                onHide={() => setOpenPopover(null)}
                                                                trigger="focus"
                                                                title={
                                                                  <div
                                                                    className="d-flex align-items-center gap-2 font-montserrat fw-bold"
                                                                    style={{
                                                                      color: '#991B1B',
                                                                      fontSize: '0.85rem',
                                                                      padding: '2px 0',
                                                                    }}
                                                                  >
                                                                    <BadgeAlert
                                                                      size={15}
                                                                      className="text-danger"
                                                                    />
                                                                    <span>
                                                                      Errores de validación
                                                                    </span>
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
                                                                    {staticGeneralErrorOperation ? (
                                                                      staticGeneralErrorOperation.map(
                                                                        (err, i) => (
                                                                          <div
                                                                            key={i}
                                                                            className="d-flex align-items-start gap-2 p-1 rounded-2"
                                                                          >
                                                                            <span
                                                                              style={{
                                                                                whiteSpace:
                                                                                  'pre-line',
                                                                              }}
                                                                            >
                                                                              {err}
                                                                            </span>
                                                                          </div>
                                                                        ),
                                                                      )
                                                                    ) : hasStaticRecordErrorsOperation ? (
                                                                      <div className="p-1">
                                                                        Hay errores de validación en
                                                                        los registros de la tabla.
                                                                      </div>
                                                                    ) : null}
                                                                  </div>
                                                                }
                                                              >
                                                                <span
                                                                  style={{
                                                                    cursor: 'pointer',
                                                                    color: '#ef4444',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                  }}
                                                                  onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setOpenPopover((prev) => {
                                                                      if (
                                                                        prev?.process ===
                                                                          operation.id &&
                                                                        prev?.type === 'static'
                                                                      ) {
                                                                        return null
                                                                      }
                                                                      return {
                                                                        process: operation.id,
                                                                        type: 'static',
                                                                      }
                                                                    })
                                                                  }}
                                                                >
                                                                  <BadgeAlert size={16} />
                                                                </span>
                                                              </CPopover>
                                                            )}
                                                          </div>
                                                          <div className="d-flex align-items-center gap-3">
                                                            <div className="d-flex align-items-center gap-2">
                                                              <span className="text-muted small font-inter">
                                                                ¿Esta tabla va a recibir
                                                                información?
                                                              </span>
                                                              <CFormSwitch
                                                                id={`switch-ingreso-datos-${operation.id}`}
                                                                className="custom-corporate-switch"
                                                                checked={
                                                                  details?.[operation?.id]?.settings
                                                                    ?.static?.insert_values || false
                                                                }
                                                                onChange={(e) =>
                                                                  setDetails((prev) => ({
                                                                    ...prev,
                                                                    [operation.id]: {
                                                                      ...prev[operation.id],
                                                                      settings: {
                                                                        ...prev[operation.id]
                                                                          .settings,
                                                                        static: {
                                                                          ...prev[operation.id]
                                                                            .settings.static,
                                                                          insert_values:
                                                                            e.target.checked,
                                                                        },
                                                                      },
                                                                    },
                                                                  }))
                                                                }
                                                                disabled={
                                                                  !details?.[operation?.id]
                                                                    ?.settings?.static?.body
                                                                    ?.length &&
                                                                  !details?.[operation?.id]
                                                                    ?.settings?.static?.header
                                                                    ?.length
                                                                }
                                                              />
                                                            </div>
                                                            {technical_sheet && (
                                                              <>
                                                                <div
                                                                  className="border-start"
                                                                  style={{
                                                                    height: '20px',
                                                                    borderColor: '#e2e8f0',
                                                                  }}
                                                                ></div>
                                                                {!equalStatic ? (
                                                                  <CTooltip
                                                                    className="tooltip-technical_sheet font-inter"
                                                                    content="Existe una versión más reciente de la estructura."
                                                                    placement="top"
                                                                  >
                                                                    <span>
                                                                      <CButton
                                                                        type="button"
                                                                        className="btn-update-structure font-inter d-flex align-items-center gap-2"
                                                                        onClick={() =>
                                                                          handleChangeStructureOperation(
                                                                            process.id,
                                                                            subprocess.id,
                                                                            operation.id,
                                                                            'static',
                                                                          )
                                                                        }
                                                                        disabled={
                                                                          equalStaticOperation
                                                                        }
                                                                      >
                                                                        <RefreshCcw
                                                                          size={15}
                                                                          className="icon-load"
                                                                        />
                                                                        <span className="small fw-semibold">
                                                                          Actualizar estructura
                                                                        </span>
                                                                      </CButton>
                                                                    </span>
                                                                  </CTooltip>
                                                                ) : (
                                                                  <span>
                                                                    <CButton
                                                                      type="button"
                                                                      className="btn-update-structure font-inter d-flex align-items-center gap-2"
                                                                      onClick={() =>
                                                                        console.log(
                                                                          'Actualizando estructura de:',
                                                                          process.id,
                                                                        )
                                                                      }
                                                                      disabled={
                                                                        equalStaticOperation
                                                                      }
                                                                    >
                                                                      <RefreshCcw
                                                                        size={15}
                                                                        className="icon-load"
                                                                      />
                                                                      <span className="small fw-semibold">
                                                                        Actualizar estructura
                                                                      </span>
                                                                    </CButton>
                                                                  </span>
                                                                )}
                                                              </>
                                                            )}
                                                          </div>
                                                        </div>
                                                        <div className="p-3">
                                                          <TableStaticTechnicalSheet
                                                            process_id={operation.id}
                                                            structure={
                                                              details?.[operation.id]?.settings
                                                                ?.static ||
                                                              processes[process.id]?.subprocesses[
                                                                subprocess.id
                                                              ]?.operations[operation.id]?.settings
                                                                ?.schema?.static
                                                            }
                                                            values={staticValues[operation.id]}
                                                            catalogsData={catalogsData}
                                                            models={models}
                                                            dataGet={dataGet}
                                                            status={
                                                              details?.[operation?.id]?.settings
                                                                ?.static?.insert_values
                                                            }
                                                            setStaticValues={setStaticValues}
                                                            errors={Object.fromEntries(
                                                              Object.entries(errors || {}).filter(
                                                                ([key]) =>
                                                                  key.startsWith(
                                                                    `technical_sheet_details.${operation?.id}.settings.static`,
                                                                  ),
                                                              ),
                                                            )}
                                                            validated={validated}
                                                          />
                                                        </div>
                                                      </div>
                                                    </CAccordionBody>
                                                  </CAccordionItem>
                                                )
                                              })}
                                          </CAccordion>
                                        ) : (
                                          <div className="card border-0 shadow-sm">
                                            <div className="card-body text-center py-3">
                                              <h6 className="text-muted mb-0">
                                                Este subproceso aún no tiene operaciones asociadas.
                                              </h6>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </CAccordionBody>
                                  </CAccordionItem>
                                )
                              })}
                          </CAccordion>
                        ) : (
                          <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-3">
                              <h6 className="text-muted mb-0">
                                Este proceso aún no tiene subprocesos asociados.
                              </h6>
                            </div>
                          </div>
                        )}
                      </div>
                    </CAccordionBody>
                  </CAccordionItem>
                )
              })}
        </CAccordion>
      </div>
      <CModal
        visible={changeStatus}
        onClose={() => {
          setChangeStatus(false)
          setSelectedDetail(null)
          setSelectedStatus(null)
        }}
        alignment="center"
        className="font-montserrat"
      >
        <CModalHeader style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <CModalTitle style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
            Cambiar Estado
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <div className="mb-3">
            <label
              className="form-label font-inter fw-semibold mb-2"
              style={{ fontSize: '0.85rem', color: '#334155' }}
            >
              Selecciona el nuevo estado del detalle de la ficha técnica:
            </label>
            <Select
              options={
                Array.isArray(statusCollection)
                  ? statusCollection.map((item) => ({
                      value: item,
                      label: item,
                    }))
                  : []
              }
              value={
                selectedStatus
                  ? {
                      value: selectedStatus,
                      label: selectedStatus,
                    }
                  : null
              }
              onChange={(option) => setSelectedStatus(option.value)}
              placeholder="Buscar o seleccionar subcategoría..."
              isSearchable
              styles={{
                ...tableSelectStyles,
                control: (provided, state) => ({
                  ...provided,
                  minHeight: '40px',
                  borderRadius: '10px',
                  border: state.isFocused ? '1px solid #24247f' : '1px solid #E2E8F0',
                  boxShadow: state.isFocused ? '0 0 0 3px rgba(36, 36, 127, 0.12)' : 'none',
                }),
                valueContainer: (provided) => ({ ...provided, padding: '0 12px' }),
                indicatorsContainer: (provided) => ({ ...provided, opacity: 1 }),
              }}
            />
          </div>
        </CModalBody>
        <CModalFooter style={{ borderTop: '1px solid #E2E8F0', gap: '8px' }}>
          <CButton
            color="secondary"
            size="sm"
            className="font-inter fw-medium"
            onClick={() => {
              setChangeStatus(false)
              setSelectedDetail(null)
              setSelectedStatus(null)
            }}
          >
            Cancelar
          </CButton>
          <CButton
            size="sm"
            className="font-inter fw-semibold px-3 text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: '#24247f', border: 'none' }}
            onClick={() => handleChangeStatus(selectedDetail, selectedStatus)}
          >
            <RefreshCw size={14} />
            Cambiar Estado
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal
        visible={addSubprocess}
        onClose={() => {
          setAddSubprocess(false)
          setSelectedSubprocess(null)
        }}
        alignment="center"
        className="font-montserrat"
      >
        <CModalHeader style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <CModalTitle style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
            Agregar Subproceso
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <div className="mb-3">
            <label
              className="form-label font-inter fw-semibold mb-2"
              style={{ fontSize: '0.85rem', color: '#334155' }}
            >
              Elija el subproceso que desea incorporar a la estructura actual:
            </label>
            <Select
              options={Object.values(subprocesses)
                .filter((subprocess) => !details[subprocess.id])
                .map((subprocess) => ({
                  value: subprocess.id,
                  label: subprocess.name,
                  data: subprocess,
                }))}
              value={Object.values(subprocesses)
                .filter((subprocess) => !details[subprocess.id])
                .map((subprocess) => ({
                  value: subprocess.id,
                  label: subprocess.name,
                  data: subprocess,
                }))
                .find((subprocess) => subprocess.value === selectedSubprocess?.value)}
              onChange={(option) => {
                setSelectedSubprocess(option ?? null)
              }}
              placeholder="Buscar o seleccionar subcategoría..."
              isSearchable
              styles={{
                ...tableSelectStyles,
                control: (provided, state) => ({
                  ...provided,
                  minHeight: '40px',
                  borderRadius: '10px',
                  border: state.isFocused ? '1px solid #24247f' : '1px solid #E2E8F0',
                  boxShadow: state.isFocused ? '0 0 0 3px rgba(36, 36, 127, 0.12)' : 'none',
                }),
                valueContainer: (provided) => ({ ...provided, padding: '0 12px' }),
                indicatorsContainer: (provided) => ({ ...provided, opacity: 1 }),
              }}
            />
          </div>
        </CModalBody>
        <CModalFooter style={{ borderTop: '1px solid #E2E8F0', gap: '8px' }}>
          <CButton
            color="secondary"
            size="sm"
            className="font-inter fw-medium"
            onClick={() => {
              setAddSubprocess(false)
              setSelectedSubprocess(null)
            }}
          >
            Cancelar
          </CButton>
          <CButton
            size="sm"
            className="font-inter fw-semibold px-3 text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: '#24247f', border: 'none' }}
            onClick={() => handleAddSubprocess(selectedSubprocess.data)}
          >
            <Plus size={14} />
            Agregar Subproceso
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal
        visible={addOperation}
        onClose={() => {
          setAddOperation(false)
          setSelectedOperation(null)
        }}
        alignment="center"
        className="font-montserrat"
      >
        <CModalHeader style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <CModalTitle style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
            Agregar Operación
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <div className="mb-3">
            <label
              className="form-label font-inter fw-semibold mb-2"
              style={{ fontSize: '0.85rem', color: '#334155' }}
            >
              Elija la operación que desea incorporar a la estructura actual:
            </label>
            <Select
              options={Object.values(operations)
                .filter((operation) => !details[operation.id])
                .map((operation) => ({
                  value: operation.id,
                  label: operation.name,
                  data: operation,
                }))}
              value={Object.values(operations)
                .filter((operation) => !details[operation.id])
                .map((operation) => ({
                  value: operation.id,
                  label: operation.name,
                  data: operation,
                }))
                .find((operation) => operation.value === selectedOperation?.value)}
              onChange={(option) => {
                setSelectedOperation(option ?? null)
              }}
              placeholder="Buscar o seleccionar operación..."
              isSearchable
              styles={{
                ...tableSelectStyles,
                control: (provided, state) => ({
                  ...provided,
                  minHeight: '40px',
                  borderRadius: '10px',
                  border: state.isFocused ? '1px solid #24247f' : '1px solid #E2E8F0',
                  boxShadow: state.isFocused ? '0 0 0 3px rgba(36, 36, 127, 0.12)' : 'none',
                }),
                valueContainer: (provided) => ({ ...provided, padding: '0 12px' }),
                indicatorsContainer: (provided) => ({ ...provided, opacity: 1 }),
              }}
            />
          </div>
        </CModalBody>
        <CModalFooter style={{ borderTop: '1px solid #E2E8F0', gap: '8px' }}>
          <CButton
            color="secondary"
            size="sm"
            className="font-inter fw-medium"
            onClick={() => {
              setAddOperation(false)
              setSelectedOperation(null)
            }}
          >
            Cancelar
          </CButton>
          <CButton
            size="sm"
            className="font-inter fw-semibold px-3 text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: '#24247f', border: 'none' }}
            onClick={() => handleAddOperation(selectedOperation.data)}
          >
            <Plus size={14} />
            Agregar Operación
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default TechnicalSheetDetail
