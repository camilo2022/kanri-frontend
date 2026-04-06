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
} from 'lucide-react'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import RoleService from '../../services/roles.service'

const Profile = () => {
  const user = useSelector((state) => state.user)
  const [role, setRole] = useState()
  const [permissions, setPermissions] = useState([])
  const [loadingPermissions, setLoadingPermissions] = useState(false)

  useEffect(() => {
    if (user?.roles?.length > 0 && !role) {
      setRole(user.roles[0])
    }
  }, [user])

  useEffect(() => {
    if (!role) return
    const getPermissions = async () => {
      setLoadingPermissions(true)
      try {
        const infoRole = await RoleService.find(role.id)
        setPermissions(infoRole.data.role.permissions)
      } catch (err) {
        console.log(err)
      } finally {
        setLoadingPermissions(false)
      }
    }
    getPermissions()
  }, [role])

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
                <Briefcase size={14} className="me-1" />{' '}
                {user.employee.position?.name || 'No aplica'}
              </div>
              <CBadge color="light" className="text-muted font-inter fw-medium mb-3" shape="pill">
                <MapPinHouse size={14} className="me-1" />
                {user.employee.position?.area[0].name || 'No aplica'}
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
                            {user.employee.person.gender?.name === 'F'
                              ? 'Femenino'
                              : user.employee.person.gender?.name === 'M'
                                ? 'Masculino'
                                : user.employee.person.gender?.name || 'No aplica'}
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
                              {user.employee.person.blood_type?.name || 'No aplica'}
                            </CBadge>
                          </td>
                        </tr>
                      </tbody>
                    </CTable>
                  </CCol>
                </CRow>
              </div>
              <div className="d-flex justify-content-end pt-3">
                <CButton
                  className="d-flex align-items-center gap-2 font-poppins btn-primary-add px-4"
                  onClick={() => console.log('Actualizar perfil')}
                >
                  Actualizar Perfil <ArrowRightCircle size={18} />
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6} className="mb-4">
          <CCard className="h-100 p-4 shadow-sm border-0 bg-white">
            <CCardBody>
              <div
                className="d-flex align-items-center gap-2 mb-4 fw-bold font-montserrat"
                style={{
                  color: '#0934a8',
                }}
              >
                <Building size={18} />
                <span className="fs-6">Detalles de Contratación y Salud</span>
              </div>

              <CForm className="row g-4 font-inter">
                <CCol md={12}>
                  <CCard className="bg-light p-3 border-0 rounded-3 h-100">
                    <div className="d-flex align-items-center gap-2 mb-3 text-secondary fw-bold">
                      <Droplets size={16} /> Salud
                    </div>
                    <CTable borderless small className="small m-0">
                      <tbody>
                        <tr>
                          <td className="text-muted fw-medium py-1">Administradora de Riesgos:</td>
                          <td className="py-1">
                            {user.employee.risk_manager?.name || 'No aplica'}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-medium py-1">Entidad de Salud:</td>
                          <td className="py-1">
                            {user.employee.health_entity?.name || 'No aplica'}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-medium py-1">Fondo de Pensión:</td>
                          <td className="py-1">
                            {user.employee.pension_fund?.name || 'No aplica'}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-medium py-1">Fondo de Compensación:</td>
                          <td className="py-1">
                            {user.employee.compensation_fund?.name || 'No aplica'}
                          </td>
                        </tr>
                      </tbody>
                    </CTable>
                  </CCard>
                </CCol>

                <CCol md={12}>
                  <CCard className="bg-light p-3 border-0 rounded-3 h-100">
                    <div className="d-flex align-items-center gap-2 mb-3 fw-bold">
                      <FileText size={16} /> Contrato
                    </div>
                    <CTable borderless small className="small m-0">
                      <tbody>
                        <tr>
                          <td className="text-muted fw-medium py-1">Cargo Actual:</td>
                          <td className="py-1 fw-medium text-dark text-break">
                            {user.employee.position?.name || 'No aplica'}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-medium py-1">Área:</td>
                          <td className="py-1">
                            {user.employee.position?.area[0].name || 'No aplica'}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-medium py-1">Centro de Operación:</td>
                          <td className="py-1">{user.employee.operation_center || 'No aplica'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-medium py-1">Fecha de Inicio:</td>
                          <td className="py-1">
                            {dayjs(user.employee.start_date).format('DD/MM/YYYY')}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-medium py-1">Fecha Fin:</td>
                          <td className="py-1">{user.employee.end_date || 'No Aplica'}</td>
                        </tr>
                      </tbody>
                    </CTable>
                  </CCard>
                </CCol>
              </CForm>
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
                    {user.roles.map((r, index) => (
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
                      {permissions.map((p, index) =>
                        user?.permissions?.some((up) => up.id === p.id) ? (
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
  )
}

export default Profile
