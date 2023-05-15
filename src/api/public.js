import request from '@/utils/request'

// 获取路由
export const getCity = () => {
  return request({
    url: '/system/dict/data/getCity',
    method: 'get'
  })
}