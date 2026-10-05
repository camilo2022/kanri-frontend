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
                className="d-flex flex-column align-items-center justify-content-center"
                style={{
                  minWidth: '150px',
                }}
              >
                <div className="d-flex align-items-center justify-content-center px-2 py-2 gap-1">
                  {priority_levels?.map((level) => {
                    const isActive = Number(level.value) <= priorityLevel
                    const isExactCurrent = Number(level.value) === priorityLevel

                    const unifiedColor = currentLevel?.color || '#F59E0B'

                    const starColor = isExactCurrent
                      ? unifiedColor
                      : isActive
                        ? `${unifiedColor}77`
                        : '#CBD5E1'

                    return (
                      <span
                        key={level.value}
                        title={`Nivel ${level.value}`}
                        style={{
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          filter: isExactCurrent
                            ? `drop-shadow(0 0 5px ${unifiedColor}88)`
                            : isActive
                              ? `drop-shadow(0 0 2px ${unifiedColor}44)`
                              : 'none',
                          transform: isExactCurrent
                            ? 'scale(1.15) translateY(-1px)'
                            : isActive
                              ? 'scale(1.06)'
                              : 'scale(1)',
                          transition:
                            'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.2s ease',
                        }}
                      >
                        <span
                          style={{
                            position: 'relative',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '26px',
                            height: '24px',
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 36 34"
                            width={isExactCurrent ? 28 : 24}
                            height={isExactCurrent ? 26 : 22}
                            aria-hidden="true"
                            style={{
                              display: 'block',
                              overflow: 'visible',
                            }}
                          >
                            <path
                              fill={starColor}
                              d="M19.6859343,0.861782958 L24.8136328,8.05088572 C25.0669318,8.40601432 25.4299179,8.6717536 25.8489524,8.80883508 L34.592052,11.6690221 C35.6704701,12.021812 36.2532905,13.1657829 35.8938178,14.2241526 C35.8056709,14.4836775 35.6647294,14.7229267 35.4795411,14.9273903 L29.901129,21.0864353 C29.5299163,21.4962859 29.3444371,22.0366367 29.3872912,22.5833831 L30.1116131,31.8245163 C30.1987981,32.9368499 29.3506698,33.9079379 28.2172657,33.993502 C27.9437428,34.0141511 27.6687738,33.9809301 27.4085205,33.8957918 L18.6506147,31.0307612 C18.2281197,30.8925477 17.7713439,30.8925477 17.3488489,31.0307612 L8.59094317,33.8957918 C7.51252508,34.2485817 6.34688429,33.6765963 5.98741159,32.6182265 C5.90066055,32.3628499 5.86681029,32.0929541 5.88785051,31.8245163 L6.61217242,22.5833831 C6.65502653,22.0366367 6.46954737,21.4962859 6.09833466,21.0864353 L0.519922484,14.9273903 C-0.235294755,14.0935658 -0.158766688,12.8167745 0.690852706,12.0755971 C0.899189467,11.8938511 1.14297067,11.7555303 1.40741159,11.6690221 L10.1505113,8.80883508 C10.5695459,8.6717536 10.9325319,8.40601432 11.1858308,8.05088572 L16.3135293,0.861782958 C16.9654141,-0.0521682813 18.2488096,-0.274439442 19.1800736,0.365326425 C19.3769294,0.500563797 19.5481352,0.668586713 19.6859343,0.861782958 Z"
                            />

                            {isExactCurrent && (
                              <text
                                x="18"
                                y="20"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="11"
                                fontWeight="700"
                                fill="#FFFFFF"
                              >
                                {level.value}
                              </text>
                            )}
                          </svg>
                        </span>
                      </span>
                    )
                  })}
                </div>
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
