import request from '@/utils/request'

// 查询会员等级列表
export function listMamberLevel(query) {
  return request({
    url: '/memberManagement/mamberLevel/list',
    method: 'get',
    params: query
  })
}

// 查询会员等级详细
export function getMamberLevel(levelId) {
  return request({
    url: '/memberManagement/mamberLevel/' + levelId,
    method: 'get'
  })
}

// 新增会员等级
export function addMamberLevel(data) {
  return request({
    url: '/memberManagement/mamberLevel',
    method: 'post',
    data: data
  })
}

// 修改会员等级
export function updateMamberLevel(data) {
  return request({
    url: '/memberManagement/mamberLevel',
    method: 'put',
    data: data
  })
}

// 删除会员等级
export function delMamberLevel(levelId) {
  return request({
    url: '/memberManagement/mamberLevel/' + levelId,
    method: 'delete'
  })
}
