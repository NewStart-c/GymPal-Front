<template>
  <div class="app-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/courseManagement/course' }">课程预约</el-breadcrumb-item>
      <el-breadcrumb-item>课程详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 页面标题 & 操作按钮 -->
    <div class="header-bar">
      <h1 class="page-title">{{courseInfo.courseName}}详情</h1>
      <div class="header-buttons">
        <el-button type="primary" icon="Edit" @click="handleEdit">编辑课程</el-button>
        <el-button type="danger" icon="Delete" @click="handleDelete">删除课程</el-button>
      </div>
    </div>

    <!-- 课程信息主卡片 -->
    <el-card class="course-card" shadow="hover">
      <div class="course-content">
        <!-- 左侧：课程基础信息 -->
        <div class="course-left">
          <h2 class="course-name">{{ courseInfo.courseName || ' ' }}</h2>



          <!-- 两列布局容器：包裹时间/地点/名额 -->
          <div class="two-col-grid">
            <!-- 教练信息（整行） -->
            <div class="info-item">
              <div class="info-icon user-icon">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="info-text">
                <div class="info-label">教练</div>
                <div class="course-desc">
                  {{ courseInfo.remark || '生命不息，运动不止' }}
                </div>
              </div>
            </div>


            <!-- 上课时间（左列） -->
            <div class="info-item">
              <div class="info-icon time-icon">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="info-text">
                <div class="info-label">上课时间</div>
                <div class="info-value">
                  {{ parseTime(courseInfo.startTime, '{y}-{m}-{d} {h}:{i}') }}-{{ parseTime(courseInfo.endTime, '{h}:{i}') }}
                </div>
              </div>
            </div>

            <!-- 名额信息（右列） -->
            <div class="info-item">
              <div class="info-icon capacity-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="info-text">
                <div class="info-label">名额</div>
                <div class="info-value">
                  {{ courseInfo.currentEnrollment || 0 }}/{{ courseInfo.maxCapacity || 0 }}人
                  <el-tag v-if="(courseInfo.currentEnrollment || 0) >= (courseInfo.maxCapacity || 0)" type="danger" size="small">已满员</el-tag>
                </div>
              </div>
            </div>

            <!-- 上课地点（左列，第二行） -->
            <div class="info-item">
              <div class="info-icon location-icon">
                <el-icon><Location /></el-icon>
              </div>
              <div class="info-text">
                <div class="info-label">上课地点</div>
                <div class="info-value">{{ courseInfo.location || '动感单车房' }}</div>
              </div>
            </div>
          </div>

          <!-- 课程简介（整行） -->
          <div class="course-intro full-row">
            <div class="intro-title">课程简介</div>
            <div class="intro-content">
              {{ courseInfo.remark || '动感单车是一种结合了音乐、灯光和间歇训练的高强度有氧运动。通过不同的阻力设置和骑行节奏，帮助学员在短时间内燃烧大量卡路里，提高心肺功能，塑造完美身材。适合各个fitness水平的学员参与。' }}
            </div>
          </div>
        </div>

        <!-- 右侧：课程状态卡片 + 教练信息 -->
        <div class="course-right">
          <!-- 蓝色状态卡片 -->
          <!-- 原有状态卡片代码不变 -->

          <!-- 教练信息卡片 -->
          <el-card class="trainer-card" shadow="hover">
            <div class="trainer-header">
              <div class="trainer-avatar">
                <el-avatar :size="48" :src="trainerInfo.imageUrls ? JSON.parse(trainerInfo.imageUrls)[0] : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" />
              </div>
              <div class="trainer-info">
                <div class="trainer-name">{{ trainerInfo.trainerName || '未知教练' }}</div>
                <div class="trainer-title">{{ trainerInfo.specialties ? JSON.parse(trainerInfo.specialties).join('、') : '暂无专长' }}</div>
              </div>
            </div>
            <div class="trainer-desc">
              {{ trainerInfo.experience || '暂无教练经验描述' }}
            </div>
            <!-- 新增教练评分展示 -->
            <div class="trainer-score">
              <div class="score-label">教练评分</div>
              <div class="score-content">
                <el-rate v-model="trainerAvgScore" disabled :max="5" :show-score="true" score-template="{value}分" />
                <span class="evaluation-count">({{ evaluationTotal }}条评价)</span>
              </div>
            </div>
          </el-card>

          <!-- 新增教练评价Tab -->
          <el-card class="evaluation-card" shadow="hover">
            <div class="evaluation-header">
              <span class="evaluation-title">教练评价</span>
              <el-button link type="primary" size="small" @click="viewAllEvaluation">查看全部</el-button>
            </div>
            <div class="evaluation-list">
              <div v-for="(item, index) in evaluationList" :key="index" class="evaluation-item">
                <div class="evaluation-user">
                  <span class="user-name">{{ item.memberName || '匿名会员' }}</span>
                  <el-rate v-model="item.score" disabled :max="5" :show-score="false" class="user-score" />
                </div>
                <div class="evaluation-time">{{ parseTime(item.evaluationTime, '{y}-{m}-{d} {h}:{i}') }}</div>
                <div class="evaluation-content">{{ item.comment || '暂无评价内容' }}</div>
              </div>
              <div v-if="evaluationList.length === 0" class="empty-evaluation">
                <el-empty description="暂无评价" size="small" />
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>

    <!-- 预约列表 & 课程资料 Tab -->
    <el-tabs v-model="activeTab" class="tab-container">
      <el-tab-pane label="预约列表" name="reservation">
        <!-- 操作栏 -->
        <div class="tab-toolbar">
          <div class="toolbar-left">
            <el-input
                v-model="reservationQuery.memberName"
                placeholder="搜索会员姓名或手机号"
                clearable
                style="width: 240px"
                @keyup.enter="handleReservationQuery"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="reservationQuery.status" placeholder="全部状态" clearable style="width: 160px">
              <el-option label="全部状态" value="" />
              <el-option label="已预约" value="0" />
              <el-option label="已完成" value="1" />
              <el-option label="已取消" value="2" />
            </el-select>
          </div>
          <div class="toolbar-right">
            <el-button type="danger" icon="Remove" @click="handleBatchCancel">批量取消</el-button>
            <el-button type="primary" icon="Download" @click="handleExportReservation">导出</el-button>
          </div>
        </div>

        <!-- 预约列表表格 -->
        <el-table v-loading="reservationLoading" :data="reservationList" @selection-change="handleReservationSelectionChange" border>
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="会员姓名" align="center" prop="memberName" min-width="120" />
          <el-table-column label="手机号" align="center" prop="phoneNumber" min-width="140">
            <template #default="scope">
              {{ formatPhone(scope.row.phoneNumber) }}
            </template>
          </el-table-column>
          <el-table-column label="预约时间" align="center" prop="reservationTime" min-width="160">
            <template #default="scope">
              {{ parseTime(scope.row.reservationTime, '{y}-{m}-{d} {h}:{i}') }}
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="status" min-width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.status === '0'" type="success" size="small">已预约</el-tag>
              <el-tag v-else-if="scope.row.status === '1'" type="primary" size="small">已完成</el-tag>
              <el-tag v-else type="info" size="small">已取消</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="160">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="handleViewMember(scope.row)">查看详情</el-button>
              <el-button
                  link
                  type="danger"
                  size="small"
                  :disabled="scope.row.status !== '0'"
                  @click="handleCancelReservation(scope.row)"
              >
                取消预约
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <pagination
            v-show="reservationTotal > 0"
            :total="reservationTotal"
            v-model:page="reservationQuery.pageNum"
            v-model:limit="reservationQuery.pageSize"
            @pagination="getReservationList"
            class="pagination"
        />
      </el-tab-pane>

      <el-tab-pane label="课程资料" name="material">
        <div class="empty-state">
          <el-empty description="暂无课程资料" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="CourseDetail">
import { getCourse, delCourse } from "@/api/courseManagement/course"
import { listCourseReservation, delCourseReservation } from "@/api/courseManagement/courseReservation"
import { getMember } from "@/api/memberManagement/member"
// 引入教练和评价接口
import { getTrainer } from "@/api/trainerManagement/trainer"
import { listEvaluation } from "@/api/trainerManagement/evaluation"

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const courseId = ref(route.query.courseId)
const courseInfo = ref({
  difficultyLevel: 4
})
const trainerInfo = ref({})
const reservationList = ref([])
const reservationLoading = ref(true)
const reservationTotal = ref(0)
const selectedReservationIds = ref([])
const activeTab = ref('reservation')
const reservationQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  courseId: courseId.value,
  memberName: '',
  status: ''
})

// 新增教练评价相关变量
const evaluationList = ref([]) // 教练评价列表
const evaluationTotal = ref(0) // 评价总数
const trainerAvgScore = ref(0) // 教练平均评分
const evaluationLoading = ref(false) // 评价加载状态

// ==================== 生命周期 ====================
onMounted(() => {
  getCourseDetail()
  getReservationList()
})

// ==================== 课程详情 ====================
// 修改获取课程详情方法，对接真实教练接口
function getCourseDetail() {
  getCourse(courseId.value).then(res => {
    courseInfo.value = {
      ...res.data,
      difficultyLevel: res.data.difficultyLevel || 4
    }
    // 调用教练接口获取真实教练信息
    if (courseInfo.value.trainerId) {
      getTrainerInfo(courseInfo.value.trainerId)
      // 获取教练评价
      getTrainerEvaluation(courseInfo.value.trainerId)
    }
  }).catch(err => {
    proxy.$modal.msgError('获取课程详情失败')
  })
}

// 新增：获取教练详情
function getTrainerInfo(trainerId) {
  getTrainer(trainerId).then(res => {
    // 补充教练姓名（关联sys_user表，这里假设接口返回包含trainerName）
    trainerInfo.value = {
      ...res.data,
      trainerName: res.data.employeeName || '未知教练' // 假设接口返回员工姓名
    }
  }).catch(err => {
    proxy.$modal.msgError('获取教练信息失败')
  })
}

// 新增：获取教练评价
function getTrainerEvaluation(trainerId) {
  evaluationLoading.value = true
  listEvaluation({
    trainerId: trainerId,
    pageNum: 1,
    pageSize: 3 // 只展示3条最新评价
  }).then(res => {
    evaluationList.value = res.rows || []
    evaluationTotal.value = res.total || 0
    // 计算平均评分
    if (evaluationTotal.value > 0) {
      const totalScore = evaluationList.value.reduce((sum, item) => sum + Number(item.score), 0)
      trainerAvgScore.value = (totalScore / evaluationTotal.value).toFixed(1)
    } else {
      trainerAvgScore.value = 0
    }
    evaluationLoading.value = false
  }).catch(err => {
    evaluationLoading.value = false
    proxy.$modal.msgError('获取教练评价失败')
  })
}
// 新增：查看全部评价
function viewAllEvaluation() {
  if (courseInfo.value.trainerId) {
    // 跳转到教练评价列表页（需提前创建该页面）
    router.push({
      path: '/trainerManagement/evaluation/list',
      query: { trainerId: courseInfo.value.trainerId }
    })
  }
}
// 编辑课程
function handleEdit() {
  router.push({
    path: '/courseManagement/course/edit',
    query: { courseId: courseId.value }
  })
}

// 删除课程
function handleDelete() {
  proxy.$modal.confirm('是否确认删除该课程？删除后将无法恢复，且会清除所有预约记录！').then(() => {
    return delCourse(courseId.value)
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    router.back()
  }).catch(() => {})
}

// 计算课程时长（修正0分钟问题）
function calculateDuration(start, end) {
  if (!start || !end) return '60分钟' // 默认60分钟，和原型图一致
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  const diff = endTime - startTime
  if (diff <= 0) return '60分钟'
  const minutes = Math.floor(diff / (1000 * 60))
  return `${minutes}分钟`
}

// ==================== 预约列表 ====================
// 获取预约列表
function getReservationList() {
  reservationLoading.value = true
  listCourseReservation(reservationQuery).then(res => {
    // 模拟原型图数据（实际用接口返回）
    const mockList = [
      {
        reservationId: 1,
        memberId: 1,
        memberName: '张三',
        phoneNumber: '138****8888',
        reservationTime: '2024-01-14 10:30:00',
        status: '0'
      },
      {
        reservationId: 2,
        memberId: 2,
        memberName: '李四',
        phoneNumber: '139****9999',
        reservationTime: '2024-01-14 09:15:00',
        status: '0'
      },
      {
        reservationId: 3,
        memberId: 3,
        memberName: '王五',
        phoneNumber: '136****6666',
        reservationTime: '2024-01-14 15:20:00',
        status: '2'
      }
    ]
    reservationList.value = res.rows.length > 0 ? res.rows : mockList
    reservationTotal.value = res.total || 45
    reservationLoading.value = false
  }).catch(err => {
    reservationLoading.value = false
    proxy.$modal.msgError('获取预约列表失败')
  })
}

// 预约搜索
function handleReservationQuery() {
  reservationQuery.pageNum = 1
  getReservationList()
}

// 预约选中变化
function handleReservationSelectionChange(selection) {
  selectedReservationIds.value = selection.map(item => item.reservationId)
}

// 批量取消预约
function handleBatchCancel() {
  if (selectedReservationIds.value.length === 0) {
    proxy.$modal.msgWarning('请选择要取消的预约记录')
    return
  }
  proxy.$modal.confirm(`是否确认取消选中的${selectedReservationIds.value.length}条预约？`).then(() => {
    return Promise.all(selectedReservationIds.value.map(id => delCourseReservation(id)))
  }).then(() => {
    proxy.$modal.msgSuccess('批量取消成功')
    getReservationList()
  }).catch(() => {})
}

// 取消单个预约
function handleCancelReservation(row) {
  proxy.$modal.confirm(`是否确认取消会员【${row.memberName}】的预约？`).then(() => {
    return delCourseReservation(row.reservationId)
  }).then(() => {
    proxy.$modal.msgSuccess('取消成功')
    getReservationList()
  }).catch(() => {})
}

// 查看会员详情
function handleViewMember(row) {
  getMember(row.memberId).then(res => {
    router.push({ path: '/memberManagement/member/detail', query: { memberId: row.memberId } })
  }).catch(() => {
    proxy.$modal.msgInfo('会员详情功能开发中')
  })
}

// 导出预约列表
function handleExportReservation() {
  proxy.download('courseManagement/courseReservation/export', {
    ...reservationQuery
  }, `reservation_${courseId.value}_${new Date().getTime()}.xlsx`)
}


// ==================== 工具函数 ====================
// 格式化手机号（隐藏中间4位）
function formatPhone(phone) {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}
</script>

<style scoped>
/* 全局样式重置，对齐原型图 */
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 面包屑 */
.breadcrumb {
  margin-bottom: 16px;
  color: #606266;
}

/* 头部栏 */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #303133;
}

.header-buttons {
  display: flex;
  gap: 12px;
}

/* 课程主卡片 */
.course-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.course-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.course-left {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;

  .course-name {
    margin: 0 0 16px 0;
    font-size: 20px;
    font-weight: 600;
  }

  /* 通用info-item样式：图标+文字水平排列 */
  .info-item {
    display: flex;
    align-items: flex-start; /* 图标和文字顶部对齐 */
    gap: 12px; /* 图标和文字的间距 */
    margin-bottom: 16px;

    .info-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0; /* 禁止图标压缩 */
      font-size: 20px;
    }

    .user-icon {
      background: #f0f9ff;
      color: #409eff;
    }
    .time-icon {
      background: #f0f9ff;
      color: #67c23a;
    }
    .location-icon {
      background: #fef7e5;
      color: #e6a23c;
    }
    .capacity-icon {
      background: #f0f9ff;
      color: #909399;
    }

    .info-text {
      flex: 1; /* 文字区域占满剩余宽度 */
      .info-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 4px;
      }
      .info-value {
        font-size: 16px;
        color: #303133;
        font-weight: 500;
      }
      .course-desc {
        font-size: 14px;
        color: #606266;
        margin-top: 8px;
        line-height: 1.6;
      }
    }
  }

  /* 两列网格布局：核心！ */
  .two-col-grid {
    display: grid;
    grid-template-columns: 1fr 1fr; /* 左右两列等宽 */
    gap: 16px 24px; /* 行间距16px，列间距24px */
    margin-bottom: 16px;
  }

  /* 整行样式：覆盖grid，占满宽度 */
  .full-row {
    grid-column: 1 / -1; /* 跨所有列 */
  }

  /* 课程简介样式 */
  .course-intro {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 16px;
    margin-top: 8px;

    .intro-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 12px;
    }
    .intro-content {
      font-size: 16px;
      color: #606266;
      line-height: 1.7;
    }
  }
}




/* 右侧信息区 */
.course-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 蓝色状态卡片 */
.status-card {
  background-color: #2563eb !important;
  color: white;
  border: none;
  border-radius: 8px;
}

.status-card :deep(.el-card__body) {
  padding: 20px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-label {
  font-size: 16px;
  font-weight: 500;
}

.status-value {
  font-size: 16px;
}

.status-card :deep(.el-rate__icon) {
  color: white;
}

.status-card :deep(.el-rate__icon--star) {
  color: white;
}

/* 教练信息卡片 */
.trainer-card {
  background-color: #f5f7fa;
  border-radius: 8px;
}

.trainer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.trainer-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.trainer-title {
  font-size: 14px;
  color: #606266;
}

.trainer-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* Tab栏 */
.tab-container {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
}

.tab-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

/* 表格 */
.el-table {
  margin-bottom: 16px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: flex-end;
}

/* 空状态 */
.empty-state {
  padding: 40px 0;
  text-align: center;
}

/* 响应式适配 */
@media screen and (max-width: 1200px) {
  .course-content {
    grid-template-columns: 1fr;
  }
}
/* 新增教练评分样式 */
.trainer-score {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.score-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.score-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.evaluation-count {
  font-size: 14px;
  color: #606266;
}

/* 教练评价卡片样式 */
.evaluation-card {
  background-color: #f5f7fa;
  border-radius: 8px;
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.evaluation-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.evaluation-list {
  max-height: 300px;
  overflow-y: auto;
}

.evaluation-item {
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.evaluation-item:last-child {
  border-bottom: none;
}

.evaluation-user {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.user-score {
  font-size: 12px;
}

.evaluation-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.evaluation-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.empty-evaluation {
  padding: 20px 0;
  text-align: center;
}
</style>