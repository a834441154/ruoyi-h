import request from '@/utils/request'

// 查询运营系统 - 场地列表
export function listRegion(query) {
  return request({
    url: '/system/region/list',
    method: 'get',
    params: query
  })
}

// 查询运营系统 - 场地详细
export function getRegion(id) {
  return request({
    url: '/system/region/' + id,
    method: 'get'
  })
}

// 新增运营系统 - 场地
export function addRegion(data) {
  return request({
    url: '/system/region',
    method: 'post',
    data: data
  })
}

// 修改运营系统 - 场地
export function updateRegion(data) {
  return request({
    url: '/system/region',
    method: 'put',
    data: data
  })
}

// 删除运营系统 - 场地
export function delRegion(id) {
  return request({
    url: '/system/region/' + id,
    method: 'delete'
  })
}

// 查询场地树
export function getRegTree(){
  return request({
    url: '/system/region/tree',
    method: 'get'
  })
}
