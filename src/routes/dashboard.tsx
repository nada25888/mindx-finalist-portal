import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileX,
  Loader2,
  LogOut,
  RefreshCw,
  Save,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { LogoBadge } from "@/components/sys/LogoBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { isValidScore, normalizeDigits } from "@/lib/validation";
import { exportSubmissionsToExcel } from "@/lib/export-excel";
import {
  ApiError,
  getFileUrl,
  getSession,
  IS_DEMO_MODE,
  listSubmissions,
  logout,
  saveEvaluation,
  type Submission,
} from "@/services/api";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "لوحة الفرز والتحكيم | SYS · MindX" },
      { name: "description", content: "لوحة لجنة الفرز والتحكيم لمراجعة وتقييم مشاركات المرحلة النهائية لمسابقة MindX." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "لوحة الفرز والتحكيم | SYS" },
      { property: "og:description", content: "مراجعة وتقييم مشاركات المرحلة النهائية لمسابقة MindX." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

type Filter = "all" | "pending" | "evaluated";

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const session = getSession();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!session) navigate({ to: "/admin-login", replace: true });
  }, [session, navigate]);

  const { data = [], isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["submissions"],
    queryFn: listSubmissions,
    enabled: !!session,
  });

  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) navigate({ to: "/admin-login", replace: true });
  }, [error, navigate]);

  const stats = useMemo(() => {
    const evaluated = data.filter((s) => s.status === "evaluated").length;
    return { total: data.length, evaluated, pending: data.length - evaluated };
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qDigits = normalizeDigits(q);
    return data.filter((s) => {
      if (filter !== "all" && s.status !== filter) return false;
      if (!q) return true;
      return (
        s.participantCode.toLowerCase().includes(q) ||
        s.fullName.toLowerCase().includes(q) ||
        (qDigits !== "" && s.nationalId.includes(qDigits))
      );
    });
  }, [data, search, filter]);

  const onLogout = async () => {
    await logout();
    qc.removeQueries({ queryKey: ["submissions"] });
    navigate({ to: "/admin-login" });
  };

  const onExport = () => {
    if (!data.length) {
      toast.error("مفيش بيانات للتصدير لسه");
      return;
    }
    exportSubmissionsToExcel(data);
    toast.success("تم تنزيل شيت الإكسيل");
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-navy-foreground/10 bg-navy-deep/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <LogoBadge size="sm" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-bold text-navy-foreground">لوحة الفرز والتحكيم</p>
              <p className="truncate text-xs text-navy-muted">{session.user.name}</p>
            </div>
          </div>
          <Button variant="glass" size="sm" onClick={onLogout}>
            <LogOut /> <span className="hidden sm:inline">تسجيل خروج</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">المتأهلين للمرحلة النهائية</h1>
            <p className="mt-1 text-sm text-muted-foreground">راجع ملفات الأعمال وسجّل التقييم النهائي لكل متأهل.</p>
          </div>
          <Button variant="success" size="lg" onClick={onExport} className="w-full sm:w-auto">
            <FileSpreadsheet /> تصدير البيانات إلى شيت إكسيل (Export Excel)
          </Button>
        </div>

        {IS_DEMO_MODE && (
          <p className="rounded-2xl border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-amber-foreground">
            وضع المعاينة: البيانات المعروضة متخزنة على المتصفح ده بس لحد ما يتربط السيرفر الحقيقي.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Users} label="إجمالي المتأهلين المسجلين" value={stats.total} tone="primary" />
          <StatCard icon={CheckCircle2} label="تم تقييمهم" value={stats.evaluated} tone="success" />
          <StatCard icon={Clock} label="قيد المراجعة" value={stats.pending} tone="amber" />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-card sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالكود أو الاسم أو الرقم القومي"
              className="h-11 rounded-full border-0 bg-surface ps-11"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <SelectTrigger className="h-11 flex-1 rounded-full bg-surface sm:w-48" dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
                <SelectItem value="evaluated">تم التقييم</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="size-11" onClick={() => refetch()} aria-label="تحديث">
              <RefreshCw className={cn(isFetching && "animate-spin")} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-input bg-card py-16 text-center">
            <Users className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-3 font-bold">{data.length ? "مفيش نتائج مطابقة للبحث" : "لسه مفيش مشاركات"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.length ? "جرّب كلمة بحث تانية أو غيّر الفلتر." : "أول ما المتأهلين يسجلوا هتظهر بياناتهم هنا."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-card lg:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface text-xs text-muted-foreground">
                    <tr>
                      {["الكود", "الاسم بالكامل", "رقم التليفون", "الرقم القومي", "ملف الأعمال", "التقييم النهائي"].map((h) => (
                        <th key={h} className="whitespace-nowrap px-4 py-3 text-start font-bold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((s) => (
                      <tr key={s.id} className="align-top transition-smooth hover:bg-surface/60">
                        <td className="px-4 py-4">
                          <CodeBadge code={s.participantCode} />
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold">{s.fullName}</p>
                          <StatusPill status={s.status} />
                        </td>
                        <td className="font-num whitespace-nowrap px-4 py-4">{s.phone}</td>
                        <td className="font-num whitespace-nowrap px-4 py-4">{s.nationalId}</td>
                        <td className="px-4 py-4">
                          <FileButtons s={s} />
                        </td>
                        <td className="px-4 py-4">
                          <EvaluationControls s={s} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="space-y-4 lg:hidden">
              {filtered.map((s) => (
                <article key={s.id} className="animate-fade-in rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold">{s.fullName}</p>
                      <div className="mt-1.5">
                        <CodeBadge code={s.participantCode} />
                      </div>
                    </div>
                    <StatusPill status={s.status} />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-surface p-3 text-xs">
                    <div>
                      <dt className="text-muted-foreground">رقم التليفون</dt>
                      <dd className="font-num mt-0.5 text-sm font-semibold">{s.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">الرقم القومي</dt>
                      <dd className="font-num mt-0.5 text-sm font-semibold">{s.nationalId}</dd>
                    </div>
                  </dl>
                  <div className="mt-3">
                    <FileButtons s={s} />
                  </div>
                  <div className="mt-4 border-t border-border pt-4">
                    <EvaluationControls s={s} />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const tones = {
  primary: "bg-accent text-primary",
  success: "bg-success/15 text-success",
  amber: "bg-amber/15 text-amber",
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  tone: keyof typeof tones;
}) {
  return (
    <div className="animate-slide-up flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
      <span className={cn("flex size-12 items-center justify-center rounded-2xl", tones[tone])}>
        <Icon className="size-6" />
      </span>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-num text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function CodeBadge({ code }: { code: string }) {
  return (
    <span className="font-num inline-block max-w-full truncate rounded-full bg-navy px-3 py-1 text-xs font-semibold text-navy-foreground">
      {code}
    </span>
  );
}

function StatusPill({ status }: { status: Submission["status"] }) {
  return status === "evaluated" ? (
    <span className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-bold text-success">
      <CheckCircle2 className="size-3" /> تم التقييم
    </span>
  ) : (
    <span className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-amber/15 px-2.5 py-0.5 text-xs font-bold text-amber-foreground">
      <Clock className="size-3" /> قيد المراجعة
    </span>
  );
}

function FileButtons({ s }: { s: Submission }) {
  const url = getFileUrl(s);
  const hasAny = s.fileName || s.projectLink;
  if (!hasAny) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <FileX className="size-4" /> مفيش ملف
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {s.fileName &&
        (url ? (
          <Button asChild variant="outline" size="sm">
            <a href={url} download={s.fileName} target="_blank" rel="noopener noreferrer" title={s.fileName}>
              <Download /> <span className="max-w-32 truncate">{s.fileName}</span>
            </a>
          </Button>
        ) : (
          <span className="font-num inline-flex max-w-48 items-center gap-1 truncate rounded-full bg-surface px-3 py-1.5 text-xs" title="الملف كبير على المعاينة — هيتحمّل لما يتربط السيرفر">
            <Download className="size-3.5" /> {s.fileName}
          </span>
        ))}
      {s.projectLink && (
        <Button asChild variant="outline" size="sm">
          <a href={s.projectLink} target="_blank" rel="noopener noreferrer">
            <ExternalLink /> رابط المشروع
          </a>
        </Button>
      )}
    </div>
  );
}

function EvaluationControls({ s }: { s: Submission }) {
  const qc = useQueryClient();
  const [score, setScore] = useState(s.score?.toString() ?? "");
  const [notes, setNotes] = useState(s.notes);

  const mutation = useMutation({
    mutationFn: () => saveEvaluation(s.id, Number(normalizeDigits(score)), notes.trim()),
    onSuccess: (updated) => {
      qc.setQueryData<Submission[]>(["submissions"], (old) =>
        old?.map((x) => (x.id === updated.id ? updated : x)),
      );
      toast.success(`تم حفظ تقييم ${updated.fullName}`);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "تعذّر حفظ التقييم"),
  });

  const numeric = Number(normalizeDigits(score));
  const invalid = score !== "" && !isValidScore(numeric);
  const dirty = score !== (s.score?.toString() ?? "") || notes !== s.notes;

  return (
    <div className="flex min-w-64 flex-col gap-2 sm:flex-row sm:items-start">
      <div className="w-full sm:w-24">
        <Input
          dir="ltr"
          inputMode="decimal"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="0-100"
          aria-label="الدرجة من 100"
          aria-invalid={invalid}
          className={cn("font-num h-10 rounded-xl text-center", invalid && "border-destructive")}
        />
        {invalid && <p className="mt-1 text-xs text-destructive">من 0 لـ 100</p>}
      </div>
      <Input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="ملاحظات اللجنة"
        maxLength={500}
        aria-label="ملاحظات"
        className="h-10 flex-1 rounded-xl"
      />
      <Button
        size="sm"
        className="h-10"
        disabled={score === "" || invalid || !dirty || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
        حفظ التقييم
      </Button>
    </div>
  );
}
