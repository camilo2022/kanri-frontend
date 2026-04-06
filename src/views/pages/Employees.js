import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import EmployeesService from '../../services/employees.service'
import PeopleService from '../../services/people.service'
import PositionsService from '../../services/positions.service'
import RiskManagersService from '../../services/risk_managers.service'
import HealthEntitiesService from '../../services/health_entities.service'
import PensionFundsService from '../../services/pension_funds.service'
import CompensationFundsService from '../../services/compensation_funds.service'
import AreasService from '../../services/areas.service'
import RolesService from '../../services/roles.service'
import List from './employees/List'
import Create from './employees/Create'
import Edit from './employees/Edit'
import Show from './employees/Show'

const Employees = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Empleados' })
  const [data, setData] = useState({})
  const [people, setPeople] = useState({})
  const [positions, setPositions] = useState({})
  const [riskManagers, setRiskManagers] = useState({})
  const [healtEntities, setHealthEntities] = useState({})
  const [pensiondFunds, setPensionFunds] = useState({})
  const [compensationFunds, setCompensationFunds] = useState({})
  const [areas, setAreas] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [employee, setEmployee] = useState()
  const [role, setRole] = useState()
  const [permissions, setPermissions] = useState()

  useEffect(() => {
    if (view.name === 'show' && view.employee?.id) {
      findEmployee(view.employee.id)
      findRole(view.employee.user?.roles[0].id)
    }
    if (view.name === 'edit' && view.employee?.id) {
      findEmployee(view.employee.id)
      allPeople()
      allPositions()
      allRiskManagers()
      allHealthEntities()
      allPensiondFunds()
      allCompensationFunds()
      allAreas()
    }
    if (view.name === 'create') {
      allPeople({ with_employee: false })
      allRiskManagers()
      allHealthEntities()
      allPensiondFunds()
      allCompensationFunds()
      allAreas()
    }
    setEmployee('')
    setLoading(true)
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Empleados' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    setView(newView)
    dispatch({ type: 'set', action: newView.title })
  }

  const fetchEmployees = async (params) => {
    try {
      const response = await EmployeesService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createEmployee = async (data) => {
    try {
      const response = await EmployeesService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const allPeople = async (params) => {
    try {
      const response = await PeopleService.all(params)
      setPeople(response.data.people)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const allPositions = async (area_id, params) => {
    try {
      const response = await PositionsService.all(area_id, params)
      setPositions(response.data.positions)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const allRiskManagers = async (params) => {
    try {
      const response = await RiskManagersService.all(params)
      setRiskManagers(response.data.riskManagerss)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const allHealthEntities = async (params) => {
    try {
      const response = await HealthEntitiesService.all(params)
      setHealthEntities(response.data.health_entities)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const allPensiondFunds = async (params) => {
    try {
      const response = await PensionFundsService.all(params)
      setPensionFunds(response.data.pension_funds)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const allCompensationFunds = async (params) => {
    try {
      const response = await CompensationFundsService.all(params)
      setCompensationFunds(response.data.compensation_funds)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const allAreas = async (params) => {
    try {
      const response = await AreasService.all(params)
      setAreas(response.data.areas)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const editEmployee = async (id, data) => {
    try {
      const response = await EmployeesService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findEmployee = async (id) => {
    try {
      const response = await EmployeesService.find(id)
      setEmployee(response.data.employee)
      return response
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteEmployee = async (id) => {
    try {
      const response = await EmployeesService.delete_employee(id)
      return response
    } catch (error) {
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await EmployeesService.restore(id)
      return response
    } catch (error) {
      throw error
    }
  }

  const findRole = async (id) => {
    try {
      const response = await RolesService.find(id)
      setRole(response.data.role)
      setPermissions(response.data.role.permissions)
      return response
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return (
          <Create
            onChangeView={changeView}
            onSubmit={createEmployee}
            allPositions={allPositions}
            errors={errors}
            people={people}
            positions={positions}
            risk_managers={riskManagers}
            healt_entities={healtEntities}
            pension_funds={pensiondFunds}
            compensation_funds={compensationFunds}
            areas={areas}
          />
        )

      case 'edit':
        return (
          <Edit
            employee={employee}
            onChangeView={changeView}
            onSubmit={editEmployee}
            allPositions={allPositions}
            errors={errors}
            people={people}
            positions={positions}
            risk_managers={riskManagers}
            healt_entities={healtEntities}
            pension_funds={pensiondFunds}
            compensation_funds={compensationFunds}
            areas={areas}
            loading={loading}
          />
        )

      case 'show':
        return (
          <Show
            employee={employee}
            role={role}
            findRole={findRole}
            permissions={permissions}
            onChangeView={changeView}
            loading={loading}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchEmployees={fetchEmployees}
            onChangeView={changeView}
            deleteEmployee={deleteEmployee}
            restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Employees
