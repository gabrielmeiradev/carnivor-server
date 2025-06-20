import axios from "axios";

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID!;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY!;
const ONESIGNAL_API_URL = "https://onesignal.com/api/v1/notifications";

export interface NotificationPayload {
  playerId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export class OneSignalNotificationHelper {
  static async sendNotification({
    playerId,
    title,
    message,
    data,
  }: NotificationPayload): Promise<void> {
    try {
      const payload = {
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: [playerId],
        headings: { pt: title },
        contents: { pt: message },
        data,
      };

      const response = await axios.post(ONESIGNAL_API_URL, payload, {
        headers: {
          Authorization: `Basic ${ONESIGNAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Notification sent:", response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error sending notification:",
          error.response?.data || error.message
        );
      } else {
        console.error("Error sending notification:", error);
      }
    }
  }
}
