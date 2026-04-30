<template>
  <div class="coach-dashboard">
    <!-- 顶部欢迎区域 -->
    <div class="dashboard-header">
      <div class="title">
        <h2>教练工作台 · 业绩数据分析</h2>
        <p>实时查看今日课程、学员与教学数据</p>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stat-card-group">
      <div class="stat-card blue">
        <div class="icon">📚</div>
        <div class="info">
          <p class="label">课程数量</p>
          <p class="num">{{ data.courseCount || 0 }}</p>
        </div>
      </div>

      <div class="stat-card green">
        <div class="icon">👥</div>
        <div class="info">
          <p class="label">学员预约</p>
          <p class="num">{{ data.reservationCount || 0 }}</p>
        </div>
      </div>

      <div class="stat-card orange">
        <div class="icon">⭐</div>
        <div class="info">
          <p class="label">平均评分</p>
          <p class="num">{{ Number(data.scoreAvg || 0).toFixed(2) }}</p>
        </div>
      </div>

      <div class="stat-card purple">
        <div class="icon">📊</div>
        <div class="info">
          <p class="label">总业绩</p>
          <p class="num">¥{{ Number(data.money || 0).toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-container">
      <el-card class="chart-card" shadow="hover">
        <h3>近7日预约趋势</h3>
        <div id="trendChart" style="width:100%;height:260px;"></div>
      </el-card>

      <el-card class="chart-card" shadow="hover">
        <h3>整体数据概览</h3>
        <div id="pieChart" style="width:100%;height:260px;"></div>
      </el-card>
    </div>

    <!-- 快捷功能区 -->
    <div class="quick-panel">
      <div class="panel-title">快捷操作</div>
      <div class="quick-btns">
        <div class="quick-item" @click="$router.push('/coach/course')">
          <div class="q-icon">📖</div>
          <span>我的课程</span>
        </div>
        <div class="quick-item" @click="$router.push('/coach/reservation')">
          <div class="q-icon">✅</div>
          <span>学员签到</span>
        </div>
        <div class="quick-item" @click="$router.push('/coach/evaluation')">
          <div class="q-icon">⭐</div>
          <span>我的评价</span>
        </div>
        <div class="quick-item" @click="$router.push('/coach/schedule')">
          <div class="q-icon">🗓️</div>
          <span>我的排班</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {coachDashboard} from '@/api/coach'
import {ref, onMounted, onUnmounted} from 'vue'
import * as echarts from 'echarts'

const data = ref({
  courseCount: 0,
  reservationCount: 0,
  scoreAvg: 0,
  money: 0,
  reservation7Days: [], // 7天数据
  courseTypeData: []    // 类型统计
})

let trendChart = null
let pieChart = null

onMounted(() => {
  coachDashboard().then(res => {
    data.value.courseCount = res.data.courseCount
    data.value.reservationCount = res.data.reservationCount
    data.value.scoreAvg = res.data.scoreAvg
    data.value.money = res.data.money

    data.value.reservation7Days = res.data.reservation7Days
    data.value.courseTypeData = res.data.courseTypeData

    initCharts()
  })
})

function initCharts() {
  // 折线图
  trendChart = echarts.init(document.getElementById('trendChart'))
  trendChart.setOption({
    xAxis: {
      type: 'category',
      //data: ['7天前', '6天前', '5天前', '4天前', '3天前', '2天前', '今日']
      data: ['今日', '2天前', '3天前', '4天前', '5天前', '6天前', '7天前']
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      smooth: true,
      data: data.value.reservation7Days, // 👈 真数据
      color: '#4E73F5'
    }]
  })

  // 饼图
  pieChart = echarts.init(document.getElementById('pieChart'))
  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    // legend: {
    //   orient: 'vertical',
    //   left: 'left',
    //   // 强制显示所有name，即使value为0
    //   data: data.value.courseTypeData.map(item => item.name)
    // },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        formatter: '{b}: {c}'
      },
      labelLine: {
        show: true
      },
      // 关键：过滤掉value=0的数据，避免影响显示
      data: data.value.courseTypeData.filter(item => item.value > 0)
    }]
  })
}

onUnmounted(() => {
  trendChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.coach-dashboard {
  width: 100%;
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 80px);
}

.dashboard-header {
  margin-bottom: 24px;
}

.title h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 4px 0;
}

.title p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 统计卡片 */
.stat-card-group {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 16px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-card.blue {
  background: linear-gradient(135deg, #4e73f5, #2150f6);
}

.stat-card.green {
  background: linear-gradient(135deg, #36cfa6, #00b49b);
}

.stat-card.orange {
  background: linear-gradient(135deg, #ff9f4a, #ff7733);
}

.stat-card.purple {
  background: linear-gradient(135deg, #9773F5, #7240F6);
}

.stat-card .icon {
  font-size: 32px;
  margin-right: 16px;
}

.stat-card .info {
  flex: 1;
}

.stat-card .label {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 4px 0;
}

.stat-card .num {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
}

/* 图表 */
.chart-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 16px;
  padding: 20px;
}

.chart-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px;
}

/* 快捷功能 */
.quick-panel {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.quick-btns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.3s;
}

.quick-item:hover {
  background: #e8f3ff;
  transform: translateY(-2px);
}

.q-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.quick-item span {
  font-size: 13px;
  color: #333;
}
</style>