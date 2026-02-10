<template>
  <div class="calendar-container">
    <!-- 顶部通知栏 -->
    <transition name="slide-down">
      <div v-if="currentNotification" class="notification-bar">
        <div class="notification-content">
          <el-icon><Bell /></el-icon>
          <span class="notification-title">{{ currentNotification.title }}</span>
          <span class="notification-time">{{ formatNotificationTime(currentNotification.remindTime) }}</span>
        </div>
        <el-button type="primary" link @click="dismissNotification">知道了</el-button>
      </div>
    </transition>

    <!-- 顶部导航 -->
    <el-card class="header-card">
      <div class="header-content">
        <div class="header-left">
          <el-button @click="goBack" icon="ArrowLeft" text>返回</el-button>
          <h2 class="page-title">
            <el-icon><Notebook /></el-icon>
            日记本
          </h2>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="showDiaryDialog()" icon="EditPen">写日记</el-button>
          <el-button @click="showReminderDialog()" icon="Bell">设置提醒</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <!-- 左侧：日历 -->
      <el-col :span="10">
        <el-card class="calendar-card">
          <!-- 月份导航 -->
          <div class="month-nav">
            <el-button @click="prevMonth" icon="ArrowLeft" circle size="small" />
            <span class="month-title">{{ currentYear }}年 {{ currentMonth }}月</span>
            <el-button @click="nextMonth" icon="ArrowRight" circle size="small" />
            <el-button type="primary" link @click="goToday" style="margin-left: 10px">今天</el-button>
          </div>

          <!-- 日历表格 -->
          <div class="calendar-grid">
            <div class="weekday-header">
              <span v-for="day in weekDayNames" :key="day" class="weekday">{{ day }}</span>
            </div>
            <div class="day-grid">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="day-cell"
                :class="{
                  'other-month': !day.isCurrentMonth,
                  'today': day.isToday,
                  'selected': day.date === selectedDate,
                  'has-diary': hasDiary(day.date)
                }"
                @click="selectDate(day)"
              >
                <span class="day-number">{{ day.day }}</span>
                <span class="lunar-text">{{ day.lunar }}</span>
                <div class="diary-dot" v-if="hasDiary(day.date)"></div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 待发送提醒 -->
        <el-card class="reminders-card">
          <template #header>
            <div class="card-header">
              <span><el-icon><AlarmClock /></el-icon> 待发送提醒</span>
            </div>
          </template>
          <div class="reminders-list" v-loading="reminderLoading">
            <div v-for="reminder in reminders" :key="reminder.id" class="reminder-item">
              <div class="reminder-info">
                <span class="reminder-title">{{ reminder.title || '提醒' }}</span>
                <span class="reminder-time">{{ formatDateTime(reminder.remindTime) }}</span>
              </div>
              <el-tag :type="getReminderStatusType(reminder.status!)" size="small">
                {{ getReminderStatusText(reminder.status!) }}
              </el-tag>
            </div>
            <el-empty v-if="reminders.length === 0" description="暂无提醒" :image-size="60" />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：日记列表 -->
      <el-col :span="14">
        <el-card class="diary-card">
          <template #header>
            <div class="card-header">
              <div class="header-info">
                <span class="selected-date">{{ selectedDateText }}</span>
                <span class="days-info">{{ getDaysInfo(selectedDate) }}</span>
              </div>
              <el-button type="primary" link @click="showDiaryDialog()">
                <el-icon><Plus /></el-icon> 写日记
              </el-button>
            </div>
          </template>

          <div class="diary-list" v-loading="diaryLoading">
            <div
              v-for="diary in selectedDateDiaries"
              :key="diary.id"
              class="diary-item"
            >
              <div class="diary-header">
                <div class="diary-meta">
                  <span class="diary-mood" v-if="diary.mood">{{ diary.mood }}</span>
                  <span class="diary-time" v-if="diary.eventTime">
                    <el-icon><Clock /></el-icon> {{ diary.eventTime }}
                  </span>
                  <el-tag :type="getEventTagType(diary.eventType)" size="small">
                    {{ getEventTypeText(diary.eventType) }}
                  </el-tag>
                </div>
                <div class="diary-actions">
                  <el-button type="primary" link size="small" @click="showDiaryDialog(diary)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button type="danger" link size="small" @click="handleDeleteDiary(diary.id!)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <div class="diary-title">{{ diary.title }}</div>
              <div class="diary-content" v-if="diary.content">{{ diary.content }}</div>
              <div class="diary-footer">
                <span class="create-time">创建于 {{ formatCreateTime(diary.createTime) }}</span>
              </div>
            </div>

            <el-empty v-if="selectedDateDiaries.length === 0" description="这一天还没有日记，写点什么吧~" :image-size="100">
              <el-button type="primary" @click="showDiaryDialog()">写日记</el-button>
            </el-empty>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 日记对话框 -->
    <el-dialog v-model="diaryDialogVisible" :title="isEditDiary ? '编辑日记' : '写日记'" width="600px">
      <el-form :model="diaryForm" label-width="80px">
        <el-form-item label="日期">
          <el-date-picker
            v-model="diaryForm.eventDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 200px"
          />
          <span class="days-hint" style="margin-left: 10px; color: #909399;">
            {{ getDaysInfo(diaryForm.eventDate) }}
          </span>
        </el-form-item>
        <el-form-item label="心情">
          <div class="mood-selector">
            <span
              v-for="mood in moodOptions"
              :key="mood"
              class="mood-option"
              :class="{ active: diaryForm.mood === mood }"
              @click="diaryForm.mood = mood"
            >{{ mood }}</span>
          </div>
        </el-form-item>
        <el-form-item label="标题" required>
          <el-input v-model="diaryForm.title" placeholder="给这篇日记起个标题" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="diaryForm.content"
            type="textarea"
            :rows="6"
            placeholder="记录今天的心情和故事..."
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="diaryForm.eventType">
            <el-radio :label="2">日记</el-radio>
            <el-radio :label="1">待办</el-radio>
            <el-radio :label="3">纪念日</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="diaryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDiary">保存</el-button>
      </template>
    </el-dialog>

    <!-- 提醒对话框 -->
    <el-dialog v-model="reminderDialogVisible" title="设置提醒" width="500px">
      <el-form :model="reminderForm" label-width="100px">
        <el-form-item label="提醒标题" required>
          <el-input
            v-model="reminderForm.title"
            placeholder="请输入提醒标题"
            maxlength="20"
            show-word-limit
          />
          <div class="form-hint">标题不超过20字，将显示在通知栏</div>
        </el-form-item>
        <el-form-item label="提醒时间" required>
          <el-date-picker
            v-model="reminderForm.remindTime"
            type="datetime"
            placeholder="选择提醒时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="通知方式" required>
          <el-select v-model="reminderForm.notificationType" placeholder="选择通知方式" style="width: 100%">
            <el-option
              v-for="method in notificationMethods"
              :key="method.code"
              :value="method.code"
              :label="method.name"
            >
              <div class="notification-option">
                <span>{{ method.name }}</span>
                <el-tag v-if="method.implStatus === 0" type="info" size="small">未实现</el-tag>
              </div>
            </el-option>
          </el-select>
          <div class="form-hint" v-if="selectedMethodNotImplemented">
            该通知方式尚未实现，提醒将不会发送
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reminderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveReminder">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Notebook, EditPen, Bell, Plus, ArrowLeft, ArrowRight,
  Clock, Edit, Delete, AlarmClock
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getMonthEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getReminderList,
  createReminder,
  getNotificationMethods,
  getPendingNotifications,
  markNotificationAsRead,
  type CalendarEvent,
  type Reminder,
  type NotificationMethod,
  type AppNotification
} from '../../api/calendar'

// 农历数据
const lunarInfo = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
]

const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

const moodOptions = ['😊', '😢', '😠', '😴', '🤔', '😍', '🎉', '💪', '🌟', '❤️']

const router = useRouter()

// 状态
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const selectedDate = ref(formatDate(new Date()))

const diaries = ref<CalendarEvent[]>([])
const reminders = ref<Reminder[]>([])
const notificationMethods = ref<NotificationMethod[]>([])
const pendingNotifications = ref<AppNotification[]>([])
const currentNotification = ref<AppNotification | null>(null)

const diaryLoading = ref(false)
const reminderLoading = ref(false)

// 对话框
const diaryDialogVisible = ref(false)
const reminderDialogVisible = ref(false)
const isEditDiary = ref(false)

// 表单
const diaryForm = ref<CalendarEvent>({
  title: '',
  content: '',
  eventDate: '',
  eventTime: '',
  eventType: 2,
  priority: 2,
  mood: ''
})

const reminderForm = ref<Partial<Reminder>>({
  title: '',
  remindTime: '',
  notificationType: 'app'
})

const weekDayNames = ['日', '一', '二', '三', '四', '五', '六']

// 获取农历
function getLunar(year: number, month: number, day: number) {
  const baseDate = new Date(1900, 0, 31)
  const objDate = new Date(year, month - 1, day)
  let offset = Math.floor((objDate.getTime() - baseDate.getTime()) / 86400000)

  let lunarYear = 1900
  let daysInYear = 0
  for (let i = 1900; i < 2100 && offset > 0; i++) {
    daysInYear = getLunarYearDays(i)
    offset -= daysInYear
    lunarYear++
  }
  if (offset < 0) {
    offset += daysInYear
    lunarYear--
  }

  let lunarMonth = 1
  let isLeap = false
  const leapMonth = getLeapMonth(lunarYear)
  for (let i = 1; i < 13 && offset > 0; i++) {
    let daysInMonth
    if (leapMonth > 0 && i === leapMonth + 1 && !isLeap) {
      --i
      isLeap = true
      daysInMonth = getLeapDays(lunarYear)
    } else {
      daysInMonth = getLunarMonthDays(lunarYear, i)
    }
    if (isLeap && i === leapMonth + 1) isLeap = false
    offset -= daysInMonth
    if (!isLeap) lunarMonth++
  }
  if (offset === 0 && leapMonth > 0 && lunarMonth === leapMonth + 1) {
    if (isLeap) {
      isLeap = false
    } else {
      isLeap = true
      --lunarMonth
    }
  }
  if (offset < 0) {
    offset += getLunarMonthDays(lunarYear, lunarMonth)
    --lunarMonth
  }

  const lunarDay = offset + 1
  return lunarDays[lunarDay - 1]
}

function getLunarYearDays(year: number) {
  let sum = 348
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (lunarInfo[year - 1900] & i) ? 1 : 0
  }
  return sum + getLeapDays(year)
}

function getLeapMonth(year: number) {
  return lunarInfo[year - 1900] & 0xf
}

function getLeapDays(year: number) {
  if (getLeapMonth(year)) {
    return (lunarInfo[year - 1900] & 0x10000) ? 30 : 29
  }
  return 0
}

function getLunarMonthDays(year: number, month: number) {
  return (lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29
}

// 计算日历天数
const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value, 0)

  const startDayOfWeek = firstDay.getDay()
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value - 1, 0).getDate()

  // 上月的天数
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i
    const date = new Date(currentYear.value, currentMonth.value - 2, d)
    days.push({
      day: d,
      date: formatDate(date),
      lunar: getLunar(date.getFullYear(), date.getMonth() + 1, d),
      isCurrentMonth: false,
      isToday: false
    })
  }

  // 本月的天数
  const today = formatDate(new Date())
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value - 1, i)
    const dateStr = formatDate(date)
    days.push({
      day: i,
      date: dateStr,
      lunar: getLunar(currentYear.value, currentMonth.value, i),
      isCurrentMonth: true,
      isToday: dateStr === today
    })
  }

  // 下月的天数（补齐6行）
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    days.push({
      day: i,
      date: formatDate(date),
      lunar: getLunar(date.getFullYear(), date.getMonth() + 1, i),
      isCurrentMonth: false,
      isToday: false
    })
  }

  return days
})

// 选中日期的文本
const selectedDateText = computed(() => {
  const d = new Date(selectedDate.value)
  const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekDay}`
})

// 选中日期的日记
const selectedDateDiaries = computed(() => {
  return diaries.value.filter(e => e.eventDate === selectedDate.value)
})

// 选中的通知方式是否未实现
const selectedMethodNotImplemented = computed(() => {
  const method = notificationMethods.value.find(m => m.code === reminderForm.value.notificationType)
  return method?.implStatus === 0
})

// 工具函数
function formatDate(d: Date) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateTime(dt: string | undefined) {
  if (!dt) return '-'
  const d = new Date(dt)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatCreateTime(dt: string | undefined) {
  if (!dt) return ''
  const d = new Date(dt)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatNotificationTime(dt: string) {
  const d = new Date(dt)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getDaysInfo(date: string) {
  if (!date) return ''
  const target = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diff = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === -1) return '昨天'
  if (diff > 0) return `${diff}天后`
  return `${Math.abs(diff)}天前`
}

function hasDiary(date: string) {
  return diaries.value.some(e => e.eventDate === date)
}

function getEventTypeText(type: number) {
  const texts: Record<number, string> = { 1: '待办', 2: '日记', 3: '纪念日' }
  return texts[type] || '日记'
}

function getEventTagType(type: number) {
  const types: Record<number, string> = { 1: 'primary', 2: 'success', 3: 'warning' }
  return types[type] || 'success'
}

function getReminderStatusText(status: number) {
  const texts: Record<number, string> = { 1: '待发送', 2: '已发送', 3: '发送失败' }
  return texts[status] || '待发送'
}

function getReminderStatusType(status: number) {
  const types: Record<number, string> = { 1: 'warning', 2: 'success', 3: 'danger' }
  return types[status] || 'warning'
}

// 导航
const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const goToday = () => {
  const today = new Date()
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth() + 1
  selectedDate.value = formatDate(today)
}

const goBack = () => {
  router.push('/index/miniapp')
}

const selectDate = (day: any) => {
  selectedDate.value = day.date
  if (!day.isCurrentMonth) {
    const d = new Date(day.date)
    currentYear.value = d.getFullYear()
    currentMonth.value = d.getMonth() + 1
  }
}

// 日记相关
const showDiaryDialog = (diary?: CalendarEvent) => {
  if (diary) {
    isEditDiary.value = true
    diaryForm.value = { ...diary }
  } else {
    isEditDiary.value = false
    diaryForm.value = {
      title: '',
      content: '',
      eventDate: selectedDate.value,
      eventTime: '',
      eventType: 2,
      priority: 2,
      mood: ''
    }
  }
  diaryDialogVisible.value = true
}

const handleSaveDiary = async () => {
  if (!diaryForm.value.title) {
    ElMessage.warning('请输入标题')
    return
  }
  if (!diaryForm.value.eventDate) {
    ElMessage.warning('请选择日期')
    return
  }

  let success = false
  if (isEditDiary.value && diaryForm.value.id) {
    success = await updateEvent(diaryForm.value)
  } else {
    success = await createEvent(diaryForm.value)
  }

  if (success) {
    diaryDialogVisible.value = false
    loadDiaries()
  }
}

const handleDeleteDiary = async (id: number) => {
  await ElMessageBox.confirm('确定删除这篇日记吗？', '提示', { type: 'warning' })
  const success = await deleteEvent(id)
  if (success) loadDiaries()
}

// 提醒相关
const showReminderDialog = () => {
  reminderForm.value = {
    title: '',
    remindTime: '',
    notificationType: 'app'
  }
  reminderDialogVisible.value = true
}

const handleSaveReminder = async () => {
  if (!reminderForm.value.title) {
    ElMessage.warning('请输入提醒标题')
    return
  }
  if (reminderForm.value.title!.length > 20) {
    ElMessage.warning('标题不能超过20个字')
    return
  }
  if (!reminderForm.value.remindTime) {
    ElMessage.warning('请选择提醒时间')
    return
  }

  if (selectedMethodNotImplemented.value) {
    ElMessage.warning('该通知方式尚未实现，请选择其他方式或继续保存')
  }

  const success = await createReminder(reminderForm.value as Reminder)
  if (success) {
    reminderDialogVisible.value = false
    loadReminders()
  }
}

// 通知相关
const dismissNotification = async () => {
  if (currentNotification.value) {
    await markNotificationAsRead(currentNotification.value.id)
    pendingNotifications.value = pendingNotifications.value.filter(n => n.id !== currentNotification.value!.id)
    showNextNotification()
  }
}

const showNextNotification = () => {
  if (pendingNotifications.value.length > 0) {
    currentNotification.value = pendingNotifications.value[0]
  } else {
    currentNotification.value = null
  }
}

// 加载数据
const loadDiaries = async () => {
  diaryLoading.value = true
  diaries.value = await getMonthEvents(currentYear.value, currentMonth.value)
  diaryLoading.value = false
}

const loadReminders = async () => {
  reminderLoading.value = true
  const list = await getReminderList()
  reminders.value = list.filter(r => r.status === 1)
  reminderLoading.value = false
}

const loadNotificationMethods = async () => {
  notificationMethods.value = await getNotificationMethods()
}

const loadPendingNotifications = async () => {
  pendingNotifications.value = await getPendingNotifications()
  showNextNotification()
}

// 定时检查通知
let notificationTimer: number | null = null

// 监听月份变化
watch([currentYear, currentMonth], () => {
  loadDiaries()
})

onMounted(() => {
  loadDiaries()
  loadReminders()
  loadNotificationMethods()
  loadPendingNotifications()

  // 每分钟检查一次待显示的通知
  notificationTimer = window.setInterval(() => {
    loadPendingNotifications()
  }, 60000)
})

onUnmounted(() => {
  if (notificationTimer) {
    clearInterval(notificationTimer)
  }
})
</script>

<style scoped lang="scss">
.calendar-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5af19 0%, #f12711 100%);
  min-height: calc(100vh - 40px);
  position: relative;
}

// 顶部通知栏
.notification-bar {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 0 0 12px 12px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  .notification-content {
    display: flex;
    align-items: center;
    gap: 10px;

    .el-icon {
      font-size: 20px;
    }

    .notification-title {
      font-weight: 600;
      font-size: 16px;
    }

    .notification-time {
      font-size: 14px;
      opacity: 0.9;
    }
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateX(-50%) translateY(-100%);
  opacity: 0;
}

.header-card {
  margin-bottom: 20px;
  border-radius: 12px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-right {
    display: flex;
    gap: 10px;
  }

  .page-title {
    margin: 0;
    font-size: 24px;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      color: #f5af19;
    }
  }
}

.calendar-card {
  border-radius: 12px;
  margin-bottom: 20px;

  .month-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    margin-bottom: 20px;

    .month-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      min-width: 150px;
      text-align: center;
    }
  }

  .calendar-grid {
    .weekday-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      margin-bottom: 10px;

      .weekday {
        text-align: center;
        font-weight: 600;
        color: #606266;
        padding: 8px 0;
      }
    }

    .day-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;

      .day-cell {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        padding: 4px;

        &:hover {
          background: #f5f7fa;
        }

        &.other-month {
          .day-number, .lunar-text {
            color: #c0c4cc;
          }
        }

        &.today {
          background: #fff7e6;

          .day-number {
            color: #f5af19;
            font-weight: 600;
          }
        }

        &.selected {
          background: #f5af19;

          .day-number, .lunar-text {
            color: white;
          }
        }

        &.has-diary {
          .diary-dot {
            display: block;
          }
        }

        .day-number {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }

        .lunar-text {
          font-size: 10px;
          color: #909399;
          margin-top: 2px;
        }

        .diary-dot {
          display: none;
          position: absolute;
          bottom: 4px;
          width: 6px;
          height: 6px;
          background: #67c23a;
          border-radius: 50%;
        }
      }
    }
  }
}

.diary-card {
  border-radius: 12px;
  min-height: 500px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-info {
      .selected-date {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin-right: 10px;
      }

      .days-info {
        font-size: 14px;
        color: #f5af19;
        font-weight: 500;
      }
    }
  }

  .diary-list {
    .diary-item {
      padding: 16px;
      margin-bottom: 15px;
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
      border-radius: 12px;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .diary-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        .diary-meta {
          display: flex;
          align-items: center;
          gap: 10px;

          .diary-mood {
            font-size: 24px;
          }

          .diary-time {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
            color: #606266;
          }
        }

        .diary-actions {
          display: flex;
          gap: 5px;
        }
      }

      .diary-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 10px;
      }

      .diary-content {
        font-size: 14px;
        color: #606266;
        line-height: 1.6;
        margin-bottom: 10px;
        white-space: pre-wrap;
      }

      .diary-footer {
        .create-time {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}

.reminders-card {
  border-radius: 12px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .reminders-list {
    max-height: 200px;
    overflow-y: auto;

    .reminder-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      margin-bottom: 8px;
      background: #fef0f0;
      border-radius: 6px;

      .reminder-info {
        .reminder-title {
          font-weight: 500;
          color: #303133;
          margin-right: 10px;
        }

        .reminder-time {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}

// 表单样式
.mood-selector {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  .mood-option {
    font-size: 24px;
    cursor: pointer;
    padding: 5px;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background: #f5f7fa;
      transform: scale(1.1);
    }

    &.active {
      background: #fff7e6;
      box-shadow: 0 0 0 2px #f5af19;
    }
  }
}

.form-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.notification-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
