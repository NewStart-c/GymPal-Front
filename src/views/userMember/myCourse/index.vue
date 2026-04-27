<template>
  <div class="app-container">
    <!-- 顶部标题栏（和主页统一） -->
    <div class="page-header">
      <h1 class="main-title">课程预约中心</h1>
      <el-button type="primary" round icon="Refresh" @click="handleQuery">刷新</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
          v-model="queryParams.courseName"
          placeholder="搜索课程名称"
          clearable
          @keyup.enter="handleQuery"
          prefix-icon="Search"
          class="search-input"
      />
      <el-button type="primary" round @click="handleQuery">搜索</el-button>
      <el-button round @click="resetQuery">重置</el-button>
      <el-button type="success" plain round @click="goMyReservation">
        <el-icon><Ticket /></el-icon> 我的预约
      </el-button>
    </div>

    <!-- 高级筛选栏 -->
    <div class="filter-bar">
      <el-date-picker
          v-model="queryParams.startTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="开始日期"
          class="filter-item"
      />
      <el-select
          v-model="queryParams.status"
          placeholder="课程状态"
          class="filter-item"
      >
        <el-option
            v-for="dict in course_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
        />
      </el-select>
    </div>

    <!-- 卡片式课程列表（和主页统一风格） -->
    <div v-loading="loading" class="card-list">
      <div
          v-for="course in courseList"
          :key="course.courseId"
          class="reserve-card"
      >
        <!-- 状态标签 -->
        <div class="card-tag" :class="getCourseTagClass(course)">
          {{ getCourseStatusText(course) }}
        </div>

        <!-- 卡片内容 -->
        <div class="card-body">
          <h3 class="course-title">{{ course.courseName }}</h3>
          <div class="course-tags">
            <el-tag
                v-for="(t, idx) in (course.courseType || '').split(',')"
                :key="idx"
                size="small"
            >{{ t }}</el-tag>
          </div>

          <div class="info-line">
            <el-icon><Clock /></el-icon>
            <span>{{ parseTime(course.startTime, '{y}-{m}-{d}') }}</span>
          </div>
          <div class="info-line">
            <el-icon><Location /></el-icon>
            <span>{{ course.location || '训练馆' }}</span>
          </div>
          <div class="info-line">
            <el-icon><User /></el-icon>
            <span>{{ course.currentEnrollment || 0 }}/{{ course.maxCapacity || 0 }}人</span>
          </div>
          <div class="info-line">
            <el-icon><Money /></el-icon>
            <span>¥{{ course.price || '0.00' }}</span>
          </div>
        </div>

        <!-- 卡片底部按钮 -->
        <div class="card-footer">
          <el-button
              type="primary"
              plain
              round
              icon="View"
              @click="handleView(course)"
          >查看</el-button>

          <el-button
              v-if="isCanReserve(course)"
              type="success"
              round
              icon="Plus"
              @click="handleReserve(course)"
          >立即预约</el-button>

          <el-button
              v-if="isWaitPay(course)"
              type="warning"
              round
              icon="Money"
              @click="goPay(course)"
          >去支付</el-button>

          <el-button
              v-if="isWaitSign(course)"
              type="success"
              round
              icon="Check"
              @click="handleSign(course)"
          >去签到</el-button>

          <el-button
              v-if="isCanEvaluate(course)"
              type="primary"
              round
              icon="Star"
              @click="goEvaluate(course)"
          >去评价</el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="courseList.length === 0 && !loading" class="empty-box">
        <el-empty description="暂无课程" />
      </div>
    </div>

    <!-- 分页 -->
    <div class="pager">
      <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />
    </div>

    <!-- 预约弹窗 -->
    <el-dialog title="确认预约" v-model="open" width="500px" append-to-body>
      <div class="dialog-content">
        <div class="dialog-item">
          <label>课程名称：</label>
          <span>{{ reserveForm.courseName }}</span>
        </div>
        <div class="dialog-item">
          <label>上课时间：</label>
          <span>{{ parseTime(reserveForm.startTime) }}</span>
        </div>
        <div class="dialog-item">
          <label>上课地点：</label>
          <span>{{ reserveForm.location }}</span>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" round @click="submitReserve">确认预约</el-button>
          <el-button @click="open = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MemberCourse">
import { listCourse } from "@/api/courseManagement/course"
import { memberReserve, myReservation, sign } from "@/api/member/course"
const { proxy } = getCurrentInstance()
const router = useRouter()
const { course_type, course_status } = proxy.useDict('course_type', 'course_status')

const courseList = ref([])
const loading = ref(true)
const total = ref(0)
const open = ref(false)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 12,
    courseName: null,
    trainerId: null,
    startTime: null,
    status: "0",
  },
  reserveForm: {}
})
const { queryParams, reserveForm } = toRefs(data)

// 获取列表
function getList() {
  loading.value = true
  listCourse(queryParams.value).then(async courseRes => {
    courseList.value = courseRes.rows || []
    total.value = courseRes.total || 0

    const myResRes = await myReservation().catch(() => ({ data: [] }))
    const myResList = myResRes.data || []
    const resMap = new Map(myResList.map(i => [i.courseId, i]))

    courseList.value.forEach(item => {
      const r = resMap.get(item.courseId)
      item.reservation = r
      item.resStatus = r ? r.status : null
      item.resId = r ? r.reservationId : null
    })
  }).finally(() => {
    loading.value = false
  })
}

// ================= 状态判断 =================
function isCanReserve(course) {
  return !course.reservation && course.status === '0'
}
function isWaitPay(course) {
  return course.reservation && course.resStatus === '0'
}
function isWaitSign(course) {
  return course.reservation && course.resStatus === '1'
}
function isCanEvaluate(course) {
  return course.reservation && ['1', '2'].includes(course.resStatus)
}

// 标签样式
function getCourseTagClass(course) {
  if (isCanReserve(course)) return 'can'
  if (isWaitPay(course)) return 'waiting'
  if (isWaitSign(course)) return 'success'
  return 'full'
}

// 状态文字
function getCourseStatusText(course) {
  if (isCanReserve(course)) return '可预约'
  if (isWaitPay(course)) return '待支付'
  if (isWaitSign(course)) return '待签到'
  return '已完成'
}

// 搜索
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  data.queryParams = {
    pageNum: 1, pageSize: 12,
    courseName: null, trainerId: null,
    startTime: null, status: "0"
  }
  getList()
}

// 查看
function handleView(row) {
  router.push({name: "MemberCourseDetail", query: {courseId: row.courseId}})
}

// 预约
function handleReserve(row) {
  reserveForm.value = {...row}
  open.value = true
}

function submitReserve() {
  memberReserve({courseId: reserveForm.value.courseId}).then(() => {
    proxy.$modal.msgSuccess("预约成功，请完成支付")
    open.value = false
    getList()
  })
}

// 签到
function handleSign(row) {
  proxy.$modal.confirm("确认签到？").then(() => {
    return sign(row.resId)
  }).then(() => {
    proxy.$modal.msgSuccess("签到成功")
    getList()
  })
}

// 跳转
function goEvaluate(row) {
  router.push({ name: 'CourseEvaluate', query: { resId: row.resId } })
}
function goPay(row) {
  router.push({ name: 'CoursePay', query: { resId: row.resId } })
}
function goMyReservation() {
  router.push({ name: "MyReservation" })
}

getList()
</script>

<style scoped>
/* 完全和主页（我的预约）统一风格 */
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

/* 搜索 + 筛选 */
.search-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}
.search-input { flex: 1; max-width: 420px; }
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.filter-item { width: 180px; }

/* 卡片列表（和主页完全一样） */
.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 22px;
}

/* 卡片样式（和主页统一） */
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

/* 状态标签（和主页配色统一） */
.card-tag {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}
.can { background: #e8faf2; color: #00b42a; }
.waiting { background: #fff7e8; color: #ff7d00; }
.success { background: #e8faf2; color: #00b42a; }
.full { background: #fff1f0; color: #f53f3f; }

/* 内容 */
.course-title {
  font-size: 19px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 16px 0;
}
.course-tags {
  margin-bottom: 16px;
  display: flex;
  gap: 6px;
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

/* 弹窗 */
.dialog-content { padding: 10px 20px; }
.dialog-item { margin-bottom: 16px; font-size: 15px; }
.dialog-item label { font-weight: 500; color: #333; margin-right: 8px; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; }
</style>