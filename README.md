# Markdown 转换器项目文档

## 项目概述
一个基于 Web 的 Markdown 转换工具，支持实时预览和导出 Word 文档功能。

## 开发信息
- 开发时间：2024年3月
- 技术栈：HTML、CSS、JavaScript
- 依赖库：
  - showdown.js (v2.1.0) - Markdown 转换
  - FileSaver.js (v2.0.5) - 文件下载

## 功能特性

### 核心功能
1. Markdown 实时预览
   - 支持标准 Markdown 语法
   - 实时渲染预览
   - 支持表格显示

2. 文档导出
   - 支持导出为 Word 格式（.doc）
   - 保留表格样式和格式

### UI 特性
1. 现代化深色主题界面
   - ChatGPT 风格设计
   - 响应式布局

2. 分栏设计
   - 左侧文档历史栏
   - 中间编辑区
   - 右侧预览区

3. 表格样式优化
   - 清晰的边框和间距
   - 表头样式区分
   - 隔行变色效果
   - 悬停高亮效果

## 技术实现细节

### 性能优化
1. 使用 CDN 加载外部库
   - showdown.js (v2.1.0)
   - FileSaver.js (v2.0.5)
2. CSS 优化
   - 使用 CSS Box-sizing: border-box
   - 避免不必要的嵌套选择器
3. JavaScript 优化
   - 事件委托处理
   - 防抖处理实时预览

### 浏览器兼容性
- 支持现代浏览器（Chrome、Firefox、Safari、Edge）
- 使用标准 CSS 属性
- 提供降级方案的 Word 导出样式

## 待优化功能
1. 文档历史记录功能实现
2. 本地存储支持
3. 文件导入功能
4. 更多导出格式支持（如 PDF）
5. 主题切换功能
6. 移动端适配优化

## 使用说明

### 本地部署
1. 下载项目文件
2. 确保 index.html 和 script.js 在同一目录
3. 使用现代浏览器打开 index.html

### 推荐使用方式
使用 VS Code + Live Server 插件运行项目：
1. 安装 VS Code
2. 安装 Live Server 扩展
3. 右键 index.html 选择 "Open with Live Server"

## 更新日志

### 2024-03 初始版本
- ✅ 基础 Markdown 转换功能
- ✅ Word 导出功能
- ✅ 深色主题 UI 设计
- ✅ 表格样式优化

## 维护者
[您的名字/组织名称]

## 许可证
[选择合适的开源许可证]
### Markdown 转换配置