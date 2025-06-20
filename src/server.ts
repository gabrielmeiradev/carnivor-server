// Dependencies
import express from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";

// Import routes
import postRouter from "./routes/post.routes";
import hashtagRouter from "./routes/hashtag.routes";
import userRouter from "./routes/user.routes";

import { Group, PrismaClient } from "@prisma/client";
import categoryRouter from "./routes/category.routes";

// Setting up server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);
app.use("/uploads", express.static("uploads"));

// Prisma client to create genesis group
const prisma = new PrismaClient();

// Routes
app.use("/posts", postRouter);
app.use("/user", userRouter);
app.use("/hashtags", hashtagRouter);
app.use("/categories", categoryRouter);

// Heartbeat
app.get("/heartbeat", (_, res) => {
  res.status(StatusCodes.OK).send("Beating!");
});

export let genesisGroup: Group | null = null;

// Server host
app.listen(3002, async () => {
  genesisGroup = await prisma.group.findFirst({
    where: {
      name: "Genesis",
    },
  });
  if (!genesisGroup) {
    genesisGroup = await prisma.group.create({
      data: {
        name: "Genesis",
      },
    });
  }
  console.log("Server is running on port 3002");
});
