import { CButton, CCard, CCardBody, CCardText, CCardTitle } from '@coreui/react'

const Page500 = () => {
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex align-items-center justify-content-center">
      <CCard style={{ width: '22rem' }} className="text-center p-4 gap-3">
        <CCardBody>
          <CCardTitle className="display-1 fw-bold font-poppins" style={{ color: '#24247F' }}>
            500
          </CCardTitle>
          <CCardText className="fs-5 fw-bold font-poppins">Error Interno</CCardText>
          <CCardText style={{ color: '#C3C6C6', fontSize: '12px' }} className="font-inter">
            Hubo un error en el servidor
          </CCardText>
          <CButton
            style={{ background: '#24247F', color: 'white' }}
            href="/dashboard"
            className="font-poppins"
          >
            Volver al Inicio
          </CButton>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default Page500
