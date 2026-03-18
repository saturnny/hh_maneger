export const WORKDAY_START = '07:00'
export const WORKDAY_END = '16:00'
export const TARGET_HOURS = 9
export const MINUTE_STEP = 15

export function isValidTime(time: string): boolean {
  const [hours, minutes] = time.split(':').map(Number)
  
  if (isNaN(hours) || isNaN(minutes)) return false
  if (hours < 0 || hours > 23) return false
  if (minutes < 0 || minutes > 59) return false
  if (minutes % MINUTE_STEP !== 0) return false
  
  return true
}

export function isWithinWorkday(time: string): boolean {
  if (!isValidTime(time)) return false
  
  const [hours, minutes] = time.split(':').map(Number)
  const [startHours, startMinutesVal] = WORKDAY_START.split(':').map(Number)
  const [endHours, endMinutesVal] = WORKDAY_END.split(':').map(Number)
  
  const timeMinutes = hours * 60 + minutes
  const startMinutesTotal = startHours * 60 + startMinutesVal
  const endMinutesTotal = endHours * 60 + endMinutesVal
  
  return timeMinutes >= startMinutesTotal && timeMinutes <= endMinutesTotal
}

export function generateTimeOptions(): string[] {
  const options: string[] = []
  const [startHours, startMinutes] = WORKDAY_START.split(':').map(Number)
  const [endHours, endMinutes] = WORKDAY_END.split(':').map(Number)
  
  for (let hours = startHours; hours <= endHours; hours++) {
    for (let minutes = 0; minutes < 60; minutes += MINUTE_STEP) {
      if (hours === endHours && minutes > endMinutes) break
      
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      options.push(timeStr)
    }
  }
  
  return options
}

export function calcDurationHours(startTime: string, endTime: string): number {
  if (!isValidTime(startTime) || !isValidTime(endTime)) return 0
  
  const [startHours, startMinutesVal] = startTime.split(':').map(Number)
  const [endHours, endMinutesVal] = endTime.split(':').map(Number)
  
  const startMinutesTotal = startHours * 60 + startMinutesVal
  const endMinutesTotal = endHours * 60 + endMinutesVal
  
  if (endMinutesTotal <= startMinutesTotal) return 0
  
  const durationMinutes = endMinutesTotal - startMinutesTotal
  return Math.round((durationMinutes / 60) * 10) / 10
}

export function normalizeTime(time: string): string {
  if (!time) return ''
  
  const [hours, minutes] = time.split(':').map(Number)
  
  if (isNaN(hours) || isNaN(minutes)) return WORKDAY_START
  
  const normalizedMinutes = Math.round(minutes / MINUTE_STEP) * MINUTE_STEP
  const normalizedHours = Math.max(7, Math.min(16, hours))
  const finalMinutes = Math.min(45, normalizedMinutes)
  
  return `${normalizedHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`
}

export function checkTimeOverlap(
  userId: number,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: number
): boolean {
  // This function will be used in server actions to check for overlapping time entries
  // Implementation will be in the server action using Supabase queries
  return false
}

export function getHoursWorkedToday(totalHours: number): {
  worked: string
  remaining: string
  percentage: number
} {
  const remaining = Math.max(0, TARGET_HOURS - totalHours)
  return {
    worked: formatDuration(totalHours),
    remaining: formatDuration(remaining),
    percentage: Math.round((totalHours / TARGET_HOURS) * 100)
  }
}

function formatDuration(hours: number): string {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  
  if (wholeHours === 0 && minutes === 0) return '0h'
  if (wholeHours === 0) return `${minutes}m`
  if (minutes === 0) return `${wholeHours}h`
  
  return `${wholeHours}h ${minutes}m`
}
