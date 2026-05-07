export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const res = await $fetch<{ url: string; simType: string }>(
    "http://localhost:8000/generate-photo",
    { method: "POST", body }
  );

  return res;
});
