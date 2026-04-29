<template>
  <div>
    <h3>本月上课：{{ courseCount }} 节</h3>
    <h3>评分：{{ scoreAvg }}</h3>
  </div>
</template>

<script setup>
import { coachDashboard } from '@/api/coach'
const data = ref({})
onMounted(() => coachDashboard().then(res => data.value = res.data))
</script>