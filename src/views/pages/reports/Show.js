import api from '../../../API/api'
import { getConfig } from '../../../axiosConfig'
import React, { useEffect, useState, useMemo, useRef } from 'react'
import { CCard, CSpinner, CButton, CFormLabel, CBadge } from '@coreui/react'
import {
  FileChartColumn,
  ArrowDownUp,
  Filter,
  FileCog,
  Settings2,
  Info,
  SlidersHorizontal,
  AlertCircle,
  X,
  Plus,
  FileSpreadsheet,
  Download,
  LoaderCircle,
  ChevronRight,
} from 'lucide-react'
import Select from 'react-select'
import { IoMdArrowDropright } from 'react-icons/io'
import LoadingForm from '@/components/LoadingForm'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'
import { selectStyles } from '@/components/StyleManagementCollection'
import { useSelector } from 'react-redux'
import ReportColumnsModal from '@/components/ReportColumnsModal'
import DatePicker, { registerLocale } from 'react-datepicker'
import { es } from 'date-fns/locale/es'
import 'react-datepicker/dist/react-datepicker.css'
import { thStyle } from '@/components/StyleManagementCollection'
import get from 'lodash/get'

registerLocale('es', es)

export const Show = ({
  reports,
  fetchReports,
  loading,
  loading_export,
  errors,
  findReport,
  report,
  setReport,
  statusses,
  models,
  generateReport,
  exportReport,
  statusses_process,
  destinations,
  data,
  setData,
  data_fields,
  setDataFields,
}) => {
  console.log(statusses)
  const user_active = useSelector((state) => state.user)

  const [catalogsData, setCatalogsData] = useState({})

  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedFields, setSelectedFields] = useState([])
  const [selectedFilters, setSelectedFilters] = useState({})
  const [openColumnsModal, setOpenColumnsModal] = useState(false)
  const [availableFields, setAvailableFields] = useState({})
  const [visibleFilterKeys, setVisibleFilterKeys] = useState([])
  const [openFilterMenu, setOpenFilterMenu] = useState(false)
  const [context, setContext] = useState(null)
  const [contextSelections, setContextSelections] = useState([])
  const [contextLevel, setContextLevel] = useState(0)

  const filterMenuRef = useRef(null)

  const getCatalog = async (key, dependencyValue = null) => {
    try {
      const modelConfig = Object.values(models).find((value) => value.model === key)

      if (!modelConfig) {
        throw new Error(`No se encontró configuración para el modelo: ${key}`)
      }

      let url = modelConfig.url

      if (dependencyValue !== null && dependencyValue !== undefined) {
        const match = url.match(/\{([^}]+)\}/)

        if (match) {
          const paramName = match[1]

          url = url.replace(`{${paramName}}`, dependencyValue)
        }
      }

      const response = await api.get(url, {
        ...getConfig(),
      })

      return response.data
    } catch (error) {
      throw (
        error.response?.data || {
          message: 'Error desconocido',
        }
      )
    }
  }

  const getSelectedOptions = (item, key) => {
    const selectedValues = selectedFilters[key] || []

    const options = getFilterOptions(item, key)

    if (item.data === 'processes') {
      return options
        .flatMap((group) => group.options)
        .filter((option) => selectedValues.includes(option.value))
    }

    return options.filter((option) => selectedValues.includes(option.value))
  }

  const getCatalogOptions = (item, key) => {
    const config = models[item.data]

    if (!config) return []

    const dependencyConfig = getDependencyConfig(item)

    if (!dependencyConfig) {
      const catalog = catalogsData[config.model] || {}

      return Object.values(catalog).map((option) => ({
        value: option.id,
        label: dataGet(config.option, option, option.name),
      }))
    }

    const dependencyValues = selectedFilters[dependencyConfig.parentKey] || []

    if (!dependencyValues.length) {
      return []
    }

    const mergedCatalog = dependencyValues.reduce((acc, dependencyValue) => {
      const cacheKey = `${config.model}_${dependencyValue}`

      const catalog = catalogsData[cacheKey] || {}

      return {
        ...acc,
        ...catalog,
      }
    }, {})

    return Object.values(mergedCatalog).map((option) => ({
      value: option.id,
      label: dataGet(config.option, option, option.name),
    }))
  }

  const loadCatalog = async (key, dependencyValues = null) => {
    const values = Array.isArray(dependencyValues)
      ? dependencyValues
      : dependencyValues !== null && dependencyValues !== undefined
        ? [dependencyValues]
        : [null]

    for (const dependencyValue of values) {
      const cacheKey = dependencyValue !== null ? `${key}_${dependencyValue}` : key

      if (catalogsData[cacheKey]) continue

      const res = await getCatalog(key, dependencyValue)

      const modelKey = Object.entries(models).find(([_, value]) => value.model === key)?.[0]

      if (!modelKey) continue

      const data = res.data?.[modelKey]

      const aux = Array.isArray(data)
        ? data.reduce((acc, item) => {
            acc[item.id] = {
              id: item.id,
              ...(!item.person ? { name: item.name } : { person: item.person }),
            }

            return acc
          }, {})
        : {}

      setCatalogsData((prev) => ({
        ...prev,
        [cacheKey]: {
          ...(prev[cacheKey] || {}),
          ...aux,
        },
      }))
    }
  }

  const getDependencyConfig = (item) => {
    const config = models[item.data]

    if (!config?.param) {
      return null
    }

    const parentFilter = Object.entries(report?.settings?.filters || {}).find(([_, parentItem]) => {
      const parentConfig = models[parentItem.data]

      return parentConfig?.model === config.param
    })

    if (!parentFilter) {
      return null
    }

    return {
      parentKey: parentFilter[0],
      parentConfig: models[parentFilter[1].data],
    }
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

  const handleFilterChange = (key, selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map((option) => option.value) : []

    setSelectedFilters((prev) => {
      const next = {
        ...prev,
        [key]: values,
      }

      Object.entries(report?.settings?.filters || {}).forEach(([childKey, childItem]) => {
        const childConfig = models[childItem.data]

        if (!childConfig?.param) return

        const parentConfig = models[report.settings.filters[key]?.data]

        if (childConfig.param === parentConfig?.model) {
          next[childKey] = []
        }
      })

      return next
    })
  }

  const handleDateRangeChange = (key, type, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [type]: value,
      },
    }))
  }

  const handleGenerateReport = async () => {
    try {
      const payload = {
        model: report?.settings?.model ?? null,
        ...(report?.settings?.context
          ? {
              model_type:
                contextSelections?.[currentLevel]?.model_type ??
                contextSelections?.[currentLevel]?.pivot?.model_type ??
                null,

              model_id: contextSelections?.[currentLevel]?.id ?? null,
            }
          : {}),
        fields: [...selectedFields]
          .sort((a, b) => a.order - b.order)
          .map((field) => {
            console.log(field)
            const display = field.displayValue ?? field.display?.default
            const type = field.display?.type

            const result = {
              data_key: field.data_key,
            }

            if (type === 'relation') {
              if (display === 'code_name') {
                result.display = display
              } else {
                result.data_key = `${field.data_key}.${display}`
              }
            }

            if (type === 'date') {
              result.format = display
            }

            if (type === 'boolean') {
              result.format = display
            }

            if (field.groupKey === 'context') {
              result.label = field.label
              result.key = field.key
            }

            if (field.relations) {
              result.key = field.groupKey
            }

            return result
          }),

        filters: Object.entries(selectedFilters).reduce((acc, [key, values]) => {
          if (Array.isArray(values) && values.length > 0) {
            acc[key] = values
          }

          if (
            values &&
            typeof values === 'object' &&
            !Array.isArray(values) &&
            (values.from || values.to)
          ) {
            acc[key] = {
              from: values.from || null,
              to: values.to || null,
            }
          }

          return acc
        }, {}),
      }

      console.log(payload)

      await generateReport(selectedReport.value, payload)

      Toast.fire({
        icon: 'success',
        title: 'Reporte generado correctamente',
      })
    } catch (error) {
      if (error?.errors?.['authorization']) {
        Toast.fire({
          icon: 'error',
          title: error?.errors?.['authorization'] || 'No fue posible generar el reporte',
        })
      }
    }
  }

  const handleExportReport = async () => {
    try {
      const payload = {
        model: report?.settings?.model ?? null,
        ...(report?.settings?.context
          ? {
              model_type:
                contextSelections?.[currentLevel]?.model_type ??
                contextSelections?.[currentLevel]?.pivot?.model_type ??
                null,

              model_id: contextSelections?.[currentLevel]?.id ?? null,
            }
          : {}),
        fields: [...selectedFields]
          .sort((a, b) => a.order - b.order)
          .map((field) => {
            console.log(field)
            const display = field.displayValue ?? field.display?.default
            const type = field.display?.type

            const result = {
              data_key: field.data_key,
            }

            if (type === 'relation') {
              if (display === 'code_name') {
                result.display = display
              } else {
                result.data_key = `${field.data_key}.${display}`
              }
            }

            if (type === 'date') {
              result.format = display
            }

            if (type === 'boolean') {
              result.format = display
            }

            if (field.groupKey === 'context') {
              result.label = field.label
              result.key = field.key
            }

            if (field.relations) {
              result.key = field.groupKey
            }

            return result
          }),

        filters: Object.entries(selectedFilters).reduce((acc, [key, values]) => {
          if (Array.isArray(values) && values.length > 0) {
            acc[key] = values
          }

          if (
            values &&
            typeof values === 'object' &&
            !Array.isArray(values) &&
            (values.from || values.to)
          ) {
            acc[key] = {
              from: values.from || null,
              to: values.to || null,
            }
          }

          return acc
        }, {}),
      }

      await exportReport(selectedReport.value, payload, report.name)

      Toast.fire({
        icon: 'success',
        title: 'Reporte exportado correctamente',
      })
    } catch (error) {
      if (error?.errors?.['authorization']) {
        Toast.fire({
          icon: 'error',
          title: error?.errors?.['authorization'] || 'No fue posible generar el reporte',
        })
      }
    }
  }

  const addFilter = (key) => {
    setVisibleFilterKeys((prev) => {
      if (prev.includes(key)) return prev
      return [...prev, key]
    })
  }

  const availableFilterOptions = useMemo(() => {
    return Object.entries(report?.settings?.filters || {})
      .filter(([key, item]) => !visibleFilterKeys.includes(key))
      .map(([key, item]) => ({
        key,
        label: item.label,
      }))
  }, [report, visibleFilterKeys])

  const newFieldLabels = useMemo(() => {
    const generatedFields = new Set(data_fields || [])

    return new Set(
      (selectedFields || [])
        .map((field) => field.label)
        .filter((label) => label && !generatedFields.has(label)),
    )
  }, [selectedFields, data_fields])

  const removeFilter = (key) => {
    const filter = report?.settings?.filters?.[key]

    if (filter?.show_by_default) return

    setVisibleFilterKeys((prev) => prev.filter((item) => item !== key))

    setSelectedFilters((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const hierarchy = report?.settings?.context?.hierarchy ?? []

  const currentLevel = contextLevel ?? 0

  const getContextOptions = (level) => {
    const hierarchyItem = hierarchy[level]

    if (!hierarchyItem) return []

    if (level === 0) {
      return context?.[hierarchyItem.data] ?? []
    }

    const parent = contextSelections[level - 1]

    return parent?.[hierarchyItem.data] ?? []
  }

  const getSelectedContext = (level) => {
    return contextSelections[level] ?? null
  }

  const handleContextChange = (level, option) => {
    if (!option) {
      setContextSelections((prev) => prev.slice(0, level))
      setContextLevel(Math.max(level - 1, 0))
      return
    }

    selectedFields.forEach((item) => console.log(item.groupKey))
    console.log(hierarchy?.[currentLevel]?.label)

    setSelectedFields((prev) =>
      prev.filter((item) => item.groupLabel !== hierarchy?.[currentLevel]?.label),
    )

    setData([])
    setDataFields()

    setContextSelections((prev) => {
      const updated = prev.slice(0, level)
      updated[level] = option.data

      return updated
    })

    setContextLevel(level)
  }

  console.log(contextSelections, contextLevel)

  const goToContextLevel = (level) => {
    setContextLevel(level)
  }

  useEffect(() => {
    if (!report?.settings?.filters) return

    const defaultFilters = Object.entries(report.settings.filters)
      .filter(([_, filter]) => filter.show_by_default)
      .map(([key]) => key)

    setVisibleFilterKeys(defaultFilters)
  }, [report])

  useEffect(() => {
    if (!report || !visibleFilterKeys.length) return

    const loadBaseCatalogs = async () => {
      for (const key of visibleFilterKeys) {
        const filter = report.settings.filters?.[key]

        if (!filter) continue

        const config = models[filter.data]

        if (!config) continue

        if (config.param) continue

        await loadCatalog(config.model)
      }
    }

    loadBaseCatalogs()
  }, [report, visibleFilterKeys])

  useEffect(() => {
    if (!report || !visibleFilterKeys.length) return

    const loadDependentCatalogs = async () => {
      for (const key of visibleFilterKeys) {
        const filter = report.settings.filters?.[key]

        if (!filter) continue

        const config = models[filter.data]

        if (!config?.param) continue

        const dependency = getDependencyConfig(filter)

        if (!dependency) continue

        const dependencyValues = selectedFilters[dependency.parentKey] || []

        if (!dependencyValues.length) continue

        await loadCatalog(config.model, dependencyValues)
      }
    }

    loadDependentCatalogs()
  }, [report, visibleFilterKeys, selectedFilters])

  useEffect(() => {
    if (!report) return

    const resolveFields = async () => {
      try {
        const formatLabel = (value) => {
          if (!value) return ''

          const text = value.toLocaleLowerCase('es-ES')

          return text.charAt(0).toLocaleUpperCase('es-ES') + text.slice(1)
        }

        const configuredFields = report?.settings?.fields || {}

        const resolvedFields = {}

        for (const [groupKey, group] of Object.entries(configuredFields)) {
          if (!group.dynamic) {
            resolvedFields[groupKey] = group
            continue
          }

          if (!group.url) {
            resolvedFields[groupKey] = {
              ...group,
              fields: {},
            }
            continue
          }

          const response = await api.get(group.url, {
            ...getConfig(),
            params: group.params || {},
          })

          const data = response.data?.data?.[groupKey] ?? response.data?.[groupKey] ?? []

          console.log(data)

          const fields = data.reduce((acc, item) => {
            acc[item.id] = {
              label: formatLabel(item.name),
              value: item.id,
              dynamic_id: item.id,
              data_key: `${item.id}_${formatLabel(item.name)}`,
              display: group.display,
              relations: group.relations ? true : false,
            }

            return acc
          }, {})

          resolvedFields[groupKey] = {
            ...group,
            fields,
          }
        }

        setAvailableFields(resolvedFields)
      } catch (error) {
        console.error('Error resolviendo fields:', error)
      }
    }

    resolveFields()
  }, [report])

  useEffect(() => {
    if (!report) return

    const formatLabel = (value) => {
      if (!value) return ''

      const text = value.toLocaleLowerCase('es-ES')

      return text.charAt(0).toLocaleUpperCase('es-ES') + text.slice(1)
    }

    const contextGroup = report?.settings?.fields?.context

    if (!contextGroup) return

    const selectedContext = contextSelections?.[currentLevel]

    if (!selectedContext) {
      setAvailableFields((prev) => ({
        ...prev,
        context: {
          ...contextGroup,
          fields: {},
        },
      }))

      return
    }

    const source = contextGroup?.source

    console.log(source, source?.fields, source?.values)

    if (!source?.fields) {
      return
    }

    const dynamicFields = get(selectedContext, source.fields, [])

    const contextLabel = hierarchy?.[currentLevel]?.label || 'Contexto'

    const fields = dynamicFields.reduce((acc, item) => {
      acc[item.field] = {
        ...item,
        label: formatLabel(item.label),
        type: 'context',
        key: item.field,
        data_key: source?.values ? `${source.values}.${item.field}` : item.field,
      }

      return acc
    }, {})

    setAvailableFields((prev) => ({
      ...prev,
      context: {
        ...contextGroup,
        label: contextLabel,
        fields,
      },
    }))
  }, [report, contextSelections, currentLevel, hierarchy])

  useEffect(() => {
    if (!report?.settings?.context) return

    const loadContext = async () => {
      try {
        const context = report.settings.context

        const response = await api.get(context.url, {
          ...getConfig(),
          params: context.params || {},
        })

        setContext(response.data.data || [])
      } catch (error) {
        console.error('Error cargando context:', error)
      }
    }

    loadContext()
  }, [report])

  useEffect(() => {
    if (!selectedReport) return
    findReport(selectedReport.value)
  }, [selectedReport])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openFilterMenu &&
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target)
      ) {
        setOpenFilterMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openFilterMenu])

  if (!reports) {
    return (
      <LoadingForm
        title="Cargando Información"
        subtitle="Un momento mientras se cargan las colecciones..."
      />
    )
  }

  const activeFilterCount = visibleFilterKeys.filter((key) => {
    const value = selectedFilters[key]

    if (Array.isArray(value)) {
      return value.length > 0
    }

    if (value && typeof value === 'object') {
      return Boolean(value.from || value.to)
    }

    return false
  }).length

  const getFilterOptions = (item, key) => {
    if (item.data === 'processes') {
      const processes = getCatalogOptions(item, key)

      return processes.map((process) => ({
        label: process.label,
        options: (statusses_process || []).map((status) => ({
          value: `${process.value}_${status.value}`,
          label: status.label,
          process_id: process.value,
          process_name: process.label,
          status: status.value,
        })),
      }))
    }

    if (key === 'status') {
      return statusses || []
    }

    if (key === 'destinations') {
      return destinations || []
    }

    return getCatalogOptions(item, key)
  }

  const changeReport = async () => {
    const result = await Swal.fire({
      title: 'Cambiar Reporte',
      html: `<div style="font-size:16px;"> <strong>Atención:</strong> al cambiar de reporte, se perderán los filtros y la información actualmente generada. <br /><br /> Si deseas conservar esta información, puedes descargar el reporte en Excel antes de continuar. <br /><br /> <strong>¿Deseas continuar?</strong> </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, cambiar',
      cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) {
      Toast.fire({
        icon: 'error',
        title: 'Acción cancelada',
      })
      return false
    }
    setSelectedReport(null)
    setReport(null)
    setSelectedFields([])
    setSelectedFilters({})
    setData()
    setDataFields()
  }

  console.log(context)
  console.log(availableFields)
  console.log(contextSelections[contextLevel])

  return (
    <>
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
                Reportes
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
                Visualiza los reportes
              </span>
            </div>
          </div>
        </div>
        <div className="animate-fade-in px-4">
          {!selectedReport ? (
            <>
              <div className="mb-3 animate-fade-in">
                <Select
                  options={
                    Array.isArray(reports)
                      ? reports
                          .filter((report) =>
                            report.permissions?.some((permission) =>
                              (
                                user_active?.permissions?.map((permission) => permission.name) || []
                              ).includes(
                                typeof permission === 'string' ? permission : permission.name,
                              ),
                            ),
                          )
                          .map((report) => ({
                            label: report.name,
                            value: report.id,
                          }))
                      : []
                  }
                  value={selectedReport}
                  onChange={setSelectedReport}
                  placeholder="Seleccionar reporte..."
                  isSearchable
                  styles={selectStyles}
                />
              </div>
              <div
                className="d-flex flex-column align-items-center text-center p-4"
                style={{
                  color: '#94A3B8',
                }}
              >
                <FileChartColumn size={60} strokeWidth={1.5} />
                <div className="mt-3 fw-semibold fs-5 font-inter">Ningun reporte seleccionado</div>
              </div>
            </>
          ) : !report ? (
            <div className="d-flex flex-column align-items-center text-center p-4 animate-fade-in">
              <CSpinner
                size="sm"
                style={{
                  color: '#24247f',
                  width: '24px',
                  height: '24px',
                  borderWidth: '3px',
                }}
              />
              <div className="d-flex flex-column text-start mt-4">
                <span
                  className="font-montserrat small fw-bold"
                  style={{ color: '#24247f', letterSpacing: '0.3px' }}
                >
                  Cargando reporte...
                </span>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div
                className="d-flex align-items-center justify-content-between p-4 rounded-2 bg-white border border-dashed border-1 position-relative overflow-hidden mb-3"
                style={{
                  borderColor: '#E2E8F0',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-2 text-white shadow-sm"
                    style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: '#24247f',
                    }}
                  >
                    <FileCog size={24} />
                  </div>
                  <div>
                    <span
                      className="d-block font-inter fw-bold uppercase tracking-wider text-secondary mb-1"
                      style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}
                    >
                      Reporte Seleccionado
                    </span>
                    <h4
                      className="font-montserrat fw-bold mb-1 text-dark"
                      style={{ color: '#0F172A', fontSize: '1.2rem' }}
                    >
                      {report?.name}
                    </h4>
                    <p
                      className="font-montserrat text-muted mb-0"
                      style={{ fontSize: '0.85rem', fontWeight: '500' }}
                    >
                      {report?.description}
                    </p>
                  </div>
                </div>
                <div
                  className="d-flex flex-column align-items-stretch gap-2 font-inter"
                  style={{
                    width: '180px',
                  }}
                >
                  <CButton
                    className="d-flex justify-content-center align-items-center gap-2 px-3 font-inter button-change-collection"
                    size="sm"
                    onClick={() => {
                      changeReport()
                    }}
                  >
                    <ArrowDownUp size={15} />
                    Cambiar Reporte
                  </CButton>
                  {selectedFields.length > 0 && (
                    <>
                      <CButton
                        className="d-flex justify-content-center align-items-center gap-2 px-3 font-inter button-change-filter"
                        size="sm"
                        onClick={handleGenerateReport}
                      >
                        <Filter size={14} />
                        <span>Filtrar</span>
                      </CButton>
                      <CButton
                        className="d-flex justify-content-center align-items-center gap-2 px-3 font-inter button-save-changes"
                        size="sm"
                        onClick={handleExportReport}
                        disabled={loading_export}
                      >
                        {loading_export ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                        <span>{loading_export ? 'Generando Excel...' : 'Descargar Excel'}</span>
                      </CButton>
                    </>
                  )}
                </div>
                <div
                  className="position-absolute top-0 start-0 h-100"
                  style={{ width: '4px', backgroundColor: '#24247f' }}
                />
              </div>

              <div
                className={`p-3 rounded-2 bg-white position-relative  ${
                  errors?.fields || errors?.filters ? 'report-config-error' : ''
                }`}
                style={{
                  border: `1px solid ${errors?.fields || errors?.filters ? '#DC3545' : '#dbdfe6'}`,
                  backgroundColor: '#F8FAFC',
                }}
              >
                {report?.settings?.context && hierarchy.length > 0 && (
                  <>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="font-inter fw-semibold text-secondary"
                            style={{ fontSize: '0.75rem' }}
                          >
                            ORIGEN DE LA INFORMACIÓN
                          </span>

                          {getSelectedContext(currentLevel) && (
                            <CBadge
                              color="primary"
                              shape="rounded-pill"
                              className="px-2 py-1 font-inter"
                            >
                              {hierarchy[currentLevel]?.label}:{' '}
                              {getSelectedContext(currentLevel).name}
                            </CBadge>
                          )}

                          {errors?.fields && (
                            <div className="d-flex align-items-center gap-1 text-danger error-message">
                              <AlertCircle size={14} />
                              <span
                                className="font-inter fw-semibold"
                                style={{ fontSize: '0.7rem' }}
                              >
                                {errors.fields}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        className="d-flex align-items-center flex-wrap"
                        style={{
                          gap: '8px',
                        }}
                      >
                        {Array.from({
                          length: Math.min(currentLevel + 1, hierarchy.length),
                        }).map((_, level) => {
                          const hierarchyItem = hierarchy[level]
                          const options = getContextOptions(level)
                          const selected = getSelectedContext(level)

                          const hasNextLevel = level < hierarchy.length - 1
                          const nextLevel = hierarchy[level + 1]

                          const hasChildren =
                            selected &&
                            nextLevel &&
                            Array.isArray(selected[nextLevel.data]) &&
                            selected[nextLevel.data].length > 0

                          return (
                            <React.Fragment key={hierarchyItem.key}>
                              <div
                                className="col-12 col-md-auto flex-grow-1"
                                style={{ minWidth: '200px' }}
                              >
                                <div
                                  className="font-inter mb-1"
                                  style={{
                                    fontSize: '0.68rem',
                                    color: '#94A3B8',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                  }}
                                >
                                  {hierarchyItem.label}
                                </div>

                                <Select
                                  className="font-inter"
                                  options={options.map((item) => ({
                                    value: item.id,
                                    label: item.name,
                                    data: item,
                                  }))}
                                  value={
                                    selected
                                      ? {
                                          value: selected.id,
                                          label: selected.name,
                                        }
                                      : null
                                  }
                                  onChange={(option) => handleContextChange(level, option)}
                                  placeholder={`Seleccionar...`}
                                  isSearchable
                                  isClearable
                                  menuPortalTarget={document.body}
                                  menuPosition="fixed"
                                  styles={{
                                    control: (base, state) => ({
                                      ...base,
                                      minHeight: '36px',
                                      height: '36px',
                                      fontSize: '0.78rem',
                                      borderColor:
                                        level === currentLevel && state.hasValue
                                          ? '#24247F'
                                          : '#DBDFE6',
                                      boxShadow: 'none',
                                      borderRadius: '7px',
                                      backgroundColor: '#FFFFFF',
                                      '&:hover': {
                                        borderColor: '#1857b6',
                                        boxShadow: '0 0 0 0.2rem rgba(13, 110, 253, 0.25)',
                                      },
                                    }),

                                    valueContainer: (base) => ({
                                      ...base,
                                      height: '36px',
                                      padding: '0 9px',
                                    }),

                                    indicatorsContainer: (base) => ({
                                      ...base,
                                      height: '36px',
                                    }),

                                    singleValue: (base) => ({
                                      ...base,
                                      color: '#334155',
                                      fontWeight: 600,
                                    }),

                                    placeholder: (base) => ({
                                      ...base,
                                      color: '#94A3B8',
                                      fontWeight: 500,
                                    }),

                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 99999,
                                    }),

                                    menu: (base) => ({
                                      ...base,
                                      zIndex: 99999,
                                      fontSize: '0.78rem',
                                      border: '1px solid #E2E8F0',
                                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                                      borderRadius: '7px',
                                      overflow: 'hidden',
                                      fontFamily: 'Inter',
                                    }),

                                    menuList: (base) => ({
                                      ...base,
                                      padding: '4px',
                                    }),

                                    option: (base, state) => ({
                                      ...base,
                                      fontSize: '0.78rem',
                                      borderRadius: '5px',
                                      cursor: 'pointer',
                                      backgroundColor: state.isFocused ? '#F1F5F9' : '#FFFFFF',
                                      color: '#334155',
                                    }),
                                  }}
                                />
                              </div>

                              {/* FLECHA */}
                              {hasNextLevel && hasChildren && (
                                <button
                                  type="button"
                                  className="border-0 d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    padding: 0,
                                    marginTop: '19px',
                                    borderRadius: '6px',
                                    backgroundColor: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    color: '#24247F',
                                    cursor: 'pointer',
                                    transition: 'all .2s ease',
                                  }}
                                  title={`Seleccionar ${nextLevel.label.toLowerCase()}`}
                                  onClick={() => goToContextLevel(level + 1)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#EEF2FF'
                                    e.currentTarget.style.borderColor = '#C7D2FE'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#F8FAFC'
                                    e.currentTarget.style.borderColor = '#E2E8F0'
                                  }}
                                >
                                  <ChevronRight size={15} />
                                </button>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>

                    <div
                      className="my-3"
                      style={{
                        borderTop: '1px solid #E2E8F0',
                      }}
                    />
                  </>
                )}
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="font-inter fw-semibold text-secondary"
                        style={{ fontSize: '0.75rem' }}
                      >
                        COLUMNAS DEL REPORTE
                      </span>

                      {selectedFields?.length > 0 && (
                        <span
                          className="font-inter fw-semibold px-2 py-1 rounded-pill"
                          style={{
                            fontSize: '0.65rem',
                            backgroundColor: '#EEF2FF',
                            color: '#3730A3',
                          }}
                        >
                          {selectedFields.length}{' '}
                          {selectedFields.length === 1 ? 'columna' : 'columnas'}
                        </span>
                      )}

                      {errors?.fields && (
                        <div className="d-flex align-items-center gap-1 text-danger error-message">
                          <AlertCircle size={14} />
                          <span className="font-inter fw-semibold" style={{ fontSize: '0.7rem' }}>
                            {errors.fields}
                          </span>
                        </div>
                      )}
                    </div>
                    <CButton
                      size="sm"
                      className="report-config-button d-flex align-items-center gap-2 px-3 py-1"
                      onClick={() => setOpenColumnsModal(true)}
                      disabled={!!report?.settings?.context && !contextSelections?.[currentLevel]}
                    >
                      <Settings2 size={15} />
                      Configurar Columnas
                    </CButton>
                  </div>

                  <div className="d-flex flex-wrap align-items-center gap-2 font-inter">
                    {selectedFields?.length > 0 ? (
                      selectedFields.map((field) => {
                        const isNew = newFieldLabels.has(field.label) && !!data_fields
                        console.log(selectedFields)
                        console.log(newFieldLabels)
                        console.log(data_fields)
                        return (
                          <div
                            key={field.data_key}
                            className="d-inline-flex align-items-center gap-1 px-2 py-2 rounded-pill border"
                            style={{
                              borderColor: isNew ? '#22C55E' : '#E2E8F0',
                              backgroundColor: isNew ? '#F0FDF4' : '#F8FAFC',
                              boxShadow: isNew ? '0 0 0 1px rgba(34, 197, 94, 0.08)' : 'none',
                            }}
                            title={
                              isNew
                                ? 'Nueva columna. Haz clic en "Filtrar" para actualizar el reporte.'
                                : ''
                            }
                          >
                            <span
                              style={{
                                fontSize: '0.68rem',
                                color: isNew ? '#16A34A' : '#94A3B8',
                                fontWeight: 500,
                              }}
                            >
                              {field.groupLabel}
                            </span>

                            <span
                              style={{
                                color: isNew ? '#86EFAC' : '#CBD5E1',
                                fontSize: '0.7rem',
                              }}
                            >
                              /
                            </span>

                            <span
                              style={{
                                fontSize: '0.72rem',
                                color: isNew ? '#15803D' : '#475569',
                                fontWeight: 600,
                              }}
                            >
                              {field.label}
                            </span>
                          </div>
                        )
                      })
                    ) : (
                      <span className="font-inter text-muted" style={{ fontSize: '0.75rem' }}>
                        No hay columnas configuradas.
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="my-3"
                  style={{
                    borderTop: '1px solid #E2E8F0',
                  }}
                />

                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="font-inter fw-semibold text-secondary"
                        style={{ fontSize: '0.75rem' }}
                      >
                        FILTROS APLICABLES
                      </span>

                      {errors?.filters && (
                        <div className="d-flex align-items-center gap-1 text-danger error-message">
                          <AlertCircle size={14} />
                          <span className="font-inter fw-semibold" style={{ fontSize: '0.7rem' }}>
                            {errors.filters}
                          </span>
                        </div>
                      )}

                      {activeFilterCount > 0 && (
                        <CBadge
                          color="primary"
                          shape="rounded-pill"
                          className="px-2 py-1 font-inter"
                        >
                          {activeFilterCount} activo(s)
                        </CBadge>
                      )}
                    </div>

                    <div className="position-relative">
                      <CButton
                        size="sm"
                        className="report-config-button d-flex align-items-center gap-2 px-3 py-1"
                        onClick={() => setOpenFilterMenu((prev) => !prev)}
                        disabled={!!report?.settings?.context && !contextSelections?.[currentLevel]}
                      >
                        <SlidersHorizontal size={15} />
                        Configurar Filtros
                      </CButton>

                      {openFilterMenu && (
                        <div
                          ref={filterMenuRef}
                          className="position-absolute bg-white rounded-3 shadow-sm font-inter"
                          style={{
                            top: 'calc(100% + 8px)',
                            right: 0,
                            width: '300px',
                            zIndex: 99999,
                            overflow: 'hidden',
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          <div
                            className="px-3 py-3 border-bottom"
                            style={{
                              backgroundColor: '#F8FAFC',
                            }}
                          >
                            <div
                              className="fw-bold"
                              style={{
                                fontSize: '0.72rem',
                                letterSpacing: '0.05em',
                                color: '#24247F',
                              }}
                            >
                              FILTROS DEL REPORTE
                            </div>

                            <div
                              className="text-muted mt-1"
                              style={{
                                fontSize: '0.7rem',
                              }}
                            >
                              Selecciona los filtros que deseas aplicar
                            </div>
                          </div>

                          <div
                            style={{
                              maxHeight: '320px',
                              overflowY: 'auto',
                              overflowX: 'hidden',
                            }}
                          >
                            {availableFilterOptions.length > 0 ? (
                              availableFilterOptions.map((filter) => {
                                const isSelected = Object.prototype.hasOwnProperty.call(
                                  selectedFilters,
                                  filter.key,
                                )

                                return (
                                  <button
                                    key={filter.key}
                                    type="button"
                                    className="w-100 border-0 d-flex align-items-center justify-content-between px-3 py-2"
                                    style={{
                                      cursor: 'pointer',
                                      fontSize: '0.78rem',
                                      textAlign: 'left',
                                      backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF',
                                      transition: 'background-color 0.15s ease',
                                    }}
                                    onClick={() => {
                                      if (isSelected) {
                                        removeFilter(filter.key)
                                      } else {
                                        addFilter(filter.key)
                                      }
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#F8FAFC'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = isSelected
                                        ? '#F8FAFC'
                                        : '#FFFFFF'
                                    }}
                                  >
                                    <span
                                      className="d-flex align-items-center gap-2"
                                      style={{
                                        color: isSelected ? '#24247F' : '#475569',
                                        fontWeight: isSelected ? 600 : 500,
                                      }}
                                    >
                                      {filter.label}
                                    </span>

                                    <span
                                      className="d-flex align-items-center justify-content-center rounded-circle"
                                      style={{
                                        width: '24px',
                                        height: '24px',
                                        backgroundColor: isSelected ? '#FEE2E2' : '#EEF2FF',
                                        color: isSelected ? '#DC3545' : '#24247F',
                                        transition: 'all 0.2s ease',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {isSelected ? (
                                        <X size={12} strokeWidth={2.5} />
                                      ) : (
                                        <Plus size={12} strokeWidth={2.5} />
                                      )}
                                    </span>
                                  </button>
                                )
                              })
                            ) : (
                              <div
                                className="px-3 py-4 text-center text-muted"
                                style={{
                                  fontSize: '0.75rem',
                                }}
                              >
                                <div className="mb-1">No hay filtros disponibles</div>

                                <small>Agrega filtros para configurar el reporte.</small>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="font-inter">
                    <div className="row g-3 align-items-end">
                      {visibleFilterKeys.map((key) => {
                        const item = report?.settings?.filters?.[key]

                        if (!item) return null

                        const isDefault = item.show_by_default === true

                        return (
                          <div key={key} className="col-12 col-md-3">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <CFormLabel
                                className="mb-0"
                                style={{
                                  color: '#64748B',
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                }}
                              >
                                {item.label}
                              </CFormLabel>

                              {!isDefault && (
                                <button
                                  type="button"
                                  className="border-0 bg-transparent p-0 d-flex align-items-center justify-content-center"
                                  onClick={() => removeFilter(key)}
                                  title="Quitar filtro"
                                  style={{
                                    color: '#94A3B8',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>

                            {item.type === 'select' && item.data === 'processes' && (
                              <Select
                                options={getFilterOptions(item, key)}
                                value={getSelectedOptions(item, key)}
                                onChange={(selectedOptions) =>
                                  handleFilterChange(key, selectedOptions)
                                }
                                isDisabled={
                                  !!report?.settings?.context && !contextSelections?.[currentLevel]
                                }
                                placeholder="Seleccione..."
                                isMulti
                                isClearable
                                isSearchable
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
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
                                          border: isSelected
                                            ? '1px solid #24247F'
                                            : '1px solid #CBD5E1',
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

                                  MultiValue: ({ data, index, getValue }) => {
                                    const values = getValue()

                                    return (
                                      <span
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          fontSize: '0.82rem',
                                          color: '#334155',
                                          marginRight: '4px',
                                          whiteSpace: 'nowrap',
                                          flexShrink: 0,
                                          minWidth: 'max-content',
                                        }}
                                      >
                                        <span style={{ fontWeight: 500 }}>{data.process_name}</span>

                                        <span style={{ margin: '0 3px' }}>:</span>

                                        <span>{data.status}</span>

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
                                    borderColor: state.hasValue ? '#24247F' : '#DBDFE6',
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
                                    whiteSpace: 'nowrap',
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
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
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
                                    fontFamily: 'Inter',
                                  }),

                                  menuList: (base) => ({
                                    ...base,
                                    padding: 0,
                                  }),
                                }}
                              />
                            )}

                            {item.type === 'select' && item.data !== 'processes' && (
                              <Select
                                options={getFilterOptions(item, key)}
                                value={getSelectedOptions(item, key)}
                                onChange={(selectedOptions) =>
                                  handleFilterChange(key, selectedOptions)
                                }
                                isDisabled={
                                  !!report?.settings?.context && !contextSelections?.[currentLevel]
                                }
                                placeholder="Seleccione..."
                                isMulti
                                isClearable
                                isSearchable
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
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
                                          border: isSelected
                                            ? '1px solid #24247F'
                                            : '1px solid #CBD5E1',
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
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          fontSize: '0.82rem',
                                          color: '#334155',
                                          marginRight: '4px',
                                          whiteSpace: 'nowrap',
                                          flexShrink: 0,
                                          minWidth: 'max-content',
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
                                    borderColor: state.hasValue ? '#24247F' : '#DBDFE6',
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
                                    whiteSpace: 'nowrap',
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
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
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
                                    fontFamily: 'Inter',
                                  }),

                                  menuList: (base) => ({
                                    ...base,
                                    padding: 0,
                                  }),
                                }}
                              />
                            )}

                            {item.type === 'date_range' && (
                              <DatePicker
                                selectsRange
                                locale="es"
                                startDate={
                                  selectedFilters[key]?.from
                                    ? new Date(`${selectedFilters[key].from}T00:00:00`)
                                    : null
                                }
                                endDate={
                                  selectedFilters[key]?.to
                                    ? new Date(`${selectedFilters[key].to}T00:00:00`)
                                    : null
                                }
                                onChange={(dates) => {
                                  const [start, end] = dates

                                  handleDateRangeChange(
                                    key,
                                    'from',
                                    start ? start.toISOString().split('T')[0] : '',
                                  )

                                  handleDateRangeChange(
                                    key,
                                    'to',
                                    end ? end.toISOString().split('T')[0] : '',
                                  )
                                }}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Seleccionar rango de fechas"
                                isClearable
                                wrapperClassName="w-100"
                                className="report-date-range"
                                calendarClassName="report-calendar"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
              {data && (
                <div
                  className="mt-4 animate-fade-in"
                  style={{
                    border: '1px solid #DBDFE6',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div className="p-0">
                    {loading ? (
                      <div className="d-flex flex-column align-items-center justify-content-center p-5">
                        <CSpinner
                          size="sm"
                          style={{ color: '#24247f', width: '28px', height: '28px' }}
                        />
                        <span className="font-inter small fw-semibold mt-3 text-muted">
                          Generando reporte...
                        </span>
                      </div>
                    ) : !data || data.length === 0 ? (
                      <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                          style={{
                            width: '56px',
                            height: '56px',
                            backgroundColor: '#F1F5F9',
                            color: '#94A3B8',
                          }}
                        >
                          <FileSpreadsheet size={28} />
                        </div>
                        <span
                          className="font-montserrat fw-semibold text-dark"
                          style={{ fontSize: '0.95rem' }}
                        >
                          No hay datos para mostrar
                        </span>
                        <p
                          className="font-inter text-muted mb-0 mt-1"
                          style={{ fontSize: '0.8rem', maxWidth: '360px' }}
                        >
                          Ajusta los filtros o columnas y haz clic en "Filtrar" para generar la
                          información.
                        </p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table
                          className="table align-middle mb-0"
                          style={{
                            tableLayout: 'auto',
                            width: 'max-content',
                            minWidth: '100%',
                            borderCollapse: 'separate',
                            borderSpacing: 0,
                          }}
                        >
                          <thead>
                            <tr className="font-poppins">
                              <th
                                colSpan={selectedFields.length}
                                className="text-center align-middle"
                                style={{
                                  ...thStyle,
                                  padding: '14px 18px',
                                  backgroundColor: '#F8FAFC',
                                  borderBottom: '1px solid #E2E8F0',
                                }}
                              >
                                <div className="d-flex align-items-center justify-content-between">
                                  <div className="d-flex align-items-center gap-2">
                                    <span
                                      className="fw-bold"
                                      style={{
                                        color: '#1E293B',
                                        fontSize: '0.9rem',
                                      }}
                                    >
                                      {report.name}
                                    </span>

                                    <CBadge
                                      shape="rounded-pill"
                                      className="px-2 py-1 font-inter fw-semibold"
                                      style={{
                                        backgroundColor: '#F1F5F9',
                                        color: '#475569',
                                        fontSize: '0.7rem',
                                      }}
                                    >
                                      {data.length} {data.length === 1 ? 'registro' : 'registros'}
                                    </CBadge>
                                  </div>
                                </div>
                              </th>
                            </tr>

                            <tr className="font-poppins">
                              {data_fields.map((field, index) => (
                                <th
                                  key={index}
                                  className="text-center align-middle"
                                  style={{
                                    ...thStyle,
                                    width: 'auto',
                                    minWidth: '60px',
                                    maxWidth: '160px',
                                    padding: '12px 10px',
                                  }}
                                >
                                  {field}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {data.map((row, index) => (
                              <tr key={index}>
                                {data_fields.map((field) => {
                                  const cell = row[field] ?? {}
                                  const value = cell.value ?? '-'
                                  const styles = cell.style ?? {}
                                  console.log(field, styles)

                                  const selectedField = selectedFields.find(
                                    (item) => item.label === field,
                                  )

                                  const isProcess =
                                    selectedField?.groupLabel === 'Procesos' ||
                                    selectedField?.label === 'Estado'

                                  return (
                                    <td
                                      key={field.data_key}
                                      className="table-cell"
                                      style={{
                                        backgroundColor: styles.background,
                                        color: styles.color,
                                        borderLeft: styles.borderLeft,
                                      }}
                                    >
                                      <div className="d-flex align-items-center justify-content-center h-100">
                                        <span className="font-inter text-center table-input">
                                          {isProcess && typeof value === 'string'
                                            ? value.toUpperCase()
                                            : value}
                                        </span>
                                      </div>
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CCard>
      {report && openColumnsModal && (
        <ReportColumnsModal
          visible={openColumnsModal}
          onClose={() => setOpenColumnsModal(false)}
          availableFields={availableFields}
          selectedFields={selectedFields}
          onSave={(fields) => {
            setSelectedFields(fields)
            setOpenColumnsModal(false)
          }}
        />
      )}
    </>
  )
}

export default Show
