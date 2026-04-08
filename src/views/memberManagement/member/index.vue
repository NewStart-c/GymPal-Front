<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="会员姓名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入会员姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="queryParams.gender" placeholder="请选择性别" clearable>
          <el-option
              v-for="dict in member_gender"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="手机号码" prop="phoneNumber">
        <el-input
          v-model="queryParams.phoneNumber"
          placeholder="请输入手机号码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="生日" prop="birthday">
        <el-date-picker clearable
          v-model="queryParams.birthday"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择生日">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="注册日期" prop="registrationDate">
        <el-date-picker clearable
          v-model="queryParams.registrationDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择注册日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="会员等级ID" prop="memberLevelId">
        <el-input
          v-model="queryParams.memberLevelId"
          placeholder="请输入会员等级ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="储值余额" prop="currentBalance">
        <el-input
          v-model="queryParams.currentBalance"
          placeholder="请输入储值余额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态(0正常 1冻结 2注销)" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态(0正常 1冻结 2注销)" clearable>
          <el-option
            v-for="dict in member_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['memberManagement:member:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['memberManagement:member:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['memberManagement:member:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['memberManagement:member:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="memberList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="会员ID" align="center" prop="memberId" />
      <el-table-column label="会员姓名" align="center" prop="name" />
      <el-table-column label="性别(0男 1女 2未知)" align="center" prop="gender">
        <template #default="scope">
          <dict-tag :options="member_gender" :value="scope.row.gender"/>
        </template>
      </el-table-column>
      <el-table-column label="手机号码" align="center" prop="phoneNumber" />
      <el-table-column label="生日" align="center" prop="birthday" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.birthday, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="注册日期" align="center" prop="registrationDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.registrationDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会员等级ID" align="center" prop="memberLevelId" />
      <el-table-column label="储值余额" align="center" prop="currentBalance" />
      <el-table-column label="状态(0正常 1冻结 2注销)" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="member_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['memberManagement:member:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['memberManagement:member:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

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
        <el-form-item label="会员等级ID" prop="memberLevelId">
          <el-input v-model="form.memberLevelId" placeholder="请输入会员等级ID" />
        </el-form-item>
        <el-form-item label="储值余额" prop="currentBalance">
          <el-input v-model="form.currentBalance" placeholder="请输入储值余额" />
        </el-form-item>
        <el-form-item label="状态(0正常 1冻结 2注销)" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in member_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
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

const { proxy } = getCurrentInstance()
const { member_status, member_gender } = proxy.useDict('member_status', 'member_gender')

const memberList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    gender: null,
    phoneNumber: null,
    birthday: null,
    registrationDate: null,
    memberLevelId: null,
    currentBalance: null,
    status: null,
  },
  rules: {
    name: [
      { required: true, message: "会员姓名不能为空", trigger: "blur" }
    ],
    phoneNumber: [
      { required: true, message: "手机号码不能为空", trigger: "blur" }
    ],
    registrationDate: [
      { required: true, message: "注册日期不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询会员管理列表 */
function getList() {
  loading.value = true
  listMember(queryParams.value).then(response => {
    memberList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
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
  }
  proxy.resetForm("memberRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.memberId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加会员管理"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _memberId = row.memberId || ids.value
  getMember(_memberId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改会员管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["memberRef"].validate(valid => {
    if (valid) {
      if (form.value.memberId != null) {
        updateMember(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addMember(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _memberIds = row.memberId || ids.value
  proxy.$modal.confirm('是否确认删除会员管理编号为"' + _memberIds + '"的数据项？').then(function() {
    return delMember(_memberIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('memberManagement/member/export', {
    ...queryParams.value
  }, `member_${new Date().getTime()}.xlsx`)
}

getList()
</script>
