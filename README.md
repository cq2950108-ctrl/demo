# 个人效率管理系统

一个结合待办事项管理和直播间业务数据分析功能的个人效率管理系统。

## 功能特性

- 📅 日历式待办事项管理
- 🎯 任务优先级分级（S/A/B/C/D）
- 🔍 任务搜索功能
- ✅ 已完成任务归档
- 📊 业务数据手动录入
- 📈 数据可视化分析
- 💾 本地数据存储（2年保存周期）

## 技术栈

- Vue.js 3 + TypeScript
- Element Plus UI库
- ECharts 图表库
- Pinia 状态管理
- Vue Router 路由管理
- Vite 构建工具

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint
```

## 项目结构

```
src/
├── components/     # 公共组件
├── views/         # 页面组件
├── stores/        # Pinia状态管理
├── utils/         # 工具函数
├── types/         # TypeScript类型定义
└── router/        # 路由配置
```