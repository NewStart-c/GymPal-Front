import request from '@/utils/request'



// 查询会员管理列表
export function listMember(query) {
  return request({
    url: '/memberManagement/member/list',
    method: 'get',
    params: query
  })
}

// 查找自己（会员用）
export function getMe(){
  return request({
    url: 'memberManagement/member/me',
    method:'get',
  })
}

// 查询会员管理详细
export function getMember(memberId) {
  return request({
    url: '/memberManagement/member/' + memberId,
    method: 'get'
  })
}

// 新增会员管理
export function addMember(data) {
  return request({
    url: '/memberManagement/member',
    method: 'post',
    data: data
  })
}

// 修改会员管理
export function updateMember(data) {
  return request({
    url: '/memberManagement/member',
    method: 'put',
    data: data
  })
}

// 删除会员管理
export function delMember(memberId) {
  return request({
    url: '/memberManagement/member/' + memberId,
    method: 'delete'
  })
}


// 会员充值
export function memberRecharge(data) {
  return request({
    url: '/memberManagement/member/recharge',
    method: 'put',
    data: data
  })
}