import { createRouter, createWebHistory } from 'vue-router'
import TodoView from '../views/TodoView.vue'
import CompletedView from '../views/CompletedView.vue'
import DataInputView from '../views/DataInputView.vue'
import AnalyticsView from '../views/AnalyticsView.vue'
import DocumentConfigView from '../views/DocumentConfigView.vue'
import FeishuCallbackView from '../views/FeishuCallbackView.vue'
import DiagnosticView from '../views/DiagnosticView.vue'
import AIChatView from '../views/AIChatView.vue'
import PomodoroView from '../views/PomodoroView.vue'
import NotebookView from '../views/NotebookView.vue'
import ProjectManagementView from '../views/ProjectManagementView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
    path: '/',
    name: 'todo',
    component: TodoView
  },
  {
    path: '/workspace',
    name: 'workspace',
    component: () => import('../views/IntegratedWorkspaceView.vue')
  },
  {
    path: '/completed',
    name: 'completed',
    component: CompletedView
  },
    {
      path: '/data-input',
      name: 'data-input',
      component: DataInputView
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: AnalyticsView
    },
    {
      path: '/document-config',
      name: 'document-config',
      component: DocumentConfigView
    },
    {
      path: '/feishu-callback',
      name: 'feishu-callback',
      component: FeishuCallbackView
    },
    {
      path: '/diagnostic',
      name: 'diagnostic',
      component: DiagnosticView
    },
    {
      path: '/ai-chat',
      name: 'ai-chat',
      component: AIChatView
    },
    {
      path: '/pomodoro',
      name: 'pomodoro',
      component: PomodoroView
    },
    {
      path: '/notebook',
      name: 'notebook',
      component: NotebookView
    },
    {
      path: '/project-management',
      name: 'project-management',
      component: ProjectManagementView
    }
  ]
})

export default router