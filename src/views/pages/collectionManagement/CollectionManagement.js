import { useEffect, useState, useMemo, useCallback } from 'react'
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

export const CollectionManagement = ({
  collections,
  processes,
  supplyTypes,
  variants,
  garmentTypes,
  washTones,
  bootTypes,
  auxTrademark,
  auxCategories,
  fetchSubcategories,
  fetchGarmentTypes,
  fetchWashTones,
  fetchBootTypes,
  fetchTrademarks,
  fetchCollections,
  fetchProcesses,
  fetchSupplyTypes,
  fetchCategories,
  auxSubcategories,
  save,
}) => {
  const dispath = useDispatch()
  const technicalSheets = useSelector((state) => state.technicalSheetsModified)
  const [data, setData] = useState({})
  const [selected, setSelected] = useState(null)
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [collection, setCollection] = useState(null)
  const [loadingCollection, setLoadingCollection] = useState(false)

  const [brandModalOpen, setBrandModalOpen] = useState(false)
  const [selectedNewBrand, setSelectedNewBrand] = useState(null)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [selectedNewCategory, setSelectedNewCategory] = useState(null)
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false)
  const [selectedNewSubcategory, setSelectedNewSubcategory] = useState(null)

  const [modified, setModified] = useState({})
  const [validated, setValidated] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!selectedCategory) return
    fetchSubcategories(selectedCategory.id)
  }, [selectedCategory])

  useEffect(() => {
    if (!selected) return

    const getCollection = async () => {
      try {
        setLoadingCollection(true)
        const response = await CollectionManagementService.find(selected.value)
        setCollection(response.data.collection)
        const normalizedSheets = response.data.collection.technical_sheets.reduce((acc, aux) => {
          const variantsBySupplyType = aux.variants.reduce((variantsAcc, variant) => {
            variantsAcc[variant.supply_type[0].id] = variant
            return variantsAcc
          }, {})

          const processesByDetails = aux.technical_sheet_details.reduce((processesAcc, process) => {
            processesAcc[process.model_id] = process
            return processesAcc
          }, {})

          acc[aux.id] = {
            ...aux,
            variants: variantsBySupplyType,
            technical_sheet_details: processesByDetails,
            photo_d_original: aux.photo_d,
            photo_t_original: aux.photo_t,
          }
          return acc
        }, {})

        const map = {}

        Object.values(normalizedSheets).forEach((sheet) => {
          const trademark = sheet.product?.trademark
          const subcategory = sheet.product?.subcategory
          const category = subcategory?.category?.[0]

          if (!trademark || !category || !subcategory) return

          if (!map[trademark.id]) {
            map[trademark.id] = {
              ...trademark,
              categories: {},
            }
          }

          if (!map[trademark.id].categories[category.id]) {
            map[trademark.id].categories[category.id] = {
              ...category,
              subcategories: {},
            }
          }

          if (!map[trademark.id].categories[category.id].subcategories[subcategory.id]) {
            map[trademark.id].categories[category.id].subcategories[subcategory.id] = {
              ...subcategory,
              technical_sheets: {},
            }
          }

          map[trademark.id].categories[category.id].subcategories[subcategory.id].technical_sheets =
            {
              ...map[trademark.id].categories[category.id].subcategories[subcategory.id]
                .technical_sheets,
              [sheet.id]: { ...sheet },
            }
        })

        setData(map)
      } catch (error) {
        console.error('Error obteniendo colecciones:', error)
      } finally {
        setLoadingCollection(false)
      }
    }

    getCollection()
  }, [selected])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await Swal.fire({
      title: 'Guardar Información',
      html: `<div style="font-size:14px">
               Se guardará todos los cambios realizados sobre los elementos de la colección ${collection.name}.<br/>
               <strong>¿Deseas continuar?</strong>
             </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, guardar',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      let total = 0
      for (const sheet of Object.values(technicalSheets)) {
        try {
          const aux = {
            id: String(sheet.id).startsWith('temp') ? null : sheet.id,
            code: sheet.code,
            product: {
              id: sheet.product.id,
              code: sheet.product.code,
              subcategory_id: sheet.product.subcategory_id,
              trademark_id: sheet.product.trademark_id,
            },
            collection_id: sheet.collection_id,
            garment_type_id: sheet.garment_type_id,
            wash_tone_id: sheet.wash_tone_id,
            boot_type_id: sheet.boot_type_id,
            observation: sheet.observation,
            status: sheet.status,
            variants: Object.values(sheet.variants)
              .map((item) => item?.id)
              .filter(Boolean),
            technical_sheet_details: Object.values(sheet.technical_sheet_details).map((item) => ({
              model_type: item.model_type,
              model_id: item.model_id,
              status: item.status,
              settings: item.settings || [],
            })),
            photo_d: sheet.photo_d !== null ? sheet.photo_d : [],
            photo_t: sheet.photo_t !== null ? sheet.photo_t : [],
          }

          const result = await save(aux)

          if (result.success) {
            dispath({
              type: 'REMOVE_TECHNICAL_SHEETS',
              payload: {
                id: sheet.id,
              },
            })
            dispath({
              type: 'REMOVE_ERRORS',
              payload: {
                id: sheet.id,
              },
            })
            setErrors((prev) => {
              const update = { ...prev }
              delete update[sheet.id]
              return update
            })
            setValidated((prev) => {
              const update = { ...prev }
              delete update[sheet.id]
              return update
            })
            setModified((prev) => {
              const update = { ...prev }
              delete update[sheet.id]
              return update
            })

            setData((prev) => {
              const newData = structuredClone(prev)

              const variantsBySupplyType = result.data?.technical_sheet?.variants?.reduce(
                (variantsAcc, variant) => {
                  variantsAcc[variant.supply_type[0].id] = variant
                  return variantsAcc
                },
                {},
              )

              const processesByDetails =
                result.data?.technical_sheet?.technical_sheet_details?.reduce(
                  (processesAcc, process) => {
                    processesAcc[process.model_id] = process
                    return processesAcc
                  },
                  {},
                )

              const subcategoryId = sheet?.product?.subcategory?.id
              const categoryId = sheet?.product?.subcategory?.category[0]?.id

              const trademarkAux = newData[selectedBrand.id]
              const categoryAux = trademarkAux.categories[categoryId]
              const subcategoryAux = categoryAux.subcategories[subcategoryId]
              const technicalSheetsAux = subcategoryAux.technical_sheets
              const { [sheet.id]: deleted, ...restTechnicalSheets } = technicalSheetsAux

              newData[selectedBrand.id].categories[categoryId].subcategories[
                subcategoryId
              ].technical_sheets = restTechnicalSheets

              newData[selectedBrand.id].categories[categoryId] ??= {}
              newData[selectedBrand.id].categories[categoryId].subcategories ??= {}
              newData[selectedBrand.id].categories[categoryId].subcategories[subcategoryId] ??= {}
              newData[selectedBrand.id].categories[categoryId].subcategories[
                subcategoryId
              ].technical_sheets ??= {}

              newData[selectedBrand.id].categories[categoryId].subcategories[
                subcategoryId
              ].technical_sheets[result.data.technical_sheet.id] = {
                ...result.data.technical_sheet,
                photo_d_original: result.data.technical_sheet.photo_d,
                photo_t_original: result.data.technical_sheet.photo_t,
                variants: variantsBySupplyType,
                technical_sheet_details: processesByDetails,
              }

              console.log(newData)

              return newData
            })
            total += 1
          } else {
            setErrors((prev) => ({
              ...prev,
              [sheet.id]: result.error,
            }))
            setValidated((prev) => ({
              ...prev,
              [sheet.id]: true,
            }))
            dispath({
              type: 'ADD_ERRORS',
              payload: {
                id: sheet.id,
                errors: result.error,
              },
            })
          }
        } catch (error) {
          console.log('ERROR CAPTURADO', error)
        }
      }

      if (total === Object.keys(technicalSheets).length) {
        Toast.fire({
          icon: 'success',
          title: `Se guardaron todas las fichas técnicas modificadas`,
        })
        return
      }

      Toast.fire({
        icon: 'warning',
        title: `Se guardaron ${total} de ${Object.keys(technicalSheets).length} fichas técnicas`,
      })
    } else {
      Toast.fire({
        icon: 'error',
        title: 'Acción cancelada',
      })
    }
  }

  const trademarks = useMemo(() => {
    return Object.values(data) || {}
  }, [data, data])

  const categories = useMemo(() => {
    if (!selectedBrand) return []
    return Object.values(data[selectedBrand.id]?.categories || {})
  }, [data, selectedBrand])

  const subcategories = useMemo(() => {
    if (!selectedCategory) return []
    return Object.values(
      data[selectedBrand.id]?.categories[selectedCategory.id]?.subcategories || {},
    )
  }, [data, selectedCategory])

  const changeCollection = async () => {
    const result = await Swal.fire({
      title: 'Cambiar Colección',
      html: `<div style="font-size:16px;">
              <strong>Atención:</strong> si cambias de colección, toda la información no guardada se perderá.
              <br /><br />
              <strong>¿Deseas continuar?</strong>
            </div>`,
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
    setSelected(null)
    setCollection(null)
    setSelectedBrand(null)
    setSelectedCategory(null)
    setErrors({})
    dispath({
      type: 'DELETE_ERRORS',
    })
    dispath({
      type: 'DELETE_TECHNICAL_SHEETS',
    })
    setModified({})
  }

  const garmentTypesMap = useMemo(() => {
    return Object.fromEntries(garmentTypes?.map((item) => [item.value, item]) || [])
  }, [garmentTypes])

  const washTonesMap = useMemo(() => {
    return Object.fromEntries(washTones?.map((item) => [item.value, item]) || [])
  }, [washTones])

  const bootTypesMap = useMemo(() => {
    return Object.fromEntries(bootTypes?.map((item) => [item.value, item]) || [])
  }, [bootTypes])

  const addTrademark = useCallback(() => {
    if (!selectedNewBrand) {
      Toast.fire({
        icon: 'warning',
        title: 'Por favor, selecciona una marca.',
      })
      return
    }

    setData((prev) => ({
      ...prev,
      [selectedNewBrand.id]: selectedNewBrand,
    }))

    Toast.fire({
      icon: 'success',
      title: 'Marca asociada correctamente',
    })

    setSelectedNewBrand(null)
    setBrandModalOpen(false)
  }, [selectedNewBrand])

  const addCategory = useCallback(() => {
    if (!selectedNewCategory) {
      Toast.fire({
        icon: 'warning',
        title: 'Por favor, selecciona una categoría.',
      })
      return
    }

    const { subcategories: deleted, ...newCategory } = selectedNewCategory

    setData((prev) => ({
      ...prev,
      [selectedBrand.id]: {
        ...prev[selectedBrand.id],
        categories: {
          ...prev[selectedBrand.id].categories,
          [selectedNewCategory.id]: newCategory,
        },
      },
    }))

    Toast.fire({
      icon: 'success',
      title: 'Categoría asociada correctamente',
    })

    setSelectedNewCategory(null)
    setCategoryModalOpen(false)
  }, [selectedNewCategory, selectedBrand])

  const addSubcategory = useCallback(() => {
    if (!selectedNewSubcategory) {
      Toast.fire({
        icon: 'warning',
        title: 'Por favor, selecciona una subcategoría.',
      })
      return
    }

    setData((prev) => ({
      ...prev,
      [selectedBrand.id]: {
        ...prev[selectedBrand.id],
        categories: {
          ...prev[selectedBrand.id].categories,
          [selectedCategory.id]: {
            ...prev[selectedBrand.id].categories[selectedCategory.id],
            subcategories: {
              ...prev[selectedBrand.id].categories[selectedCategory.id].subcategories,
              [selectedNewSubcategory.id]: { ...selectedNewSubcategory, technical_sheets: {} },
            },
          },
        },
      },
    }))

    Toast.fire({
      icon: 'success',
      title: 'Subcategoría asociada correctamente',
    })

    setSelectedNewSubcategory(null)
    setSubcategoryModalOpen(false)
  }, [selectedNewSubcategory, selectedBrand, selectedCategory, collection, processes])

  if (!Array.isArray(collections)) {
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
              Gestión de Colecciones
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
              Administra las colecciones disponibles
            </span>
          </div>
        </div>
        <CButton
          variant="outline"
          color="primary"
          size="sm"
          className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
          onClick={async () => {
            fetchGarmentTypes()
            fetchSubcategories()
            fetchGarmentTypes()
            fetchWashTones()
            fetchBootTypes()
            fetchTrademarks()
            fetchCollections()
            fetchProcesses({ in_technical_sheet: true })
            fetchSupplyTypes({ in_technical_sheet: true })
            fetchCategories()
          }}
        >
          <RefreshCcw size={16} />
          Sincronizar Información
        </CButton>
      </div>
      <div className="animate-fade-in px-4">
        {!selected ? (
          <>
            <div className="mb-3 animate-fade-in">
              <Select
                options={collections}
                value={selected}
                onChange={setSelected}
                placeholder="Seleccionar colección..."
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
              <FolderKanban size={60} strokeWidth={1.5} />
              <div className="mt-3 fw-semibold fs-5">Ninguna colección seleccionada</div>
              <div className="mt-2">Elige una colección para comenzar la gestión</div>
            </div>
          </>
        ) : loadingCollection || !collection ? (
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
                Cargando colección...
              </span>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div
              className="d-flex align-items-center justify-content-between p-4 rounded-2 bg-white border border-dashed border-1 position-relative overflow-hidden"
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
                  <FolderKanban size={24} />
                </div>
                <div>
                  <span
                    className="d-block font-inter fw-bold uppercase tracking-wider text-secondary mb-1"
                    style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}
                  >
                    Colección Activa
                  </span>
                  <h4
                    className="font-montserrat fw-bold mb-1 text-dark"
                    style={{ color: '#0F172A', fontSize: '1.2rem' }}
                  >
                    {collection?.name}
                  </h4>
                  <p
                    className="font-montserrat text-muted mb-0"
                    style={{ fontSize: '0.85rem', fontWeight: '500' }}
                  >
                    {collection?.description}
                  </p>
                  <div
                    className="d-flex align-items-center flex-wrap gap-2 mt-1 font-inter"
                    style={{
                      fontSize: '.78rem',
                      color: '#94A3B8',
                      fontWeight: 600,
                    }}
                  >
                    <span>
                      Código ·{' '}
                      <span style={{ color: '#334155' }}>{collection?.settings?.code}</span>
                    </span>
                    <span style={{ opacity: 0.4 }}>•</span>
                    <span>
                      Vigencia ·{' '}
                      <span style={{ color: '#334155' }}>
                        {collection?.settings?.start_date} — {collection?.settings?.end_date}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div
                className="d-flex flex-column align-items-stretch gap-2 font-inter"
                style={{
                  width: '180px',
                }}
              >
                <CButton
                  className="d-flex align-items-center gap-2 px-3 font-inter button-change-collection"
                  size="sm"
                  onClick={() => {
                    changeCollection()
                  }}
                >
                  <ArrowDownUp size={15} />
                  Cambiar colección
                </CButton>
                <CButton
                  color="primary"
                  size="sm"
                  className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                  onClick={() => setBrandModalOpen(true)}
                >
                  <Plus size={16} />
                  Agregar Marca
                </CButton>
                {Object.keys(technicalSheets).length > 0 && (
                  <CButton
                    className="d-flex align-items-center gap-2 px-3 font-inter button-save-changes"
                    size="sm"
                    onClick={handleSubmit}
                  >
                    <Save size={16} strokeWidth={2.5} />
                    Guardar Cambios
                  </CButton>
                )}
              </div>
              <div
                className="position-absolute top-0 start-0 h-100"
                style={{ width: '4px', backgroundColor: '#24247f' }}
              />
            </div>
            <div className="mt-3">
              <div className="d-flex align-items-center gap-2 mb-2 px-1">
                <Bookmark size={18} style={{ color: '#24247f' }} />
                <span className="font-montserrat fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                  Marcas asociadas a la colección
                </span>
              </div>
              <CNav
                variant="pills"
                className="p-1 bg-white border rounded-3 shadow-sm d-flex gap-1 flex-nowrap overflow-x-auto mb-3"
                style={{ borderColor: '#E2E8F0' }}
              >
                {Array.isArray(trademarks) && trademarks.length > 0 ? (
                  trademarks.map((trademark) => {
                    const isSelected = selectedBrand?.id === trademark.id
                    const hasErrors = Object.values(trademark.categories ?? {}).some((category) =>
                      Object.values(category.subcategories ?? {}).some((subcategory) =>
                        Object.values(subcategory.technical_sheets ?? {}).some(
                          (sheet) => errors[sheet.id],
                        ),
                      ),
                    )
                    return (
                      <CNavItem key={trademark.id}>
                        <CNavLink
                          className={`font-montserrat fw-semibold rounded-2 gap-2 py-2 px-3 transition-all ${hasErrors ? 'trademark-link-error' : 'trademark-link'} ${
                            isSelected ? 'active-brand' : ''
                          } `}
                          active={isSelected}
                          onClick={() => {
                            setSelectedBrand(trademark)
                            setSelectedCategory(null)
                          }}
                        >
                          {trademark.name}
                          {hasErrors && (
                            <CTooltip
                              className="font-inter"
                              content="Esta marca tiene fichas tecnicas con errores pendientes por corregir"
                            >
                              <span
                                style={{ cursor: 'pointer', color: '#ef4444', marginLeft: '2px' }}
                              >
                                <BadgeAlert size={17} className="style-badge-alerts" />
                              </span>
                            </CTooltip>
                          )}
                        </CNavLink>
                      </CNavItem>
                    )
                  })
                ) : (
                  <div className="p-2 text-muted font-inter small text-center">
                    No hay marcas disponibles en esta colección.
                  </div>
                )}
              </CNav>
              {selectedBrand ? (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-2 px-1">
                      <Bookmark size={18} style={{ color: '#24247f' }} />
                      <span
                        className="font-montserrat fw-bold text-dark"
                        style={{ fontSize: '0.95rem' }}
                      >
                        Categorías asociadas a la marca
                      </span>
                    </div>
                    <CButton
                      color="primary"
                      size="sm"
                      className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                      onClick={() => setCategoryModalOpen(true)}
                    >
                      <Plus size={16} />
                      Agregar Categoría
                    </CButton>
                  </div>
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {categories.map((category) => {
                      const isCatSelected = selectedCategory?.id === category.id
                      const hasErrors = Object.values(category.subcategories ?? {}).some(
                        (subcategory) =>
                          Object.values(subcategory.technical_sheets || {}).some(
                            (sheet) => errors[sheet.id],
                          ),
                      )
                      return (
                        <button
                          key={category.id}
                          onClick={() => {
                            if (isCatSelected) {
                              setSelectedCategory(null)
                            } else {
                              setSelectedCategory(category)
                            }
                          }}
                          className="border-0 rounded-pill px-3 py-2 d-flex align-items-center gap-2 transition-all font-inter"
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            backgroundColor: isCatSelected
                              ? '#EEF2FF'
                              : hasErrors
                                ? '#fef2f2'
                                : '#F8FAFC',
                            color: isCatSelected ? '#24247f' : '#475569',
                            border: isCatSelected ? '1px solid #C7D2FE' : '1px solid #E2E8F0',
                          }}
                        >
                          {isCatSelected ? <FolderOpen size={16} /> : <Folder size={16} />}
                          {category.name}
                          {hasErrors && (
                            <CTooltip
                              className="font-inter"
                              content="Esta categoría tiene fichas tecnicas con errores pendientes por corregir"
                            >
                              <span
                                style={{ cursor: 'pointer', color: '#ef4444', marginLeft: '2px' }}
                              >
                                <BadgeAlert size={17} className="style-badge-alerts" />
                              </span>
                            </CTooltip>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <div
                    className="mt-4 p-3 rounded-4 border bg-white"
                    style={{
                      borderColor: '#E2E8F0',
                    }}
                  >
                    {selectedCategory ? (
                      <div className="animate-fade-in d-flex flex-column gap-5">
                        {subcategories && Object.values(subcategories)?.length > 0 ? (
                          <div className="d-flex flex-column gap-4 animate-fade-in">
                            <CButton
                              color="primary"
                              size="sm"
                              className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                              style={{ width: '214px' }}
                              onClick={() => setSubcategoryModalOpen(true)}
                            >
                              <Plus size={16} />
                              Agregar Subcategoría
                            </CButton>
                            {Object.values(subcategories).map((subcategory) => (
                              <div
                                key={subcategory.id}
                                className="bg-white border rounded-3 overflow-hidden"
                                style={{
                                  borderColor: '#E2E8F0',
                                }}
                              >
                                <div
                                  className="d-flex align-items-center justify-content-between px-3 py-2"
                                  style={{
                                    borderBottom: '1px solid #E2E8F0',
                                    backgroundColor: Object.values(
                                      subcategory?.technical_sheets || {},
                                    ).some((sheet) => errors[sheet.id])
                                      ? '#fee2e2'
                                      : '#FCFCFD',
                                  }}
                                >
                                  <div className="d-flex align-items-center text-center gap-2">
                                    <span
                                      className="fw-semibold font-montserrat justify-content-center gap-2"
                                      style={{
                                        fontSize: '.88rem',
                                        color: '#0F172A',
                                      }}
                                    >
                                      {subcategory.name}
                                      {Object.values(subcategory?.technical_sheets || {}).some(
                                        (sheet) => errors[sheet.id],
                                      ) && (
                                        <CTooltip
                                          className="font-inter"
                                          content="Esta subcategoría tiene fichas tecnicas con errores pendientes por corregir"
                                        >
                                          <span
                                            style={{
                                              cursor: 'pointer',
                                              color: '#ef4444',
                                              marginLeft: '2px',
                                            }}
                                          >
                                            <BadgeAlert size={17} className="style-badge-alerts" />
                                          </span>
                                        </CTooltip>
                                      )}
                                    </span>
                                  </div>
                                  <CButton
                                    color="primary"
                                    size="sm"
                                    className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                                    onClick={() => {
                                      const tempId = `temp-${Date.now()}`
                                      const newTechnical = {
                                        id: tempId,
                                        collection_id: collection.id,
                                        collection: collection,
                                        status: 'Pendiente',
                                        product: {
                                          subcategory_id: subcategory.id,
                                          trademark_id: selectedBrand.id,
                                          subcategory,
                                          trademark: selectedBrand,
                                        },
                                        technical_sheet_details: processes.reduce(
                                          (acc, process) => {
                                            acc[process.id] = {
                                              model_id: process.id,
                                              model_type: 'App\\Models\\Process',
                                              status: 'Pendiente',
                                              settings: process.settings.schema || null,
                                            }
                                            return acc
                                          },
                                          {},
                                        ),
                                        variants: {},
                                      }
                                      setData((prev) => {
                                        const brand = prev[selectedBrand.id]
                                        const category = brand.categories[selectedCategory.id]
                                        const subcategoryAux =
                                          category.subcategories[subcategory.id]

                                        return {
                                          ...prev,
                                          [selectedBrand.id]: {
                                            ...brand,
                                            categories: {
                                              ...brand.categories,
                                              [selectedCategory.id]: {
                                                ...category,
                                                subcategories: {
                                                  ...category.subcategories,
                                                  [subcategoryAux.id]: {
                                                    ...subcategoryAux,
                                                    technical_sheets: {
                                                      ...subcategoryAux.technical_sheets,
                                                      [tempId]: newTechnical,
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        }
                                      })
                                      dispath({
                                        type: 'ADD_TECHNICAL_SHEET',
                                        payload: {
                                          id: tempId,
                                          technicalSheet: newTechnical,
                                        },
                                      })
                                    }}
                                  >
                                    <Plus size={16} strokeWidth={2.5} />
                                    Agregar Fila
                                  </CButton>
                                </div>
                                <div className="table-responsive">
                                  <ManagementCollectionTechnicalSheet
                                    technical_sheets={subcategory.technical_sheets || {}}
                                    supplyTypes={supplyTypes}
                                    processes={processes}
                                    trademark={selectedBrand}
                                    category={selectedCategory}
                                    subcategory={subcategory}
                                    setData={setData}
                                    garmentTypes={garmentTypesMap}
                                    variants={variants}
                                    washTones={washTonesMap}
                                    bootTypes={bootTypesMap}
                                    collections={collections}
                                    trademarks={auxTrademark}
                                    categories={auxCategories}
                                    subcategories={auxSubcategories}
                                    fetchSubcategories={fetchSubcategories}
                                    modified={modified}
                                    setModified={setModified}
                                    validated={validated}
                                    errors={errors}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            className="d-flex flex-column align-items-center text-center py-5 text-muted font-inter bg-white border rounded-3 border-dashed"
                            style={{ borderColor: '#E2E8F0' }}
                          >
                            <p className="mb-3 small fw-medium">
                              No se encontraron subcategorías asociadas a la categoría{' '}
                              <span className="fw-bold">{selectedCategory.name}</span>.
                            </p>

                            <CButton
                              color="primary"
                              size="sm"
                              className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                              onClick={() => setSubcategoryModalOpen(true)}
                            >
                              <Plus size={16} />
                              Agregar Subcategoría
                            </CButton>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-5 text-muted font-inter">
                        <p className="mb-0 small fw-medium">
                          Selecciona una de las categorías para cargar las tablas de datos.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div
                  className="mt-4 text-center py-5 text-muted font-inter bg-white border rounded-3 border-dashed"
                  style={{ borderColor: '#CBD5E1' }}
                >
                  <p className="mb-0 small fw-medium">
                    Selecciona una de las marcas de arriba para visualizar sus respectivas tablas de
                    datos.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <CModal
        visible={brandModalOpen}
        onClose={() => {
          setSelectedNewBrand(null)
          setBrandModalOpen(false)
        }}
        alignment="center"
        className="font-montserrat"
      >
        <CModalHeader style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <CModalTitle style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
            Asociar Nueva Marca a la Colección
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <div className="mb-3">
            <label
              className="form-label font-inter fw-semibold mb-2"
              style={{ fontSize: '0.85rem', color: '#334155' }}
            >
              Selecciona una marca disponible en el sistema:
            </label>
            <Select
              options={
                Array.isArray(auxTrademark)
                  ? auxTrademark.filter((item) => !trademarks.some((aux) => aux.id === item.id))
                  : []
              }
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
              value={selectedNewBrand}
              onChange={setSelectedNewBrand}
              placeholder="Buscar o seleccionar marca..."
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
              setSelectedNewBrand(null)
              setBrandModalOpen(false)
            }}
          >
            Cancelar
          </CButton>
          <CButton
            size="sm"
            className="font-inter fw-semibold px-3 text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: '#24247f', border: 'none' }}
            onClick={addTrademark}
          >
            <Save size={14} />
            Asociar Marca
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal
        visible={categoryModalOpen}
        onClose={() => {
          setSelectedNewCategory(null)
          setCategoryModalOpen(false)
        }}
        alignment="center"
        className="font-montserrat"
      >
        <CModalHeader style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <CModalTitle style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
            Asociar Categoría a la Marca
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <div className="mb-3">
            <label
              className="form-label font-inter fw-semibold mb-2"
              style={{ fontSize: '0.85rem', color: '#334155' }}
            >
              Selecciona una categoría disponible en el sistema:
            </label>
            <Select
              options={
                Array.isArray(auxCategories)
                  ? auxCategories.filter((item) => !categories.some((aux) => aux.id === item.id))
                  : []
              }
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
              value={selectedNewCategory}
              onChange={setSelectedNewCategory}
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
        </CModalBody>
        <CModalFooter style={{ borderTop: '1px solid #E2E8F0', gap: '8px' }}>
          <CButton
            color="secondary"
            size="sm"
            className="font-inter fw-medium"
            onClick={() => {
              setSelectedNewCategory(null)
              setCategoryModalOpen(false)
            }}
          >
            Cancelar
          </CButton>
          <CButton
            size="sm"
            className="font-inter fw-semibold px-3 text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: '#24247f', border: 'none' }}
            onClick={addCategory}
          >
            <Save size={14} />
            Asociar Categoría
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal
        visible={subcategoryModalOpen}
        onClose={() => {
          setSelectedNewSubcategory(null)
          setSubcategoryModalOpen(false)
        }}
        alignment="center"
        className="font-montserrat"
      >
        <CModalHeader style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <CModalTitle style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
            Asociar Subcategoría
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <div className="mb-3">
            <label
              className="form-label font-inter fw-semibold mb-2"
              style={{ fontSize: '0.85rem', color: '#334155' }}
            >
              Selecciona una subcategoría disponible en el sistema:
            </label>
            <Select
              options={
                Array.isArray(auxSubcategories)
                  ? auxSubcategories.filter(
                      (item) => !Object.values(subcategories).some((aux) => aux.id === item.id),
                    )
                  : []
              }
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
              value={selectedNewSubcategory}
              onChange={setSelectedNewSubcategory}
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
              setSelectedNewSubcategory(null)
              setSubcategoryModalOpen(false)
            }}
          >
            Cancelar
          </CButton>
          <CButton
            size="sm"
            className="font-inter fw-semibold px-3 text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: '#24247f', border: 'none' }}
            onClick={addSubcategory}
          >
            <Save size={14} />
            Asociar Categoría
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default CollectionManagement
