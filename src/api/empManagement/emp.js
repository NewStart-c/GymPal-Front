import request from '@/utils/request'

// 查询员工排班列表
export function listEmp(query) {
  return request({
    url: '/empManagement/emp/list',
    method: 'get',
    params: query
  })
}

// 查询员工排班详细
export function getEmp(scheduleId) {
  return request({
    url: '/empManagement/emp/' + scheduleId,
    method: 'get'
  })
}

// 新增员工排班
export function addEmp(data) {
  return request({
    url: '/empManagement/emp',
    method: 'post',
    data: data
  })
}

// 修改员工排班
export function updateEmp(data) {
  return request({
    url: '/empManagement/emp',
    method: 'put',
    data: data
  })
}

// 删除员工排班
export function delEmp(scheduleId) {
  return request({
    url: '/empManagement/emp/' + scheduleId,
    method: 'delete'
  })
}
