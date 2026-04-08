<template>
  <div class="app-container">
    <!-- 顶部操作按钮 -->
    <div class="top-btn-group" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['memberManagement:member:add']">
          新增会员
        </el-button>
        <el-button type="success" icon="Money" style="margin-left: 8px;">
          快速收银
        </el-button>
      </div>
      <div>
        <el-button type="default" icon="Upload" @click="handleImport" style="margin-right: 8px;">
          批量导入
        </el-button>
        <el-button type="default" icon="Download" @click="handleExport" style="margin-right: 8px;" v-hasPermi="['memberManagement:member:export']">
          批量导出
        </el-button>
        <el-button type="danger" icon="Delete" @click="handleBatchDelete" :disabled="multiple" v-hasPermi="['memberManagement:member:remove']">
          批量删除
          <span style="margin-left: 4px;">已选择 {{ ids.length }} 项</span>
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="0px" style="margin-bottom: 16px;">
      <el-form-item>
        <el-input
            v-model="queryParams.keyword"
            placeholder="请输入会员姓名或手机号"
            clearable
            @keyup.enter="handleQuery"
            style="width: 240px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.memberLevelId" placeholder="全部等级" clearable style="width: 120px;">
          <el-option label="全部等级" value="" />
          <el-option label="金卡会员" value="1" />
          <el-option label="银卡会员" value="2" />
          <el-option label="钻石会员" value="3" />
          <el-option label="普通会员" value="4" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 120px;">
          <el-option label="全部状态" value="" />
          <el-option label="正常" value="0" />
          <el-option label="冻结" value="1" />
          <el-option label="注销" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="default" icon="Filter" @click="toggleAdvancedSearch">
          高级筛选
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 高级筛选（默认隐藏） -->
    <el-form :model="advancedParams" ref="advancedRef" :inline="true" v-show="showAdvancedSearch" label-width="80px" style="margin-bottom: 16px; padding: 16px; background: #f5f7fa; border-radius: 4px;">
      <el-form-item label="性别" prop="gender">
        <el-select v-model="advancedParams.gender" placeholder="请选择性别" clearable>
          <el-option
              v-for="dict in member_gender"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="生日" prop="birthday">
        <el-date-picker clearable
                        v-model="advancedParams.birthday"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="请选择生日">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="注册日期" prop="registrationDate">
        <el-date-picker clearable
                        v-model="advancedParams.registrationDate"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="请选择注册日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="储值余额" prop="currentBalance">
        <el-input
            v-model="advancedParams.currentBalance"
            placeholder="请输入储值余额"
            clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleAdvancedQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetAdvancedQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 会员列表表格 -->
    <el-table v-loading="loading" :data="memberList" @selection-change="handleSelectionChange" style="width: 100%;">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="会员ID" align="center" prop="memberId" sortable />
      <el-table-column label="姓名" align="center" prop="name" sortable />
      <el-table-column label="手机号" align="center" prop="phoneNumber" />
      <el-table-column label="会员等级" align="center" prop="memberLevelId">
        <template #default="scope">
          <el-tag :type="getLevelTagType(scope.row.memberLevelId)">{{ getLevelName(scope.row.memberLevelId) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="储值余额" align="center" prop="currentBalance">
        <template #default="scope">
          ¥{{ Number(scope.row.currentBalance).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="注册日期" align="center" prop="registrationDate" sortable width="120">
        <template #default="scope">
          <span>{{ parseTime(scope.row.registrationDate, '{y}/{m}/{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">{{ getStatusName(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="400">
        <template #default="scope">
          <el-button link type="primary" icon="View" size="small" @click="handleView(scope.row)">查看</el-button>
          <el-button link type="primary" icon="Edit" size="small" @click="handleUpdate(scope.row)" v-hasPermi="['memberManagement:member:edit']">编辑</el-button>
          <el-button link type="danger" icon="Delete" size="small" @click="handleDelete(scope.row)" v-hasPermi="['memberManagement:member:remove']">删除</el-button>
          <el-button link type="success" icon="Money" size="small">充值</el-button>
          <el-button link type="info" icon="Ticket" size="small">消费</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
      <div>共 {{ total }} 条记录, 每页显示
        <el-select v-model="queryParams.pageSize" style="width: 80px;" @change="getList">
          <el-option label="10" value="10" />
          <el-option label="20" value="20" />
          <el-option label="50" value="50" />
          <el-option label="100" value="100" />
        </el-select> 条
      </div>
      <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />
      <div>
        跳转到
        <el-input v-model="jumpPage" style="width: 80px; margin: 0 8px;" />
        <el-button type="primary" @click="handleJump">跳转</el-button>
      </div>
    </div>

    <!-- 添加或修改会员管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="memberRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="会员姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入会员姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio
                v-for="dict in member_gender"
                :key="dict.value"
                :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号码" prop="phoneNumber">
          <el-input v-model="form.phoneNumber" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker clearable
                          v-model="form.birthday"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择生日">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="注册日期" prop="registrationDate">
          <el-date-picker clearable
                          v-model="form.registrationDate"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择注册日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="会员等级" prop="memberLevelId">
          <el-select v-model="form.memberLevelId" placeholder="请选择会员等级">
            <el-option label="金卡会员" value="3" />
            <el-option label="银卡会员" value="2" />
            <el-option label="钻石会员" value="4" />
            <el-option label="普通会员" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="储值余额" prop="currentBalance">
          <el-input v-model="form.currentBalance" placeholder="请输入储值余额" prefix="¥" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">冻结</el-radio>
            <el-radio label="2">注销</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Member">
import { listMember, getMember, delMember, addMember, updateMember } from "@/api/memberManagement/member"
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()
const { member_status, member_gender } = proxy.useDict('member_status', 'member_gender')

// 响应式数据
const memberList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const showAdvancedSearch = ref(false)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const jumpPage = ref(1)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 20,
  keyword: null, // 姓名/手机号模糊搜索
  memberLevelId: null, // 会员等级
  status: null // 状态
})

// 高级筛选参数
const advancedParams = reactive({
  gender: null,
  birthday: null,
  registrationDate: null,
  currentBalance: null
})

// 表单数据
const form = reactive({
  memberId: null,
  name: null,
  gender: null,
  phoneNumber: null,
  birthday: null,
  registrationDate: null,
  memberLevelId: null,
  currentBalance: null,
  status: null,
  createBy: null,
  createTime: null,
  updateBy: null,
  updateTime: null,
  remark: null
})

// 表单校验规则
const rules = reactive({
  name: [
    { required: true, message: "会员姓名不能为空", trigger: "blur" }
  ],
  phoneNumber: [
    { required: true, message: "手机号码不能为空", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码", trigger: "blur" }
  ],
  registrationDate: [
    { required: true, message: "注册日期不能为空", trigger: "blur" }
  ],
  memberLevelId: [
    { required: true, message: "会员等级不能为空", trigger: "blur" }
  ]
})

/** 查询会员管理列表 */
function getList() {
  loading.value = true
  // 合并基础查询参数和高级筛选参数
  const params = { ...queryParams, ...advancedParams }
  listMember(params).then(response => {
    memberList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 切换高级筛选显示/隐藏
function toggleAdvancedSearch() {
  showAdvancedSearch.value = !showAdvancedSearch.value
}

// 基础搜索
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

// 高级搜索
function handleAdvancedQuery() {
  queryParams.pageNum = 1
  getList()
}

// 重置高级筛选
function resetAdvancedQuery() {
  advancedParams.gender = null
  advancedParams.birthday = null
  advancedParams.registrationDate = null
  advancedParams.currentBalance = null
}

/** 重置基础搜索按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  queryParams.keyword = null
  queryParams.memberLevelId = null
  queryParams.status = null
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.memberId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 批量删除
function handleBatchDelete() {
  if (ids.value.length === 0) {
    ElMessage.warning("请选择要删除的会员")
    return
  }
  proxy.$modal.confirm('是否确认删除选中的会员数据？').then(function() {
    return delMember(ids.value)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 新增按钮操作 */
function handleAdd() {
  resetForm()
  open.value = true
  title.value = "添加会员"
}

/** 查看会员 */
function handleView(row) {
  // 可扩展查看详情逻辑
  ElMessage.info("查看会员详情功能待实现")
}

/** 修改按钮操作 */
function handleUpdate(row) {
  resetForm()
  const _memberId = row.memberId || ids.value
  getMember(_memberId).then(response => {
    Object.assign(form, response.data)
    open.value = true
    title.value = "修改会员"
  })
}

// 表单重置
function resetForm() {
  Object.keys(form).forEach(key => {
    form[key] = null
  })
  proxy.resetForm("memberRef")
}

// 取消按钮
function cancel() {
  open.value = false
  resetForm()
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["memberRef"].validate(valid => {
    if (valid) {
      if (form.memberId != null) {
        updateMember(form).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addMember(form).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 单个删除按钮操作 */
function handleDelete(row) {
  const _memberIds = row.memberId || ids.value
  proxy.$modal.confirm('是否确认删除会员ID为"' + _memberIds + '"的数据？').then(function() {
    return delMember(_memberIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导入按钮操作 */
function handleImport() {
  // 可扩展批量导入逻辑
  ElMessage.info("批量导入功能待实现")
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('memberManagement/member/export', {
    ...queryParams,
    ...advancedParams
  }, `member_${new Date().getTime()}.xlsx`)
}

// 页码跳转
function handleJump() {
  if (jumpPage.value < 1 || jumpPage.value > Math.ceil(total.value / queryParams.pageSize)) {
    ElMessage.warning("页码超出范围")
    return
  }
  queryParams.pageNum = jumpPage.value
  getList()
}

// 获取会员等级标签类型
function getLevelTagType(levelId) {
  const typeMap = {
    3: "warning", // 金卡会员-黄色
    2: "info",    // 银卡会员-灰色
    4: "primary",  // 钻石会员-紫色
    1: "purple"  // 普通会员-蓝色
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
    0: "success", // 正常-绿色
    1: "warning", // 冻结-黄色
    2: "danger"   // 注销-红色
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

// 初始化查询列表
getList()
</script>

<style scoped>
.top-btn-group {
  padding: 0 8px;
}
.el-tag {
  --el-tag-padding: 2px 8px;
}
</style>