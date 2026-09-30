import { useEffect, useState, useMemo, useCallback } from 'react'
import { CCard, CSpinner, CNav, CNavItem, CNavLink, CButton } from '@coreui/react'
import {
  FolderKanban,
  Bookmark,
  Folder,
  FolderOpen,
  ArrowDownUp,
  Save,
  Settings2,
} from 'lucide-react'
import Select from 'react-select'
import { IoMdArrowDropright } from 'react-icons/io'
import LoadingForm from '@/components/LoadingForm'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'
import { selectStyles } from '@/components/StyleManagementCollection'
import ManagementProductionOrders from '@/components/ManagementProductionOrders'
import ModalBuilderCurveProgramationManagement from '@/components/ModalBuilderCurveProgramationManagement'
import HorizontalScrollTable from '@/components/HorizontalScrollTable'

export const ProductionManagement = ({
  collection,
  collections,
  setCollection,
  findCollection,
  trademarks,
  fabrics,
  suppliers,
  products,
  fetchProducts,
  aux_trademarks,
  errors_create,
  createProduct,
  save,
  opt_status,
  categories,
  subcategories,
  fetchSubcategories,
  create_builder,
  update_builder,
  delete_builder,
  errors_builder,
  builders,
  processes,
  priority_checks,
  priority_levels,
  priority_rules,
}) => {
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [selectedTrademark, setSelectedTrademark] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [productionChanges, setProductionChanges] = useState({})
  const [productionReassignments, setProductionReassignments] = useState({})
  const [productionOriginReassignments, setProductionOriginReassignments] = useState({})
  const [openModalBuilder, setOpenModalBuilder] = useState(false)
  const [loadingBuilders, setLoadingBuilders] = useState(false)

  const [validated, setValidated] = useState({})
  const [errors, setErrors] = useState({})
  const [hasReassignment, setHasReassignment] = useState({})

  const handleOrderChange = useCallback(
    (technical_sheet_id, production_order, field, value, product_stara = null) => {
      console.log(technical_sheet_id, production_order, field, value, (product_stara = null))
      setProductionChanges((prev) => {
        const technicalSheetChanges = prev[technical_sheet_id] ?? {}

        if (product_stara !== null) {
          return { ...prev, [technical_sheet_id]: { ...technicalSheetChanges, product_stara } }
        }

        const orders = technicalSheetChanges.orders ?? {}

        const currentOrder = orders[production_order.id] ?? production_order

        const normalizedDetails = (currentOrder.production_order_details ?? []).map((detail) => {
          if (detail.model_type === 'App\\Models\\Product') {
            const quantities = detail.production_order_detail_quantities ?? detail.sizes ?? []

            return {
              id: detail.id ?? null,
              destination: detail.destination,
              model_id: detail.model_id,
              model_type: detail.model_type,

              sizes: Array.isArray(quantities)
                ? quantities
                    .filter((size) => Number(size.quantity ?? 0) !== 0)
                    .map((size) => ({
                      id: size.id ?? null,
                      size_id: size.size_id,
                      quantity: Number(size.quantity ?? 0),
                    }))
                : Object.values(quantities)
                    .filter((size) => Number(size.quantity ?? 0) !== 0)
                    .map((size) => ({
                      id: size.id ?? null,
                      size_id: size.size_id,
                      quantity: Number(size.quantity ?? 0),
                    })),
            }
          }

          if (detail.model_type === 'App\\Models\\Supply') {
            return {
              id: detail.id ?? null,
              destination: detail.destination,
              model_id: detail.model_id,
              model_type: detail.model_type,
            }
          }

          return detail
        })

        let updatedProductionOrder = {
          ...currentOrder,
          production_order_details: normalizedDetails,
        }

        if (field === 'color_id') {
          updatedProductionOrder = {
            ...updatedProductionOrder,
            color_id: value,
          }
        }

        if (field === 'reasigned_curve') {
          updatedProductionOrder = {
            ...updatedProductionOrder,
            reasigned_curve: value,
          }
        }

        if (field === 'status') {
          updatedProductionOrder = {
            ...updatedProductionOrder,
            status: value,
          }
        }

        if (field === 'priority') {
          updatedProductionOrder = {
            ...updatedProductionOrder,
            priority: value,
          }
        }

        if (field === 'settings') {
          updatedProductionOrder = {
            ...updatedProductionOrder,
            settings: { ...updatedProductionOrder?.['settings'], ...value },
          }
        }

        if (field === 'date') {
          updatedProductionOrder = {
            ...updatedProductionOrder,
            date: value || null,
          }
        }

        if (field === 'production_place') {
          updatedProductionOrder = {
            ...updatedProductionOrder,
            production_place: value || null,
          }
        }

        if (field === 'supplier_id') {
          updatedProductionOrder = {
            ...updatedProductionOrder,
            supplier_id: value || null,
          }
        }

        if (field === 'fabric_id') {
          const hasSupply = normalizedDetails.some(
            (detail) => detail.model_type === 'App\\Models\\Supply',
          )

          let updatedDetails

          if (hasSupply) {
            updatedDetails = normalizedDetails.map((detail) => {
              if (detail.model_type === 'App\\Models\\Supply') {
                return {
                  ...detail,
                  model_id: value,
                }
              }

              return detail
            })
          } else {
            updatedDetails = [
              ...normalizedDetails,
              {
                id: null,
                destination: null,
                model_id: value,
                model_type: 'App\\Models\\Supply',
              },
            ]
          }

          updatedProductionOrder = {
            ...updatedProductionOrder,
            fabric_id: value || null,
            production_order_details: updatedDetails,
          }
        }

        if (field === 'curve') {
          updatedProductionOrder = {
            ...updatedProductionOrder,
            curve: value,
          }
        }

        if (field === 'programation') {
          updatedProductionOrder = {
            ...updatedProductionOrder,
            programation: value,
          }
        }

        return {
          ...prev,
          [technical_sheet_id]: {
            ...technicalSheetChanges,
            orders: {
              ...orders,
              [production_order.id]: updatedProductionOrder,
            },
          },
        }
      })
    },
    [],
  )

  const handleCreateOrder = useCallback((technical_sheet_id, newOrder) => {
    setProductionChanges((prev) => {
      const technicalSheetChanges = prev[technical_sheet_id] ?? {}
      const orders = technicalSheetChanges.orders ?? {}

      return {
        ...prev,

        [technical_sheet_id]: {
          ...technicalSheetChanges,

          orders: {
            ...orders,

            [newOrder.id]: newOrder,
          },
        },
      }
    })
  }, [])

  const handleDeleteOrder = useCallback((technical_sheet_id, production_order, lastOriginalCut) => {
    setProductionChanges((prev) => {
      const technicalSheetChanges = prev[technical_sheet_id] ?? {}
      const orders = technicalSheetChanges.orders ?? {}

      const { [production_order.id]: _, ...remainingOrders } = orders

      const newOrders = Object.entries(remainingOrders)
        .filter(([_, changes]) => changes.isNew && !changes.deleted)
        .map(([id, changes]) => ({
          id,
          ...changes,
        }))

      let nextCutIndex = lastOriginalCut ? lastOriginalCut.charCodeAt(0) - 65 + 1 : 0

      const reorderedOrders = newOrders.reduce((acc, order) => {
        acc[order.id] = {
          ...remainingOrders[order.id],
          cut: String.fromCharCode(65 + nextCutIndex++),
        }

        return acc
      }, {})

      return {
        ...prev,
        [technical_sheet_id]: {
          ...technicalSheetChanges,
          orders: {
            ...remainingOrders,
            ...reorderedOrders,
          },
        },
      }
    })
  }, [])

  const handleReassignmentsChange = useCallback((technical_sheet_id, order_id, key, changes) => {
    setProductionOriginReassignments((prev) => ({
      ...prev,
      [changes.production_order_id]: {
        ...(prev[changes.production_order_id] ?? {}),
        production_order_id: changes.production_order_id,
        used_for_reassignment: true,
      },
    }))

    setProductionReassignments((prev) => {
      const technicalSheetChanges = prev[technical_sheet_id] ?? {}
      const orders = technicalSheetChanges.orders ?? {}
      const currentOrder = orders[order_id] ?? {}

      let updatedValue

      if (key === 'selected_references') {
        const currentReferences = currentOrder.selected_references ?? []

        const referenceId = String(changes.production_order_id)

        const existingIndex = currentReferences.findIndex(
          (reference) =>
            String(reference.production_order?.id ?? reference.production_order_id) === referenceId,
        )

        if (existingIndex >= 0) {
          updatedValue = currentReferences.map((reference, index) =>
            index === existingIndex ? { ...reference, ...changes } : reference,
          )
        } else {
          updatedValue = [...currentReferences, changes]
        }
      } else if (key === 'curve_original') {
        updatedValue = changes
      } else {
        updatedValue = {
          ...(currentOrder[key] ?? {}),
          ...changes,
        }
      }

      return {
        ...prev,
        [technical_sheet_id]: {
          ...technicalSheetChanges,
          orders: {
            ...orders,
            [order_id]: {
              ...currentOrder,
              [key]: updatedValue,
            },
          },
        },
      }
    })
  }, [])

  const handleDeleteReassignment = useCallback((technical_sheet_id, order_id) => {
    setProductionReassignments((prev) => {
      const technicalSheetChanges = prev[technical_sheet_id]

      if (!technicalSheetChanges?.orders?.[order_id]) {
        return prev
      }

      const { [order_id]: _, ...remainingOrders } = technicalSheetChanges.orders

      return {
        ...prev,
        [technical_sheet_id]: {
          ...technicalSheetChanges,
          orders: remainingOrders,
        },
      }
    })

    setProductionChanges((prev) => {
      const technicalSheetChanges = prev[technical_sheet_id]

      if (!technicalSheetChanges?.orders?.[order_id]) {
        return prev
      }

      const currentOrder = technicalSheetChanges.orders[order_id]

      const { curve, ...remainingOrderChanges } = currentOrder

      return {
        ...prev,
        [technical_sheet_id]: {
          ...technicalSheetChanges,
          orders: {
            ...technicalSheetChanges.orders,
            [order_id]: remainingOrderChanges,
          },
        },
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedCollection) return

    findCollection(selectedCollection.value)
  }, [selectedCollection])

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

    setCollection(null)
    setSelectedCollection(null)
    setSelectedTrademark(null)
    setSelectedCategory(null)
  }

  const getCurveActualized = (technical_sheet_id, production_order_id) => {
    const curve = productionChanges?.[technical_sheet_id]?.orders?.[production_order_id]?.curve
    return curve ?? null
  }

  const insertOrderInCategory = (category, technicalSheetId, savedOrder) => {
    if (!category) return category

    const subcategories = Object.fromEntries(
      Object.entries(category.subcategories ?? {}).map(([subcategoryId, subcategory]) => {
        const technicalSheets = (subcategory.technical_sheets ?? []).map((sheet) => {
          if (Number(sheet.id) !== Number(technicalSheetId)) {
            return sheet
          }

          const currentOrders = sheet.production_orders ?? []

          const alreadyExists = currentOrders.some(
            (order) => Number(order.id) === Number(savedOrder.id),
          )

          return {
            ...sheet,
            production_orders: alreadyExists ? currentOrders : [...currentOrders, savedOrder],
          }
        })

        return [
          subcategoryId,
          {
            ...subcategory,
            technical_sheets: technicalSheets,
          },
        ]
      }),
    )

    return {
      ...category,
      subcategories,
    }
  }

  const addSavedOrderToTechnicalSheet = (technicalSheetId, savedOrder) => {
    setSelectedTrademark((prev) => {
      if (!prev) return prev

      const updatedCategories = Object.fromEntries(
        Object.entries(prev.categories ?? {}).map(([categoryId, category]) => [
          categoryId,
          insertOrderInCategory(category, technicalSheetId, savedOrder),
        ]),
      )

      return {
        ...prev,
        categories: updatedCategories,
      }
    })

    setSelectedCategory((prev) =>
      prev ? insertOrderInCategory(prev, technicalSheetId, savedOrder) : prev,
    )
  }

  const updateOrderInCategory = (category, technicalSheetId, updatedOrder) => {
    if (!category) return category

    const subcategories = Object.fromEntries(
      Object.entries(category.subcategories ?? {}).map(([subcategoryId, subcategory]) => {
        const technicalSheets = (subcategory.technical_sheets ?? []).map((sheet) => {
          if (Number(sheet.id) !== Number(technicalSheetId)) {
            return sheet
          }

          const currentOrders = sheet.production_orders ?? []

          const updatedOrders = currentOrders.map((order) => {
            if (Number(order.id) !== Number(updatedOrder.id)) {
              return order
            }

            return {
              ...order,
              ...updatedOrder,
            }
          })

          return {
            ...sheet,
            production_orders: updatedOrders,
          }
        })

        return [
          subcategoryId,
          {
            ...subcategory,
            technical_sheets: technicalSheets,
          },
        ]
      }),
    )

    return {
      ...category,
      subcategories,
    }
  }

  const updateSavedOrderInTechnicalSheet = (technicalSheetId, updatedOrder) => {
    setSelectedTrademark((prev) => {
      if (!prev) return prev

      const updatedCategories = Object.fromEntries(
        Object.entries(prev.categories ?? {}).map(([categoryId, category]) => [
          categoryId,
          updateOrderInCategory(category, technicalSheetId, updatedOrder),
        ]),
      )

      return {
        ...prev,
        categories: updatedCategories,
      }
    })

    setSelectedCategory((prev) =>
      prev ? updateOrderInCategory(prev, technicalSheetId, updatedOrder) : prev,
    )
  }

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
      const production_orders = Object.entries(productionChanges).flatMap(
        ([technical_sheet_id, technicalSheetData]) =>
          Object.entries(technicalSheetData.orders ?? {}).map(([production_order_id, changes]) => {
            const hasCurve = Array.isArray(changes.curve) && changes.curve.length > 0

            const hasProgramation =
              changes.programation &&
              typeof changes.programation === 'object' &&
              !Array.isArray(changes.programation)

            const currentDetails = changes.production_order_details ?? []

            const supply = currentDetails.find((item) => item.model_type === 'App\\Models\\Supply')

            let products

            if (hasCurve) {
              products = changes.curve
                .filter((item) => item.reference_id !== null)
                .map((item) => ({
                  id: item.id ?? null,
                  destination: item.destination,
                  model_id: item.reference_id,
                  model_type: 'App\\Models\\Product',
                  sizes: item.quantities
                    .filter((size) => size.size_id !== null)
                    .map((size) => ({
                      id: size.id ?? null,
                      size_id: size.size_id,
                      quantity: Number(size.quantity ?? 0),
                    })),
                }))
            } else {
              products = currentDetails.filter((item) => item.model_type === 'App\\Models\\Product')
            }

            let processes

            if (hasProgramation) {
              processes = Object.values(changes.programation)
                .filter((item) => item)
                .map((item) => ({
                  id: item.id ?? null,
                  destination: null,
                  model_id: item.model_id,
                  model_type: 'App\\Models\\Process',
                  settings: {
                    date: item.date,
                  },
                }))
            } else {
              processes = currentDetails.filter(
                (item) => item.model_type === 'App\\Models\\Process',
              )
            }
            const otherDetails = currentDetails.filter(
              (item) =>
                item.model_type !== 'App\\Models\\Supply' &&
                item.model_type !== 'App\\Models\\Product' &&
                item.model_type !== 'App\\Models\\Process',
            )

            const production_order_details = [
              ...(supply ? [supply] : []),
              ...products,
              ...processes,
              ...otherDetails,
            ]

            return {
              ...changes,
              id: production_order_id,
              color_id: changes.color_id ?? changes.color?.[0]?.id ?? null,
              date: String(changes.date ?? '').split('T')[0],
              technical_sheet_id: Number(technical_sheet_id),
              production_order_details,
              ...(changes.reasigned_curve ?? {}),
            }
          }),
      )

      const givingOrderIds = new Set()

      Object.values(productionReassignments ?? {}).forEach((technicalSheetData) => {
        Object.values(technicalSheetData.orders ?? {}).forEach((orderReassignment) => {
          ;(orderReassignment.selected_references ?? []).forEach((reference) => {
            const originOrderId = reference.production_order?.id

            if (originOrderId != null) {
              givingOrderIds.add(Number(originOrderId))
            }
          })
        })
      })

      const receivingOrders = production_orders.filter((order) => hasReassignment?.[order.id])

      const givingOrders = production_orders.filter((order) => givingOrderIds.has(Number(order.id)))

      const reassignmentIds = new Set([
        ...receivingOrders.map((order) => Number(order.id)),
        ...givingOrders.map((order) => Number(order.id)),
      ])

      const normalOrders = production_orders.filter(
        (order) => !reassignmentIds.has(Number(order.id)),
      )

      const removeProductionOrderChange = (production_order) => {
        setProductionChanges((prev) => {
          const technicalSheetId = production_order.technical_sheet_id
          const technicalSheetChanges = prev[technicalSheetId]

          if (!technicalSheetChanges) {
            return prev
          }

          const orders = technicalSheetChanges.orders ?? {}
          const { [production_order.id]: _, ...remainingOrders } = orders

          if (Object.keys(remainingOrders).length === 0) {
            const { [technicalSheetId]: __, ...remainingSheets } = prev

            return remainingSheets
          }

          return {
            ...prev,
            [technicalSheetId]: {
              ...technicalSheetChanges,
              orders: remainingOrders,
            },
          }
        })
      }

      let savedCount = 0

      const saveProductionOrder = async (production_order) => {
        try {
          const result = await save({
            ...production_order,
            id: String(production_order.id).startsWith('new-') ? null : Number(production_order.id),
          })

          if (result.success) {
            savedCount++

            const savedOrderFromApi = result.data.production_order

            const savedOrder = {
              ...production_order,
              ...savedOrderFromApi,
            }

            if (String(production_order.id).startsWith('new-')) {
              addSavedOrderToTechnicalSheet(production_order.technical_sheet_id, savedOrder)
            } else {
              updateSavedOrderInTechnicalSheet(production_order.technical_sheet_id, savedOrder)
            }

            removeProductionOrderChange(production_order)

            for (const origin of production_order.reassigned_origins ?? []) {
              const originOrder = production_orders.find(
                (order) => Number(order.id) === Number(origin.production_order_id),
              )

              if (originOrder) {
                removeProductionOrderChange(originOrder)
              }
            }

            setHasReassignment((prev) => {
              const updated = { ...prev }

              delete updated[production_order.id]

              if (
                String(production_order.id).startsWith('new-') &&
                result.data?.production_order?.id
              ) {
                delete updated[result.data.production_order.id]
              }

              return updated
            })
            return true
          }

          setErrors((prev) => ({
            ...prev,
            [production_order.id]: result.error.errors,
          }))

          setValidated((prev) => ({
            ...prev,
            [production_order.id]: true,
          }))

          return false
        } catch (error) {
          console.error('ERROR CAPTURADO:', error)

          setErrors((prev) => ({
            ...prev,
            [production_order.id]: error,
          }))

          setValidated((prev) => ({
            ...prev,
            [production_order.id]: true,
          }))

          return false
        }
      }

      const ordersToSave = [...receivingOrders, ...normalOrders]

      for (const production_order of ordersToSave) {
        const reassignmentData =
          productionReassignments?.[production_order.technical_sheet_id]?.orders?.[
            production_order.id
          ]

        const isReceivingOrder = Boolean(hasReassignment?.[production_order.id])

        await saveProductionOrder({
          ...production_order,

          ...(isReceivingOrder
            ? {
                reasigned_curve: true,
                reassigned_origins: (reassignmentData?.selected_references ?? []).map((item) => ({
                  production_order_id: item.production_order_id,
                  reassigned_details: item.reassigned_details,
                  selected_rows: item.selected_rows,
                })),
              }
            : {}),
        })
      }

      Toast.fire({
        icon: savedCount === ordersToSave.length ? 'success' : 'warning',
        title: `Se guardaron ${savedCount} de ${ordersToSave.length} órdenes de producción`,
      })
    } else {
      Toast.fire({
        icon: 'error',
        title: 'Acción cancelada',
      })
    }
  }

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
              Gestión de Programación de Producción
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
      <div className="animate-fade-in px-4">
        {!selectedCollection ? (
          <>
            <div className="mb-3 animate-fade-in">
              <Select
                options={collections}
                value={selectedCollection}
                onChange={setSelectedCollection}
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
              <div className="mt-3 fw-semibold fs-5 font-inter">Ninguna colección seleccionada</div>
              <div className="mt-2">Elige una colección para comenzar la gestión</div>
            </div>
          </>
        ) : !collection ? (
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
                {Object.values(productionChanges || {}).length > 0 && (
                  <CButton
                    className="d-flex align-items-center gap-2 px-3 font-inter button-save-changes"
                    size="sm"
                    onClick={handleSubmit}
                  >
                    <Save size={16} strokeWidth={2.5} />
                    Guardar Cambios
                  </CButton>
                )}
                <CButton
                  color="primary"
                  size="sm"
                  className="d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
                  onClick={() => setOpenModalBuilder(true)}
                >
                  <Settings2 size={16} />
                  G. del Constructor
                </CButton>
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
                {Object.values(trademarks).length === 0 ? (
                  <div className="p-2 text-muted font-inter small text-center">
                    No hay marcas disponibles en esta colección.
                  </div>
                ) : (
                  Object.values(trademarks).map((trademark) => {
                    const isSelected = selectedTrademark?.id === trademark.id
                    return (
                      <CNavItem key={trademark.id}>
                        <CNavLink
                          className={`font-montserrat fw-semibold rounded-2 gap-2 py-2 px-3 transition-all trademark-link ${
                            isSelected ? 'active-brand' : ''
                          } `}
                          active={isSelected}
                          onClick={() => {
                            setSelectedTrademark(trademark)
                            setSelectedCategory(null)
                          }}
                        >
                          {trademark.name}
                        </CNavLink>
                      </CNavItem>
                    )
                  })
                )}
              </CNav>
              {selectedTrademark ? (
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
                  </div>
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {Object.values(selectedTrademark.categories).map((category) => {
                      const isCatSelected = selectedCategory?.id === category.id
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
                            backgroundColor: isCatSelected ? '#EEF2FF' : '#F8FAFC',
                            color: isCatSelected ? '#24247f' : '#475569',
                            border: isCatSelected ? '1px solid #C7D2FE' : '1px solid #E2E8F0',
                          }}
                        >
                          {isCatSelected ? <FolderOpen size={16} /> : <Folder size={16} />}
                          {category.name}
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
                        {selectedCategory &&
                        Object.values(selectedCategory.subcategories)?.length > 0 ? (
                          <div className="d-flex flex-column gap-4 animate-fade-in">
                            {Object.values(selectedCategory.subcategories).map((subcategory) => (
                              <div
                                key={subcategory.id}
                                className="bg-white border rounded-3"
                                style={{
                                  borderColor: '#E2E8F0',
                                }}
                              >
                                <div
                                  className="d-flex align-items-center justify-content-between px-3 py-2"
                                  style={{
                                    borderBottom: '1px solid #E2E8F0',
                                    backgroundColor: '#FCFCFD',
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
                                    </span>
                                  </div>
                                </div>
                                <div className="table-responsive">
                                  <ManagementProductionOrders
                                    technical_sheets={subcategory.technical_sheets}
                                    sizes={selectedTrademark.sizes}
                                    onCreateOrder={handleCreateOrder}
                                    onDeleteOrder={handleDeleteOrder}
                                    onOrderChange={handleOrderChange}
                                    onReassignmentsChange={handleReassignmentsChange}
                                    production_changes={productionChanges}
                                    production_reassignments={productionReassignments}
                                    fabrics={fabrics}
                                    suppliers={suppliers}
                                    products={products}
                                    trademarks={trademarks}
                                    fetchProducts={fetchProducts}
                                    aux_trademarks={aux_trademarks}
                                    errors_create={errors_create}
                                    createProduct={createProduct}
                                    getCurveActualized={getCurveActualized}
                                    onDeleteReassignment={handleDeleteReassignment}
                                    productionOriginReassignments={productionOriginReassignments}
                                    validated={validated}
                                    errors={errors}
                                    opt_status={opt_status}
                                    builders={builders}
                                    processes={processes}
                                    hasReassignment={hasReassignment}
                                    setHasReassignment={setHasReassignment}
                                    priority_checks={priority_checks}
                                    priority_levels={priority_levels}
                                    priority_rules={priority_rules}
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
                              No se encontraron subcategorías asociadas a la categoría
                              <span className="fw-bold">{selectedCategory.name}</span>.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-5 text-muted font-inter">
                        <p className="mb-0 small fw-medium">
                          Selecciona una de las categorías para cargar las programaciones de
                          producción.
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
                    Selecciona una de las marcas de arriba para visualizar sus respectivas
                    programaciones de producción.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {openModalBuilder && (
        <ModalBuilderCurveProgramationManagement
          trademarks={aux_trademarks}
          categories={categories}
          subcategories={subcategories}
          fetchSubcategories={fetchSubcategories}
          openModalBuilder={openModalBuilder}
          setOpenModalBuilder={setOpenModalBuilder}
          create_builder={create_builder}
          update_builder={update_builder}
          delete_builder={delete_builder}
          errors_builder={errors_builder}
          builders={builders}
        />
      )}
    </CCard>
  )
}

export default ProductionManagement
