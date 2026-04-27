import { useState } from 'react'
import {
  CCard,
  CTable,
  CFormInput,
  CPagination,
  CPaginationItem,
  CFormSelect,
  CRow,
  CCol,
  CTooltip,
  CButton,
} from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import { useEffect } from 'react'
import {
  Pencil,
  Trash2,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  CirclePlus,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
  ArrowUpToLine,
  X,
} from 'lucide-react'
import { FaRegFilePdf } from 'react-icons/fa6'
import { RiFileExcel2Line } from 'react-icons/ri'
import no_data from '../../../assets/images/no-data.png'
import Swal from 'sweetalert2'
import { Toast } from '@/components/Toast'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export const List = ({
  data,
  loading,
  fetchPeople,
  onChangeView,
  deletePerson,
  restore,
  errors,
  generatePDF,
  generateExcel,
  importExcel,
}) => {
  const user_active = useSelector((state) => state.user)
  const [showInput, setShowInput] = useState(false)
  const [file, setFile] = useState(null)
  const [params, setParams] = useState({
    search: '',
    per_page: 10,
    page: 1,
    column: 'id',
    dir: 'asc',
    with_trashed: true,
  })
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      const currentParams = { ...params, search: searchInput }
      fetchPeople(currentParams)
    }, 500)

    return () => clearTimeout(handler)
  }, [params.page, params.per_page, params.column, params.dir, params.search])

  useEffect(() => {
    const handler = setTimeout(() => {
      setParams((prev) => ({
        ...prev,
        search: searchInput,
        page: 1,
      }))
    }, 500)

    return () => clearTimeout(handler)
  }, [searchInput])

  useEffect(() => {
    if (Object.keys(errors).length !== 0) {
      Toast.fire({
        icon: 'error',
        title: errors.message,
      })
    }
  }, [errors])

  const handleConfirmDelete = (person) => {
    Swal.fire({
      title:
        '<span class="font-montserrat fw-bold" style="color: #1f2937;">Desactivar Usuario</span>',
      html: `
      <div class="font-inter" style="font-size: 15px; color: #4b5563; line-height: 1.6;">
        Estás a punto de desactivar a <strong>${person.names} ${person.last_names}</strong>.<br/>
        Esta persona ya no podrá acceder al sistema.
        <div className="mt-2" style="font-weight: 600; color: #111827;">¿Deseas continuar?</div>
      </div>`,
      icon: 'warning',
      iconColor: '#f0dc2b',
      showCancelButton: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn btn-danger px-4 py-2 mx-2 shadow-sm fw-bold font-poppins text-white',
        cancelButton: 'btn btn-light px-4 py-2 mx-2 shadow-sm fw-bold font-poppins',
        popup: 'rounded-4 border-0 shadow-lg',
      },
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true,
      backdrop: `rgba(0,0,10,0.4)`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deletePerson(person.id)
          fetchPeople(params)
          Toast.fire({
            icon: 'success',
            title: 'Persona desactivada con exito',
          })
        } catch (error) {
          console.error(error)
        }
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Acción cancelada',
        })
      }
    })
  }

  const handleConfirmRestore = (person) => {
    Swal.fire({
      title: '<span class="font-montserrat fw-bold" style="color: #1f2937;">Activar Usuario</span>',
      html: `
      <div class="font-inter" style="font-size: 15px; color: #4b5563; line-height: 1.6;">
        Estás a punto de activar a <strong>${person.names} ${person.last_names}</strong>.<br/>
        Esta persona volvera a acceder al sistema.
        <div className="mt-2" style="font-weight: 600; color: #111827;">¿Deseas continuar?</div>
      </div>`,
      icon: 'warning',
      iconColor: '#f0dc2b',
      showCancelButton: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn btn-success px-4 py-2 mx-2 shadow-sm fw-bold font-poppins text-white',
        cancelButton: 'btn btn-light px-4 py-2 mx-2 shadow-sm fw-bold font-poppins',
        popup: 'rounded-4 border-0 shadow-lg',
      },
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true,
      backdrop: `rgba(0,0,10,0.4)`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await restore(person.id)
          fetchPeople(params)
          Toast.fire({
            icon: 'success',
            title: 'Persona activada con exito',
          })
        } catch (error) {
          console.error(error)
        }
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Acción cancelada',
        })
      }
    })
  }

  const formattedData = data?.people?.map((person) => ({
    ...person,
    photo: (
      <div className="d-flex justify-content-center align-items-center">
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #f0f0f0',
            backgroundColor: '#f8f9fa',
          }}
        >
          {person.photo ? (
            <img
              src={person.photo.path}
              alt="profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              <small className="fw-bold">{person.names?.charAt(0)}</small>
            </div>
          )}
        </div>
      </div>
    ),
    name: `${person.names || ''} ${person.last_names || ''}`,
    gender: person.gender?.description || 'No Aplica',
    blood_type: person.blood_type ? person.blood_type?.name : 'No Aplica',
    birth_date: dayjs.utc(person.birth_date).format('DD/MM/YYYY'),
    acciones: (
      <div className="d-flex gap-2 justify-content-center">
        <CTooltip content="Editar" placement="top">
          <button
            className="action-btn edit-btn"
            disabled={
              !!person.deleted_at ||
              !user_active?.permissions.some((p) => p.name === 'people.find') ||
              !user_active?.permissions.some((p) => p.name === 'people.update')
            }
            onClick={() => onChangeView({ name: 'edit', title: 'Editar Persona', person: person })}
          >
            <Pencil size={18} strokeWidth={1.5} />
          </button>
        </CTooltip>
        {person.deleted_at === null ? (
          <CTooltip content="Desactivar" placement="top">
            <button
              className="action-btn delete-btn"
              disabled={!user_active?.permissions.some((p) => p.name === 'people.delete')}
              onClick={() => handleConfirmDelete(person)}
            >
              <Trash2 size={18} strokeWidth={1.5} />
            </button>
          </CTooltip>
        ) : (
          <CTooltip content="Activar" placement="top">
            <button
              className="action-btn restore-btn"
              disabled={!user_active?.permissions.some((p) => p.name === 'people.restore')}
              onClick={() => handleConfirmRestore(person)}
            >
              <RotateCcw size={18} strokeWidth={1.5} />
            </button>
          </CTooltip>
        )}
      </div>
    ),
  }))

  const handleSort = (column) => {
    setParams((prev) => ({
      ...prev,
      column: column,
      dir: prev.column === column && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  const columns = [
    {
      key: 'photo',
      label: <div className="text-center">Foto</div>,
    },
    {
      key: 'document',
      label: (
        <div className="sortable-header text-center" onClick={() => handleSort('document')}>
          Documento{' '}
          {params.column === 'document' &&
            (params.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      ),
    },
    {
      key: 'name',
      label: (
        <div className="sortable-header text-center" onClick={() => handleSort('names')}>
          Nombres{' '}
          {params.column === 'names' &&
            (params.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      ),
    },
    {
      key: 'birth_date',
      label: (
        <div className="sortable-header text-center" onClick={() => handleSort('birth_date')}>
          F. Nacimiento{' '}
          {params.column === 'birth_date' &&
            (params.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      ),
    },
    {
      key: 'phone',
      label: (
        <div className="sortable-header text-center" onClick={() => handleSort('phone')}>
          Telefono{' '}
          {params.column === 'phone' &&
            (params.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
        </div>
      ),
    },
    {
      key: 'gender',
      label: <div className="sortable-header text-center">Género</div>,
    },
    {
      key: 'blood_type',
      label: <div className="sortable-header text-center">T. Sangre</div>,
    },
    {
      key: 'acciones',
      label: <div className="sortable-header text-center">Aciones </div>,
    },
  ]

  const totalPages = data?.meta?.pagination?.total_pages || 1
  const currentPage = params.page

  const getPages = () => {
    const pages = []
    const maxVisible = 5

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = start + maxVisible - 1

    if (end > totalPages) {
      end = totalPages
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return { pages, start, end }
  }

  const { pages, start, end } = getPages()

  return (
    <CCard className="mb-4 p-4 shadow-sm border-0 animate-fade-in">
      <div className="d-flex align-items-center mb-3">
        <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
        <span className="fw-bold fs-5 font-montserrat">Personas</span>
      </div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4">
        <div className="w-25 ms-4">
          <CFormInput
            className="custom-input font-inter"
            placeholder="Buscar persona..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <CButton
            className="d-flex align-items-center justify-content-center btn-primary-revolve"
            onClick={() => generateExcel()}
          >
            <RiFileExcel2Line />
          </CButton>
          <CButton
            className="d-flex align-items-center justify-content-center btn-primary-download"
            onClick={() => generatePDF()}
          >
            <FaRegFilePdf />
          </CButton>
          {!showInput ? (
            <CButton
              className="d-flex align-items-center gap-2 btn-primary-upload"
              onClick={() => setShowInput(true)}
            >
              <ArrowUpToLine size={16} />
              <span className="d-none d-md-inline font-poppins">Cargar Datos</span>
            </CButton>
          ) : (
            <div className="d-flex align-items-center gap-2 flex-wrap" style={{ width: '510px' }}>
              <input
                type="file"
                accept=".xlsx,.xls"
                className="form-control"
                style={{ maxWidth: '400px' }}
                onChange={(e) => setFile(e.target.files[0])}
              />
              <CButton
                className="d-flex py-2 align-items-center justify-content-center btn-primary-upload"
                onClick={() => importExcel(file)}
              >
                <Upload size={18} />
              </CButton>
              <CButton
                className="d-flex py-2 align-items-center justify-content-center btn-primary-close"
                onClick={() => setShowInput(false)}
              >
                <X size={18} />
              </CButton>
            </div>
          )}
          <CButton
            variant="outline"
            className="font-poppins btn-primary-dark d-flex align-items-center gap-2"
            disabled={!user_active?.permissions.some((p) => p.name === 'people.store')}
            style={{
              cursor: !user_active?.permissions.some((p) => p.name === 'people.store')
                ? 'not-allowed'
                : 'pointer',
            }}
            onClick={() => onChangeView({ name: 'create', title: 'Crear Persona' })}
          >
            <CirclePlus />
            <span className="d-none d-md-inline">Agregar Persona</span>
          </CButton>
        </div>
      </div>
      <CTable hover responsive align="middle" className="text-center font-inter">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-5 border-0">
                <div className="d-flex flex-column align-items-center justify-content-center">
                  <div className="data-loader-container mb-3">
                    <div className="radar-circle"></div>
                    <div className="radar-scanner"></div>
                    <FileText size={30} className="text-primary radar-icon" />
                  </div>
                  <div className="loader-text-wrapper">
                    <span className="loader-text">Cargando Datos...</span>
                  </div>
                  <div className="loader-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </td>
            </tr>
          ) : formattedData?.length > 0 ? (
            formattedData.map((item, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col.key}>{item[col.key]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-muted p-4">
                <img src={no_data} className="img-fluid" style={{ maxHeight: '120px' }} />
                <br />
                No hay datos para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </CTable>

      <CRow className="align-items-center">
        <CCol xs={12} md={4}>
          <div className="d-flex align-items-center gap-2 text-muted small font-poppins">
            Ver
            <CFormSelect
              size="sm"
              style={{ width: '70px' }}
              value={params.per_page}
              onChange={(e) => setParams({ ...params, per_page: e.target.value, page: 1 })}
            >
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </CFormSelect>
            registros por página
          </div>
        </CCol>

        <CCol xs={12} md={8} className="d-flex justify-content-md-end mt-2 mt-md-0 font-poppins">
          <CPagination size="sm" aria-label="Navegación de páginas">
            <CPaginationItem
              disabled={currentPage === 1}
              onClick={() => setParams((prev) => ({ ...prev, page: 1 }))}
            >
              <ChevronsLeft size={14} />
            </CPaginationItem>
            <CPaginationItem
              disabled={currentPage === 1}
              onClick={() => setParams((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              <ChevronLeft size={14} />
            </CPaginationItem>
            {start > 1 && <CPaginationItem disabled>...</CPaginationItem>}
            {pages.map((p) => (
              <CPaginationItem
                key={p}
                active={p === currentPage}
                onClick={() => setParams((prev) => ({ ...prev, page: p }))}
                style={{ cursor: 'pointer' }}
              >
                {p}
              </CPaginationItem>
            ))}
            {end < totalPages && <CPaginationItem disabled>...</CPaginationItem>}
            <CPaginationItem
              disabled={currentPage === totalPages}
              onClick={() => setParams((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              <ChevronRight size={14} />
            </CPaginationItem>
            <CPaginationItem
              disabled={currentPage === totalPages}
              onClick={() => setParams((prev) => ({ ...prev, page: totalPages }))}
            >
              <ChevronsRight size={14} />
            </CPaginationItem>
          </CPagination>
        </CCol>
      </CRow>
    </CCard>
  )
}

export default List
