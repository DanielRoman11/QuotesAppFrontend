<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

// Campos del formulario
const form = ref({
  cliente: '',
  contacto: '',
  nit: '',
  email: '',
  direccion: '',
  telefono: '',
  ciudad: '',
})

const submitForm = () => {
  console.log('Datos del cliente:', form.value)
}
</script>

<template>
  <div class="p-6 mx-auto w-full">
    <h2 class="text-2xl font-semibold mb-6 text-surface-900 dark:text-surface-0">
      Información del Cliente
    </h2>

    <div class="md:grid-cols-2 gap-4 w-full flex-1">
      <div>
        <label class="block text-surface-700 dark:text-surface-200">Cliente</label>
        <InputText v-model="form.cliente" class="w-full" />
      </div>
      <div>
        <label class="block text-surface-700 dark:text-surface-200">Contacto</label>
        <InputText v-model="form.contacto" class="w-full" />
      </div>
      <div>
        <label class="block text-surface-700 dark:text-surface-200">NIT</label>
        <InputText v-model="form.nit" class="w-full" />
      </div>
      <div>
        <label class="block text-surface-700 dark:text-surface-200">Email</label>
        <InputText v-model="form.email" type="email" class="w-full" />
      </div>
      <div class="md:col-span-2">
        <label class="block text-surface-700 dark:text-surface-200">Dirección</label>
        <Textarea v-model="form.direccion" autoResize rows="3" class="w-full" />
      </div>
      <div>
        <label class="block text-surface-700 dark:text-surface-200">Teléfono</label>
        <InputText v-model="form.telefono" class="w-full" />
      </div>
      <div>
        <label class="block text-surface-700 dark:text-surface-200">Ciudad</label>
        <InputText v-model="form.ciudad" class="w-full" />
      </div>
    </div>

    <div class="mt-6 flex justify-end">
      <Button label="Guardar" icon="pi pi-save" @click="submitForm" />
    </div>
  </div>
</template>
