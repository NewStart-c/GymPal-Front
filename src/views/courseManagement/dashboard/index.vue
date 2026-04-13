<template>
  <div class="app-container">
    <!-- 顶部：数据概览卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-item blue">
            <div class="label">总课程数</div>
            <div class="value">{{ statData.totalCourse }}</div>
            <div class="unit">门</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-item green">
            <div class="label">总预约人次</div>
            <div class="value">{{ statData.totalReservation }}</div>
            <div class="unit">人</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-item orange">
            <div class="label">课程总收入</div>
            <div class="value">¥{{ statData.totalIncome }}</div>
            <div class="unit">元</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-item red">
            <div class="label">全站平均评分</div>
            <div class="value">{{ statData.avgScore }}</div>
            <div class="unit">分</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行：筛选 + 多图表 -->
    <el-row :gutter="20" class="mt20">
      <el-col :span="24">
        <el-card shadow="hover">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px">
            <span>数据分析中心</span>
            <el-button-group size="small">
              <el-button :type="timeRange==='day'?'primary':'default'" @click="timeRange='day';loadAllData()">今日</el-button>
              <el-button :type="timeRange==='week'?'primary':'default'" @click="timeRange='week';loadAllData()">本周</el-button>
              <el-button :type="timeRange==='month'?'primary':'default'" @click="timeRange='month';loadAllData()">本月</el-button>
            </el-button-group>
          </div>

          <el-row :gutter="20">
            <el-col :span="6">
              <div class="chart-title">课程类型收入</div>
              <pie-chart :chart-data="incomePieData" :chart-height="220" />
            </el-col>
            <el-col :span="6">
              <div class="chart-title">课程状态分布</div>
              <pie-chart :chart-data="statusPieData" :chart-height="220" />
            </el-col>
            <el-col :span="12">
              <div class="chart-title">每日预约人数趋势</div>
              <line-chart :chart-data="trendData" :height="220" />
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第三行：热门课程 + 教练人气 -->
    <el-row :gutter="20" class="mt20">
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">热门课程预约排名</div>
          <bar-chart :chart-data="hotCourseData" :height="260" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">教练人气评分排名</div>
          <bar-chart :chart-data="trainerRankData" :height="260" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 第四行：课程详情表格 -->
    <el-card class="mt20" shadow="hover">
      <div slot="header">
        <span>课程统计一览表</span>
        <el-tag style="margin-left:10px" type="info" size="small">共 {{ tableData.length }} 门课程</el-tag>
      </div>
      <el-table :data="tableData" border stripe>
        <el-table-column label="课程名称" prop="courseName" align="center" />
        <el-table-column label="课程类型" prop="courseType" align="center" />
        <el-table-column label="课程状态" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '0' ? 'warning' : scope.row.status === '1' ? 'success' : 'info'">
              {{ scope.row.status === '0' ? '待开始' : scope.row.status === '1' ? '进行中' : '已结束' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="总预约" prop="reserveCount" align="center" />
        <el-table-column label="预约率" align="center">
          <template #default="scope">
            <el-progress :percentage="scope.row.rate" :width="120" show-text />
          </template>
        </el-table-column>
        <el-table-column label="收入" align="center">
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
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'

import PieChart from './components/pieChart.vue'
import BarChart from './components/barChart.vue'
import LineChart from './components/lineChart.vue'

import { listCourse } from '@/api/courseManagement/course'
import { listCourseReservation } from '@/api/courseManagement/courseReservation'
import { listCourseOrder } from '@/api/courseManagement/courseOrder'
import { listCourseEvaluation } from '@/api/courseManagement/courseEvaluation'
import { listTrainer } from '@/api/trainerManagement/trainer'
import { listUser } from "@/api/system/user.js";

const tableData = ref([])
const incomePieData = ref([])
const statusPieData = ref([])
const hotCourseData = ref([])
const trainerRankData = ref([])
const trendData = ref([])
const timeRange = ref('week')

const statData = ref({
  totalCourse: 0,
  totalReservation: 0,
  totalIncome: 0,
  avgScore: 0
})

const colorList = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']

onMounted(() => {
  loadAllData()
})

async function loadAllData() {
  try {
    const courseRes = await listCourse({pageSize: 100})
    const reserveRes = await listCourseReservation({pageSize: 100})
    const orderRes = await listCourseOrder({pageSize: 100})
    const evalRes = await listCourseEvaluation({pageSize: 100})
    const trainerRes = await listTrainer({pageSize: 100})

    const courses = courseRes.rows || []
    const reserves = reserveRes.rows || []
    const orders = orderRes.rows || []
    const evals = evalRes.rows || []
    const trainers = trainerRes.rows || []

    // 课程基础映射
    const courseMap = {}
    courses.forEach(c => {
      courseMap[c.courseId] = {
        courseId: c.courseId,
        courseName: c.courseName,
        courseType: c.courseType || '其他',
        status: c.status || '0',
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

    // 表格数据
    const arr = Object.values(courseMap).map(item => {
      const rate = Math.round((item.reserveCount / item.max) * 100)
      const score = item.evalCount ? Number((item.totalScore / item.evalCount).toFixed(1)) : 0
      return {...item, rate: Math.min(100, Math.max(0, rate)), score}
    })
    tableData.value = arr

    // 顶部统计
    statData.value.totalCourse = arr.length
    statData.value.totalReservation = arr.reduce((t, i) => t + i.reserveCount, 0)
    statData.value.totalIncome = arr.reduce((t, i) => t + i.income, 0).toFixed(0)
    const allScore = arr.filter(i => i.score > 0)
    statData.value.avgScore = allScore.length
        ? Number((allScore.reduce((t, i) => t + i.score, 0) / allScore.length).toFixed(1))
        : 0

    // 热门课程
    hotCourseData.value = arr
        .sort((a, b) => b.reserveCount - a.reserveCount)
        .slice(0, 5)
        .map(i => ({name: i.courseName, value: i.reserveCount}))

    // 收入饼图
    const typeMap = {}
    arr.forEach(i => {
      typeMap[i.courseType] = (typeMap[i.courseType] || 0) + i.income
    })
    incomePieData.value = Object.entries(typeMap).map(([t, v], i) => ({
      type: t,
      value: Math.round(v),
      color: colorList[i % colorList.length]
    }))

    // 状态饼图
    const statusMap = {0: 0, 1: 0, 2: 0}
    arr.forEach(i => statusMap[i.status]++)
    statusPieData.value = [
      {type: '待开始', value: statusMap[0], color: '#E6A23C'},
      {type: '进行中', value: statusMap[1], color: '#67C23A'},
      {type: '已结束', value: statusMap[2], color: '#909399'}
    ]

    // 教练人气排名（关联 sys_user 昵称）
    // ==============================
    const userRes = await listUser({ pageSize: 100 }) // 加载用户表

    const users = userRes.rows || []

// 建立用户 ID => 昵称映射
    const userMap = {}
    users.forEach(u => {
      userMap[u.userId] = u.nickName  // 若依字段：userId / nickName
    })

// 教练评分统计
    const trainerScoreMap = {}
    courses.forEach(c => {
      trainerScoreMap[c.trainerId] = { total: 0, count: 0 }
    })
    evals.forEach(e => {
      const c = courseMap[e.courseId]
      if (!c) return
      const courseInfo = courses.find(x => x.courseId === c.courseId)
      const tid = courseInfo?.trainerId
      if (tid && trainerScoreMap[tid]) {
        trainerScoreMap[tid].total += e.score
        trainerScoreMap[tid].count++
      }
    })

// 最终排名（显示真实昵称）
    trainerRankData.value = trainers
        .map(t => {
          const name = userMap[t.employeeId] || '未知教练'
          const scoreObj = trainerScoreMap[t.trainerId] || { total: 0, count: 0 }
          const score = scoreObj.count
              ? Number((scoreObj.total / scoreObj.count).toFixed(1))
              : 0
          return { name, value: score }
        })
        .filter(i => i.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

    // 趋势图（模拟）
    trendData.value = [
      {date: '周一', value: Math.floor(Math.random() * 50 + 20)},
      {date: '周二', value: Math.floor(Math.random() * 50 + 25)},
      {date: '周三', value: Math.floor(Math.random() * 50 + 30)},
      {date: '周四', value: Math.floor(Math.random() * 50 + 35)},
      {date: '周五', value: Math.floor(Math.random() * 50 + 40)},
      {date: '周六', value: Math.floor(Math.random() * 50 + 50)},
      {date: '周日', value: Math.floor(Math.random() * 50 + 45)}
    ]
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

.stat-card {
  height: 100%;
}

.stat-item {
  padding: 10px 0;
  text-align: center;
}

.stat-item .label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-item .value {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-item .unit {
  font-size: 12px;
  color: #999;
}

.blue .value {
  color: #409EFF;
}

.green .value {
  color: #67C23A;
}

.orange .value {
  color: #E6A23C;
}

.red .value {
  color: #F56C6C;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #333;
  text-align: center;
}
</style>