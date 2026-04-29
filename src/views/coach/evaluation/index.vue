<template>
  <div class="coach-evaluation">
    <div class="eval-header">
      <h2>我的评价</h2>
      <p>学员对您的教学评价与评分</p>
    </div>

    <div class="eval-list">
      <div class="eval-item" v-for="item in evalList" :key="item.evaluationId">
        <div class="eval-top">
          <div class="avatar">
            <el-icon size="24"><User /></el-icon>
          </div>
          <div class="info">
            <div class="name">会员 {{ item.memberId }}</div>
            <div class="date">{{ item.createTime }}</div>
          </div>
          <div class="score">

            <el-rate v-model="item.score" :max="5" disabled  />
            <span class="score-num">{{ item.score }}</span>
          </div>
        </div>

        <div class="eval-content" v-if="item.comment">
          {{ item.comment }}
        </div>
        <div class="eval-content empty" v-else>
          未填写评价内容
        </div>
      </div>

      <div class="empty-box" v-if="evalList.length === 0">
        <el-empty description="暂无评价" />
      </div>
    </div>

    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User } from '@element-plus/icons-vue'
import { coachEvaluation } from '@/api/coach'

const evalList = ref([])
const loading = ref(false)
const total = ref(0)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10
})

function getList() {
  loading.value = true
  coachEvaluation(queryParams.value).then(res => {
    evalList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.coach-evaluation {
  width: 100%;
  max-width: 750px;
  margin: 0 auto;
  padding: 20px 0;
}

.eval-header {
  margin-bottom: 24px;
}
.eval-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 4px 0;
}
.eval-header p {
  font-size: 14px;
  color: #888;
  margin: 0;
}

/* 评价列表 */
.eval-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.eval-item {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.eval-top {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f2f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.info {
  flex: 1;
}
.info .name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}
.info .date {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.score {
  display: flex;
  align-items: center;
  gap: 6px;
}
.score-num {
  font-size: 16px;
  font-weight: 600;
  color: #ffad42;
}

.eval-content {
  font-size: 14px;
  color: #444;
  line-height: 1.6;
  padding: 10px 14px;
  background: #f9fafb;
  border-radius: 10px;
}
.eval-content.empty {
  color: #aaa;
}

.empty-box {
  padding: 40px 0;
  text-align: center;
}
</style>