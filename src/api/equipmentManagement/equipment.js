import request from '@/utils/request'

// 查询器材列表
export function listEquipment(query) {
  return request({
    url: '/equipmentManagement/equipment/list',
    method: 'get',
    params: query
  })
}

// 查询器材详细
export function getEquipment(equipmentId) {
  return request({
    url: '/equipmentManagement/equipment/' + equipmentId,
    method: 'get'
  })
}

// 新增器材
export function addEquipment(data) {
  return request({
    url: '/equipmentManagement/equipment',
    method: 'post',
    data: data
  })
}

// 修改器材
export function updateEquipment(data) {
  return request({
    url: '/equipmentManagement/equipment',
    method: 'put',
    data: data
  })
}

// 删除器材
export function delEquipment(equipmentId) {
  return request({
    url: '/equipmentManagement/equipment/' + equipmentId,
    method: 'delete'
  })
}
