import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event);
  const file = parts?.find((p) => p.name === "photo");

  if (!file?.data?.length) {
    throw createError({ statusCode: 400, message: "No se recibió imagen" });
  }
  if (!ALLOWED.includes(file.type ?? "")) {
    throw createError({ statusCode: 400, message: "Tipo de archivo no permitido" });
  }
  if (file.data.byteLength > MAX_SIZE) {
    throw createError({ statusCode: 400, message: "Imagen demasiado grande (máx 5 MB)" });
  }

  const ext = (file.type ?? "image/jpeg").split("/")[1];
  const filename = `${uuidv4()}.${ext}`;
  const dir = path.join(process.cwd(), "uploads");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), file.data);

  return { url: `/uploads/${filename}` };
});
