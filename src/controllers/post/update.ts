import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const updatePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text_content, hashtags } = req.body;

  const hashtagsArray = hashtags.split(",");

  try {
    const post = await prisma.post.update({
      where: { post_id: id },
      data: {
        text_content,
        hashtags: {
          set: [],
          connectOrCreate: hashtagsArray.map((hashtag: string) => ({
            where: { title: hashtag.toLowerCase() },
            create: { title: hashtag.toLowerCase() },
          })),
        },
        likes: {
          set: [],
        },
      },
    });

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Falha ao atualizar post" });
  }
};
