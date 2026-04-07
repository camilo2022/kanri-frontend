/**
 * Application Routes Configuration
 *
 * Defines all protected routes in the application using React lazy loading
 * for code splitting and performance optimization.
 *
 * Each route object contains:
 * - path: URL path for the route
 * - name: Human-readable name for breadcrumbs
 * - element: Lazy-loaded React component
 * - exact: (optional) Requires exact path match
 *
 * @module routes
 */

import React, { useState } from 'react'

const Dashboard = React.lazy(() => import('./views/pages/Dashboard'))
const Profile = React.lazy(() => import('./views/pages/Profile'))
const Users = React.lazy(() => import('./views/pages/Users'))
const Roles = React.lazy(() => import('./views/pages/Roles'))
const Permissions = React.lazy(() => import('./views/pages/Permissions'))
const Modules = React.lazy(() => import('./views/pages/Modules'))
const People = React.lazy(() => import('./views/pages/People'))
const Employees = React.lazy(() => import('./views/pages/Employees'))
const Areas = React.lazy(() => import('./views/pages/Areas'))
const Genders = React.lazy(() => import('./views/pages/Genders'))
const BloodTypes = React.lazy(() => import('./views/pages/BloodTypes'))
const RiskManagers = React.lazy(() => import('./views/pages/RiskManagers'))
const HealthEntities = React.lazy(() => import('./views/pages/HealthEntities'))
const CompensationFunds = React.lazy(() => import('./views/pages/CompensationFunds'))
const PensionFunds = React.lazy(() => import('./views/pages/PensionFunds'))
const Trademarks = React.lazy(() => import('./views/pages/Trademarks'))

/**
 * Array of route configuration objects
 *
 * @type {Array<Object>}
 * @property {string} path - URL path pattern
 * @property {string} name - Display name for breadcrumbs and navigation
 * @property {React.LazyExoticComponent} element - Lazy-loaded component
 * @property {boolean} [exact] - Whether to match path exactly
 *
 * @example
 * // Route renders when URL matches '/dashboard'
 * { path: '/dashboard', name: 'Dashboard', element: Dashboard }
 *
 * @example
 * // Route with exact match required
 * { path: '/base', name: 'Base', element: Cards, exact: true }
 */
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/profile', name: 'Perfil', element: Profile },
  { path: '/users', name: 'Usuarios', element: Users },
  { path: '/roles', name: 'Roles', element: Roles },
  { path: '/permissions', name: 'Permisos', element: Permissions },
  { path: '/modules', name: 'Módulos', element: Modules },
  { path: '/people', name: 'Personas', element: People },
  { path: '/employees', name: 'Empleados', element: Employees },
  { path: '/areas', name: 'Áreas', element: Areas },
  { path: '/genders', name: 'Géneros', element: Genders },
  { path: '/blood_types', name: 'Tipos de Sangre', element: BloodTypes },
  { path: '/risk_managers', name: 'Administradoras de Riesgos', element: RiskManagers },
  { path: '/health_entities', name: 'Entidades de Salud', element: HealthEntities },
  { path: '/compensation_funds', name: 'Cajas de Compensación', element: CompensationFunds },
  { path: '/pension_funds', name: 'Fondos de Pensión', element: PensionFunds },
  { path: '/trademarks', name: 'Marcas', element: Trademarks },
]

export default routes
