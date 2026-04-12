import request from '@/utils/request'

// 查询课程评价列表
export function listCourseManagement(query) {
  return request({
    url: '/courseManagement/courseManagement/list',
    method: 'get',
    params: query
  })
}

// 查询课程评价详细
export function getCourseManagement(evaluationId) {
  return request({
    url: '/courseManagement/courseManagement/' + evaluationId,
    method: 'get'
  })
}

// 新增课程评价
export function addCourseManagement(data) {
  return request({
    url: '/courseManagement/courseManagement',
    method: 'post',
    data: data
  })
}

// 修改课程评价
export function updateCourseManagement(data) {
  return request({
    url: '/courseManagement/courseManagement',
    method: 'put',
    data: data
  })
}

// 删除课程评价
export function delCourseManagement(evaluationId) {
  return request({
    url: '/courseManagement/courseManagement/' + evaluationId,
    method: 'delete'
  })
}
