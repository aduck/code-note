#!/usr/bin/env node
/**
 * 1.获取所有有效格式的文件列表
 * 2.校验文件的大小、格式、hash(todo)，读取文件字符串内容
 * 3.根据正则提取内容
 * 4.组合文件输出
 */
const fs = require('fs')
const path = require('path')
const {promisify} = require('util')
const {MAX_SIZE, include_exts} = require('./config')
const parseFile = require('./lib/parseFile')

// 读取当前目录
const pwd = process.cwd()
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

// 遍历当前目录的所有可用文件
let enableFiles = []

/**
 * 展开所有文件/夹，返回文件列表
 * @param {String}} dir 工作目录
 * @returns {Promise}
 */
function getFiles (dir = '.') {
  return new Promise(async resolve => {
    // 基础属性
    const statInfo = await stat(dir)
    if (statInfo.isDirectory()) {
      // 目录需要读取文件列表
      let files = await readdir(dir)
      await Promise.all(files.map(file => getFiles(path.resolve(dir, file))))
      resolve()
    } else if (statInfo.isFile()) {
      // 文件需要判断是否可用
      let isEnable = statInfo.size <= MAX_SIZE && include_exts.includes(path.extname(dir))
      isEnable && enableFiles.push(path.resolve(pwd, dir))
      resolve()
    } else {
      resolve()
    }
  })
}

;(async () => {
  // 获取参数
  let args = process.argv.slice(2)
  console.log('args', args)
  // 目录和目录名称
  let target = args[0]
  let filename = args[1] || target.split('/').slice(-1)[0]
  let data = ''
  await getFiles(target)
  let res = await Promise.all(enableFiles.map(v => parseFile(v)))
  res.forEach(item => {
    item.forEach(v => {
      const {title = '', note = []} = v
      data += `## ${title}\r\n\r\n`
      data += `${note.join('\r\n')}\r\n\r\n`
    })
  })
  fs.writeFile(`${filename}.md`, data, {encoding: 'utf8', flag: 'w'}, err => {
    if (err) throw err
    console.log(`note文件 ${filename}.md 已生成`)
  })
})()