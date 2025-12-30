const SibApiV3Sdk = require('sib-api-v3-sdk');
const dotenv = require('dotenv');
dotenv.config();

const sendOtpEmail = async (email, otp) => {
    // 1. Setup Brevo Client
    let defaultClient = SibApiV3Sdk.ApiClient.instance;
    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // 2. Configure Email Content
    sendSmtpEmail.subject = "Your GearUp Verification Code";
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2563EB; text-align: center;">Welcome to GearUp!</h2>
            <p style="font-size: 16px; color: #333;">Hello,</p>
            <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for account registration is:</p>
            <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; background-color: #f0f9ff; color: #0284c7; padding: 10px 20px; border-radius: 8px; letter-spacing: 5px;">
                    ${otp}
                </span>
            </div>
            <p style="font-size: 14px; color: #666;">This code is valid for 5 minutes. Please do not share it with anyone.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">© 2025 GearUp Mobile Essentials</p>
        </div>
    `;
    
    // 3. Set Sender and Receiver
    // Ensure SENDER_EMAIL is in your .env file
    sendSmtpEmail.sender = { "name": "GearUp Support", "email": process.env.SENDER_EMAIL };
    sendSmtpEmail.to = [{ "email": email }];

    // 4. Send
    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Email sent to ${email}`);
    } catch (error) {
        console.error("❌ Error sending email:", error);
        throw new Error("Failed to send OTP email.");
    }
};

module.exports = sendOtpEmail;