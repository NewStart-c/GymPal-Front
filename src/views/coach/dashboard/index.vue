<template>
  <div class="coach-dashboard">
    <!-- 顶部欢迎区域 -->
    <div class="dashboard-header">
      <div class="title">
        <h2>教练工作台</h2>
        <p>实时查看今日课程、学员与教学数据</p>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stat-card-group">
      <div class="stat-card blue">
        <div class="icon">📚</div>
        <div class="info">
          <p class="label">今日课程</p>
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
          <p class="num">{{ data.scoreAvg || 0.0 }}</p>
        </div>
      </div>
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
import { coachDashboard } from '@/api/coach'
import { ref, onMounted } from 'vue'

const data = ref({
  courseCount: 0,
  reservationCount: 0,
  scoreAvg: 0
})

onMounted(() => {
  coachDashboard().then(res => {
    data.value.courseCount = res.courseCount
    data.value.reservationCount = res.reservationCount
    data.value.scoreAvg = res.scoreAvg
  })
})
</script>

<style scoped>
.coach-dashboard {
  width: 100%;
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 80px);
}

/* 头部 */
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
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  flex: 1;
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