<template>
  <el-table :data="list">
    <el-table-column label="学员" prop="memberId" />
    <el-table-column label="课程" prop="courseId" />
    <el-table-column label="操作">
      <template #default="scope">
        <el-button @click="sign(scope.row.reservationId)">签到</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { coachReservation, coachSign } from '@/api/coach'
const list = ref([])
onMounted(() => coachReservation().then(res => list.value = res.rows))
const sign = (id) => coachSign(id).then(() => alert('签到成功'))
</script>