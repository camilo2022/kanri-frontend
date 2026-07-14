export const thStyle = {
  backgroundColor: '#F8FAFC',
  color: '#334155',
  fontSize: '.78rem',
  fontWeight: 700,
  padding: '14px 12px',
  borderBottom: '1px solid #E2E8F0',
  borderRight: '1px solid #E2E8F0',
  verticalAlign: 'middle',
}

export const thStyleSpecific = {
  backgroundColor: '#F8FAFC',
  color: '#334155',
  fontSize: '.78rem',
  fontWeight: 700,
  padding: '14px 12px',
  borderTop: '1px solid #E2E8F0',
  borderRight: '1px solid #E2E8F0',
  verticalAlign: 'middle',
}

export const thStyleGroup = {
  backgroundColor: '#F8FAFC',
  color: '#334155',
  fontSize: '.78rem',
  fontWeight: 700,
  padding: '5px 8px',
  borderBottom: '1px solid #E2E8F0',
  borderRight: '1px solid #E2E8F0',
  verticalAlign: 'middle',
}

export const tdStyle = {
  padding: '12px',
  fontSize: '.82rem',
  color: 'black',
  borderBottom: '1px solid #F1F5F9',
  borderRight: '1px solid #F1F5F9',
  verticalAlign: 'middle',
}

export const tableSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '32px',
    height: '32px',
    with: '100px',
    backgroundColor: 'transparent',
    border: state.isFocused ? '1px solid #CBD5E1' : '1px solid transparent',
    boxShadow: 'none',
    borderRadius: '6px',
    transition: 'all .18s ease',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#F8FAFC',
      border: '1px solid #E2E8F0',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: '32px',
    padding: '0 8px',
  }),
  input: (provided) => ({
    ...provided,
    margin: 0,
    padding: 0,
    fontSize: '.82rem',
    color: '#334155',
    fontFamily: 'Inter, sans-serif',
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: '.82rem',
    fontWeight: 500,
    color: '#334155',
    fontFamily: 'Inter, sans-serif',
  }),
  placeholder: (provided) => ({
    ...provided,
    fontSize: '.82rem',
    color: '#94A3B8',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: '32px',
    opacity: 0,
    transition: 'opacity .18s ease',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    padding: '0 6px',
    color: '#64748B',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #E2E8F0',
    boxShadow: '0 10px 25px rgba(15,23,42,.08)',
    zIndex: 20,
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '4px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#EEF2FF' : state.isFocused ? '#F8FAFC' : '#fff',
    color: state.isSelected ? '#24247f' : '#334155',
    fontSize: '.82rem',
    fontWeight: state.isSelected ? 600 : 500,
    borderRadius: '8px',
    cursor: 'pointer',
  }),
}

export const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '38px',
    height: '38px',
    borderRadius: '10px',
    background: '#fff',
    border: state.isFocused ? '1px solid #24247f' : '1px solid #E2E8F0',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(36, 36, 127, 0.12)' : 'none',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: '#24247f',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 12px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
  }),
  input: (provided) => ({
    ...provided,
    margin: '0px',
    fontFamily: 'Montserrat, sans-serif',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: '36px',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? '#24247f' : '#94A3B8',
    padding: '0 8px',
    '&:hover': {
      color: '#24247f',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#94A3B8',
    fontSize: '0.9rem',
    fontWeight: '500',
    fontFamily: 'Montserrat, sans-serif',
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: '0.92rem',
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: 'Montserrat, sans-serif',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '12px',
    overflow: 'hidden',
    marginTop: '8px',
    border: '1px solid #F1F5F9',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
    backgroundColor: '#fff',
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '6px',
  }),
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected ? '#24247f' : state.isFocused ? '#F0F4FF' : 'transparent',
    color: state.isSelected ? '#fff' : '#475569',
    padding: '10px 14px',
    fontSize: '0.9rem',
    fontWeight: state.isSelected ? '600' : '500',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'Montserrat, sans-serif',
    transition: 'all 0.15s ease',
    '&:active': {
      background: '#24247f',
    },
  }),
}

export const statusStyles = {
  Pendiente: {
    backgroundColor: '#FEF3C7',
    borderLeft: '3px solid #D97706',
  },
  'En revision': {
    backgroundColor: '#DBEAFE',
    borderLeft: '3px solid #2563EB',
  },
  Aprobado: {
    backgroundColor: '#DCFCE7',
    borderLeft: '3px solid #16A34A',
  },
  Cancelado: {
    backgroundColor: '#FEE2E2',
    borderLeft: '3px solid #DC2626',
  },
}

export const processStatusStyles = {
  Pendiente: {
    backgroundColor: '#FEF3C7',
    borderLeft: '3px solid #D97706',
  },
  'En revision': {
    backgroundColor: '#DBEAFE',
    borderLeft: '3px solid #2563EB',
  },
  Aprobado: {
    backgroundColor: '#DCFCE7',
    borderLeft: '3px solid #16A34A',
  },
}

export const optionsProcess = [
  { label: 'PENDIENTE', value: 'Pendiente' },
  { label: 'EN REVISIÓN', value: 'En revision' },
  { label: 'APROBADO', value: 'Aprobado' },
  { label: 'PRUEBA', value: 'PRUEBA' },
]

export const optionsStatus = [
  { label: 'PENDIENTE', value: 'Pendiente', data: 'Pendiente' },
  { label: 'EN REVISIÓN', value: 'En revision', data: 'En revision' },
  { label: 'APROBADO', value: 'Aprobado', data: 'Aprobado' },
  { label: 'CANCELADO', value: 'Cancelado', data: 'Cancelado' },
  { label: 'PRUEBA', value: 'PRUEBA', data: 'PRUEBA' },
]

export const getProcessClass = (status) => {
  switch (status) {
    case 'Aprobado':
      return 'process-approved'

    case 'En revision':
      return 'process-rejected'

    default:
      return 'process-pending'
  }
}

export const getStatusClass = (status) => {
  switch (status) {
    case 'Aprobado':
      return 'status-approved'

    case 'Cancelado':
      return 'status-rechazed'

    case 'En revision':
      return 'status-rejected'

    default:
      return 'status-pending'
  }
}

export const getSelectStyles = ({ isInvalid = false, isValid = false } = {}) => ({
  control: (base) => ({
    ...base,
    borderColor: isInvalid ? '#dc3545' : isValid ? '#198754' : '#dbdfe6',
    boxShadow: 'none',
    borderRadius: '0.375rem',
    '&:hover': {
      borderColor: isInvalid ? '#dc3545' : isValid ? '#198754' : '#1857b6',
      boxShadow: isInvalid
        ? '0 0 0 0.2rem rgba(253, 21, 13, 0.25)'
        : isValid
          ? '#228719'
          : '0 0 0 0.2rem rgba(13, 110, 253, 0.25)',
    },
    cursor: 'pointer',
    color: '#212529',
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
    fontFamily: 'Montserrat, sans-serif',
  }),

  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: '0.375rem',
    overflow: 'hidden',
  }),

  menuList: (base) => ({
    ...base,
    padding: 0,
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#f1f3f5' : 'white',
    color: state.isSelected ? '#1b3761' : '#212529',
    fontWeight: state.isSelected ? 'bold' : 'normal',
    borderRadius: 0,
  }),
})

export const getSelectStylesInsert = ({ isInvalid = false, isValid = false } = {}) => ({
  dropdownIndicator: (base, state) => ({
    ...base,
    display: !state.isFocused && 'none',
  }),
  indicatorSeparator: (state) => ({
    display: !state.isFocused && 'none',
  }),
  control: (base, state) => ({
    ...base,
    fontSize: '0.82rem ',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    color: '#212529',
    borderColor: state.isFocused
      ? isInvalid
        ? '#dc3545'
        : isValid
          ? '#198754'
          : '#1857b6'
      : 'transparent',
    boxShadow: state.isFocused
      ? isInvalid
        ? '0 0 0 0.2rem rgba(253, 21, 13, 0.25)'
        : isValid
          ? '0 0 0 0.2rem rgba(25, 135, 84, 0.25)'
          : '0 0 0 2px rgba(36, 36, 127, 0.1)'
      : 'none',

    backgroundColor: state.isFocused
      ? isInvalid
        ? '0 0 0 0.2rem rgba(253, 21, 13, 0.25)'
        : isValid
          ? '0 0 0 0.2rem rgba(25, 135, 84, 0.25)'
          : '#f8fafc'
      : 'none',
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.82rem ',
  }),

  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: '0.375rem',
    overflow: 'hidden',
  }),

  menuList: (base) => ({
    ...base,
    padding: 0,
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#f1f3f5' : 'white',
    color: state.isSelected ? '#1b3761' : '#212529',
    fontWeight: state.isSelected ? 'bold' : 'normal',
    borderRadius: 0,
  }),

  singleValue: (base, state) => ({
    ...base,
    color: '#212529',
  }),
})

export const getSelectStylesInsertSpec = ({ isInvalid = false, isValid = false } = {}) => ({
  dropdownIndicator: (base, state) => ({
    ...base,
    display: !state.isFocused && 'none',
  }),
  indicatorSeparator: (state) => ({
    display: !state.isFocused && 'none',
  }),
  control: (base, state) => ({
    ...base,
    fontSize: '0.82rem ',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    color: 'rgba(37, 42.92, 54.02, 0.681)',
    borderColor: state.isFocused
      ? isInvalid
        ? '#dc3545'
        : isValid
          ? '#198754'
          : '#1857b6'
      : 'transparent',
    boxShadow: state.isFocused
      ? isInvalid
        ? '0 0 0 0.2rem rgba(253, 21, 13, 0.25)'
        : isValid
          ? '0 0 0 0.2rem rgba(25, 135, 84, 0.25)'
          : '0 0 0 2px rgba(36, 36, 127, 0.1)'
      : 'none',

    backgroundColor: state.isFocused
      ? isInvalid
        ? '0 0 0 0.2rem rgba(253, 21, 13, 0.25)'
        : isValid
          ? '0 0 0 0.2rem rgba(25, 135, 84, 0.25)'
          : '#f8fafc'
      : 'none',
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.82rem ',
  }),

  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: '0.375rem',
    overflow: 'hidden',
  }),

  menuList: (base) => ({
    ...base,
    padding: 0,
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#f1f3f5' : 'white',
    color: state.isSelected ? '#1b3761' : '#212529',
    fontWeight: state.isSelected ? 'bold' : 'normal',
    borderRadius: 0,
  }),

  singleValue: (base, state) => ({
    ...base,
    color: 'rgba(37, 42.92, 54.02, 0.681)',
  }),
})
