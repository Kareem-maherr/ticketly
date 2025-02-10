import html2pdf from "html2pdf.js";
import { Ticket } from "../types/ticket";

const generateOpenTicketsPdf = async (tickets: Ticket[]) => {
  const openTickets = tickets.filter((ticket) => ticket.status === "Open");

  if (!openTickets || openTickets.length === 0) {
    console.error("No open tickets available");
    return;
  }

  const container = document.createElement("div");

  const content = `
    <style>
      @page {
        margin: 1cm;
      }
      
      .pdf-container {
        font-family: Arial, sans-serif;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }

      .header {
        background-color: #EE1C25;
        color: white;
        padding: 20px;
        margin-bottom: 30px;
        border-radius: 5px;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .title {
        font-size: 32px;
        margin: 0;
      }

      .date {
        font-size: 14px;
      }

      .info-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
      }

      .info-box {
        background-color: #f8f9fa;
        padding: 20px;
        border-radius: 5px;
        width: 45%;
      }

      .info-box h3 {
        margin: 0 0 10px 0;
        color: #EE1C25;
      }

      .info-box p {
        margin: 5px 0;
        line-height: 1.4;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
      }

      th {
        background-color: #EE1C25;
        color: white;
        padding: 12px;
        text-align: left;
      }

      td {
        padding: 12px;
        border-bottom: 1px solid #ddd;
      }

      tr:nth-child(even) {
        background-color: #f8f9fa;
      }

      .total-section {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
      }

      .total-box {
        background-color: #f8f9fa;
        padding: 20px;
        border-radius: 5px;
        width: 300px;
      }

      .total-row {
        display: flex;
        justify-content: space-between;
        margin: 5px 0;
      }

      .total-row.final {
        font-weight: bold;
        border-top: 2px solid #ddd;
        padding-top: 10px;
        margin-top: 10px;
      }
    </style>

    <div class="pdf-container">
      <div class="header">
        <div class="header-content">
          <h1 class="title">Open Tickets</h1>
          <div class="date">Date: ${new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-box">
          <h3>Invoiced To:</h3>
          <p>
            Alex Farnandes<br>
            450 E 96th St, Indianapolis, WRHX+8Q<br>
            IN 46240, United States
          </p>
        </div>
        <div class="info-box">
          <h3>Pay To:</h3>
          <p>
            Payment Info:<br>
            Account: 1234 5678 9012<br>
            A/C Name: Alex Farnandes<br>
            Email: info@invar.com
          </p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>SL</th>
            <th>Item Description</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${openTickets.map((ticket, index) => `
            <tr>
              <td>${(index + 1).toString().padStart(2, '0')}</td>
              <td>${ticket.title}</td>
              <td>$${ticket.price?.toFixed(2) || '0.00'}</td>
              <td>${ticket.quantity || 1}</td>
              <td>$${((ticket.price || 0) * (ticket.quantity || 1)).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-box">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${openTickets.reduce((sum, ticket) => 
              sum + ((ticket.price || 0) * (ticket.quantity || 1)), 0).toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax (10%):</span>
            <span>$${(openTickets.reduce((sum, ticket) => 
              sum + ((ticket.price || 0) * (ticket.quantity || 1)), 0) * 0.1).toFixed(2)}</span>
          </div>
          <div class="total-row final">
            <span>Total:</span>
            <span>$${(openTickets.reduce((sum, ticket) => 
              sum + ((ticket.price || 0) * (ticket.quantity || 1)), 0) * 1.1).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = content;
  document.body.appendChild(container);

  try {
    const opt = {
      margin: 1,
      filename: "open-tickets-report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
      },
      jsPDF: { unit: "cm", format: "a4", orientation: "portrait" }
    };

    await html2pdf().from(container).set(opt).save();
  } finally {
    document.body.removeChild(container);
  }
};

export default generateOpenTicketsPdf;