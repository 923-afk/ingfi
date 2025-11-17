export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
};

// Type guard to validate Todo structure with enhanced checks
export function isValidTodo(obj: unknown): obj is Todo {
  if (
    typeof obj !== 'object' ||
    obj === null ||
    !('id' in obj) ||
    !('text' in obj) ||
    !('completed' in obj) ||
    !('createdAt' in obj)
  ) {
    return false;
  }

  const todo = obj as Todo;

  // Type checks
  if (
    typeof todo.id !== 'string' ||
    typeof todo.text !== 'string' ||
    typeof todo.completed !== 'boolean' ||
    typeof todo.createdAt !== 'string'
  ) {
    return false;
  }

  // Value checks
  if (todo.id.length === 0 || todo.text.length === 0) {
    return false;
  }

  // Validate ID format (should be UUID-like)
  if (todo.id.length > 100) {
    return false; // Prevent extremely long IDs
  }

  // Validate text length
  if (todo.text.length > 500) {
    return false;
  }

  // Validate date
  if (!isValidDate(todo.createdAt)) {
    return false;
  }

  return true;
}

// Validate array of todos
export function isValidTodoArray(arr: unknown): arr is Todo[] {
  return Array.isArray(arr) && arr.every(isValidTodo);
}

// Enhanced sanitization with pattern detection
export function sanitizeTodoText(text: string): string {
  // Remove control characters except newlines and tabs
  let sanitized = text
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, 500); // Max length limit

  // Remove potentially dangerous patterns
  // Remove script tags and event handlers
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, ''); // Remove event handlers like onclick=
  sanitized = sanitized.replace(/javascript:/gi, ''); // Remove javascript: protocol
  sanitized = sanitized.replace(/data:text\/html/gi, ''); // Remove data URIs with HTML
  
  // Normalize whitespace (prevent excessive whitespace attacks)
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

// Validate todo text for safety
export function validateTodoText(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Todo text cannot be empty' };
  }

  if (text.length > 500) {
    return { valid: false, error: 'Todo text exceeds maximum length' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /eval\(/i,
    /expression\(/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text)) {
      return { valid: false, error: 'Todo text contains invalid content' };
    }
  }

  // Check for excessive repetition (potential DoS)
  if (text.length > 10) {
    const repeated = text.match(/(.{1,10})\1{10,}/);
    if (repeated) {
      return { valid: false, error: 'Todo text contains excessive repetition' };
    }
  }

  return { valid: true };
}

// Validate date string
export function isValidDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  
  const date = new Date(dateString);
  // Check if date is valid and not in the future (with small tolerance for clock skew)
  const now = new Date();
  const maxFuture = new Date(now.getTime() + 60000); // 1 minute tolerance
  
  return (
    !isNaN(date.getTime()) &&
    date <= maxFuture &&
    date >= new Date('2000-01-01') // Reasonable minimum date
  );
}

// Check for duplicate todos (same text within time window)
export function isDuplicateTodo(
  text: string,
  existingTodos: Todo[],
  timeWindowMs: number = 60000 // 1 minute default
): boolean {
  const now = Date.now();
  const normalizedText = text.trim().toLowerCase();
  
  return existingTodos.some((todo) => {
    const todoTime = new Date(todo.createdAt).getTime();
    const timeDiff = now - todoTime;
    
    return (
      todo.text.trim().toLowerCase() === normalizedText &&
      timeDiff >= 0 &&
      timeDiff <= timeWindowMs
    );
  });
}

// Maximum number of todos allowed
export const MAX_TODOS = 1000;

// Validate todo array size
export function validateTodoArraySize(todos: Todo[]): { valid: boolean; error?: string } {
  if (todos.length > MAX_TODOS) {
    return {
      valid: false,
      error: `Maximum of ${MAX_TODOS} todos allowed. Please delete some todos.`,
    };
  }
  return { valid: true };
}

