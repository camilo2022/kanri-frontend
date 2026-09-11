import { useEffect, useMemo, useState } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormInput,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from '@coreui/react'
import {
  Search,
  GripVertical,
  X,
  Check,
  Save,
  Folder,
  ChevronDown,
  SquareCheckBig,
} from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Select from 'react-select'

const SortableField = ({ field, index, onRemove, onDisplayChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: field.data_key,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const hasDisplayOptions = field.display?.options?.length > 0
  const selectedDisplay = field.display?.options?.find(
    (option) => option.value === (field.displayValue ?? field.display.default ?? ''),
  )

  const nestedDisplay = selectedDisplay?.display
  const hasNestedDisplayOptions = nestedDisplay?.options?.length > 0

  return (
    <div ref={setNodeRef} style={style} className="report-sortable-field">
      <div {...attributes} {...listeners} className="report-drag-handle">
        <GripVertical size={16} />
      </div>

      <div className="report-field-order">{index + 1}</div>

      <div className="flex-grow-1">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: '11px',
              color: '#94A3B8',
              fontWeight: 500,
            }}
          >
            {field.groupLabel}
          </span>

          <span
            style={{
              color: '#CBD5E1',
              fontSize: '12px',
            }}
          >
            /
          </span>

          <span
            className="report-field-label"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
            }}
          >
            {field.label}
          </span>
        </div>
      </div>

      {hasDisplayOptions && (
        <div className="d-flex align-items-center gap-2 ms-auto me-1">
          <Select
            value={
              field.display.options.find(
                (option) => option.value === (field.displayValue ?? display.default ?? ''),
              ) ?? null
            }
            onChange={(option) => {
              console.log(option)
              onDisplayChange(field.data_key, option?.value ?? '')
            }}
            options={field.display.options}
            isSearchable={false}
            classNamePrefix="display-select"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: '28px',
                height: '28px',
                width: '170px',
                borderColor: state.isFocused ? '#24247F' : '#E2E8F0',
                backgroundColor: '#F8FAFC',
                boxShadow: state.isFocused ? '0 0 0 2px rgba(36, 36, 127, 0.12)' : 'none',
                borderRadius: '6px',
                fontFamily: 'Inter',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',

                '&:hover': {
                  borderColor: '#24247F',
                },
              }),

              valueContainer: (base) => ({
                ...base,
                height: '28px',
                minHeight: '28px',
                padding: '0 8px',
                overflow: 'hidden',
                flexWrap: 'nowrap',
                whiteSpace: 'nowrap',
              }),

              singleValue: (base) => ({
                ...base,
                color: '#475569',
                fontFamily: 'Inter',
                fontSize: '0.75rem',
                fontWeight: 500,
                margin: 0,
              }),

              indicatorsContainer: (base) => ({
                ...base,
                height: '28px',
              }),

              dropdownIndicator: (base, state) => ({
                ...base,
                color: state.isFocused ? '#24247F' : '#64748B',
                padding: '4px',
                '&:hover': {
                  color: '#24247F',
                },
              }),

              indicatorSeparator: () => ({
                display: 'none',
              }),

              menu: (base) => ({
                ...base,
                zIndex: 9999,
                marginTop: '4px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.10)',
                overflow: 'hidden',
                fontFamily: 'Inter',
                fontSize: '0.75rem',
              }),

              menuList: (base) => ({
                ...base,
                padding: '4px',
              }),

              option: (base, state) => ({
                ...base,
                padding: '6px 8px',
                borderRadius: '4px',
                fontFamily: 'Inter',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#475569',
                backgroundColor: state.isSelected
                  ? '#EEF2FF'
                  : state.isFocused
                    ? '#F8FAFC'
                    : 'transparent',
                cursor: 'pointer',

                '&:active': {
                  backgroundColor: '#EEF2FF',
                },
              }),
            }}
          />
        </div>
      )}

      <button
        type="button"
        className="report-remove-field"
        onClick={() => onRemove(field.data_key)}
      >
        <X size={15} />
      </button>
    </div>
  )
}

const ReportColumnsModal = ({
  visible,
  onClose,
  availableFields = [],
  selectedFields = [],
  onSave,
}) => {
  const [search, setSearch] = useState('')
  const [fields, setFields] = useState(selectedFields)
  const [activeGroup, setActiveGroup] = useState([])

  console.log(availableFields)

  useEffect(() => {
    if (availableFields && typeof availableFields === 'object') {
      const keys = Object.keys(availableFields)

      if (keys.length > 0) {
        setActiveGroup(keys)
      }
    }
  }, [availableFields])

  const toggleGroup = (groupKey) => {
    setActiveGroup((prev) => {
      if (prev.includes(groupKey)) {
        return prev.filter((key) => key !== groupKey)
      }

      return [...prev, groupKey]
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  )

  const filteredFields = useMemo(() => {
    const value = search.toLowerCase().trim()

    const groups = availableFields || {}

    if (!value) {
      return groups
    }

    return Object.fromEntries(
      Object.entries(groups)
        .map(([groupKey, group]) => {
          const filtered = Object.fromEntries(
            Object.entries(group.fields || {}).filter(
              ([key, field]) =>
                field.label?.toLowerCase().includes(value) ||
                field.data_key?.toLowerCase().includes(value) ||
                key.toLowerCase().includes(value),
            ),
          )

          return [
            groupKey,
            {
              ...group,
              fields: filtered,
            },
          ]
        })
        .filter(([, group]) => Object.keys(group.fields).length > 0),
    )
  }, [availableFields, search])

  const formatGroupTitle = (key) => {
    return key.replace(/_/g, ' ').toUpperCase()
  }

  const handleAddField = (field, groupKey, groupLabel) => {
    console.log(field, groupKey, groupLabel)
    const exists = fields.some((item) => item.data_key === field.data_key)

    if (exists) {
      return
    }

    console.log(field, groupKey, groupLabel)

    setFields((prev) => [
      ...prev,
      {
        ...field,
        groupKey,
        groupLabel,
        order: prev.length + 1,
        displayValue: field.display?.default ?? field.display?.styles ?? null,
        relation: field.relation ?? null,
      },
    ])
  }

  const handleToggleGroupFields = (groupFields) => {
    const groupItems = Object.values(groupFields.fields || {})

    const groupKeys = new Set(groupItems.map((field) => field.data_key))

    const allSelected = groupItems.every((field) =>
      fields.some((item) => item.data_key === field.data_key),
    )

    if (allSelected) {
      setFields((prev) =>
        prev
          .filter((item) => !groupKeys.has(item.data_key))
          .map((field, index) => ({
            ...field,
            order: index + 1,
          })),
      )

      return
    }

    setFields((prev) => {
      const existingKeys = new Set(prev.map((item) => item.data_key))

      const newFields = groupItems
        .filter((field) => !existingKeys.has(field.data_key))
        .map((field, index) => ({
          ...field,
          groupLabel: groupFields.label,
          order: prev.length + index + 1,
          displayValue: field.display?.default ?? null,
        }))
      return [...prev, ...newFields]
    })
  }

  const handleRemoveField = (dataKey) => {
    setFields((prev) =>
      prev
        .filter((field) => field.data_key !== dataKey)
        .map((field, index) => ({
          ...field,
          order: index + 1,
        })),
    )
  }

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) {
      return
    }

    setFields((items) => {
      const oldIndex = items.findIndex((item) => item.data_key === active.id)

      const newIndex = items.findIndex((item) => item.data_key === over.id)

      return arrayMove(items, oldIndex, newIndex).map((field, index) => ({
        ...field,
        order: index + 1,
      }))
    })
  }

  const handleReset = () => {
    setFields(selectedFields)
    setSearch('')
  }

  const getTotalFields = () => {
    return Object.values(filteredFields).reduce(
      (total, group) => total + Object.keys(group.fields || {}).length,
      0,
    )
  }

  const handleDisplayChange = (dataKey, value) => {
    setFields((prev) =>
      prev.map((field) =>
        field.data_key === dataKey
          ? {
              ...field,
              displayValue: value,
            }
          : field,
      ),
    )
  }

  console.log(fields)

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      alignment="center"
      backdrop="static"
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
          Configurar columnas
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        <div className="row g-4">
          <div className="col-md-5 report-columns-divider">
            <div className="report-columns-panel">
              <div className="report-panel-header mb-2">
                <div className="report-panel-title">Campos disponibles</div>
                <span className="report-count">{getTotalFields()}</span>
              </div>

              <div className="position-relative mb-2">
                <Search size={16} className="report-search-icon" />

                <CFormInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar campo..."
                  className="report-search-input font-inter"
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  maxHeight: '330px',
                  overflowY: 'auto',
                }}
              >
                {Object.entries(filteredFields).map(([groupKey, groupFields]) => {
                  const isOpen = activeGroup.includes(groupKey)

                  const groupItems = Object.values(groupFields.fields || {})

                  const selectedCount = groupItems.filter((field) =>
                    fields.some((item) => item.data_key === field.data_key),
                  ).length

                  const allSelected = groupItems.length > 0 && selectedCount === groupItems.length

                  const someSelected = selectedCount > 0 && selectedCount < groupItems.length

                  return (
                    <div
                      key={groupKey}
                      style={{
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        background: '#FFFFFF',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isOpen ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                      }}
                    >
                      <div
                        onClick={() => toggleGroup(groupKey)}
                        style={{
                          padding: '12px 14px',
                          background: isOpen ? '#F1F5F9' : '#F8FAFC',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: isOpen ? '1px solid #E2E8F0' : '1px solid transparent',
                          transition: 'background 0.2s ease, border-color 0.2s ease',
                          userSelect: 'none',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            color: isOpen ? '#1E3A8A' : '#475569',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <Folder size={15} color={isOpen ? '#1E3A8A' : '#64748B'} />
                          <span>{groupFields.label}</span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleGroupFields(groupFields)
                            }}
                            style={{
                              width: '18px',
                              height: '18px',
                              padding: 0,
                              borderRadius: '4px',
                              border:
                                allSelected || someSelected
                                  ? '1px solid #24247F'
                                  : '1px solid #CBD5E1',
                              backgroundColor: allSelected
                                ? '#24247F'
                                : someSelected
                                  ? '#EEF2FF'
                                  : '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            {allSelected && <Check size={13} color="white" strokeWidth={3} />}

                            {someSelected && !allSelected && (
                              <div
                                style={{
                                  width: '8px',
                                  height: '2px',
                                  backgroundColor: '#24247F',
                                  borderRadius: '2px',
                                }}
                              />
                            )}
                          </button>

                          <span
                            style={{
                              fontSize: '11px',
                              color: '#94A3B8',
                              fontWeight: 500,
                            }}
                          >
                            {selectedCount}/{groupItems.length}
                          </span>

                          <ChevronDown
                            size={15}
                            color={isOpen ? '#1E3A8A' : '#64748B'}
                            style={{
                              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s ease',
                            }}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateRows: isOpen ? '1fr' : '0fr',
                          transition: 'grid-template-rows 0.3s ease-in-out',
                        }}
                      >
                        <div style={{ overflow: 'hidden' }}>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              padding: '8px',
                              overflowY: 'auto',
                            }}
                          >
                            {Object.entries(groupFields?.fields).map(([key, field]) => {
                              const selected = fields.some(
                                (item) => item.data_key === field.data_key,
                              )

                              return (
                                <button
                                  key={field.data_key}
                                  type="button"
                                  className={`report-available-field w-100 ${selected ? 'selected' : ''}`}
                                  onClick={() =>
                                    !selected
                                      ? handleAddField(field, groupKey, groupFields.label)
                                      : handleRemoveField(field.data_key)
                                  }
                                  style={{
                                    border: 'none',
                                    background: selected ? '#F1F5F9' : 'transparent',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '8px 10px',
                                    textAlign: 'left',
                                    cursor: selected ? 'default' : 'pointer',
                                    transition: 'background 0.15s ease',
                                  }}
                                >
                                  <div className="report-checkbox" style={{ minWidth: '16px' }}>
                                    {selected && <Check size={13} />}
                                  </div>

                                  <div className="text-start">
                                    <div
                                      className="report-field-label"
                                      style={{ fontSize: '13px', lineHeight: '1.2' }}
                                    >
                                      {field.label}
                                    </div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="col-md-7">
            <div className="report-columns-panel">
              <div className="report-panel-header">
                <div className="report-panel-title">Columnas del reporte</div>
                <span className="report-count">{fields.length}</span>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map((field) => field.data_key)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="report-selected-list mt-2">
                    {fields.length === 0 ? (
                      <div className="report-empty-state">
                        <div className="report-empty-icon">
                          <Search size={20} />
                        </div>

                        <div className="font-inter fw-semibold">No hay columnas seleccionadas</div>
                      </div>
                    ) : (
                      fields.map((field, index) => (
                        <SortableField
                          key={field.data_key}
                          field={field}
                          index={index}
                          onRemove={handleRemoveField}
                          onDisplayChange={handleDisplayChange}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>
      </CModalBody>

      <CModalFooter>
        <div
          className="me-auto font-inter text-muted"
          style={{
            fontSize: '13px',
          }}
        >
          {fields.length} {fields.length === 1 ? 'columna seleccionada' : 'columnas seleccionadas'}
        </div>

        <CButton color="light" size="sm" onClick={handleReset}>
          Restablecer
        </CButton>

        <CButton color="secondary" size="sm" onClick={onClose}>
          Cancelar
        </CButton>

        <CButton className="font-inter report-save-button" size="sm" onClick={() => onSave(fields)}>
          <SquareCheckBig size={16} className="me-1" />
          Aplicar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ReportColumnsModal
