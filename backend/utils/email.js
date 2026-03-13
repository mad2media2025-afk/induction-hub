// utils/email.js
// Sends transactional emails using Nodemailer

const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false, // true for port 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// ── ORDER CONFIRMATION EMAIL ──────────────────────────────────────
async function sendOrderConfirmationEmail({ to, name, orderId, items, total }) {
  const transporter = createTransporter();

  const itemRows = items.map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #eee">${item.brand} — ${item.name}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:center">${item.qty}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:right">₹${(item.price * item.qty).toLocaleString('en-IN')}</td>
    </tr>`).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif">
      <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
        
        <!-- Header -->
        <div style="background:#0a0a0a;padding:30px 40px;text-align:center">
          <div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:4px">
            INDUCT<span style="color:#e85d04">A</span>
          </div>
          <div style="color:#6b6560;font-size:13px;margin-top:4px">Premium Electric Induction Store</div>
        </div>

        <!-- Body -->
        <div style="padding:40px">
          <h2 style="color:#0a0a0a;margin:0 0 8px">Order Confirmed! ✅</h2>
          <p style="color:#6b6560;margin:0 0 24px">Hi ${name}, your order has been placed successfully.</p>

          <div style="background:#fff8f5;border:1px solid #f48c42;border-radius:8px;padding:16px;margin-bottom:24px">
            <div style="font-size:12px;color:#6b6560;text-transform:uppercase;letter-spacing:1px">Order ID</div>
            <div style="font-size:18px;font-weight:700;color:#e85d04;margin-top:4px">${orderId}</div>
          </div>

          <!-- Items Table -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="padding:10px;text-align:left;font-size:12px;color:#6b6560;text-transform:uppercase">Product</th>
                <th style="padding:10px;text-align:center;font-size:12px;color:#6b6560;text-transform:uppercase">Qty</th>
                <th style="padding:10px;text-align:right;font-size:12px;color:#6b6560;text-transform:uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <!-- Total -->
          <div style="background:#0a0a0a;border-radius:8px;padding:16px;display:flex;justify-content:space-between">
            <span style="color:#c9c4bc;font-weight:600">Total Paid</span>
            <span style="color:#e85d04;font-size:20px;font-weight:900">₹${total.toLocaleString('en-IN')}</span>
          </div>

          <p style="color:#6b6560;margin:24px 0 0;font-size:14px">
            Your order is being processed and will be shipped within 1–2 business days. 
            You'll receive a shipping confirmation with tracking details shortly.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f5f5f5;padding:20px 40px;text-align:center;border-top:1px solid #eee">
          <p style="color:#6b6560;font-size:12px;margin:0">
            Questions? Reply to this email or contact support@inducta.in<br>
            © 2026 INDUCTA · Made with ⚡ for a gas-free India
          </p>
        </div>
      </div>
    </body>
    </html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `✅ Order Confirmed — ${orderId} | INDUCTA`,
    html,
  });

  console.log(`📧 Order confirmation sent to ${to}`);
}

module.exports = { sendOrderConfirmationEmail };
