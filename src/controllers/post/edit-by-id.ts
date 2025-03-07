import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PostCreationInput } from "./create";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const editPostById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const author_id = req.headers["userid"];
  const { text_content, hashtags } = req.body as PostCreationInput;
  const hashtagsArray = hashtags
    ? hashtags.split(",").map((hashtag) => hashtag.trim().toLowerCase())
    : [];
  const newImages = req.files as Express.Multer.File[];

  try {
    const existingPost = await prisma.post.findUnique({
      where: { post_id: id, author_id: author_id as string },
    });

    if (!existingPost) {
      res.status(404).json({ error: "Post não encontrado ou autorizado" });
      return;
    }

    // Delete existing images from the server
    existingPost.medias.forEach((media) => {
      const filePath = path.join(__dirname, "../../../", media);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Erro ao deletar arquivo: ${filePath}`, err);
        }
      });
    });

    // Disconnect existing hashtags
    await prisma.post.update({
      where: { post_id: id },
      data: {
        hashtags: {
          set: [],
        },
      },
    });

    // Upsert new hashtags
    await Promise.all(
      hashtagsArray.map(async (hashtag) => {
        await prisma.hashtag.upsert({
          where: { title: hashtag },
          update: {},
          create: { title: hashtag },
        });
      })
    );

    // Update post with new content, hashtags, and images
    const post = await prisma.post.update({
      where: { post_id: id },
      data: {
        text_content,
        medias: newImages.map((image) => image.path),
        hashtags: {
          connect: hashtagsArray.map((hashtag) => ({ title: hashtag })),
        },
      },
      include: { hashtags: true },
    });

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Falha ao editar post" });
  }
};
