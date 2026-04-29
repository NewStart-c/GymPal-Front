<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="scheduleList" border>
      <el-table-column label="排班日期" align="center" prop="scheduleDate" />
      <el-table-column label="上班时间" align="center" prop="startTime" />
      <el-table-column label="下班时间" align="center" prop="endTime" />
      <el-table-column label="类型" align="center" prop="scheduleType" />
      <el-table-column label="工作内容" align="center" prop="workContent" />
    </el-table>
    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup>
import {coachSchedule} from '@/api/coach'
import {ref, onMounted} from 'vue'

const scheduleList = ref([])
const loading = ref(false)
const total = ref(0)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10
})

function getList() {
  loading.value = true
  coachSchedule(queryParams.value).then(res => {
    scheduleList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

onMounted(() => {
  getList()
})
</script>