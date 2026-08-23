import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const normalizeGhanaPhoneNumber = (phone) => {
  const value = String(phone || "")
    .trim()
    .replace(/[\s-]/g, "");

  if (/^0\d{9}$/.test(value)) return `+233${value.slice(1)}`;
  if (/^233\d{9}$/.test(value)) return `+${value}`;
  if (/^\+233\d{9}$/.test(value)) return value;

  throw new Error("SMS recipients must use a valid Ghanaian phone number.");
};

const sendSMS = async (to, message) => {
  const { SMS_BASE_URL, SMS_API_KEY, SMS_SENDER_ID } = process.env;

  if (!SMS_BASE_URL || !SMS_API_KEY || !SMS_SENDER_ID) {
    throw new Error(
      "SMS is not configured. Set SMS_BASE_URL, SMS_API_KEY, and SMS_SENDER_ID in server/.env.",
    );
  }

  if (!to || !message) {
    throw new Error("An SMS recipient and message are required.");
  }

  const recipient = normalizeGhanaPhoneNumber(to);

  try {
    const response = await axios.post(
      SMS_BASE_URL,
      {
        sender: SMS_SENDER_ID,
        message,
        recipients: [recipient],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": SMS_API_KEY,
        },
        timeout: 15000,
      },
    );

    console.log(`✅ SMS sent to ${to}: ${message}`);
    console.log("Provider response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ SMS sending failed:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export default sendSMS;
