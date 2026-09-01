import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import SuppliersService from '../../services/suppliers.service'
import SupplierTypesService from '../../services/supplier_types.service'
import GenderService from '../../services/gender.service'
import BloodTypeService from '../../services/blood_types.service'
import PersonTypeService from '../../services/person_types.service'
import DocumentTypeService from '../../services/document_types.service'
import BanksService from '../../services/banks.service'
import AccountTypesService from '../../services/account_types.service'
import List from './supplierTypes/suppliers/List'
import Create from './supplierTypes/suppliers/Create'
import Edit from './supplierTypes/suppliers/Edit'
import SupplierTypes from './SupplierTypes'

const Suppliers = ({ supplier_type_id }) => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Proveedores' })
  const [data, setData] = useState({})
  const [supplier, setSupplier] = useState({})
  const [supplierType, setSupplierType] = useState(null)
  const [genders, setGenders] = useState({})
  const [bloodTypes, setBloodTypes] = useState({})
  const [personTypes, setPersonTypes] = useState({})
  const [documentTypes, setDocumentTypes] = useState()
  const [banks, setBanks] = useState({})
  const [accountTypes, setAccountTypes] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const loadData = async () => {
      if (!supplier_type_id) return

      setLoading(true)
      setSupplier('')

      const supplierTypeAux = await findSupplierType(supplier_type_id)
      console.log(supplierTypeAux)

      if (view.name === 'edit' && view.supplier?.id) {
        await findSupplier(view.supplier.id)
      }

      if (supplierTypeAux.data.supplier_type.settings?.has_person) {
        allGender()
        allBloodType()
        allPersonType()
      }

      if (supplierTypeAux.data.supplier_type.settings?.has_account_bank) {
        allBanks()
        allAccountTypes()
      }

      if (view.name === 'list') {
        dispatch({ type: 'set', action: 'Listar Proveedores' })
      }
    }

    loadData()
  }, [view, supplier_type_id])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const findSupplierType = async (id) => {
    try {
      const response = await SupplierTypesService.find(id)
      setSupplierType(response.data.supplier_type)
      return response
    } catch (error) {
      throw error
    }
  }

  const fetchSuppliers = async (supplier_type, params) => {
    try {
      const response = await SuppliersService.all(supplier_type, params)
      console.log(response)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createSupplier = async (data) => {
    try {
      const response = await SuppliersService.store(data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const editSupplier = async (id, data) => {
    try {
      const response = await SuppliersService.update(id, data)
      setErrors({})
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const findSupplier = async (id) => {
    try {
      const response = await SuppliersService.find(id)
      setSupplier(response.data.supplier)
      return response
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteSupplier = async (id) => {
    try {
      const response = await SuppliersService.destroy(id)
      return response
    } catch (error) {
      setErrors(error.error)
      throw error
    }
  }

  const restore = async (id) => {
    try {
      const response = await SuppliersService.restore(id)
      return response
    } catch (error) {
      setErrors(error.errors)
      throw error
    }
  }

  const allGender = async (params) => {
    try {
      const response = await GenderService.all(params)
      setGenders(response.data.genders)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const allBloodType = async (params) => {
    try {
      const response = await BloodTypeService.all(params)
      setBloodTypes(response.data.blood_types)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const allPersonType = async (params) => {
    try {
      const response = await PersonTypeService.all(params)
      setPersonTypes(response.data.person_types)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const fecthDocumentTypes = async (person_type_id, params) => {
    try {
      const response = await DocumentTypeService.all(person_type_id, params)
      setDocumentTypes(response.data.document_types)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const allBanks = async (params) => {
    try {
      const response = await BanksService.all(params)
      setBanks(response.data.banks)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  const allAccountTypes = async (params) => {
    try {
      const response = await AccountTypesService.all(params)
      console.log(response)
      setAccountTypes(response.data.account_types)
    } catch (error) {
      setErrors(error.error)
    } finally {
      setLoading(false)
    }
  }

  console.log(accountTypes)

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return (
          <Create
            supplier_type={supplierType}
            onChangeView={changeView}
            onSubmit={createSupplier}
            errors={errors}
            genders={genders}
            blood_types={bloodTypes}
            person_types={personTypes}
            banks={banks}
            account_types={accountTypes}
            fecthDocumentTypes={fecthDocumentTypes}
            document_types={documentTypes}
          />
        )

      case 'edit':
        return (
          <Edit
            supplier_type={supplierType}
            supplier={supplier}
            onChangeView={changeView}
            onSubmit={editSupplier}
            errors={errors}
            genders={genders}
            blood_types={bloodTypes}
            person_types={personTypes}
            banks={banks}
            account_types={accountTypes}
            fecthDocumentTypes={fecthDocumentTypes}
            document_types={documentTypes}
          />
        )
      case 'back':
        return <SupplierTypes />

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchSuppliers={fetchSuppliers}
            onChangeView={changeView}
            deleteSupplier={deleteSupplier}
            restore={restore}
            errors={errors}
            supplier_type={supplierType}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Suppliers
