<template>
  <div class="app-container">
    <div class="page-header">
      <h1 class="main-title">课程评价</h1>
      <el-button type="primary" plain round icon="Back" @click="goBack">返回</el-button>
    </div>

    <div class="eva-box">
      <el-card class="eva-card" shadow="hover">
        <div class="eva-body">
          <div class="eva-item">
            <label>课程评分</label>
            <el-rate v-model="courseScore" :max="5" />
          </div>

          <div class="eva-item">
            <label>教练评分</label>
            <el-rate v-model="trainerScore" :max="5" />
          </div>

          <el-input
              v-model="content"
              type="textarea"
              :rows="4"
              placeholder="分享你的上课感受..."
              class="input-area"
          />

          <el-button type="primary" round block @click="submit">
            提交评价
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup name="CourseEvaluate">
import { evaluateCourse } from '@/api/member/course'
import {getCourseReservation} from "@/api/courseManagement/courseReservation.js";
import {getCourse} from "@/api/courseManagement/course.js";
import { addEvaluation } from '@/api/trainerManagement/evaluation'
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const resId = route.query.resId
const courseScore = ref(5)
const trainerScore = ref(5)
const content = ref('')
const courseInfo = ref({})
const courseReservationInfo = ref({})
const courseId = ref(null)

onMounted(async () => {
  try {
    // 1. 先获取预约信息
    const resRes = await getCourseReservation(resId)
    courseReservationInfo.value = resRes.data

    // 2. 拿到课程ID
    courseId.value = courseReservationInfo.value.courseId

    // 3. 再获取课程信息
    const courseRes = await getCourse(courseId.value)
    courseInfo.value = courseRes.data
    console.log(courseInfo)
  } catch (e) {
    console.error("加载数据失败", e)
  }
})

async function submit() {
  await evaluateCourse({
    reservationId: resId,
    memberId:courseReservationInfo.value.memberId,
    courseId:courseId.value,
    score: courseScore.value,
    comment: content.value
  })

  await addEvaluation({
    trainerId:courseInfo.value.trainerId,
    memberId:courseReservationInfo.value.memberId,
    score:trainerScore,
    comment: content.value
  })

  proxy.$modal.msgSuccess('评价成功')
  router.push({ name: 'MyReservation' })
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.app-container {
  padding: 30px;
  background: linear-gradient(135deg, #f7f8fa 0%, #f2f5f9 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.page-header {
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.main-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d2129;
}
.eva-box {
  width: 100%;
  max-width: 500px;
}
.eva-card {
  border-radius: 20px;
}
.eva-body {
  padding: 24px;
}
.eva-item {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.eva-item label {
  font-size: 16px;
  font-weight: 500;
}
.input-area {
  margin-bottom: 24px;
}
</style>