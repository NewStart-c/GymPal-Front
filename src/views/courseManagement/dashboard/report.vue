<template>
  <div class="report-container">
    <el-row :gutter="20">
      <!-- 左侧：热门课程排名 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>热门课程排名</span>
            <el-button type="primary" size="mini" icon="el-icon-view" @click="viewRankDetail">查看详情</el-button>
          </div>
          <bar-chart :chart-data="hotCourseData" />
        </el-card>
      </el-col>

      <!-- 右侧：课程预约趋势 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>课程预约率趋势</span>
            <el-button-group size="mini">
              <el-button type="primary" :type="timeType === '7' ? 'primary' : 'default'" @click="getTimeData('7')">7天</el-button>
              <el-button type="primary" :type="timeType === '30' ? 'primary' : 'default'" @click="getTimeData('30')">30天</el-button>
              <el-button type="primary" :type="timeType === '90' ? 'primary' : 'default'" @click="getTimeData('90')">90天</el-button>
            </el-button-group>
          </div>
          <line-chart :chart-data="reservationTrendData" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部：课程类型收入占比（与仪表盘复用） -->
    <el-card shadow="hover" class="bottom-card">
      <div slot="header" class="clearfix">
        <span>课程类型收入占比</span>
        <el-button type="primary" size="mini" icon="el-icon-download">导出报表</el-button>
      </div>
      <pie-chart :chart-data="incomeTypeData" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import barChart from './components/barChart.vue'
import lineChart from './components/lineChart.vue'
import pieChart from './components/pieChart.vue'
import { getHotCourseRank, getReservationTrend, getCourseIncomeType } from '@/api/courseManagement/course'

// 数据定义
const hotCourseData = ref([]) // 热门排名数据
const reservationTrendData = ref([]) // 预约趋势数据
const incomeTypeData = ref([]) // 收入占比数据
const timeType = ref('7') // 时间类型：7/30/90天

// 初始化
onMounted(() => {
  getHotCourseData()
  getReservationTrendData()
  getIncomeTypeData()
})

// 1. 获取热门课程排名
const getHotCourseData = async () => {
  try {
    const res = await getHotCourseRank({ timeType: timeType.value })
    if (res.code === 200) {
      hotCourseData.value = res.rows.map(item => ({
        name: item.courseName,
        value: item.reservationCount
      }))
    }
  } catch (error) {
    ElMessage.error('获取热门课程数据失败')
  }
}

// 2. 获取预约趋势数据
const getReservationTrendData = async () => {
  try {
    const res = await getReservationTrend({ timeType: timeType.value })
    if (res.code === 200) {
      reservationTrendData.value = res.rows.map(item => ({
        date: item.statDate,
        value: item.reservationRate
      }))
    }
  } catch (error) {
    ElMessage.error('获取预约趋势数据失败')
  }
}

// 3. 获取收入占比数据
const getIncomeTypeData = async () => {
  try {
    const res = await getCourseIncomeType({})
    if (res.code === 200) {
      const colorMap = { 有氧运动: '#409EFF', 力量训练: '#67C23A', 瑜伽: '#E6A23C' }
      incomeTypeData.value = res.rows.map(item => ({
        type: item.courseType,
        value: item.incomeAmount,
        percent: item.incomePercent,
        color: colorMap[item.courseType] || '#909399'
      }))
    }
  } catch (error) {
    ElMessage.error('获取收入占比数据失败')
  }
}

// 时间类型切换
const getTimeData = (type) => {
  timeType.value = type
  getHotCourseData()
  getReservationTrendData()
}

// 查看排名详情
const viewRankDetail = () => {
  ElMessage.info('暂未开发排名详情页')
}
</script>

<style scoped>
.report-container {
  padding: 20px;
}
.bottom-card {
  margin-top: 20px;
}
</style>