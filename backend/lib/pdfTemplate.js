const generateHTMLTemplate = (ticketData) => {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #0B0F1A;
  color: #E5E7EB;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.ticket {
  width: 380px;
  padding: 24px;
  border-radius: 20px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 0 40px rgba(139,92,246,0.4);
  text-align: center;
}

.title { font-size: 20px; font-weight: bold; color: #a78bfa; }
.event { font-size: 24px; font-weight: bold; }
.sub { font-size: 14px; color: #9ca3af; }

.divider {
  margin: 16px 0;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin: 6px 0;
}

.qr { margin-top: 20px; }

.serial {
  margin-top: 10px;
  font-weight: bold;
  color: #a78bfa;
}

.footer {
  margin-top: 12px;
  font-size: 12px;
  color: #6b7280;
} 
</style>
</head>
<body>
<div class="ticket">
  <div class="title">CampusPass</div>

  <div class="event">${ticketData.eventName}</div>
  <div class="sub">${ticketData.venue} • ${ticketData.eventDate}</div>

  <div class="divider"></div>

  <div class="row"><span>Name</span><span>${ticketData.buyerName}</span></div>
  <div class="row"><span>Email</span><span>${ticketData.buyerEmail}</span></div>
  <div class="row"><span>Phone</span><span>${ticketData.buyerPhone || ''}</span></div>

  <div class="divider"></div>

  <div class="row"><span>Type</span><span>${ticketData.ticketType}</span></div>
  <div class="row"><span>Amount</span><span>${ticketData.amount ? '₹' + ticketData.amount : 'N/A'}</span></div>
  <div class="row"><span>Payment</span><span>${ticketData.paymentMethod}</span></div>

  <div class="divider"></div>

  <div class="qr">
    <img src="${ticketData.qrDataURL}" width="160" />
  </div>

  <div class="serial">${ticketData.serial}</div>

  <div class="footer">
    Valid for one-time entry only
  </div>
</div>
</body>
</html>`;
};

module.exports = { generateHTMLTemplate };
