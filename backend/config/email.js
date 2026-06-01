const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('Email skipped - GMAIL_USER or GMAIL_APP_PASSWORD not set');
    return;
  }
  try {
    await transporter.sendMail({
      from: '"SportsMatch" <' + process.env.GMAIL_USER + '>',
      to,
      subject,
      html,
    });
    console.log('Email sent to ' + to);
  } catch (err) {
    console.error('Email failed:', err.message);
  }
};

const requestReceivedEmail = (receiverName, receiverEmail, senderName, game, venue, date, time, message) => {
  return sendEmail({
    to: receiverEmail,
    subject: senderName + ' wants to play ' + game + ' with you!',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:12px">
        <h2 style="color:#e8470a">New Play Request on SportsMatch!</h2>
        <p>Hi ${receiverName},</p>
        <p><strong>${senderName}</strong> has sent you a play request!</p>
        <div style="background:#fff5f1;padding:16px;border-radius:8px;margin:16px 0">
          <p><strong>Game:</strong> ${game}</p>
          <p><strong>Venue:</strong> ${venue}</p>
          ${date ? '<p><strong>Date:</strong> ' + date + '</p>' : ''}
          ${time ? '<p><strong>Time:</strong> ' + time + '</p>' : ''}
          ${message ? '<p><strong>Message:</strong> ' + message + '</p>' : ''}
        </div>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/requests" 
           style="background:#e8470a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:8px">
          View Request
        </a>
        <p style="color:#888;font-size:12px;margin-top:20px">SportsMatch - Connect. Play. Win.</p>
      </div>
    `,
  });
};

const requestAcceptedEmail = (senderName, senderEmail, receiverName, game, venue) => {
  return sendEmail({
    to: senderEmail,
    subject: receiverName + ' accepted your play request!',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:12px">
        <h2 style="color:#10b981">Play Request Accepted!</h2>
        <p>Hi ${senderName},</p>
        <p>Great news! <strong>${receiverName}</strong> accepted your play request for <strong>${game}</strong>.</p>
        <p>Meet up at <strong>${venue}</strong> and have a great game!</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/requests"
           style="background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:8px">
          View Details
        </a>
        <p style="color:#888;font-size:12px;margin-top:20px">SportsMatch - Connect. Play. Win.</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, requestReceivedEmail, requestAcceptedEmail };
