<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="器材ID" prop="equipmentId">
        <el-input
          v-model="queryParams.equipmentId"
          placeholder="请输入器材ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="维护日期" prop="maintenanceDate">
        <el-date-picker clearable
          v-model="queryParams.maintenanceDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择维护日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="维护人ID" prop="maintainerId">
        <el-input
          v-model="queryParams.maintainerId"
          placeholder="请输入维护人ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="下次维护日期" prop="nextMaintenanceDate">
        <el-date-picker clearable
          v-model="queryParams.nextMaintenanceDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择下次维护日期">
        </el-date-picker>
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
          v-hasPermi="['equipmentManagement:maintenance:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['equipmentManagement:maintenance:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['equipmentManagement:maintenance:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['equipmentManagement:maintenance:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="maintenanceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="维护ID" align="center" prop="maintenanceId" />
      <el-table-column label="器材ID" align="center" prop="equipmentId" />
      <el-table-column label="维护日期" align="center" prop="maintenanceDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.maintenanceDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="维护内容" align="center" prop="maintenanceContent" />
      <el-table-column label="维护人ID" align="center" prop="maintainerId" />
      <el-table-column label="下次维护日期" align="center" prop="nextMaintenanceDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.nextMaintenanceDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['equipmentManagement:maintenance:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['equipmentManagement:maintenance:remove']">删除</el-button>
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

    <!-- 添加或修改器材维护对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="maintenanceRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="器材ID" prop="equipmentId">
          <el-input v-model="form.equipmentId" placeholder="请输入器材ID" />
        </el-form-item>
        <el-form-item label="维护日期" prop="maintenanceDate">
          <el-date-picker clearable
            v-model="form.maintenanceDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择维护日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="维护内容">
          <editor v-model="form.maintenanceContent" :min-height="192"/>
        </el-form-item>
        <el-form-item label="维护人ID" prop="maintainerId">
          <el-input v-model="form.maintainerId" placeholder="请输入维护人ID" />
        </el-form-item>
        <el-form-item label="下次维护日期" prop="nextMaintenanceDate">
          <el-date-picker clearable
            v-model="form.nextMaintenanceDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择下次维护日期">
          </el-date-picker>
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

<script setup name="Maintenance">
import { listMaintenance, getMaintenance, delMaintenance, addMaintenance, updateMaintenance } from "@/api/equipmentManagement/maintenance"

const { proxy } = getCurrentInstance()

const maintenanceList = ref([])
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
    equipmentId: null,
    maintenanceDate: null,
    maintenanceContent: null,
    maintainerId: null,
    nextMaintenanceDate: null,
  },
  rules: {
    equipmentId: [
      { required: true, message: "器材ID不能为空", trigger: "blur" }
    ],
    maintenanceDate: [
      { required: true, message: "维护日期不能为空", trigger: "blur" }
    ],
    maintenanceContent: [
      { required: true, message: "维护内容不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询器材维护列表 */
function getList() {
  loading.value = true
  listMaintenance(queryParams.value).then(response => {
    maintenanceList.value = response.rows
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
    maintenanceId: null,
    equipmentId: null,
    maintenanceDate: null,
    maintenanceContent: null,
    maintainerId: null,
    nextMaintenanceDate: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  proxy.resetForm("maintenanceRef")
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
  ids.value = selection.map(item => item.maintenanceId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加器材维护"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _maintenanceId = row.maintenanceId || ids.value
  getMaintenance(_maintenanceId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改器材维护"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["maintenanceRef"].validate(valid => {
    if (valid) {
      if (form.value.maintenanceId != null) {
        updateMaintenance(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addMaintenance(form.value).then(response => {
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
  const _maintenanceIds = row.maintenanceId || ids.value
  proxy.$modal.confirm('是否确认删除器材维护编号为"' + _maintenanceIds + '"的数据项？').then(function() {
    return delMaintenance(_maintenanceIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('equipmentManagement/maintenance/export', {
    ...queryParams.value
  }, `maintenance_${new Date().getTime()}.xlsx`)
}

getList()
</script>
