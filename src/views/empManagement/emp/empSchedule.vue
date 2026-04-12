<template>
  <div class="app-container">
    <!-- 筛选栏（完全还原你的截图） -->
    <div class="filter-bar">
      <div class="filter-item">
        <span>员工：</span>
        <el-select v-model="queryParams.userId" placeholder="全部员工" clearable @change="handleQuery">
          <el-option
              v-for="user in userList"
              :key="user.userId"
              :label="user.nickName"
              :value="user.userId"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <span>排班类型：</span>
        <el-select v-model="queryParams.scheduleType" placeholder="全部类型" clearable @change="handleQuery">
          <el-option
              v-for="dict in scheduleTypeDict"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </div>
      <div class="month-switch">
        <el-button icon="el-icon-arrow-left" @click="prevMonth" />
        <span class="current-month">{{ currentYear }}年{{ currentMonth }}月</span>
        <el-button icon="el-icon-arrow-right" @click="nextMonth" />
      </div>
    </div>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增排班</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 月视图日历 -->
    <div class="calendar-wrapper">
      <div class="calendar-header">
        <span v-for="item in ['日','一','二','三','四','五','六']" :key="item" class="calendar-th">{{ item }}</span>
      </div>
      <div class="calendar-body">
        <div
            v-for="(day, idx) in monthCalendar"
            :key="idx"
            class="calendar-td"
            :class="{
            today: day.isToday,
            otherMonth: !day.isCurrentMonth,
            active: day.date === selectedDate
          }"
            @click="selectDate(day.date, day.isCurrentMonth)"
        >
          <div class="day-num">{{ day.day }}</div>
          <div
              v-for="item in day.schedules"
              :key="item.scheduleId"
              class="schedule-tag"
              :class="`type-${item.scheduleType}`"
          >
            {{ item.nickName }}
          </div>
        </div>
      </div>
    </div>

    <!-- 当日排班详情 -->
    <el-card class="schedule-detail-card" shadow="hover">
      <div class="card-header">
        <h3>{{ selectedDate }} 排班详情</h3>
      </div>
      <div v-if="todaySchedules.length === 0" class="empty-tip">暂无排班</div>
      <div v-else class="schedule-list">
        <div v-for="item in todaySchedules" :key="item.scheduleId" class="schedule-item">
          <div class="emp-info">
            <img :src="item.avatar || defaultAvatar" class="avatar" />
            <div class="emp-text">
              <div class="emp-name">{{ item.nickName }}</div>
              <div class="emp-post">{{ getPostName(item.scheduleType) }}</div>
            </div>
          </div>
          <div class="time-info">
            <div class="time-range">{{ formatTime(item.startTime) }} - {{ formatTime(item.endTime) }}</div>
            <div class="work-content">{{ item.workContent || '无' }}</div>
          </div>
          <div class="operate">
            <el-button type="primary" size="small" @click="handleUpdate(item)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(item)">删除</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="scheduleRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="选择员工" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择员工" style="width:100%">
            <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排班日期" prop="scheduleDate">
          <el-date-picker
              v-model="form.scheduleDate"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择排班日期时间"
              style="width:100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="上班时间" prop="startTime">
          <el-date-picker
              v-model="form.startTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择上班时间"
              style="width:100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="下班时间" prop="endTime">
          <el-date-picker
              v-model="form.endTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择下班时间"
              style="width:100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="排班类型" prop="scheduleType">
          <el-select v-model="form.scheduleType" placeholder="请选择排班类型" style="width:100%">
            <el-option v-for="dict in scheduleTypeDict" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工作内容">
          <el-input v-model="form.workContent" type="textarea" rows="3" placeholder="工作内容"></el-input>
        </el-form-item>
        <el-form-item label="排班状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="open = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="EmpSchedule">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { listEmp, getEmp, delEmp, addEmp, updateEmp } from "@/api/empManagement/emp"
import { listUser } from "@/api/system/user"
import { parseTime } from "@/utils/ruoyi"

const { proxy } = getCurrentInstance()

// ==================== 核心状态（月份切换核心） ====================
const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1) // 月份从1开始
const selectedDate = ref(parseTime(now, '{y}-{m}-{d}'))
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a95388cfe2.png'

// 其他状态
const loading = ref(false)
const open = ref(false)
const title = ref('')
const showSearch = ref(true)
const userList = ref([])
const allSchedules = ref([])
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)

// 查询参数
const queryParams = reactive({
  userId: null,
  scheduleType: null,
  status: null
})

// 表单
const form = reactive({
  scheduleId: null,
  userId: null,
  scheduleDate: null,
  startTime: null,
  endTime: null,
  scheduleType: null,
  workContent: null,
  status: '0'
})

// 校验规则
const rules = reactive({
  userId: [{ required: true, message: '请选择员工', trigger: 'change' }],
  scheduleDate: [{ required: true, message: '请选择排班日期', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择上班时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择下班时间', trigger: 'change' }],
  scheduleType: [{ required: true, message: '请选择排班类型', trigger: 'change' }]
})

// 排班类型字典
const scheduleTypeDict = ref([
  { value: '0', label: '前台', postName: '前台接待' },
  { value: '1', label: '私教', postName: '健身教练' },
  { value: '2', label: '保洁', postName: '保洁员' },
  { value: '3', label: '其他', postName: '其他岗位' }
])

// ==================== 月份切换核心函数 ====================
// 上月
function prevMonth() {
  if (currentMonth.value === 1) {
    currentYear.value--
    currentMonth.value = 12
  } else {
    currentMonth.value--
  }
  loadAllSchedules()
}

// 下月
function nextMonth() {
  if (currentMonth.value === 12) {
    currentYear.value++
    currentMonth.value = 1
  } else {
    currentMonth.value++
  }
  loadAllSchedules()
}

// 计算当前月份的第一天和最后一天
const currentMonthFirstDay = computed(() => {
  return new Date(currentYear.value, currentMonth.value - 1, 1)
})

const currentMonthLastDay = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 0)
})

// ==================== 时间格式化（修复00:00问题） ====================
function formatTime(timeStr) {
  if (!timeStr) return '00:00'
  if (timeStr.includes(' ')) {
    return timeStr.split(' ')[1].substring(0, 5)
  }
  return '00:00'
}

// ==================== 计算属性 ====================
// 月视图日历数据
const monthCalendar = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value - 1 // JS月份从0开始
  const firstDay = currentMonthFirstDay.value
  const lastDay = currentMonthLastDay.value
  const firstWeekDay = firstDay.getDay()
  const days = []

  // 上月填充
  for (let i = 0; i < firstWeekDay; i++) {
    const d = new Date(year, month, -i)
    days.push({
      date: parseTime(d, '{y}-{m}-{d}'),
      day: d.getDate(),
      isCurrentMonth: false,
      isToday: false,
      schedules: []
    })
  }

  // 当月日期
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateObj = new Date(year, month, d)
    const dateStr = parseTime(dateObj, '{y}-{m}-{d}')
    const daySchedules = allSchedules.value.filter(s =>
        parseTime(s.scheduleDate, '{y}-{m}-{d}') === dateStr &&
        (!queryParams.userId || s.userId === queryParams.userId) &&
        (!queryParams.scheduleType || s.scheduleType === queryParams.scheduleType)
    )
    days.push({
      date: dateStr,
      day: d,
      isCurrentMonth: true,
      isToday: d === now.getDate() && month === now.getMonth() && year === now.getFullYear(),
      schedules: daySchedules
    })
  }

  // 下月补全
  const nextDays = 42 - days.length
  for (let i = 1; i <= nextDays; i++) {
    const d = new Date(year, month + 1, i)
    days.push({
      date: parseTime(d, '{y}-{m}-{d}'),
      day: d.getDate(),
      isCurrentMonth: false,
      isToday: false,
      schedules: []
    })
  }

  return days
})

// 选中日期的排班详情
const todaySchedules = computed(() => {
  return allSchedules.value.filter(s =>
      parseTime(s.scheduleDate, '{y}-{m}-{d}') === selectedDate.value &&
      (!queryParams.userId || s.userId === queryParams.userId) &&
      (!queryParams.scheduleType || s.scheduleType === queryParams.scheduleType)
  )
})

// ==================== 工具函数 ====================
function getPostName(type) {
  const item = scheduleTypeDict.value.find(d => d.value === type)
  return item ? item.postName : '未知岗位'
}

function selectDate(date, isCurrentMonth) {
  if (!isCurrentMonth) return
  selectedDate.value = date
}

// ==================== 接口调用 ====================
// 加载员工列表
async function loadUserList() {
  const res = await listUser({ pageNum: 1, pageSize: 999 })
  userList.value = res.rows
}

// 加载全量排班数据（按当前月份筛选）
async function loadAllSchedules() {
  loading.value = true
  // 传递当前月份的起止日期给后端，只查询该月数据
  const res = await listEmp({
    ...queryParams,
    startTime: parseTime(currentMonthFirstDay.value, '{y}-{m}-{d}'),
    endTime: parseTime(currentMonthLastDay.value, '{y}-{m}-{d}')
  })
  allSchedules.value = res.rows
  total.value = res.total
  loading.value = false
}

// 搜索/重置
function handleQuery() {
  loadAllSchedules()
}

function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.scheduleId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 新增
function handleAdd() {
  proxy.resetForm("scheduleRef")
  Object.assign(form, {
    scheduleId: null, userId: null, scheduleDate: null,
    startTime: null, endTime: null, scheduleType: null,
    workContent: '', status: '0'
  })
  open.value = true
  title.value = "新增排班"
}

// 修改
function handleUpdate(row) {
  getEmp(row.scheduleId).then(res => {
    Object.assign(form, res.data)
    open.value = true
    title.value = "修改排班"
  })
}

// 提交
function submitForm() {
  proxy.$refs.scheduleRef.validate(valid => {
    if (!valid) return
    const promise = form.scheduleId ? updateEmp(form) : addEmp(form)
    promise.then(() => {
      proxy.$modal.msgSuccess("操作成功")
      open.value = false
      loadAllSchedules()
    })
  })
}

// 删除
function handleDelete(row) {
  const scheduleIds = row ? row.scheduleId : ids.value.join(',')
  proxy.$modal.confirm('确认删除该排班记录？').then(() => {
    return delEmp(scheduleIds)
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功")
    loadAllSchedules()
  }).catch(() => {})
}

// 导出
function handleExport() {
  proxy.download('empManagement/emp/export', {
    ...queryParams,
    startTime: parseTime(currentMonthFirstDay.value, '{y}-{m}-{d}'),
    endTime: parseTime(currentMonthLastDay.value, '{y}-{m}-{d}')
  }, `排班_${currentYear.value}${currentMonth.value}.xlsx`)
}

onMounted(() => {
  loadUserList()
  loadAllSchedules()
})
</script>

<style scoped>
/* 筛选栏样式（完全还原你的截图） */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 16px;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-item span {
  font-size: 14px;
  color: #606266;
}
.filter-item .el-select {
  width: 180px;
}
.month-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}
.current-month {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

/* 日历样式 */
.calendar-wrapper {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}
.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f7fa;
}
.calendar-th {
  padding: 12px 0;
  text-align: center;
  font-weight: bold;
  color: #606266;
  border-bottom: 1px solid #e4e7ed;
}
.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.calendar-td {
  min-height: 100px;
  padding: 8px;
  border-right: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;
  transition: background 0.2s;
}
.calendar-td:nth-child(7n) { border-right: none; }
.calendar-td:hover { background: #f0f9ff; }
.calendar-td.active { background: #e6f7ff; border: 1px solid #409eff; }
.otherMonth { background: #fafafa; color: #c0c4cc; }
.today { background: #fff7e6; }
.day-num {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 6px;
  color: #303133;
}
.schedule-tag {
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.type-0 { background: #409eff; }
.type-1 { background: #67c23a; }
.type-2 { background: #e6a23c; }
.type-3 { background: #909399; }

/* 排班详情卡片样式 */
.schedule-detail-card {
  border-radius: 8px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}
.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.schedule-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}
.emp-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.emp-text .emp-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}
.emp-text .emp-post {
  font-size: 14px;
  color: #606266;
}
.time-info {
  text-align: center;
}
.time-range {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}
.work-content {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}
.operate {
  display: flex;
  gap: 8px;
}
.mb8 { margin-bottom: 8px; }
.mb10 { margin-bottom: 10px; }
.mb20 { margin-bottom: 20px; }
</style>