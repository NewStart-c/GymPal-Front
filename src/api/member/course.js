import request from '@/utils/request'

// 会员预约
export function memberReserve(data) {
  return request({ url: '/courseManagement/courseReservation/memberReserve', method: 'post', data })
}

// 我的预约
export function myReservation(query) {
  return request({ url: '/courseManagement/courseReservation/myList', method: 'post', data:query })
}

// 签到
export function sign(resId) {
  return request({ url: '/courseManagement/courseReservation/sign/' + resId, method: 'post' })
}

// 支付
export function payCourse(data) {
  return request({ url: '/courseManagement/courseOrder/memberPay', method: 'post', data })
}

// 评价
export function evaluateCourse(data) {
  return request({ url: '/courseManagement/courseEvaluation/memberEvaluate', method: 'post', data })
}

// 预约课程
export function reserveCourse(data) {
  return request({
    url: '/courseReservation/memberReserve',
    method: 'post',
    data: data
  })
}




// 取消预约
export function cancelCourse(reservationId) {
  return request({
    url: '/courseManagement/courseReservation/cancel/' + reservationId,
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
