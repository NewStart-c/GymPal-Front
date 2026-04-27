import request from '@/utils/request'

// 查询课程预约列表
export function listCourseReservation(query) {
  return request({
    url: '/courseManagement/courseReservation/list',
    method: 'get',
    params: query
  })
}

// 查询课程预约详细
export function getCourseReservation(reservationId) {
  return request({
    url: '/courseManagement/courseReservation/' + reservationId,
    method: 'get'
  })
}

// 通过会员ID查询课程预约详细
export function getCourseReservationByMemberId(memberId) {
  return request({
    url: '/courseManagement/courseReservation/getCourseReservationByMemberId' + memberId,
    method: 'get'
  })
}

// 新增课程预约
export function addCourseReservation(data) {
  return request({
    url: '/courseManagement/courseReservation',
    method: 'post',
    data: data
  })
}

// 修改课程预约
export function updateCourseReservation(data) {
  return request({
    url: '/courseManagement/courseReservation',
    method: 'put',
    data: data
  })
}

// 删除课程预约
export function delCourseReservation(reservationId) {
  return request({
    url: '/courseManagement/courseReservation/' + reservationId,
    method: 'delete'
  })
}
