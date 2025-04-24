import { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import fs from "fs";
import path from "path";

export const compressImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) return next();

  const inputPath = req.file.path;
  const outputPath = path.join("compressed", `${req.file.filename}.jpeg`);

  try {
    await sharp(inputPath).jpeg({ quality: 60 }).toFile(outputPath);

    fs.unlinkSync(inputPath);

    req.file.path = outputPath;
    req.file.filename = `${req.file.filename}.jpeg`;

    next();
  } catch (error) {
    next(error);
  }
};
