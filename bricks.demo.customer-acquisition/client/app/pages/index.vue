<script setup lang="ts">
const messages = ref<{ role: "user" | "assistant"; content: string }[]>([]);
const loading = ref(false);
const query = ref("");
const scrollArea = ref<HTMLElement | null>(null);

// Simple formatter to parse basic Markdown for better readability
function formatMessage(content: string) {
  let formatted = content
    // Escape HTML (basic) - prevent injection if we were worried, but here we trust backend mostly.
    // Actually, let's just do the formatting replacements carefully.
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    // Bold: **text**
    .replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>'
    )

    // Italic: *text*
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

    // Inline Code: `text`
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-primary-600 dark:text-primary-400">$1</code>'
    )

    // Code blocks: ```text``` (Simplified, just wraps in pre)
    .replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-gray-900 text-gray-100 p-3 rounded-md my-2 overflow-x-auto text-xs font-mono">$1</pre>'
    )

    // Lists: - item (Start of line)
    .replace(/^\s*-\s+(.*)$/gm, '<li class="ml-4 list-disc">$1</li>')

    // Line breaks handling
    .replace(/\n/g, "<br>");

  return formatted;
}

async function sendMessage() {
  if (!query.value.trim() || loading.value) return;

  const userMsg = query.value;
  messages.value.push({ role: "user", content: userMsg });
  query.value = "";
  loading.value = true;

  await nextTick();
  scrollToBottom();

  try {
    // Format history for backend: array of "ROLE: Message" strings
    const recentMessages = messages.value.slice(0, -1).slice(-5);
    const history = recentMessages.map(
      (m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`
    );

    // Assuming backend is running on port 3005 (Updated default)
    const data = await $fetch<any>("http://localhost:3005/api/query", {
      method: "POST",
      body: {
        query: userMsg,
        history: history,
      },
    });

    messages.value.push({ role: "assistant", content: data.answer });
  } catch (err: any) {
    messages.value.push({
      role: "assistant",
      content:
        "Sorry, something went wrong. Please check if the backend is running on port 3005.",
    });
    console.error(err);
  } finally {
    loading.value = false;
    await nextTick();
    scrollToBottom();
  }
}

function scrollToBottom() {
  if (scrollArea.value) {
    scrollArea.value.scrollTop = scrollArea.value.scrollHeight;
  }
}
</script>

<template>
  <UContainer class="py-10 max-w-4xl">
    <UCard :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary-50 dark:bg-primary-950 rounded-lg">
            <UIcon
              name="i-heroicons-chat-bubble-left-right"
              class="w-6 h-6 text-primary"
            />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">
              Project Assistant
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Ask questions about your documentation and specs
            </p>
          </div>
        </div>
      </template>

      <div
        ref="scrollArea"
        class="h-[650px] overflow-y-auto p-4 sm:p-6 space-y-6 flex flex-col bg-gray-50/50 dark:bg-gray-900/50"
      >
        <div
          v-if="messages.length === 0"
          class="flex-1 flex flex-col items-center justify-center text-center text-gray-500 gap-4"
        >
          <div
            class="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
          >
            <UIcon name="i-heroicons-sparkles" class="w-8 h-8 text-primary" />
          </div>
          <div class="max-w-md">
            <h3 class="font-medium text-gray-900 dark:text-white mb-1">
              Welcome!
            </h3>
            <p class="text-sm">
              I can help you understand the project structure, login flows, API
              endpoints, and more.
            </p>
          </div>
        </div>

        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="[
            'flex w-full gap-3',
            msg.role === 'user' ? 'justify-end' : 'justify-start',
          ]"
        >
          <!-- Assistant Avatar -->
          <div v-if="msg.role === 'assistant'" class="shrink-0 mt-1">
            <UAvatar
              icon="i-heroicons-computer-desktop"
              size="xs"
              class="bg-gray-100 dark:bg-gray-800"
            />
          </div>

          <div
            :class="[
              'px-5 py-3.5 rounded-2xl max-w-[85%] shadow-sm text-[15px] leading-7',
              msg.role === 'user'
                ? 'bg-primary text-white rounded-br-none'
                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-none text-gray-600 dark:text-gray-300',
            ]"
          >
            <!-- Render HTML safely since we manually formatted it -->
            <div v-html="formatMessage(msg.content)"></div>
          </div>

          <!-- User Avatar -->
          <div v-if="msg.role === 'user'" class="shrink-0 mt-1">
            <UAvatar
              icon="i-heroicons-user"
              size="xs"
              class="bg-primary-600 text-white"
            />
          </div>
        </div>

        <div v-if="loading" class="flex justify-start w-full gap-3">
          <div class="shrink-0 mt-1">
            <UAvatar
              icon="i-heroicons-computer-desktop"
              size="xs"
              class="bg-gray-100 dark:bg-gray-800"
            />
          </div>
          <div
            class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-4 rounded-2xl rounded-bl-none flex items-center gap-2 shadow-sm"
          >
            <div class="flex space-x-1">
              <div
                class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"
              ></div>
              <div
                class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"
              ></div>
              <div
                class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
              ></div>
            </div>
            <span class="text-sm text-gray-500 ml-2">Thinking...</span>
          </div>
        </div>
      </div>

      <template #footer>
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <UInput
            v-model="query"
            placeholder="Type your question..."
            class="flex-1"
            :disabled="loading"
            autocomplete="off"
            size="lg"
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template #trailing>
              <div v-if="query" @click="query = ''" class="cursor-pointer">
                <UIcon
                  name="i-heroicons-x-mark"
                  class="text-gray-400 hover:text-gray-600"
                />
              </div>
            </template>
          </UInput>
          <UButton
            type="submit"
            label="Send"
            icon="i-heroicons-paper-airplane"
            size="lg"
            :loading="loading"
          />
        </form>
      </template>
    </UCard>
  </UContainer>
</template>
