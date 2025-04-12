<script setup lang="ts">
import useQuotes from '@/composables/useQuotes'
import { formatCurrency, formatDate } from '@/utils/common'
import { Column, DataTable, Tag } from 'primevue'
import { Currency, ApprovedBy, QuoteStatus } from '@/utils/interfaces'

const { quotes, editingRows, itemsColumns, expandedRows, updateQuote, getSeverity } = useQuotes()
</script>
<template>
  <div class="card">
    <DataTable
      v-model:expanded-rows="expandedRows"
      v-model:editingRows="editingRows"
      :value="quotes"
      editMode="row"
      data-key="id"
      @row-edit-save="updateQuote"
      tableStyle="min-width: 220rem"
      :pt="{
        column: {
          bodycell: ({ state }: any) => ({
            style: state['d_editing'] && 'padding-top: 0.75rem; padding-bottom: 0.75rem',
          }),
        },
      }"
    >
      <Column rowEditor style="width: 5rem" bodyStyle="text-align:center" />
      <Column expander style="width: 5rem" header="Items" />

      <Column field="priority" header="Priority">
        <template #body="slotProps">
          <Tag :value="slotProps.data.priority" :severity="getSeverity(slotProps.data.priority)" />
        </template>
      </Column>

      <Column field="id" header="Consecutive">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" fluid />
        </template>
      </Column>

      <Column field="currency" header="Currency">
        <template #editor="{ data, field }">
          <Dropdown v-model="data[field]" :options="Object.values(Currency)" />
        </template>
      </Column>

      <Column field="totalPrice" header="Total Price">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.totalPrice) }}
        </template>
      </Column>

      <Column field="expireDate" header="Expire Date">
        <template #editor="{ data, field }">
          <Calendar v-model="data[field]" showIcon />
        </template>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.expireDate) }}
        </template>
      </Column>

      <Column field="deliveryDate" header="Delivery Date">
        <template #editor="{ data, field }">
          <Calendar v-model="data[field]" showIcon />
        </template>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.deliveryDate) }}
        </template>
      </Column>

      <Column field="status" header="Status">
        <template #editor="{ data, field }">
          <Dropdown v-model="data[field]" :options="Object.values(QuoteStatus)" />
        </template>
        <template #body="slotProps">
          <Tag :value="slotProps.data.status" :severity="getSeverity(slotProps.data.status)" />
        </template>
      </Column>

      <Column field="approvedBy" header="Approved By">
        <template #editor="{ data, field }">
          <Dropdown v-model="data[field]" :options="Object.values(ApprovedBy)" />
        </template>
      </Column>

      <Column field="annotations" header="Annotations">
        <template #editor="{ data, field }">
          <Textarea v-model="data[field]" />
        </template>
      </Column>

      <Column field="createdAt" header="Created At">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.createdAt) }}
        </template>
      </Column>

      <Column field="updatedAt" header="Updated At">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.updatedAt) }}
        </template>
      </Column>

      <Column field="order" header="Order">
        <template #body="slotProps">
          <i
            class="pi"
            :class="{
              'pi-check-circle text-green-500': slotProps.data.order,
              'pi-times-circle text-red-400': !slotProps.data.order,
            }"
          ></i>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="p-3">
          <h5>
            Items of <span class="font-bold">{{ slotProps.data.id }}</span>
          </h5>
          <DataTable :value="slotProps.data.items" striped-rows table-style="width: 70rem">
            <Column
              v-for="col of itemsColumns"
              :key="col.field"
              :field="col.field"
              :header="col.header"
            ></Column>
          </DataTable>
        </div>
      </template>
    </DataTable>
  </div>
</template>
