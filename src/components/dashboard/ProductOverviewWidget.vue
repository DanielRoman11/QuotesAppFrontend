<script setup lang="ts">
import useQuotes from '@/composables/useQuotes'
import { formatCurrency, formatDate } from '@/utils/common'
import { Column, DataTable, Dialog, InputNumber, InputText, Tag } from 'primevue'
import { Currency, ApprovedBy, QuoteStatus } from '@/utils/interfaces'

const {
  quotes,
  search,
  editingRows,
  expandedRows,
  updateQuote,
  getSeverity,
  openItemsDialog,
  onCellEditComplete,
  dialogVisible,
  selectedQuote,
	getAuthorImage,
	getTotalByAuthor,
	getSuccessByAuthor,
	getQuotesByAuthor,
} = useQuotes()
</script>
<template>
  <div class="card">
    <DataTable
      v-model:expandedRowGroups="expandedRows"
      :expandableRowGroups="true"
      rowGroupMode="subheader"
      groupRowsBy="author"
      v-model:editingRows="editingRows"
      :value="quotes"
      editMode="row"
      data-key="id"
      @row-edit-save="updateQuote"
      tableStyle="min-width: 220rem"
      scrollable
      scrollHeight="800px"
      sort-mode="single"
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
        <img
          :alt="`Imagen de ${slotProps.data.author}`"
          :src="getAuthorImage(slotProps.data.author)"
          width="32"
          style="vertical-align: middle; display: inline-block"
          class="ml-2 rounded-full"
        />
        <span class="align-middle ml-2 font-bold leading-normal">{{ slotProps.data.author }}</span>
        <span class="ml-2 text-sm text-primary">
          ({{ getQuotesByAuthor(slotProps.data.author) }} cotizaciones)
        </span>
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

      <Column field="priority" header="Priority">
        <template #body="slotProps">
          <Tag :value="slotProps.data.priority" :severity="getSeverity(slotProps.data.priority)" />
        </template>
      </Column>

      <Column field="id" header="Consecutive" :frozen="true" />

      <Column header="Items">
        <template #body="slotProps">
          <Button
            icon="pi pi-external-link"
            label="Items"
            text
            @click="openItemsDialog(slotProps.data)"
          />
        </template>
      </Column>

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

      <Dialog
        v-model:visible="dialogVisible"
        modal
        :draggable="false"
        :header="'Items de Cotización ' + selectedQuote?.id"
        :style="{ width: '80vw' }"
      >
        <div v-if="selectedQuote">
          <DataTable
            :value="selectedQuote.items"
            scrollable
            scroll-height="300px"
            rowGroupMode="subheader"
            groupRowsBy="category"
            editMode="cell"
            dataKey="id"
            tableStyle="width: 100%"
            :sortField="'category'"
            :sortOrder="1"
            @cell-edit-complete="onCellEditComplete"
          >
            <template #groupheader="slotProps">
              <p class="font-bold">
                Category
                <span class="italic text-primary">"{{ slotProps.data.category }}"</span>
              </p>
            </template>

            <Column field="product.description" header="Description">
              <template #body="{ data }">
                {{ data.product.description }}
              </template>
              <template #editor="{ data }">
                <label>
                  Product Description:
                  <InputText v-model="data.product.description" />
                </label>
              </template>
            </Column>
            <Column field="annotations" header="Annotations">
              <template #editor="{ data }">
                <label>
                  Annotations:
                  <InputText v-model="data.annotations" />
                </label>
              </template>
            </Column>

            <Column field="quantity" header="Quantity">
              <template #editor="{ data }">
                <InputNumber v-model="data.quantity" :min="0" fluid />
              </template>
            </Column>

            <Column field="price" header="Unit Price">
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.price) }}
              </template>
              <template #editor="{ data }">
                <InputNumber
                  v-model.number="data.price"
                  mode="currency"
                  :currency="selectedQuote.currency"
                  :locale="selectedQuote.currency === 'COP' ? 'es-CO' : 'en-US'"
                  :min="0"
                  fluid
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </Dialog>
      <template #groupfooter="slotProps">
        <div class="flex items-center justify-start gap-5 text-sm text-muted-color-emphasis">
          <p>
            Total Quoted
            <span class="ml-1 font-semibold">
              {{ formatCurrency(getTotalByAuthor(slotProps.data.author)) }}
            </span>
          </p>
          <p>
            Success Rate
            <span class="ml-1 font-semibold">
              {{ getSuccessByAuthor(slotProps.data.author) }} %
            </span>
          </p>
        </div>
      </template>
    </DataTable>
  </div>
</template>
