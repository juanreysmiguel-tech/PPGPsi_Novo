import { initializeApp } from 'firebase-admin/app'

initializeApp()

// Auth triggers
export { onUserCreate } from './auth/onCreate'
export { onUserWriteEnsurePpgpsiRoles } from './auth/onUserWritePpgpsiRoles'
export { updateUserRoles } from './auth/updateUserRoles'

// Request triggers
export { onRequestSubmit } from './requests/onSubmit'
export { onStatusChange } from './requests/onStatusChange'

// Financial functions
export { getExchangeRate } from './financial/currencyConversion'
export { calculateDiaria } from './financial/diariaCalculation'

// Notification functions
export { sendNotificationEmail } from './notifications/sendEmail'

// Scheduled functions
export { dailyArchive } from './scheduled/dailyArchive'
export { dailyReminders, meetingDeadlines } from './scheduled/dailyReminders'

// Meeting triggers
export { onMeetingCreate } from './meetings/onMeetingWrite'
