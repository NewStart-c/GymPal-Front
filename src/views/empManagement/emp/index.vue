<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="员工ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入员工ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="排班日期" prop="scheduleDate">
        <el-date-picker clearable
          v-model="queryParams.scheduleDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择排班日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="上班时间" prop="startTime">
        <el-date-picker clearable
          v-model="queryParams.startTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择上班时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="下班时间" prop="endTime">
        <el-date-picker clearable
          v-model="queryParams.endTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择下班时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="排班类型" prop="scheduleType">
        <el-select v-model="queryParams.scheduleType" placeholder="请选择排班类型" clearable>
          <el-option
            v-for="dict in schedule_date"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排班状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择排班状态" clearable>
          <el-option
            v-for="dict in emp_status"
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
          v-hasPermi="['empManagement:emp:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['empManagement:emp:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['empManagement:emp:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['empManagement:emp:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="empList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="排班ID" align="center" prop="scheduleId" />
      <el-table-column label="员工ID" align="center" prop="userId" />
      <el-table-column label="排班日期" align="center" prop="scheduleDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.scheduleDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上班时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下班时间" align="center" prop="endTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排班类型" align="center" prop="scheduleType">
        <template #default="scope">
          <dict-tag :options="schedule_date" :value="scope.row.scheduleType"/>
        </template>
      </el-table-column>
      <el-table-column label="工作内容" align="center" prop="workContent" />
      <el-table-column label="排班状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="emp_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['empManagement:emp:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['empManagement:emp:remove']">删除</el-button>
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

    <!-- 添加或修改员工排班对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="empRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="员工ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入员工ID" />
        </el-form-item>
        <el-form-item label="排班日期" prop="scheduleDate">
          <el-date-picker clearable
            v-model="form.scheduleDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择排班日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="上班时间" prop="startTime">
          <el-date-picker clearable
            v-model="form.startTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择上班时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="下班时间" prop="endTime">
          <el-date-picker clearable
            v-model="form.endTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择下班时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="排班类型" prop="scheduleType">
          <el-select v-model="form.scheduleType" placeholder="请选择排班类型">
            <el-option
              v-for="dict in schedule_date"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工作内容">
          <editor v-model="form.workContent" :min-height="192"/>
        </el-form-item>
        <el-form-item label="排班状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in emp_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="删除标志" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除标志" />
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

<script setup name="Emp">
import { listEmp, getEmp, delEmp, addEmp, updateEmp } from "@/api/empManagement/emp"

const { proxy } = getCurrentInstance()
const { emp_status, schedule_date } = proxy.useDict('emp_status', 'schedule_date')

const empList = ref([])
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
    userId: null,
    scheduleDate: null,
    startTime: null,
    endTime: null,
    scheduleType: null,
    workContent: null,
    status: null,
  },
  rules: {
    userId: [
      { required: true, message: "员工ID不能为空", trigger: "blur" }
    ],
    scheduleDate: [
      { required: true, message: "排班日期不能为空", trigger: "blur" }
    ],
    startTime: [
      { required: true, message: "上班时间不能为空", trigger: "blur" }
    ],
    endTime: [
      { required: true, message: "下班时间不能为空", trigger: "blur" }
    ],
    scheduleType: [
      { required: true, message: "排班类型不能为空", trigger: "change" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询员工排班列表 */
function getList() {
  loading.value = true
  listEmp(queryParams.value).then(response => {
    empList.value = response.rows
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
    scheduleId: null,
    userId: null,
    scheduleDate: null,
    startTime: null,
    endTime: null,
    scheduleType: null,
    workContent: null,
    status: null,
    delFlag: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  proxy.resetForm("empRef")
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
  ids.value = selection.map(item => item.scheduleId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加员工排班"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _scheduleId = row.scheduleId || ids.value
  getEmp(_scheduleId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改员工排班"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["empRef"].validate(valid => {
    if (valid) {
      if (form.value.scheduleId != null) {
        updateEmp(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addEmp(form.value).then(response => {
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
  const _scheduleIds = row.scheduleId || ids.value
  proxy.$modal.confirm('是否确认删除员工排班编号为"' + _scheduleIds + '"的数据项？').then(function() {
    return delEmp(_scheduleIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('empManagement/emp/export', {
    ...queryParams.value
  }, `emp_${new Date().getTime()}.xlsx`)
}

getList()
</script>
