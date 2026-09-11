import React, { useMemo, useState, useEffect } from 'react'
import ManagementCollectionTechnicalSheetBody from './ManegementCollectionTechnicalSheetBody'
import { thStyle, thStyleGroup } from '@/components/StyleManagementCollection'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react'
import Select from 'react-select'
import { tableSelectStyles } from '@/components/StyleManagementCollection'
import { Save } from 'lucide-react'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'
import { useDispatch } from 'react-redux'

const ManagementCollectionTechnicalSheet = ({
  technical_sheets,
  trademark,
  category,
  subcategory,
  setData,
  supplyTypes,
  processes,
  supplies,
  garmentTypes,
  washTones,
  bootTypes,
  categories,
  subcategories,
  fetchSubcategories,
  modified,
  setModified,
  validated,
  errors,
}) => {
  const dispath = useDispatch()
  const [rechangeModal, setRechangeModal] = useState(false)
  const [selectedSheet, setSelectedSheet] = useState(null)
  const [inf, setInf] = useState(null)

  const handleOpenModal = (sheet) => {
    setSelectedSheet(sheet)

    setInf({
      collection: sheet?.collection,
      trademark: sheet?.product?.trademark,
      category: sheet?.product?.subcategory?.category[0],
      subcategory: sheet?.product?.subcategory,
    })

    setRechangeModal(true)
  }

  useEffect(() => {
    if (!inf) return
    fetchSubcategories(inf.category.id)
  }, [inf])

  const handleUpdateRow = async () => {
    const result = await Swal.fire({
      title: 'Editar Fila',
      html: `<div style="font-size:14px">
                 La información seleccionada es importante y puede afectar la asociación actual de la ficha técnica.<br/>
                 <strong>¿Deseas continuar?</strong>
               </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, actualizar',
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

      const trademarkAuxSelf = newData[selectedSheet.product.trademark.id]
      const categoryAuxSelf =
        trademarkAuxSelf.categories[selectedSheet.product.subcategory.category[0].id]
      const subcategoryAuxSelf = categoryAuxSelf.subcategories[selectedSheet.product.subcategory.id]
      const technicalSheetsAuxSelf = subcategoryAuxSelf.technical_sheets

      const { [selectedSheet.id]: deleted, ...restTechnicalSheets } = technicalSheetsAuxSelf

      newData[trademark.id].categories[
        selectedSheet.product.subcategory.category[0].id
      ].subcategories[selectedSheet.product.subcategory.id].technical_sheets = restTechnicalSheets

      const trademarkAux = newData[inf.trademark.id]
      const categoryAux = trademarkAux.categories[inf.category.id]

      if (!categoryAux) {
        newData[inf.trademark.id].categories = {
          ...newData[inf.trademark.id].categories,

          [inf.category.id]: {
            ...inf.category,

            subcategories: {
              [inf.subcategory.id]: {
                ...inf.subcategory,

                technical_sheets: {
                  [selectedSheet.id]: {
                    ...selectedSheet,
                    product: {
                      ...selectedSheet.product,
                      trademark: inf.trademark,
                      subcategory: inf.subcategory,
                      trademark_id: inf.trademark.id,
                      subcategory_id: inf.subcategory.id,
                    },
                  },
                },
              },
            },
          },
        }
      } else {
        const subcategoryAux = categoryAux.subcategories[inf.subcategory.id]

        if (!subcategoryAux) {
          newData[inf.trademark.id].categories[inf.category.id].subcategories = {
            ...categoryAux.subcategories,

            [inf.subcategory.id]: {
              ...inf.subcategory,

              technical_sheets: {
                [selectedSheet.id]: {
                  ...selectedSheet,
                  product: {
                    ...selectedSheet.product,
                    trademark_id: inf.trademark.id,
                    trademark: inf.trademark,
                    subcategory: inf.subcategory,
                    subcategory_id: inf.subcategory.id,
                  },
                },
              },
            },
          }
        } else {
          newData[inf.trademark.id].categories[inf.category.id].subcategories[
            inf.subcategory.id
          ].technical_sheets = {
            ...subcategoryAux.technical_sheets,
            [selectedSheet.id]: {
              ...selectedSheet,
              product: {
                ...selectedSheet.product,
                trademark: inf.trademark,
                subcategory: inf.subcategory,
                trademark_id: inf.trademark.id,
                subcategory_id: inf.subcategory.id,
              },
            },
          }
        }
      }

      return newData
    })

    dispath({
      type: 'ADD_TECHNICAL_SHEET',
      payload: {
        id: selectedSheet.id,
        technicalSheet: {
          ...selectedSheet,
          product: {
            ...selectedSheet.product,
            trademark: inf.trademark,
            subcategory: inf.subcategory,
            trademark_id: inf.trademark.id,
            subcategory_id: inf.subcategory.id,
          },
        },
      },
    })

    Toast.fire({
      icon: 'success',
      title: 'Fila actualizada correctamente',
    })

    setRechangeModal(false)
    setInf(null)
    setSelectedSheet(null)
  }

  const handleSelectChange = (field) => (selectedOption) => {
    setInf((prev) => ({
      ...prev,
      [field]: selectedOption.value || null,
    }))
  }

  const categoriesOptions = useMemo(() => {
    if (!Array.isArray(categories)) return {}

    return categories.reduce((acc, category) => {
      acc[category.id] = {
        label: category.name,
        value: category,
      }

      return acc
    }, {})
  }, [categories])

  const subcategoriesOptions = useMemo(() => {
    if (!Array.isArray(subcategories)) return {}

    return subcategories.reduce((acc, subcategory) => {
      acc[subcategory.id] = {
        label: subcategory.name,
        value: subcategory,
      }

      return acc
    }, {})
  }, [subcategories])

  return (
    <>
      <table
        className="table align-middle mb-0"
        style={{
          tableLayout: 'fixed',
          minWidth: '1800px',
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
      >
        <thead>
          <tr className="font-poppins">
            <th
              rowSpan={2}
              className="text-center align-middle sticky-actions"
              style={{ ...thStyle, width: '100px' }}
            >
              ACCIONES
            </th>
            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '160px' }}
            >
              CÓDIGO
            </th>
            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '160px' }}
            >
              REFERENCIA
            </th>
            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '200px' }}
            >
              TIPO DE PRENDA
            </th>
            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '230px' }}
            >
              TONO
            </th>
            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '230px', minWidth: '230px' }}
            >
              TIPO DE BOTA
            </th>
            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '220px' }}
            >
              OBSERVACIÓN
            </th>
            <th
              colSpan={2}
              className="text-center"
              style={{
                ...thStyleGroup,
                width: '280px',
                minWidth: '280px',
              }}
            >
              FOTOS
            </th>
            <th
              colSpan={supplyTypes.length || 1}
              className="text-center"
              style={{
                ...thStyleGroup,
                width: `${supplyTypes.length > 0 ? supplyTypes.length * 220 : 220}px`,
                minWidth: `${supplyTypes.length > 0 ? supplyTypes.length * 220 : 220}px`,
              }}
            >
              INSUMOS
            </th>
            <th
              colSpan={processes.length}
              className="text-center"
              style={{
                ...thStyleGroup,
                width: `${processes.length * 160}px`,
                minWidth: `${processes.length * 160}px`,
              }}
            >
              PROCESOS
            </th>
            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '160px' }}
            >
              ESTADO
            </th>
          </tr>
          <tr className="font-poppins">
            <th
              className="text-center"
              style={{
                ...thStyleGroup,
                minWidth: '140px',
                width: '140px',
                maxWidth: '140px',
                borderTop: '0px',
              }}
            >
              DELANTERA
            </th>
            <th
              className="text-center"
              style={{
                ...thStyleGroup,
                minWidth: '140px',
                width: '140px',
                maxWidth: '140px',
                borderTop: '0px',
              }}
            >
              TRASERA
            </th>
            {supplyTypes.length > 0 ? (
              supplyTypes?.map((supplyType) => (
                <th
                  key={supplyType.id}
                  className="text-center"
                  style={{
                    ...thStyleGroup,
                    borderTop: '0px',
                  }}
                >
                  {supplyType.name}
                </th>
              ))
            ) : (
              <th
                className="text-center"
                style={{
                  ...thStyleGroup,
                  borderTop: '0px',
                }}
              >
                -
              </th>
            )}
            {processes.map((process) => (
              <th
                key={process.id}
                className="text-center"
                style={{
                  ...thStyleGroup,
                  borderTop: '0px',
                  width: '160px',
                  minWidth: '160px',
                }}
              >
                {process.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-inter">
          <ManagementCollectionTechnicalSheetBody
            technical_sheets={technical_sheets}
            trademark={trademark}
            category={category}
            subcategory={subcategory}
            setData={setData}
            garmentTypes={garmentTypes}
            washTones={washTones}
            bootTypes={bootTypes}
            supplyTypes={supplyTypes}
            processes={processes}
            supplies={supplies}
            onOpenModal={handleOpenModal}
            modified={modified}
            setModified={setModified}
            validated={validated}
            errors={errors}
          />
        </tbody>
      </table>
      <CModal
        visible={rechangeModal}
        onClose={() => {
          setRechangeModal(false)
          setInf(null)
          setSelectedSheet(null)
        }}
        alignment="center"
        className="font-montserrat"
      >
        <CModalHeader style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <CModalTitle style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
            Editar información del producto
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <div className="mb-3">
            <label
              className="form-label font-inter fw-semibold mb-2"
              style={{ fontSize: '0.85rem', color: '#334155' }}
            >
              Colleccion asociada:
            </label>
            <div
              className="d-flex align-items-center font-inter"
              style={{
                minHeight: '40px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                padding: '0 12px',
                backgroundColor: '#F8FAFC',
                color: '#334155',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {inf?.collection?.name}
            </div>
          </div>
          <div className="mb-3">
            <label
              className="form-label font-inter fw-semibold mb-2"
              style={{ fontSize: '0.85rem', color: '#334155' }}
            >
              Marca asociada:
            </label>
            <div
              className="d-flex align-items-center font-inter"
              style={{
                minHeight: '40px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                padding: '0 12px',
                backgroundColor: '#F8FAFC',
                color: '#334155',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {inf?.trademark?.name}
            </div>
          </div>
          <div className="mb-3">
            <label
              className="form-label font-inter fw-semibold mb-2"
              style={{ fontSize: '0.85rem', color: '#334155' }}
            >
              Categoria asociada:
            </label>
            <Select
              options={Object.values(categoriesOptions)}
              value={categoriesOptions[inf?.category?.id]}
              onChange={handleSelectChange('category')}
              placeholder="Buscar o seleccionar categoría..."
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
          <div className="mb-3">
            <label
              className="form-label font-inter fw-semibold mb-2"
              style={{ fontSize: '0.85rem', color: '#334155' }}
            >
              Subcategoria asociada:
            </label>
            <Select
              options={Object.values(subcategoriesOptions)}
              value={subcategoriesOptions[inf?.subcategory?.id] || 'Selecione...'}
              onChange={handleSelectChange('subcategory')}
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
              setRechangeModal(false)
            }}
          >
            Cancelar
          </CButton>
          <CButton
            size="sm"
            className="font-inter fw-semibold px-3 text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: '#24247f', border: 'none' }}
            onClick={handleUpdateRow}
          >
            <Save size={14} /> Guardar Cambios
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default React.memo(ManagementCollectionTechnicalSheet)
