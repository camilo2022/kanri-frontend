import React, { useMemo } from 'react'
import ManagementCollectionTechnicalSheetRow from './ManegementCollectionTechnicalSheetRow'

const ManagementCollectionTechnicalSheetBody = ({
  technical_sheets,
  trademark,
  category,
  subcategory,
  setData,
  garmentTypes,
  washTones,
  bootTypes,
  supplyTypes,
  processes,
  supplies,
  onOpenModal,
  modified,
  setModified,
  validated,
  errors,
}) => {
  const rows = useMemo(() => {
    return Object.values(technical_sheets).map((sheet, index) => (
      <ManagementCollectionTechnicalSheetRow
        key={sheet.id}
        sheetId={sheet.id}
        sheet={sheet}
        index={index}
        trademark={trademark}
        category={category}
        subcategory={subcategory}
        setData={setData}
        garmentTypes={garmentTypes}
        washTones={washTones}
        bootTypes={bootTypes}
        supplyTypes={supplyTypes}
        processes={processes}
        supplies={supplies}
        onOpenModal={onOpenModal}
        modified={modified[sheet.id]}
        setModified={setModified}
        validated={validated?.[sheet.id]}
        errors={errors?.[sheet.id]}
      />
    ))
  }, [
    technical_sheets,
    garmentTypes,
    washTones,
    bootTypes,
    supplyTypes,
    processes,
    supplies,
    validated,
    errors,
  ])

  return <>{rows}</>
}
export default React.memo(ManagementCollectionTechnicalSheetBody)
