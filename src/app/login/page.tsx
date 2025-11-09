'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  dictionaries,
  locales,
  type AppDictionary,
  type Locale,
} from "@/i18n/dictionary";
import { demoCredentials, useAuth } from "@/context/AuthContext";

const LOCALE_STORAGE_KEY = "engineer-finder-locale";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoading } = useAuth();
  const [locale, setLocale] = useState<Locale>("zh");
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState<string | null>(null);
  const dict: AppDictionary = dictionaries[locale];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved && locales.some((item) => item.code === saved)) {
        setLocale(saved as Locale);
      }
    }
  }, []);

  useEffect(() => {
    if (user && !isLoading) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    router.replace("/");
  };

  const handleLocaleChange = (value: Locale) => {
    setLocale(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, value);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-lg items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{dict.appTitle}</h1>
            <p className="text-sm text-slate-500">{dict.appSubtitle}</p>
          </div>
          <select
            value={locale}
            onChange={(event) => handleLocaleChange(event.target.value as Locale)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            {locales.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{dict.authLoginTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{dict.authLoginSubtitle}</p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-semibold text-slate-500">{dict.authEmailLabel}</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">
                {dict.authPasswordLabel}
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="********"
                required
              />
            </div>

            {error ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-500">{error}</p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              {dict.authLoginButton}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
            <p className="font-semibold text-slate-600">{dict.authDemoTitle}</p>
            <ul className="mt-2 space-y-1">
              {demoCredentials.map((entry) => (
                <li key={entry.id} className="flex flex-col rounded border border-slate-200 bg-white px-3 py-2">
                  <span className="text-slate-600">
                    {entry.role === "professional"
                      ? dict.roleProfessional
                      : dict.roleCustomer}
                    ：{entry.name}
                  </span>
                  <span>{entry.email} / {entry.password}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          <Link href="/" className="text-emerald-600 hover:text-emerald-500">
            ← {dict.authBackToHome}
          </Link>
        </p>
      </main>
    </div>
  );
}

