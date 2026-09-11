import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import ProductionOrdersService from '../../services/production_orders.service'
import ProcessesService from '../../services/processes.service'
import Show from './productionSchedule/Show'

const ProductionSchedules = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'Cronograma de Produccion' })
  const [data, setData] = useState()
  const [errors, setErrors] = useState(null)
  const [processes, setProcesses] = useState()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (processes) return
    fetchProcesses({ in_production_order: true })
  }, [processes])

  const fetchProductionOrders = async (technical_sheet_id = null, params) => {
    try {
      setLoading(true)
      setErrors(null)
      const response = await ProductionOrdersService.all(technical_sheet_id, params)
      setData(response.data.production_orders)
    } catch (error) {
      setErrors(error?.errors || error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProcesses = async (params) => {
    try {
      const response = await ProcessesService.all(params)
      setProcesses(
        Array.isArray(response.data.processes)
          ? response.data.processes.map((type) => ({
              label: type.name,
              value: type.id,
              id: type.id,
              name: type.name,
            }))
          : [],
      )
    } catch (error) {
      setErrors(error?.error || error)
    }
  }

  const renderView = () => {
    switch (view.name) {
      default:
        return (
          <Show
            data={data}
            loading={loading}
            fetchProductionOrders={fetchProductionOrders}
            processes={processes}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default ProductionSchedules
