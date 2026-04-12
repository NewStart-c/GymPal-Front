import request from '@/utils/request'

// 查询课程评价列表
export function listEvaluation(query) {
  return request({
    url: '/courseManagement/evaluation/list',
    method: 'get',
    params: query
  })
}

// 查询课程评价详细
export function getEvaluation(evaluationId) {
  return request({
    url: '/courseManagement/evaluation/' + evaluationId,
    method: 'get'
  })
}

// 新增课程评价
export function addEvaluation(data) {
  return request({
    url: '/courseManagement/evaluation',
    method: 'post',
    data: data
  })
}

// 修改课程评价
export function updateEvaluation(data) {
  return request({
    url: '/courseManagement/evaluation',
    method: 'put',
    data: data
  })
}

// 删除课程评价
export function delEvaluation(evaluationId) {
  return request({
    url: '/courseManagement/evaluation/' + evaluationId,
    method: 'delete'
  })
}
