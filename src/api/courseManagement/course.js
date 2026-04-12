import request from '@/utils/request'

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

