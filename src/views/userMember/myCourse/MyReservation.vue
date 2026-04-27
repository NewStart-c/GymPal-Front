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
      >待签到</el-button>
      <el-button
          round
          :type="activeStatus === '1' ? 'primary' : 'default'"
          @click="switchStatus('1')"
      >已签到</el-button>
      <el-button
          round
          :type="activeStatus === '2' ? 'primary' : 'default'"
          @click="switchStatus('2')"
      >待支付/评价</el-button>
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

          <div class="info-line">
            <el-icon><Calendar /></el-icon>
            <span>{{ parseTime(item.reservationTime, '{y}-{m}-{d}') }}</span>
          </div>
          <div class="info-line">
            <el-icon><Clock /></el-icon>
            <span>{{ parseTime(item.startTime, '{h}:{i}') }} - {{ parseTime(item.endTime, '{h}:{i}') }}</span>
          </div>
          <div class="info-line">
            <el-icon><Location /></el-icon>
            <span>{{ item.location || '健身房训练区' }}</span>
          </div>
          <div class="info-line">
            <el-icon><UserFilled /></el-icon>
            <span>教练：{{ item.trainerName || '专业教练' }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card-footer">
          <!-- 可取消 -->
          <el-button
              v-if="item.status === '0'"
              type="danger"
              plain
              round
              icon="Close"
              @click="handleCancel(item.reservationId)"
          >取消预约</el-button>

          <!-- 去签到 -->
          <el-button
              v-if="item.status === '0'"
              type="success"
              round
              icon="Check"
              @click="handleSign(item.reservationId)"
          >立即签到</el-button>

          <!-- 去支付 -->
          <el-button
              v-if="item.status === '2'"
              type="warning"
              round
              icon="Money"
              @click="goPay(item.resId)"
          >去支付</el-button>

          <!-- 去评价 -->
          <el-button
              v-if="item.status === '2'"
              type="primary"
              round
              icon="Star"
              @click="goEvaluate(item.resId)"
          >去评价</el-button>

          <!-- 查看详情 -->
          <el-button type="primary" plain round icon="View" @click="goDetail(item.courseId)">
            查看课程
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
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
  const map = { 0: '待签到', 1: '已签到', 2: '待支付/评价', 3: '已取消' }
  return map[s] || '未知'
}

// 状态颜色
function statusClass(s) {
  const map = {
    0: 'waiting',
    1: 'success',
    2: 'pay',
    3: 'cancel'
  }
  return map[s] || 'default'
}

// 获取我的预约
function getList() {
  loading.value = true
  myReservation().then(res => {
    let list = res.data || []
    if (activeStatus.value) {
      list = list.filter(i => i.status === activeStatus.value)
    }
    reservationList.value = list
    total.value = list.length
  }).finally(() => {
    loading.value = false
  })
}

// 筛选状态
function switchStatus(status) {
  activeStatus.value = status
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

// 取消
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
function goPay(id) {
  router.push(`/member/course/pay?resId=${id}`)
}
function goEvaluate(id) {
  router.push(`/member/course/evaluate?resId=${id}`)
}

onMounted(() => getList())
</script>

<style scoped>
/* 全局布局 */
.app-container {
  padding: 30px;
  background: linear-gradient(135deg, #f7f8fa 0%, #f2f5f9 100%);
  min-height: 100vh;
}

/* 标题栏 */
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

/* 状态筛选 */
.status-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

/* 卡片列表 */
.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 22px;
}

/* 预约卡片 */
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

/* 状态标签 */
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
.success { background: #e8faf2; color: #00b42a; }
.pay { background: #f8f0fc; color: #9254de; }
.cancel { background: #f2f3f5; color: #86909c; }

/* 内容 */
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

/* 按钮组 */
.card-footer {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 分页 */
.pager {
  margin-top: 30px;
  display: flex;
  justify: center;
}

/* 空状态 */
.empty-box {
  grid-column: 1 / -1;
  padding: 60px 0;
}
</style>