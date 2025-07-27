<template>
  <div class="my-4">
    <h3>Email Center</h3>
    <form @submit.prevent="sendEmail">
      <input v-model="recipient" class="form-control mb-2" placeholder="Recipient Email" required />
      <textarea v-model="message" class="form-control mb-2" placeholder="Your message" required></textarea>
      <button type="submit" class="btn btn-primary">Send</button>
    </form>
    <p v-if="status" class="mt-2">{{ status }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const recipient = ref('')
const message = ref('')
const status = ref('')

function sendEmail() {
  // Example simulated email sending
  status.value = `Email sent to ${recipient.value} with message: "${message.value}"`
  recipient.value = ''
  message.value = ''
}
</script>


