import React, { useEffect, useRef, useState } from 'react'

const HorizontalScrollTable = ({ children }) => {
  const wrapperRef = useRef(null)
  const tableScrollRef = useRef(null)
  const floatingScrollRef = useRef(null)

  const [contentWidth, setContentWidth] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [barPosition, setBarPosition] = useState(null)
  const [showFloatingScroll, setShowFloatingScroll] = useState(false)

  const updateDimensions = () => {
    const wrapper = wrapperRef.current
    const tableScroll = tableScrollRef.current

    if (!wrapper || !tableScroll) return

    const table = tableScroll.querySelector('table')

    if (!table) return

    const tableWidth = Math.max(
      table.scrollWidth,
      table.offsetWidth,
      table.getBoundingClientRect().width,
    )

    const visibleWidth = tableScroll.clientWidth

    setContentWidth(tableWidth)
    setContainerWidth(visibleWidth)

    const rect = wrapper.getBoundingClientRect()

    const hasHorizontalOverflow = tableWidth > visibleWidth + 1

    // Posición real del final de la tabla
    const tableBottom = rect.bottom

    // Altura aproximada del scrollbar
    const scrollbarHeight = 16

    // El final de la tabla ya está visible
    const tableEndIsVisible = tableBottom <= window.innerHeight - scrollbarHeight && tableBottom > 0

    const isVisible = rect.bottom > 0 && rect.top < window.innerHeight

    const shouldShowFloating = isVisible && hasHorizontalOverflow && !tableEndIsVisible

    setShowFloatingScroll(shouldShowFloating)

    if (shouldShowFloating) {
      setBarPosition({
        left: rect.left,
        width: rect.width,
        top: rect.top,
        bottom: rect.bottom,
      })
    } else {
      setBarPosition(null)
    }
  }

  // Detectar cambios de tamaño
  useEffect(() => {
    const wrapper = wrapperRef.current
    const tableScroll = tableScrollRef.current

    if (!wrapper || !tableScroll) return

    const table = tableScroll.querySelector('table')

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions()
    })

    resizeObserver.observe(wrapper)
    resizeObserver.observe(tableScroll)

    if (table) {
      resizeObserver.observe(table)
    }

    updateDimensions()

    return () => {
      resizeObserver.disconnect()
    }
  }, [children])

  // Detectar scroll vertical de la página
  useEffect(() => {
    const handleScroll = () => {
      updateDimensions()
    }

    const handleResize = () => {
      updateDimensions()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    requestAnimationFrame(updateDimensions)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Sincronizar scrollbar inferior con la tabla
  useEffect(() => {
    const tableScroll = tableScrollRef.current
    const floatingScroll = floatingScrollRef.current

    if (!tableScroll || !floatingScroll) return

    const handleTableScroll = () => {
      if (floatingScroll.scrollLeft !== tableScroll.scrollLeft) {
        floatingScroll.scrollLeft = tableScroll.scrollLeft
      }
    }

    const handleFloatingScroll = () => {
      if (tableScroll.scrollLeft !== floatingScroll.scrollLeft) {
        tableScroll.scrollLeft = floatingScroll.scrollLeft
      }
    }

    tableScroll.addEventListener('scroll', handleTableScroll, {
      passive: true,
    })

    floatingScroll.addEventListener('scroll', handleFloatingScroll, {
      passive: true,
    })

    floatingScroll.scrollLeft = tableScroll.scrollLeft

    return () => {
      tableScroll.removeEventListener('scroll', handleTableScroll)
      floatingScroll.removeEventListener('scroll', handleFloatingScroll)
    }
  }, [contentWidth, barPosition])

  const hasHorizontalScroll = contentWidth > containerWidth + 1

  return (
    <div ref={wrapperRef} className="horizontal-table-wrapper">
      {/* Tabla */}
      <div ref={tableScrollRef} className="horizontal-table-content">
        {children}
      </div>

      {/* Scroll horizontal flotante */}
      {hasHorizontalScroll && showFloatingScroll && barPosition && (
        <div
          ref={floatingScrollRef}
          className="horizontal-table-floating-scroll"
          style={{
            left: `${barPosition.left}px`,
            width: `${barPosition.width}px`,

            // Mantenerlo dentro del área visible del card
            top: `${Math.min(
              Math.max(barPosition.top, window.innerHeight - 65),
              barPosition.bottom - 55,
            )}px`,
          }}
        >
          <div
            style={{
              width: `${contentWidth}px`,
              height: '1px',
            }}
          />
        </div>
      )}
    </div>
  )
}

export default HorizontalScrollTable
