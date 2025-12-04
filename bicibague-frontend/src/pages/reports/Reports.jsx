import { useState } from 'react';
// components
import { SubHeader } from '@layouts/SubHeader';
// API
import { useGenerateReportMutation } from '@api/reports';
// icons
import {
  FaFileAlt,
  FaFile,
  FaFilePdf,
  FaFileExcel,
  FaCalendarAlt,
  FaDownload,
  FaExternalLinkAlt,
  FaChartBar,
  FaSpinner,
} from 'react-icons/fa';
// styles
import './repots.scss';

const REPORT_TYPES = [
  { value: 'usage_frequency', label: 'Frecuencia de Uso' },
  { value: 'stations_demand', label: 'Demanda de Estaciones' },
  { value: 'bike_demand_by_type', label: 'Demanda por Tipo de Bicicleta' },
  { value: 'trips_per_day', label: 'Viajes por Día' },
  { value: 'maintenance', label: 'Bicicletas en Mantenimiento' },
  { value: 'estaciones', label: 'Estaciones' },
  { value: 'viajes', label: 'Viajes' },
  { value: 'bicicletas', label: 'Bicicletas' },
  { value: 'reservas', label: 'Reservas' },
];

const FILE_FORMATS = [
  { value: 'pdf', label: 'PDF', icon: FaFilePdf },
  { value: 'xlsx', label: 'Excel', icon: FaFileExcel },
];

export const Reports = () => {
  const [reportName, setReportName] = useState('usage_frequency');
  const [reportType, setReportType] = useState('pdf');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [error, setError] = useState('');

  const generateReportMutation = useGenerateReportMutation();

  // Obtener fecha actual en formato YYYY-MM-DD
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Validar fechas
  const validateDates = () => {
    // Si solo se proporciona una fecha, requerir ambas
    if ((dateFrom && !dateTo) || (!dateFrom && dateTo)) {
      setError('Por favor selecciona ambas fechas o deja ambas vacías');
      return false;
    }

    // Si ambas fechas están proporcionadas, validar
    if (dateFrom && dateTo) {
      if (new Date(dateFrom) > new Date(dateTo)) {
        setError('La fecha inicial debe ser anterior a la fecha final');
        return false;
      }

      if (new Date(dateTo) > new Date()) {
        setError('La fecha final no puede ser futura');
        return false;
      }
    }

    setError('');
    return true;
  };

  // Generar reporte
  const handleGenerateReport = async () => {
    if (!validateDates()) return;

    setIsGenerating(true);
    setError('');
    setGeneratedReport(null);

    try {
      const requestBody = {
        reportType,
        reportName,
        filters:
          dateFrom && dateTo
            ? {
                dateFrom,
                dateTo,
              }
            : {},
      };

      console.log('Request Body:', requestBody);

      const response = await generateReportMutation.post(requestBody);

      if (response?.data) {
        // La respuesta contiene el archivo en formato base64 o blob
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);

        setGeneratedReport({
          url,
          type: reportType,
          name: `${reportName}_${dateFrom}_${dateTo}.${reportType}`,
        });
      } else {
        setError('No se recibió el archivo del servidor');
      }
    } catch (err) {
      setError(err.message || 'Error al generar el reporte');
      console.error('Error generating report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Descargar reporte
  const handleDownload = () => {
    if (!generatedReport) return;

    const link = document.createElement('a');
    link.href = generatedReport.url;
    link.download = generatedReport.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Abrir reporte en nueva pestaña
  const handleOpenInNewTab = () => {
    if (!generatedReport) return;
    window.open(generatedReport.url, '_blank');
  };

  // Limpiar reporte generado
  const handleNewReport = () => {
    if (generatedReport?.url) {
      window.URL.revokeObjectURL(generatedReport.url);
    }
    setGeneratedReport(null);
    setError('');
  };

  return (
    <div className="reports-container">
      <SubHeader pageTitle="Generación de Reportes" />
      <div className="reports-content">
        {/* Header */}
        {/* <div className="reports-header">
          <div className="header-icon">
            <FaChartBar />
          </div>
          <div className="header-text">
            <h1>Generación de Reportes</h1>
            <p>Genera reportes personalizados sobre el uso del sistema</p>
          </div>
        </div> */}

        {/* Formulario de generación */}
        {!generatedReport ? (
          <div className="report-form">
            {/* Tipo de reporte */}
            <div className="form-section">
              <label className="form-label">
                <FaFileAlt />
                Tipo de Reporte
              </label>
              <select
                className="form-select"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              >
                {REPORT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Formato de archivo */}
            <div className="form-section">
              <label className="form-label">
                <FaFile />
                Formato de Archivo
              </label>
              <div className="format-options">
                {FILE_FORMATS.map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.value}
                      type="button"
                      className={`format-option ${
                        reportType === format.value ? 'active' : ''
                      }`}
                      onClick={() => setReportType(format.value)}
                    >
                      <Icon className="format-icon" />
                      <span>{format.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rango de fechas */}
            <div className="form-section">
              <label className="form-label">
                <FaCalendarAlt />
                Rango de Fechas
              </label>
              <div className="date-inputs">
                <div className="date-input-group">
                  <label htmlFor="dateFrom">Desde</label>
                  <input
                    type="date"
                    id="dateFrom"
                    className="date-input"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    max={getTodayDate()}
                  />
                </div>
                <div className="date-input-group">
                  <label htmlFor="dateTo">Hasta</label>
                  <input
                    type="date"
                    id="dateTo"
                    className="date-input"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    max={getTodayDate()}
                  />
                </div>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="error-message">
                <span>{error}</span>
              </div>
            )}

            {/* Botón de generar */}
            <button
              className="btn-generate"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <FaSpinner className="btn-icon spinning" />
                  Generando Reporte...
                </>
              ) : (
                <>
                  <FaChartBar className="btn-icon" />
                  Generar Reporte
                </>
              )}
            </button>
          </div>
        ) : (
          /* Resultado del reporte */
          <div className="report-result">
            <div className="result-card">
              <div className="result-icon">
                {reportType === 'pdf' ? (
                  <FaFilePdf className="file-icon pdf" />
                ) : (
                  <FaFileExcel className="file-icon excel" />
                )}
              </div>
              <div className="result-info">
                <h2>Reporte Generado Exitosamente</h2>
                <p className="result-filename">{generatedReport.name}</p>
                <p className="result-details">
                  Tipo:{' '}
                  {REPORT_TYPES.find((t) => t.value === reportName)?.label} |
                  Formato: {reportType.toUpperCase()} | Período: {dateFrom} a{' '}
                  {dateTo}
                </p>
              </div>
            </div>

            <div className="result-actions">
              <button
                className="btn-action btn-download"
                onClick={handleDownload}
              >
                <FaDownload className="btn-icon" />
                Descargar
              </button>
              {reportType === 'pdf' && (
                <button
                  className="btn-action btn-open"
                  onClick={handleOpenInNewTab}
                >
                  <FaExternalLinkAlt className="btn-icon" />
                  Abrir en Nueva Pestaña
                </button>
              )}
            </div>

            <button className="btn-new-report" onClick={handleNewReport}>
              Generar Nuevo Reporte
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
