import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import ReportsService from '../../services/reports.service'
import Show from './reports/Show'

const Reports = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'Cronograma de Produccion' })
  const [reports, setReports] = useState()
  const [report, setReport] = useState()
  const [models, setModels] = useState()
  const [errors, setErrors] = useState(null)
  const [processes, setProcesses] = useState()
  const [loading, setLoading] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [statusses, setStatusses] = useState()
  const [statussesProcess, setStatussesProcess] = useState()
  const [destinations, setDestinations] = useState()
  const [data, setData] = useState()
  const [dataFields, setDataFields] = useState()

  useEffect(() => {
    if (reports) return
    fetchReports()
  }, [reports])

  const fetchReports = async (params) => {
    try {
      setLoading(true)
      setErrors(null)
      const response = await ReportsService.all(params)
      setReports(response.data.reports)
    } catch (error) {
      setErrors(error?.errors || error)
    } finally {
      setLoading(false)
    }
  }

  const findReport = async (report_id) => {
    try {
      setLoading(true)
      setErrors(null)
      const response = await ReportsService.find(report_id)
      setReport(response.data.report)
      setModels(response.data.model_type)

      console.log(response)

      setStatusses(
        Array.isArray(response.data.statusses[response.data.report.settings.model])
          ? response.data.statusses[response.data.report.settings.model].map((item) => ({
              label: item.toUpperCase(),
              value: item,
            }))
          : [],
      )

      setStatussesProcess(
        Array.isArray(response.data.processes_status['App\\Models\\Process'])
          ? response.data.processes_status['App\\Models\\Process'].map((item) => ({
              label: item.toUpperCase(),
              value: item,
            }))
          : [],
      )

      setDestinations(
        Array.isArray(response.data.destinations)
          ? response.data.destinations.map((item) => ({
              label: item.toUpperCase(),
              value: item,
            }))
          : [],
      )
    } catch (error) {
      setErrors(error?.errors || error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (report_id, params) => {
    try {
      setLoading(true)
      setErrors(null)
      const response = await ReportsService.generate(report_id, params)
      setData(response.data.data)
      setDataFields(response.data.fields)
    } catch (error) {
      setErrors(error?.errors || error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (report_id, params, name) => {
    try {
      setLoadingExport(true)
      setErrors(null)
      const response = await ReportsService.export_report(report_id, params, name)
      setData(response.data)
    } catch (error) {
      setErrors(error?.errors || error)
      throw error
    } finally {
      setLoadingExport(false)
    }
  }

  const renderView = () => {
    switch (view.name) {
      default:
        return (
          <Show
            reports={reports}
            loading={loading}
            loading_export={loadingExport}
            fetchReports={fetchReports}
            errors={errors}
            findReport={findReport}
            report={report}
            statusses={statusses}
            statusses_process={statussesProcess}
            destinations={destinations}
            models={models}
            generateReport={generateReport}
            exportReport={exportReport}
            data={data}
            data_fields={dataFields}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Reports
