import {
  CFormInput,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CCol,
  CFormLabel,
  CFormFeedback,
  CPopover,
} from '@coreui/react'
import {
  ChartSpline,
  ArrowRightLeft,
  Plus,
  TextInitial,
  BadgeAlert,
  BadgeCheck,
  Save,
  Edit,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { thStyle, thStyleGroup } from '@/components/StyleManagementCollection'
import { Toast } from '@/components/Toast'
import Swal from 'sweetalert2'
import Select from 'react-select'
import { getSelectStylesInsertUniq } from '@/components/StyleManagementCollection'
import ModalAddReassignmentCurve from '@/components/ModalAddReassignmentCurve'

const TableCurveSpecifications = ({
  technical_sheet,
  products,
  fetchProducts,
  product,
  sizes,
  data,
  setData,
  errors,
  validated,
  trademarks,
  createProduct,
  product_stara,
  errors_create,
  selectedReference,
  setSelectedReference,
  dataNew,
  setDataNew,
  production_order,
  is_reasigned,
  hasReassignment,
  setHasReassignment,
}) => {
  const [focusedInput, setFocusedInput] = useState(null)
  const [modalAddProduct, setModalAddProduct] = useState(false)
  const [modalAddSpecification, setModalAddSpecification] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    reference_relation: true,
  })
  const [validatedAdd, setValidatedAdd] = useState(false)
  const [openPopover, setOpenPopover] = useState({
    id: null,
  })
  const [dataAux, setDataAux] = useState(null)
  const [dataModal, setDataModal] = useState(null)
  const [selectedReferences, setSelectedReferences] = useState([])

  const isInvalidTrademark = !!errors?.trademark_id
  const isValidTrademark = !errors?.trademark_id && formData.trademark_id !== '' && validatedAdd
  const isInvalidCategory = validatedAdd
  const isValidCategory = validatedAdd
  const isInvalidSubcategory = !!errors?.subcategory_id
  const isValidSubcategory =
    !errors?.subcategory_id && formData.subcategory_id !== '' && validatedAdd

  const loadReferences = async () => {
    if (products) return
    try {
      await fetchProducts()
    } catch (error) {
      console.error(error)
    }
  }

  const findTrademarkByCode = (code) => {
    if (!code || !trademarks) return null

    code = code.toUpperCase()

    const matches = trademarks.filter((trademark) => {
      const validations = trademark.settings?.validations ?? []

      return validations.some((validation) => {
        const match = validation.regex.match(/\/\^([A-Z0-9]+)\[0-9/)

        if (!match) return false

        const prefix = match[1]

        return prefix.startsWith(code) || code.startsWith(prefix)
      })
    })

    return matches.length === 1 ? matches[0] : null
  }

  useEffect(() => {
    if (!formData.code && product && technical_sheet) {
      setFormData((prev) => {
        return { ...prev, trademark_id: null }
      })
      return
    }

    const trademark = findTrademarkByCode(formData.code)

    if (trademark) {
      setFormData((prev) => ({
        ...prev,
        trademark_id: trademark.id,
        technical_sheet_id: technical_sheet.id,
        subcategory_id: product.subcategory_id,
      }))
    }
  }, [formData.code, trademarks])

  useEffect(() => {
    if (!selectedReference) return

    const data = selectedReference.specification_curve
      .filter((item) => item.model_type === 'App\\Models\\Product')
      .map((item) => ({
        location: item.destination,
        reference: item.model.code,
        product_id: item.model_id,
        sizes: selectedReference.sizes.reduce((acc, size) => {
          const quantity = item.production_order_detail_quantities.find(
            (aux) => aux.size_id === size.id,
          )

          acc[size.id] = {
            id: quantity?.id ?? null,
            size_id: size.id,
            name: size.name,
            quantity: quantity?.quantity ?? 0,
          }

          return acc
        }, {}),
      }))

    ;['NACIONAL', 'MEDELLIN', 'STARA'].forEach((location) => {
      if (!data.some((item) => item.location === location)) {
        data.push({
          location,
          reference: null,
          product_id: null,
          sizes: selectedReference.sizes.reduce((acc, size) => {
            acc[size.id] = {
              id: null,
              size_id: size.id,
              name: size.name,
              quantity: 0,
            }

            return acc
          }, {}),
        })
      }
    })

    setDataAux(data)
  }, [selectedReference])

  const handleChange = (rowIndex, sizeId, value) => {
    const quantity = value === '' ? 0 : Number(value)
    setData((prev) =>
      prev.map((row, index) => {
        if (index !== rowIndex) return row

        return {
          ...row,
          sizes: {
            ...row.sizes,
            [sizeId]: {
              ...row.sizes[sizeId],
              quantity: Number(value),
            },
          },
        }
      }),
    )
  }

  const handleChangeReference = (location, value) => {
    setData((prev) =>
      prev.map((row) => {
        if (row.location !== location) return row

        return {
          ...row,
          ['product_id']: value,
        }
      }),
    )
  }

  const handleChangeData = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      ['code']: value.toUpperCase(),
    }))
  }

  const handleSubmit = async () => {
    Swal.fire({
      title: 'Crear Producto',
      html: `<div style="font-size:14px">
                Se guardará la información del producto en el sistema.<br/>
                <strong>¿Deseas continuar?</strong>
              </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, crear',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await createProduct(formData)
          setValidatedAdd(true)
          Toast.fire({
            icon: 'success',
            title: response.message,
          })
          setTimeout(() => {
            setFormData({})
            setModalAddProduct(false)
          }, 2510)
        } catch (error) {
          setValidatedAdd(true)
        }
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Acción cancelada',
        })
      }
    })
  }

  const customFilterOption = (option, rawInput) => {
    const words = rawInput.toLowerCase().split(' ')
    const label = option.label.toLowerCase()
    return words.every((word) => label.includes(word))
  }

  const options = product
    ? [
        {
          value: null,
          label: '-',
        },
        {
          value: product.id,
          label: product.code,
        },
      ]
    : []

  const options_stara =
    product_stara !== null
      ? [
          {
            value: null,
            label: '-',
          },
          {
            value: product_stara.id,
            label: product_stara.code,
          },
        ]
      : []

  useEffect(() => {
    if (!production_order?.model) {
      return
    }

    setSelectedReference((prev) => ({
      label: `${production_order.model.technical_sheet?.product?.code} - ${production_order.cut}`,
      specification_curve: production_order.model.production_order_details.filter(
        (item) => item.model_type === 'App\\Models\\Product',
      ),
      sizes: production_order.model.technical_sheet?.product?.trademark?.sizes || [],
    }))
  }, [production_order?.model])

  return (
    <>
      <div
        className="bg-white border rounded-3 overflow-hidden mt-3"
        style={{ borderColor: '#E2E8F0' }}
      >
        <div
          className="d-flex align-items-center justify-content-between px-3 py-2"
          style={{ borderBottom: '1px solid #E2E8F0' }}
        >
          <div className="d-flex align-items-center text-center gap-2">
            <div className="bg-white p-2 rounded shadow-sm">
              <ChartSpline size={18} style={{ color: '#C21111' }} />
            </div>
            <span
              className="fw-semibold font-montserrat justify-content-center gap-2"
              style={{
                fontSize: '.88rem',
                color: '#0F172A',
              }}
            >
              ESPECIFICACIONES DE CURVA
            </span>
          </div>
          <div className="d-flex align-items-center gap-2 font-inter">
            {!is_reasigned && (
              <CButton
                size="sm"
                className="d-flex align-items-center gap-2 px-3 shadow-sm text-white fw-normal btn-reasignar-lote smooth-transition"
                onClick={async () => {
                  await loadReferences()
                  setModalAddSpecification(true)
                }}
              >
                {hasReassignment ? (
                  <>
                    <Edit size={14} style={{ color: '#FFFFFF' }} />
                    Editar Reasignación
                  </>
                ) : (
                  <>
                    <ArrowRightLeft size={14} style={{ color: '#FFFFFF' }} />
                    Reasignar Lote
                  </>
                )}
              </CButton>
            )}
          </div>
        </div>
        <div className="table-responsive">
          <table
            className="table align-middle mb-0"
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
            }}
          >
            <thead style={{ backgroundColor: '#fdfdfd' }}>
              <tr className="font-poppins">
                <th
                  rowSpan={2}
                  className="text-center align-middle"
                  style={{ ...thStyle, minWidth: '100px' }}
                >
                  -
                </th>
                <th
                  rowSpan={2}
                  className="text-center align-middle"
                  style={{ ...thStyle, minWidth: '200px' }}
                >
                  REFERENCIA
                </th>
                <th
                  colSpan={sizes.length}
                  className="text-center align-middle"
                  style={{ ...thStyleGroup }}
                >
                  TALLAS
                </th>
                <th
                  rowSpan={2}
                  className="text-center align-middle"
                  style={{ ...thStyle, minWidth: '90px' }}
                >
                  TOTAL
                </th>
              </tr>
              <tr className="font-poppins">
                {sizes.map((size) => {
                  return (
                    <th
                      className="text-center"
                      style={{
                        ...thStyleGroup,
                        minWidth: '100px',
                      }}
                    >
                      {size.name}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {data?.map((row, rowIndex) => (
                <tr
                  key={row.location}
                  className={`font-inter ${errors?.[row.location] ? 'table-row-error' : ''}`}
                >
                  <td
                    className={`justify-content-between gap-2 text-center align-middle ${errors?.[row.location] ? 'd-flex' : ''}`}
                    style={{ ...thStyle, minWidth: '100px' }}
                  >
                    {row.location || '-'}
                    {errors?.[row.location] && (
                      <CPopover
                        visible={openPopover?.location === row.location}
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
                            {errors?.[row.location].map((err, i) => (
                              <div key={i} className="d-flex align-items-start gap-2 p-1 rounded-2">
                                <span style={{ whiteSpace: 'pre-line' }}>{err}</span>
                              </div>
                            ))}
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
                              if (prev?.location === row.location) {
                                return null
                              }
                              return { location: row.location }
                            })
                          }}
                        >
                          <BadgeAlert size={16} />
                        </span>
                      </CPopover>
                    )}
                  </td>
                  <td
                    className="py-2 px-2 text-muted text-center border-end border-light align-middle"
                    style={{ fontSize: '0.875rem' }}
                  >
                    {row.location !== 'STARA' ? (
                      <Select
                        value={options.find((option) => option.value === row.product_id) ?? null}
                        options={options}
                        onChange={(selected) => handleChangeReference(row.location, selected.value)}
                        isSearchable
                        filterOption={customFilterOption}
                        className="font-inter w-100"
                        placeholder="Seleccione..."
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={getSelectStylesInsertUniq()}
                      />
                    ) : options_stara.length > 0 ? (
                      <Select
                        value={
                          options_stara.find((option) => option.value === row.product_id) ?? null
                        }
                        options={options_stara}
                        onChange={(selected) => handleChangeReference(row.location, selected.value)}
                        isSearchable
                        filterOption={customFilterOption}
                        className="font-inter w-100"
                        placeholder="Seleccione..."
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={getSelectStylesInsertUniq()}
                      />
                    ) : (
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        className="d-inline-flex align-items-center gap-1 py-1 px-2 border-dashed"
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: '500',
                          borderStyle: 'dashed',
                        }}
                        onClick={() => {
                          setModalAddProduct(true)
                        }}
                      >
                        <Plus size={14} />
                        <span>Agregar producto</span>
                      </CButton>
                    )}
                  </td>
                  {sizes.map((size) => (
                    <td
                      key={size.id}
                      className="py-2 px-2 text-muted text-center border-end border-light align-middle"
                    >
                      <CFormInput
                        type="number"
                        min={0}
                        step={1}
                        value={
                          focusedInput?.row === rowIndex &&
                          focusedInput?.size === size.id &&
                          row.sizes[size.id].quantity === 0
                            ? ''
                            : row.sizes[size.id].quantity
                        }
                        className="table-input border-0 shadow-none py-1 font-inter w-100 text-center"
                        onFocus={() =>
                          setFocusedInput({
                            row: rowIndex,
                            size: size.id,
                          })
                        }
                        onBlur={() => {
                          if (row.sizes[size.id].quantity === '') {
                            handleChange(rowIndex, size.id, 0)
                          }
                          setFocusedInput(null)
                        }}
                        onKeyDown={(e) => {
                          if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                            e.preventDefault()
                          }
                        }}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*$/.test(value)) {
                            handleChange(rowIndex, size.id, value)
                          }
                        }}
                        disabled={!row.product_id}
                      />
                    </td>
                  ))}
                  <td className="table-input-spc py-2 px-2 text-muted text-center border-end border-light align-middle fw-bold">
                    {Object.values(row.sizes || {}).reduce((acc, size) => {
                      return acc + size.quantity
                    }, 0)}
                  </td>
                </tr>
              ))}
              <tr className="font-poppins">
                <td colSpan={2} className="text-center align-middle" style={{ ...thStyle }}>
                  TOTALES:
                </td>
                {sizes.map((size) => {
                  return (
                    <td
                      className="py-3 px-2 text-center border-end border-light fw-bold font-inter"
                      style={{ fontSize: '13px' }}
                    >
                      {data?.reduce((acc, row) => {
                        return acc + row.sizes[size.id].quantity
                      }, 0)}
                    </td>
                  )
                })}
                <td
                  className="text-primary py-3 px-2 text-center border-end border-light fw-bold font-inter"
                  style={{ fontSize: '13px' }}
                >
                  {data?.reduce((total, row) => {
                    return (
                      total +
                      sizes.reduce((subtotal, size) => {
                        return subtotal + Number(row.sizes[size.id].quantity || 0)
                      }, 0)
                    )
                  }, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <CModal
        visible={modalAddProduct}
        onClose={() => {
          setModalAddProduct(false)
          setFormData({})
        }}
        alignment="center"
        className="font-montserrat"
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
            Crear Producto
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="px-4 py-1">
          <CForm className="row g-3 needs-validation p-4">
            <CCol md={12}>
              <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                <TextInitial size={15} /> Referencia
                <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
              </CFormLabel>
              <CFormInput
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChangeData}
                invalid={!!errors_create?.code}
                valid={!errors_create?.code && formData.code !== '' && validatedAdd}
                className="font-montserrat input-custom"
              />
              <CFormFeedback invalid>
                {errors_create?.code?.map((error, index) => (
                  <div key={index} className="d-flex align-items-center gap-1">
                    <BadgeAlert size={13} />
                    <small className="font-inter" style={{ whiteSpace: 'pre-line' }}>
                      {error}
                    </small>
                  </div>
                ))}
              </CFormFeedback>
              <CFormFeedback valid>
                <div className="d-flex align-items-center gap-1">
                  <BadgeCheck size={13} />
                  <small className="font-inter">Dato Válido</small>
                </div>
              </CFormFeedback>
            </CCol>
            <CCol md={12}>
              <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                <TextInitial size={15} /> Marca
                <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
              </CFormLabel>
              <CFormInput
                type="text"
                name="trademark_id"
                value={
                  !!trademarks && formData.code
                    ? trademarks.find((opt) => opt.id === formData.trademark_id)?.name
                    : ''
                }
                disabled
                className="font-montserrat custom-input"
                invalid={!!errors?.trademark_id}
                valid={!errors?.trademark_id && formData.trademark_id !== '' && validated}
              />
              <CFormFeedback invalid className={isInvalidTrademark ? 'd-block' : 'd-none'}>
                {errors?.trademark_id?.map((error, index) => (
                  <div key={index} className="d-flex align-items-center gap-1">
                    <BadgeAlert size={13} />
                    <small className="font-inter">{error}</small>
                  </div>
                ))}
              </CFormFeedback>
              <CFormFeedback valid className={isValidTrademark ? 'd-block' : 'd-none'}>
                <div className="d-flex align-items-center gap-1">
                  <BadgeCheck size={13} />
                  <small className="font-inter">Dato Válido</small>
                </div>
              </CFormFeedback>
            </CCol>
            <CCol md={12}>
              <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                <TextInitial size={15} /> Grupo
                <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
              </CFormLabel>
              <CFormInput
                type="text"
                name="group"
                value={
                  !!trademarks && formData.code
                    ? trademarks.find((opt) => opt.id === formData.trademark_id)?.group[0]?.name
                    : ''
                }
                disabled
                className="font-montserrat custom-input"
                invalid={!!errors?.trademark_id}
                valid={!errors?.trademark_id && formData.trademark_id !== '' && validated}
              />
              <CFormFeedback invalid>
                {errors?.trademark_id?.map((error, index) => (
                  <div key={index} className="d-flex align-items-center gap-1">
                    <BadgeAlert size={13} />
                    <small className="font-inter" style={{ whiteSpace: 'pre-line' }}>
                      {error}
                    </small>
                  </div>
                ))}
              </CFormFeedback>
              <CFormFeedback valid>
                <div className="d-flex align-items-center gap-1">
                  <BadgeCheck size={13} />
                  <small className="font-inter">Dato Válido</small>
                </div>
              </CFormFeedback>
            </CCol>
            <CCol md={12}>
              <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                <TextInitial size={15} /> Categoria
                <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
              </CFormLabel>
              <CFormInput
                type="text"
                name="trademark_id"
                value={product && formData.trademark_id ? product.subcategory.category[0].name : ''}
                disabled
                className="font-montserrat custom-input"
                invalid={!!errors?.subcategory_id}
                valid={!errors?.subcategory_id && formData.subcategory_id !== '' && validated}
              />
              <CFormFeedback invalid className={isInvalidCategory ? 'd-block' : 'd-none'}>
                {errors?.subcategory_id?.map((error, index) => (
                  <div key={index} className="d-flex align-items-center gap-1">
                    <BadgeAlert size={13} />
                    <small className="font-inter">{error}</small>
                  </div>
                ))}
              </CFormFeedback>
              <CFormFeedback valid className={isValidCategory ? 'd-block' : 'd-none'}>
                <div className="d-flex align-items-center gap-1">
                  <BadgeCheck size={13} />
                  <small className="font-inter">Dato Válido</small>
                </div>
              </CFormFeedback>
            </CCol>
            <CCol md={12}>
              <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                <TextInitial size={15} /> Subcategoría
                <span style={{ color: 'red', marginLeft: '-5px' }}>*</span>
              </CFormLabel>
              <CFormInput
                type="text"
                name="trademark_id"
                value={product && formData.trademark_id ? product?.subcategory.name : ''}
                disabled
                className="font-montserrat custom-input"
                invalid={!!errors?.subcategory_id}
                valid={!errors?.subcategory_id && formData.subcategory_id !== '' && validated}
              />
              <CFormFeedback invalid className={isInvalidSubcategory ? 'd-block' : 'd-none'}>
                {errors?.subcategory_id?.map((error, index) => (
                  <div key={index} className="d-flex align-items-center gap-1">
                    <BadgeAlert size={13} />
                    <small className="font-inter">{error}</small>
                  </div>
                ))}
              </CFormFeedback>
              <CFormFeedback valid className={isValidSubcategory ? 'd-block' : 'd-none'}>
                <div className="d-flex align-items-center gap-1">
                  <BadgeCheck size={13} />
                  <small className="font-inter">Dato Válido</small>
                </div>
              </CFormFeedback>
            </CCol>
          </CForm>
        </CModalBody>
        <CModalFooter className="mt-2">
          <CButton
            color="secondary"
            size="sm"
            onClick={() => {
              setModalAddProduct(false)
              setFormData({})
            }}
          >
            Cancelar
          </CButton>
          <CButton
            size="sm"
            className="text-white d-flex align-items-center gap-2"
            style={{
              backgroundColor: '#24247F',
              border: 'none',
            }}
            onClick={() => handleSubmit()}
          >
            <Save size={16} />
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>
      {modalAddSpecification && (
        <ModalAddReassignmentCurve
          modalAddSpecification={modalAddSpecification}
          setModalAddSpecification={setModalAddSpecification}
          setModalAddProduct={setModalAddProduct}
          selectedReference={selectedReference}
          setSelectedReference={setSelectedReference}
          dataAux={dataAux}
          setDataAux={setDataAux}
          dataModal={dataModal}
          setDataModal={setDataModal}
          sizes={sizes}
          product={product}
          products={products}
          product_stara={product_stara}
          data={data}
          setData={setData}
          dataNew={dataNew}
          setDataNew={setDataNew}
          selectedReferences={selectedReferences}
          setSelectedReferences={setSelectedReferences}
          hasReassignment={hasReassignment}
          setHasReassignment={setHasReassignment}
        />
      )}
    </>
  )
}

export default TableCurveSpecifications
