import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CButton, CCol, CForm, CFormInput, CInputGroup, CInputGroupText, CRow } from '@coreui/react'
import AuthService from '../../features/auth.service'
import { useFormik } from 'formik'
import { Toast } from '../../components/Toast'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import { FaRegCircleUser } from 'react-icons/fa6'
import { GoLock } from 'react-icons/go'
import login from '../../assets/images/avatars/login.png'

const Login = () => {
  const navigate = useNavigate()
  const [errors, setErrors] = useState([])
  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: async (values) => {
      try {
        setErrors([])
        const response = await AuthService.login(values)
        localStorage.setItem('token', response.data.token)
        Toast.fire({
          icon: 'success',
          title: response.message,
        })
        setTimeout(() => {
          navigate('/dashboard')
        }, '2520')
      } catch (error) {
        setErrors(error.errors)
        if (error.errors) {
          setErrors([...error.errors])
        } else {
          Toast.fire({
            icon: 'error',
            title: error.error.message,
          })
        }
      }
    },
  })

  const errorGroupStyle = {
    boxShadow: '0 0 0 0.25rem rgba(220, 53, 69, 0.25)',
    border: '1px solid #dc3545',
    borderRadius: '0.375rem',
    transition: 'box-shadow 0.15s ease-in-out',
  }

  return (
    <div className="min-vh-100 overflow-hidden">
      <CRow className="g-0 min-vh-100">
        <CCol
          lg={7}
          xl={8}
          className="d-none d-lg-flex align-items-center justify-content-center position-relative"
          style={{ backgroundColor: '#f2f6fa' }}
        >
          <div className="text-center p-5">
            <img
              src={login}
              alt="Login Background"
              className="img-fluid"
              style={{ maxHeight: '500px' }}
            />
          </div>
        </CCol>

        <CCol xs={12} lg={5} xl={4} className="d-flex align-items-center bg-white">
          <div className="w-100 p-4 p-md-5">
            <div className="mb-5">
              <h2 className="fw-bold font-poppins">¡Bienvenido!</h2>
              <p className="text-muted font-inter">Ingresa tus credenciales para continuar</p>
            </div>

            <CForm onSubmit={formik.handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold font-inter">Usuario</label>
                <CInputGroup style={errors?.email?.length > 0 ? errorGroupStyle : {}}>
                  <CInputGroupText
                    className={`bg-light border-end-0 ${errors?.email?.length > 0 ? 'border-danger' : ''}`}
                  >
                    <FaRegCircleUser />
                  </CInputGroupText>
                  <CFormInput
                    name="email"
                    placeholder="Ingresa el correo"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                    className={`custom-input bg-light border-start-1 py-2 font-inter ${errors?.email?.length > 0 ? 'border-danger' : ''}`}
                  />
                </CInputGroup>
                {errors?.email?.map((err, index) => (
                  <div key={index} className="text-danger small mt-1 fw-medium font-inter">
                    {err}
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <label className="form-label fw-semibold font-inter">Contraseña</label>
                  <Link to="/forgot" className="text-decoration-none small font-inter">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <CInputGroup style={errors?.password?.length > 0 ? errorGroupStyle : {}}>
                  <CInputGroupText
                    className={`bg-light border-end-0 ${errors?.password?.length > 0 ? 'border-danger' : ''}`}
                  >
                    <GoLock />
                  </CInputGroupText>
                  <CFormInput
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Ingresa la contraseña"
                    onChange={formik.handleChange}
                    value={formik.values.password}
                    className={`custom-input bg-light border-start-1 py-2 font-inter ${errors?.password?.length > 0 ? 'border-danger' : ''}`}
                  />
                  <CInputGroupText
                    className="custom-input bg-light border-start-0"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
                  </CInputGroupText>
                </CInputGroup>
                {errors?.password?.map((err, index) => (
                  <div key={index} className="text-danger small mt-1 fw-medium font-inter">
                    {err}
                  </div>
                ))}
              </div>

              <div className="d-grid gap-2">
                <CButton
                  color="primary"
                  size="lg"
                  type="submit"
                  className="py-2 fw-bold shadow-sm font-montserrat"
                  style={{ backgroundColor: '#5d87ff' }}
                >
                  Iniciar Sesión
                </CButton>
              </div>
            </CForm>
          </div>
        </CCol>
      </CRow>
    </div>
  )
}

export default Login
