
import { AttendanceRecord, User } from '../types';
// @ts-ignore
const { jsPDF } = window.jspdf;

export const exportService = {
  exportToCSV: (data: any[], filename: string, headers?: string[]) => {
    if (data.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    const columnHeaders = headers || Object.keys(data[0]);
    const csvRows = [
      columnHeaders.join(','),
      ...data.map(row =>
        columnHeaders
          .map(fieldName => {
            const value = (row as any)[fieldName];
            if (typeof value === 'object' && value !== null) {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
             return `"${String(value ?? '').replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  exportReportToPDF: (
    data: any[], 
    title: string, 
    columnConfig: { header: string, dataKey: keyof any }[],
    options: {
        subtitle?: string
    } = {}
) => {
    if (data.length === 0) {
        alert('Tidak ada data untuk diekspor.');
        return;
    }
    const doc = new jsPDF();
    
    // Title and Subtitle
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    if (options.subtitle) {
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(options.subtitle, 14, 29);
    }


    const tableColumn = columnConfig.map(c => c.header);
    const tableRows: any[][] = [];

    data.forEach(item => {
        const rowData = columnConfig.map(c => {
            let value = item[c.dataKey];
            if (c.dataKey === 'timestamp' && typeof value === 'number') {
                return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short'});
            }
             if (c.dataKey === 'distance' && typeof value === 'number') {
                return `${value.toFixed(2)} km`;
            }
            if (c.dataKey === 'isWithinRadius' && typeof value === 'boolean') {
                return value ? 'Dalam Area' : 'Luar Area';
            }
            if (c.dataKey === 'keteranganIzin' && c.dataKey in item) {
                return `${item['keterangan']} (${value || '-'})`;
            }
            if (c.dataKey === 'address') {
                return value || 'N/A';
            }
            if (c.dataKey === 'remark') {
                return value || 'N/A';
            }
            return value ?? 'N/A';
        });
        tableRows.push(rowData);
    });

    // @ts-ignore
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
    });
    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  },
};