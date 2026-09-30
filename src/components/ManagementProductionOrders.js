import React, { useCallback, useState } from 'react'
import ManagementCollectionTechnicalSheetBody from './ManegementCollectionTechnicalSheetBody'
import { thStyle, thStyleGroup } from '@/components/StyleManagementCollection'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react'
import Select from 'react-select'
import { tableSelectStyles } from '@/components/StyleManagementCollection'
import { Save } from 'lucide-react'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'
import { useDispatch } from 'react-redux'
import ManagementProductionTechnicalSheetRow from '@/components/ManagementProductionTechnicalSheetRow'

const ManagementProductionOrders = ({
  technical_sheets,
  sizes,
  fabrics,
  suppliers,
  products,
  fetchProducts,
  onCreateOrder,
  onDeleteOrder,
  onOrderChange,
  onReassignmentsChange,
  onDeleteReassignment,
  production_changes,
  production_reassignments,
  productionOriginReassignments,
  aux_trademarks,
  errors_create,
  createProduct,
  getCurveActualized,
  validated,
  errors,
  opt_status,
  builders,
  processes,
  hasReassignment,
  setHasReassignment,
  priority_checks,
  priority_levels,
  priority_rules,
}) => {
  const dispath = useDispatch()
  const [editingOrderId, setEditingOrderId] = useState(null)

  const handleEditOrder = useCallback((orderId) => {
    setEditingOrderId(orderId)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingOrderId(null)
  }, [])

  return (
    <>
      <table
        className="table align-middle mb-0 table-programation"
        style={{
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
      >
        <thead>
          <tr className="font-poppins">
            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '140px', minWidth: '140px' }}
            >
              CÓDIGO
            </th>
            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '150px', minWidth: '150px' }}
            >
              TIPO DE PRENDA
            </th>
            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '150px', minWidth: '150px' }}
            >
              TONO DE LAVADO
            </th>
            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '150px', minWidth: '150px' }}
            >
              TIPO DE BOTA
            </th>
            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '150px', minWidth: '150px' }}
            >
              OBSERVACIÓN
            </th>
            <th
              colSpan={2}
              className="text-center"
              style={{
                ...thStyleGroup,
                width: '300px',
                minWidth: '300px',
              }}
            >
              FOTOS
            </th>
            <th
              rowSpan={2}
              className="text-center"
              style={{ ...thStyle, width: '200px', minWidth: '200px' }}
            >
              TELA
            </th>
            <th
              rowSpan={2}
              className="text-center"
              style={{ ...thStyle, width: '200px', minWidth: '200px' }}
            >
              COLOR
            </th>
            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '100px', minWidth: '100px' }}
            >
              LOTE
            </th>
            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '200px', minWidth: '200px' }}
            >
              LUGAR DE PRODUCCION
            </th>
            <th
              colSpan={sizes.length + 3}
              className="text-center align-middle"
              style={{
                ...thStyleGroup,
                width: `${130 + 220 + 70 + 60 * sizes.length}px`,
                minWidth: `${130 + 220 + 70 + 60 * sizes.length}px`,
              }}
            >
              CURVA
            </th>

            <th
              colSpan={processes.length}
              className="text-center align-middle"
              style={{
                ...thStyleGroup,
                width: `${160 * processes.length}px`,
                minWidth: `${160 * processes.length}px`,
              }}
            >
              PROCESOS
            </th>

            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '160px', minWidth: '160px' }}
            >
              ESTADO
            </th>

            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '165px', minWidth: '165px' }}
            >
              PRIORIDAD
            </th>

            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{ ...thStyle, width: '150px', minWidth: '150px' }}
            >
              ACCIONES
            </th>
          </tr>
          <tr className="font-poppins">
            <th
              className="text-center"
              style={{
                ...thStyleGroup,
                minWidth: '150px',
                width: '150px',
                maxWidth: '150px',
                borderTop: '0px',
              }}
            >
              DELANTERA
            </th>
            <th
              className="text-center"
              style={{
                ...thStyleGroup,
                minWidth: '150px',
                width: '150px',
                maxWidth: '150px',
                borderTop: '0px',
              }}
            >
              TRASERA
            </th>

            <th
              className="text-center"
              style={{ ...thStyleGroup, width: '130px', minWidth: '130px' }}
            >
              DESTINO
            </th>

            <th
              className="text-center"
              style={{
                ...thStyleGroup,
                width: '170px',
                minWidth: '170px',
              }}
            >
              REFERENCIA
            </th>

            {sizes.map((size) => (
              <th key={size.id} className="text-center" style={{ ...thStyleGroup, width: '60px' }}>
                {size.name}
              </th>
            ))}

            <th className="text-center" style={{ ...thStyleGroup, width: '70px' }}>
              TOTAL
            </th>

            {processes.map((process) => (
              <th
                key={process.id}
                className="text-center"
                style={{ ...thStyleGroup, width: '160px', minWidth: '160px' }}
              >
                {process.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-inter">
          {technical_sheets.map((technical_sheet) => (
            <ManagementProductionTechnicalSheetRow
              key={technical_sheet.id}
              technical_sheet={technical_sheet}
              production_changes={production_changes[technical_sheet.id] ?? {}}
              production_reassignments={production_reassignments[technical_sheet.id] ?? {}}
              editingOrderId={editingOrderId}
              onEditOrder={handleEditOrder}
              onCancelEdit={handleCancelEdit}
              sizes={sizes}
              fabrics={fabrics}
              suppliers={suppliers}
              onCreateOrder={onCreateOrder}
              onDeleteOrder={onDeleteOrder}
              onOrderChange={onOrderChange}
              onReassignmentsChange={onReassignmentsChange}
              products={products}
              fetchProducts={fetchProducts}
              aux_trademarks={aux_trademarks}
              errors_create={errors_create}
              createProduct={createProduct}
              getCurveActualized={getCurveActualized}
              onDeleteReassignment={onDeleteReassignment}
              productionOriginReassignments={productionOriginReassignments}
              validated={validated}
              errors={errors}
              opt_status={opt_status}
              builders={builders}
              processes={processes}
              hasReassignment={hasReassignment}
              setHasReassignment={setHasReassignment}
              production_changes_all={production_changes}
              priority_checks={priority_checks}
              priority_levels={priority_levels}
              priority_rules={priority_rules}
            />
          ))}
        </tbody>
      </table>
    </>
  )
}

export default React.memo(ManagementProductionOrders)
