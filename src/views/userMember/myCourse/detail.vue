<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="left">
        <h1 class="main-title">{{ courseInfo.courseName }}</h1>
        <p class="sub-title">专业健身课程 · 线上预约</p>
      </div>
      <el-button type="primary" round icon="Back" @click="goBack">返回课程列表</el-button>
    </div>

    <!-- 卡片布局：左侧课程信息 + 右侧教练信息 -->
    <div class="card-container">
      <!-- 左侧：课程主卡片 -->
      <el-card class="card-left" shadow="hover">
        <div class="card-body">
          <div class="course-info-group">
            <div class="info-item">
              <div class="icon-wrapper clock">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="text">
                <label>上课时间</label>
                <span>{{ parseTime(courseInfo.startTime, '{y}-{m}-{d} {h}:{i}') }}-{{ parseTime(courseInfo.endTime, '{h}:{i}') }}</span>
              </div>
            </div>

            <div class="info-item">
              <div class="icon-wrapper location">
                <el-icon><Location /></el-icon>
              </div>
              <div class="text">
                <label>上课地点</label>
                <span>{{ courseInfo.location || '健身房训练区' }}</span>
              </div>
            </div>

            <div class="info-item">
              <div class="icon-wrapper user">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="text">
                <label>教练</label>
                <span>{{ trainerInfo.trainerName || '专业教练' }}</span>
              </div>
            </div>

            <div class="info-item">
              <div class="icon-wrapper people">
                <el-icon><User /></el-icon>
              </div>
              <div class="text">
                <label>名额状态</label>
                <span>
                  {{ courseInfo.currentEnrollment || 0 }}/{{ courseInfo.maxCapacity || 0 }}人
                  <el-tag v-if="(courseInfo.currentEnrollment || 0) >= (courseInfo.maxCapacity || 0)" type="danger" size="small">已满员</el-tag>
                  <el-tag v-else type="success" size="small">可预约</el-tag>
                </span>
              </div>
            </div>
          </div>

          <!-- 课程介绍 -->
          <div class="course-intro-card">
            <h3 class="intro-title">
              <el-icon class="title-icon"><Document /></el-icon>
              课程介绍
            </h3>
            <div class="intro-content">
              {{ courseInfo.remark || '本课程专注科学健身、提升体能、增强体质，适合各阶段健身爱好者。专业教练一对一指导，让运动更高效、更安全。' }}
            </div>
          </div>
        </div>
      </el-card>

      <!-- 右侧：教练卡片 + 评价卡片 -->
      <div class="card-right">
        <!-- 教练信息 -->
        <el-card class="trainer-card" shadow="hover">
          <div class="trainer-top">
            <el-avatar :size="60" :src="trainerInfo.imageUrls ? JSON.parse(trainerInfo.imageUrls)[0] : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" />
            <div class="trainer-meta">
              <h4>{{ trainerInfo.trainerName || '未知教练' }}</h4>
              <p>{{ trainerInfo.specialties ? JSON.parse(trainerInfo.specialties).join(' • ') : '健身指导 | 体能训练' }}</p>
            </div>
          </div>

          <div class="trainer-bio">
            {{ trainerInfo.experience || '持有专业健身教练资格证，拥有多年教学经验，擅长帮助学员高效达成运动目标。' }}
          </div>

          <div class="score-section">
            <span>教练评分</span>
            <div class="score-row">
              <el-rate v-model="trainerAvgScore" disabled :show-score="true" score-template="{value}分" />
              <span class="count">({{ evaluationTotal }}人评价)</span>
            </div>
          </div>
        </el-card>

        <!-- 学员评价 -->
        <el-card class="comment-card" shadow="hover">
          <div class="comment-header">
            <h4>学员评价</h4>
          </div>
          <div class="comment-list">
            <div v-for="(item, index) in evaluationList" :key="index" class="comment-item">
              <div class="user">
                <span>{{ item.memberName || '匿名会员' }}</span>
                <el-rate v-model="item.score" disabled />
              </div>
              <div class="time">{{ parseTime(item.evaluationTime, '{y}-{m}-{d}') }}</div>
              <div class="content">{{ item.comment || '课程很棒，教练专业！' }}</div>
            </div>

            <div v-if="evaluationList.length === 0" class="empty">
              <el-empty description="暂无评价" size="small" />
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup name="MemberCourseDetail">
import { getCourse } from "@/api/courseManagement/course"
import { getTrainer, selectTranierUserInfo } from "@/api/trainerManagement/trainer"
import { listEvaluation } from "@/api/trainerManagement/evaluation"
import { getUser } from "@/api/system/user"

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const courseId = ref(route.query.courseId)
const courseInfo = ref({})
const trainerInfo = ref({})
const evaluationList = ref([])
const evaluationTotal = ref(0)
const trainerAvgScore = ref(0)

const user = ref({})

onMounted(() => {
  getCourseDetail()
})

function getCourseDetail() {
  getCourse(courseId.value).then(res => {
    courseInfo.value = res.data
    if (courseInfo.value.trainerId) {
      getTrainerInfo(courseInfo.value.trainerId)
      getTrainerEvaluation(courseInfo.value.trainerId)
    }
  })
}

async function getTrainerInfo(trainerId) {
  await getTrainer(trainerId).then(res => {
    trainerInfo.value = { ...res.data, trainerName: res.data.employeeName || '教练' }
  })
  await selectTranierUserInfo(trainerInfo.value.employeeId).then(res =>{
    user.value = res.data
  })
  trainerInfo.value.trainerName = user.value.nickName

  console.log(trainerInfo.value);
}

function getTrainerEvaluation(trainerId) {
  listEvaluation({ trainerId: trainerId, pageNum: 1, pageSize: 5 }).then(res => {
    evaluationList.value = res.rows || []
    evaluationTotal.value = res.total || 0
    if (evaluationTotal.value > 0) {
      const total = evaluationList.value.reduce((s, i) => s + Number(i.score), 0)
      trainerAvgScore.value = (total / evaluationTotal.value).toFixed(1)
    }
  })
}

function goBack() {
  router.back()
}
</script>

<style scoped>
/* 背景与容器 */
.app-container {
  padding: 28px;
  background: linear-gradient(135deg, #f7f8fa 0%, #f2f5f9 100%);
  min-height: 100vh;
}

/* 顶部标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.main-title {
  font-size: 26px;
  font-weight: 700;
  color: #1d2129;
  margin: 0;
}

.sub-title {
  font-size: 14px;
  color: #86909c;
  margin: 0;
}

/* 卡片布局 */
.card-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

/* 左侧卡片 */
.card-left {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #eaf0fa;
}

.card-left :deep(.el-card__body) {
  padding: 32px;
}

/* 信息组 */
.course-info-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #fafbfc;
  border-radius: 16px;
  transition: 0.3s;
}

.info-item:hover {
  background: #f0f5ff;
  transform: translateY(-2px);
}

.icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.icon-wrapper.clock {
  background: #e8faf2;
  color: #00b42a;
}
.icon-wrapper.location {
  background: #fff7e8;
  color: #ff7d00;
}
.icon-wrapper.user {
  background: #e8f3ff;
  color: #0066ff;
}
.icon-wrapper.people {
  background: #f8f0fc;
  color: #9254de;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.text label {
  font-size: 13px;
  color: #86909c;
}

.text span {
  font-size: 15px;
  font-weight: 500;
  color: #1d2129;
}

/* 课程介绍 */
.course-intro-card {
  background: #fafbfc;
  border-radius: 16px;
  padding: 24px;
}

.intro-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: #0066ff;
  font-size: 18px;
}

.intro-content {
  font-size: 15px;
  color: #4e5969;
  line-height: 1.8;
}

/* 右侧卡片组 */
.card-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 教练卡片 */
.trainer-card {
  border-radius: 20px;
  border: 1px solid #eaf0fa;
  overflow: hidden;
}

.trainer-card :deep(.el-card__body) {
  padding: 28px;
}

.trainer-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.trainer-meta h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1d2129;
}

.trainer-meta p {
  font-size: 13px;
  color: #86909c;
  margin: 0;
}

.trainer-bio {
  font-size: 14px;
  color: #4e5969;
  line-height: 1.7;
  padding-bottom: 16px;
  border-bottom: 1px solid #eaf0fa;
  margin-bottom: 16px;
}

.score-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.score-section span {
  font-size: 14px;
  color: #86909c;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.count {
  font-size: 13px !important;
  color: #86909c !important;
}

/* 评价卡片 */
.comment-card {
  border-radius: 20px;
  border: 1px solid #eaf0fa;
}

.comment-card :deep(.el-card__body) {
  padding: 28px;
}

.comment-header {
  margin-bottom: 16px;
}

.comment-header h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.comment-list {
  max-height: 380px;
  overflow-y: auto;
}

.comment-item {
  padding: 14px 0;
  border-bottom: 1px solid #f2f3f5;
}

.comment-item:last-child {
  border-bottom: none;
}

.user {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.user span {
  font-size: 15px;
  font-weight: 500;
  color: #1d2129;
}

.time {
  font-size: 12px;
  color: #c9cdd4;
  margin-bottom: 6px;
}

.content {
  font-size: 14px;
  color: #4e5969;
  line-height: 1.6;
}

.empty {
  padding: 30px 0;
}

/* 响应式 */
@media (max-width: 1024px) {
  .card-container {
    grid-template-columns: 1fr;
  }
}
</style>