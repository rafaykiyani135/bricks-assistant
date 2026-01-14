<script setup lang="ts">
  import type { TableColumn } from '@nuxt/ui';
  import { toTypedSchema } from '@vee-validate/zod';
  import { useField, useForm } from 'vee-validate';
  import { h, resolveComponent } from 'vue';
  import * as zod from 'zod';
  import {
    CreateCustomerDocument,
    type CreateCustomerMutation,
    GetCustomersDocument,
    type GetCustomersQuery,
    UpdateCustomerDocument,
    type UpdateCustomerMutation,
  } from '~/__generated__/graphql';
  import DeleteCustomerModal from '~/components/DeleteCustomerModal.vue';

  type CustomerRow = GetCustomersQuery['customers'][number];

  const UButton = resolveComponent('UButton');
  const UDropdownMenu = resolveComponent('UDropdownMenu');

  const { $apollo } = useNuxtApp();
  const router = useRouter();
  const toast = useToast();

  const queryResult = await $apollo.query<GetCustomersQuery>({
    query: GetCustomersDocument,
  });

  const validationSchema = toTypedSchema(
    zod.object({
      name: zod.string().min(1, { message: 'Name is required' }),
      website: zod
        .string()
        .optional()
        .refine((val) => !val || zod.string().url().safeParse(val).success, {
          message: 'Please enter a valid URL',
        }),
      industry: zod.string().optional(),
    }),
  );

  const { handleSubmit, resetForm, setValues, errors } = useForm({
    validationSchema,
    initialValues: {
      name: '',
      website: '',
      industry: '',
    },
  });

  const { value: name } = useField<string>('name');
  const { value: website } = useField<string>('website');
  const { value: industry } = useField<string>('industry');

  const isSubmitting = ref(false);
  const data = ref(queryResult.data);

  const isModalOpen = ref(false);
  const selectedCustomer = ref<CustomerRow | null>(null);
  const customerIdToDelete = ref<string | null>(null);
  const duplicateCustomerName = ref<string | null>(null);

  const openCreateModal = () => {
    selectedCustomer.value = null;
    duplicateCustomerName.value = null;
    resetForm();
    isModalOpen.value = true;
  };

  const openEditModal = (customer: CustomerRow) => {
    selectedCustomer.value = customer;
    duplicateCustomerName.value = null;
    setValues({
      name: customer.name,
      website: customer.website || '',
      industry: customer.industry || '',
    });
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
    selectedCustomer.value = null;
    duplicateCustomerName.value = null;
    resetForm();
  };

  const performSubmit = async (
    values: {
      name: string;
      website?: string;
      industry?: string;
    },
    override = false,
  ) => {
    if (isSubmitting.value) return;

    isSubmitting.value = true;
    try {
      if (selectedCustomer.value) {
        // Update customer
        const result = await $apollo.mutate<UpdateCustomerMutation>({
          mutation: UpdateCustomerDocument,
          variables: {
            input: {
              id: selectedCustomer.value.id,
              name: values.name || undefined,
              website: values.website || undefined,
              industry: values.industry || undefined,
            },
          },
        });

        if (result.data?.updateCustomer) {
          updateCustomer(result.data.updateCustomer);
        }

        toast.add({
          title: 'Customer updated successfully!',
          color: 'success',
          icon: 'i-lucide-circle-check',
        });
        closeModal();
      } else {
        // Create new customer
        const result = await $apollo.mutate<CreateCustomerMutation>({
          mutation: CreateCustomerDocument,
          variables: {
            input: {
              name: values.name,
              website: values.website || undefined,
              industry: values.industry || undefined,
              override,
            },
          },
        });

        if (result.data?.createCustomer) {
          // Check if it's an update (customer already existed)
          const existingCustomer = data.value?.customers.find(
            (c) => c.id === result.data?.createCustomer.id,
          );
          if (existingCustomer && result.data?.createCustomer) {
            updateCustomer(result.data.createCustomer);
          } else if (result.data?.createCustomer) {
            addCustomer(result.data.createCustomer);
          }
        }

        toast.add({
          title: 'Customer created successfully!',
          color: 'success',
          icon: 'i-lucide-circle-check',
        });
        closeModal();
      }
    } catch (e) {
      const errorMessage = (e as Error).message;
      if (errorMessage === 'Duplicate') {
        if (selectedCustomer.value) {
          // Update mode - duplicate name is not allowed
          duplicateCustomerName.value = values.name;
          toast.add({
            title: 'A customer with this name already exists',
            color: 'error',
            icon: 'i-lucide-circle-x',
          });
        } else {
          // Create mode - show warning banner
          duplicateCustomerName.value = values.name;
        }
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
    // If duplicate name exists and in create mode, proceed with override
    if (duplicateCustomerName.value && !selectedCustomer.value) {
      // Create mode - call mutation with override: true
      await performSubmit(values, true);
    } else {
      // Call mutation directly - backend will check for duplicate
      await performSubmit(values, false);
    }
  });

  const goToContactPoints = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };

  const addCustomer = (newCustomer: CustomerRow) => {
    if (data.value?.customers) {
      data.value = {
        ...data.value,
        customers: [newCustomer, ...data.value.customers],
      };
    }
  };

  const removeCustomer = (customerId: string) => {
    if (data.value?.customers) {
      data.value = {
        ...data.value,
        customers: data.value.customers.filter((c) => c.id !== customerId),
      };
    }
  };

  const updateCustomer = (updatedCustomer: CustomerRow) => {
    if (data.value?.customers) {
      data.value = {
        ...data.value,
        customers: data.value.customers.map((c) =>
          c.id === updatedCustomer.id ? updatedCustomer : c,
        ),
      };
    }
  };

  const columns: TableColumn<CustomerRow>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        const isSorted = column.getIsSorted();

        return h(UButton, {
          color: 'neutral',
          variant: 'ghost',
          label: 'Name',
          icon: isSorted
            ? isSorted === 'asc'
              ? 'i-lucide-arrow-up-narrow-wide'
              : 'i-lucide-arrow-down-wide-narrow'
            : 'i-lucide-arrow-up-down',
          class: '-mx-2.5',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        });
      },
      cell: ({ row }) => row.getValue('name'),
    },
    {
      accessorKey: 'website',
      header: 'Website',
      cell: ({ row }) => {
        const website = row.getValue('website') as string | null;
        return website || '-';
      },
    },
    {
      accessorKey: 'industry',
      header: 'Industry',
      cell: ({ row }) => {
        const industry = row.getValue('industry') as string | null;
        return industry || '-';
      },
    },
    {
      id: 'contactPoints',
      header: 'Contact points',
      cell: ({ row }) =>
        h(UButton, {
          label: 'View contacts',
          color: 'neutral',
          variant: 'ghost',
          size: 'xs',
          onClick: () => goToContactPoints(row.original.id),
        }),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const items = [
          {
            type: 'label',
            label: 'Actions',
          },
          {
            label: row.getIsExpanded() ? 'Collapse' : 'Expand',
            onSelect() {
              row.toggleExpanded();
            },
          },
          {
            label: 'Edit',
            onSelect() {
              openEditModal(row.original);
            },
          },
          {
            label: 'Delete',
            onSelect() {
              customerIdToDelete.value = row.original.id;
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
  ];

  const table = useTemplateRef('table');
</script>

<template>
  <div class="divide-accented w-full flex-1 divide-y">
    <div class="flex items-center gap-2 overflow-x-auto px-4 py-3.5">
      <UInput
        :model-value="
          table?.tableApi?.getColumn('name')?.getFilterValue() as string
        "
        class="max-w-sm min-w-[12ch]"
        placeholder="Filter names..."
        @update:model-value="
          table?.tableApi?.getColumn('name')?.setFilterValue($event)
        "
      />

      <UButton
        class="ml-auto"
        color="primary"
        label="New customer"
        @click="openCreateModal"
      />
    </div>

    <UTable ref="table" :data="data?.customers" :columns="columns" sticky>
      <template #expanded="{ row }">
        <pre>{{ row.original }}</pre>
      </template>
    </UTable>

    <UModal
      v-model:open="isModalOpen"
      :title="selectedCustomer ? 'Edit Customer' : 'New Customer'"
      :ui="{ footer: 'justify-end' }"
      :dismissible="!isSubmitting"
      :close="{
        disabled: isSubmitting,
      }"
    >
      <template #body>
        <UAlert
          v-if="duplicateCustomerName"
          :color="selectedCustomer ? 'error' : 'warning'"
          variant="soft"
          icon="i-lucide-alert-triangle"
          title="Duplicate Customer Name"
          class="mb-4"
        >
          <template #description>
            <template v-if="selectedCustomer">
              A customer named
              <strong>"{{ duplicateCustomerName }}"</strong>
              already exists. Cannot update to duplicate name.
            </template>
            <template v-else>
              A customer named
              <strong>"{{ duplicateCustomerName }}"</strong>
              already exists. Click "Confirm" to update the existing customer
              instead of creating a new one.
            </template>
          </template>
        </UAlert>
        <form class="flex flex-col space-y-4" @submit.prevent="onSubmit">
          <UFormField required :error="errors.name">
            <UInput
              v-model="name"
              placeholder="Enter customer name"
              :disabled="isSubmitting"
              class="w-full"
              @update:model-value="
                () => {
                  duplicateCustomerName = null;
                }
              "
            />
          </UFormField>
          <UFormField :error="errors.website">
            <UInput
              v-model="website"
              placeholder="Enter website URL"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>
          <UFormField :error="errors.industry">
            <UInput
              v-model="industry"
              placeholder="Enter industry"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>
          <button
            type="submit"
            :disabled="Object.keys(errors).length > 0 || isSubmitting"
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
            duplicateCustomerName && !selectedCustomer ? 'Confirm' : 'Save'
          "
          :color="
            duplicateCustomerName && !selectedCustomer ? 'warning' : 'primary'
          "
          :disabled="
            Object.keys(errors).length > 0 ||
            (Boolean(selectedCustomer) && Boolean(duplicateCustomerName))
          "
          :loading="isSubmitting"
          @click="onSubmit"
        />
      </template>
    </UModal>

    <DeleteCustomerModal
      v-model:customer-id="customerIdToDelete"
      :on-delete="removeCustomer"
    />
  </div>
</template>
