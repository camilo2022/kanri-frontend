/**
 * DefaultLayout Component
 *
 * Main application layout wrapper that composes the primary UI structure
 * for authenticated/protected routes.
 *
 * Layout structure:
 * - AppSidebar: Collapsible navigation sidebar
 * - AppHeader: Top navigation bar with user menu and theme switcher
 * - AppContent: Main content area with route rendering
 * - AppFooter: Footer with links and copyright
 *
 * This layout is used for all routes defined in routes.js, providing
 * a consistent structure across the application.
 *
 * @component
 * @example
 * // Used in App.js for protected routes
 * <Route path="*" element={<DefaultLayout />} />
 */

import React, { useState, useEffect } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import {
  CButton,
  CCard,
  CCardBody,
  CCardImage,
  CCardText,
  CCardTitle,
  CSpinner,
} from '@coreui/react'
import AuthService from '../features/auth.service'

/**
 * DefaultLayout functional component
 *
 * Renders the main application layout with:
 * - Fixed sidebar navigation
 * - Sticky header
 * - Flexible content area
 * - Footer at bottom
 *
 * Uses flexbox for proper content stretching and footer positioning.
 *
 * @returns {React.ReactElement} Complete application layout
 */
const DefaultLayout = () => {
  const [valid, setValid] = useState(null)
  useEffect(() => {
    const checkToken = async () => {
      try {
        await AuthService.user()
        setValid(true)
      } catch (err) {
        setValid(false)
      }
    }
    checkToken()
  }, [])

  if (valid === null) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <CSpinner />
      </div>
    )
  }

  if (!valid) {
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

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
