/**
 * 1.枚举所有语言注释的正则
 * 2.读取文件字符串
 * 3.提取注释数据为对象格式
 */

const fs = require('fs')
const {promisify} = require('util')
const {reg_map} = require('../config')
const readFile = promisify(fs.readFile)

// 可选的匹配正则
const regMap = reg_map || [
  /\/\*+([\s\S]+?)\*\//g, // 匹配js多行注释
  /<!--([\s\S]+?)-->/g, // 匹配html注释
  /'{3}([\s\S]+?)'{3}/g // 匹配python多行注释
]

// 获取文件字符串
function getFileString (file) {
  return readFile(file, 'utf8')
}

// 提取文件注释
function getComments (target = '') {
  let result = []
  regMap.forEach(reg => {
    while (match = reg.exec(target)) {
      // 获取匹配到的字符串，并剔除每行前面的空格和*
      let m = match[1].replace(/^\s*\**/gm, '')
      // 解析字符串
      let item = m.split(/\s*@/).reduce((prev, cur, i) => {
        if (i === 0) {
          // 第一个标识为title
          prev.title = (cur || '').trim()
        } else {
          // 解析key和value
          let kvs = cur.split(/\s+/),
            k = kvs[0],
            v = kvs.slice(1).join(' ')
          prev[k] = prev[k] ? prev[k].concat(v) : [v]
        }
        return prev
      }, {})
      result.push(item)
    }
  })
  return result
}

module.exports = file => {
  return new Promise(async (resolve, reject) => {
    try {
      let target = await getFileString(file)
      let result = getComments(target)
      resolve(result)
    } catch (e) {
      reject(e)
    }
  })
}
