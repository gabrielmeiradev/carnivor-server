import IORedis from "ioredis";

const redis = new IORedis();

export async function addNotificationToQueue(
  userId: string,
  notification: object
) {
  await redis.lpush(`notifications:${userId}`, JSON.stringify(notification));
}

export async function getAndClearNotifications(userId: string): Promise<any[]> {
  const key = `notifications:${userId}`;
  const notifications = await redis.lrange(key, 0, -1);
  await redis.del(key);
  return notifications.map((n) => JSON.parse(n));
}
