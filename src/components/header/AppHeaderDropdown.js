import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { FaRegUser } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import AuthService from '../../services/auth.service'
import { Toast } from '../../components/Toast'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

const AppHeaderDropdown = () => {
  const user = useSelector((state) => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      Toast.fire({
        icon: 'success',
        title: 'Cierre de sesión exitoso',
      })
      setTimeout(() => {
        navigate('/')
      }, 2520)
    } catch (error) {
      throw error
    }
  }

  const handleReload = async () => {
    try {
      const userReload = await AuthService.user()
      dispatch({
        type: 'set',
        user: userReload.data.user,
        navegation: userReload.data.navegation,
      })
      Toast.fire({
        icon: 'success',
        title: 'Permisos Actualizados',
      })
    } catch (error) {
      throw error
    }
  }

  return (
    <CDropdown variant="nav-item" className="font-poppins">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <div className="d-flex align-items-center">
          <div className="d-flex flex-column text-end me-2 lh-1">
            <span className="fw-semibold font-poppins">
              {user?.employee?.person.names} {user?.employee?.person.last_names}
            </span>
            <small className="text-medium-emphasis font-inter">{user?.email}</small>
          </div>
          <CAvatar style={{ background: '#24247F' }} size="md">
            <FaRegUser className="text-white" />
          </CAvatar>
        </div>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end" style={{ cursor: 'pointer' }}>
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Cuenta</CDropdownHeader>
        <CDropdownItem href="/profile">
          <CIcon icon={cilUser} className="me-2" />
          Perfil
        </CDropdownItem>
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Ajustes</CDropdownHeader>
        <CDropdownItem onClick={() => handleReload()}>
          <CIcon icon={cilSettings} className="me-2" />
          Actualizar Permisos
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={() => handleLogout()}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Cerrar Sesión
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
