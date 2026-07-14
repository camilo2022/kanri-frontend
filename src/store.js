/**
 * Redux Store Configuration
 *
 * Simple Redux store managing global application state.
 * Handles sidebar visibility and theme preferences.
 *
 * @module store
 */

import { legacy_createStore as createStore } from 'redux'

/**
 * Initial state for the Redux store
 * @type {Object}
 * @property {boolean} sidebarShow - Controls sidebar visibility (true = visible, false = hidden)
 * @property {string} theme - Current theme mode ('light', 'dark', or 'auto')
 */
const initialState = {
  sidebarShow: true,
  theme: 'light',
  user: null,
  navegation: [],
  action: '',
  userCmp: null,
  technicalSheets: {},
  technicalSheetsModified: {},
  errors: {},
  modifiedFields: {},
  structure: {},
  total_orders: null,
}

/**
 * Root reducer function that handles all state changes
 *
 * @param {Object} state - Current state (defaults to initialState)
 * @param {Object} action - Action object with type and payload
 * @param {string} action.type - Action type ('set' to update state)
 * @param {...*} rest - Additional properties to merge into state
 * @returns {Object} New state object
 *
 * @example
 * // Update sidebar visibility
 * dispatch({ type: 'set', sidebarShow: false })
 *
 * @example
 * // Update theme
 * dispatch({ type: 'set', theme: 'dark' })
 *
 * @example
 * // Update multiple properties
 * dispatch({ type: 'set', sidebarShow: true, theme: 'light' })
 */
const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }

    case 'SET_TECHNICAL_SHEETS':
      return {
        ...state,
        technicalSheets: rest.payload,
      }

    case 'UPDATE_TECHNICAL_SHEETS':
      return {
        ...state,
        technicalSheetsModified: {
          ...state.technicalSheetsModified,
          [rest.payload.id]: {
            ...state.technicalSheets[rest.payload.id],
            [rest.payload.field]: rest.payload.value,
          },
        },
      }

    case 'ADD_TECHNICAL_SHEET':
      return {
        ...state,
        technicalSheetsModified: {
          ...state.technicalSheetsModified,
          [rest.payload.id]: rest.payload.technicalSheet,
        },
      }

    case 'ADD_ERRORS':
      return {
        ...state,
        errors: {
          ...state.errors,
          [rest.payload.id]: rest.payload.errors,
        },
      }

    case 'REMOVE_TECHNICAL_SHEETS': {
      const updatedSheets = { ...state.technicalSheetsModified }
      delete updatedSheets[rest.payload.id]
      return {
        ...state,
        technicalSheetsModified: updatedSheets,
      }
    }

    case 'REMOVE_ERRORS': {
      const updatedErrors = { ...state.errors }
      delete updatedErrors[rest.payload.id]
      return {
        ...state,
        errors: updatedErrors,
      }
    }

    case 'DELETE_TECHNICAL_SHEETS': {
      return {
        ...state,
        technicalSheetsModified: {},
      }
    }

    case 'DELETE_ERRRORS': {
      return {
        ...state,
        errors: {},
      }
    }

    default:
      return state
  }
}

/**
 * Redux store instance
 * @type {import('redux').Store}
 */
const store = createStore(changeState)
export default store
