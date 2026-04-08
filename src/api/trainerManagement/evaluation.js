import request from '@/utils/request'

// 查询教练评价列表
export function listEvaluation(query) {
  return request({
    url: '/trainerManagement/evaluation/list',
    method: 'get',
    params: query
  })
}

// 查询教练评价详细
export function getEvaluation(evaluationId) {
  return request({
    url: '/trainerManagement/evaluation/' + evaluationId,
    method: 'get'
  })
}

// 新增教练评价
export function addEvaluation(data) {
  return request({
    url: '/trainerManagement/evaluation',
    method: 'post',
    data: data
  })
}

// 修改教练评价
export function updateEvaluation(data) {
  return request({
    url: '/trainerManagement/evaluation',
    method: 'put',
    data: data
  })
}

// 删除教练评价
export function delEvaluation(evaluationId) {
  return request({
    url: '/trainerManagement/evaluation/' + evaluationId,
    method: 'delete'
  })
}
