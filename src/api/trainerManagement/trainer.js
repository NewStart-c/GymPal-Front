import request from '@/utils/request'

// 查询教练管理列表
export function listTrainer(query) {
  return request({
    url: '/trainerManagement/trainer/list',
    method: 'get',
    params: query
  })
}

// 查询教练管理详细
export function getTrainer(trainerId) {
  return request({
    url: '/trainerManagement/trainer/' + trainerId,
    method: 'get'
  })
}

// 新增教练管理
export function addTrainer(data) {
  return request({
    url: '/trainerManagement/trainer',
    method: 'post',
    data: data
  })
}

// 修改教练管理
export function updateTrainer(data) {
  return request({
    url: '/trainerManagement/trainer',
    method: 'put',
    data: data
  })
}

// 删除教练管理
export function delTrainer(trainerId) {
  return request({
    url: '/trainerManagement/trainer/' + trainerId,
    method: 'delete'
  })
}
