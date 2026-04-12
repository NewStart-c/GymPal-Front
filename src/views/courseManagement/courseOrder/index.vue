<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="会员ID" prop="memberId">
        <el-input
          v-model="queryParams.memberId"
          placeholder="请输入会员ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="课程ID" prop="courseId">
        <el-input
          v-model="queryParams.courseId"
          placeholder="请输入课程ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单金额" prop="amount">
        <el-input
          v-model="queryParams.amount"
          placeholder="请输入订单金额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="支付方式" prop="paymentMethod">
        <el-input
          v-model="queryParams.paymentMethod"
          placeholder="请输入支付方式"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="下单时间" prop="orderTime">
        <el-date-picker clearable
          v-model="queryParams.orderTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择下单时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in course_order_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="操作员ID" prop="operatorId">
        <el-input
          v-model="queryParams.operatorId"
          placeholder="请输入操作员ID"
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
          v-hasPermi="['courseManagement:courseOrder:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['courseManagement:courseOrder:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['courseManagement:courseOrder:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['courseManagement:courseOrder:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="courseOrderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="课程订单ID" align="center" prop="orderId" />
      <el-table-column label="会员ID" align="center" prop="memberId" />
      <el-table-column label="课程ID" align="center" prop="courseId" />
      <el-table-column label="订单金额" align="center" prop="amount" />
      <el-table-column label="支付方式" align="center" prop="paymentMethod" />
      <el-table-column label="下单时间" align="center" prop="orderTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.orderTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="course_order_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作员ID" align="center" prop="operatorId" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['courseManagement:courseOrder:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['courseManagement:courseOrder:remove']">删除</el-button>
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

    <!-- 添加或修改课程订单对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="courseOrderRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="会员ID" prop="memberId">
          <el-input v-model="form.memberId" placeholder="请输入会员ID" />
        </el-form-item>
        <el-form-item label="课程ID" prop="courseId">
          <el-input v-model="form.courseId" placeholder="请输入课程ID" />
        </el-form-item>
        <el-form-item label="订单金额" prop="amount">
          <el-input v-model="form.amount" placeholder="请输入订单金额" />
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-input v-model="form.paymentMethod" placeholder="请输入支付方式" />
        </el-form-item>
        <el-form-item label="下单时间" prop="orderTime">
          <el-date-picker clearable
            v-model="form.orderTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择下单时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in course_order_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="操作员ID" prop="operatorId">
          <el-input v-model="form.operatorId" placeholder="请输入操作员ID" />
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

<script setup name="CourseOrder">
import { listCourseOrder, getCourseOrder, delCourseOrder, addCourseOrder, updateCourseOrder } from "@/api/courseManagement/courseOrder"

const { proxy } = getCurrentInstance()
const { course_order_status } = proxy.useDict('course_order_status')

const courseOrderList = ref([])
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
    memberId: null,
    courseId: null,
    amount: null,
    paymentMethod: null,
    orderTime: null,
    status: null,
    operatorId: null,
  },
  rules: {
    memberId: [
      { required: true, message: "会员ID不能为空", trigger: "blur" }
    ],
    courseId: [
      { required: true, message: "课程ID不能为空", trigger: "blur" }
    ],
    amount: [
      { required: true, message: "订单金额不能为空", trigger: "blur" }
    ],
    orderTime: [
      { required: true, message: "下单时间不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询课程订单列表 */
function getList() {
  loading.value = true
  listCourseOrder(queryParams.value).then(response => {
    courseOrderList.value = response.rows
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
    orderId: null,
    memberId: null,
    courseId: null,
    amount: null,
    paymentMethod: null,
    orderTime: null,
    status: null,
    operatorId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  proxy.resetForm("courseOrderRef")
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
  ids.value = selection.map(item => item.orderId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加课程订单"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _orderId = row.orderId || ids.value
  getCourseOrder(_orderId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改课程订单"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["courseOrderRef"].validate(valid => {
    if (valid) {
      if (form.value.orderId != null) {
        updateCourseOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addCourseOrder(form.value).then(response => {
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
  const _orderIds = row.orderId || ids.value
  proxy.$modal.confirm('是否确认删除课程订单编号为"' + _orderIds + '"的数据项？').then(function() {
    return delCourseOrder(_orderIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('courseManagement/courseOrder/export', {
    ...queryParams.value
  }, `courseOrder_${new Date().getTime()}.xlsx`)
}

getList()
</script>
