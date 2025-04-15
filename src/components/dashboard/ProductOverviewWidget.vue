<script setup lang="ts">
import useQuotes from '@/composables/useQuotes'
import { formatCurrency, formatDate } from '@/utils/common'
import { Column, DataTable, InputNumber, InputText, Tag } from 'primevue'
import { Currency, ApprovedBy, QuoteStatus } from '@/utils/interfaces'

const { quotes, search, editingRows, expandedRows, updateQuote, getSeverity } = useQuotes()
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
      scrollable
      scrollHeight="400px"
      rowGroupMode="subheader"
      groupRowsBy="author"
      sort-field="author"
      :sort-order="1"
      :pt="{
        column: {
          bodycell: ({ state }: any) => ({
            style: state['d_editing'] && 'padding-top: 0.75rem; padding-bottom: 0.75rem',
          }),
        },
      }"
    >
      <template #groupheader="slotProps">
        <div class="flex items-center gap-2 !z-50">
          <img
            :alt="`Imagen de ${slotProps.data.author}`"
            src="https://hidroconsulting.com.co/svg/HidroLogoNoTxt.svg"
            width="32"
          />
          <p class="capitalize font-semibold">
            {{ slotProps.data.author }}
          </p>
        </div>
      </template>
      <template #header>
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="search" placeholder="Busqueda Global" />
        </IconField>
      </template>
      <Column rowEditor style="width: 5rem" bodyStyle="text-align:center" :frozen="true" />
      <Column expander style="width: 5rem" header="Items" />

      <Column field="priority" header="Priority">
        <template #body="slotProps">
          <Tag :value="slotProps.data.priority" :severity="getSeverity(slotProps.data.priority)" />
        </template>
      </Column>

      <Column field="id" header="Consecutive" class="font-bold" :frozen="true" />
      <Column field="currency" header="Currency">
        <template #editor="{ data, field }">
          <Dropdown v-model="data[field]" :options="Object.values(Currency)" />
        </template>
      </Column>

      <Column field="totalPrice" header="Total Price" :frozen="true">
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

      <Column field="client.companyName" header="Company Name"></Column>

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
          <h5 class="text-balance">
            All Items from
            <span class="font-bold underline text-primary">{{ slotProps.data.id }}</span>
          </h5>
          <DataTable
            :value="slotProps.data.items"
            rowGroupMode="subheader"
            groupRowsBy="category"
            editMode="cell"
            dataKey="id"
            tableStyle="width: 70rem"
            :sortField="'category'"
            :sortOrder="1"
          >
            <template #groupheader="slotProps">
              <div class="flex items-center gap-2">
                <p class="font-bold">
                  Category
                  <span class="italic underline text-primary">"{{ slotProps.data.category }}"</span>
                </p>
              </div>
            </template>
            <Column field="product.description" header="Description">
              <template #body="{ data }">
                {{ data.product.description + ' ' + (data.product.annotations ?? '') }}
              </template>
              <template #editor="{ data }">
                <div class="flex flex-col gap-2">
                  <label>
                    Product Description:
                    <InputText v-model="data.product.description" />
                  </label>
                  <label>
                    Product detail Annotations:
                    <InputText
                      v-model="data.product.annotations"
                      aria-placeholder="Extra annotations"
                    />
                  </label>
                </div>
              </template>
            </Column>
            <Column field="quantity" header="Quantity">
              <template #editor="{ data, field }">
                <InputNumber v-model="data[field]" />
              </template>
            </Column>
            <Column field="price" header="Unit Price">
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.price) }}
              </template>
              <template #editor="{ data }">
                <InputText v-model.number="data.price" fluid />
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </DataTable>
  </div>
</template>
