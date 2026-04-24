import { CCard } from '@coreui/react'
import { Settings } from 'lucide-react'

const LoadingForm = ({ title, subtitle, height = '500px' }) => {
  return (
    <CCard
      className="mb-4 p-4 shadow-sm border-0 d-flex justify-content-center align-items-center animate-fade-in"
      style={{ minHeight: height }}
    >
      <div className="text-center">
        <div className="gears-loader mb-3">
          <div className="gears-container mb-3">
            <Settings size={40} className="gear gear-large text-primary" />
            <Settings size={24} className="gear gear-small text-secondary" />
          </div>
        </div>

        <h5 className="fw-bold font-montserrat text-secondary">{title}</h5>

        <p className="text-muted font-inter small">{subtitle}</p>
      </div>
    </CCard>
  )
}

export default LoadingForm
