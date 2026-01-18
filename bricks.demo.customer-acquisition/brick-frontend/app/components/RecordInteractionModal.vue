<script setup lang="ts">
  import { toTypedSchema } from '@vee-validate/zod';
  import { useField, useForm } from 'vee-validate';
  import * as zod from 'zod';
  import {
    CreateInteractionDocument,
    type CreateInteractionMutation,
  } from '~/__generated__/graphql';

  type Interaction = {
    id: string;
    date: string;
    type: string;
    message: string;
  };

  const props = defineProps<{
    contactPointId: string | null;
    customerId?: string;
    onSuccess: (interaction: Interaction) => void;
  }>();

  const emit = defineEmits<{
    'update:contactPointId': [value: string | null];
  }>();

  const { $apollo } = useNuxtApp();
  const toast = useToast();

  const today = new Date().toISOString().split('T')[0];

  const validationSchema = toTypedSchema(
    zod.object({
      date: zod
        .string()
        .min(1, { message: 'Date is required' })
        .refine(
          (val) => {
            if (!val) return false;
            const selectedDate = new Date(val);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);
            return selectedDate <= todayDate;
          },
          { message: 'Cannot record interactions with future dates' },
        ),
      type: zod.string().min(1, { message: 'Type is required' }),
      message: zod.string().min(1, { message: 'Message is required' }),
    }),
  );

  const { handleSubmit, resetForm, meta } = useForm({
    validationSchema,
    initialValues: {
      date: today,
      type: 'call',
      message: '',
    },
  });

  const { value: date, errorMessage: dateError } = useField<string>('date');
  const { value: type, errorMessage: typeError } = useField<string>('type');
  const { value: message, errorMessage: messageError } =
    useField<string>('message');

  const isSubmitting = ref(false);

  const isOpen = computed({
    get: () => props.contactPointId !== null,
    set: (value) => {
      if (!value) {
        emit('update:contactPointId', null);
        resetForm({
          values: {
            date: today,
            type: 'call',
            message: '',
          },
        });
      }
    },
  });

  const interactionTypes = [
    { value: 'call', label: 'Call' },
    { value: 'email', label: 'Email' },
    { value: 'meeting', label: 'Meeting' },
  ];

  const handleFormSubmit = handleSubmit(async (values) => {
    if (isSubmitting.value || !props.contactPointId) return;

    isSubmitting.value = true;
    try {
      // Convert date to ISO string for GraphQL DateTime
      const dateISO = new Date(values.date).toISOString();

      const result = await $apollo.mutate<CreateInteractionMutation>({
        mutation: CreateInteractionDocument,
        variables: {
          input: {
            contactPointId: props.contactPointId,
            date: dateISO,
            type: values.type,
            message: values.message,
          },
        },
      });

      toast.add({
        title: 'Interaction recorded successfully!',
        color: 'success',
        icon: 'i-lucide-circle-check',
      });

      if (result.data?.createInteractionSummary) {
        props.onSuccess(result.data.createInteractionSummary);
      }

      emit('update:contactPointId', null);
      resetForm({
        values: {
          date: today,
          type: 'call',
          message: '',
        },
      });
    } catch (e) {
      toast.add({
        title: (e as Error).message,
        color: 'error',
        icon: 'i-lucide-circle-x',
      });
    } finally {
      isSubmitting.value = false;
    }
  });

  const onSubmit = () => {
    handleFormSubmit();
  };
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Record Interaction"
    :ui="{ footer: 'justify-end' }"
    :dismissible="!isSubmitting"
    :close="{
      disabled: isSubmitting,
    }"
  >
    <template #body>
      <form class="flex flex-col space-y-4" @submit.prevent="onSubmit">
        <UFormField required :error="dateError">
          <UInput
            v-model="date"
            type="date"
            label="Date"
            :disabled="isSubmitting"
            class="w-full"
          />
        </UFormField>
        <UFormField required :error="typeError">
          <select
            v-model="type"
            :disabled="isSubmitting"
            class="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option
              v-for="typeOption in interactionTypes"
              :key="typeOption.value"
              :value="typeOption.value"
            >
              {{ typeOption.label }}
            </option>
          </select>
        </UFormField>
        <UFormField required :error="messageError">
          <UTextarea
            v-model="message"
            label="Message"
            placeholder="Enter interaction details..."
            :disabled="isSubmitting"
            :rows="5"
            class="w-full"
          />
        </UFormField>
        <button
          type="submit"
          :disabled="!meta.valid || isSubmitting"
          class="hidden"
          aria-hidden="true"
        />
      </form>
    </template>

    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        label="Cancel"
        :disabled="isSubmitting"
        @click="isOpen = false"
      />
      <UButton
        label="Save"
        :disabled="!meta.valid || isSubmitting"
        :loading="isSubmitting"
        @click="onSubmit"
      />
    </template>
  </UModal>
</template>
