<template>
  <div>
    <el-form v-model="form">
      <el-form-item label="专长"><el-input v-model="form.specialties" /></el-form-item>
      <el-form-item label="经验"><el-input v-model="form.experience" type="textarea" /></el-form-item>
      <el-button @click="submit">保存</el-button>
    </el-form>
  </div>
</template>

<script setup>
import { coachProfile, updateCoachProfile } from '@/api/coach'
const form = ref({})
onMounted(() => coachProfile().then(res => form.value = res.data))
const submit = () => updateCoachProfile(form.value).then(() => alert('保存成功'))
</script>