<template>
  <div id="app">
    <!-- 动态背景层 -->
    <div class="dynamic-background">
      <!-- 主渐变背景 -->
      <div class="gradient-bg"></div>
      
      <!-- 动态粒子效果 -->
      <div class="particles">
        <div class="particle" v-for="i in 50" :key="i" :style="getParticleStyle(i)"></div>
      </div>
      
      <!-- 网格背景 -->
      <div class="grid-overlay"></div>
      
      <!-- 光晕效果 -->
      <div class="glow-effects">
        <div class="glow glow-1"></div>
        <div class="glow glow-2"></div>
        <div class="glow glow-3"></div>
        <div class="glow glow-4"></div>
      </div>
    </div>
    
    <el-container class="app-container">
      <!-- 顶部导航栏 -->
      <el-header class="app-header">
        <div class="header-content">
          <h1 class="app-title">
            <div class="title-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <span class="title-text">个人效率管理系统</span>
            <div class="title-glow"></div>
          </h1>
          <el-menu
            :default-active="$route.path"
            mode="horizontal"
            router
            class="nav-menu"
          >
            <el-menu-item index="/">
              <el-icon><Calendar /></el-icon>
              <span>待办事项</span>
            </el-menu-item>
            <el-menu-item index="/completed">
              <el-icon><Check /></el-icon>
              <span>已完成任务</span>
            </el-menu-item>
            <el-menu-item index="/data-input">
              <el-icon><Edit /></el-icon>
              <span>数据录入</span>
            </el-menu-item>
            <el-menu-item index="/analytics">
              <el-icon><TrendCharts /></el-icon>
              <span>数据分析</span>
            </el-menu-item>
            <el-menu-item index="/document-config">
              <el-icon><Document /></el-icon>
              <span>文档配置</span>
            </el-menu-item>
            <el-menu-item index="/ai-chat">
              <el-icon><ChatDotRound /></el-icon>
              <span>AI对话</span>
            </el-menu-item>
            <el-menu-item index="/pomodoro">
              <el-icon><Timer /></el-icon>
              <span>番茄钟</span>
            </el-menu-item>
            <el-menu-item index="/notebook">
              <el-icon><Notebook /></el-icon>
              <span>记事本</span>
            </el-menu-item>
            <el-menu-item index="/project-management">
              <el-icon><Briefcase /></el-icon>
              <span>项目管理</span>
            </el-menu-item>
            <el-menu-item index="/diagnostic">
              <el-icon><Tools /></el-icon>
              <span>系统诊断</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-header>

      <!-- 主内容区域 -->
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { Calendar, Check, Edit, TrendCharts, Document, Tools, ChatDotRound, Timer, Notebook, Briefcase } from '@element-plus/icons-vue'

// 生成粒子样式
const getParticleStyle = (index: number) => {
  const size = Math.random() * 4 + 2
  const x = Math.random() * 100
  const y = Math.random() * 100
  const duration = Math.random() * 20 + 10
  const delay = Math.random() * 5
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    opacity: Math.random() * 0.8 + 0.2
  }
}
</script>

<style scoped>
/* 动态背景层 */
.dynamic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

/* 主渐变背景 */
.gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    #0f0f23 0%,
    #1a1a2e 25%,
    #16213e 50%,
    #0f3460 75%,
    #533483 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 粒子效果 */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, #00ffff 0%, transparent 70%);
  border-radius: 50%;
  animation: particleFloat 20s linear infinite;
  filter: blur(1px);
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* 网格背景 */
.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* 光晕效果 */
.glow-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: glowPulse 8s ease-in-out infinite;
}

.glow-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.glow-2 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 0, 255, 0.3) 0%, transparent 70%);
  top: 60%;
  right: 20%;
  animation-delay: 2s;
}

.glow-3 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(0, 255, 128, 0.3) 0%, transparent 70%);
  bottom: 20%;
  left: 30%;
  animation-delay: 4s;
}

.glow-4 {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(255, 128, 0, 0.3) 0%, transparent 70%);
  top: 30%;
  right: 10%;
  animation-delay: 6s;
}

@keyframes glowPulse {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.6;
  }
}

/* 应用容器 */
.app-container {
  min-height: 100vh;
  background: transparent;
  position: relative;
  z-index: 1;
}

/* 顶部导航栏 */
.app-header {
  background: rgba(15, 15, 35, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(0, 255, 255, 0.3);
  padding: 0;
  box-shadow: 
    0 4px 30px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(0, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.app-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
  animation: headerShine 3s ease infinite;
}

@keyframes headerShine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
  position: relative;
  z-index: 2;
}

/* 标题样式 */
.app-title {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  position: relative;
  z-index: 3;
}

.title-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00ffff, #ff00ff);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  animation: iconPulse 2s ease infinite;
}

.title-icon .el-icon {
  font-size: 20px;
  color: #0f0f23;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
  }
}

.title-text {
  background: linear-gradient(135deg, #00ffff, #ff00ff, #00ff80);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: textGradient 3s ease infinite;
  text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
  filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.3));
}

@keyframes textGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.title-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2));
  border-radius: 20px;
  filter: blur(15px);
  z-index: -1;
  animation: titleGlow 4s ease infinite;
}

@keyframes titleGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}

/* 导航菜单 */
.nav-menu {
  border-bottom: none;
  background: transparent;
}

.nav-menu :deep(.el-menu-item) {
  border-radius: 16px;
  margin: 0 6px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  color: #00ffff;
  font-weight: 600;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.nav-menu :deep(.el-menu-item::before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.nav-menu :deep(.el-menu-item:hover::before) {
  left: 100%;
}

.nav-menu :deep(.el-menu-item:hover) {
  background: rgba(0, 255, 255, 0.2);
  color: #ffffff;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 255, 255, 0.4);
  border-color: rgba(0, 255, 255, 0.6);
}

.nav-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.3));
  color: #ffffff;
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.6),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.8);
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

/* 主内容区域 */
.app-main {
  background: transparent;
  padding: 30px;
  min-height: calc(100vh - 60px);
  position: relative;
}

.app-main > * {
  max-width: 1400px;
  margin: 0 auto;
}
</style>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Orbitron', 'Roboto Mono', 'Courier New', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  background: #0f0f23;
  color: #00ffff;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* 全局卡片样式 - 科技风 */
.el-card {
  border-radius: 20px !important;
  border: 2px solid rgba(0, 255, 255, 0.3) !important;
  background: rgba(15, 15, 35, 0.9) !important;
  backdrop-filter: blur(20px) !important;
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative !important;
  overflow: hidden !important;
}

.el-card::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 3px !important;
  background: linear-gradient(90deg, #00ffff, #ff00ff, #00ff80, #00ffff) !important;
  background-size: 300% 100% !important;
  animation: cardBorderShine 3s ease infinite !important;
}

.el-card::after {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.05), rgba(255, 0, 255, 0.05)) !important;
  opacity: 0 !important;
  transition: opacity 0.3s !important;
  pointer-events: none !important;
}

.el-card:hover {
  transform: translateY(-8px) scale(1.02) !important;
  box-shadow: 
    0 0 50px rgba(0, 255, 255, 0.4),
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(0, 255, 255, 0.6) !important;
}

.el-card:hover::after {
  opacity: 1 !important;
}

@keyframes cardBorderShine {
  0% { background-position: -300% 0; }
  100% { background-position: 300% 0; }
}

.el-card__header {
  background: rgba(0, 255, 255, 0.1) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 20px 20px 0 0 !important;
  color: #00ffff !important;
  font-weight: 700 !important;
}

.el-card__body {
  color: #ffffff !important;
}

/* 全局按钮样式 - 科技风 */
.el-button {
  border-radius: 16px !important;
  font-weight: 700 !important;
  font-family: 'Orbitron', monospace !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border: 2px solid rgba(0, 255, 255, 0.3) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
  position: relative !important;
  overflow: hidden !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
}

.el-button::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: -100% !important;
  width: 100% !important;
  height: 100% !important;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent) !important;
  transition: left 0.5s !important;
}

.el-button:hover::before {
  left: 100% !important;
}

.el-button:hover {
  transform: translateY(-3px) scale(1.05) !important;
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.5),
    0 10px 20px rgba(0, 0, 0, 0.3) !important;
  border-color: rgba(0, 255, 255, 0.8) !important;
  background: rgba(0, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

.el-button--primary {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.3)) !important;
  border: 2px solid rgba(0, 255, 255, 0.6) !important;
  color: #ffffff !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8) !important;
  box-shadow: 
    0 0 25px rgba(0, 255, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

.el-button--primary:hover {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.5), rgba(255, 0, 255, 0.5)) !important;
  box-shadow: 
    0 0 40px rgba(0, 255, 255, 0.7),
    0 15px 30px rgba(0, 0, 0, 0.4) !important;
  transform: translateY(-4px) scale(1.08) !important;
}

.el-button--success {
  background: linear-gradient(135deg, rgba(0, 255, 128, 0.3), rgba(0, 255, 255, 0.3)) !important;
  border: 2px solid rgba(0, 255, 128, 0.6) !important;
  color: #ffffff !important;
  text-shadow: 0 0 10px rgba(0, 255, 128, 0.8) !important;
}

.el-button--warning {
  background: linear-gradient(135deg, rgba(255, 128, 0, 0.3), rgba(255, 255, 0, 0.3)) !important;
  border: 2px solid rgba(255, 128, 0, 0.6) !important;
  color: #ffffff !important;
  text-shadow: 0 0 10px rgba(255, 128, 0, 0.8) !important;
}

.el-button--danger {
  background: linear-gradient(135deg, rgba(255, 0, 128, 0.3), rgba(255, 0, 0, 0.3)) !important;
  border: 2px solid rgba(255, 0, 128, 0.6) !important;
  color: #ffffff !important;
  text-shadow: 0 0 10px rgba(255, 0, 128, 0.8) !important;
}

/* 全局输入框样式 - 科技风 */
.el-input__wrapper {
  border-radius: 16px !important;
  background: rgba(15, 15, 35, 0.9) !important;
  backdrop-filter: blur(15px) !important;
  border: 2px solid rgba(0, 255, 255, 0.3) !important;
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative !important;
}

.el-input__wrapper::before {
  content: '' !important;
  position: absolute !important;
  top: -2px !important;
  left: -2px !important;
  right: -2px !important;
  bottom: -2px !important;
  background: linear-gradient(45deg, #00ffff, #ff00ff, #00ff80, #00ffff) !important;
  background-size: 400% 400% !important;
  border-radius: 18px !important;
  opacity: 0 !important;
  z-index: -1 !important;
  animation: inputGradient 4s ease infinite !important;
  transition: opacity 0.3s !important;
}

.el-input__wrapper:hover {
  border-color: rgba(0, 255, 255, 0.6) !important;
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-2px) !important;
}

.el-input__wrapper:hover::before {
  opacity: 0.5 !important;
}

.el-input__wrapper.is-focus {
  border-color: #00ffff !important;
  box-shadow: 
    0 0 0 3px rgba(0, 255, 255, 0.3),
    0 0 40px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-3px) !important;
}

.el-input__wrapper.is-focus::before {
  opacity: 0.8 !important;
}

.el-input__inner {
  color: #ffffff !important;
  font-family: 'Roboto Mono', monospace !important;
}

.el-input__inner::placeholder {
  color: rgba(0, 255, 255, 0.5) !important;
}

@keyframes inputGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 全局选择器样式 */
.el-select .el-input__wrapper {
  border-radius: 16px !important;
}

.el-select-dropdown {
  background: rgba(15, 15, 35, 0.95) !important;
  border: 2px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 16px !important;
  backdrop-filter: blur(20px) !important;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.2) !important;
}

.el-select-dropdown__item {
  color: #ffffff !important;
  transition: all 0.3s !important;
}

.el-select-dropdown__item:hover {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

.el-select-dropdown__item.selected {
  background: rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

/* 表格样式 - 科技风 */
.el-table {
  background: transparent !important;
  color: #ffffff !important;
}

.el-table th {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-bottom: 2px solid rgba(0, 255, 255, 0.3) !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
}

.el-table td {
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

.el-table tr:hover {
  background: rgba(0, 255, 255, 0.1) !important;
}

/* 标签页样式 - 科技风 */
.el-tabs__header {
  border-bottom: 2px solid rgba(0, 255, 255, 0.3) !important;
}

.el-tabs__nav-wrap::after {
  background: rgba(0, 255, 255, 0.3) !important;
}

.el-tabs__item {
  color: rgba(0, 255, 255, 0.7) !important;
  font-weight: 600 !important;
  transition: all 0.3s !important;
}

.el-tabs__item:hover {
  color: #00ffff !important;
}

.el-tabs__item.is-active {
  color: #ffffff !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8) !important;
}

.el-tabs__active-bar {
  background: linear-gradient(90deg, #00ffff, #ff00ff) !important;
  height: 3px !important;
}

/* 滚动条样式 - 科技风 */
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 15, 35, 0.8);
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.6), rgba(255, 0, 255, 0.6));
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.8), rgba(255, 0, 255, 0.8));
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
}

/* 对话框样式 - 科技风 */
.el-dialog {
  background: rgba(15, 15, 35, 0.95) !important;
  border: 2px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 20px !important;
  backdrop-filter: blur(20px) !important;
  box-shadow: 0 0 50px rgba(0, 255, 255, 0.3) !important;
}

.el-dialog__header {
  background: rgba(0, 255, 255, 0.1) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 20px 20px 0 0 !important;
}

.el-dialog__title {
  color: #00ffff !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
}

.el-dialog__body {
  color: #ffffff !important;
}

/* 消息提示样式 - 科技风 */
.el-message {
  background: rgba(15, 15, 35, 0.95) !important;
  border: 2px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 16px !important;
  backdrop-filter: blur(20px) !important;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

.el-message--success {
  border-color: rgba(0, 255, 128, 0.6) !important;
  box-shadow: 0 0 30px rgba(0, 255, 128, 0.3) !important;
}

.el-message--warning {
  border-color: rgba(255, 128, 0, 0.6) !important;
  box-shadow: 0 0 30px rgba(255, 128, 0, 0.3) !important;
}

.el-message--error {
  border-color: rgba(255, 0, 128, 0.6) !important;
  box-shadow: 0 0 30px rgba(255, 0, 128, 0.3) !important;
}
</style>