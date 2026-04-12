import request from '@/utils/request'

// 查询课程订单列表
export function listCourseOrder(query) {
  return request({
    url: '/courseManagement/courseOrder/list',
    method: 'get',
    params: query
  })
}

// 查询课程订单详细
export function getCourseOrder(orderId) {
  return request({
    url: '/courseManagement/courseOrder/' + orderId,
    method: 'get'
  })
}

// 新增课程订单
export function addCourseOrder(data) {
  return request({
    url: '/courseManagement/courseOrder',
    method: 'post',
    data: data
  })
}

// 修改课程订单
export function updateCourseOrder(data) {
  return request({
    url: '/courseManagement/courseOrder',
    method: 'put',
    data: data
  })
}

// 删除课程订单
export function delCourseOrder(orderId) {
  return request({
    url: '/courseManagement/courseOrder/' + orderId,
    method: 'delete'
  })
}
