<script setup lang="ts">
defineProps({
  img: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="container">
    <div class="img-group" :class="status === 'online' ? 'green' : 'red'">
      <img :src="img" alt="profile picture" />
    </div>
    <div class="group">
      <h3>
        <slot></slot>
      </h3>
      <p>{{ email }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;

  img {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    object-fit: cover;
  }

  .group {
    h3 {
      font-size: 1.25rem;
      font-weight: 400;
    }

    p {
      font-weight: 300;
      font-size: 1rem;
    }
  }

  .img-group {
    position: relative;
  }

  .img-group::after {
    content: '';
    position: absolute;
    bottom: 0.4rem;
    right: 0.2rem;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: var(--red);
  }

  .green::after {
    content: '';
    position: absolute;
    bottom: 0.4rem;
    right: 0.2rem;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: var(--green);
  }
}
</style>
