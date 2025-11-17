export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: '電子郵件為必填' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: '請輸入有效的電子郵件地址' };
  }

  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return { valid: false, error: '密碼為必填' };
  }

  if (password.length < 3) {
    return { valid: false, error: '密碼長度至少需要 3 個字元' };
  }

  return { valid: true };
}

export function validateJobTitle(title: string): ValidationResult {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: '需求標題為必填' };
  }

  if (title.trim().length < 3) {
    return { valid: false, error: '標題至少需要 3 個字元' };
  }

  if (title.length > 100) {
    return { valid: false, error: '標題不能超過 100 個字元' };
  }

  return { valid: true };
}

export function validateJobDescription(description: string): ValidationResult {
  if (!description || description.trim().length === 0) {
    return { valid: false, error: '需求詳情為必填' };
  }

  if (description.trim().length < 10) {
    return { valid: false, error: '詳情至少需要 10 個字元' };
  }

  if (description.length > 1000) {
    return { valid: false, error: '詳情不能超過 1000 個字元' };
  }

  return { valid: true };
}

export function validateLocation(location: string): ValidationResult {
  if (!location || location.trim().length === 0) {
    return { valid: false, error: '地址為必填' };
  }

  if (location.trim().length < 5) {
    return { valid: false, error: '請輸入完整的地址' };
  }

  if (location.length > 200) {
    return { valid: false, error: '地址不能超過 200 個字元' };
  }

  return { valid: true };
}

export function validateSchedule(schedule: string): ValidationResult {
  if (!schedule || schedule.trim().length === 0) {
    return { valid: false, error: '可施工時段為必填' };
  }

  if (schedule.trim().length < 5) {
    return { valid: false, error: '請提供更詳細的時間資訊' };
  }

  return { valid: true };
}

export function validateBudget(budget: string): ValidationResult {
  if (!budget || budget.trim().length === 0) {
    return { valid: true }; // Budget is optional
  }

  // Check for basic budget format (numbers, commas, dashes, spaces)
  const budgetRegex = /^[\d,\s-]+$/;
  if (!budgetRegex.test(budget)) {
    return { valid: false, error: '請輸入有效的預算格式（例如：10,000 - 20,000）' };
  }

  return { valid: true };
}

