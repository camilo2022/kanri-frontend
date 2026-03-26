import React from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CFormLabel,
  CFormInput,
  CButton,
  CTable,
  CBadge,
  CForm,
} from '@coreui/react'
import {
  User,
  IdCard,
  Mail,
  Briefcase,
  Hospital,
  Droplets,
  Building,
  ArrowRightCircle,
  FileText,
  MapPinHouse,
  MapPinned,
  CalendarFold,
  VenusAndMars,
  Phone,
} from 'lucide-react'
import { IoMdArrowDropright } from 'react-icons/io'
import { useSelector } from 'react-redux'

const Profile = () => {
  const user = useSelector((state) => state.user)
  console.log(user)
  // Datos de ejemplo para visualizar
  const defaultUser = {
    name: 'Nathaniel Poole',
    document: '1090123456',
    email: 'n.poole@microsoft.com',
    position: 'Software Engineer Senior',
    arl: 'SURA',
    bloodType: 'A+',
    eps: 'Compensar',
    salary: '$12.000.000 COP',
    startDate: '15-May-2022',
  }

  // Usar datos reales si están disponibles, si no, usar de ejemplo
  const data = defaultUser

  // Función para generar las iniciales
  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '??'
  }

  return (
    <div className="fade-in font-inter p-3" style={{ background: '#f8fafc' }}>
      <CRow>
        <CCol md={6} className="mb-4">
          <CCard className="p-3 shadow-sm border-0 bg-white">
            <CCardBody className="text-center">
              <div className="d-flex flex-column align-items-center mt-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center shadow-inner mb-3"
                  style={{
                    width: '120px',
                    height: '120px',
                    background: 'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 100%)',
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  <span className="fw-bold text-white font-montserrat" style={{ fontSize: '3rem' }}>
                    {getInitials(user.employee.person.names)}
                  </span>
                </div>
              </div>

              <h5 className="fw-bold font-montserrat text-dark mb-3">
                {user.employee.person.names} {user.employee.person.last_names}
              </h5>
              <div className="text-primary font-inter small fw-medium mb-3">
                <Briefcase size={14} className="me-1" /> {user.employee.position.name}
              </div>
              <CBadge color="light" className="text-muted font-inter fw-medium mb-3" shape="pill">
                <MapPinHouse size={14} className="me-1" />
                {user.employee.position.area[0].name}
              </CBadge>

              <div
                className="position-relative mt-4 p-3 border rounded-3"
                style={{ borderColor: '#e2e8f0' }}
              >
                <div
                  className="position-absolute bg-white px-2 d-flex align-items-center gap-2 fw-bold font-montserrat"
                  style={{
                    top: '-10px',
                    left: '15px',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px',
                    color: '#0934a8',
                  }}
                >
                  <User size={15} strokeWidth={2.5} />
                  DATOS PERSONALES
                </div>

                <CRow className="justify-content-between">
                  <CCol md={5} className="ps-2">
                    <CTable borderless small className="text-start font-inter small text-muted m-0">
                      <tbody>
                        <tr className="align-items-center">
                          <td className="py-1" style={{ width: '130px' }}>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center"
                                style={{ width: '20px' }}
                              >
                                <IdCard size={15} strokeWidth={1.5} className="text-secondary" />
                              </div>
                              <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                Documento:
                              </span>
                            </div>
                          </td>
                          <td className="py-1 text-dark">{user.employee.person.document}</td>
                        </tr>
                        <tr className="align-items-center">
                          <td className="py-1" style={{ width: '130px' }}>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center"
                                style={{ width: '20px' }}
                              >
                                <MapPinned size={15} strokeWidth={1.5} className="text-secondary" />
                              </div>
                              <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                Dirección:
                              </span>
                            </div>
                          </td>
                          <td className="py-1 text-dark">{user.employee.person.address}</td>
                        </tr>

                        <tr className="align-items-center">
                          <td className="py-1" style={{ width: '130px' }}>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center"
                                style={{ width: '20px' }}
                              >
                                <Phone size={15} strokeWidth={1.5} className="text-secondary" />
                              </div>
                              <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                Télefono:
                              </span>
                            </div>
                          </td>
                          <td className="py-1 text-dark">{user.employee.person.phone}</td>
                        </tr>
                        <tr className="align-items-center">
                          <td className="py-1" style={{ width: '130px' }}>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center"
                                style={{ width: '20px' }}
                              >
                                <Mail size={15} strokeWidth={1.5} className="text-secondary" />
                              </div>
                              <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                Correo:
                              </span>
                            </div>
                          </td>
                          <td className="py-1 text-dark">{user.email}</td>
                        </tr>
                      </tbody>
                    </CTable>
                  </CCol>
                  <CCol md={5} className="pe-2">
                    <CTable borderless small className="text-start font-inter small text-muted m-0">
                      <tbody>
                        <tr className="align-items-center">
                          <td className="py-1" style={{ width: '100px' }}>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center"
                                style={{ width: '20px' }}
                              >
                                <VenusAndMars
                                  size={15}
                                  strokeWidth={1.5}
                                  className="text-secondary"
                                />
                              </div>
                              <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                Género:
                              </span>
                            </div>
                          </td>
                          <td className="py-1 text-dark">
                            {user.employee.person.gender.name === 'F'
                              ? 'Femenino'
                              : user.employee.person.gender.name === 'M'
                                ? 'Masculino'
                                : user.employee.person.gender.name}
                          </td>
                        </tr>
                        <tr className="align-items-center">
                          <td className="py-1" style={{ width: '100px' }}>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center"
                                style={{ width: '20px' }}
                              >
                                <CalendarFold
                                  size={15}
                                  strokeWidth={1.5}
                                  className="text-secondary"
                                />
                              </div>
                              <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                Nacimiento:
                              </span>
                            </div>
                          </td>
                          <td className="py-1 text-dark">{user.employee.person.birth_date}</td>
                        </tr>
                        <tr className="align-items-center">
                          <td className="py-1" style={{ width: '100px' }}>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center"
                                style={{ width: '20px' }}
                              >
                                <Mail size={15} strokeWidth={1.5} className="text-secondary" />
                              </div>
                              <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                T. Sangre:
                              </span>
                            </div>
                          </td>
                          <td className="py-1">
                            <CBadge color="danger" shape="pill">
                              {user.employee.person.blood_type.name}
                            </CBadge>
                          </td>
                        </tr>
                      </tbody>
                    </CTable>
                  </CCol>
                </CRow>
              </div>
              <div className="d-grid gap-2 mt-4">
                <CButton color="outline-secondary" className="font-poppins btn-sm" variant="ghost">
                  <FileText size={16} className="me-1" /> Ver Hoja de Vida
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6} className="mb-4">
          <CCard className="h-100 p-4 shadow-sm border-0 bg-white">
            <CCardBody>
              <div className="d-flex align-items-center gap-2 mb-4 text-primary fw-bold font-montserrat">
                <Building size={18} />
                <span className="fs-6">Detalles de Contratación & Salud</span>
              </div>

              <CForm className="row g-4 font-inter">
                <CCol md={6}>
                  <CCard className="bg-light p-3 border-0 rounded-3 h-100">
                    <div className="d-flex align-items-center gap-2 mb-3 text-secondary fw-bold">
                      <Droplets size={16} /> Salud
                    </div>
                    <CTable borderless small className="small m-0">
                      <tbody>
                        <tr>
                          <td className="text-muted fw-medium py-1">Tipo de Sangre:</td>
                          <td className="py-1">
                            <CBadge color="danger" shape="pill">
                              {data.bloodType}
                            </CBadge>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-medium py-1">EPS:</td>
                          <td className="py-1">{data.eps}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-medium py-1">ARL:</td>
                          <td className="py-1">{data.arl}</td>
                        </tr>
                      </tbody>
                    </CTable>
                  </CCard>
                </CCol>

                {/* --- SECCIÓN 2: CONTRATO --- */}
                <CCol md={6}>
                  <CCard className="bg-light p-3 border-0 rounded-3 h-100">
                    <div className="d-flex align-items-center gap-2 mb-3 text-secondary fw-bold">
                      <FileText size={16} /> Contrato
                    </div>
                    <CTable borderless small className="small m-0">
                      <tbody>
                        <tr>
                          <td className="text-muted fw-medium py-1">Cargo Actual:</td>
                          <td className="py-1 fw-medium text-dark text-break">{data.position}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-medium py-1">Fecha de Inicio:</td>
                          <td className="py-1">{data.startDate}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-medium py-1">Salario Mensual:</td>
                          <td className="py-1 fw-bold text-success">{data.salary}</td>
                        </tr>
                      </tbody>
                    </CTable>
                  </CCard>
                </CCol>

                {/* Botón de Acción Principal (Estilo similar a tu imagen) */}
                <div className="d-flex justify-content-end mt-5 pt-3 border-top">
                  <CButton
                    className="d-flex align-items-center gap-2 font-poppins btn-primary-add px-4"
                    onClick={() => console.log('Actualizar perfil')}
                  >
                    Actualizar Perfil <ArrowRightCircle size={18} />
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Profile
