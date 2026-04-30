<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="员工ID" prop="employeeId">
        <el-input
          v-model="queryParams.employeeId"
          placeholder="请输入员工ID"
          clearable
          @keyup.enter="handleQuery"
        />
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
          v-hasPermi="['trainerManagement:trainer:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['trainerManagement:trainer:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['trainerManagement:trainer:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['trainerManagement:trainer:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="trainerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="教练ID" align="center" prop="trainerId" />
      <el-table-column label="员工ID" align="center" prop="employeeId" />
      <el-table-column label="专长(JSON格式)" align="center" prop="specialties" />
      <el-table-column label="经验描述" align="center" prop="experience" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="教练图集地址列表" align="center" prop="imageUrls" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['trainerManagement:trainer:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['trainerManagement:trainer:remove']">删除</el-button>
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

    <!-- 添加或修改教练管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="trainerRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="专长(JSON格式)" prop="specialties">
          <el-input v-model="form.specialties" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="经验描述" prop="experience">
          <el-input v-model="form.experience" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="教练图集地址列表" prop="imageUrls">
          <el-input v-model="form.imageUrls" type="textarea" placeholder="请输入内容" />
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

<script setup name="Trainer">
import { listTrainer, getTrainer, delTrainer, addTrainer, updateTrainer } from "@/api/trainerManagement/trainer"

const { proxy } = getCurrentInstance()

const trainerList = ref([])
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
    specialties: null,
    experience: null,
    imageUrls: null
  },
  rules: {
    employeeId: [
      // { required: true, message: "员工ID不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询教练管理列表 */
function getList() {
  loading.value = true
  listTrainer(queryParams.value).then(response => {
    trainerList.value = response.rows
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
    trainerId: null,
    employeeId: null,
    specialties: null,
    experience: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    imageUrls: null
  }
  proxy.resetForm("trainerRef")
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
  ids.value = selection.map(item => item.trainerId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加教练管理"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _trainerId = row.trainerId || ids.value
  getTrainer(_trainerId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改教练管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["trainerRef"].validate(valid => {
    if (valid) {
      if (form.value.trainerId != null) {
        updateTrainer(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addTrainer(form.value).then(response => {
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
  const _trainerIds = row.trainerId || ids.value
  proxy.$modal.confirm('是否确认删除教练管理编号为"' + _trainerIds + '"的数据项？').then(function() {
    return delTrainer(_trainerIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('trainerManagement/trainer/export', {
    ...queryParams.value
  }, `trainer_${new Date().getTime()}.xlsx`)
}

getList()
</script>
