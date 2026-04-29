<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="courseList" border>
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="课程类型" align="center" prop="courseType" />
      <el-table-column label="开始时间" align="center" prop="startTime" />
      <el-table-column label="地点" align="center" prop="location" />
      <el-table-column label="容量" align="center" prop="maxCapacity" />
      <el-table-column label="已报名" align="center" prop="currentEnrollment" />
      <el-table-column label="状态" align="center" prop="status" />
    </el-table>
    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup>
import {coachCourse} from '@/api/coach'
import {ref, onMounted} from 'vue'

const courseList = ref([])
const loading = ref(false)
const total = ref(0)
const queryParams = ref({pageNum: 1, pageSize: 10})

function getList() {
  loading.value = true
  coachCourse(queryParams.value).then(res => {
    courseList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

onMounted(() => getList())
</script>