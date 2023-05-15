import request from '@/utils/request'

// 查询运营系统 - 场地列表
export function listStation(query) {
  return request({
    url: '/system/station/list',
    method: 'get',
    params: query
  })
}

// 查询运营系统 - 场地详细
export function getStation(id) {
  return request({
    url: '/system/station/' + id,
    method: 'get'
  })
}

// 新增运营系统 - 场地
export function addStation(data) {
  return request({
    url: '/system/station',
    method: 'post',
    data: data
  })
}

// 修改运营系统 - 场地
export function updateStation(data) {
  return request({
    url: '/system/station',
    method: 'put',
    data: data
  })
}

// 删除运营系统 - 场地
export function delStation(id) {
  return request({
    url: '/system/station/' + id,
    method: 'delete'
  })
}

// 启用停用站点enable:1启用，0停用
export function enableStation(enable,id) {
  if(enable == 1){
    return request({
      url: '/system/station/disable/' + id,
      method: 'post'
    })
  }else{
    return request({
      url: '/system/station/enable/' + id,
      method: 'post'
    })
  }
  
}
