import { Router } from "express";
import { getAllNotifications } from "../controllers/notifications/get-all";

const notificationRouter = Router();

notificationRouter.get("/", getAllNotifications);

export default notificationRouter;
