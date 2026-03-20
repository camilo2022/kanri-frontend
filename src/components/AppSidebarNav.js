import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'
import * as FaIcons from 'react-icons/fa'

export const AppSidebarNav = ({ items }) => {
  const navLink = (name, icon, indent = false) => {
    const IconComponent = icon && FaIcons[icon]
    return (
      <>
        {IconComponent ? (
          <span className="nav-icon">
            <IconComponent />
          </span>
        ) : (
          indent && (
            <span className="nav-icon">
              <span className="nav-icon-bullet"></span>
            </span>
          )
        )}
        {name && name}
      </>
    )
  }

  const navItem = (item, index, indent = false) => {
    const { name, icon, url } = item
    const Component = CNavItem
    return (
      <Component as="div" key={index}>
        <CNavLink as={NavLink} to={url}>
          {navLink(name, icon, indent)}
        </CNavLink>
      </Component>
    )
  }

  const navGroup = (item, index) => {
    const { name, icon, submodules } = item
    const Component = CNavGroup
    return (
      <Component compact as="div" key={index} toggler={navLink(name, icon)}>
        {submodules?.map((item, index) => navItem(item, index, true))}
      </Component>
    )
  }

  const dashboardItem = {
    name: 'Dashboard',
    icon: 'FaTachometerAlt',
    url: '/dashboard',
  }

  const finalItems = [dashboardItem, ...(items || [])]

  return (
    <CSidebarNav as={SimpleBar}>
      {finalItems.map((item, index) =>
        item.submodules ? navGroup(item, index) : navItem(item, index),
      )}
    </CSidebarNav>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}
