import request from '@/utils/request'

// 查询课程评价列表
export function listCourseEvaluation(query) {
  return request({
    url: '/courseManagement/courseEvaluation/list',
    method: 'get',
    params: query
  })
}

// 查询课程评价详细
export function getCourseEvaluation(evaluationId) {
  return request({
    url: '/courseManagement/courseEvaluation/' + evaluationId,
    method: 'get'
  })
}

// 新增课程评价
export function addCourseEvaluation(data) {
  return request({
    url: '/courseManagement/courseEvaluation',
    method: 'post',
    data: data
  })
}

// 修改课程评价
export function updateCourseEvaluation(data) {
  return request({
    url: '/courseManagement/courseEvaluation',
    method: 'put',
    data: data
  })
}

// 删除课程评价
export function delCourseEvaluation(evaluationId) {
  return request({
    url: '/courseManagement/courseEvaluation/' + evaluationId,
    method: 'delete'
  })
}
