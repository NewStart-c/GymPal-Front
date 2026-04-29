<template>
  <div class="coach-profile">
    <!-- 头部标题 -->
    <div class="profile-header">
      <h2>个人资料</h2>
      <p>查看与编辑我的教练信息</p>
    </div>

    <!-- 资料卡片 -->
    <div class="profile-card">
      <el-form ref="profileRef" :model="form" label-width="100px" class="profile-form">

        <!-- 基本信息 -->
        <el-divider content-position="left">
          <span class="divider-title">基本信息</span>
        </el-divider>

        <el-form-item label="教练编号">
          <span class="text">{{ form.trainerId }}</span>
        </el-form-item>

        <el-form-item label="员工编号">
          <span class="text">{{ form.employeeId }}</span>
        </el-form-item>

        <el-form-item label="专长">
          <el-input
              v-model="form.specialties"
              type="textarea"
              :rows="2"
              placeholder="请输入专长，用逗号分隔"
          />
        </el-form-item>

        <el-form-item label="教学经验">
          <el-input
              v-model="form.experience"
              type="textarea"
              :rows="3"
              placeholder="请输入教学经验/简介"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
              v-model="form.remark"
              type="textarea"
              :rows="2"
              placeholder="备注信息"
          />
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item class="btn-row">
          <el-button type="primary" @click="saveProfile">
            <el-icon class="el-icon--left"><Check /></el-icon>
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { coachProfile, updateCoachProfile } from '@/api/coach'

const profileRef = ref()
const form = ref({
  trainerId: '',
  employeeId: '',
  specialties: '',
  experience: '',
  remark: ''
})

// 获取资料
function getProfile() {
  coachProfile().then(res => {
    form.value = res.data
  })
}

// 保存
function saveProfile() {
  profileRef.value.validate(valid => {
    if (valid) {
      updateCoachProfile(form.value).then(() => {
        ElMessage.success('保存成功')
        getProfile()
      })
    }
  })
}

onMounted(() => {
  getProfile()
})
</script>

<style scoped>
.coach-profile {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 20px 0;
}

/* 头部 */
.profile-header {
  margin-bottom: 20px;
}
.profile-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 4px 0;
}
.profile-header p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 卡片 */
.profile-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.divider-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

/* 只读文本 */
.text {
  color: #333;
  font-size: 14px;
}

/* 按钮行 */
.btn-row {
  text-align: center;
  margin-top: 12px;
}
</style>