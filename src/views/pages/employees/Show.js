import { CRow, CCol, CCard, CCardBody, CButton, CTable, CBadge } from '@coreui/react'
import {
  User,
  IdCard,
  Mail,
  Briefcase,
  Building,
  MapPinHouse,
  MapPinned,
  CalendarFold,
  VenusAndMars,
  Phone,
  ShieldCheck,
  Lock,
  Fingerprint,
  Settings,
  ArrowLeftCircle,
  Hospital,
  BanknoteArrowDown,
  CalendarRange,
  Info,
} from 'lucide-react'
import dayjs from 'dayjs'
import { useState } from 'react'
import { IoMdArrowDropright } from 'react-icons/io'

const Show = ({ employee, role, findRole, permissions, onChangeView }) => {
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
    <div className="animate-fade-in">
      {!employee ? (
        <CCard
          className="mb-4 p-4 shadow-sm border-0 d-flex justify-content-center align-items-center"
          style={{ minHeight: '500px' }}
        >
          <div className="text-center">
            <div className="gears-loader mb-3">
              <div className="gears-container mb-3">
                <Settings size={40} className="gear gear-large text-primary" />
                <Settings size={24} className="gear gear-small text-secondary" />
              </div>
            </div>
            <h5 className="fw-bold font-montserrat text-secondary">
              Cargando información del usuario
            </h5>
            <p className="text-muted font-inter small">Estamos cargando la información...</p>
          </div>
        </CCard>
      ) : (
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
              <CCol md={4} className="mb-4 d-flex">
                <CCard className="p-3 shadow-sm border-0 bg-white w-100">
                  <CCardBody className="text-center d-flex flex-column justify-content-center">
                    <div className="d-flex flex-column align-items-center mb-4">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                        style={{
                          width: '140px',
                          height: '140px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          background: 'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 100%)',
                          border: '5px solid white',
                          boxShadow: '0 6px 15px rgba(0,0,0,0.08)',
                        }}
                      >
                        {employee.person?.photo ? (
                          <img
                            src={employee.person.photo.path}
                            alt="profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span
                            className="fw-bold text-white font-montserrat"
                            style={{ fontSize: '3.5rem' }}
                          >
                            {getInitials(employee.person?.names)}
                          </span>
                        )}
                      </div>
                    </div>
                    <h4 className="fw-extrabold font-montserrat text-dark mb-3">
                      {employee.person?.names} <br />
                      {employee.person?.last_names}
                    </h4>
                    <div className="mb-3">
                      <small
                        className="text-uppercase text-muted fw-bold font-inter"
                        style={{ fontSize: '0.65rem', letterSpacing: '1px' }}
                      >
                        Área
                      </small>
                      <div className="mt-2">
                        <CBadge
                          color="light"
                          className="text-dark font-inter py-2 px-3 border"
                          shape="pill"
                          style={{ fontSize: '0.85rem', backgroundColor: '#f8fafc' }}
                        >
                          <MapPinHouse size={14} className="me-2 text-primary" />
                          {employee.position?.area[0]?.name || 'No aplica'}
                        </CBadge>
                      </div>
                    </div>
                    <div>
                      <small
                        className="text-uppercase text-muted fw-bold font-inter"
                        style={{ fontSize: '0.65rem', letterSpacing: '1px' }}
                      >
                        Cargo Ocupado
                      </small>
                      <div className="text-primary font-montserrat fw-bold fs-5 mt-1">
                        <Briefcase size={18} className="me-2" />
                        {employee.position?.name || 'No aplica'}
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol md={8} className="mb-4">
                <CCard className="p-4 shadow-sm border-0 bg-white">
                  <CCardBody>
                    <div
                      className="position-relative p-3 border rounded-3 mb-5 mt-3"
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

                      <CRow className="gx-3">
                        <CCol xs={12} sm={12} md={12} lg={12} xl={3}>
                          <CTable
                            borderless
                            small
                            className="text-start font-inter small text-muted m-0"
                          >
                            <tbody>
                              <tr className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
                                <td className="py-1 w-100 w-md-auto" style={{ width: '130px' }}>
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
                                <td className="py-1 text-dark w-100">
                                  {employee.person?.document}
                                </td>
                              </tr>
                              <tr className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
                                <td className="py-1 w-100 w-md-auto" style={{ width: '130px' }}>
                                  <div className="d-flex align-items-center gap-2">
                                    <div
                                      className="d-flex align-items-center justify-content-center"
                                      style={{ width: '20px' }}
                                    >
                                      <Phone
                                        size={15}
                                        strokeWidth={1.5}
                                        className="text-secondary"
                                      />
                                    </div>
                                    <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                                      Telefono:
                                    </span>
                                  </div>
                                </td>
                                <td className="py-1 text-dark w-100">{employee.person?.phone}</td>
                              </tr>
                            </tbody>
                          </CTable>
                        </CCol>
                        <CCol xs={12} sm={12} md={12} lg={12} xl={3} className="ps-xl-4">
                          <CTable
                            borderless
                            small
                            className="text-start font-inter small text-muted m-0"
                          >
                            <tbody>
                              <tr className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
                                <td className="py-1 w-md-auto" style={{ width: '105px' }}>
                                  <div className="d-flex align-items-center gap-2">
                                    <div
                                      className="d-flex align-items-center justify-content-center"
                                      style={{ width: '20px' }}
                                    >
                                      <Mail
                                        size={15}
                                        strokeWidth={1.5}
                                        className="text-secondary"
                                      />
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
                              <tr className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
                                <td className="py-1 w-md-auto" style={{ width: '105px' }}>
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
                            </tbody>
                          </CTable>
                        </CCol>
                        <CCol xs={12} sm={12} md={12} lg={12} xl={6} className="ps-xl-5">
                          <CTable
                            borderless
                            small
                            className="text-start font-inter small text-muted m-0"
                          >
                            <tbody>
                              <tr className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
                                <td className="py-1 w-md-auto" style={{ width: '135px' }}>
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
                                      F. Nacimiento:
                                    </span>
                                  </div>
                                </td>
                                <td className="py-1 text-dark">{employee.person?.birth_date}</td>
                              </tr>
                              <tr className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
                                <td className="py-1 w-md-auto" style={{ width: '105px' }}>
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
                      </CRow>
                    </div>
                    <div
                      className="position-relative p-3 border rounded-3 mb-3"
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

                      <div className="container-fluid p-0 font-inter small">
                        <div className="row py-1 border-bottom-dashed align-items-center">
                          <div
                            className="col-12 col-sm-5 col-md-5 d-flex align-items-center gap-2 text-muted"
                            style={{
                              width: '234px',
                            }}
                          >
                            <Hospital size={15} strokeWidth={1.5} className="text-secondary" />
                            <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                              Administradora de Riesgos:
                            </span>
                          </div>
                          <div className="col-12 col-sm-7 col-md-7 text-dark">
                            {employee.risk_manager?.name || 'No aplica'}
                          </div>
                        </div>
                        <div className="row py-1 border-bottom-dashed align-items-center">
                          <div
                            className="col-12 col-sm-5 col-md-5 d-flex align-items-center gap-2 text-muted"
                            style={{
                              width: '234px',
                            }}
                          >
                            <Hospital size={15} strokeWidth={1.5} className="text-secondary" />
                            <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                              Entidad de Salud:
                            </span>
                          </div>
                          <div className="col-12 col-sm-7 col-md-7 text-dark">
                            {employee.health_entity?.name || 'No aplica'}
                          </div>
                        </div>
                        <div className="row py-1 border-bottom-dashed align-items-center">
                          <div
                            className="col-12 col-sm-5 col-md-5 d-flex align-items-center gap-2 text-muted"
                            style={{
                              width: '234px',
                            }}
                          >
                            <BanknoteArrowDown
                              size={15}
                              strokeWidth={1.5}
                              className="text-secondary"
                            />
                            <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                              Fondo Pensión:
                            </span>
                          </div>
                          <div className="col-12 col-sm-7 col-md-7 text-dark">
                            {employee.pension_fund?.name || 'No aplica'}
                          </div>
                        </div>
                        <div className="row py-1 border-bottom-dashed align-items-center">
                          <div
                            className="col-12 col-sm-5 col-md-5 d-flex align-items-center gap-2 text-muted"
                            style={{
                              width: '234px',
                            }}
                          >
                            <BanknoteArrowDown
                              size={15}
                              strokeWidth={1.5}
                              className="text-secondary"
                            />
                            <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                              Caja Compensación:
                            </span>
                          </div>
                          <div className="col-12 col-sm-7 col-md-7 text-dark">
                            {employee.compensation_fund?.name || 'No aplica'}
                          </div>
                        </div>
                        <div className="row py-1 align-items-center">
                          <div
                            className="col-12 col-sm-5 col-md-5 d-flex align-items-center gap-2 text-muted"
                            style={{
                              width: '234px',
                            }}
                          >
                            <CalendarRange size={15} strokeWidth={1.5} className="text-secondary" />
                            <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                              Fecha Inicio:
                            </span>
                          </div>
                          <div className="col-12 col-sm-7 col-md-7 text-dark">
                            {dayjs(employee.start_date).format('DD/MM/YYYY')}
                          </div>
                        </div>
                        <div className="row py-1 align-items-center">
                          <div
                            className="col-12 col-sm-5 col-md-5 d-flex align-items-center gap-2 text-muted"
                            style={{
                              width: '234px',
                            }}
                          >
                            <CalendarRange size={15} strokeWidth={1.5} className="text-secondary" />
                            <span className="fw-medium" style={{ color: '#8f8f8f' }}>
                              Fecha Fin:
                            </span>
                          </div>
                          <div className="col-12 col-sm-7 col-md-7 text-dark">
                            {employee.end_date
                              ? dayjs(employee.end_date).format('DD/MM/YYYY')
                              : 'No Aplica'}
                          </div>
                        </div>
                      </div>
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
                  {employee.user?.roles ? (
                    <CRow>
                      <CCol sm={12} md={6} className="border-end">
                        <div className="small text-muted mb-3 fw-medium d-flex align-items-center gap-1">
                          <Fingerprint size={14} /> Roles Asignados
                        </div>
                        <div className="d-flex flex-column gap-2">
                          <CRow className="g-3">
                            {employee.user?.roles?.map((r, index) => (
                              <CCol
                                key={r.id}
                                sm={12}
                                lg={6}
                                xxl={4}
                                className="permission-card-wrapper"
                                style={{ animationDelay: `${index * 50}ms` }}
                              >
                                <div
                                  key={r.id}
                                  onClick={() => findRole(r.id)}
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
                                        style={{
                                          fontSize: '0.7rem',
                                          fontFamily: 'monospace',
                                          wordBreak: 'break-all',
                                        }}
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
                      <CCol sm={12} md={6} className="ps-4">
                        <div className="small text-muted mb-3 fw-medium d-flex align-items-center gap-1">
                          <Lock size={14} /> Detalle de Permisos para {role?.title}
                        </div>

                        <div className="permissions-container">
                          {!loadingPermissions ? (
                            <CRow className="g-3">
                              {permissions?.map((p, index) =>
                                employee?.user?.permissions?.some((up) => up.id === p.id) ? (
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
                                            style={{
                                              fontSize: '0.7rem',
                                              fontFamily: 'monospace',
                                              wordBreak: 'break-all',
                                            }}
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
                  ) : (
                    <CCol md={12} className="mb-4 pt-md-4">
                      <div
                        className="p-3 rounded-3 shadow-sm font-inter"
                        style={{
                          backgroundColor: '#fff9e6',
                          borderLeft: '4px solid #ffc107',
                          fontSize: '12px',
                          marginTop: '-30px',
                        }}
                      >
                        <div
                          className="d-flex align-items-center gap-2 mb-1 fw-bold"
                          style={{ color: '#856404' }}
                        >
                          <Info size={16} />
                          <span>Sin roles registrados</span>
                        </div>
                        <p className="m-0" style={{ color: '#856404', opacity: 0.8 }}>
                          No hay roles ni permisos asociados al usuario.
                        </p>
                      </div>
                    </CCol>
                  )}
                </CCard>
              </CCol>
            </CRow>
          </div>
        </CCard>
      )}
    </div>
  )
}

export default Show
