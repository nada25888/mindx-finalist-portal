import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ClipboardCheck, FileUp, Gavel, ShieldCheck, X } from "lucide-react";

import { SiteHeader } from "@/components/sys/SiteHeader";
import { SubmissionForm } from "@/components/sys/SubmissionForm";
import { FaqSection } from "@/components/sys/FaqSection";
import { ContactSection } from "@/components/sys/ContactSection";
import { Button } from "@/components/ui/button";
import { useAdminTrigger } from "@/hooks/use-admin-trigger";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "المرحلة النهائية لمسابقة MindX | SYS - نظام التقديم والفرز" },
      {
        name: "description",
        content: "سجّل بياناتك وارفع ملف أعمالك للمرحلة النهائية لمسابقة MindX ضمن مبادرة SYS الشبابية.",
      },
      { property: "og:title", content: "المرحلة النهائية لمسابقة MindX | SYS" },
      {
        property: "og:description",
        content: "سجّل بياناتك وارفع ملف أعمالك للمرحلة النهائية لمسابقة MindX ضمن مبادرة SYS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STEPS = [
  { icon: ClipboardCheck, title: "اكتب بياناتك", text: "كود المتأهل والاسم والتليفون والرقم القومي." },
  { icon: FileUp, title: "ارفع أعمالك", text: "ملف PDF أو ZIP أو رابط مباشر للمشروع." },
  { icon: Gavel, title: "لجنة التحكيم", text: "اللجنة بتراجع وتقيّم كل المشاركات." },
];

function Index() {
  const { revealed, registerLogoClick, hide } = useAdminTrigger();

  return (
    <div id="top" className="min-h-screen bg-background">
      <SiteHeader onLogoClick={registerLogoClick} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero text-navy-foreground">
        <div className="grid-pattern pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 pb-28 pt-16 text-center sm:pb-36 sm:pt-24">
          <span className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-1.5 text-sm font-bold text-success">
            <span className="pulse-dot size-2 rounded-full bg-success" />
            التقديم للمرحلة النهائية مفتوح الآن
          </span>
          <h1 className="animate-slide-up mt-6 text-4xl font-black leading-tight sm:text-6xl">
            المرحلة النهائية
            <br />
            لمسابقة <span className="font-num text-brand-gradient">MindX</span>
          </h1>
          <p
            className="animate-slide-up mx-auto mt-5 max-w-xl text-base leading-8 text-navy-muted sm:text-lg"
            style={{ animationDelay: "100ms" }}
          >
            مبروك وصولك للنهائيات! سجّل بياناتك وارفع ملف أعمالك عشان لجنة الفرز والتحكيم تبدأ تقييم مشاركتك.
          </p>
          <div className="animate-slide-up mt-8 flex justify-center" style={{ animationDelay: "200ms" }}>
            <Button asChild variant="hero" size="lg">
              <a href="#apply">
                سجّل بياناتك وأعمالك الآن <ArrowDown />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="apply" className="relative z-10 -mt-20 scroll-mt-24 px-4 sm:-mt-24">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1.6fr]">
          <aside className="order-2 space-y-3 lg:order-1 lg:pt-28">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div
                key={title}
                className="animate-slide-up flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
                style={{ animationDelay: `${150 + i * 80}ms` }}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-bold">
                    <span className="font-num me-1 text-primary">{i + 1}.</span> {title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3 rounded-2xl bg-surface p-4 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-cyan" />
              بياناتك بتوصل للجنة التنظيم والتحكيم بس، ومش بتتنشر لأي حد.
            </div>
          </aside>
          <div className="order-1 lg:order-2">
            <SubmissionForm />
          </div>
        </div>
      </section>

      <FaqSection />
      <ContactSection />

      {revealed && (
        <div className="animate-slide-up fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-2 rounded-full bg-navy p-2 ps-4 shadow-elevated ring-1 ring-navy-foreground/10">
          <Gavel className="size-5 shrink-0 text-amber" />
          <span className="flex-1 truncate text-sm font-semibold text-navy-foreground">منطقة اللجنة</span>
          <Button asChild variant="amber" size="sm">
            <Link to="/admin-login">دخول لجنة الفرز والتحكيم</Link>
          </Button>
          <Button variant="glass" size="icon" className="size-8" onClick={hide} aria-label="إخفاء">
            <X />
          </Button>
        </div>
      )}
    </div>
  );
}
