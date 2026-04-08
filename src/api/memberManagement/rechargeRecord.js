import request from '@/utils/request'

// 查询储值记录列表
export function listRechargeRecord(query) {
  return request({
    url: '/memberManagement/rechargeRecord/list',
    method: 'get',
    params: query
  })
}

// 查询储值记录详细
export function getRechargeRecord(recordId) {
  return request({
    url: '/memberManagement/rechargeRecord/' + recordId,
    method: 'get'
  })
}

// 新增储值记录
export function addRechargeRecord(data) {
  return request({
    url: '/memberManagement/rechargeRecord',
    method: 'post',
    data: data
  })
}

// 修改储值记录
export function updateRechargeRecord(data) {
  return request({
    url: '/memberManagement/rechargeRecord',
    method: 'put',
    data: data
  })
}

// 删除储值记录
export function delRechargeRecord(recordId) {
  return request({
    url: '/memberManagement/rechargeRecord/' + recordId,
    method: 'delete'
  })
}
