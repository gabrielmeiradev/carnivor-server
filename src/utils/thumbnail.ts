import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const generateThumbnail = (videoPath: string, thumbnailPath: string): void => {
  const command = `ffmpeg -i "${videoPath}" -ss 00:00:01.000 -vframes 1 "${thumbnailPath}"`;
  execSync(command);
};

const compressImage = (imagePath: string, outputPath: string): void => {
  const command = `ffmpeg -i "${imagePath}" -q:v 2 -vf "auto-orient" "${outputPath}"`;
  execSync(command);
};

export const getMediaThumbnail = (media: Express.Multer.File): string => {
  const mediaPath = media.path;
  const mediaExtension = path.extname(mediaPath).toLowerCase();
  const outputDir = path.dirname(mediaPath);

  if ([".mp4", ".mov", ".avi", ".mkv"].includes(mediaExtension)) {
    const thumbnailFileName = `${path.basename(
      mediaPath,
      mediaExtension
    )}_thumbnail.jpg`;
    const thumbnailPath = path.join(outputDir, thumbnailFileName);
    generateThumbnail(mediaPath, thumbnailPath);

    const compressedThumbnailFileName = `${path.basename(
      mediaPath,
      mediaExtension
    )}_compressed_thumbnail.jpg`;
    const compressedThumbnailPath = path.join(
      outputDir,
      compressedThumbnailFileName
    );
    compressImage(thumbnailPath, compressedThumbnailPath);

    return compressedThumbnailPath;
  } else if ([".jpg", ".jpeg", ".png"].includes(mediaExtension)) {
    const compressedFileName = `${path.basename(
      mediaPath,
      mediaExtension
    )}_compressed${mediaExtension}`;
    const compressedPath = path.join(outputDir, compressedFileName);
    compressImage(mediaPath, compressedPath);

    return compressedPath;
  } else {
    throw new Error("Unsupported media type");
  }
};
