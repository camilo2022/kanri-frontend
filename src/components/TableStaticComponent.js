import api from '../API/api'
import { getConfig } from '../axiosConfig'
import {
  CFormInput,
  CButton,
  CFormSelect,
  CFormFeedback,
  CFormTextarea,
  CFormCheck,
  CRow,
  CCol,
} from '@coreui/react'
import { Form, BadgeCheck, BadgeAlert, Info, Plus, Edit3, Layout, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import FieldRules from '@/components/FieldRules'
import Swal from 'sweetalert2'
import Select from 'react-select'

const TableStaticComponent = ({
  data,
  handleSubmitEdit,
  errors,
  validated,
  setValidated,
  catalogsData,
  models,
  dataGet,
}) => {
  const [edit, setEdit] = useState(false)
  const [auxEdit, setAuxEdit] = useState()
  const [structure, setStructure] = useState({
    header: {},
    body: [],
  })

  const [auxHeader, setAuxHeader] = useState({
    label: '',
    colspan: 1,
    rowspan: 1,
  })

  const [auxTh, setAuxTh] = useState({
    cell: 'th',
    label: '',
    colspan: 1,
    rowspan: 1,
  })

  const [auxTd, setAuxTd] = useState({
    cell: 'td',
    type: '',
    field: '',
    rules: [],
    colspan: 1,
    rowspan: 1,
  })

  const addBlock = async (info, element) => {
    const deepCopy = {
      ...structure,
      body: structure?.body?.map((field) => [...field]) || [],
    }

    let newId = 1
    const ids = new Set(deepCopy.body.flat().map((v) => v.id))
    while (ids.has(newId)) newId++

    const new_data = {
      ...info,
      id: newId,
    }

    const occupied = {}
    const maxCol = data?.header?.colspan

    const bodyCopy = deepCopy.body.map((row) => [...row])

    let inserted = false

    bodyCopy.forEach((row, rowIndex) => {
      if (inserted) return

      const blockedCols = occupied[rowIndex] || 0

      const usedCols = row.reduce((acc, cell) => acc + cell.colspan, 0)

      if (usedCols + new_data.colspan <= maxCol - blockedCols) {
        row.push(new_data)
        inserted = true
      }

      row.forEach((cell) => {
        if (cell.rowspan > 1) {
          for (let i = 1; i < cell.rowspan; i++) {
            occupied[rowIndex + i] = (occupied[rowIndex + i] || 0) + cell.colspan
          }
        }
      })
    })

    if (!inserted) {
      bodyCopy.push([new_data])
    }

    const success = await handleSubmitEdit(
      'static',
      {
        ...deepCopy,
        body: bodyCopy,
      },
      false,
    )

    setTimeout(() => {
      if (success) {
        setValidated((prev) => ({
          ...prev,
          ['static']: false,
        }))
        setStructure({
          ...deepCopy,
          body: bodyCopy,
        })
        if (element === 'th') {
          setAuxTh({
            cell: 'th',
            label: '',
            colspan: 1,
            rowspan: 1,
          })
        } else {
          setAuxTd({
            cell: 'td',
            type: '',
            field: '',
            rules: [],
            colspan: 1,
            rowspan: 1,
          })
        }
      }
    }, 1000)
  }

  const updateBlock = async (info, element) => {
    const maxCol = data?.header?.colspan || 0

    const deepCopy = {
      ...structure,
      body: structure?.body?.map((row) => [...row]) || [],
    }

    const bodyCopy = deepCopy.body

    const rowIndex = bodyCopy.findIndex((row) => row.some((cell) => cell.id === info.id))

    if (rowIndex === -1) return

    const cellIndex = bodyCopy[rowIndex].findIndex((cell) => cell.id === info.id)

    if (cellIndex === -1) return

    const tempRow = bodyCopy[rowIndex].filter((cell) => cell.id !== info.id)

    const usedCols = tempRow.reduce((acc, cell) => acc + Number(cell.colspan || 0), 0)

    if (usedCols + Number(info.colspan) <= maxCol) {
      tempRow.splice(cellIndex, 0, info)

      bodyCopy[rowIndex] = tempRow
    } else {
      bodyCopy[rowIndex] = tempRow

      let inserted = false

      for (let i = rowIndex + 1; i < bodyCopy.length; i++) {
        const rowUsed = bodyCopy[i].reduce((acc, cell) => acc + Number(cell.colspan || 0), 0)

        if (rowUsed + Number(info.colspan) <= maxCol) {
          bodyCopy[i].push(info)
          inserted = true
          break
        }
      }

      if (!inserted) {
        bodyCopy.push([info])
      }
    }

    const success = await handleSubmitEdit(
      'static',
      {
        ...deepCopy,
        body: bodyCopy,
      },
      false,
    )

    setTimeout(() => {
      if (success) {
        setValidated((prev) => ({
          ...prev,
          static: false,
        }))

        setStructure({
          ...deepCopy,
          body: bodyCopy,
        })

        if (element === 'th') {
          setAuxTh({
            cell: 'th',
            label: '',
            colspan: 1,
            rowspan: 1,
          })
        } else {
          setAuxTd({
            cell: 'td',
            type: '',
            field: '',
            rules: [],
            colspan: 1,
            rowspan: 1,
          })
        }
        setAuxEdit()
      }
    }, 1000)
  }
  
  const deleteBlock = async (info, element) => {
    const result = await Swal.fire({
      title: 'Eliminar Elemento',
      html: `<div style="font-size:14px">
               Se eliminará el elemento de la estructura.<br/>
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

    const deepCopy = {
      ...structure,
      body: structure?.body?.map((field) => [...field]) || [],
    }

    const bodyCopy = deepCopy.body.map((row) => [...row])
    const aux = bodyCopy.map((row) => row.filter((cell) => cell.id !== info.id))

    const success = await handleSubmitEdit(
      'static',
      {
        ...deepCopy,
        body: aux,
      },
      false,
    )

    setTimeout(() => {
      if (success) {
        setValidated((prev) => ({
          ...prev,
          ['static']: false,
        }))
        setStructure({
          ...deepCopy,
          body: aux,
        })
      }
    }, 1000)
  }

  const addHeader = async (info) => {
    const deepCopy = {
      ...structure,
      header: info,
    }

    const success = await handleSubmitEdit('static', deepCopy, false)

    setTimeout(() => {
      if (success) {
        setValidated((prev) => ({
          ...prev,
          ['static']: false,
        }))
        setStructure({
          ...deepCopy,
        })
        setAuxHeader({
          label: '',
          colspan: 1,
          rowspan: 1,
        })
        setAuxEdit()
      }
    }, 1000)
  }

  const fieldTypes = [
    {
      name: 'Texto y Contenido',
      options: [
        { value: 'text', label: 'Texto Corto (text)' },
        { value: 'textarea', label: 'Área de Texto (textarea)' },
      ],
    },
    {
      name: 'Números y Medidas',
      options: [{ value: 'number', label: 'Número (number)' }],
    },
    {
      name: 'Fechas y Tiempo',
      options: [
        { value: 'date', label: 'Fecha (date)' },
        { value: 'datetime', label: 'Fecha y Hora (datetime)' },
      ],
    },
    {
      name: 'Especiales',
      options: [
        { value: 'boolean', label: 'Si / No (Switch/Check)' },
        { value: 'select', label: 'Select estático (opciones definidas)' },
        { value: 'selectdinamic', label: 'Select dinámico (dependiente de modelo)' },
      ],
    },
  ]

  const updateRules = (index, newRules) => {
    const newSchema = structure.body?.map((item, i) =>
      i === index ? { ...item, rules: newRules } : item,
    )
    setStructure({ ...structure, body: newSchema })
  }

  const updateRulesStatic = (newRules, model = '') => {
    if (model !== '') {
      setAuxTd((prev) => ({
        ...prev,
        model: models[model].model,
        rules: newRules,
      }))
    } else {
      setAuxTd((prev) => ({
        ...prev,
        rules: newRules,
      }))
    }
  }

  const updateField = (index, key, value) => {
    const newSchema = structure.body.map((item, i) => {
      if (i !== index) return item

      const rules = item.rules || []

      const exists = rules.some((r) => r.startsWith(`${key}:`))
      const updatedRules = exists
        ? rules.map((r) => (r.startsWith(`${key}:`) ? `${key}:${value}` : r))
        : [...rules, `${key}:${value}`]
      return {
        ...item,
        rules: updatedRules,
      }
    })
    setStructure((prev) => ({
      ...prev,
      body: newSchema,
    }))
  }

  const updateFieldStatic = (key, value) => {
    const rules = auxTd.rules || []

    if (key === 'options') {
      const options = Object.fromEntries(
        value.split(',').map((option) => {
          const trimmed = option.trim()
          return [trimmed, trimmed]
        }),
      )
      const exists = rules.some((r) => r.startsWith(`in:`))
      const updatedRules = exists
        ? rules.map((r) => (r.startsWith(`in:`) ? `in:${value}` : r))
        : [...rules, `in:${value}`]

      setAuxTd((prev) => ({
        ...prev,
        options,
        rules: updatedRules,
      }))
    }

    const exists = rules.some((r) => r.startsWith(`${key}:`))
    const updatedRules = exists
      ? rules.map((r) => (r.startsWith(`${key}:`) ? `${key}:${value}` : r))
      : [...rules, `${key}:${value}`]

    setAuxTd((prev) => ({
      ...prev,
      rules: updatedRules,
    }))
  }

  const onEditHeader = () => {}

  const isDisabled = (element) => {
    return auxEdit != null && auxEdit !== element
  }

  const customFilterOption = (option, rawInput) => {
    const words = rawInput.toLowerCase().split(' ')
    const label = option.label.toLowerCase()
    return words.every((word) => label.includes(word))
  }

  const Preview = () => {
    const header = edit ? structure?.header || '' : data?.header || ''
    const body = edit ? structure?.body || '' : data?.body || ''
    return (
      <>
        <div
          className={`border rounded-3 overflow-hidden shadow-sm bg-white font-inter ${edit ? 'border-primary' : ''}`}
        >
          <div
            className={
              ' p-3 border-bottom d-flex align-items-center justify-content-between transition-colors'
            }
          >
            <div className="d-flex align-items-center gap-2">
              <Layout size={18} />
              <span
                className="fw-bold text-uppercase"
                style={{ fontSize: '11px', letterSpacing: '1px' }}
              >
                {edit ? 'Editor de Estructura' : 'Vista Previa'}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              {edit ? (
                <CButton
                  color="secondary"
                  size="sm"
                  className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                  onClick={() => {
                    setEdit(false)
                    setStructure({ header: {}, body: [] })
                    setValidated((prev) => ({
                      ...prev,
                      ['static']: false,
                    }))
                    setAuxEdit()
                    setAuxTd({
                      cell: 'td',
                      type: '',
                      field: '',
                      rules: [],
                      colspan: 1,
                      rowspan: 1,
                    })
                    setAuxTh({
                      cell: 'th',
                      label: '',
                      colspan: 1,
                      rowspan: 1,
                    })
                  }}
                >
                  Cancelar
                </CButton>
              ) : (
                <>
                  <CButton
                    color="primary"
                    size="sm"
                    className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                    onClick={() => {
                      if (Object.keys(data || {}).length === 0) {
                        setStructure({
                          header: {},
                          body: [],
                        })
                      } else {
                        const deepCopy = {
                          ...data,
                          body: data?.body?.map((field) => [...field]),
                        }
                        setStructure(deepCopy)
                      }
                      setEdit(true)
                    }}
                  >
                    <Edit3 size={16} /> Editar Estructura
                  </CButton>
                </>
              )}
            </div>
          </div>
          {(data?.body?.length ?? 0) > 0 ||
          (structure?.body?.length ?? 0) > 0 ||
          Object.keys(data?.header || {}).length > 0 ||
          Object.keys(structure?.header || {}).length > 0 ? (
            <>
              <table
                className="w-100 mb-0"
                style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}
              >
                <thead>
                  <tr>
                    <th
                      colSpan={header.colspan}
                      className="p-3 text-center font-inter position-relative"
                      style={{
                        fontSize: '17px',
                        color: '#C21111',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                      }}
                      onClick={() => edit && onEditHeader()}
                    >
                      {edit ? structure?.header.label || '' : data?.header.label || ''}

                      {edit && (
                        <div
                          className="edit-overlay d-flex gap-1 position-absolute"
                          style={{ top: '5px', right: '5px' }}
                        >
                          <button
                            onClick={() => {
                              setAuxEdit('header')
                              setAuxHeader(structure?.header)
                            }}
                            className="btn btn-sm btn-white border shadow-sm p-1 text-primary bg-white"
                          >
                            <Edit3 size={12} />
                          </button>
                        </div>
                      )}
                    </th>
                  </tr>
                </thead>
                {data?.body?.length > 0 || structure.body?.length > 0 ? (
                  <tbody>
                    {body.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => {
                          const cellBaseStyle = {
                            padding: '15px',
                            border: '1px solid #e9ecef',
                            verticalAlign: 'middle',
                            textAlign: 'center',
                            position: 'relative',
                          }

                          return (
                            <td
                              key={j}
                              colSpan={cell.colspan}
                              rowSpan={cell.rowspan}
                              style={{
                                ...cellBaseStyle,
                                backgroundColor: cell.cell === 'th' ? '#f8f9fa' : '#fff',
                                border: edit ? '1px dashed #0d6efd44' : '1px solid #e9ecef',
                              }}
                              className="preview-cell"
                            >
                              <div className="d-flex align-items-center justify-content-center">
                                {cell.cell === 'th' ? (
                                  <span
                                    className="fw-bold text-secondary font-poppins"
                                    style={{ fontSize: '13px' }}
                                  >
                                    {cell.label}
                                  </span>
                                ) : (
                                  <div
                                    className="d-flex align-items-center gap-2 bg-light p-2 rounded-2"
                                    style={{ minWidth: '100%', border: '1px dashed #dee2e6' }}
                                  >
                                    {cell.type !== 'select' && cell.type !== 'selectdinamic' ? (
                                      cell.type === 'textarea' ? (
                                        <CFormTextarea
                                          size="sm"
                                          value={cell.value}
                                          className="custom-input"
                                        />
                                      ) : cell.type === 'boolean' ? (
                                        <CFormCheck defaultChecked className="custom-input" />
                                      ) : (
                                        <CFormInput
                                          size="sm"
                                          type={cell.type}
                                          value={cell.value}
                                          className="custom-input"
                                        />
                                      )
                                    ) : (
                                      <Select
                                        value={null}
                                        options={
                                          cell.type === 'select'
                                            ? Object.values(cell.options).map((opt) => ({
                                                value: opt.trim(),
                                                label: opt.trim(),
                                              }))
                                            : catalogsData[cell.model]?.map((opt) => {
                                                const optionPath = Object.entries(models).find(
                                                  ([_, value]) => value?.model === cell?.model,
                                                )?.[1]?.option

                                                return {
                                                  value: opt.id,
                                                  label: dataGet(optionPath, opt, ''),
                                                }
                                              }) || []
                                        }
                                        isSearchable
                                        filterOption={customFilterOption}
                                        className="font-inter"
                                        style={{ fontSize: '11px', with: '100%' }}
                                        placeholder="Seleccione..."
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        styles={{
                                          container: (base) => ({
                                            ...base,
                                            width: '100%',
                                          }),

                                          control: (base, state) => ({
                                            ...base,
                                            width: '100%',
                                            minHeight: '32px',
                                            height: '32px',
                                            borderRadius: '0.375rem',
                                            borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
                                            boxShadow: state.isFocused
                                              ? '0 0 0 0.15rem rgba(13, 110, 253, 0.15)'
                                              : 'none',
                                            '&:hover': {
                                              borderColor: '#86b7fe',
                                            },
                                            fontSize: '11px',
                                            fontFamily: 'Inter, sans-serif',
                                            backgroundColor: '#fff',
                                            overflow: 'hidden',
                                          }),

                                          valueContainer: (base) => ({
                                            ...base,
                                            height: '32px',
                                            padding: '0 6px',
                                            overflow: 'hidden',
                                            flexWrap: 'nowrap',
                                          }),

                                          input: (base) => ({
                                            ...base,
                                            margin: 0,
                                            padding: 0,
                                          }),

                                          indicatorsContainer: (base) => ({
                                            ...base,
                                            height: '32px',
                                          }),

                                          placeholder: (base) => ({
                                            ...base,
                                            color: '#6c757d',
                                            fontSize: '11px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                          }),

                                          singleValue: (base) => ({
                                            ...base,
                                            color: '#212529',
                                            fontSize: '11px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                          }),

                                          menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                          }),

                                          menu: (base) => ({
                                            ...base,
                                            borderRadius: '0.375rem',
                                            overflow: 'hidden',
                                            fontFamily: 'Inter, sans-serif',
                                            fontSize: '12px',
                                          }),

                                          option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isFocused ? '#f8f9fa' : '#fff',
                                            color: '#212529',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                          }),
                                        }}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                              {edit && (
                                <div
                                  className="edit-overlay d-flex gap-1 position-absolute"
                                  style={{ top: '5px', right: '5px' }}
                                >
                                  <button
                                    onClick={() => {
                                      setAuxEdit(cell.cell)
                                      cell.cell === 'th' ? setAuxTh(cell) : setAuxTd(cell)
                                    }}
                                    className="btn btn-sm btn-white border shadow-sm p-1 text-primary bg-white"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                  <button
                                    onClick={() => deleteBlock(cell)}
                                    className="btn btn-sm btn-white border shadow-sm p-1 text-danger bg-white"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan={data?.header?.colspan || structure.header?.colspan}>
                        <div className="p-5 text-center bg-light rounded-bottom">
                          <div className="mb-3">
                            <Info size={40} className="text-muted opacity-50" />
                          </div>

                          <h6 className="font-montserrat fw-bold text-secondary">
                            Aún no hay una estructura definida
                          </h6>

                          <p className="text-muted font-inter small mb-0">
                            Utiliza el botón "Editar Estructura" para empezar a construir la
                            estructura de la tabla.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
              <div className="p-2 bg-white border-top d-flex justify-content-end">
                <small
                  className="text-muted d-flex align-items-center gap-1"
                  style={{ fontSize: '10px' }}
                >
                  <Info size={12} /> Ajuste automático basado en spans
                </small>
              </div>
            </>
          ) : (
            <div className="p-5 text-center bg-light rounded-bottom">
              <div className="mb-3">
                <Info size={40} className="text-muted opacity-50" />
              </div>
              <h6 className="font-montserrat fw-bold text-secondary">
                Aún no hay columnas definidas
              </h6>
              <p className="text-muted font-inter small mb-0">
                Utiliza el botón "Editar Estructura" para empezar a construir la estructura de la
                tabla.
              </p>
            </div>
          )}
        </div>
      </>
    )
  }

  const minColspan = Math.max(
    ...(structure?.body?.map((row) =>
      row.reduce((acc, cell) => acc + Number(cell.colspan || 0), 0),
    ) || [1]),
  )

  return (
    <>
      <div
        hidden={!edit}
        className="bg-white rounded-3 border shadow-sm overflow-hidden mb-3 p-4 animate-fade-in"
      >
        <CRow>
          <CCol
            md={Object.keys(structure?.header).length !== 0 && auxEdit !== 'header' ? 6 : 4}
            hidden={Object.keys(structure?.header).length !== 0 && auxEdit !== 'header'}
          >
            <div
              className="position-relative p-3 pt-4 border rounded-3 mb-4 mt-3"
              style={{ borderColor: '#e2e8f0' }}
            >
              <div
                className="position-absolute bg-white px-2 d-flex align-items-center gap-2 fw-bold font-montserrat"
                style={{
                  top: '-10px',
                  left: '15px',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  color: '#0934a8',
                }}
              >
                <Form size={15} strokeWidth={2.5} />
                ENCABEZADO DE LA TABLA
              </div>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex flex-column mb-2">
                  <label className="text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>
                    NOMBRE
                  </label>
                  <CFormInput
                    size="sm"
                    className="font-montserrat fw-semibold custom-input"
                    value={auxHeader.label}
                    onChange={(e) =>
                      setAuxHeader({ ...auxHeader, label: e.target.value.toUpperCase() })
                    }
                    invalid={!!errors?.errors?.[`settings.schema.static.header.label`] && validated}
                    valid={
                      !errors?.errors?.[`settings.schema.static.header.label`] &&
                      auxHeader.label !== '' &&
                      validated
                    }
                  />
                  <CFormFeedback invalid>
                    {errors?.errors?.[`settings.schema.static.header.label`]?.map((error, i) => (
                      <div key={i} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter fw-lighter">{error}</small>
                      </div>
                    ))}
                  </CFormFeedback>
                  <CFormFeedback valid>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter fw-lighter">Dato Válido</small>
                    </div>
                  </CFormFeedback>
                </div>
                <div className="bg-light p-2 rounded border">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="text-muted fw-bold" style={{ fontSize: '10px' }}>
                      CONFIGURACIÓN DE DIMENSIONES
                    </span>
                  </div>
                  <CRow className="g-2">
                    <CCol xs={6}>
                      <div className="d-flex flex-column">
                        <label
                          className="text-muted text-uppercase mb-1"
                          style={{ fontSize: '9px', fontWeight: 'bold' }}
                        >
                          COLUMNAS
                        </label>
                        <CFormInput
                          size="sm"
                          type="number"
                          className="font-inter text-primary text-center input-custom"
                          style={{ fontSize: '12px', height: '30px' }}
                          value={auxHeader.colspan}
                          min={minColspan}
                          onChange={(e) => {
                            let value = e.target.value
                            if (value === '') {
                              setAuxHeader({
                                ...auxHeader,
                                colspan: '',
                              })
                              return
                            }

                            value = Number(value)
                            if (value < minColspan) return

                            setAuxHeader({
                              ...auxHeader,
                              colspan: value,
                            })
                          }}
                          invalid={
                            !!errors?.errors?.[`settings.schema.static.header.colspan`] && validated
                          }
                          valid={
                            !errors?.errors?.[`settings.schema.static.header.colspan`] &&
                            auxHeader.colspan !== '' &&
                            validated
                          }
                        />
                        <CFormFeedback invalid>
                          {errors?.errors?.[`settings.schema.static.header.colspan`]?.map(
                            (error, i) => (
                              <div key={i} className="d-flex align-items-center gap-1">
                                <BadgeAlert size={13} />
                                <small className="font-inter fw-lighter">{error}</small>
                              </div>
                            ),
                          )}
                        </CFormFeedback>
                        <CFormFeedback valid>
                          <div className="d-flex align-items-center gap-1">
                            <BadgeCheck size={13} />
                            <small className="font-inter fw-lighter">Dato Válido</small>
                          </div>
                        </CFormFeedback>
                      </div>
                    </CCol>
                    <CCol xs={6}>
                      <div className="d-flex flex-column">
                        <label
                          className="text-muted text-uppercase mb-1"
                          style={{ fontSize: '9px', fontWeight: 'bold' }}
                        >
                          FILAS
                        </label>
                        <CFormInput
                          size="sm"
                          type="number"
                          className="font-inter text-primary text-center input-custom"
                          style={{ fontSize: '12px', height: '30px' }}
                          value={auxHeader.rowspan}
                          onChange={(e) => {
                            structure?.body?.forEach((row) => {
                              const usedCols = row.reduce((acc, cell) => acc + cell.colspan, 0)
                            })
                            let value = e.target.value
                            if (value === '') {
                              setAuxHeader({
                                ...auxHeader,
                                rowspan: '',
                              })
                              return
                            }
                            value = Number(value)
                            if (value < 1) return
                            setAuxHeader({ ...auxHeader, rowspan: value })
                          }}
                          invalid={
                            !!errors?.errors?.[`settings.schema.static.header.rowspan`] && validated
                          }
                          valid={
                            !errors?.errors?.[`settings.schema.static.header.rowspan`] &&
                            auxHeader.rowspan !== '' &&
                            validated
                          }
                        />
                        <CFormFeedback invalid>
                          {errors?.errors?.[`settings.schema.static.header.rowspan`]?.map(
                            (error, i) => (
                              <div key={i} className="d-flex align-items-center gap-1">
                                <BadgeAlert size={13} />
                                <small className="font-inter fw-lighter">{error}</small>
                              </div>
                            ),
                          )}
                        </CFormFeedback>
                        <CFormFeedback valid>
                          <div className="d-flex align-items-center gap-1">
                            <BadgeCheck size={13} />
                            <small className="font-inter fw-lighter">Dato Válido</small>
                          </div>
                        </CFormFeedback>
                      </div>
                    </CCol>
                  </CRow>
                </div>
                <CButton
                  size="sm"
                  color="success"
                  variant="outline"
                  className="custom-success-btn d-flex align-items-center justify-content-center gap-1 mt-1 font-poppins"
                  style={{ fontSize: '13px' }}
                  onClick={() => addHeader(auxHeader)}
                  disabled={
                    auxHeader.label === '' || auxHeader.colspan === '' || auxHeader.rowspan === ''
                  }
                >
                  <Plus size={14} />
                  {auxEdit !== 'header' ? 'Guardar Encabezado' : 'Actualizar Encabezado'}
                </CButton>
              </div>
            </div>
          </CCol>
          <CCol md={Object.keys(structure?.header).length !== 0 && auxEdit !== 'header' ? 6 : 4}>
            <div
              className="position-relative p-3 pt-4 border rounded-3 mb-4 mt-3 transition-all"
              style={{
                borderColor: '#e2e8f0',
                opacity: isDisabled('th') ? 0.6 : 1,
                pointerEvents: isDisabled('th') ? 'none' : 'auto',
                filter: isDisabled('th') ? 'grayscale(0.5)' : 'none',
                backgroundColor: isDisabled('th') ? '#f8fafc' : 'transparent',
              }}
            >
              <div
                className="position-absolute bg-white px-2 d-flex align-items-center gap-2 fw-bold font-montserrat"
                style={{
                  top: '-10px',
                  left: '15px',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  color: '#0934a8',
                }}
              >
                <Form size={15} strokeWidth={2.5} />
                NUEVO ENCABEZADO
              </div>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex flex-column mb-2">
                  <label className="text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>
                    NOMBRE
                  </label>
                  <CFormInput
                    size="sm"
                    className="font-montserrat fw-semibold custom-input"
                    value={auxTh.label}
                    onChange={(e) => setAuxTh({ ...auxTh, label: e.target.value.toUpperCase() })}
                    invalid={!!errors?.errors?.[`settings.schema.static.body.label`] && validated}
                    valid={
                      !errors?.errors?.[`settings.schema.static.body.label`] &&
                      auxTh.label !== '' &&
                      validated
                    }
                  />
                  <CFormFeedback invalid>
                    {errors?.errors?.[`settings.schema.static.body.label`]?.map((error, i) => (
                      <div key={i} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter fw-lighter">{error}</small>
                      </div>
                    ))}
                  </CFormFeedback>
                  <CFormFeedback valid>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter fw-lighter">Dato Válido</small>
                    </div>
                  </CFormFeedback>
                </div>
                <div className="bg-light p-2 rounded border">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="text-muted fw-bold" style={{ fontSize: '10px' }}>
                      CONFIGURACIÓN DE DIMENSIONES
                    </span>
                  </div>
                  <CRow className="g-2">
                    <CCol xs={6}>
                      <div className="d-flex flex-column">
                        <label
                          className="text-muted text-uppercase mb-1"
                          style={{ fontSize: '9px', fontWeight: 'bold' }}
                        >
                          COLUMNAS
                        </label>
                        <CFormInput
                          size="sm"
                          type="number"
                          className="font-inter text-primary text-center input-custom"
                          style={{ fontSize: '12px', height: '30px' }}
                          value={auxTh.colspan}
                          min={1}
                          max={data?.header?.colspan}
                          onChange={(e) => {
                            let value = e.target.value

                            if (value === '') {
                              setAuxTh({
                                ...auxTh,
                                colspan: '',
                              })
                              return
                            }

                            value = Number(value)

                            if (value > data?.header?.colspan) return
                            if (value < 1) return

                            setAuxTh({
                              ...auxTh,
                              colspan: value,
                            })
                          }}
                          invalid={
                            !!errors?.errors?.[`settings.schema.static.body.th.colspan`] &&
                            validated
                          }
                          valid={
                            !errors?.errors?.[`settings.schema.static.body.th.colspan`] &&
                            auxTh.colspan !== '' &&
                            auxEdit === 'th' &&
                            validated
                          }
                        />
                        <CFormFeedback invalid>
                          {errors?.errors?.[`settings.schema.static.body.th.colspan`]?.map(
                            (error, i) => (
                              <div key={i} className="d-flex align-items-center gap-1">
                                <BadgeAlert size={13} />
                                <small className="font-inter fw-lighter">{error}</small>
                              </div>
                            ),
                          )}
                        </CFormFeedback>
                        <CFormFeedback valid>
                          <div className="d-flex align-items-center gap-1">
                            <BadgeCheck size={13} />
                            <small className="font-inter fw-lighter">Dato Válido</small>
                          </div>
                        </CFormFeedback>
                      </div>
                    </CCol>
                    <CCol xs={6}>
                      <div className="d-flex flex-column">
                        <label
                          className="text-muted text-uppercase mb-1"
                          style={{ fontSize: '9px', fontWeight: 'bold' }}
                        >
                          FILAS
                        </label>
                        <CFormInput
                          size="sm"
                          type="number"
                          className="font-inter text-primary text-center input-custom"
                          style={{ fontSize: '12px', height: '30px' }}
                          value={auxTh.rowspan}
                          onChange={(e) => {
                            let value = e.target.value
                            if (value === '') {
                              setAuxTh({
                                ...auxTh,
                                rowspan: '',
                              })
                              return
                            }
                            value = Number(value)
                            if (value > data?.header?.colspan) return
                            if (value < 1) return
                            setAuxTh({ ...auxTh, rowspan: value })
                          }}
                          invalid={
                            !!errors?.errors?.[`settings.schema.static.body.th.rowspan`] &&
                            validated
                          }
                          valid={
                            !errors?.errors?.[`settings.schema.static.body.th.rowspan`] &&
                            auxTh.rowspan !== '' &&
                            auxEdit === 'th' &&
                            validated
                          }
                        />
                        <CFormFeedback invalid>
                          {errors?.errors?.[`settings.schema.static.body.th.rowspan`]?.map(
                            (error, i) => (
                              <div key={i} className="d-flex align-items-center gap-1">
                                <BadgeAlert size={13} />
                                <small className="font-inter fw-lighter">{error}</small>
                              </div>
                            ),
                          )}
                        </CFormFeedback>
                        <CFormFeedback valid>
                          <div className="d-flex align-items-center gap-1">
                            <BadgeCheck size={13} />
                            <small className="font-inter fw-lighter">Dato Válido</small>
                          </div>
                        </CFormFeedback>
                      </div>
                    </CCol>
                  </CRow>
                </div>
                <CButton
                  size="sm"
                  color="success"
                  variant="outline"
                  className="custom-success-btn d-flex align-items-center justify-content-center gap-1 mt-1 font-poppins"
                  style={{ fontSize: '13px' }}
                  onClick={() =>
                    auxEdit !== 'th' ? addBlock(auxTh, 'th') : updateBlock(auxTh, 'th')
                  }
                  disabled={auxTh.label === '' || auxTh.colspan === '' || auxTh.rowspan === ''}
                >
                  <Plus size={14} />
                  {auxEdit !== 'th' ? 'Agregar a la Fila' : 'Actualizar Encabezado'}
                </CButton>
              </div>
            </div>
          </CCol>
          <CCol md={Object.keys(structure?.header).length !== 0 && auxEdit !== 'header' ? 6 : 4}>
            <div
              className="position-relative p-3 pt-4 border rounded-3 mt-3"
              style={{
                borderColor: '#e2e8f0',
                opacity: isDisabled('td') ? 0.6 : 1,
                pointerEvents: isDisabled('td') ? 'none' : 'auto',
                filter: isDisabled('td') ? 'grayscale(0.5)' : 'none',
                backgroundColor: isDisabled('td') ? '#f8fafc' : 'transparent',
              }}
            >
              <div
                className="position-absolute bg-white px-2 d-flex align-items-center gap-2 fw-bold font-montserrat"
                style={{
                  top: '-10px',
                  left: '15px',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  color: '#0934a8',
                }}
              >
                <Form size={15} strokeWidth={2.5} />
                NUEVO CAMPO
              </div>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex flex-column mb-2">
                  <label className="text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>
                    NOMBRE VALOR
                  </label>
                  <CFormInput
                    size="sm"
                    className="font-inter text-primary custom-input"
                    style={{ fontSize: '12px' }}
                    value={auxTd.field}
                    onChange={(e) => setAuxTd({ ...auxTd, field: e.target.value.toLowerCase() })}
                    invalid={!!errors?.errors?.[`settings.schema.static.body.field`] && validated}
                    valid={
                      !errors?.errors?.[`settings.schema.static.body.field`] &&
                      auxTd.field !== '' &&
                      validated
                    }
                  />
                  <CFormFeedback invalid>
                    {errors?.errors?.[`settings.schema.static.body.field`]?.map((error, i) => (
                      <div key={i} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter fw-lighter">{error}</small>
                      </div>
                    ))}
                  </CFormFeedback>
                  <CFormFeedback valid>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={13} />
                      <small className="font-inter fw-lighter">Dato Válido</small>
                    </div>
                  </CFormFeedback>
                </div>
                <div className="bg-light p-2 rounded border">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="text-muted fw-bold" style={{ fontSize: '10px' }}>
                      CONFIGURACIÓN DE DIMENSIONES
                    </span>
                  </div>
                  <CRow className="g-2">
                    <CCol xs={6}>
                      <div className="d-flex flex-column">
                        <label
                          className="text-muted text-uppercase mb-1"
                          style={{ fontSize: '9px', fontWeight: 'bold' }}
                        >
                          COLUMNAS
                        </label>
                        <CFormInput
                          size="sm"
                          type="number"
                          className="font-inter text-primary text-center input-custom"
                          style={{ fontSize: '12px', height: '30px' }}
                          value={auxTd.colspan}
                          onChange={(e) => {
                            let value = e.target.value
                            if (value === '') {
                              setAuxTd({
                                ...auxTd,
                                colspan: '',
                              })
                              return
                            }
                            value = Number(value)
                            if (value > data?.header?.colspan) return
                            if (value < 1) return
                            setAuxTd({ ...auxTd, colspan: value })
                          }}
                          invalid={
                            !!errors?.errors?.[`settings.schema.static.body.td.colspan`] &&
                            validated
                          }
                          valid={
                            !errors?.errors?.[`settings.schema.static.body.td.colspan`] &&
                            auxTd.colspan !== '' &&
                            auxEdit === 'td' &&
                            validated
                          }
                        />
                        <CFormFeedback invalid>
                          {errors?.errors?.[`settings.schema.static.body.td.colspan`]?.map(
                            (error, i) => (
                              <div key={i} className="d-flex align-items-center gap-1">
                                <BadgeAlert size={13} />
                                <small className="font-inter fw-lighter">{error}</small>
                              </div>
                            ),
                          )}
                        </CFormFeedback>
                        <CFormFeedback valid>
                          <div className="d-flex align-items-center gap-1">
                            <BadgeCheck size={13} />
                            <small className="font-inter fw-lighter">Dato Válido</small>
                          </div>
                        </CFormFeedback>
                      </div>
                    </CCol>
                    <CCol xs={6}>
                      <div className="d-flex flex-column">
                        <label
                          className="text-muted text-uppercase mb-1"
                          style={{ fontSize: '9px', fontWeight: 'bold' }}
                        >
                          FILAS
                        </label>
                        <CFormInput
                          size="sm"
                          type="number"
                          className="font-inter text-primary text-center input-custom"
                          style={{ fontSize: '12px', height: '30px' }}
                          value={auxTd.rowspan}
                          onChange={(e) => {
                            let value = e.target.value
                            if (value === '') {
                              setAuxTd({
                                ...auxTd,
                                rowspan: '',
                              })
                              return
                            }
                            value = Number(value)
                            if (value > data?.header?.colspan) return
                            if (value < 1) return
                            setAuxTd({ ...auxTd, rowspan: value })
                          }}
                          invalid={
                            !!errors?.errors?.[`settings.schema.static.body.td.rowspan`] &&
                            validated
                          }
                          valid={
                            !errors?.errors?.[`settings.schema.static.body.td.rowspan`] &&
                            auxTd.rowspan !== '' &&
                            auxEdit === 'td' &&
                            validated
                          }
                        />
                        <CFormFeedback invalid>
                          {errors?.errors?.[`settings.schema.static.body.td.rowspan`]?.map(
                            (error, i) => (
                              <div key={i} className="d-flex align-items-center gap-1">
                                <BadgeAlert size={13} />
                                <small className="font-inter fw-lighter">{error}</small>
                              </div>
                            ),
                          )}
                        </CFormFeedback>
                        <CFormFeedback valid>
                          <div className="d-flex align-items-center gap-1">
                            <BadgeCheck size={13} />
                            <small className="font-inter fw-lighter">Dato Válido</small>
                          </div>
                        </CFormFeedback>
                      </div>
                    </CCol>
                  </CRow>
                </div>
                <div className="d-flex flex-column gap-1">
                  <label className="text-muted fw-bold" style={{ fontSize: '9px' }}>
                    TIPO DE DATO
                  </label>
                  <CFormSelect
                    size="sm"
                    className="font-inter shadow-sm custom-input"
                    style={{ fontSize: '12px' }}
                    value={auxTd.type}
                    invalid={!!errors?.errors?.[`settings.schema.static.body.type`] && validated}
                    valid={
                      !errors?.errors?.[`settings.schema.static.body.type`] &&
                      auxTd.type !== '' &&
                      validated
                    }
                    onChange={(e) => {
                      const type = e.target.value
                      const defaultRules = {
                        text: ['string'],
                        textarea: ['string'],
                        number: ['numeric'],
                        date: ['date'],
                        datetime: ['date'],
                      }
                      setAuxTd({
                        id: auxTd.id,
                        cell: 'td',
                        field: auxTd.field,
                        colspan: auxTd.colspan,
                        rowspan: auxTd.rowspan,
                        type,
                        rules: defaultRules[type] || [],
                      })
                    }}
                  >
                    {Array.isArray(fieldTypes) ? (
                      <>
                        <option value="">Seleccione un tipo de dato</option>
                        {fieldTypes.map((option) => (
                          <optgroup key={option.name} label={option.name}>
                            {option.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </>
                    ) : (
                      <option disabled>Cargando tipos de dato...</option>
                    )}
                  </CFormSelect>
                  <CFormFeedback invalid>
                    {errors?.errors?.[`settings.schema.static.body.type`]?.map((error, i) => (
                      <div key={i} className="d-flex align-items-center gap-1">
                        <BadgeAlert size={13} />
                        <small className="font-inter fw-lighter">{error}</small>
                      </div>
                    ))}
                  </CFormFeedback>
                  <FieldRules
                    type={auxTd.type}
                    element={auxTd}
                    field={auxTd.rules}
                    index={0}
                    ind={'static'}
                    updateField={updateField}
                    updateRules={updateRules}
                    updateFieldStatic={updateFieldStatic}
                    updateRulesStatic={updateRulesStatic}
                    errors={errors?.errors}
                    validated={validated}
                    models={models}
                    basePath={'settings.schema.static.body'}
                  />
                </div>
                <CButton
                  size="sm"
                  color="success"
                  variant="outline"
                  className="custom-success-btn d-flex align-items-center justify-content-center gap-1 mt-1 font-poppins"
                  style={{ fontSize: '13px' }}
                  onClick={() =>
                    auxEdit !== 'td' ? addBlock(auxTd, 'td') : updateBlock(auxTd, 'td')
                  }
                  disabled={
                    auxTd.field === '' ||
                    auxTd.colspan === '' ||
                    auxTd.rowspan === '' ||
                    auxTd.type === ''
                  }
                >
                  <Plus size={14} />
                  {auxEdit !== 'td' ? 'Agregar a la Fila' : 'Actualizar Campo'}
                </CButton>
              </div>
            </div>
          </CCol>
        </CRow>
      </div>
      <Preview layout={structure} className="animate-fade-in" />
    </>
  )
}

export default TableStaticComponent
