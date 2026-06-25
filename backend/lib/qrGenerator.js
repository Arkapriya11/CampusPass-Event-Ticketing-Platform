const QRCode = require('qrcode');

/**
 * Generate a QR code as a data URL (base64 PNG)
 * @param {string} data - The data to encode in the QR code
 * @returns {Promise<string>} Base64 data URL of the QR code image
 */
async function generateQRDataURL(data) {
  return await QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}

/**
 * Generate a QR code as a Buffer (PNG)
 * @param {string} data - The data to encode
 * @returns {Promise<Buffer>} PNG buffer
 */
async function generateQRBuffer(data) {
  return await QRCode.toBuffer(data, {
    width: 300,
    margin: 2,
    errorCorrectionLevel: 'H',
  });
}

/**
 * Generate a random 12-digit alphanumeric serial number
 * @returns {string} 12-character serial
 */
function generateSerial() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let serial = '';
  for (let i = 0; i < 12; i++) {
    serial += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return serial;
}

module.exports = { generateQRDataURL, generateQRBuffer, generateSerial };
