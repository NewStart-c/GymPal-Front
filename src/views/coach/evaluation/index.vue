<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="evalList" border>
      <el-table-column label="评分" align="center" prop="score" />
      <el-table-column label="评价内容" align="center" prop="comment" />
      <el-table-column label="评价时间" align="center" prop="createTime" />
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
import { coachEvaluation } from '@/api/coach'
import { ref, onMounted } from 'vue'

const evalList = ref([])
const loading = ref(false)
const total = ref(0)
const queryParams = ref({ pageNum: 1, pageSize: 10 })

function getList() {
  loading.value = true
  coachEvaluation(queryParams.value).then(res => {
    evalList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

onMounted(() => getList())
</script>