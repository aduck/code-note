module.exports = {
  // 文件能读取的最大限制，默认5M
  MAX_SIZE: 5 * 1024 * 1024,
  // 包含的文件格式
  include_exts: ['.html', '.css', '.js', '.vue', '.ts', '.tsx', '.jsx', '.py'],
  // 可以匹配的正则
  reg_map: [
    /\/\*+([\s\S]+?)\*\//g, // 匹配js多行注释
    /<!--([\s\S]+?)-->/g, // 匹配html注释
    /'{3}([\s\S]+?)'{3}/g // 匹配python多行注释
  ]
}