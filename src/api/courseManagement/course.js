import request from '@/utils/request'



// 预约课程
export function reserveCourse(data) {
  return request({
    url: '/courseReservation/memberReserve',
    method: 'post',
    data: data
  })
}

// 我的预约
export function myReservation() {
  return request({
    url: '/courseReservation/myList',
    method: 'get'
  })
}

// 签到
export function sign(id) {
  return request({
    url: '/courseReservation/sign/' + id,
    method: 'post'
  })
}

// 支付
export function payCourse(data) {
  return request({
    url: '/courseOrder/memberPay',
    method: 'post',
    data: data
  })
}

// 评价
export function evaluateCourse(data) {
  return request({
    url: '/courseEvaluation/memberEvaluate',
    method: 'post',
    data: data
  })
}

// 取消预约
export function cancelCourse(id) {
  return request({
    url: '/courseReservation/cancel/' + id,
    method: 'post'
  })
}

// 查询课程信息列表
export function listCourse(query) {
  return request({
    url: '/courseManagement/course/list',
    method: 'get',
    params: query
  })
}

// 查询课程信息详细
export function getCourse(courseId) {
  return request({
    url: '/courseManagement/course/' + courseId,
    method: 'get'
  })
}

// 新增课程信息
export function addCourse(data) {
  return request({
    url: '/courseManagement/course',
    method: 'post',
    data: data
  })
}

// 修改课程信息
export function updateCourse(data) {
  return request({
    url: '/courseManagement/course',
    method: 'put',
    data: data
  })
}

// 删除课程信息
export function delCourse(courseId) {
  return request({
    url: '/courseManagement/course/' + courseId,
    method: 'delete'
  })
}

// 1. 查询课程统计数据（仪表盘表格）
export function getCourseStatistics(query) {
  return request({
    url: '/courseManagement/course/getCourseStatistics',
    method: 'get',
    params: query
  })
}

// 2. 查询热门课程排名（报表页）
export function getHotCourseRank(query) {
  return request({
    url: '/courseManagement/course/getHotCourseRank',
    method: 'get',
    params: query
  })
}

// 3. 查询课程预约趋势（报表页）
export function getReservationTrend(query) {
  return request({
    url: '/courseManagement/course/getReservationTrend',
    method: 'get',
    params: query
  })
}

// 4. 查询课程类型收入占比（报表页/仪表盘饼图）
export function getCourseIncomeType(query) {
  return request({
    url: '/courseManagement/course/getCourseIncomeType',
    method: 'get',
    params: query
  })
}

