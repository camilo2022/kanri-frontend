import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter position="sticky" className="px-4 font-poppins">
      <div>
        <span>&copy; {new Date().getFullYear()} </span>
        <a
          href="https://orgbless.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-decoration-none"
          style={{
            color: '#0934a8',
          }}
        >
          Organización Bless
        </a>
        <span className="ms-1">. Todos los derechos reservados.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Realizado por</span>
        <span className="fw-bold">Organización Bless</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
