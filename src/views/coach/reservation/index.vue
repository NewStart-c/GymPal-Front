<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="reservationList" border>
      <el-table-column label="会员ID" align="center" prop="memberId" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="预约时间" align="center" prop="reservationTime" />
      <el-table-column label="状态" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status == 1 ? 'success' : 'warning'">
            {{ scope.row.status == 0 ? '待签到' : '已完成' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
              type="success"
              icon="Check"
              size="small"
              :disabled="scope.row.status == 1"
              @click="sign(scope.row.reservationId)">
            签到
          </el-button>
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
  </div>
</template>

<script setup>
import { coachReservation, coachSign } from '@/api/coach'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const reservationList = ref([])
const loading = ref(false)
const total = ref(0)
const queryParams = ref({ pageNum: 1, pageSize: 10 })

function getList() {
  loading.value = true
  coachReservation(queryParams.value).then(res => {
    reservationList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

function sign(id) {
  coachSign(id).then(() => {
    ElMessage.success('签到成功')
    getList()
  })
}

onMounted(() => getList())
</script>