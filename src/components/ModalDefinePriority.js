import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormCheck,
} from '@coreui/react'
import { Save } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { Toast } from '@/components/Toast'
import { createPortal } from 'react-dom'

const ModalDefinePriority = ({
  openModalPriority,
  setOpenModalPriority,
  production_order,
  production_changes,
  priority_checks,
  priority_levels,
  priority_rules,
  changeFormData,
}) => {
  const [priorityChecks, setPriorityChecks] = useState({})

  useEffect(() => {
    if (!openModalPriority) return

    const savedCriteria =
      production_changes?.settings?.priority_checks ||
      production_order?.settings?.priority_checks ||
      {}

    const initialChecks = Object.keys(priority_checks || {}).reduce((acc, key) => {
      acc[key] = savedCriteria[key] ?? false
      return acc
    }, {})

    setPriorityChecks(initialChecks)
  }, [openModalPriority, production_order, production_changes, priority_checks])

  const priorityLevel = useMemo(() => {
    const activeChecks = Object.entries(priorityChecks)
      .filter(([, checked]) => checked)
      .map(([key]) => key)

    const totalChecks = activeChecks.length

    if (!priority_rules) {
      return 1
    }

    const levels = priority_rules
      .map((level) => ({
        level: Number(level.value),
        rule: level.rules,
      }))
      .sort((a, b) => b.level - a.level)

    for (const { level, rule } of levels) {
      /*
       * Regla: required
       *
       * Todos los checks indicados deben estar seleccionados.
       */
      if (rule.required) {
        const hasRequired = rule.required.every((check) => activeChecks.includes(check))

        if (!hasRequired) {
          continue
        }
      }

      /*
       * Regla: one_of
       *
       * Al menos uno de los checks indicados debe estar seleccionado.
       */
      if (rule.one_of) {
        const hasOneOf = rule.one_of.some((check) => activeChecks.includes(check))

        if (!hasOneOf) {
          continue
        }
      }

      /*
       * Regla: minimum_checks
       */
      if (rule.minimum_checks !== undefined && totalChecks < rule.minimum_checks) {
        continue
      }

      /*
       * Regla: maximum_checks
       */
      if (rule.maximum_checks !== undefined && totalChecks > rule.maximum_checks) {
        continue
      }

      /*
       * Regla: excluded_combinations
       *
       * Si alguna combinación excluida está completa,
       * esta regla no aplica.
       */
      if (rule.excluded_combinations) {
        const hasExcludedCombination = rule.excluded_combinations.some((combination) =>
          combination.every((check) => activeChecks.includes(check)),
        )

        if (hasExcludedCombination) {
          continue
        }
      }

      return level
    }

    return 1
  }, [priorityChecks, priority_rules])

  const currentLevel = useMemo(() => {
    return priority_levels?.find((level) => level.value === priorityLevel) || null
  }, [priority_levels, priorityLevel])

  const handlePriorityCheck = (name) => {
    setPriorityChecks((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))
  }

  const handleSubmit = () => {
    changeFormData?.('priority', priorityLevel)
    changeFormData?.('settings', { priority_checks: { ...priorityChecks } })

    Toast.fire({
      icon: 'success',
      title: `Prioridad definida correctamente`,
    })

    setOpenModalPriority(false)
  }

  return createPortal(
    <CModal
      visible={openModalPriority}
      onClose={() => {
        setOpenModalPriority(false)
      }}
      alignment="center"
      className="font-montserrat"
    >
      <CModalHeader
        style={{
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
        }}
      >
        <CModalTitle
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#0F172A',
          }}
        >
          Definir Prioridad
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="px-4 py-3">
        <div className="d-flex flex-column gap-3">
          <div
            className="p-3 rounded-3"
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <div
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#0F172A',
              }}
            >
              Selecciona los criterios de prioridad
            </div>

            <div
              className="mt-1"
              style={{
                fontSize: '0.8rem',
                color: '#64748B',
              }}
            >
              La prioridad se calculará automáticamente según los criterios seleccionados.
            </div>
          </div>

          {/* CHECKS DINÁMICOS DEL BACKEND */}
          <div
            className="d-flex flex-column rounded-3 overflow-hidden"
            style={{
              border: '1px solid #E2E8F0',
            }}
          >
            {Object.values(priority_checks || {}).map((item, index) => {
              const isChecked = priorityChecks[item.value] || false

              return (
                <div
                  key={item.value}
                  className="d-flex align-items-center justify-content-between px-3 py-2"
                  style={{
                    minHeight: '52px',
                    backgroundColor: isChecked ? '#F5F5FF' : '#FFFFFF',
                    borderBottom:
                      index < Object.values(priority_checks || {}).length - 1
                        ? '1px solid #E2E8F0'
                        : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => handlePriorityCheck(item.value)}
                >
                  <div className="d-flex align-items-center gap-2">
                    <CFormCheck
                      id={`priority-${item.value}`}
                      checked={isChecked}
                      onChange={() => handlePriorityCheck(item.value)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: isChecked ? 600 : 500,
                        color: isChecked ? '#24247F' : '#334155',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>

                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: isChecked ? '#24247F' : '#CBD5E1',
                      transition: 'all 0.15s ease',
                    }}
                  />
                </div>
              )
            })}
          </div>

          {/* NIVEL DINÁMICO DEL BACKEND */}
          <div
            className="p-3 rounded-3"
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748B',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}
                >
                  Nivel de prioridad
                </div>

                <div
                  className="mt-1"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: currentLevel?.color || '#64748B',
                  }}
                >
                  {currentLevel?.label || 'Sin prioridad'}
                </div>
              </div>

              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  minWidth: '52px',
                  height: '42px',
                  backgroundColor: currentLevel?.color || '#64748B',
                  color: '#FFFFFF',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  boxShadow: currentLevel?.color ? `0 2px 6px ${currentLevel.color}40` : 'none',
                }}
              >
                {priorityLevel}
              </div>
            </div>
          </div>
        </div>
      </CModalBody>

      <CModalFooter className="mt-2">
        <CButton
          color="secondary"
          size="sm"
          onClick={() => {
            setOpenModalPriority(false)
          }}
        >
          Cancelar
        </CButton>

        <CButton
          size="sm"
          className="text-white d-flex align-items-center gap-2"
          style={{
            backgroundColor: '#24247F',
            border: 'none',
          }}
          onClick={handleSubmit}
        >
          <Save size={16} />
          Guardar
        </CButton>
      </CModalFooter>
    </CModal>,
    document.body,
  )
}

export default ModalDefinePriority
