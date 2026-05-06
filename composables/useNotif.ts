import { ref } from "vue";

interface Toast {
  id: number;
  chatId: string;
  name: string;
  text: string;
  photo: string | null;
}

const _queue = ref<Toast[]>([]);
let _id = 0;

export function useNotif() {
  function show(chatId: string, name: string, text: string, photo: string | null = null) {
    const id = _id++;
    _queue.value.push({ id, chatId, name, text, photo });
    setTimeout(() => dismiss(id), 4500);
  }

  function dismiss(id: number) {
    _queue.value = _queue.value.filter((t) => t.id !== id);
  }

  return { queue: _queue, show, dismiss };
}
