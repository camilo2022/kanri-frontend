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
const Silhouettes = React.lazy(() => import('./views/pages/Silhouettes'))
const Sizes = React.lazy(() => import('./views/pages/Sizes'))
const Subgroups = React.lazy(() => import('./views/pages/Subgroups'))
const Groups = React.lazy(() => import('./views/pages/Groups'))
const Pieces = React.lazy(() => import('./views/pages/Pieces'))
const GarmentTypes = React.lazy(() => import('./views/pages/GarmentTypes'))
const BootTypes = React.lazy(() => import('./views/pages/BootTypes'))
const BackTypes = React.lazy(() => import('./views/pages/BackTypes'))
const WaistbandTypes = React.lazy(() => import('./views/pages/WaistbandTypes'))
const Categories = React.lazy(() => import('./views/pages/Categories'))
const Subcategories = React.lazy(() => import('./views/pages/Subcategories'))
const Audits = React.lazy(() => import('./views/pages/Audits'))
const Processes = React.lazy(() => import('./views/pages/Processes'))
const WashTones = React.lazy(() => import('./views/pages/WashTones'))
const Colors = React.lazy(() => import('./views/pages/Colors'))
const Collections = React.lazy(() => import('./views/pages/Collections'))
const YokeTypes = React.lazy(() => import('./views/pages/YokeTypes'))
const FabricTypes = React.lazy(() => import('./views/pages/FabricTypes'))
const ThreadTypes = React.lazy(() => import('./views/pages/ThreadTypes'))
const SupplyTypes = React.lazy(() => import('./views/pages/SupplyTypes'))
const SupplierTypes = React.lazy(() => import('./views/pages/SupplierTypes'))
const ManagementCollection = React.lazy(() => import('./views/pages/ManagementCollection'))
const Products = React.lazy(() => import('./views/pages/Products'))
const ManagementProduction = React.lazy(() => import('./views/pages/ManagementProduction'))
const FileTypes = React.lazy(() => import('./views/pages/FileTypes'))
const FileSubtypes = React.lazy(() => import('./views/pages/FileSubtypes'))
const PersonTypes = React.lazy(() => import('./views/pages/PersonTypes'))
const DocumentTypes = React.lazy(() => import('./views/pages/DocumentTypes'))
const Banks = React.lazy(() => import('./views/pages/Banks'))
const AccountTypes = React.lazy(() => import('./views/pages/AccountTypes'))
const ProductionSchedules = React.lazy(() => import('./views/pages/ProductionSchedules'))
const Reports = React.lazy(() => import('./views/pages/Reports'))
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
  { path: '/areas', name: 'Áreas', element: Areas },
  { path: '/audits', name: 'Auditoría', element: Audits },
  { path: '/back_types', name: 'Tipos de Trasero', element: BackTypes },
  { path: '/blood_types', name: 'Tipos de Sangre', element: BloodTypes },
  { path: '/boot_types', name: 'Tipos de Bota', element: BootTypes },
  { path: '/categories', name: 'Categorías', element: Categories },
  { path: '/pieces', name: 'Piezas', element: Pieces },
  { path: '/compensation_funds', name: 'Cajas de Compensación', element: CompensationFunds },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/employees', name: 'Empleados', element: Employees },
  { path: '/genders', name: 'Géneros', element: Genders },
  { path: '/health_entities', name: 'Entidades de Salud', element: HealthEntities },
  { path: '/groups', name: 'Grupos', element: Groups },
  { path: '/garment_types', name: 'Tipos de Prenda', element: GarmentTypes },
  { path: '/modules', name: 'Módulos', element: Modules },
  { path: '/pension_funds', name: 'Fondos de Pensión', element: PensionFunds },
  { path: '/people', name: 'Personas', element: People },
  { path: '/permissions', name: 'Permisos', element: Permissions },
  { path: '/processes', name: 'Procesos', element: Processes },
  { path: '/profile', name: 'Perfil', element: Profile },
  { path: '/risk_managers', name: 'Administradoras de Riesgos', element: RiskManagers },
  { path: '/roles', name: 'Roles', element: Roles },
  { path: '/silhouettes', name: 'Siluetas', element: Silhouettes },
  { path: '/sizes', name: 'Tallas', element: Sizes },
  { path: '/subcategories', name: 'Subcategorías', element: Subcategories },
  { path: '/subgroups', name: 'Subgrupos', element: Subgroups },
  { path: '/trademarks', name: 'Marcas', element: Trademarks },
  { path: '/users', name: 'Usuarios', element: Users },
  { path: '/waistband_types', name: 'Tipos de Pretina', element: WaistbandTypes },
  { path: '/wash_tones', name: 'Tonos de Lavado', element: WashTones },
  { path: '/colors', name: 'Colores', element: Colors },
  { path: '/collections', name: 'Colecciones', element: Collections },
  { path: '/yoke_types', name: 'Tipos de Cotilla', element: YokeTypes },
  { path: '/supplier_types', name: 'Tipos de Proveedores', element: SupplierTypes },
  { path: '/fabric_types', name: 'Tipos de Tela', element: FabricTypes },
  { path: '/thread_types', name: 'Tipos de Hilo', element: ThreadTypes },
  { path: '/supply_types', name: 'Tipos de Insumo', element: SupplyTypes },
  {
    path: '/management/collections',
    name: 'Gestión de Colecciones',
    element: ManagementCollection,
  },
  { path: '/products', name: 'Productos', element: Products },
  {
    path: '/management/production',
    name: 'Gestión de Producción',
    element: ManagementProduction,
  },
  { path: '/file_types', name: 'Tipos de Archivos', element: FileTypes },
  { path: '/person_types', name: 'Tipos de Personas', element: PersonTypes },
  { path: '/banks', name: 'Bancos', element: Banks },
  { path: '/account_types', name: 'Tipos de Cuenta', element: AccountTypes },
  { path: '/production_schedule', name: 'Cronograma de Producción', element: ProductionSchedules },
  { path: '/reports', name: 'Reportes', element: Reports },
]

export default routes
