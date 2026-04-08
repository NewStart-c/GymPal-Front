<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="教练ID" prop="trainerId">
        <el-input
          v-model="queryParams.trainerId"
          placeholder="请输入教练ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会员ID" prop="memberId">
        <el-input
          v-model="queryParams.memberId"
          placeholder="请输入会员ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="评分" prop="score">
        <el-input
          v-model="queryParams.score"
          placeholder="请输入评分"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="评价时间" prop="evaluationTime">
        <el-date-picker clearable
          v-model="queryParams.evaluationTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择评价时间">
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
          v-hasPermi="['trainerManagement:evaluation:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['trainerManagement:evaluation:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['trainerManagement:evaluation:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['trainerManagement:evaluation:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="evaluationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="评价ID" align="center" prop="evaluationId" />
      <el-table-column label="教练ID" align="center" prop="trainerId" />
      <el-table-column label="会员ID" align="center" prop="memberId" />
      <el-table-column label="评分" align="center" prop="score" />
      <el-table-column label="评价内容" align="center" prop="comment" />
      <el-table-column label="评价时间" align="center" prop="evaluationTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.evaluationTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['trainerManagement:evaluation:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['trainerManagement:evaluation:remove']">删除</el-button>
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

    <!-- 添加或修改教练评价对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="evaluationRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="教练ID" prop="trainerId">
          <el-input v-model="form.trainerId" placeholder="请输入教练ID" />
        </el-form-item>
        <el-form-item label="会员ID" prop="memberId">
          <el-input v-model="form.memberId" placeholder="请输入会员ID" />
        </el-form-item>
        <el-form-item label="评分" prop="score">
          <el-input v-model="form.score" placeholder="请输入评分" />
        </el-form-item>
        <el-form-item label="评价内容" prop="comment">
          <el-input v-model="form.comment" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="评价时间" prop="evaluationTime">
          <el-date-picker clearable
            v-model="form.evaluationTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择评价时间">
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

<script setup name="Evaluation">
import { listEvaluation, getEvaluation, delEvaluation, addEvaluation, updateEvaluation } from "@/api/trainerManagement/evaluation"

const { proxy } = getCurrentInstance()

const evaluationList = ref([])
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
    trainerId: null,
    memberId: null,
    score: null,
    comment: null,
    evaluationTime: null,
  },
  rules: {
    trainerId: [
      { required: true, message: "教练ID不能为空", trigger: "blur" }
    ],
    memberId: [
      { required: true, message: "会员ID不能为空", trigger: "blur" }
    ],
    score: [
      { required: true, message: "评分不能为空", trigger: "blur" }
    ],
    evaluationTime: [
      { required: true, message: "评价时间不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询教练评价列表 */
function getList() {
  loading.value = true
  listEvaluation(queryParams.value).then(response => {
    evaluationList.value = response.rows
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
    evaluationId: null,
    trainerId: null,
    memberId: null,
    score: null,
    comment: null,
    evaluationTime: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  proxy.resetForm("evaluationRef")
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
  ids.value = selection.map(item => item.evaluationId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加教练评价"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _evaluationId = row.evaluationId || ids.value
  getEvaluation(_evaluationId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改教练评价"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["evaluationRef"].validate(valid => {
    if (valid) {
      if (form.value.evaluationId != null) {
        updateEvaluation(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addEvaluation(form.value).then(response => {
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
  const _evaluationIds = row.evaluationId || ids.value
  proxy.$modal.confirm('是否确认删除教练评价编号为"' + _evaluationIds + '"的数据项？').then(function() {
    return delEvaluation(_evaluationIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('trainerManagement/evaluation/export', {
    ...queryParams.value
  }, `evaluation_${new Date().getTime()}.xlsx`)
}

getList()
</script>
