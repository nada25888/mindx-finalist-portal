import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldAlert } from "lucide-react";

import { LogoBadge } from "@/components/sys/LogoBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, getSession, IS_DEMO_MODE, login } from "@/services/api";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "لوحة الفرز والتحكيم — دخول اللجنة | SYS" },
      { name: "description", content: "صفحة دخول خاصة بلجنة التنظيم والتحكيم لمسابقة MindX." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "لوحة الفرز والتحكيم | SYS" },
      { property: "og:description", content: "منطقة خاصة بلجنة التنظيم والتحكيم لمسابقة MindX." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getSession()) navigate({ to: "/dashboard", replace: true });
  }, [navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError("دخل البريد الإلكتروني وكلمة المرور");
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تسجيل الدخول، حاول تاني");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-hero px-4 py-10">
      <div className="grid-pattern pointer-events-none absolute inset-0" aria-hidden />
      <div className="animate-slide-up relative w-full max-w-md rounded-3xl bg-card p-6 shadow-elevated sm:p-8">
        <div className="flex flex-col items-center text-center">
          <LogoBadge size="lg" />
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-amber/15 px-3 py-1 text-xs font-bold text-amber-foreground">
            <ShieldAlert className="size-3.5" /> منطقة خاصة
          </span>
          <h1 className="mt-3 text-2xl font-extrabold">لوحة الفرز والتحكيم — منطقة خاصة</h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            الصفحة دي للجنة التنظيم والتحكيم فقط. دخل بيانات الدخول عشان تفتح البيانات.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="mt-7 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username" className="font-bold">
              البريد الإلكتروني / اسم المستخدم
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                dir="ltr"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="font-num h-12 rounded-xl pl-10 text-left"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold">
              كلمة المرور
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                dir="ltr"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-num h-12 rounded-xl px-10 text-left"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-smooth hover:text-foreground"
                aria-label={show ? "إخفاء الباسورد" : "إظهار الباسورد"}
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={show}
                onChange={(e) => setShow(e.target.checked)}
                className="size-4 accent-primary"
              />
              إظهار الباسورد
            </label>
          </div>

          {error && (
            <p className="animate-fade-in rounded-xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" variant="navy" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Lock />}
            {loading ? "جاري التحقق..." : "فتح اللوحة"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-smooth hover:text-primary-hover"
          >
            <ArrowRight className="size-4" /> رجوع للرئيسية
          </Link>
        </div>

        {IS_DEMO_MODE && (
          <p className="mt-5 rounded-xl bg-surface px-4 py-3 text-center text-xs leading-6 text-muted-foreground">
            وضع المعاينة مفعّل — الدخول بحساب اللجنة التجريبي لحد ما يتربط السيرفر.
          </p>
        )}
      </div>
    </main>
  );
}
