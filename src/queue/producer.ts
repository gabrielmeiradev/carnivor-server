import { OneSignalNotificationHelper } from "../helpers/notification/oneSignalNotification";
import { addNotificationToQueue } from "./queue";

export async function notifyUser(
  playerId: string,
  title: string,
  message: string
) {
  await OneSignalNotificationHelper.sendNotification({
    playerId,
    title,
    message,
  });
  await addNotificationToQueue(playerId, {
    title,
    message,
    timestamp: Date.now(),
  });
}
