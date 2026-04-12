<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="70px">
      <el-form-item label="员工">
        <el-select v-model="queryParams.userId" placeholder="请选择员工" clearable style="width:200px">
          <el-option
              v-for="user in userList"
              :key="user.userId"
              :label="user.nickName"
              :value="user.userId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排班类型">
        <el-select v-model="queryParams.scheduleType" placeholder="请选择" clearable>
          <el-option
              v-for="dict in scheduleTypeDict"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排班状态">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable>
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
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

    <!-- 视图切换 -->
    <el-button-group class="mb10">
      <el-button :type="viewType === 'month' ? 'primary' : ''" @click="switchView('month')">月视图</el-button>
      <el-button :type="viewType === 'table' ? 'primary' : ''" @click="switchView('table')">列表视图</el-button>
    </el-button-group>

    <!-- 图例 -->
    <div class="mb10">
      <el-tag type="primary" size="small">前台</el-tag>
      <el-tag type="success" size="small" class="ml5">私教</el-tag>
      <el-tag type="warning" size="small" class="ml5">保洁</el-tag>
      <el-tag type="info" size="small" class="ml5">其他</el-tag>
    </div>

    <!-- 月视图日历 -->
    <div v-if="viewType === 'month'" class="calendar-wrapper">
      <div class="calendar-header">
        <span v-for="item in ['日','一','二','三','四','五','六']" :key="item" class="calendar-th">
          {{ item }}
        </span>
      </div>
      <div class="calendar-body">
        <div
            v-for="(day, idx) in monthCalendar"
            :key="idx"
            class="calendar-td"
            :class="{ today: day.isToday, otherMonth: !day.isCurrentMonth }"
        >
          <div class="day-num">{{ day.day }}</div>
          <div
              v-for="item in day.schedules"
              :key="item.scheduleId"
              class="schedule-item"
              :class="getClassByType(item.scheduleType)"
          >
            {{ item.nickName }}
          </div>
        </div>
      </div>
    </div>

    <!-- 列表视图 -->
    <el-table v-else v-loading="loading" :data="empList" @selection-change="handleSelectionChange" border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="员工姓名" align="center" prop="nickName" />
      <el-table-column label="排班日期" align="center" width="130">
        <template #default="scope">
          <span>{{ parseTime(scope.row.scheduleDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上班时间" align="center" width="130">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下班时间" align="center" width="130">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排班类型" align="center" width="100">
        <template #default="scope">
          <el-tag :type="getTagType(scope.row.scheduleType)" size="small">
            {{ getTypeName(scope.row.scheduleType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="工作内容" align="center" prop="workContent" show-overflow-tooltip />
      <el-table-column label="状态" align="center" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status == 0 ? 'success' : 'danger'">
            {{ scope.row.status == 0 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-if="viewType === 'table' && total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 新增/修改弹窗 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="empRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="选择员工" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择员工" style="width:100%">
            <el-option
                v-for="user in userList"
                :key="user.userId"
                :label="user.nickName"
                :value="user.userId"
            />
          </el-select>
        </el-form-item>
        <!-- 排班日期 + 时间（完整datetime） -->
        <el-form-item label="排班日期" prop="scheduleDate">
          <el-date-picker
              v-model="form.scheduleDate"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择排班日期时间"
              style="width:100%"
          />
        </el-form-item>

        <!-- 上班时间 -->
        <el-form-item label="上班时间" prop="startTime">
          <el-date-picker
              v-model="form.startTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择上班日期时间"
              style="width:100%"
          />
        </el-form-item>

        <!-- 下班时间 -->
        <el-form-item label="下班时间" prop="endTime">
          <el-date-picker
              v-model="form.endTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择下班日期时间"
              style="width:100%"
          />
        </el-form-item>
        <el-form-item label="排班类型" prop="scheduleType">
          <el-select v-model="form.scheduleType" placeholder="请选择排班类型">
            <el-option
                v-for="dict in scheduleTypeDict"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工作内容">
          <el-input v-model="form.workContent" type="textarea" rows="3" placeholder="工作内容" />
        </el-form-item>
        <el-form-item label="排班状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button @click="open = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="EmpSchedule">
import { ref, reactive, onMounted } from 'vue'
import { listEmp, getEmp, delEmp, addEmp, updateEmp } from "@/api/empManagement/emp"
import { listUser } from "@/api/system/user"
import { parseTime } from "@/utils/ruoyi"

const { proxy } = getCurrentInstance()

// 状态
const loading = ref(true)
const showSearch = ref(true)
const open = ref(false)
const title = ref("")
const viewType = ref("month")
const empList = ref([])
const userList = ref([])
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const monthCalendar = ref([])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userId: null,
  scheduleType: null,
  status: null
})

// 表单（完全匹配你的数据库字段）
const form = reactive({
  scheduleId: null,
  userId: null,
  scheduleDate: null,
  startTime: null,
  endTime: null,
  scheduleType: null,
  workContent: null,
  status: '0',
  remark: null,
  delFlag: '0'
})

// 校验
const rules = reactive({
  userId: [{ required: true, message: "请选择员工", trigger: "change" }],
  scheduleDate: [{ required: true, message: "请选择排班日期时间", trigger: "change" }],
  startTime: [{ required: true, message: "请选择上班时间", trigger: "change" }],
  endTime: [{ required: true, message: "请选择下班时间", trigger: "change" }],
  scheduleType: [{ required: true, message: "请选择排班类型", trigger: "change" }]
})
// 排班类型（和数据库一致）
const scheduleTypeDict = ref([
  { value: '0', label: '前台' },
  { value: '1', label: '私教' },
  { value: '2', label: '保洁' },
  { value: '3', label: '其他' }
])

// 样式映射
function getTagType(val) {
  const map = { 0: 'primary', 1: 'success', 2: 'warning', 3: 'info' }
  return map[val] || 'info'
}
function getClassByType(val) {
  const map = { 0: 'bg-primary', 1: 'bg-success', 2: 'bg-warning', 3: 'bg-info' }
  return map[val] || 'bg-info'
}
function getTypeName(val) {
  const item = scheduleTypeDict.value.find(d => d.value == val)
  return item ? item.label : ''
}

// 切换视图
function switchView(v) {
  viewType.value = v
  v === 'table' ? getList() : buildMonthCalendar()
}

// 加载员工列表
async function loadUserList() {
  const res = await listUser({ pageSize: 1000 })
  userList.value = res.rows
}

// 获取排班列表
function getList() {
  loading.value = true
  listEmp(queryParams).then(res => {
    empList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

// 搜索/重置
function handleQuery() {
  queryParams.pageNum = 1
  viewType.value === 'table' ? getList() : buildMonthCalendar()
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
  proxy.resetForm("empRef")
  Object.assign(form, {
    scheduleId: null, userId: null, scheduleDate: null,
    startTime: null, endTime: null, scheduleType: null,
    workContent: '', status: '0', remark: ''
  })
  open.value = true
  title.value = "新增排班"
}

// 修改
function handleUpdate(row) {
  const id = row ? row.scheduleId : ids.value[0]
  getEmp(id).then(res => {
    Object.assign(form, res.data)
    open.value = true
    title.value = "修改排班"
  })
}

// 提交
function submitForm() {
  proxy.$refs.empRef.validate(valid => {
    if (!valid) return
    const promise = form.scheduleId ? updateEmp(form) : addEmp(form)
    promise.then(() => {
      proxy.$modal.msgSuccess("操作成功")
      open.value = false
      viewType.value === 'table' ? getList() : buildMonthCalendar()
    })
  })
}

// 删除
function handleDelete(row) {
  const scheduleIds = row ? row.scheduleId : ids.value.join(',')
  proxy.$modal.confirm('确认删除选中的排班记录吗？').then(() => {
    return delEmp(scheduleIds)
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功")
    viewType.value === 'table' ? getList() : buildMonthCalendar()
  })
}

// 导出
function handleExport() {
  proxy.download('/empManagement/emp/export', { ...queryParams }, `员工排班_${parseTime(new Date())}.xlsx`)
}

// ==================== 月视图日历 ====================
function buildMonthCalendar() {
  loading.value = true
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  listEmp({
    ...queryParams,
    scheduleDate: `${parseTime(firstDay, '{y}-{m}-{d}')},${parseTime(lastDay, '{y}-{m}-{d}')}`
  }).then(res => {
    const schedules = res.rows
    const list = []
    const firstWeekDay = firstDay.getDay()
    const days = lastDay.getDate()

    // 上月填充
    for (let i = 0; i < firstWeekDay; i++) list.push({ isCurrentMonth: false, day: '' })
    // 当月
    for (let d = 1; d <= days; d++) {
      const dateStr = parseTime(new Date(year, month, d), '{y}-{m}-{d}')
      list.push({
        isCurrentMonth: true,
        day: d,
        isToday: d === now.getDate(),
        schedules: schedules.filter(s => parseTime(s.scheduleDate, '{y}-{m}-{d}') === dateStr)
      })
    }
    // 补全
    while (list.length % 7 !== 0) list.push({ isCurrentMonth: false, day: '' })
    monthCalendar.value = list
    loading.value = false
  })
}

onMounted(() => {
  loadUserList()
  switchView('month')
})
</script>

<style scoped>
.calendar-wrapper {
  border: 1px solid #eee;
  border-radius: 6px;
  overflow: hidden;
}
.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f9f9f9;
}
.calendar-th {
  padding: 12px 0;
  text-align: center;
  font-weight: bold;
  border-bottom: 1px solid #eee;
}
.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.calendar-td {
  min-height: 100px;
  padding: 6px;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
}
.calendar-td:nth-child(7n) { border-right: none; }
.otherMonth { background: #fafafa; color: #ccc; }
.today { background: #e8f4ff; }
.day-num {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
}
.schedule-item {
  padding: 2px 4px;
  border-radius: 3px;
  color: #fff;
  font-size: 12px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bg-primary { background: #409eff; }
.bg-success { background: #67c23a; background: #67c23a; }
.bg-warning { background: #e6a23c; }
.bg-info { background: #909399; }
.ml5 { margin-left: 5px; }
.mb10 { margin-bottom: 10px; }
</style>