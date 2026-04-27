import { useEffect } from 'react'
import { CCard, CTable, CRow, CCol, CButton, CForm, CFormLabel, CFormInput } from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import { ArrowLeftCircle, TextInitial, FileText } from 'lucide-react'
import no_data from '../../../assets/images/no-data.png'
import { Toast } from '@/components/Toast'
import LoadingForm from '@/components/LoadingForm'

const Show = ({ subcategory, loading, onChangeView, errors }) => {
  useEffect(() => {
    if (Object.keys(errors).length !== 0) {
      Toast.fire({
        icon: 'error',
        title: errors.message,
      })
    }
  }, [errors])

  if (!subcategory) {
    return (
      <LoadingForm
        title="Cargando información"
        subtitle="Un momento mientras se carga la información..."
        height="400px"
      />
    )
  }

  return (
    <div className="animate-fade-in">
      <CCard className="mb-4 p-3 shadow-sm border-0">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
            <span className="fw-bold fs-5 font-montserrat">Detalles de la Subcategoría</span>
          </div>
          <CButton
            className="d-flex align-items-center gap-2 font-poppins btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Categorías', user: null })
            }}
          >
            <ArrowLeftCircle size={16} /> Volver
          </CButton>
        </div>
        <CRow>
          <CCol md={12}>
            <CForm className="row g-3 needs-validation p-4">
              <CCol md={5}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <TextInitial size={15} />
                  Nombre
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={subcategory?.name || ''}
                  disabled
                  className="font-montserrat"
                />
              </CCol>
              <CCol md={7}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <TextInitial size={15} />
                  Descripción
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="description"
                  value={subcategory?.description || ''}
                  disabled
                  className="font-montserrat"
                />
              </CCol>
            </CForm>
          </CCol>
          <CCol md={12} className="mb-4">
            <CCard className="h-100 p-4 shadow-sm border-0">
              <h6 className="mb-3 fw-bold d-flex align-items-center gap-2 font-poppins">
                Categorías
              </h6>
              <div className="mb-4">
                <CTable hover responsive align="middle" className="small border">
                  <thead className="table-light font-poppins">
                    <tr>
                      <th style={{ width: '25%' }}>Nombre</th>
                      <th style={{ width: '70%' }}>Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="font-inter">
                    {loading ? (
                      <tr>
                        <td colSpan={2} className="py-5 border-0">
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
                    ) : Array.isArray(subcategory?.categories) &&
                      subcategory?.categories.length > 0 ? (
                      subcategory?.categories.map((category) => (
                        <tr key={category.id} className="font-inter">
                          <td className="text-primary">{category.name}</td>
                          <td className="text-muted">{category.description}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="text-center align-middle p-5">
                          <div className="d-flex flex-column align-items-center justify-content-center">
                            <img
                              src={no_data}
                              className="img-fluid mb-2"
                              style={{ maxHeight: '120px' }}
                            />
                            <span>No hay datos para mostrar</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </CTable>
              </div>
            </CCard>
          </CCol>
        </CRow>
      </CCard>
    </div>
  )
}

export default Show
