<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Autocomplete from 'primevue/autocomplete'
import { useCreateQuote } from '@/composables/useQuotes'
import { useRouter } from 'vue-router'
import Dialog from 'primevue/dialog'

const {
  // Form data
  form,
  currencies,
  approvedByOptions,

  // Client autocomplete
  clientInput,
  clientSuggestions,
  showClientDropdown,
  clientLoading,
  clientLocked,
  onClientInput,
  onClientFocus,
  onClientBlur,
  selectClientSuggestion,
  cancelClientSelection,

  // Category management
  categoryInputs,
  getCategories,
  onCategoryInput,
  onCategoryBlur,
  addItemToCategory,

  // Product autocomplete
  descriptionInputs,
  descriptionLocked,
  onTextareaInput,

  // Unit autocomplete
  unitFiltered,
  searchUnit,

  // Modal de productos
  showProductModal,
  productSearchInput,
  productSearchResults,
  productSearchLoading,
  searchProduct,
  openProductModal,
  selectProductSuggestionInModal,
  unlockDescription,

  // Form validation and submission
  errors,
  isFormValid,
  submitForm,

  // Item management
  removeItem,

  // Calculations
  formatCurrency,
  getCategorySubtotal,
  totalGeneral,
} = useCreateQuote()

const router = useRouter()

function goBack() {
  router.push('/quotes')
}
</script>

<template>
  <div class="p-6 mx-auto w-full max-w-3xl">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-0">Create Quote</h2>
      <Button
        label="Regresar"
        icon="pi pi-arrow-left"
        @click="goBack"
        severity="secondary"
        size="small"
      />
    </div>

    <div class="grid md:grid-cols-2 gap-4 w-full flex-1">
      <div>
        <label class="block text-surface-700 dark:text-surface-200">Author</label>
        <InputText
          v-model="form.author"
          class="w-full text-surface-900 dark:text-surface-0"
          size="small"
        />
        <span v-if="errors.author" class="text-red-500 text-xs">{{
          errors.author && 'Author is required.'
        }}</span>
      </div>
      <div>
        <label class="block text-surface-700 dark:text-surface-200">Creation date</label>
        <Calendar
          v-model="form.createdAt"
          class="w-full text-surface-900 dark:text-surface-0"
          date-format="dd/mm/yy"
          show-icon
          size="small"
        />
        <span v-if="errors.createdAt" class="text-red-500 text-xs">{{
          errors.createdAt && 'Creation date is required.'
        }}</span>
      </div>
      <div>
        <label class="block text-surface-700 dark:text-surface-200">Currency</label>
        <Dropdown
          v-model="form.currency"
          :options="currencies"
          option-label="label"
          option-value="value"
          placeholder="Select currency"
          class="w-full text-surface-900 dark:text-surface-0"
          size="small"
        />
        <span v-if="errors.currency" class="text-red-500 text-xs">{{
          errors.currency && 'Currency is required.'
        }}</span>
      </div>
      <div>
        <label class="block text-surface-700 dark:text-surface-200">Approved by</label>
        <Dropdown
          v-model="form.approvedBy"
          :options="approvedByOptions"
          option-label="label"
          option-value="value"
          placeholder="Select approver"
          class="w-full text-surface-900 dark:text-surface-0"
          size="small"
        />
        <span v-if="errors.approvedBy" class="text-red-500 text-xs">{{
          errors.approvedBy && 'Approver is required.'
        }}</span>
      </div>
      <div class="md:col-span-2">
        <div class="md:col-span-2 relative">
          <label class="block text-surface-700 dark:text-surface-200">Client (Company)</label>
          <InputText
            v-model="clientInput"
            class="w-full text-surface-900 dark:text-surface-0"
            size="small"
            @input="onClientInput"
            @focus="onClientFocus"
            @blur="onClientBlur"
            placeholder="Type the company name..."
            :disabled="clientLocked"
          />
          <div
            v-if="showClientDropdown && !clientLocked"
            class="absolute left-0 top-full w-full z-30 border rounded shadow max-h-60 mt-1 bg-white border-gray-300 dark:bg-surface-800 dark:border-surface-700"
          >
            <div
              v-if="clientLoading"
              class="flex items-center gap-2 px-4 py-2 text-primary-500 dark:text-primary-300"
            >
              <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Searching suggestions...
            </div>
            <div
              v-for="s in clientSuggestions"
              :key="s.id"
              class="px-4 py-2 cursor-pointer hover:bg-primary-100 dark:hover:bg-surface-700 text-surface-900 dark:text-surface-0"
              @mousedown.prevent="() => selectClientSuggestion(s)"
            >
              {{ s.companyName }}
            </div>
            <div
              v-if="!clientLoading && clientSuggestions.length === 0"
              class="px-4 py-2 text-gray-400 dark:text-gray-300"
            >
              No suggestions
            </div>
          </div>
          <button
            v-if="clientLocked"
            type="button"
            class="mt-2 px-3 py-1 rounded bg-gray-200 dark:bg-surface-700 text-gray-700 dark:text-surface-0 text-xs hover:bg-gray-300 dark:hover:bg-surface-600 transition"
            @click="cancelClientSelection"
          >
            Cancel selection
          </button>
        </div>
      </div>
    </div>

    <h3
      class="text-xl font-semibold mt-8 text-surface-900 dark:text-surface-0 flex items-center gap-2"
    >
      Items
      <span
        class="inline-block bg-primary-500 text-white text-xs font-bold rounded-full px-3 py-1 align-middle"
        >{{ form.items.length }}</span
      >
    </h3>
    <div class="mt-8">
      <span class="text-surface-900 dark:text-surface-0 text-lg font-bold rounded-full">
        Total: {{ formatCurrency(totalGeneral) }}
      </span>
    </div>
    <div class="overflow-x-auto whitespace-nowrap">
      <TabView>
        <TabPanel v-for="cat in getCategories" :key="cat" :value="cat">
          <template #header>
            <div class="flex flex-col items-start">
              <span>{{ cat }}</span>
              <span
                class="inline-block bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs font-bold rounded-full px-3 py-1 align-middle mt-1"
              >
                Subtotal: {{ formatCurrency(getCategorySubtotal(cat)) }}
              </span>
            </div>
          </template>
          <template v-for="(item, idx) in form.items" :key="idx">
            <div v-if="(item.category?.trim() || 'No category') === cat" class="mb-6">
              <div
                class="relative border-l-4 border-primary-500 rounded-lg bg-white dark:bg-surface-800 shadow-lg p-6 flex flex-col gap-2"
              >
                <div class="absolute -left-4 top-4 flex items-center">
                  <span
                    class="bg-primary-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow"
                    >Item {{ form.items.indexOf(item) + 1 }}</span
                  >
                </div>
                <div class="flex flex-col items-start mb-2 pt-6">
                  <label class="block text-surface-700 dark:text-surface-200"
                    >Category (optional)</label
                  >
                  <InputText
                    v-model="categoryInputs[idx]"
                    class="max-w-xs w-full text-surface-900 dark:text-surface-0"
                    size="small"
                    @input="(e: any) => onCategoryInput(e.target.value, idx)"
                    @blur="() => onCategoryBlur(idx)"
                  />
                </div>
                <div class="flex flex-col items-start mt-2 w-full relative">
                  <label class="block text-surface-700 dark:text-surface-200">Description</label>
                  <Textarea
                    v-model="descriptionInputs[idx]"
                    class="w-full min-h-[100px] text-base text-surface-900 dark:text-surface-0"
                    rows="4"
                    autoResize
                    placeholder="Type the full description..."
                    :disabled="descriptionLocked[idx]"
                    @input="(e: any) => onTextareaInput(e, idx)"
                  />
                  <div class="my-2 flex gap-2">
                    <button
                      type="button"
                      class="flex items-center gap-2 text-primary-700 dark:text-primary-300 text-xs font-medium bg-transparent p-0 shadow-none border px-2 py-1 rounded-sm border-accent cursor-pointer"
                      @click="openProductModal(idx)"
                    >
                      <i class="pi pi-database"></i>
                      Buscar un producto
                    </button>
                    <button
                      v-if="descriptionLocked[idx]"
                      type="button"
                      class="text-xs bg-primary text-primary-contrast font-semibold px-2 py-1 rounded-sm cursor-pointer border-none shadow-sm"
                      @click="unlockDescription(idx)"
                    >
                      Desbloquear
                    </button>
                  </div>
                  <span
                    v-if="
                      errors.itemsFields &&
                      errors.itemsFields[idx] &&
                      errors.itemsFields[idx].description
                    "
                    class="text-red-500 text-xs"
                    >{{ errors.itemsFields[idx].description && 'Description is required.' }}</span
                  >
                </div>
                <div class="grid md:grid-cols-3 gap-4 mt-2">
                  <div class="flex flex-col items-start">
                    <label class="block text-surface-700 dark:text-surface-200">Quantity</label>
                    <InputNumber
                      v-model="item.quantity"
                      class="max-w-xs w-full text-surface-900 dark:text-surface-0"
                      :min="1"
                      size="small"
                    />
                    <span
                      v-if="
                        errors.itemsFields &&
                        errors.itemsFields[idx] &&
                        errors.itemsFields[idx].quantity
                      "
                      class="text-red-500 text-xs"
                      >{{ errors.itemsFields[idx].quantity && 'Quantity is required (>0).' }}</span
                    >
                  </div>
                  <div class="flex flex-col items-start">
                    <label class="block text-surface-700 dark:text-surface-200"
                      >Price (optional)</label
                    >
                    <InputNumber
                      v-model="item.price"
                      class="max-w-xs w-full text-surface-900 dark:text-surface-0"
                      mode="currency"
                      :currency="form.currency || 'USD'"
                      :minFractionDigits="2"
                      size="small"
                    />
                  </div>
                  <div class="flex flex-col items-start">
                    <label class="block text-surface-700 dark:text-surface-200">Unit</label>
                    <Autocomplete
                      v-model="item.product.unit"
                      :suggestions="unitFiltered[idx]"
                      @complete="(e: any) => searchUnit(e, idx)"
                      class="max-w-xs w-full text-surface-900 dark:text-surface-0"
                      placeholder="Unit"
                      size="small"
                      :disabled="descriptionLocked[idx]"
                    />
                    <span
                      v-if="
                        errors.itemsFields &&
                        errors.itemsFields[idx] &&
                        errors.itemsFields[idx].unit
                      "
                      class="text-red-500 text-xs"
                      >{{ errors.itemsFields[idx].unit && 'Unit is required.' }}</span
                    >
                  </div>
                </div>
                <div
                  class="flex justify-end gap-2 mt-6 pt-2 border-t border-gray-200 dark:border-surface-700"
                >
                  <Button
                    icon="pi pi-trash"
                    label="Remove"
                    @click="() => removeItem(idx)"
                    text
                    severity="danger"
                    size="small"
                    :disabled="form.items.length === 1"
                  />
                </div>
              </div>
            </div>
          </template>
          <div class="flex justify-end">
            <Button
              icon="pi pi-plus"
              label="Add item to this category"
              @click="() => addItemToCategory(cat)"
              text
              size="small"
            />
          </div>
        </TabPanel>
      </TabView>
    </div>

    <div class="mt-6 flex justify-end">
      <Button
        label="Save"
        icon="pi pi-save"
        @click="submitForm"
        :disabled="!isFormValid"
        size="small"
      />
    </div>
  </div>

  <Dialog
    v-model:visible="showProductModal"
    modal
    header="Buscar producto"
    :closable="true"
    :style="{ width: '500px', maxWidth: '90vw', overflow: 'visible' }"
  >
    <div class="flex flex-col gap-4 overflow-visible">
      <div class="relative">
        <Autocomplete
          v-model="productSearchInput"
          :suggestions="productSearchResults"
          option-label="description"
          placeholder="Buscar producto..."
          class="w-full text-surface-900 dark:text-surface-0"
          @complete="searchProduct"
          @item-select="(e) => selectProductSuggestionInModal(e.value)"
          :dropdown="true"
          :loading="productSearchLoading"
        >
          <template #option="slotProps">
            <div class="flex items-center">
              <span>{{ slotProps.option.description }}</span>
              <span v-if="slotProps.option.unit" class="text-xs text-gray-500 ml-2"
                >({{ slotProps.option.unit }})</span
              >
            </div>
          </template>
        </Autocomplete>
      </div>
    </div>
  </Dialog>
</template>
