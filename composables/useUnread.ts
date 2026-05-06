import { reactive, computed } from "vue";

const _counts = reactive<Record<string, number>>({});
const _names = reactive<Record<string, string>>({});
const _photos = reactive<Record<string, string>>({});

export function useUnread() {
  const total = computed(() =>
    Object.values(_counts).reduce((s, n) => s + n, 0)
  );

  function init(chats: any[], currentUserId: string) {
    for (const chat of chats) {
      const myEntry = chat.users?.find(
        (u: any) => u.userId?._id?.toString() === currentUserId
      );
      _counts[chat._id] = myEntry?.totalUnread ?? 0;

      const other = chat.users?.find(
        (u: any) => u.userId?._id?.toString() !== currentUserId
      );
      if (other?.userId?.nombre) _names[chat._id] = other.userId.nombre;
      if (other?.userId?.photos?.[0]) _photos[chat._id] = other.userId.photos[0];
    }
  }

  function increment(chatId: string) {
    _counts[chatId] = (_counts[chatId] ?? 0) + 1;
  }

  function clear(chatId: string) {
    _counts[chatId] = 0;
  }

  function nameFor(chatId: string) {
    return _names[chatId] ?? "Nuevo mensaje";
  }

  function photoFor(chatId: string) {
    return _photos[chatId] ?? null;
  }

  return { counts: _counts, total, init, increment, clear, nameFor, photoFor };
}
