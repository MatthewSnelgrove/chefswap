import multer from "multer";
import * as dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
export const uploadHandler = multer({
  storage: multer.memoryStorage(),
});

export function generateImageLink(name) {
  return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${name}`;
}
export function generateImageName(link) {
  return /^https:\/\/storage\.googleapis\.com\/.+$/.test(link)
    ? link.substring(42)
    : null;
}
