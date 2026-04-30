<template>
  <div class="coach-statistics">
    <!-- 头部 -->
    <div class="stat-header">
      <h2>业绩数据分析</h2>
      <p>课程、学员、收入、评分一站式统计</p>
    </div>

    <!-- 数据卡片 -->
    <div class="card-group">
      <div class="card blue">
        <div class="icon">📚</div>
        <div class="info">
          <p class="label">总授课数</p>
          <p class="num">{{ data.courseCount || 0 }}</p>
        </div>
      </div>

      <div class="card green">
        <div class="icon">👥</div>
        <div class="info">
          <p class="label">总学员数</p>
          <p class="num">{{ data.reservationCount || 0 }}</p>
        </div>
      </div>

      <div class="card orange">
        <div class="icon">⭐</div>
        <div class="info">
          <p class="label">平均评分</p>
          <p class="num">{{ data.scoreAvg || 0.0 }}</p>
        </div>
      </div>

      <div class="card purple">
        <div class="icon">💰</div>
        <div class="info">
          <p class="label">课程收入</p>
          <p class="num">¥{{ data.income || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-wrapper">
      <el-card shadow="hover" class="chart-card">
        <h3>本月课程预约趋势</h3>
        <div id="trendChart" style="width:100%;height:300px;"></div>
      </el-card>

      <el-card shadow="hover" class="chart-card">
        <h3>课程类型占比</h3>
        <div id="typeChart" style="width:100%;height:300px;"></div>
      </el-card>
    </div>

    <!-- 近期评价 -->
    <el-card shadow="hover" class="eval-card">
      <h3>近期学员评价</h3>
      <div class="eval-items">
        <div class="eval-item" v-for="item in recentEvals" :key="item.evaluationId">
          <el-rate :value="item.score" disabled allow-disabled-color color="#ffad42" />
          <div class="text">{{ item.comment || '无评价内容' }}</div>
          <div class="date">{{ item.createTime }}</div>
        </div>
        <div class="empty" v-if="recentEvals.length === 0">暂无评价</div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { coachDashboard } from '@/api/coach'
import * as echarts from 'echarts'

const data = ref({
  courseCount: 0,
  reservationCount: 0,
  scoreAvg: 0,
  income: 0
})

const recentEvals = ref([])
let trendChart = null
let typeChart = null

// 加载业绩数据
function loadData() {
  coachDashboard().then(res => {
    data.value = res.data
    data.value.income = (res.data.reservationCount || 0) * 80 // 模拟收入
    recentEvals.value = [
      { score: 5, comment: '教练很专业，上课体验很好', createTime: '2026-04-29' },
      { score: 5, comment: '动作讲解清晰，耐心十足', createTime: '2026-04-28' },
      { score: 4, comment: '课程强度适中，效果不错', createTime: '2026-04-27' }
    ]
    initCharts()
  })
}

// 初始化图表
function initCharts() {
  // 趋势图
  trendChart = echarts.init(document.getElementById('trendChart'))
  trendChart.setOption({
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['1周前', '6天前', '5天前', '4天前', '3天前', '2天前', '今天'] },
    yAxis: { type: 'value' },
    series: [{
      data: [3, 5, 2, 6, 7, 4, data.value.courseCount || 0],
      type: 'line',
      smooth: true,
      lineStyle: { width: 3, color: '#4e73f5' },
      itemStyle: { color: '#4e73f5' }
    }]
  })

  // 饼图
  typeChart = echarts.init(document.getElementById('typeChart'))
  typeChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      name: '课程类型',
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 5, name: '瑜伽' },
        { value: 8, name: '有氧' },
        { value: 6, name: '力量' },
        { value: 3, name: '塑形' }
      ]
    }]
  })
}

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  trendChart?.dispose()
  typeChart?.dispose()
})
</script>

<style scoped>
.coach-statistics {
  width: 100%;
  padding: 20px 0;
}

/* 头部 */
.stat-header {
  margin-bottom: 24px;
}
.stat-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 4px 0;
}
.stat-header p {
  font-size: 14px;
  color: #888;
  margin: 0;
}

/* 数据卡片 */
.card-group {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 16px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.card.blue { background: linear-gradient(135deg, #4e73f5, #2150f6); }
.card.green { background: linear-gradient(135deg, #36cfa6, #00b49b); }
.card.orange { background: linear-gradient(135deg, #ff9f4a, #ff7733); }
.card.purple { background: linear-gradient(135deg, #9773f5, #7240f6); }

.card .icon {
  font-size: 32px;
  margin-right: 16px;
}
.card .info { flex: 1; }
.card .label { font-size: 14px; opacity: 0.9; margin: 0 0 4px; }
.card .num { font-size: 26px; font-weight: bold; margin: 0; }

/* 图表 */
.chart-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

/* 评价 */
.eval-card {
  border-radius: 16px;
  padding: 20px;
}
.eval-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px;
}
.eval-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.eval-item {
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
}
.eval-item .text {
  margin: 6px 0;
  font-size: 14px;
  color: #333;
}
.eval-item .date {
  font-size: 12px;
  color: #999;
}
.empty {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>