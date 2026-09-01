import React, { useState, useMemo } from 'react'
import ProductionOrderRow from './ProductionOrderRow'
import TechnicalSheetWithoutOrder from './TechnicalSheetWithoutOrder'
import { CButton } from '@coreui/react'
import { Plus } from 'lucide-react'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'

const ManagementProductionTechnicalSheetRow = ({
  technical_sheet,
  editingOrderId,
  onEditOrder,
  onCancelEdit,
  sizes,
  fabrics,
  suppliers,
  products,
  fetchProducts,
  onCreateOrder,
  onDeleteOrder,
  onOrderChange,
  onReassignmentsChange,
  aux_trademarks,
  production_changes,
  production_reassignments,
  errors_create,
  createProduct,
  getCurveActualized,
  onDeleteReassignment,
  productionOriginReassignments,
  validated,
  errors,
  opt_status,
  builders,
  processes,
}) => {
  const lastOriginalCut = useMemo(() => {
    const productionOrders = technical_sheet.production_orders ?? []

    if (!productionOrders.length) return null

    return productionOrders.reduce((lastCut, order) => {
      const cut = String(order.cut ?? '')
        .trim()
        .toUpperCase()

      if (!cut) return lastCut

      if (!lastCut) return cut

      return cut.charCodeAt(0) > lastCut.charCodeAt(0) ? cut : lastCut
    }, null)
  }, [technical_sheet.production_orders])

  const auxProductionOrders = useMemo(() => {
    const productionOrders = technical_sheet.production_orders ?? []

    const ordersChanges = production_changes?.orders ?? {}

    const newOrders = Object.entries(ordersChanges)
      .filter(([_, changes]) => changes.isNew && !changes.deleted)
      .map(([id, changes]) => ({
        id,
        ...changes,
      }))

    return [...productionOrders, ...newOrders]
  }, [technical_sheet.production_orders, production_changes])

  const getNextCut = (orders) => {
    const usedCuts = orders
      .map((order) => order.cut)
      .filter(Boolean)
      .map((cut) => String(cut).trim().toUpperCase())

    let nextCode = 0

    while (usedCuts.includes(String.fromCharCode(65 + nextCode))) {
      nextCode++
    }

    return String.fromCharCode(65 + nextCode)
  }

  const findBuilder = () => {
    if (!builders?.length) {
      return null
    }

    const trademarkId = String(technical_sheet.product?.trademark_id)
    const categoryId = String(technical_sheet.product?.subcategory?.category?.[0]?.id)
    const subcategoryId = String(technical_sheet.product?.subcategory_id)

    // 1. Marca + categoría + subcategoría
    const exactBuilder = builders.find((builder) => {
      const trademarks = builder.trademarks?.map((item) => String(item.id)) ?? []
      const categories = builder.categories?.map((item) => String(item.id)) ?? []
      const subcategories = builder.subcategories?.map((item) => String(item.id)) ?? []

      return (
        trademarks.includes(trademarkId) &&
        categories.includes(categoryId) &&
        subcategories.includes(subcategoryId)
      )
    })

    if (exactBuilder) {
      return exactBuilder
    }

    // 2. Marca + categoría
    const categoryBuilder = builders.find((builder) => {
      const trademarks = builder.trademarks?.map((item) => String(item.id)) ?? []
      const categories = builder.categories?.map((item) => String(item.id)) ?? []

      return (
        trademarks.includes(trademarkId) &&
        categories.includes(categoryId) &&
        (!builder.subcategories || builder.subcategories.length === 0)
      )
    })

    if (categoryBuilder) {
      return categoryBuilder
    }

    // 3. Marca
    const trademarkBuilder = builders.find((builder) => {
      const trademarks = builder.trademarks?.map((item) => String(item.id)) ?? []

      return (
        trademarks.includes(trademarkId) &&
        (!builder.categories || builder.categories.length === 0) &&
        (!builder.subcategories || builder.subcategories.length === 0)
      )
    })

    return trademarkBuilder ?? null
  }

  const handleCreateOrder = () => {
    const tempId = `new-${Date.now()}`
    const nextCut = getNextCut(auxProductionOrders)
    const builder = findBuilder()

    const newOrder = {
      id: tempId,
      production_order_id: null,
      isNew: true,
      deleted: false,
      date: null,
      status: 'Pendiente',
      cut: nextCut,
      color_id: null,
      production_order_details: [],
      builder_id: builder?.id ?? null,
      builder_percentages:
        builder?.percentages.reduce((acc, item) => {
          acc[item.size.id] = { percentage: item.percentage }
          return acc
        }, {}) ?? null,
    }

    onCreateOrder?.(technical_sheet.id, newOrder)
  }

  const handleDeleteOrder = async (production_order_id) => {
    const result = await Swal.fire({
      title: 'Eliminar Orden de Producción',
      html: `<div style="font-size:14px">
                 Se eliminará la order de producción. La información ingresada sera eliminada.<br/>
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
      return
    }
    const order = auxProductionOrders.find((order) => order.id === production_order_id)

    if (!order) {
      return
    }

    onDeleteOrder(technical_sheet.id, order, lastOriginalCut)

    Toast.fire({
      icon: 'success',
      title: 'Orden de producción eliminada correctamente',
    })
  }

  return (
    <>
      <tr className="technical-sheet-reference-row">
        <td colSpan={sizes.length + processes.length + 17}>
          <div className="technical-sheet-reference-content">
            <span className="reference-code">{technical_sheet.product.code}</span>
          </div>

          <CButton
            color="primary"
            size="sm"
            className="reference-add-button d-flex align-items-center gap-2 px-3 shadow-sm font-inter"
            onClick={() => handleCreateOrder()}
          >
            <Plus size={16} />
            Agregar Orden
          </CButton>
        </td>
      </tr>

      {auxProductionOrders.length > 0 ? (
        auxProductionOrders.map((production_order, index) => (
          <ProductionOrderRow
            key={production_order.id}
            technical_sheet={technical_sheet}
            details={technical_sheet.technical_sheet_details}
            production_order={production_order}
            technicalSheetRowSpan={auxProductionOrders.length * 4}
            showTechnicalSheetData={index === 0}
            isEditing={editingOrderId === production_order.id_orden_produccion}
            onEdit={onEditOrder}
            onCancelEdit={onCancelEdit}
            sizes={sizes}
            fabrics={fabrics}
            suppliers={suppliers}
            products={products}
            trademarks={aux_trademarks}
            onOrderChange={onOrderChange}
            onReassignmentsChange={onReassignmentsChange}
            onDeleteOrder={handleDeleteOrder}
            onDeleteReassignment={onDeleteReassignment}
            fetchProducts={fetchProducts}
            errors_create={errors_create}
            createProduct={createProduct}
            is_reference_reasigned={
              !!productionOriginReassignments[production_order.id] ? true : false
            }
            production_changes={production_changes.orders?.[production_order.id] ?? {}}
            production_reassignments={production_reassignments.orders?.[production_order.id] ?? {}}
            getCurveActualized={getCurveActualized}
            validated={validated?.[production_order.id]}
            errors={errors?.[production_order.id]}
            opt_status={opt_status}
            processes={processes}
          />
        ))
      ) : (
        <TechnicalSheetWithoutOrder technical_sheet={technical_sheet} sizes={sizes} />
      )}
    </>
  )
}

export default React.memo(ManagementProductionTechnicalSheetRow)
