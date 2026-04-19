import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_APP_PASSWORD, 
  },
});

export const sendDigitalReceipt = async (userEmail: string, orderDetails: any) => {
  try {
   
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4CAF50;">Payment Successful!</h2>
        <p>Thank you for shopping with Bazar Koro.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
          <h3>Receipt Summary:</h3>
          <p><strong>Order ID:</strong> ${orderDetails._id}</p>
          <p><strong>Total Amount:</strong> Tk ${orderDetails.totalAmount}</p>
          <p><strong>Status:</strong> Paid</p>
        </div>
        <p>Your items are being prepared for shipping!</p>
      </div>
    `;

    // 2. Send the email
    const info = await transporter.sendMail({
      from: `"Bazar Koro" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Your Digital Receipt - Bazar Koro",
      html: emailHTML,
    });

    console.log("Receipt sent successfully: %s", info.messageId);
  } catch (error) {
    console.error("Error sending receipt:", error);
  }
};