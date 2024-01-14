<script setup lang="ts">
defineProps({
  id: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: '',
    required: false
  },
  error: {
    type: String,
    default: '',
    required: false
  },
  type: {
    type: String,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
})
</script>

<template>
  <label :for="id">
    {{ id }}

    <input
      :placeholder="placeholder"
      :value="modelValue"
      :autocomplete="type"
      @input="$emit('update:modelValue', $event.target?.value)"
      :type="type"
      :id="id"
    />
    <span role="alert" v-if="error" class="field-error">{{ error }}</span>
  </label>
</template>

<style scoped lang="scss">
label {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.3rem;
  font-weight: 400;
  width: 100%;
}

.field-error {
  color: var(--red);
  font-weight: 400;
}

input {
  background: #1e1f22;
  border: none;
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
  padding-left: 0.5rem;
  color: var(--foreground);
}

input:focus {
  outline: var(--accent) solid 1px;
}
</style>
