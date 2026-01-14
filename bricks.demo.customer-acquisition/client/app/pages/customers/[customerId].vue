<script setup lang="ts">
  import type { TableColumn } from '@nuxt/ui';
  import type { GroupingOptions } from '@tanstack/vue-table';
  import { getGroupedRowModel } from '@tanstack/vue-table';
  import { toTypedSchema } from '@vee-validate/zod';
  import { useField, useForm } from 'vee-validate';
  import { computed, h, onMounted, resolveComponent } from 'vue';
  import * as zod from 'zod';
  import {
    CreateContactPointDocument,
    type CreateContactPointMutation,
    GetCustomerContactPointsDocument,
    type GetCustomerContactPointsQuery,
    UpdateContactPointDocument,
    type UpdateContactPointMutation,
  } from '~/__generated__/graphql';
  import DeleteContactPointModal from '~/components/DeleteContactPointModal.vue';
  import RecordInteractionModal from '~/components/RecordInteractionModal.vue';

  const UBadge = resolveComponent('UBadge');
  const UButton = resolveComponent('UButton');
  const UDropdownMenu = resolveComponent('UDropdownMenu');

  type TableRow = {
    contactPointId: string;
    contactPointName: string;
    role?: string | null;
    email?: string | null;
    phone?: string | null;
    interactionId?: string;
    date?: string;
    type?: string;
    message?: string;
    interactionCount: number;
  };

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const { $apollo } = useNuxtApp();

  const validationSchema = toTypedSchema(
    zod.object({
      name: zod.string().min(1, { message: 'Name is required' }),
      role: zod.string().optional(),
      email: zod
        .string()
        .optional()
        .refine((val) => !val || zod.string().email().safeParse(val).success, {
          message: 'Please enter a valid email address',
        }),
      phone: zod.string().optional(),
    }),
  );

  const { handleSubmit, resetForm, setValues, errors } = useForm({
    validationSchema,
    initialValues: {
      name: '',
      role: '',
      email: '',
      phone: '',
    },
  });

  const { value: name } = useField<string>('name');
  const { value: role } = useField<string>('role');
  const { value: email } = useField<string>('email');
  const { value: phone } = useField<string>('phone');

  const customer = ref<GetCustomerContactPointsQuery['customer'] | null>(null);
  const isLoading = ref(true);
  const isSubmitting = ref(false);
  const isModalOpen = ref(false);
  const editingContactPointId = ref<string | null>(null);
  const contactPointIdToDelete = ref<string | null>(null);
  const contactPointIdForInteraction = ref<string | null>(null);
  const duplicateError = ref<{
    type: 'email' | 'name';
    value: string;
  } | null>(null);

  const fetchCustomer = async () => {
    if (!route.params.customerId) {
      customer.value = null;
      return;
    }

    isLoading.value = true;
    try {
      const result = await $apollo.query<GetCustomerContactPointsQuery>({
        query: GetCustomerContactPointsDocument,
        variables: { id: route.params.customerId as string },
        fetchPolicy: 'network-only',
      });
      customer.value = result.data?.customer;
    } catch {
      toast.add({
        title: 'Failed to load contact points',
        color: 'error',
        icon: 'i-lucide-circle-x',
      });
      customer.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    fetchCustomer();
  });

  const openCreateModal = () => {
    editingContactPointId.value = null;
    duplicateError.value = null;
    resetForm();
    isModalOpen.value = true;
  };

  const openEditModal = (contactPointId: string) => {
    if (!customer.value) return;
    const contactPoint = customer.value.contactPoints.find(
      (cp) => cp.id === contactPointId,
    );
    if (!contactPoint) return;

    editingContactPointId.value = contactPointId;
    duplicateError.value = null;
    setValues({
      name: contactPoint.name,
      role: contactPoint.role || '',
      email: contactPoint.email || '',
      phone: contactPoint.phone || '',
    });
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
    editingContactPointId.value = null;
    duplicateError.value = null;
    resetForm();
  };

  const updateContactPoint = (
    updatedContactPoint: NonNullable<
      GetCustomerContactPointsQuery['customer']
    >['contactPoints'][number],
  ) => {
    if (customer.value?.contactPoints) {
      customer.value = {
        ...customer.value,
        contactPoints: customer.value.contactPoints.map((cp) =>
          cp.id === updatedContactPoint.id ? updatedContactPoint : cp,
        ),
      };
    }
  };

  const addContactPoint = (
    newContactPoint: NonNullable<
      GetCustomerContactPointsQuery['customer']
    >['contactPoints'][number],
  ) => {
    if (customer.value?.contactPoints) {
      customer.value = {
        ...customer.value,
        contactPoints: [newContactPoint, ...customer.value.contactPoints],
      };
    }
  };

  const removeContactPoint = (contactPointId: string) => {
    if (customer.value?.contactPoints) {
      customer.value = {
        ...customer.value,
        contactPoints: customer.value.contactPoints.filter(
          (cp) => cp.id !== contactPointId,
        ),
      };
    }
  };

  const addInteraction = (
    contactPointId: string,
    interaction: NonNullable<
      NonNullable<
        GetCustomerContactPointsQuery['customer']
      >['contactPoints'][number]
    >['interactions'][number],
  ) => {
    if (!customer.value?.contactPoints) return;

    customer.value = {
      ...customer.value,
      contactPoints: customer.value.contactPoints.map((cp) => {
        if (cp.id === contactPointId) {
          return {
            ...cp,
            interactions: [interaction, ...(cp.interactions ?? [])],
          };
        }
        return cp;
      }),
    };
  };

  const handleInteractionSuccess = (
    interaction: NonNullable<
      NonNullable<
        GetCustomerContactPointsQuery['customer']
      >['contactPoints'][number]
    >['interactions'][number],
  ) => {
    const contactPointId = contactPointIdForInteraction.value;
    if (contactPointId) {
      addInteraction(contactPointId, interaction);
    }
  };

  const performSubmit = async (
    values: {
      name: string;
      role?: string;
      email?: string;
      phone?: string;
    },
    override = false,
  ) => {
    if (isSubmitting.value) return;

    isSubmitting.value = true;
    try {
      if (editingContactPointId.value) {
        // Update contact point
        const result = await $apollo.mutate<UpdateContactPointMutation>({
          mutation: UpdateContactPointDocument,
          variables: {
            input: {
              id: editingContactPointId.value,
              name: values.name,
              role: values.role || undefined,
              email: values.email || undefined,
              phone: values.phone || undefined,
            },
          },
        });

        if (result.data?.updateContactPoint && customer.value) {
          const updatedContactPoint = {
            ...result.data.updateContactPoint,
            interactions:
              customer.value.contactPoints.find(
                (cp) => cp.id === editingContactPointId.value,
              )?.interactions ?? [],
          };
          updateContactPoint(updatedContactPoint);
        }

        toast.add({
          title: 'Contact point updated!',
          color: 'success',
          icon: 'i-lucide-circle-check',
        });
        closeModal();
      } else {
        // Create contact point
        const result = await $apollo.mutate<CreateContactPointMutation>({
          mutation: CreateContactPointDocument,
          variables: {
            customerId: route.params.customerId as string,
            name: values.name,
            role: values.role || undefined,
            email: values.email || undefined,
            phone: values.phone || undefined,
            override,
          },
        });

        if (result.data?.createContactPoint && customer.value) {
          // Check if it's an update (contact point already existed)
          const existingContactPoint = customer.value.contactPoints.find(
            (cp) => cp.id === result.data?.createContactPoint.id,
          );
          if (existingContactPoint && result.data?.createContactPoint) {
            const updatedContactPoint = {
              ...result.data.createContactPoint,
              interactions: existingContactPoint.interactions ?? [],
            };
            updateContactPoint(updatedContactPoint);
          } else if (result.data?.createContactPoint) {
            const newContactPoint = {
              ...result.data.createContactPoint,
              interactions: [],
            };
            addContactPoint(newContactPoint);
          }
        }

        toast.add({
          title: 'Contact point created!',
          color: 'success',
          icon: 'i-lucide-circle-check',
        });
        closeModal();
      }
    } catch (e) {
      const errorMessage = (e as Error).message;
      // Check for duplicate email first - NO override allowed
      if (errorMessage === 'DuplicateEmail') {
        duplicateError.value = {
          type: 'email',
          value: values.email || '',
        };
      } else if (errorMessage === 'DuplicateName') {
        // Name duplicate - show warning in create mode, error in update mode
        duplicateError.value = {
          type: 'name',
          value: values.name,
        };
      } else {
        toast.add({
          title: errorMessage,
          color: 'error',
          icon: 'i-lucide-circle-x',
        });
      }
    } finally {
      isSubmitting.value = false;
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    // If duplicate name exists in create mode, proceed with override
    if (duplicateError.value?.type === 'name' && !editingContactPointId.value) {
      // Create mode - call mutation with override: true
      await performSubmit(values, true);
    } else {
      // Call mutation directly - backend will check for duplicate
      await performSubmit(values, false);
    }
  });

  // Transform nested data into flat structure for grouping
  const tableData = computed<TableRow[]>(() => {
    if (!customer.value) {
      return [];
    }

    return customer.value.contactPoints.flatMap((contactPoint) => {
      const interactions = contactPoint.interactions ?? [];

      if (interactions.length === 0) {
        // Create a minimal row for ContactPoint with no interactions
        // This row will be hidden and replaced with an empty state message
        return [
          {
            contactPointId: contactPoint.id,
            contactPointName: contactPoint.name,
            role: contactPoint.role,
            email: contactPoint.email,
            phone: contactPoint.phone,
            interactionCount: 0,
          },
        ];
      }

      // Create a row for each interaction
      return interactions.map((interaction) => ({
        contactPointId: contactPoint.id,
        contactPointName: contactPoint.name,
        role: contactPoint.role,
        email: contactPoint.email,
        phone: contactPoint.phone,
        interactionId: interaction.id,
        date: String(interaction.date ?? ''),
        type: interaction.type,
        message: interaction.message,
        interactionCount: interactions.length,
      }));
    });
  });

  const hasContactPoints = computed(() => tableData.value.length > 0);
  const isValidForm = computed(() => Object.keys(errors.value).length === 0);

  const columns = ref<TableColumn<TableRow>[]>([
    {
      id: 'title',
      header: 'Contact point',
      cell: () => null,
    },
    {
      id: 'contactPointId',
      accessorKey: 'contactPointId',
    },
    {
      accessorKey: 'message',
      header: 'Message',
      cell: ({ row }) => {
        if (row.getIsGrouped()) {
          const count = row.original.interactionCount;
          return `${count} ${count > 1 ? 'messages' : 'message'}`;
        }
        // For non-grouped rows with no interactions, return null to hide the cell
        if (row.original.interactionCount === 0) {
          return null;
        }
        return row.getValue('message') || '-';
      },
      aggregationFn: 'count',
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        if (row.original.interactionCount === 0) {
          return null;
        }
        return row.getValue('date')
          ? new Date(row.getValue('date')).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : '-';
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        if (row.original.interactionCount === 0) {
          return null;
        }
        const type = row.getValue('type');
        return type ? h(UBadge, {}, { default: () => type as string }) : '-';
      },
    },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }) => {
        if (row.original.interactionCount === 0) {
          return null;
        }
        return (row.getIsGrouped() && row.original.role) || '-';
      },
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }) => {
        if (row.original.interactionCount === 0) {
          return null;
        }
        return (row.getIsGrouped() && row.original.email) || '-';
      },
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: ({ row }) => {
        if (row.original.interactionCount === 0) {
          return null;
        }
        return (row.getIsGrouped() && row.original.phone) || '-';
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        if (!row.getIsGrouped()) {
          // todo: show menu for interaction
          return null;
        }

        const items = [
          {
            type: 'label',
            label: 'Actions',
          },
          {
            label: 'Add Interaction',
            onSelect() {
              contactPointIdForInteraction.value = row.original.contactPointId;
            },
          },
          {
            label: 'Edit',
            onSelect() {
              openEditModal(row.original.contactPointId);
            },
          },
          {
            label: 'Delete',
            onSelect() {
              contactPointIdToDelete.value = row.original.contactPointId;
            },
          },
        ];

        return h(
          'div',
          { class: 'text-right' },
          h(
            UDropdownMenu,
            {
              content: {
                align: 'end',
              },
              items,
              'aria-label': 'Actions dropdown',
            },
            () =>
              h(UButton, {
                icon: 'i-lucide-ellipsis-vertical',
                color: 'neutral',
                variant: 'ghost',
                class: 'ml-auto',
                'aria-label': 'Actions dropdown',
              }),
          ),
        );
      },
    },
  ]);

  const groupingOptions = ref<GroupingOptions>({
    groupedColumnMode: 'remove',
    getGroupedRowModel: getGroupedRowModel(),
  });
</script>

<template>
  <div class="flex h-full flex-col gap-6 p-4">
    <div class="flex items-center gap-2">
      <UButton
        icon="i-lucide-chevron-left"
        variant="ghost"
        color="neutral"
        @click="router.push('/customers')"
      />
      <div class="flex flex-col">
        <h1 class="text-lg font-semibold">
          {{ customer?.name ?? 'Contact Points' }}
        </h1>
      </div>
      <UButton class="ml-auto" label="Add contact" @click="openCreateModal" />
    </div>

    <div v-if="isLoading" class="flex flex-1 items-center justify-center">
      <AppLoading />
    </div>
    <div
      v-else-if="!customer"
      class="flex flex-1 flex-col items-center justify-center text-center"
    >
      <p class="text-lg font-medium">Customer not found</p>
      <UButton
        class="mt-4"
        label="Back to customers"
        @click="router.push('/customers')"
      />
    </div>
    <div v-else class="flex flex-1 flex-col gap-4">
      <UTable
        v-if="hasContactPoints"
        :data="tableData"
        :columns="columns"
        :grouping="['contactPointId']"
        :grouping-options="groupingOptions"
        :ui="{
          root: 'min-w-full',
          td: 'empty:p-0',
        }"
      >
        <template #title-cell="{ row }">
          <div v-if="row.getIsGrouped()" class="flex items-center">
            <UButton
              variant="outline"
              color="neutral"
              class="mr-2"
              size="xs"
              :icon="row.getIsExpanded() ? 'i-lucide-minus' : 'i-lucide-plus'"
              @click="row.toggleExpanded()"
            />
            <strong v-if="row.groupingColumnId === 'contactPointId'">
              {{ row.original.contactPointName }}
            </strong>
          </div>
        </template>

        <template #expanded="{ row }">
          <div
            v-if="row.getIsGrouped() && row.original.interactionCount === 0"
            class="flex flex-col items-center justify-center py-4 text-center"
          >
            <p class="text-muted-foreground text-sm">No interactions yet</p>
            <p class="text-muted-foreground mt-1 text-xs">
              Click "Add Interaction" in the menu to get started
            </p>
          </div>
        </template>
      </UTable>
      <div
        v-else
        class="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed p-6 text-center"
      >
        <p class="text-base font-medium">No contact points yet</p>
        <p class="text-muted-foreground text-sm">
          Add the first person to begin tracking interactions.
        </p>
        <UButton class="mt-4" label="Add contact" @click="openCreateModal" />
      </div>
    </div>

    <UModal
      v-model:open="isModalOpen"
      :title="
        editingContactPointId ? 'Edit contact point' : 'New contact point'
      "
      :ui="{ footer: 'justify-end' }"
      :dismissible="!isSubmitting"
      :close="{
        disabled: isSubmitting,
      }"
    >
      <template #body>
        <UAlert
          v-if="duplicateError"
          :color="
            duplicateError.type === 'email'
              ? 'error'
              : editingContactPointId
                ? 'error'
                : 'warning'
          "
          variant="soft"
          icon="i-lucide-alert-triangle"
          :title="
            duplicateError.type === 'email'
              ? 'Duplicate Email'
              : 'Duplicate Name'
          "
          class="mb-4"
        >
          <template #description>
            <template v-if="duplicateError.type === 'email'">
              A contact point with email
              <strong>"{{ duplicateError.value }}"</strong>
              already exists for this customer.
            </template>
            <template v-else-if="editingContactPointId">
              A contact point named
              <strong>"{{ duplicateError.value }}"</strong>
              already exists. Cannot update to duplicate name.
            </template>
            <template v-else>
              A contact point named
              <strong>"{{ duplicateError.value }}"</strong>
              already exists. Click "Confirm" to update the existing contact
              point instead of creating a new one.
            </template>
          </template>
        </UAlert>
        <form class="flex flex-col space-y-4" @submit.prevent="onSubmit">
          <UFormField required :error="errors.name">
            <UInput
              v-model="name"
              placeholder="Name"
              :disabled="isSubmitting"
              class="w-full"
              @update:model-value="
                () => {
                  duplicateError = null;
                }
              "
            />
          </UFormField>
          <UFormField :error="errors.role">
            <UInput
              v-model="role"
              placeholder="Role"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>
          <UFormField :error="errors.email">
            <UInput
              v-model="email"
              placeholder="Email"
              :disabled="isSubmitting"
              class="w-full"
              @update:model-value="
                () => {
                  duplicateError = null;
                }
              "
            />
          </UFormField>
          <UFormField :error="errors.phone">
            <UInput
              v-model="phone"
              placeholder="Phone"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>
          <button
            type="submit"
            :disabled="!isValidForm || isSubmitting"
            class="hidden"
            aria-hidden="true"
          />
        </form>
      </template>

      <template #footer="{ close }">
        <UButton
          color="neutral"
          variant="outline"
          label="Cancel"
          :disabled="isSubmitting"
          @click="close"
        />
        <UButton
          :label="
            duplicateError?.type === 'name' && !editingContactPointId
              ? 'Confirm'
              : 'Save'
          "
          :color="
            duplicateError?.type === 'name' && !editingContactPointId
              ? 'warning'
              : 'primary'
          "
          :disabled="
            !isValidForm ||
            duplicateError?.type === 'email' ||
            (duplicateError?.type === 'name' && Boolean(editingContactPointId))
          "
          :loading="isSubmitting"
          @click="onSubmit"
        />
      </template>
    </UModal>

    <DeleteContactPointModal
      v-model:contact-point-id="contactPointIdToDelete"
      :on-delete="removeContactPoint"
    />

    <RecordInteractionModal
      v-model:contact-point-id="contactPointIdForInteraction"
      :customer-id="route.params.customerId as string"
      :on-success="handleInteractionSuccess"
    />
  </div>
</template>
