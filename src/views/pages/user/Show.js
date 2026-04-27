import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  CCard,
  CTable,
  CRow,
  CCol,
  CButton,
  CFormSwitch,
  CCollapse,
  CForm,
  CFormLabel,
  CFormInput,
  CFormCheck,
  CSpinner,
} from '@coreui/react'
import { IoMdArrowDropright } from 'react-icons/io'
import {
  User,
  Mail,
  ShieldCheck,
  Key,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  CircleX,
  ArrowLeftCircle,
  UserRound,
  FileText,
} from 'lucide-react'
import { Toast } from '@/components/Toast'
import LoadingForm from '@/components/LoadingForm'

const Show = ({ user, onChangeView, onSubmit, errors, roles = [], assign, remove }) => {
  const user_active = useSelector((state) => state.user)
  const [visibleRole, setVisibleRole] = useState(null)

  const toggleRole = (roleId) => {
    setVisibleRole(visibleRole === roleId ? null : roleId)
  }

  useEffect(() => {
    if (Object.keys(errors).length !== 0) {
      Toast.fire({
        icon: 'error',
        title: errors.message,
      })
    }
  }, [errors])

  if (!(user && Array.isArray(roles))) {
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
            <span className="fw-bold fs-5 font-montserrat">Detalles del Usuario</span>
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
        <CRow>
          <CCol md={12}>
            <CForm className="row g-3 needs-validation p-4">
              <CCol md={8}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <UserRound size={15} /> Nombre Completo
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={`${user?.employee?.person?.names || ''} ${user?.employee?.person?.last_names || ''} | ${user?.employee?.person?.document || ''} | ${user?.employee?.position?.name || ''}`}
                  disabled
                  className="font-montserrat"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel className="d-flex gap-2 font-inter align-items-center">
                  <Mail size={15} /> Correo Electrónico
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="email"
                  value={user?.email || ''}
                  disabled
                  className="font-montserrat"
                />
              </CCol>
            </CForm>
          </CCol>
          <CCol md={12} className="mb-4">
            <CCard className="h-100 p-4 shadow-sm border-0">
              <h6 className="mb-3 fw-bold d-flex align-items-center gap-2 font-poppins">
                <ShieldCheck size={18} className="text-primary" /> Roles y Permisos Disponibles
              </h6>

              {!Array.isArray(roles) ? (
                <div className="text-center">
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
                </div>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    No hay roles
                  </td>
                </tr>
              ) : (
                roles.map((role) => {
                  const isAssigned = user?.roles?.some((r) => r.id === role.id)
                  const isOpen = visibleRole === role.id

                  return (
                    <CCard key={role.id} className="mb-2 border-0 shadow-sm overflow-hidden">
                      <div
                        className="p-3 d-flex align-items-center justify-content-between"
                        style={{ cursor: 'pointer', backgroundColor: isOpen ? '#f8f9fa' : 'white' }}
                        onClick={() => toggleRole(role.id)}
                      >
                        <div className="d-flex align-items-center gap-3">
                          {isAssigned ? (
                            <CheckCircle2 size={22} className="text-success" />
                          ) : (
                            <CircleX size={22} className="text-danger" />
                          )}

                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold text-dark font-montserrat">
                                {role.title}
                              </span>
                              <small className="text-muted font-inter">({role.name})</small>
                            </div>
                            <small className="text-muted d-block font-inter">
                              {role.description}
                            </small>
                          </div>
                        </div>
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                      <CCollapse visible={isOpen}>
                        <div className="p-4 border-top bg-white">
                          <div className="d-flex align-items-center gap-2 mb-3 text-secondary small fw-bold font-poppins">
                            <Key size={14} /> LISTADO DE PERMISOS PARA ESTE ROL
                          </div>

                          <CTable hover responsive align="middle" className="small border">
                            <thead className="table-light font-poppins">
                              <tr>
                                <th style={{ width: '25%' }}>Nombre (Key)</th>
                                <th style={{ width: '25%' }}>Título</th>
                                <th style={{ width: '35%' }}>Descripción</th>
                                <th style={{ width: '2%' }} className="text-center">
                                  <div className="d-flex gap-2 align-items-center justify-content-center">
                                    <div className="d-flex flex-column align-items-center justify-content-center">
                                      <CFormSwitch
                                        id={`check-all-${role.id}`}
                                        style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                                        checked={role.permissions.every((p) =>
                                          user?.permissions?.some((up) => up.id === p.id),
                                        )}
                                        onChange={async () => {
                                          const areAllActive = role.permissions.every((p) =>
                                            user?.permissions?.some((up) => up.id === p.id),
                                          )
                                          if (areAllActive) {
                                            for (const permission of role.permissions) {
                                              await remove(user.id, permission.id)
                                            }
                                          } else {
                                            const missingPermissions = role.permissions.filter(
                                              (p) =>
                                                !user?.permissions?.some((up) => up.id === p.id),
                                            )
                                            for (const permission of missingPermissions) {
                                              await assign(user.id, permission.id)
                                            }
                                          }
                                        }}
                                      />
                                      <small
                                        className="text-muted mt-1"
                                        style={{ fontSize: '9px', fontWeight: 'bold' }}
                                      >
                                        TODOS
                                      </small>
                                    </div>
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {role.permissions?.map((perm) => (
                                <tr key={perm.id} className="font-inter">
                                  <td className="text-primary">{perm.name}</td>
                                  <td className="fw-medium">{perm.title}</td>
                                  <td className="text-muted">{perm.description}</td>
                                  <td className="text-center">
                                    <CFormSwitch
                                      disabled={
                                        !user_active?.permissions.some(
                                          (p) => p.name === 'users.authorization.assign',
                                        ) ||
                                        !user_active?.permissions.some(
                                          (p) => p.name === 'users.authorization.remove',
                                        )
                                      }
                                      id={`perm-${perm.id}`}
                                      size="lg"
                                      checked={user?.permissions?.some((p) => p.id === perm.id)}
                                      onChange={async () => {
                                        user?.permissions?.some((p) => p.id === perm.id)
                                          ? remove(user.id, perm.id)
                                          : assign(user.id, perm.id)
                                      }}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </CTable>
                        </div>
                      </CCollapse>
                    </CCard>
                  )
                })
              )}
            </CCard>
          </CCol>
        </CRow>
      </CCard>
    </div>
  )
}

export default Show
