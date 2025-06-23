import { Request, Response } from "express";

import { getAndClearNotifications } from "../../queue/queue";
import { userModelFromToken } from "../../utils/token";

export const getAllNotifications = async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ message: "Token de autenticação ausente" });
    return;
  }
  const { IdUser } = userModelFromToken(req.headers.authorization!);

  try {
    const notifications = await getAndClearNotifications(IdUser);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    res.status(500).json({ message: "Erro ao buscar notificações" });
  }
};
