<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <h1 class="main-title">我的课程预约</h1>
      <el-button type="primary" round icon="Refresh" @click="getList">刷新</el-button>
    </div>

    <!-- 状态筛选 -->
    <div class="status-tabs">
      <el-button
          round
          :type="activeStatus === '' ? 'primary' : 'default'"
          @click="switchStatus('')"
      >全部</el-button>
      <el-button
          round
          :type="activeStatus === '0' ? 'primary' : 'default'"
          @click="switchStatus('0')"
      >待支付</el-button>
      <el-button
          round
          :type="activeStatus === '1' ? 'primary' : 'default'"
          @click="switchStatus('1')"
      >待签到</el-button>
      <el-button
          round
          :type="activeStatus === '2' ? 'primary' : 'default'"
          @click="switchStatus('2')"
      >已完成</el-button>
      <el-button
          round
          :type="activeStatus === '3' ? 'primary' : 'default'"
          @click="switchStatus('3')"
      >已取消</el-button>
    </div>

    <!-- 卡片式预约列表 -->
    <div v-loading="loading" class="card-list">
      <div v-for="item in reservationList" :key="item.reservationId" class="reserve-card">
        <!-- 状态标签 -->
        <div class="card-tag" :class="statusClass(item.status)">
          {{ statusText(item.status) }}
        </div>

        <!-- 内容 -->
        <div class="card-body">
          <h3 class="course-title">{{ item.courseName }}</h3>

<!--          <div class="info-line">-->
<!--            <el-icon><Calendar /></el-icon>-->
<!--            <span>{{ parseTime(item.reservationTime, '{y}-{m}-{d}') }}</span>-->
<!--          </div>-->
          <div class="info-line">
            <el-icon><Calendar /></el-icon>
            <span>{{ parseTime(item.startTime, '{m}-{d}') }} ---- {{ parseTime(item.endTime, '{m}-{d}') }}</span>
          </div>
          <div class="info-line">
            <el-icon><Location /></el-icon>
            <span>{{ item.location || '健身房训练区' }}</span>
          </div>
          <div class="info-line">
            <el-icon><UserFilled /></el-icon>
            <span>内容：{{ item.trainerName || '专业教练' }}</span>
          </div>
          <div class="info-line">
            <el-icon><Money /></el-icon>
            <span>价格：¥{{ item.price || '0.00' }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card-footer">
          <el-button
              v-if="item.status === '0'"
              type="warning"
              round
              icon="Money"
              @click="goPay(item.reservationId)"
          >去支付</el-button>

          <el-button
              v-if="item.status === '0'"
              type="danger"
              plain
              round
              icon="Close"
              @click="handleCancel(item.reservationId)"
          >取消预约</el-button>

          <el-button
              v-if="item.status === '1'"
              type="success"
              round
              icon="Check"
              @click="handleSign(item.reservationId)"
          >立即签到</el-button>

          <el-button
              v-if="item.status === '2'"
              type="primary"
              round
              icon="Star"
              @click="goEvaluate(item.reservationId)"
          >去评价</el-button>

          <el-button type="primary" plain round icon="View" @click="goDetail(item.courseId)">
            查看课程
          </el-button>
        </div>
      </div>

      <div v-if="reservationList.length === 0 && !loading" class="empty-box">
        <el-empty description="暂无预约记录" />
      </div>
    </div>

    <!-- 分页 -->
    <div class="pager" v-if="total > 0">
      <pagination
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />
    </div>
  </div>
</template>

<script setup name="MyReservation">
import { myReservation, cancelCourse, sign } from '@/api/member/course'
import { getCourse } from '@/api/courseManagement/course.js'
import { getTrainer } from '@/api/trainerManagement/trainer' // 教练接口
import { ElMessageBox } from 'element-plus'

const { proxy } = getCurrentInstance()
const router = useRouter()

const loading = ref(false)
const reservationList = ref([])
const total = ref(0)
const activeStatus = ref('')

const queryParams = reactive({
  pageNum: 1,
  pageSize: 8,
  status: ''
})

// 状态文本
function statusText(s) {
  const map = {
    0: '待支付',
    1: '待签到',
    2: '已完成',
    3: '已取消'
  }
  return map[s] || '未知'
}

// 状态颜色
function statusClass(s) {
  const map = {
    0: 'waiting',
    1: 'waitSign',
    2: 'success',
    3: 'cancel'
  }
  return map[s] || 'default'
}

// ==============================
// 核心：获取预约 + 查课程 + 查教练
// ==============================
async function getList() {
  loading.value = true
  queryParams.status = activeStatus.value

  try {
    const res = await myReservation(queryParams)
    let list = res.data || []

    // 循环查课程 + 教练
    for (let item of list) {
      try {
        // 查课程
        const courseRes = await getCourse(item.courseId)
        const course = courseRes.data
        item.price = course.price
        item.trainerId = course.trainerId
        item.location = course.location
        item.startTime = course.startTime
        item.endTime = course.endTime
        item.courseName = course.courseName
        // 查教练
        if (course.trainerId) {
          const trainerRes = await getTrainer(course.trainerId)
          const trainer = trainerRes.data
          // 你的教练没有 name，用专长代替显示
          item.trainerName = trainer.specialties?.replace(/\[\"\]"/g, '') || '专业教练'
        }
      } catch (e) {}
    }

    reservationList.value = list
    total.value = list.length
  } catch (err) {
    reservationList.value = []
  } finally {
    loading.value = false
  }
}

// 切换状态
function switchStatus(status) {
  activeStatus.value = status
  queryParams.pageNum = 1
  getList()
}

// 签到
async function handleSign(id) {
  await ElMessageBox.confirm('确认签到？', '提示')
  sign(id).then(() => {
    proxy.$modal.msgSuccess('签到成功')
    getList()
  })
}

// 取消预约
async function handleCancel(id) {
  await ElMessageBox.confirm('确定取消预约？')
  cancelCourse(id).then(() => {
    proxy.$modal.msgSuccess('已取消')
    getList()
  })
}

// 跳转
function goDetail(courseId) {
  router.push({ name: 'MemberCourseDetail', query: { courseId }})
}
function goPay(resId) {
  router.push({ name: 'CoursePay', query: { resId } })
}
function goEvaluate(resId) {
  router.push({ name: 'CourseEvaluate', query: { resId } })
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
/* 样式保持不变，已经是完整统一版 */
.app-container {
  padding: 30px;
  background: linear-gradient(135deg, #f7f8fa 0%, #f2f9f9 100%);
  min-height: 100vh;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.main-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d2129;
  margin: 0;
}
.status-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}
.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 22px;
}
.reserve-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  position: relative;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  transition: 0.3s;
}
.reserve-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 102, 255, 0.1);
}
.card-tag {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}
.waiting { background: #fff7e8; color: #ff7d00; }
.waitSign { background: #e8f3ff; color: #0066ff; }
.success { background: #e8faf2; color: #00b42a; }
.cancel { background: #f2f3f5; color: #86909c; }
.course-title {
  font-size: 19px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 16px 0;
}
.info-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4e5969;
  margin-bottom: 10px;
}
.card-footer {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.pager {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
.empty-box {
  grid-column: 1 / -1;
  padding: 60px 0;
}
</style>