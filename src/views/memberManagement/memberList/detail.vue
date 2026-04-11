<template>
  <div class="app-container">
    <h2 style="margin: 0 0 16px 0">会员详情</h2>
    <!-- 面包屑导航 -->
    <div class="breadcrumb" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
      <!-- 左侧面包屑 -->
      <el-breadcrumb separator=">">
        <el-breadcrumb-item><a href="/memberManagement/memberList">会员管理</a></el-breadcrumb-item>
        <el-breadcrumb-item><a href="/memberManagement/memberList">会员列表</a></el-breadcrumb-item>
        <el-breadcrumb-item>会员详情</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 右侧按钮组 -->
      <div class="top-btn-group">
        <el-button type="primary" icon="Edit" @click="handleEdit">编辑</el-button>
        <el-button type="success" icon="Money" style="margin-left: 8px;" @click="handleRecharge">充值</el-button>
        <el-button type="warning" icon="Ticket" style="margin-left: 8px;" @click="handleConsume">消费</el-button>
      </div>
    </div>
    <!-- 顶部操作按钮 -->


    <!-- 会员信息卡片 -->
    <el-card class="info-card" style="margin-bottom: 16px;">
      <div class="info-row">
        <!-- 头像 + 基本信息 -->
        <div class="info-col">
          <div class="avatar-wrapper">
            <el-avatar :size="80" :src="memberInfo.avatar" :icon="User">
              <User />
            </el-avatar>
          </div>
          <div class="basic-info">
            <h3>基本信息</h3>
            <p><span class="label">姓名：</span>{{ memberInfo.name }}</p>
            <p><span class="label">性别：</span>{{ getGenderName(memberInfo.gender) }}</p>
            <p><span class="label">手机号：</span>{{ formatPhone(memberInfo.phoneNumber) }}</p>
            <p><span class="label">生日：</span>{{ memberInfo.birthday || '-' }}</p>
          </div>
        </div>

        <!-- 会员信息 -->
        <div class="info-col">
          <h3>会员信息</h3>
          <p><span class="label">会员等级：</span>
            <el-tag :type="getLevelTagType(memberInfo.memberLevelId)">{{ getLevelName(memberInfo.memberLevelId) }}</el-tag>
          </p>
          <p><span class="label">储值余额：</span>
            <span class="balance">¥{{ Number(memberInfo.currentBalance).toFixed(2) }}</span>
          </p>
          <p><span class="label">注册日期：</span>{{ memberInfo.registrationDate }}</p>
          <p><span class="label">会员状态：</span>
            <el-tag :type="getStatusTagType(memberInfo.status)">{{ getStatusName(memberInfo.status) }}</el-tag>
          </p>
        </div>

        <!-- 统计信息 -->
        <div class="info-col">
          <h3>统计信息</h3>
          <p><span class="label">消费次数：</span>{{ statsInfo.consumeCount || 0 }}次</p>
          <p><span class="label">总消费：</span>¥{{ Number(statsInfo.totalConsume).toFixed(2) }}</p>
          <p><span class="label">预约课程：</span>{{ statsInfo.courseCount || 0 }}次</p>
          <p><span class="label">最近消费：</span>{{ statsInfo.lastConsumeTime || '-' }}</p>
        </div>
      </div>
    </el-card>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="消费记录" name="consume">
        <!-- 筛选栏 -->
        <div class="filter-bar" style="margin-bottom: 16px; display: flex; justify-content: flex-end;">
          <el-date-picker
              v-model="consumeQuery.dateRange"
              type="date"
              placeholder="选择日期"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              style="width: 180px; margin-right: 12px;"
          />
          <el-select v-model="consumeQuery.type" placeholder="全部类型" clearable style="width: 120px;">
            <el-option label="全部类型" value="" />
            <el-option label="消费" value="consume" />
            <el-option label="充值" value="recharge" />
          </el-select>
        </div>

        <!-- 消费记录表格 -->
        <el-table v-loading="consumeLoading" :data="consumeRecordList" style="width: 100%;">
          <el-table-column label="交易时间" align="center" prop="createTime" width="200" />
          <el-table-column label="交易类型" align="center" prop="type" width="200">
            <template #default="scope">
              <el-tag :type="scope.row.type === 'recharge' ? 'primary' : 'success'">
                {{ scope.row.type === 'recharge' ? '充值' : '消费' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="交易金额" align="center" prop="amount" width="200">
            <template #default="scope">
              <span :class="scope.row.type === 'recharge' ? 'text-green' : 'text-red'">
                {{ scope.row.type === 'recharge' ? '+' : '-' }}¥{{ Number(scope.row.amount).toFixed(2) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="支付方式" align="center" prop="paymentMethod" />
          <el-table-column label="操作员ID" align="center" prop="operatorId" />
          <el-table-column label="备注" align="center" prop="remark" />
        </el-table>

        <!-- 分页 -->
        <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>共 {{ consumeTotal }} 条记录, 当前第 {{ consumeQuery.pageNum }} 页</div>
          <el-pagination
              v-model:current-page="consumeQuery.pageNum"
              v-model:page-size="consumeQuery.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="consumeTotal"
              layout="prev, pager, next, jumper, ->, total"
              @size-change="getConsumeRecordList"
              @current-change="getConsumeRecordList"
          />
        </div>
      </el-tab-pane>

      <!-- 课程预约（已完整实现） -->
      <el-tab-pane label="课程预约" name="course">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
          <el-button type="primary" icon="Plus" @click="openAddReservation">新增预约</el-button>
        </div>

        <el-table v-loading="courseLoading" :data="reservationList" style="width: 100%;">
          <el-table-column label="预约ID" align="center" prop="reservationId" width="100" />
          <el-table-column label="课程名称" align="center" prop="courseName" />
          <el-table-column label="教练" align="center" prop="trainerName" />
          <el-table-column label="上课时间" align="center" width="220">
            <template #default="scope">
              {{ scope.row.startTime }} ~ {{ scope.row.endTime }}
            </template>
          </el-table-column>
          <el-table-column label="预约时间" align="center" prop="reservationTime" width="190" />
          <el-table-column label="状态" align="center" width="110">
            <template #default="scope">
              <el-tag :type="getReserveStatusType(scope.row.status)">
                {{ getReserveStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="120">
            <template #default="scope">
              <el-button
                  link
                  type="danger"
                  size="small"
                  @click="handleCancelReservation(scope.row)"
                  :disabled="scope.row.status !== '0'"
              >
                取消预约
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div style="margin-top:16px; text-align:right;">
          <el-pagination
              v-model:current-page="reserveQuery.pageNum"
              v-model:page-size="reserveQuery.pageSize"
              :total="reserveTotal"
              layout="total, prev, pager, next, jumper"
              @pagination="getReservationList"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="个人资料" name="profile">
        <el-form :model="memberInfo" label-width="120px" disabled style="max-width: 600px;">
          <el-form-item label="会员ID">
            <el-input v-model="memberInfo.memberId" disabled />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="memberInfo.name" disabled />
          </el-form-item>
          <el-form-item label="性别">
            <el-input :value="getGenderName(memberInfo.gender)" disabled />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="memberInfo.phoneNumber" disabled />
          </el-form-item>
          <el-form-item label="生日">
            <el-input v-model="memberInfo.birthday" disabled />
          </el-form-item>
          <el-form-item label="注册日期">
            <el-input v-model="memberInfo.registrationDate" disabled />
          </el-form-item>
          <el-form-item label="会员等级">
            <el-input :value="getLevelName(memberInfo.memberLevelId)" disabled />
          </el-form-item>
          <el-form-item label="储值余额">
            <el-input :value="`¥${Number(memberInfo.currentBalance).toFixed(2)}`" disabled />
          </el-form-item>
          <el-form-item label="会员状态">
            <el-input :value="getStatusName(memberInfo.status)" disabled />
          </el-form-item>
          <el-form-item label="备注">
            <el-input type="textarea" v-model="memberInfo.remark" disabled />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增预约弹窗 -->
    <el-dialog title="新增课程预约" v-model="addReserveVisible" width="600px" append-to-body>
      <el-form ref="reserveFormRef" :model="reserveForm" :rules="reserveRules" label-width="100px">
        <el-form-item label="选择课程" prop="courseId">
          <el-select v-model="reserveForm.courseId" placeholder="请选择课程" style="width:100%;">
            <el-option
                v-for="item in courseList"
                :key="item.courseId"
                :label="`${item.courseName} | ${item.startTime}`"
                :value="item.courseId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="reserveForm.remark" type="textarea" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitReservation">确认预约</el-button>
          <el-button @click="addReserveVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MemberDetail">
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Edit, Money, Ticket, Plus } from '@element-plus/icons-vue'
import { getMember } from "@/api/memberManagement/member"
import { listRechargeRecord } from "@/api/memberManagement/rechargeRecord"

// 课程相关接口
import { listCourse } from "@/api/courseManagement/course"
import { listCourseReservation, addCourseReservation, updateCourseReservation } from "@/api/courseManagement/courseReservation"

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const { member_status, member_gender } = proxy.useDict('member_status', 'member_gender')

// 会员ID
const memberId = route.params.memberId

// 响应式数据
const memberInfo = ref({})
const statsInfo = ref({
  consumeCount: 128,
  totalConsume: 15680,
  courseCount: 45,
  lastConsumeTime: '2024-01-14'
})
const activeTab = ref('consume')

// 消费记录相关
const consumeLoading = ref(true)
const consumeRecordList = ref([])
const consumeTotal = ref(0)
const consumeQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  memberId: memberId,
  dateRange: null,
  type: null
})

// 课程预约相关
const courseLoading = ref(true)
const reservationList = ref([])
const courseList = ref([])
const reserveTotal = ref(0)
const addReserveVisible = ref(false)
const reserveFormRef = ref()

const reserveQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  memberId: memberId
})

const reserveForm = reactive({
  memberId: memberId,
  courseId: null,
  remark: ''
})

const reserveRules = {
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }]
}

// 初始化
onMounted(() => {
  getMemberDetail()
  getConsumeRecordList()
  getCourseList()
  getReservationList()
})

/** 获取会员详情 */
function getMemberDetail() {
  getMember(memberId).then(res => {
    memberInfo.value = res.data
  }).catch(err => {
    ElMessage.error('获取会员信息失败')
  })
}

/** 获取消费/充值记录 */
function getConsumeRecordList() {
  consumeLoading.value = true
  const params = { ...consumeQuery }
  listRechargeRecord(params).then(res => {
    consumeRecordList.value = res.rows
    consumeTotal.value = res.total
    consumeLoading.value = false
  }).catch(err => {
    consumeLoading.value = false
    ElMessage.error('获取消费记录失败')
  })
}

/** 获取课程列表 */
function getCourseList() {
  listCourse({ status: 0 }).then(res => {
    courseList.value = res.rows
  })
}

/** 获取会员预约列表 */
function getReservationList() {
  courseLoading.value = true
  listCourseReservation(reserveQuery).then(res => {
    reservationList.value = res.rows.map(item => {
      const course = courseList.value.find(c => c.courseId === item.courseId)
      return {
        ...item,
        courseName: course?.courseName || '未知课程',
        startTime: course?.startTime || '-',
        endTime: course?.endTime || '-',
        trainerName: course?.trainerName || '未知教练'
      }
    })
    reserveTotal.value = res.total
    courseLoading.value = false
  })
}

/** 打开新增预约 */
function openAddReservation() {
  reserveForm.courseId = null
  reserveForm.remark = ''
  getCourseList()
  addReserveVisible.value = true
}

/** 提交预约 */
function submitReservation() {
  reserveFormRef.value.validate(valid => {
    if (valid) {
      addCourseReservation(reserveForm).then(() => {
        ElMessage.success('预约成功')
        addReserveVisible.value = false
        getReservationList()
      })
    }
  })
}

/** 取消预约 */
function handleCancelReservation(row) {
  proxy.$modal.confirm('确定取消该预约？').then(() => {
    updateCourseReservation({
      reservationId: row.reservationId,
      status: '2'
    }).then(() => {
      ElMessage.success('取消成功')
      getReservationList()
    })
  })
}

/** 编辑会员 */
function handleEdit() {
  proxy.$router.push(`/memberManagement/memberList/edit/${memberId}`)
}

/** 充值 */
function handleRecharge() {
  proxy.$modal.open({
    title: '会员充值',
    component: 'RechargeDialog',
    props: { memberId: memberId, memberInfo: memberInfo.value },
    callback: () => {
      getMemberDetail()
      getConsumeRecordList()
    }
  })
}

/** 消费 */
function handleConsume() {
  proxy.$modal.open({
    title: '会员消费',
    component: 'ConsumeDialog',
    props: { memberId: memberId, memberInfo: memberInfo.value },
    callback: () => {
      getMemberDetail()
      getConsumeRecordList()
    }
  })
}

/** 格式化手机号（中间打码） */
function formatPhone(phone) {
  if (!phone) return '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/** 获取性别名称 */
function getGenderName(gender) {
  const map = { 0: '女', 1: '男' }
  return map[gender] || '-'
}

// 获取会员等级标签类型
function getLevelTagType(levelId) {
  const typeMap = {
    3: "warning",
    2: "info",
    4: "primary",
    1: "purple"
  }
  return typeMap[levelId] || "default"
}

// 获取会员等级名称
function getLevelName(levelId) {
  const nameMap = {
    3: "金卡会员",
    2: "银卡会员",
    4: "钻石会员",
    1: "普通会员"
  }
  return nameMap[levelId] || "未知等级"
}

// 获取状态标签类型
function getStatusTagType(status) {
  const typeMap = {
    0: "success",
    1: "warning",
    2: "danger"
  }
  return typeMap[status] || "default"
}

// 获取状态名称
function getStatusName(status) {
  const nameMap = {
    0: "正常",
    1: "冻结",
    2: "注销"
  }
  return nameMap[status] || "未知状态"
}

// 预约状态
function getReserveStatusType(s) {
  const map = { '0':'primary', '1':'success', '2':'danger' }
  return map[s] || 'default'
}
function getReserveStatusText(s) {
  const map = { '0':'已预约', '1':'已完成', '2':'已取消' }
  return map[s] || '未知'
}
</script>

<style scoped>
.info-card {
  --el-card-padding: 24px;
}
.info-row {
  display: flex;
  justify-content: space-between;
}
.info-col {
  flex: 1;
  padding: 0 20px;
}
.info-col:first-child {
  display: flex;
  align-items: center;
}
.avatar-wrapper {
  margin-right: 20px;
}
.basic-info h3, .info-col h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
.basic-info p, .info-col p {
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.5;
}
.label {
  font-weight: 500;
  color: #606266;
  display: inline-block;
  min-width: 80px;
}
.balance {
  color: #67c23a;
  font-weight: 600;
  font-size: 16px;
}
.text-green {
  color: #67c23a;
  font-weight: 500;
}
.text-red {
  color: #f56c6c;
  font-weight: 500;
}
.filter-bar {
  padding: 0 8px;
}
.app-container{
  padding: 0 20px 20px 20px;
}
</style>