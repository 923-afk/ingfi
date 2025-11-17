'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { dictionaries, type Locale, type AppDictionary } from '@/i18n/dictionary';
import { useAuth } from '@/context/AuthContext';
import {
  type Todo,
  isValidTodoArray,
  sanitizeTodoText,
  validateTodoText,
  isDuplicateTodo,
  validateTodoArraySize,
  MAX_TODOS,
} from '@/types/todo';

const LOCALE_STORAGE_KEY = 'engineer-finder-locale';
const TODOS_STORAGE_KEY = 'engineer-finder-todos';

type TodoFilter = 'all' | 'active' | 'completed';

// Rate limiting: prevent adding todos too quickly
const RATE_LIMIT_MS = 1000; // 1 second between adds
const MAX_TODOS_PER_MINUTE = 30;

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [locale, setLocale] = useState<Locale>('zh');
  const [error, setError] = useState<string | null>(null);
  const { user, logout, isLoading } = useAuth();
  
  // Rate limiting refs
  const lastAddTimeRef = useRef<number>(0);
  const addCountRef = useRef<number>(0);
  const addCountResetTimeRef = useRef<number>(Date.now());
  
  // Debounce ref for localStorage writes
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved && ['zh', 'en', 'de'].includes(saved)) {
        setLocale(saved as Locale);
      }

      const savedTodos = localStorage.getItem(TODOS_STORAGE_KEY);
      if (savedTodos) {
        try {
          const parsed = JSON.parse(savedTodos);
          // Validate the parsed data structure
          if (isValidTodoArray(parsed)) {
            setTodos(parsed);
          } else {
            // Invalid structure, clear corrupted data
            console.warn('Invalid todos data structure, clearing localStorage');
            localStorage.removeItem(TODOS_STORAGE_KEY);
          }
        } catch (error) {
          // Invalid JSON, clear corrupted data
          console.warn('Failed to parse todos from localStorage:', error);
          localStorage.removeItem(TODOS_STORAGE_KEY);
        }
      }
    }
  }, []);

  // Debounced save to localStorage
  const saveTodosToStorage = useCallback((todosToSave: Todo[]) => {
    if (typeof window === 'undefined') return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce: wait 500ms before saving
    saveTimeoutRef.current = setTimeout(() => {
      try {
        // Validate array size before saving
        const sizeCheck = validateTodoArraySize(todosToSave);
        if (!sizeCheck.valid) {
          console.error('Todo array size validation failed:', sizeCheck.error);
          setError(sizeCheck.error || 'Too many todos');
          return;
        }

        const json = JSON.stringify(todosToSave);
        
        // Check storage quota (estimate: 2 bytes per character for UTF-16)
        const estimatedSize = json.length * 2;
        const maxSize = 5 * 1024 * 1024; // 5MB limit
        
        if (estimatedSize > maxSize) {
          throw new Error('Todo list exceeds storage quota');
        }

        localStorage.setItem(TODOS_STORAGE_KEY, json);
        setError(null);
      } catch (error) {
        // Handle quota exceeded or other storage errors
        const errorMessage =
          error instanceof Error && error.name === 'QuotaExceededError'
            ? 'Storage quota exceeded. Please delete some todos.'
            : 'Failed to save todos. Please try again.';
        console.error('Failed to save todos to localStorage:', error);
        setError(errorMessage);
      }
    }, 500);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (todos.length > 0) {
        saveTodosToStorage(todos);
      } else {
        // Clear storage when todos array is empty
        localStorage.removeItem(TODOS_STORAGE_KEY);
        setError(null);
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [todos, saveTodosToStorage]);

  const handleLocaleChange = (value: Locale) => {
    setLocale(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, value);
    }
  };

  const t: AppDictionary = dictionaries[locale];

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  const handleAddTodo = () => {
    const trimmed = newTodoText.trim();
    if (!trimmed) {
      return;
    }

    // Rate limiting check
    const now = Date.now();
    const timeSinceLastAdd = now - lastAddTimeRef.current;
    
    // Reset counter if a minute has passed
    if (now - addCountResetTimeRef.current > 60000) {
      addCountRef.current = 0;
      addCountResetTimeRef.current = now;
    }

    // Check rate limits
    if (timeSinceLastAdd < RATE_LIMIT_MS) {
      setError('Please wait before adding another todo');
      return;
    }

    if (addCountRef.current >= MAX_TODOS_PER_MINUTE) {
      setError('Too many todos added. Please wait a moment.');
      return;
    }

    // Validate array size
    const sizeCheck = validateTodoArraySize(todos);
    if (!sizeCheck.valid) {
      setError(sizeCheck.error || 'Too many todos');
      return;
    }

    // Validate input
    const validation = validateTodoText(trimmed);
    if (!validation.valid) {
      setError(validation.error || 'Invalid todo text');
      return;
    }

    // Check for duplicates (within last minute)
    if (isDuplicateTodo(trimmed, todos, 60000)) {
      setError('This todo was recently added');
      return;
    }

    // Sanitize input
    const sanitized = sanitizeTodoText(trimmed);
    if (sanitized.length === 0) {
      setError('Todo text is invalid after sanitization');
      return;
    }

    // Update rate limiting
    lastAddTimeRef.current = now;
    addCountRef.current += 1;

    // Create new todo
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: sanitized,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setNewTodoText('');
    setError(null);
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleClearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
          <p className="text-sm text-slate-500">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{t.todosTitle}</h1>
            <p className="text-sm text-slate-500">{t.todosSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} onChange={handleLocaleChange} />
            {user ? (
              <>
                <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 sm:flex">
                  <span>{user.name}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-500">
                    {user.role === 'professional' ? t.roleProfessional : t.roleCustomer}
                  </span>
                </div>
                <Link
                  href="/"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  {t.authBackToHome}
                </Link>
                <button
                  onClick={logout}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  {t.authLogout}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-500"
              >
                {t.landingLoginLink}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Add Todo Form */}
          <div className="border-b border-slate-200 p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-2 text-sm text-rose-600">
                {error}
                <button
                  onClick={() => setError(null)}
                  className="ml-2 text-rose-400 hover:text-rose-600"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}
            <div className="flex gap-3">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => {
                  // Limit input length client-side
                  const value = e.target.value;
                  if (value.length <= 500) {
                    setNewTodoText(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTodo();
                  }
                }}
                placeholder={t.todosAddPlaceholder}
                maxLength={500}
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
              <button
                onClick={handleAddTodo}
                disabled={!newTodoText.trim()}
                className={`rounded-lg px-6 py-3 text-sm font-medium text-white shadow ${
                  newTodoText.trim()
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'cursor-not-allowed bg-emerald-300'
                }`}
              >
                {t.todosAddNew}
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex gap-2">
              <FilterButton
                active={filter === 'all'}
                onClick={() => setFilter('all')}
                label={t.todosAll}
                count={todos.length}
              />
              <FilterButton
                active={filter === 'active'}
                onClick={() => setFilter('active')}
                label={t.todosActive}
                count={activeCount}
              />
              <FilterButton
                active={filter === 'completed'}
                onClick={() => setFilter('completed')}
                label={t.todosCompleted}
                count={completedCount}
              />
            </div>
          </div>

          {/* Todo List */}
          <div className="p-6">
            {todos.length >= MAX_TODOS && (
              <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-700">
                ⚠️ Maximum of {MAX_TODOS} todos reached. Please delete some todos before adding new ones.
              </div>
            )}
            {filteredTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <span className="text-4xl mb-3">📝</span>
                <p className="text-sm">{t.todosEmpty}</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={() => handleToggleTodo(todo.id)}
                    onDelete={() => handleDeleteTodo(todo.id)}
                    labels={t}
                  />
                ))}
              </ul>
            )}

            {completedCount > 0 && filter === 'completed' && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={handleClearCompleted}
                  className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  {t.todosClearCompleted}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label} ({count})
    </button>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  labels,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  labels: AppDictionary;
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 transition hover:bg-slate-100">
      <button
        onClick={onToggle}
        className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition ${
          todo.completed
            ? 'border-emerald-500 bg-emerald-500'
            : 'border-slate-300 hover:border-emerald-400'
        }`}
        aria-label={todo.completed ? labels.todosMarkActive : labels.todosMarkComplete}
      >
        {todo.completed && <span className="text-white text-xs">✓</span>}
      </button>
      <span
        className={`flex-1 text-sm ${
          todo.completed ? 'text-slate-400 line-through' : 'text-slate-800'
        }`}
      >
        {/* React automatically escapes content, making it safe from XSS */}
        {todo.text}
      </span>
      <button
        onClick={onDelete}
        className="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
        aria-label={labels.todosDelete}
      >
        {labels.todosDelete}
      </button>
    </li>
  );
}

function LanguageSwitcher({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (value: Locale) => void;
}) {
  const locales = [
    { code: 'zh' as Locale, label: '中文' },
    { code: 'en' as Locale, label: 'English' },
    { code: 'de' as Locale, label: 'Deutsch' },
  ];

  return (
    <select
      value={locale}
      onChange={(event) => onChange(event.target.value as Locale)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
    >
      {locales.map((item) => (
        <option key={item.code} value={item.code}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

