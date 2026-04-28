<template>
  <div class="app-container">
    <div class="page-header">
      <h1 class="main-title">课程支付</h1>
      <el-button type="primary" plain round icon="Back" @click="goBack">返回</el-button>
    </div>

    <div class="pay-card-box">
      <el-card class="pay-card" shadow="hover">
        <div class="pay-body">
          <div class="pay-title">
            <h2>订单确认</h2>
            <p>完成支付后即可评价课程</p>
          </div>

          <div class="info-group">
            <div class="info-item">
              <label>课程名称</label>
              <span>{{ courseInfo.courseName }}</span>
            </div>
            <div class="info-item">
              <label>上课时间</label>
              <span>{{ parseTime(courseInfo.startTime) }}</span>
            </div>
            <div class="info-item">
              <label>上课地点</label>
              <span>{{ courseInfo.location }}</span>
            </div>
          </div>

          <!-- 👇 原价划线 + 会员优惠价 -->
          <div class="price-group">
            <div class="original-price">
              原价：<span>¥{{ courseInfo.price || 0 }}</span>
            </div>
            <div class="final-price">
              会员价：<span>¥{{ finalAmount || 0 }}</span>
            </div>
          </div>

          <div class="pay-type">
            <label>支付方式</label>
            <el-radio-group v-model="payType" class="radio-group">
              <el-radio label="BALANCE">余额支付</el-radio>
              <el-radio label="WXPAY">微信支付</el-radio>
              <el-radio label="ZFBPAY">支付宝支付</el-radio>
            </el-radio-group>
          </div>

          <el-button type="primary" round block @click="doPay" class="pay-btn">
            确认支付
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup name="CoursePay">
import { payCourse } from '@/api/member/course'
import { getCourse } from '@/api/courseManagement/course'
import { getMe } from '@/api/memberManagement/member'
import { getCourseReservation, updateCourseReservation } from '@/api/courseManagement/courseReservation'
import { getMamberLevel } from '@/api/memberManagement/mamberLevel'

const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const resId = route.query.resId
const courseInfo = ref({})
const courseReservationInfo = ref({})
const payType = ref('BALANCE')
const courseId = ref(null)
const me = ref({})
const memberLevelInfo = ref({})

// 最终应付金额
const finalAmount = computed(() => {
  const price = courseInfo.value?.price || 0
  const discount = memberLevelInfo.value?.discountRate || 1
  return Math.round(price * discount * 100) / 100
})

onMounted(async () => {
  try {
    const memberMe = await getMe()
    me.value = memberMe.data
    memberLevelInfo.value = (await getMamberLevel(me.value.memberLevelId)).data

    const resRes = await getCourseReservation(resId)
    courseReservationInfo.value = resRes.data
    courseId.value = courseReservationInfo.value.courseId

    const courseRes = await getCourse(courseId.value)
    courseInfo.value = courseRes.data
  } catch (e) {
    console.error('加载失败', e)
  }
})

// 支付逻辑
async function doPay() {
  const amount = finalAmount.value
  const balance = me.value.currentBalance || 0

  // 👇 余额支付判断逻辑
  if (payType.value === 'BALANCE') {
    if (balance < amount) {
      proxy.$modal.msgError('余额不足，请选择其他支付方式')
      return
    }
    // 余额足够 → 自动扣减（前端同步更新）
    me.value.currentBalance = balance - amount
  }

  // 提交支付
  await payCourse({
    memberId: courseReservationInfo.value.memberId,
    courseId: courseReservationInfo.value.courseId,
    amount: amount,
    paymentMethod: payType.value,
    status: 1,
  })

  // 更新预约状态为已支付
  courseReservationInfo.value.status = 1
  await updateCourseReservation(courseReservationInfo.value)

  proxy.$modal.msgSuccess('支付成功')
  router.push({name: 'CourseEvaluate', query: {resId}})
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

.pay-card-box {
  width: 100%;
  max-width: 500px;
}

.pay-card {
  border-radius: 20px;
  overflow: hidden;
}

.pay-body {
  padding: 20px;
}

.pay-title {
  text-align: center;
  margin-bottom: 24px;
}

.pay-title h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.pay-title p {
  color: #86909c;
  margin: 0;
}

.info-group {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
}

.info-item label {
  color: #4e5969;
}

/* 👇 价格样式：原价划线 + 会员价 */
.price-group {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.original-price {
  font-size: 14px;
  color: #999;
}

.original-price span {
  text-decoration: line-through;
}

.final-price {
  font-size: 18px;
  font-weight: 600;
  color: #ff4d4f;
}

.pay-type {
  margin-bottom: 24px;
}

.pay-btn {
  height: 44px;
  font-size: 16px;
}
</style>