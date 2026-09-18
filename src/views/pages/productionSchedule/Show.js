import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  CCard,
  CSpinner,
  CNav,
  CNavItem,
  CNavLink,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTooltip,
  CFormInput,
  CFormLabel,
  CFormFeedback,
} from '@coreui/react'
import {
  FolderKanban,
  Bookmark,
  Folder,
  FolderOpen,
  ArrowDownUp,
  Plus,
  Save,
  RefreshCcw,
  BadgeAlert,
  Settings2,
  Filter,
  XCircle,
  TextSearch,
  Package,
} from 'lucide-react'
import Select from 'react-select'
import { IoMdArrowDropright } from 'react-icons/io'
import LoadingForm from '@/components/LoadingForm'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'
import { tableSelectStyles, selectStyles } from '@/components/StyleManagementCollection'
import CollectionManagementService from '../../../services/collection_management.service'
import ManagementCollectionTechnicalSheet from '@/components/ManegementCollectionTechnicalSheet'
import { useSelector, useDispatch } from 'react-redux'
import ManagementProduction from '../ManagementProduction'
import ManagementProductionOrders from '@/components/ManagementProductionOrders'
import ModalBuilderCurveProgramationManagement from '@/components/ModalBuilderCurveProgramationManagement'

const calculateItemsUnits = (items) => {
  return items.reduce((acc, item) => {
    const productionOrder = item.production_order
    if (!productionOrder) return acc

    const total =
      productionOrder.production_order_details
        ?.filter((detail) => detail.model_type === 'App\\Models\\Product')
        .reduce((sumDetails, detail) => {
          return (
            sumDetails +
            (detail.production_order_detail_quantities || []).reduce(
              (sumQty, quantity) => sumQty + Number(quantity.quantity || 0),
              0,
            )
          )
        }, 0) || 0

    return acc + total
  }, 0)
}

const ProductionSchedule = ({ schedule, processes }) => {
  const formatScheduleDate = (date) => {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
      .format(new Date(`${date}T00:00:00`))
      .toUpperCase()
  }

  const getDayStats = (day) => {
    const orders = new Set()
    let units = 0
    let units_satelite = 0
    let units_bless = 0

    day.garmentTypes.forEach((garmentType) => {
      garmentType.items.forEach((item) => {
        const productionOrder = item.production_order

        if (!productionOrder) return

        orders.add(productionOrder.id)

        const total_satelite =
          productionOrder.production_place === 'SATELITE'
            ? productionOrder.production_order_details
                ?.filter((detail) => detail.model_type === 'App\\Models\\Product')
                .reduce((acc, detail) => {
                  console.log(detail)
                  return (
                    acc +
                    (detail.production_order_detail_quantities || []).reduce(
                      (sum, quantity) => sum + Number(quantity.quantity || 0),
                      0,
                    )
                  )
                }, 0) || 0
            : 0

        const total_bless =
          productionOrder.production_place === 'BLESS'
            ? productionOrder.production_order_details
                ?.filter((detail) => detail.model_type === 'App\\Models\\Product')
                .reduce((acc, detail) => {
                  console.log(detail)
                  return (
                    acc +
                    (detail.production_order_detail_quantities || []).reduce(
                      (sum, quantity) => sum + Number(quantity.quantity || 0),
                      0,
                    )
                  )
                }, 0) || 0
            : 0

        const total =
          productionOrder.production_order_details
            ?.filter((detail) => detail.model_type === 'App\\Models\\Product')
            .reduce((acc, detail) => {
              console.log(detail)
              return (
                acc +
                (detail.production_order_detail_quantities || []).reduce(
                  (sum, quantity) => sum + Number(quantity.quantity || 0),
                  0,
                )
              )
            }, 0) || 0

        console.log(total, total_satelite)

        units += total
        units_satelite += total_satelite
        units_bless += total_bless
      })
    })

    return {
      orders: orders.size,
      units,
      units_satelite,
      units_bless,
    }
  }

  return (
    <div className="production-dashboard">
      {schedule.map((day) => {
        const stats = getDayStats(day)

        console.log(stats)

        return (
          <section key={day.date} className="schedule-section">
            <div className="schedule-day-header">
              <div className="schedule-date-block">
                <div>
                  <span className="schedule-day-label font-inter">PROGRAMACIÓN</span>

                  <h2 className="schedule-day-title">{formatScheduleDate(day.date)}</h2>
                </div>
              </div>

              <div className="schedule-day-summary font-inter">
                <div className="schedule-summary-item">
                  <span>ÓRDENES</span>
                  <strong>{stats.orders}</strong>
                </div>

                <div className="schedule-summary-divider" />

                <div className="schedule-summary-item">
                  <span>UNIDADES</span>
                  <strong>{stats.units.toLocaleString('es-CO')}</strong>
                </div>

                <div className="schedule-summary-divider" />

                <div className="schedule-summary-item">
                  <span>SATÉLITE</span>
                  <strong>{stats.units_satelite.toLocaleString('es-CO')}</strong>
                </div>

                <div className="schedule-summary-divider" />

                <div className="schedule-summary-item">
                  <span>BLESS</span>
                  <strong>{stats.units_bless.toLocaleString('es-CO')}</strong>
                </div>
              </div>
            </div>

            <div className="schedule-table-wrapper">
              <table className="schedule-table">
                <thead>
                  <tr className="schedule-main-header">
                    <th rowSpan={2} className="header-garment">
                      <div className="garment-header text-center font-poppins">TIPO DE PRENDA</div>
                    </th>

                    {processes.map((process) => (
                      <th key={process.value} colSpan={2} className="header-programation-process">
                        <div key={process.value} className="process-header-cell font-poppins">
                          <span>{process.label}</span>
                        </div>
                      </th>
                    ))}

                    <th rowSpan={2} className="header-total">
                      <div className="garment-header text-center font-poppins">TOTAL</div>
                    </th>
                  </tr>

                  <tr className="schedule-main-header">
                    {processes.map((process) => (
                      <>
                        <th className="reference-header">REFERENCIA</th>
                        <th className="quantity-header">TOTAL</th>
                      </>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {day.garmentTypes.map((garmentType) => {
                    const garmentTotalUnits = calculateItemsUnits(garmentType.items)

                    return (
                      <tr key={garmentType.garment_type_id}>
                        <td className="garment-name">{garmentType.garment_type?.name}</td>

                        {processes.map((process) => {
                          const processItems = garmentType.items.filter(
                            (item) => Number(item.process_id) === Number(process.value),
                          )
                          return <ProcessCellComponent key={process.value} items={processItems} />
                        })}

                        <td className="row-total-cell">
                          {garmentTotalUnits.toLocaleString('es-CO')}
                        </td>
                      </tr>
                    )
                  })}

                  <tr className="totals-row ">
                    <td className="garment-info totals-info text-center font-poppins">TOTAL</td>

                    {processes.map((process) => {
                      const allProcessItems = day.garmentTypes.flatMap((garmentType) =>
                        garmentType.items.filter(
                          (item) => Number(item.process_id) === Number(process.value),
                        ),
                      )

                      const totalUnitsProcess = calculateItemsUnits(allProcessItems)

                      return (
                        <td colSpan={2} className="total-process-cell">
                          <div key={process.value} className="process-column total-process-cell">
                            <strong>{totalUnitsProcess.toLocaleString('es-CO')}</strong>
                          </div>
                        </td>
                      )
                    })}

                    <td className="grand-total-cell">
                      <div className="row-total-cell grand-total-cell">
                        <strong>{stats.units.toLocaleString('es-CO')}</strong>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
    </div>
  )
}

const ProcessCellComponent = ({ items }) => {
  if (!items.length) {
    return (
      <>
        <td className="process-reference-cell empty-cell">—</td>

        <td className="process-quantity-cell empty-cell">—</td>
      </>
    )
  }

  return (
    <>
      <td className="p-2">
        <ProcessCell items={items} />
      </td>

      <td className="process-quantity-cell p-2">
        <ProcessTotal items={items} />
      </td>
    </>
  )
}

const ProcessCell = ({ items }) => {
  if (!items.length) {
    return <div className="process-empty">—</div>
  }

  return (
    <div className="process-items w-100">
      {items.map((item) => {
        console.log(item)
        const productionOrder = item.production_order

        if (!productionOrder) return null

        const reference = `${productionOrder.technical_sheet?.product?.code || ''}-${productionOrder.cut || ''}`

        const total =
          productionOrder.production_order_details
            ?.filter((detail) => detail.model_type === 'App\\Models\\Product')
            .reduce((acc, detail) => {
              return (
                acc +
                (detail.production_order_detail_quantities || []).reduce(
                  (sum, quantity) => sum + Number(quantity.quantity || 0),
                  0,
                )
              )
            }, 0) || 0

        return (
          <div
            key={item.detail.id}
            className="production-card"
            style={{
              borderLeft:
                item.production_order.production_place === 'SATELITE'
                  ? '4px solid #1417db'
                  : '4px solid #e02d15',

              '--hover-color':
                item.production_order.production_place === 'SATELITE' ? '#1417db' : '#e02d15',
            }}
          >
            <div className="production-card-main">
              <span className="production-card-reference">{reference}</span>

              <span className="production-card-quantity">
                <Package size={12} strokeWidth={2} />
                <span>{total.toLocaleString('es-CO')}</span>
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const ProcessTotal = ({ items, accentColor }) => {
  if (!items.length) return null

  const total = calculateItemsUnits(items)

  return (
    <div className="process-cell-total" title="Total unidades en este proceso para esta prenda">
      <strong className="process-total-value">{total.toLocaleString('es-CO')}</strong>
    </div>
  )
}

export const Show = ({ data, fetchProductionOrders, processes, loading, errors }) => {
  console.log(data)
  console.log(processes)
  console.log(errors)
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [selectedTrademark, setSelectedTrademark] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [productionChanges, setProductionChanges] = useState({})
  const [productionReassignments, setProductionReassignments] = useState({})
  const [productionOriginReassignments, setProductionOriginReassignments] = useState({})
  const [openModalBuilder, setOpenModalBuilder] = useState(false)
  const [loadingBuilders, setLoadingBuilders] = useState(false)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedProcess, setSelectedProcess] = useState([])

  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')
  const [appliedProcess, setAppliedProcess] = useState([])

  const [modified, setModified] = useState({})
  const [validated, setValidated] = useState({})

  const scheduleDetails = useMemo(() => {
    if (!data?.length) {
      return []
    }

    const appliedProcessIds = appliedProcess.map((process) => Number(process.value))

    const result = []

    data.forEach((production_order) => {
      production_order.production_order_details?.forEach((detail) => {
        const process_id = Number(detail.model_id)
        const date = detail.settings?.date

        if (!date) {
          return
        }

        if (appliedProcessIds.length > 0 && !appliedProcessIds.includes(process_id)) {
          return
        }

        if (appliedStartDate && date < appliedStartDate) {
          return
        }

        if (appliedEndDate && date > appliedEndDate) {
          return
        }

        result.push({
          date,
          process_id,
          process: detail.model,
          detail,
          production_order,
        })
      })
    })

    return result.sort((a, b) => {
      return a.date.localeCompare(b.date)
    })
  }, [data, appliedProcess, appliedStartDate, appliedEndDate])

  const schedule = useMemo(() => {
    const grouped = {}

    scheduleDetails.forEach((item) => {
      const date = item.date

      const technicalSheet = item.production_order?.technical_sheet
      const garmentTypeId = technicalSheet?.garment_type_id
      const garmentType = technicalSheet?.garment_type

      if (!grouped[date]) {
        grouped[date] = {}
      }

      if (!grouped[date][garmentTypeId]) {
        grouped[date][garmentTypeId] = {
          garment_type_id: garmentTypeId,
          garment_type: garmentType,
          items: [],
        }
      }

      grouped[date][garmentTypeId].items.push(item)
    })

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, garmentTypes]) => ({
        date,
        garmentTypes: Object.values(garmentTypes),
      }))
  }, [scheduleDetails])

  console.log(schedule)

  const handleFilter = () => {
    setAppliedProcess(selectedProcess)
    setAppliedStartDate(startDate)
    setAppliedEndDate(endDate)

    const params = {
      processes_id:
        selectedProcess.length > 0 ? selectedProcess.map((process) => process.value) : null,

      start_date: startDate || null,
      end_date: endDate || null,
    }

    fetchProductionOrders(null, params)
  }

  const handleClear = () => {
    setStartDate('')
    setEndDate('')
    setSelectedProcess(null)
  }

  if (!processes) {
    return (
      <LoadingForm
        title="Cargando Información"
        subtitle="Un momento mientras se cargan las colecciones..."
      />
    )
  }

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0 animate-fade-in">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex">
          <IoMdArrowDropright style={{ color: '#C21111' }} size={32} />
          <div className="d-flex flex-column">
            <span
              className="fw-bold font-montserrat"
              style={{
                fontSize: '1.2rem',
                color: '#0F172A',
                lineHeight: '1.1',
              }}
            >
              Cronograma de Producción
            </span>
            <span
              className="font-inter"
              style={{
                color: '#64748B',
                fontSize: '.80rem',
                fontWeight: 400,
                marginTop: '2px',
              }}
            >
              Administra las programaciones disponibles
            </span>
          </div>
        </div>
      </div>
      <div className="animate-fade-in px-2">
        <div
          className="mb-4 font-inter"
          style={{
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '18px',
          }}
        >
          <div className="row g-3 justify-content-center align-items-end">
            <div className="col-12 col-md-3">
              <CFormLabel
                className="mb-1"
                style={{
                  color: '#64748B',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                }}
              >
                Fecha de inicio
              </CFormLabel>

              <div className="position-relative">
                <CFormInput
                  type="date"
                  className="input-custom"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    height: '38px',
                    fontSize: '0.82rem',
                    borderColor: errors?.['start_date'] ? '#dc3545' : undefined,
                    boxShadow: errors?.['start_date']
                      ? '0 0 0 0.15rem rgba(220, 53, 69, 0.15)'
                      : undefined,
                    paddingRight: errors?.['start_date'] ? '35px' : undefined,
                  }}
                />

                {errors?.['start_date'] && (
                  <CTooltip
                    content={
                      <div className="font-inter">
                        {errors['start_date'].map((error, index) => (
                          <div key={index}>{error}</div>
                        ))}
                      </div>
                    }
                    placement="top"
                  >
                    <span
                      className="position-absolute d-flex align-items-center justify-content-center"
                      style={{
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '24px',
                        height: '24px',
                        color: '#dc3545',
                        cursor: 'help',
                        zIndex: 10,
                      }}
                    >
                      <BadgeAlert size={17} strokeWidth={2} />
                    </span>
                  </CTooltip>
                )}
              </div>
            </div>

            <div className="col-12 col-md-3">
              <CFormLabel
                className="mb-1"
                style={{
                  color: '#64748B',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                }}
              >
                Fecha de fin
              </CFormLabel>

              <div className="position-relative">
                <CFormInput
                  type="date"
                  className="input-custom"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    height: '38px',
                    fontSize: '0.82rem',
                    borderColor: errors?.['end_date'] ? '#dc3545' : undefined,
                    boxShadow: errors?.['end_date']
                      ? '0 0 0 0.15rem rgba(220, 53, 69, 0.15)'
                      : undefined,
                    paddingRight: errors?.['end_date'] ? '35px' : undefined,
                  }}
                />

                {errors?.['end_date'] && (
                  <CTooltip
                    content={
                      <div className="font-inter">
                        {errors['end_date'].map((error, index) => (
                          <div key={index}>{error}</div>
                        ))}
                      </div>
                    }
                    placement="top"
                  >
                    <span
                      className="position-absolute d-flex align-items-center justify-content-center"
                      style={{
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '24px',
                        height: '24px',
                        color: '#dc3545',
                        cursor: 'help',
                        zIndex: 10,
                      }}
                    >
                      <BadgeAlert size={17} strokeWidth={2} />
                    </span>
                  </CTooltip>
                )}
              </div>
            </div>

            <div className="col-12 col-md-5">
              <CFormLabel
                className="mb-1"
                style={{
                  color: '#64748B',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                }}
              >
                Proceso
              </CFormLabel>

              <Select
                options={processes}
                value={selectedProcess}
                onChange={setSelectedProcess}
                placeholder="Todos los procesos"
                isMulti
                isClearable
                isSearchable
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                components={{
                  Option: ({ children, isSelected, innerProps }) => (
                    <div
                      {...innerProps}
                      className="d-flex align-items-center"
                      style={{
                        padding: '9px 12px',
                        cursor: 'pointer',
                        backgroundColor: 'white',
                        color: '#334155',
                        fontSize: '0.82rem',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F8FAFC'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white'
                      }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: '16px',
                          height: '16px',
                          border: isSelected ? '1px solid #24247F' : '1px solid #CBD5E1',
                          borderRadius: '3px',
                          backgroundColor: isSelected ? '#24247F' : 'white',
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && (
                          <span
                            style={{
                              color: 'white',
                              fontSize: '11px',
                              lineHeight: 1,
                              fontWeight: 700,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>

                      <span>{children}</span>
                    </div>
                  ),

                  MultiValue: ({ children, index, getValue }) => {
                    const values = getValue()

                    return (
                      <span
                        style={{
                          fontSize: '0.82rem',
                          color: '#334155',
                          marginRight: '4px',
                        }}
                      >
                        {children}
                        {index < values.length - 1 ? ', ' : ''}
                      </span>
                    )
                  },

                  MultiValueContainer: ({ children }) => <span>{children}</span>,

                  MultiValueRemove: () => null,
                }}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: '38px',
                    height: '38px',
                    borderColor: state.isFocused ? '#94A3B8' : '#DBDFE6',
                    boxShadow: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.82rem',
                    '&:hover': {
                      borderColor: '#1857b6',
                      boxShadow: '0 0 0 0.2rem rgba(13, 110, 253, 0.25)',
                    },
                  }),

                  valueContainer: (base) => ({
                    ...base,
                    minHeight: '38px',
                    height: '38px',
                    padding: '0 10px',
                    overflow: 'hidden',
                    flexWrap: 'nowrap',
                  }),

                  indicatorsContainer: (base) => ({
                    ...base,
                    height: '38px',
                  }),

                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: 'transparent',
                    borderRadius: 0,
                    margin: 0,
                    padding: 0,
                  }),

                  multiValueLabel: (base) => ({
                    ...base,
                    padding: 0,
                    color: '#334155',
                  }),

                  multiValueRemove: (base) => ({
                    ...base,
                    display: 'none',
                  }),

                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
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
                }}
              />
            </div>

            <div className="col-12 col-md-auto">
              <CButton
                className="filter-button d-flex align-items-center justify-content-center"
                onClick={handleFilter}
                disabled={loading}
                style={{
                  height: '38px',
                  width: '42px',
                }}
              >
                {loading ? <CSpinner size="sm" /> : <Filter size={15} strokeWidth={2} />}
              </CButton>
            </div>
          </div>
        </div>
        {loading ? (
          <div
            className="d-flex flex-column align-items-center justify-content-center p-5"
            style={{
              minHeight: '250px',
              color: '#64748B',
            }}
          >
            <CSpinner />
            <div
              className="mt-3 font-inter"
              style={{
                fontSize: '0.85rem',
              }}
            >
              Consultando órdenes de producción...
            </div>
          </div>
        ) : !data ? (
          <div
            className="d-flex flex-column align-items-center text-center p-4"
            style={{
              color: '#94A3B8',
            }}
          >
            <FolderKanban size={60} strokeWidth={1.5} />

            <div className="mt-2 font-inter">
              Elige los criterios de búsqueda para cargar la información
            </div>
          </div>
        ) : data.length === 0 ? (
          <div
            className="d-flex flex-column align-items-center text-center p-4"
            style={{
              color: '#94A3B8',
            }}
          >
            <TextSearch size={60} strokeWidth={1.5} />

            <div className="mt-2 font-inter">No hay programaciones asociadas</div>
          </div>
        ) : (
          <div
            className="d-flex flex-column align-items-center text-center p-4"
            style={{
              color: '#94A3B8',
            }}
          >
            <ProductionSchedule
              schedule={schedule}
              processes={appliedProcess.length === 0 ? processes : appliedProcess}
            />
          </div>
        )}
      </div>
    </CCard>
  )
}

export default Show
