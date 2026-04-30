<template>
  <div class="coach-course">
    <!-- 头部 -->
    <div class="course-header">
      <div>
        <h2>我的课程</h2>
        <p>管理我开设的所有课程</p>
      </div>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus></Plus></el-icon> 新增课程
      </el-button>
    </div>

    <!-- 表格 -->
    <el-card shadow="hover" class="table-card">
      <el-table v-loading="loading" :data="courseList" border>
        <el-table-column label="课程名称" align="center" prop="courseName" />
        <el-table-column label="课程类型" align="center" prop="courseType" />
        <el-table-column label="开始时间" align="center" prop="startTime" />
        <el-table-column label="地点" align="center" prop="location" />
        <el-table-column label="容量" align="center" prop="maxCapacity" />
        <el-table-column label="已报名" align="center" prop="currentEnrollment" />
        <el-table-column label="状态" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status == 1 ? 'success' : scope.row.status == 2 ? 'warning' : 'info'">
              {{ scope.row.status == 0 ? '待开始' : scope.row.status == 1 ? '进行中' : '已结束' }}
            </el-tag>
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
    </el-card>

    <!-- 新增弹窗 -->
    <el-dialog v-model="addVisible" title="新增课程" width="500px">
      <el-form ref="addRef" :model="addForm" label-width="100px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="addForm.courseName" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="课程类型" prop="courseType">
          <el-input v-model="addForm.courseType" placeholder="瑜伽/拳击/塑形等" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="addForm.startTime" type="datetime" placeholder="选择时间" />
        </el-form-item>
        <el-form-item label="地点" prop="location">
          <el-input v-model="addForm.location" placeholder="上课地点" />
        </el-form-item>
        <el-form-item label="最大容量" prop="maxCapacity">
          <el-input v-model="addForm.maxCapacity" type="number" placeholder="人数上限" />
        </el-form-item>
        <el-form-item label="价格" prop="maxCapacity">
          <el-input v-model="addForm.price" type="number" placeholder="原价价格" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" @click="addCourse1">确认新增</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { coachCourse, getTrainerId } from '@/api/coach'
import { addCourse } from '@/api/courseManagement/course'
import { ElMessage } from 'element-plus'

const courseList = ref([])
const loading = ref(false)
const total = ref(0)
const queryParams = ref({ pageNum: 1, pageSize: 10 })

const trainerId = ref(1)

// 新增弹窗
const addVisible = ref(false)
const addRef = ref()
const addForm = ref({
  courseName: '',
  courseType: '',
  startTime: '',
  location: '',
  price: '',
  trainerId: trainerId.value,
  maxCapacity: 10,
  currentEnrollment: 0,
  status: 0
})



// 获取列表
function getList() {
  loading.value = true
  coachCourse(queryParams.value).then(res => {
    courseList.value = res.rows
    total.value = res.total
    loading.value = false
  })


}

// 打开新增
function openAddDialog() {
  addVisible.value = true
}

// 新增课程
function addCourse1() {
  addRef.value.validate(valid => {
      addForm.value.trainerId = trainerId.value
      addCourse(addForm.value).then(() => {
        ElMessage.success('新增成功')
        addVisible.value = false
        getList()
      })
  })
}


onMounted(() => {
  getList()
  getTrainerId().then(res =>{
    trainerId.value = res.data.trainerId
  })
})


</script>

<style scoped>
.coach-course {
  width: 100%;
  padding: 20px 20px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.course-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 4px 0;
}

.course-header p {
  font-size: 14px;
  color: #888;
  margin: 0;
}

.table-card {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.el-pagination) {
  padding: 16px;
  text-align: right;
}
</style>