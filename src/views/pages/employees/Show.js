import { CRow, CCol, CCard, CCardBody, CButton, CTable, CBadge, CForm } from '@coreui/react'
import {
  User,
  IdCard,
  Mail,
  Briefcase,
  Droplets,
  Building,
  ArrowRightCircle,
  FileText,
  MapPinHouse,
  MapPinned,
  CalendarFold,
  VenusAndMars,
  Phone,
  ShieldCheck,
  Lock,
  Fingerprint,
  Info,
  Settings,
  ArrowLeftCircle,
  UserRound,
  Save,
  BadgeCheck,
  BadgeAlert,
  Factory,
  Hospital,
  BanknoteArrowDown,
  CalendarRange,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { IoMdArrowDropright } from 'react-icons/io'

const Show = ({ employee, role, permissions, onChangeView }) => {
  console.log(employee)
  const [loadingPermissions, setLoadingPermissions] = useState(false)

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
    <div className="fade-in">
      <CCard className="mb-4 p-4 shadow-sm border-0">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <IoMdArrowDropright style={{ color: '#C21111' }} size={35} />
            <span className="fw-bold fs-5 font-montserrat">Información del Empleado</span>
          </div>
          <CButton
            className="d-flex align-items-center gap-2 font-poppins btn-primary-revolve me-2"
            onClick={() => {
              onChangeView({ name: 'list', title: 'Listar Usuarios', user: null })
            }}
          >
            <ArrowLeftCircle size={16} /> Volver
          </CButton>
        </div>
        <div className="fade-in font-inter p-3" style={{ background: '#f8fafc' }}>
          <CRow>
            <CCol md={4} className="mb-4">
              <CCard className="p-3 shadow-sm border-0 bg-white">
                <CCardBody className="text-center">
                  <div className="d-flex flex-column align-items-center mt-2">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center shadow-inner mb-3"
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 100%)',
                        border: '4px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    >
                      {employee.person?.photo ? (
                        <img
                          src={employee.person.photo.path}
                          alt="profile"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <span
                          className="fw-bold text-white font-montserrat"
                          style={{ fontSize: '3rem' }}
                        >
                          {getInitials(employee.person?.names)}
                        </span>
                      )}
                    </div>
                  </div>

                  <h5 className="fw-bold font-montserrat text-dark mb-3">
                    {employee.person?.names} {employee.person?.last_names}
                  </h5>
                  <div className="text-primary font-inter small fw-medium mb-3">
                    <Briefcase size={14} className="me-1" />{' '}
                    {employee.position?.name || 'No aplica'}
                  </div>
                  <CBadge
                    color="light"
                    className="text-muted font-inter fw-medium mb-3"
                    shape="pill"
                  >
                    <MapPinHouse size={14} className="me-1" />
                    {employee.position?.area[0].name || 'No aplica'}
                  </CBadge>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol md={8} className="mb-4">
              <CCard className="h-100 p-4 shadow-sm border-0 bg-white">
                <CCardBody>
                  <div
                    className="position-relative p-3 border rounded-3"
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
                        <CTable
                          borderless
                          small
                          className="text-start font-inter small text-muted m-0"
                        >
                          <tbody>
                            <tr className="align-items-center">
                              <td className="py-1" style={{ width: '130px' }}>
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    className="d-flex align-items-center justify-content-center"
                                    style={{ width: '20px' }}
                                  >
                                    <IdCard
                                      size={15}
                                      strokeWidth={1.5}
                                      className="text-secondary"
                                    />
                                  </div>
                                  <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                    Documento:
                                  </span>
                                </div>
                              </td>
                              <td className="py-1 text-dark">{employee.person?.document}</td>
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
                              <td className="py-1 text-dark">{employee.person?.phone}</td>
                            </tr>
                            <tr className="align-items-center">
                              <td className="py-1" style={{ width: '130px' }}>
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    className="d-flex align-items-center justify-content-center"
                                    style={{ width: '20px' }}
                                  >
                                    <MapPinned
                                      size={15}
                                      strokeWidth={1.5}
                                      className="text-secondary"
                                    />
                                  </div>
                                  <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                    Dirección:
                                  </span>
                                </div>
                              </td>
                              <td className="py-1 text-dark">{employee.person?.address}</td>
                            </tr>
                          </tbody>
                        </CTable>
                      </CCol>
                      <CCol md={5} className="pe-2">
                        <CTable
                          borderless
                          small
                          className="text-start font-inter small text-muted m-0"
                        >
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
                                {employee.person?.gender?.description || 'No aplica'}
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
                              <td className="py-1 text-dark">{employee.person?.birth_date}</td>
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
                                  {employee.person?.blood_type?.name || 'No aplica'}
                                </CBadge>
                              </td>
                            </tr>
                          </tbody>
                        </CTable>
                      </CCol>
                    </CRow>
                  </div>
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
                      <Building size={15} strokeWidth={2.5} />
                      DATOS DE CONTRATACIÓN
                    </div>

                    <CCol md={12} className="pe-2">
                      <CTable
                        borderless
                        small
                        className="text-start font-inter small text-muted m-0"
                      >
                        <tbody>
                          <tr className="align-items-center">
                            <td className="py-1" style={{ width: '100px' }}>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="d-flex align-items-center justify-content-center"
                                  style={{ width: '20px' }}
                                >
                                  <Hospital
                                    size={15}
                                    strokeWidth={1.5}
                                    className="text-secondary"
                                  />
                                </div>
                                <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                  ARL:
                                </span>
                              </div>
                            </td>
                            <td className="py-1 text-dark">{employee.arl?.name || 'No aplica'}</td>
                          </tr>
                          <tr className="align-items-center">
                            <td className="py-1" style={{ width: '100px' }}>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="d-flex align-items-center justify-content-center"
                                  style={{ width: '20px' }}
                                >
                                  <Hospital
                                    size={15}
                                    strokeWidth={1.5}
                                    className="text-secondary"
                                  />
                                </div>
                                <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                  EPS:
                                </span>
                              </div>
                            </td>
                            <td className="py-1 text-dark">{employee.eps?.name || 'No aplica'}</td>
                          </tr>
                          <tr className="align-items-center">
                            <td className="py-1" style={{ width: '100px' }}>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="d-flex align-items-center justify-content-center"
                                  style={{ width: '20px' }}
                                >
                                  <BanknoteArrowDown
                                    size={15}
                                    strokeWidth={1.5}
                                    className="text-secondary"
                                  />
                                </div>
                                <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                  Fondo de Pensión:
                                </span>
                              </div>
                            </td>
                            <td className="py-1 text-dark">
                              {employee.pension_fund?.name || 'No aplica'}
                            </td>
                          </tr>
                          <tr className="align-items-center">
                            <td className="py-1" style={{ width: '100px' }}>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="d-flex align-items-center justify-content-center"
                                  style={{ width: '20px' }}
                                >
                                  <BanknoteArrowDown
                                    size={15}
                                    strokeWidth={1.5}
                                    className="text-secondary"
                                  />
                                </div>
                                <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                  Caja de Compensación:
                                </span>
                              </div>
                            </td>
                            <td className="py-1 text-dark">
                              {employee.compensation_fund?.name || 'No aplica'}
                            </td>
                          </tr>
                          <tr className="align-items-center">
                            <td className="py-1" style={{ width: '100px' }}>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="d-flex align-items-center justify-content-center"
                                  style={{ width: '20px' }}
                                >
                                  <Factory size={15} strokeWidth={1.5} className="text-secondary" />
                                </div>
                                <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                  Centro de Operación:
                                </span>
                              </div>
                            </td>
                            <td className="py-1 text-dark">
                              {employee.operation_center || 'No aplica'}
                            </td>
                          </tr>
                          <tr className="align-items-center">
                            <td className="py-1" style={{ width: '100px' }}>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="d-flex align-items-center justify-content-center"
                                  style={{ width: '20px' }}
                                >
                                  <CalendarRange
                                    size={15}
                                    strokeWidth={1.5}
                                    className="text-secondary"
                                  />
                                </div>
                                <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                  Fecha Inicio:
                                </span>
                              </div>
                            </td>
                            <td className="py-1 text-dark">
                              {dayjs(employee.start_date).format('DD/MM/YYYY')}
                            </td>
                          </tr>
                          <tr className="align-items-center">
                            <td className="py-1" style={{ width: '100px' }}>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="d-flex align-items-center justify-content-center"
                                  style={{ width: '20px' }}
                                >
                                  <CalendarRange
                                    size={15}
                                    strokeWidth={1.5}
                                    className="text-secondary"
                                  />
                                </div>
                                <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                  Fecha Fin:
                                </span>
                              </div>
                            </td>
                            <td className="py-1 text-dark">
                              {dayjs(employee.end_date).format('DD/MM/YYYY') || 'No Aplica'}
                            </td>
                          </tr>
                        </tbody>
                      </CTable>
                    </CCol>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol md={12} className="mb-2">
              <CCard className="shadow-sm border-0 bg-white p-4">
                <div
                  className="d-flex align-items-center gap-2 mb-4 fw-bold font-montserrat"
                  style={{
                    color: '#0934a8',
                  }}
                >
                  <ShieldCheck size={20} />
                  <span>Seguridad y Accesos</span>
                </div>
                <CRow>
                  <CCol md={6} className="border-end">
                    <div className="small text-muted mb-3 fw-medium d-flex align-items-center gap-1">
                      <Fingerprint size={14} /> Roles Asignados
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <CRow className="g-3">
                        {employee.roles?.map((r, index) => (
                          <CCol
                            key={r.id}
                            sm={4}
                            lg={4}
                            className="permission-card-wrapper"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div
                              key={r.id}
                              onClick={() => setRole(r)}
                              className={`h-100 p-2 border rounded-3 bg-white shadow-sm permission-card ${role?.id === r.id ? 'active' : ''}`}
                              style={{
                                cursor: 'pointer',
                              }}
                            >
                              <div className="d-flex align-items-start gap-2">
                                <div className="p-1 bg-light rounded text-primary">
                                  <ShieldCheck size={14} />
                                </div>
                                <div style={{ lineHeight: '1.2' }}>
                                  <div
                                    className="fw-bold text-dark mb-1"
                                    style={{ fontSize: '0.8rem' }}
                                  >
                                    {r?.title}
                                  </div>
                                  <div
                                    className="text-muted mb-1"
                                    style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}
                                  >
                                    {r?.name}
                                  </div>
                                  <div
                                    className="text-secondary"
                                    style={{ fontSize: '0.65rem', fontStyle: 'italic' }}
                                  >
                                    {r?.description || 'Sin descripción disponible'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CCol>
                        ))}
                      </CRow>
                    </div>
                  </CCol>

                  <CCol md={6} className="ps-4">
                    <div className="small text-muted mb-3 fw-medium d-flex align-items-center gap-1">
                      <Lock size={14} /> Detalle de Permisos para {role?.title}
                    </div>

                    <div className="permissions-container">
                      {!loadingPermissions ? (
                        <CRow className="g-3">
                          {permissions?.map((p, index) =>
                            employee?.permissions?.some((up) => up.id === p.id) ? (
                              <CCol
                                key={p.id}
                                sm={12}
                                lg={6}
                                className="permission-card-wrapper"
                                style={{ animationDelay: `${index * 50}ms` }}
                              >
                                <div className="permission-card h-100 p-2 border rounded-3 bg-white shadow-sm">
                                  <div className="d-flex align-items-start gap-2">
                                    <div className="p-1 bg-light rounded text-primary">
                                      <ShieldCheck size={14} />
                                    </div>
                                    <div style={{ lineHeight: '1.2' }}>
                                      <div
                                        className="fw-bold text-dark mb-1"
                                        style={{ fontSize: '0.8rem' }}
                                      >
                                        {p.title || formatTitle(p.name)}
                                      </div>
                                      <div
                                        className="text-muted mb-1"
                                        style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}
                                      >
                                        {p.name}
                                      </div>
                                      <div
                                        className="text-secondary"
                                        style={{ fontSize: '0.65rem', fontStyle: 'italic' }}
                                      >
                                        {p.description || 'Sin descripción disponible'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CCol>
                            ) : null,
                          )}
                        </CRow>
                      ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center py-5">
                          <div className="gears-container mb-3">
                            <Settings size={40} className="gear gear-large text-primary" />
                            <Settings size={24} className="gear gear-small text-secondary" />
                          </div>
                          <span className="text-muted font-montserrat fw-bold small ls-1">
                            SINCRONIZANDO PERMISOS...
                          </span>
                        </div>
                      )}
                    </div>
                  </CCol>
                </CRow>
              </CCard>
            </CCol>
          </CRow>
        </div>
      </CCard>
    </div>
  )
}

export default Show
