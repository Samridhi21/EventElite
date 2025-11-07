const nodemailer = require("nodemailer");
// const sgMail = require("@sendgrid/mail");
require("dotenv").config();


// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user : process.env.EMAIL_USER || "eventEliteDav@gmail.com",  // ✅ Use environment variables
        pass : process.env.EMAIL_PASS || "bsts ulfj ovmu tleo"       // 🔐 Store in .env (SECURITY RECOMMENDED)
    }
});

// Function to convert time to 12-hour AM/PM format
function formatTimeToAMPM(time) {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for midnight
    return `${formattedHour}:${minutes} ${ampm}`;
}

// Function to send email
function sendEmail(studentEmail, studentName, eventTitle, eventDescription, startDate, endDate, eventTime, eventVenue) {
    const formattedTime = formatTimeToAMPM(eventTime);

    const mailOptions = {
        from: '"EventElite Team" <eventEliteDav@gmail.com>',
        to: studentEmail,
        replyTo:  "eventelitedav@gmail.com",
        subject: "New Event Created 🎉",
        text: `Hello ${studentName},

We are excited to confirm your registration for "${eventTitle}" happening from ${startDate} to ${endDate} at ${eventVenue}.

🔹 Event Details:
- Title: ${eventTitle}
- Description: ${eventDescription}
- Start Date: ${startDate}
- End Date: ${endDate}
- Time: ${formattedTime}
- Venue: ${eventVenue}

If you have any questions, feel free to contact us.

Best Regards,  
EventElite Team  
DAV College Jalandhar`,

        html: `<p>Hello <strong>${studentName}</strong>,</p>
               <p>We are excited to confirm your registration for <b>${eventTitle}</b> happening from <b>${startDate}</b> to <b>${endDate}</b> at <b>${eventVenue}</b>.</p>
               <h3>🔹 Event Details:</h3>
               <ul>
                   <li><b>Title:</b> ${eventTitle}</li>
                   <li><b>Description:</b> ${eventDescription}</li>
                   <li><b>Date:</b> ${startDate}</li>
                   <li><b>Time:</b> ${formattedTime}</li>
                   <li><b>Venue:</b> ${eventVenue}</li>
               </ul>
               <p>If you have any questions, feel free to contact us.</p>
               <p>Best Regards,<br><b>EventElite Team</b><br>DAV College Jalandhar</p>`,

               headers: { "X-Mailer": "EventElite Mailer 1.0" },

    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(`❌ Failed to send email to ${studentEmail}:`, error.message);
        } else {
            console.log(`✅ Email sent to ${studentEmail}:`, info.response);
        }
    });
}

module.exports = {sendEmail};