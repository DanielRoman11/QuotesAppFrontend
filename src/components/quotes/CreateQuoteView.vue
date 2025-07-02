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
  productSuggestions,
  showProductDropdown,
  onTextareaInput,
  onTextareaFocus,
  onTextareaBlur,
  selectProductSuggestion,
  cancelProductSelection,

  // Unit autocomplete
  unitFiltered,
  searchUnit,

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
</script>

<template>
  <div class="p-6 mx-auto w-full max-w-3xl">
    <h2 class="text-2xl font-semibold mb-6 text-surface-900 dark:text-surface-0">Create Quote</h2>

    <div class="grid md:grid-cols-2 gap-4 w-full flex-1">
      <div>
        <label class="block text-surface-700 dark:text-surface-200">Author</label>
        <InputText v-model="form.author" class="w-full" size="small" />
        <span v-if="errors.author" class="text-red-500 text-xs">{{
          errors.author && 'Author is required.'
        }}</span>
      </div>
      <div>
        <label class="block text-surface-700 dark:text-surface-200">Creation date</label>
        <Calendar
          v-model="form.createdAt"
          class="w-full"
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
          class="w-full"
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
          class="w-full"
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
            class="w-full"
            size="small"
            @input="onClientInput"
            @focus="onClientFocus"
            @blur="onClientBlur"
            placeholder="Type the company name..."
            :disabled="clientLocked"
          />
          <div
            v-if="showClientDropdown && !clientLocked"
            class="absolute left-0 top-full w-full z-30 border rounded shadow max-h-60 overflow-auto mt-1 bg-white border-gray-300 dark:bg-surface-800 dark:border-surface-700"
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
                  <label class="block text-surface-700 dark:text-surface-200">Category</label>
                  <InputText
                    v-model="categoryInputs[idx]"
                    class="max-w-xs w-full"
                    size="small"
                    @input="(e: any) => onCategoryInput(e.target.value, idx)"
                    @blur="() => onCategoryBlur(idx)"
                  />
                </div>
                <div class="flex flex-col items-start mt-2 w-full relative">
                  <label class="block text-surface-700 dark:text-surface-200">Description</label>
                  <Textarea
                    v-model="descriptionInputs[form.items.indexOf(item)]"
                    class="w-full min-h-[100px] text-base"
                    rows="4"
                    autoResize
                    placeholder="Type the full description..."
                    :disabled="descriptionLocked[form.items.indexOf(item)]"
                    @input="(e: any) => onTextareaInput(e, form.items.indexOf(item))"
                    @focus="() => onTextareaFocus(form.items.indexOf(item))"
                    @blur="() => onTextareaBlur(form.items.indexOf(item))"
                  />
                  <button
                    v-if="descriptionLocked[form.items.indexOf(item)]"
                    type="button"
                    class="mt-2 px-3 py-1 rounded bg-gray-200 dark:bg-surface-700 text-gray-700 dark:text-surface-0 text-xs hover:bg-gray-300 dark:hover:bg-surface-600 transition"
                    @click="() => cancelProductSelection(form.items.indexOf(item))"
                  >
                    Cancel selection
                  </button>
                  <div
                    v-if="
                      showProductDropdown[form.items.indexOf(item)] &&
                      !descriptionLocked[form.items.indexOf(item)]
                    "
                    class="absolute left-0 top-full w-full z-30 border rounded shadow max-h-60 overflow-auto mt-1 bg-white border-gray-300 dark:bg-surface-800 dark:border-surface-700"
                  >
                    <div
                      v-for="s in productSuggestions[form.items.indexOf(item)]"
                      :key="s.id"
                      class="px-4 py-2 cursor-pointer hover:bg-primary-100 dark:hover:bg-surface-700 text-surface-900 dark:text-surface-0"
                      @mousedown.prevent="
                        () => selectProductSuggestion(s, form.items.indexOf(item))
                      "
                    >
                      {{ s.description }}
                      <span v-if="s.unit" class="text-xs text-gray-500 dark:text-gray-300 ml-2"
                        >({{ s.unit }})</span
                      >
                    </div>
                    <div
                      v-if="productSuggestions[form.items.indexOf(item)]?.length === 0"
                      class="px-4 py-2 text-gray-400 dark:text-gray-300"
                    >
                      No suggestions
                    </div>
                  </div>
                  <span
                    v-if="
                      errors.itemsFields &&
                      errors.itemsFields[form.items.indexOf(item)] &&
                      errors.itemsFields[form.items.indexOf(item)].description
                    "
                    class="text-red-500 text-xs"
                    >{{
                      errors.itemsFields[form.items.indexOf(item)].description &&
                      'Description is required.'
                    }}</span
                  >
                </div>
                <div class="grid md:grid-cols-3 gap-4 mt-2">
                  <div class="flex flex-col items-start">
                    <label class="block text-surface-700 dark:text-surface-200">Quantity</label>
                    <InputNumber
                      v-model="item.quantity"
                      class="max-w-xs w-full"
                      :min="1"
                      size="small"
                    />
                    <span
                      v-if="
                        errors.itemsFields &&
                        errors.itemsFields[form.items.indexOf(item)] &&
                        errors.itemsFields[form.items.indexOf(item)].quantity
                      "
                      class="text-red-500 text-xs"
                      >{{
                        errors.itemsFields[form.items.indexOf(item)].quantity &&
                        'Quantity is required (>0).'
                      }}</span
                    >
                  </div>
                  <div class="flex flex-col items-start">
                    <label class="block text-surface-700 dark:text-surface-200">Price</label>
                    <InputNumber
                      v-model="item.price"
                      class="max-w-xs w-full"
                      mode="currency"
                      :currency="form.currency || 'USD'"
                      :minFractionDigits="2"
                      size="small"
                    />
                    <span
                      v-if="
                        errors.itemsFields &&
                        errors.itemsFields[form.items.indexOf(item)] &&
                        errors.itemsFields[form.items.indexOf(item)].price
                      "
                      class="text-red-500 text-xs"
                      >{{
                        errors.itemsFields[form.items.indexOf(item)].price &&
                        'Price is required (>0).'
                      }}</span
                    >
                  </div>
                  <div class="flex flex-col items-start">
                    <label class="block text-surface-700 dark:text-surface-200">Unit</label>
                    <Autocomplete
                      v-model="item.product.unit"
                      :suggestions="unitFiltered[form.items.indexOf(item)]"
                      @complete="(e) => searchUnit(e, form.items.indexOf(item))"
                      class="max-w-xs w-full"
                      placeholder="Unit"
                      size="small"
                      :disabled="descriptionLocked[form.items.indexOf(item)]"
                    />
                    <span
                      v-if="
                        errors.itemsFields &&
                        errors.itemsFields[form.items.indexOf(item)] &&
                        errors.itemsFields[form.items.indexOf(item)].unit
                      "
                      class="text-red-500 text-xs"
                      >{{
                        errors.itemsFields[form.items.indexOf(item)].unit && 'Unit is required.'
                      }}</span
                    >
                  </div>
                </div>
                <div
                  class="flex justify-end gap-2 mt-6 pt-2 border-t border-gray-200 dark:border-surface-700"
                >
                  <Button
                    icon="pi pi-trash"
                    label="Remove"
                    @click="() => removeItem(form.items.indexOf(item))"
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
</template>
