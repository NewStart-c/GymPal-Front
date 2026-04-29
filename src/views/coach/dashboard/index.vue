<template>
  <div class="dashboard">
    <div class="box"><label>今日课程</label><span>{{ data.courseCount }}</span></div>
    <div class="box"><label>学员预约</label><span>{{ data.reservationCount }}</span></div>
    <div class="box"><label>评分</label><span>{{ data.scoreAvg }}</span></div>
  </div>
</template>

<script setup>
import { coachDashboard } from '@/api/coach'
const data = ref({})
onMounted(() => coachDashboard().then(res => data.value = res.data))
</script>