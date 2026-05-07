export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const io = (useNitroApp() as any)._io;

  if (io) {
    if (body.receiverId) io.to(body.receiverId).emit("message", body);
    if (body.senderId) io.to(body.senderId).emit("message", body);
    io.to("spectators").emit("message", body);
  }

  return { ok: true };
});
