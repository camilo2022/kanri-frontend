import React from 'react'
import { CButton, CCard, CCardBody, CCardImage, CCardText, CCardTitle } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMagnifyingGlass } from '@coreui/icons'

const Page401 = () => {
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex align-items-center justify-content-center">
      <CCard style={{ width: '22rem' }} className="text-center p-4 gap-3">
        <CCardBody>
          <CCardTitle className="display-1 fw-bold font-poppins" style={{ color: '#24247F' }}>
            401
          </CCardTitle>
          <CCardText className="fs-5 fw-bold font-poppins">No autorizado</CCardText>
          <CCardText style={{ color: '#C3C6C6', fontSize: '12px' }} className="font-inter">
            No estas autorizado para acceder a esta página
          </CCardText>
          <CButton
            style={{ background: '#24247F', color: 'white' }}
            href="/"
            className="font-poppins"
          >
            Iniciar Sesión
          </CButton>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default Page401
