import request from '@/utils/request'

// 查询器材维护列表
export function listMaintenance(query) {
  return request({
    url: '/equipmentManagement/maintenance/list',
    method: 'get',
    params: query
  })
}

// 查询器材维护详细
export function getMaintenance(maintenanceId) {
  return request({
    url: '/equipmentManagement/maintenance/' + maintenanceId,
    method: 'get'
  })
}

// 新增器材维护
export function addMaintenance(data) {
  return request({
    url: '/equipmentManagement/maintenance',
    method: 'post',
    data: data
  })
}

// 修改器材维护
export function updateMaintenance(data) {
  return request({
    url: '/equipmentManagement/maintenance',
    method: 'put',
    data: data
  })
}

// 删除器材维护
export function delMaintenance(maintenanceId) {
  return request({
    url: '/equipmentManagement/maintenance/' + maintenanceId,
    method: 'delete'
  })
}
