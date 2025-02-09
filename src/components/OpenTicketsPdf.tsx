import html2pdf from 'html2pdf.js';
import { Ticket } from '../types/ticket';

const generateOpenTicketsPdf = async (tickets: Ticket[]) => {
  const openTickets = tickets.filter(ticket => ticket.status === 'Open');

  if (!openTickets || openTickets.length === 0) {
    console.error('No open tickets available');
    return;
  }

  const container = document.createElement('div');
  
  const content = `
    <style>
      .pdf-container {
        padding: 30px;
        font-family: Arial, sans-serif;
        background: white;
      }
      .header {
        margin-bottom: 30px;
        text-align: center;
      }
      .title {
        font-size: 24px;
        color: #333;
        margin: 0 0 10px 0;
      }
      .subtitle {
        color: #666;
        margin: 0;
        font-size: 14px;
      }
      .tickets-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        font-size: 10px;
      }
      .tickets-table th,
      .tickets-table td {
        padding: 8px 6px;
        text-align: left;
        border: 1px solid #ddd;
        word-break: break-word;
      }
      .tickets-table th {
        background-color: #f8f9fa;
        font-weight: bold;
        color: #333;
        white-space: nowrap;
      }
      .tickets-table tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      .severity {
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: 500;
      }
      .severity-critical {
        background-color: #fee2e2;
        color: #dc2626;
      }
      .severity-high {
        background-color: #ffedd5;
        color: #ea580c;
      }
      .severity-medium {
        background-color: #fef9c3;
        color: #ca8a04;
      }
      .severity-low {
        background-color: #dcfce7;
        color: #16a34a;
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
    </style>
    <div class="pdf-container">
      <div class="header">
        <h1 class="title">Open Tickets Report</h1>
        <p class="subtitle">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        <p class="subtitle">Total Open Tickets: ${openTickets.length}</p>
      </div>

      <table class="tickets-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Sender</th>
            <th>Location</th>
            <th>Date</th>
            <th>Time</th>
            <th>Severity</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${openTickets.map(ticket => `
            <tr>
              <td>#${ticket.id}</td>
              <td>${ticket.title}</td>
              <td>${ticket.sender}</td>
              <td>${ticket.location}</td>
              <td>${ticket.date}</td>
              <td>${ticket.time}</td>
              <td>
                <span class="severity severity-${ticket.severity.toLowerCase()}">
                  ${ticket.severity}
                </span>
              </td>
              <td>${ticket.notes || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Arab Emergency Ticketing System - Confidential</p>
      </div>
    </div>
  `;

  container.innerHTML = content;
  document.body.appendChild(container);

  try {
    const opt = {
      margin: 0.5,
      filename: 'open-tickets-report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().from(container).set(opt).save();
  } finally {
    document.body.removeChild(container);
  }
};

export default generateOpenTicketsPdf;