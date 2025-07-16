<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4">User Information Form</h1>
    <form @submit.prevent="submitForm">
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="username" class="form-label">Username</label>
          <input
            type="text"
            class="form-control"
            id="username"
            v-model="formData.username"
          />
          <span v-if="errors.username" class="text-danger">{{ errors.username }}</span>
        </div>
        <div class="col-md-6">
          <label for="password" class="form-label">Password</label>
          <input
            type="password"
            class="form-control"
            id="password"
            v-model="formData.password"
          />
          <span v-if="errors.password" class="text-danger">{{ errors.password }}</span>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-6">
          <div class="form-check">
            <input
              type="checkbox"
              class="form-check-input"
              id="isAustralian"
              v-model="formData.isAustralian"
            />
            <label class="form-check-label" for="isAustralian">Australian Resident?</label>
          </div>
        </div>
        <div class="col-md-6">
          <label for="gender" class="form-label">Gender</label>
          <select
            class="form-select"
            id="gender"
            v-model="formData.gender"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <span v-if="errors.gender" class="text-danger">{{ errors.gender }}</span>
        </div>
      </div>

      <div class="mb-3">
        <label for="reason" class="form-label">Reason for joining</label>
        <textarea
          class="form-control"
          id="reason"
          v-model="formData.reason"
        ></textarea>
        <span v-if="errors.reason" class="text-danger">{{ errors.reason }}</span>
      </div>

      <div class="mb-3">
        <label for="address" class="form-label">Home Address</label>
        <input
          type="text"
          class="form-control"
          id="address"
          v-model="formData.address"
        />
        <span v-if="errors.address" class="text-danger">{{ errors.address }}</span>
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
          type="email"
          class="form-control"
          id="email"
          v-model="formData.email"
        />
        <span v-if="errors.email" class="text-danger">{{ errors.email }}</span>
      </div>

      <button type="submit" class="btn btn-primary me-2">Submit</button>
      <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
    </form>

    <DataTable :value="users" class="mt-5">
      <Column field="username" header="Username" />
      <Column field="password" header="Password" />
      <Column field="isAustralian" header="Resident" />
      <Column field="gender" header="Gender" />
      <Column field="reason" header="Reason" />
      <Column field="address" header="Address" />
      <Column field="email" header="Email" />
    </DataTable>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const formData = ref({
  username: '',
  password: '',
  isAustralian: false,
  gender: '',
  reason: '',
  address: '',
  email: ''
});

const users = ref([]);

const errors = ref({
  username: null,
  password: null,
  gender: null,
  reason: null,
  address: null,
  email: null
});

const validateForm = () => {
  let isValid = true;

  if (!formData.value.username) {
    errors.value.username = 'Username is required.';
    isValid = false;
  } else {
    errors.value.username = null;
  }

  if (!formData.value.password) {
    errors.value.password = 'Password is required.';
    isValid = false;
  } else {
    errors.value.password = null;
  }

  if (!formData.value.gender) {
    errors.value.gender = 'Gender is required.';
    isValid = false;
  } else {
    errors.value.gender = null;
  }

  if (!formData.value.reason) {
    errors.value.reason = 'Reason is required.';
    isValid = false;
  } else {
    errors.value.reason = null;
  }

  if (!formData.value.address || formData.value.address.length < 5) {
    errors.value.address = 'Address must be at least 5 characters.';
    isValid = false;
  } else {
    errors.value.address = null;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.value.email || !emailRegex.test(formData.value.email)) {
    errors.value.email = 'A valid email is required.';
    isValid = false;
  } else {
    errors.value.email = null;
  }

  return isValid;
};

const submitForm = () => {
  if (validateForm()) {
    users.value.push({ ...formData.value });
    clearForm();
  }
};

const clearForm = () => {
  formData.value = {
    username: '',
    password: '',
    isAustralian: false,
    gender: '',
    reason: '',
    address: '',
    email: ''
  };
};
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
