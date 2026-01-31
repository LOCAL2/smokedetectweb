import type { SensorData, SensorHistory, SensorMaxValue } from '../types/sensor';
import type { NotificationItem } from '../context/NotificationContext';


export const exportSensorsToCSV = (sensors: SensorData[], filename: string = 'sensors') => {
  const headers = ['ID', 'Name', 'Location', 'Value (PPM)', 'Status', 'Last Update'];
  const rows = sensors.map((s) => [
    s.id,
    s.name,
    s.location,
    s.value.toString(),
    s.isOnline ? 'Online' : 'Offline',
    s.timestamp ? new Date(s.timestamp).toLocaleString('th-TH') : '-',
  ]);

  downloadCSV([headers, ...rows], `${filename}_${formatDateForFile()}.csv`);
};


export const exportHistoryToCSV = (history: SensorHistory[], filename: string = 'history') => {
  const headers = ['Timestamp', 'Sensor ID', 'Sensor Name', 'Location', 'Value (PPM)'];
  const rows = history.map((h) => [
    new Date(h.timestamp).toLocaleString('th-TH'),
    h.sensorId || '-',
    h.sensorName || '-',
    h.location || '-',
    h.value.toString(),
  ]);

  downloadCSV([headers, ...rows], `${filename}_${formatDateForFile()}.csv`);
};


export const exportStatsToCSV = (stats: SensorMaxValue[], filename: string = 'statistics') => {
  const headers = ['Sensor ID', 'Name', 'Location', 'Max (PPM)', 'Min (PPM)', 'Avg (PPM)'];
  const rows = stats.map((s) => [
    s.id,
    s.name,
    s.location,
    s.maxValue.toFixed(2),
    s.minValue.toFixed(2),
    s.avgValue.toFixed(2),
  ]);

  downloadCSV([headers, ...rows], `${filename}_${formatDateForFile()}.csv`);
};


export const exportNotificationsToCSV = (
  notifications: NotificationItem[],
  filename: string = 'alerts'
) => {
  const headers = ['Timestamp', 'Type', 'Sensor', 'Location', 'Value (PPM)', 'Message'];
  const rows = notifications.map((n) => [
    new Date(n.timestamp).toLocaleString('th-TH'),
    n.type.toUpperCase(),
    n.sensorName,
    n.location,
    n.value.toString(),
    n.message,
  ]);

  downloadCSV([headers, ...rows], `${filename}_${formatDateForFile()}.csv`);
};


const downloadCSV = (data: string[][], filename: string) => {
  const csvContent = data
    .map((row) =>
      row
        .map((cell) => {
          
          const escaped = cell.replace(/"/g, '""');
          return /[,\n"]/.test(cell) ? `"${escaped}"` : escaped;
        })
        .join(',')
    )
    .join('\n');

  // Add BOM for UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Format date for filename
const formatDateForFile = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
};

// Generate PDF report (simple HTML to print)
export const generatePDFReport = (
  sensors: SensorData[],
  stats: SensorMaxValue[],
  title: string = 'Smoke Detection Report'
) => {
  const reportDate = new Date().toLocaleString('th-TH');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #333; }
        h1 { color: #1E293B; border-bottom: 2px solid #3B82F6; padding-bottom: 10px; }
        h2 { color: #475569; margin-top: 30px; }
        .meta { color: #64748B; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #E2E8F0; padding: 12px; text-align: left; }
        th { background: #F1F5F9; font-weight: 600; }
        tr:nth-child(even) { background: #F8FAFC; }
        .status-online { color: #10B981; }
        .status-offline { color: #EF4444; }
        .value-safe { color: #10B981; }
        .value-warning { color: #F59E0B; }
        .value-danger { color: #EF4444; font-weight: bold; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; color: #94A3B8; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="meta">Generated: ${reportDate}</p>
      
      <h2>Current Sensor Status</h2>
      <table>
        <thead>
          <tr>
            <th>Sensor</th>
            <th>Location</th>
            <th>Value (PPM)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${sensors
            .map(
              (s) => `
            <tr>
              <td>${s.name}</td>
              <td>${s.location}</td>
              <td class="${s.value < 50 ? 'value-safe' : s.value < 200 ? 'value-warning' : 'value-danger'}">${s.value}</td>
              <td class="${s.isOnline ? 'status-online' : 'status-offline'}">${s.isOnline ? 'Online' : 'Offline'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <h2>24-Hour Statistics</h2>
      <table>
        <thead>
          <tr>
            <th>Sensor</th>
            <th>Location</th>
            <th>Max (PPM)</th>
            <th>Min (PPM)</th>
            <th>Avg (PPM)</th>
          </tr>
        </thead>
        <tbody>
          ${stats
            .map(
              (s) => `
            <tr>
              <td>${s.name}</td>
              <td>${s.location}</td>
              <td>${s.maxValue.toFixed(1)}</td>
              <td>${s.minValue.toFixed(1)}</td>
              <td>${s.avgValue.toFixed(1)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Smoke Detection System - Auto-generated Report</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
};
