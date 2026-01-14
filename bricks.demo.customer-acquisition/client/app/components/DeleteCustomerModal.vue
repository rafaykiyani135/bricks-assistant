<script setup lang="ts">
  import {
    DeleteCustomerDocument,
    type DeleteCustomerMutation,
  } from '~/__generated__/graphql';

  const props = defineProps<{
    customerId: string | null;
    onDelete: (customerId: string) => void;
  }>();

  const emit = defineEmits<{
    'update:customerId': [value: string | null];
  }>();

  const { $apollo } = useNuxtApp();
  const toast = useToast();

  const isDeleting = ref(false);

  const isOpen = computed({
    get: () => props.customerId !== null,
    set: (value) => {
      if (!value) {
        emit('update:customerId', null);
      }
    },
  });

  const handleDelete = async () => {
    if (isDeleting.value || !props.customerId) return;

    isDeleting.value = true;
    try {
      await $apollo.mutate<DeleteCustomerMutation>({
        mutation: DeleteCustomerDocument,
        variables: {
          id: props.customerId,
        },
      });

      toast.add({
        title: 'Customer deleted successfully!',
        color: 'success',
        icon: 'i-lucide-circle-check',
      });

      if (props.customerId) {
        props.onDelete(props.customerId);
      }

      emit('update:customerId', null);
    } catch (e) {
      const failureMessage =
        e instanceof Error &&
        e.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed'
          ? 'Delete all contact points first'
          : 'Failed to delete customer';

      toast.add({
        title: failureMessage,
        color: 'error',
        icon: 'i-lucide-circle-x',
      });
    } finally {
      isDeleting.value = false;
    }
  };
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Delete Customer"
    :ui="{ footer: 'justify-end' }"
    :dismissible="!isDeleting"
    :close="{
      disabled: isDeleting,
    }"
  >
    <template #body>
      <p>
        Are you sure you want to delete this customer? This action cannot be
        undone.
      </p>
    </template>

    <template #footer="{ close }">
      <UButton
        color="neutral"
        variant="outline"
        label="Cancel"
        :disabled="isDeleting"
        @click="close"
      />
      <UButton
        color="error"
        label="Delete"
        :loading="isDeleting"
        @click="handleDelete"
      />
    </template>
  </UModal>
</template>
