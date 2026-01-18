<script setup lang="ts">
  import type { TableColumn } from '@nuxt/ui';
  import { h, resolveComponent } from 'vue';
  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import {
    GetDashBoardCustomerDocument,
    type GetDashBoardCustomerQuery,
  } from '~/__generated__/graphql';

  dayjs.extend(relativeTime);

  type CustomerRow = GetDashBoardCustomerQuery['customers'][number];

  const UButton = resolveComponent('UButton');
  const UBadge = resolveComponent('UBadge');

  const { $apollo } = useNuxtApp();
  const router = useRouter();

  const queryResult = await $apollo.query<GetDashBoardCustomerQuery>({
    query: GetDashBoardCustomerDocument,
  });

  const data = ref(queryResult.data);

  // Calculate days since last interaction
  const getDaysSinceLastInteraction = (
    lastInteraction: string | null | undefined,
  ) => {
    if (!lastInteraction) return null;
    return dayjs().diff(dayjs(lastInteraction), 'day');
  };

  // Check if customer needs attention (not contacted in last 7 days)
  const needsAttention = (customer: CustomerRow): boolean => {
    const daysSince = getDaysSinceLastInteraction(
      customer.lastInteraction?.date,
    );
    if (daysSince === null) return true; // Never contacted
    return daysSince > 7; // Not contacted in last 7 days
  };

  // Format date for display
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Never';
    return dayjs(dateString).format('MMM D, YYYY');
  };

  const goToCustomer = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };

  const columns: TableColumn<CustomerRow>[] = [
    {
      accessorKey: 'name',
      header: 'Customer',
      cell: ({ row }) => {
        const customer = row.original;
        const attention = needsAttention(customer);
        return h('div', { class: 'flex gap-2' }, [
          h('span', { class: attention ? 'font-semibold' : '' }, customer.name),
          attention
            ? h(UBadge, {
                label: 'Needs attention',
                color: 'warning',
                variant: 'subtle',
                size: 'xs',
              })
            : null,
        ]);
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
      id: 'lastInteraction',
      header: 'Last Contact',
      cell: ({ row }) => {
        const customer = row.original;
        const daysSince = getDaysSinceLastInteraction(
          customer.lastInteraction?.date,
        );
        const formattedDate = formatDate(customer.lastInteraction?.date);

        if (daysSince === null) {
          return h('span', { class: 'text-gray-500' }, 'Never');
        }

        const attention = needsAttention(customer);
        return h('div', { class: 'flex flex-col' }, [
          h(
            'span',
            { class: attention ? 'text-orange-600 font-medium' : '' },
            formattedDate,
          ),
          daysSince !== null &&
            h(
              'span',
              { class: 'text-xs text-gray-500' },
              `${dayjs(customer.lastInteraction?.date).fromNow()}`,
            ),
        ]);
      },
    },
    {
      id: 'interactionCount',
      header: 'Interactions',
      cell: ({ row }) => {
        const count = row.original.interactionCount;
        return h('span', count?.toString());
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        return h(UButton, {
          label: 'View Details',
          color: 'neutral',
          variant: 'ghost',
          size: 'xs',
          onClick: () => goToCustomer(row.original.id),
        });
      },
    },
  ];

  const table = useTemplateRef('table');

  // Sort by needs attention first, then by last interaction date
  const sortedCustomers = computed(() => {
    if (!data.value?.customers) return [];
    return [...data.value.customers].sort((a, b) => {
      const aNeedsAttention = needsAttention(a);
      const bNeedsAttention = needsAttention(b);

      // Customers needing attention come first
      if (aNeedsAttention && !bNeedsAttention) return -1;
      if (!aNeedsAttention && bNeedsAttention) return 1;

      // Then sort by last interaction date (most recent first, nulls last)
      const aDate = a.lastInteraction
        ? dayjs(a.lastInteraction.date).valueOf()
        : 0;
      const bDate = b.lastInteraction
        ? dayjs(b.lastInteraction.date).valueOf()
        : 0;

      return bDate - aDate;
    });
  });

  const stats = computed(() => {
    const customers = (data.value?.customers || []) as CustomerRow[];
    const totalCustomers = customers.length;
    const customersNeedingAttention = customers.filter(needsAttention).length;
    const totalInteractions = customers.reduce(
      (sum, c) => sum + c.interactionCount,
      0,
    );
    const customersWithInteractions = customers.filter(
      (c) => c.interactionCount > 0,
    ).length;

    return {
      totalCustomers,
      customersNeedingAttention,
      totalInteractions,
      customersWithInteractions,
    };
  });
</script>

<template>
  <div class="flex w-full flex-1 flex-col">
    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-4">
      <UCard>
        <div class="flex flex-col">
          <span class="text-sm text-gray-500">Total Customers</span>
          <span class="text-2xl font-bold">{{ stats.totalCustomers }}</span>
        </div>
      </UCard>

      <UCard>
        <div class="flex flex-col">
          <span class="text-sm text-gray-500">Needs Attention</span>
          <span class="text-2xl font-bold text-orange-600">{{
            stats.customersNeedingAttention
          }}</span>
        </div>
      </UCard>

      <UCard>
        <div class="flex flex-col">
          <span class="text-sm text-gray-500">Total Interactions</span>
          <span class="text-2xl font-bold">{{ stats.totalInteractions }}</span>
        </div>
      </UCard>

      <UCard>
        <div class="flex flex-col">
          <span class="text-sm text-gray-500">Active Customers</span>
          <span class="text-2xl font-bold">{{
            stats.customersWithInteractions
          }}</span>
        </div>
      </UCard>
    </div>

    <!-- Customers Table -->
    <div class="divide-accented flex-1 divide-y">
      <div class="px-4 py-3.5">
        <h2 class="text-lg font-semibold">Customer Overview</h2>
        <p class="mt-1 text-sm text-gray-500">
          Customers requiring attention are highlighted. Click "View Details" to
          see contact points and interactions.
        </p>
      </div>

      <div
        v-if="!data?.customers || data.customers.length === 0"
        class="px-4 py-12"
      >
        <div class="flex flex-col items-center justify-center text-center">
          <p class="text-lg text-gray-500">No Customers available</p>
          <p class="mt-2 text-sm text-gray-400">
            Start by creating your first customer to track interactions.
          </p>
          <UButton
            class="mt-4"
            color="neutral"
            label="Go to Customers"
            @click="router.push('/customers')"
          />
        </div>
      </div>

      <UTable
        v-else
        ref="table"
        :data="sortedCustomers"
        :columns="columns"
        sticky
      />
    </div>
  </div>
</template>
