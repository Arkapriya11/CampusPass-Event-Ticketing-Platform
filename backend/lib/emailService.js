const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const { generateHTMLTemplate } = require('./pdfTemplate');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Generate a PDF ticket as a Buffer using Puppeteer
 * @param {object} ticketData - Ticket information
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generateTicketPDF(ticketData) {
  // Ensure ticketData has UTF-8 clean date and amount
  const cleanedData = { ...ticketData };
  if (cleanedData.eventDate) {
    // Re-format to ensure no weird chars (e.g., removing any unexpected locale artifacts)
    const d = new Date(ticketData.eventDate);
    if (!isNaN(d.getTime())) {
      cleanedData.eventDate = d.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).replace(/\u202F/g, ' '); // remove narrow no-break space
    }
  }

  const html = generateHTMLTemplate(cleanedData);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  // Ensure we render using the correct encoding
  // The HTML itself has <meta charset="UTF-8" />
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  // Create a PDF of exactly 380px roughly + margins for the ticket layout or just generate letter
  const pdfBuffer = await page.pdf({
    printBackground: true,
    width: '440px',
    height: '660px',
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  
  await browser.close();
  return pdfBuffer;
}

/**
 * Send ticket email with PDF attachment
 * @param {string} toEmail - Recipient email
 * @param {object} ticketData - Ticket information (includes eventName, serial, qrDataURL, etc.)
 */
async function sendTicketEmail(toEmail, ticketData) {
  const pdfBuffer = await generateTicketPDF(ticketData);

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎟️ CampusPass</h1>
        <p style="color: #e0e7ff; margin: 5px 0 0;">Your Ticket is Ready!</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #1e1b4b; margin-top: 0;">${ticketData.eventName || 'Event'}</h2>
        ${ticketData.venue ? `<p style="color: #6b7280;">📍 ${ticketData.venue}</p>` : ''}
        ${ticketData.eventDate ? `<p style="color: #6b7280;">📅 ${ticketData.eventDate}</p>` : ''}
        
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Name:</td><td style="color: #111827;">${ticketData.buyerName}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Ticket Type:</td><td style="color: #111827;">${ticketData.ticketType}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Serial:</td><td style="color: #6366f1; font-weight: 700; font-family: monospace; font-size: 16px;">${ticketData.serial}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Payment:</td><td style="color: #111827;">${ticketData.paymentMethod}</td></tr>
          </table>
        </div>

        ${ticketData.qrDataURL ? `
        <div style="text-align: center; margin: 20px 0;">
          <img src="${ticketData.qrDataURL}" alt="Ticket QR Code" style="width: 200px; height: 200px;" />
          <p style="color: #6b7280; font-size: 12px; margin-top: 8px;">Scan this QR code at the venue for entry</p>
        </div>
        ` : ''}

        <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 12px; margin-top: 20px;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">⚠️ This ticket is valid for one-time entry only. Do not share your QR code.</p>
        </div>
      </div>
      <div style="background: #f1f5f9; padding: 15px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">Powered by CampusPass</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"CampusPass" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `🎟️ Your Ticket for ${ticketData.eventName || 'Event'} — ${ticketData.serial}`,
    html: htmlContent,
    attachments: [
      {
        filename: `ticket-${ticketData.serial}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = { sendTicketEmail, generateTicketPDF };
