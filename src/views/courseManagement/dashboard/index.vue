<template>
  <div class="app-container">
    <!-- 顶部饼图：课程类型收入占比 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">课程类型收入占比</div>
          <pie-chart :chart-data="incomePieData" :chart-height="300" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">热门课程预约排名</div>
          <bar-chart :chart-data="hotCourseData" :height="300" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 课程统计表格 -->
    <el-card class="mt20" shadow="hover">
      <div slot="header" style="margin: 0 0 20px 0">课程统计一览表</div>
      <el-table :data="tableData"  stripe>
        <el-table-column label="课程名称" prop="courseName" align="center" />
        <el-table-column label="课程类型" prop="courseType" align="center" />
        <el-table-column label="总预约人数" prop="reserveCount" align="center" />
        <el-table-column label="预约率" align="center">
          <template #default="scope">
            <div style="display:flex;align-items:center;justify-content:center">
              <el-progress :percentage="scope.row.rate" :width="120" show-text />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="课程收入" align="center">
          <template #default="scope">¥{{ scope.row.income }}</template>
        </el-table-column>
        <el-table-column label="平均评分" align="center">
          <template #default="scope">
            <el-rate :value="scope.row.score" disabled />
            <span style="margin-left:8px">{{ scope.row.score }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 组件
import PieChart from './components/pieChart.vue'
import BarChart from './components/barChart.vue'

// 接口（你提供的）
import { listCourse } from '@/api/courseManagement/course'
import { listCourseReservation } from '@/api/courseManagement/courseReservation'
import { listCourseOrder } from '@/api/courseManagement/courseOrder'
import { listCourseEvaluation } from '@/api/courseManagement/courseEvaluation.js'

// 数据
const tableData = ref([])
const incomePieData = ref([])
const hotCourseData = ref([])

// 颜色
const colorList = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']

onMounted(() => {
  loadAllData()
})

// 统一加载并前端统计
async function loadAllData() {
  try {
    // 1. 课程列表
    const courseRes = await listCourse({ pageSize: 100 })
    const courses = courseRes.rows || []

    // 2. 预约
    const reserveRes = await listCourseReservation({ pageSize: 100 })
    const reserves = reserveRes.rows || []

    // 3. 订单收入
    const orderRes = await listCourseOrder({ pageSize: 100 })
    const orders = orderRes.rows || []

    // 4. 课程评价
    const evalRes = await listCourseEvaluation({ pageSize: 100 })
    const evals = evalRes.rows || []

    // ==========================================
    // 前端聚合统计（核心：不依赖后端接口）
    // ==========================================

    // 1. 按课程统计
    const courseMap = {}
    courses.forEach(c => {
      courseMap[c.courseId] = {
        courseId: c.courseId,
        courseName: c.courseName,
        courseType: c.courseType || '其他',
        max: c.maxCapacity || 1,
        reserveCount: 0,
        income: 0,
        score: 0,
        evalCount: 0,
        totalScore: 0
      }
    })

    // 预约统计
    reserves.forEach(r => {
      if (courseMap[r.courseId]) courseMap[r.courseId].reserveCount++
    })

    // 收入统计
    orders.forEach(o => {
      if (courseMap[o.courseId]) courseMap[o.courseId].income += o.amount
    })

    // 评分统计
    evals.forEach(e => {
      const c = courseMap[e.courseId]
      if (c) {
        c.evalCount++
        c.totalScore += e.score
      }
    })

    // 最终表格
    const arr = Object.values(courseMap).map(item => {
      const rate = Math.round((item.reserveCount / item.max) * 100)
      const score = item.evalCount
          ? Number((item.totalScore / item.evalCount).toFixed(1))
          : 0

      return {
        ...item,
        rate: rate > 100 ? 100 : rate < 0 ? 0 : rate,
        score
      }
    })

    tableData.value = arr

    // ==========================================
    // 热门课程柱状图
    // ==========================================
    hotCourseData.value = arr
        .sort((a, b) => b.reserveCount - a.reserveCount)
        .slice(0, 5)
        .map(i => ({ name: i.courseName, value: i.reserveCount }))

    // ==========================================
    // 收入饼图
    // ==========================================
    const typeMap = {}
    arr.forEach(i => {
      const t = i.courseType
      if (!typeMap[t]) typeMap[t] = 0
      typeMap[t] += i.income
    })

    incomePieData.value = Object.entries(typeMap).map(([type, value], idx) => ({
      type,
      value: Math.round(value),
      color: colorList[idx % colorList.length]
    }))

  } catch (e) {
    ElMessage.error('数据加载失败')
    console.error(e)
  }
}
</script>

<style scoped>
.mt20 {
  margin-top: 20px;
}
</style>