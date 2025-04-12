<script setup lang="ts">
import useQuotes from '@/composables/useQuotes'
import { formatCurrency, formatDate } from '@/utils/common'
import { Column, DataTable, Tag } from 'primevue'
import { Priority, Currency, ApprovedBy, QuoteStatus } from '@/utils/interfaces'

const { quotes, editingRows, itemsColumns, expandedRows, updateQuote, getSeverity } = useQuotes()
</script>
<template>
  <DataTable
    v-model:expanded-rows="expandedRows"
    v-model:editingRows="editingRows"
    @row-edit-save="updateQuote"
    editMode="row"
    :value="quotes"
    data-key="id"
    tableStyle="min-width: 250rem"
  >
    <Column rowEditor style="width: 5rem" bodyStyle="text-align:center" />
    <Column expander style="width: 5rem" header="Items" />

    <!-- Columnas -->
    <fieldset>
      <Column field="priority" header="Priority">
        <template #body="slotProps">
          <Tag :value="slotProps.data.priority" :severity="getSeverity(slotProps.data.priority)" />
        </template>
        <template #editor="{ data, field }">
          <Dropdown v-model="data[field]" :options="Object.values(Priority)" />
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
        <template #editor="{ data, field }">
          <InputNumber
            v-model="data[field]"
            mode="currency"
            :currency="data.currency"
            locale="es-CO"
          />
        </template>
      </Column>

      <Column field="expireDate" header="Expire Date">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.expireDate) }}
        </template>
        <template #editor="{ data, field }">
          <Calendar v-model="data[field]" showIcon />
        </template>
      </Column>

      <Column field="deliveryDate" header="Delivery Date">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.deliveryDate) }}
        </template>
        <template #editor="{ data, field }">
          <Calendar v-model="data[field]" showIcon />
        </template>
      </Column>

      <Column field="status" header="Status">
        <template #body="slotProps">
          <Tag :value="slotProps.data.status" :severity="getSeverity(slotProps.data.status)" />
        </template>
        <template #editor="{ data, field }">
          <Dropdown v-model="data[field]" :options="Object.values(QuoteStatus)" />
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
        <template #editor="{ data, field }">
          <Checkbox v-model="data[field]" />
        </template>
      </Column>
    </fieldset>

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
</template>
