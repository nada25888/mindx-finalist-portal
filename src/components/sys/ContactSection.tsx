import { Facebook, Instagram, Headset, MessageCircle, Music2 } from "lucide-react";
import { LogoBadge } from "./LogoBadge";
import { OFFICIAL_CHANNELS, SUPPORT_PHONE } from "@/lib/site-config";

const CHANNELS = [
  { label: "فيسبوك SYS", href: OFFICIAL_CHANNELS.facebook, icon: Facebook },
  { label: "قناة الواتساب", href: OFFICIAL_CHANNELS.whatsappChannel, icon: MessageCircle },
  { label: "إنستجرام", href: OFFICIAL_CHANNELS.instagram, icon: Instagram },
  { label: "تيك توك", href: OFFICIAL_CHANNELS.tiktok, icon: Music2 },
];

export function ContactSection() {
  return (
    <footer id="contact" className="scroll-mt-24 px-4 pb-10">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-hero text-navy-foreground shadow-elevated">
        <div className="relative p-6 sm:p-10">
          <div className="grid-pattern pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div className="flex items-start gap-4">
              <LogoBadge size="lg" />
              <div>
                <h2 className="text-xl font-extrabold sm:text-2xl">القنوات الرسمية لـ SYS</h2>
                <p className="mt-2 text-sm leading-7 text-navy-muted">
                  تابع آخر أخبار المرحلة النهائية لمسابقة MindX من صفحاتنا الرسمية بس.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CHANNELS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-navy-foreground/10 bg-navy-foreground/5 p-4 text-center text-sm font-semibold transition-smooth hover:-translate-y-0.5 hover:border-primary hover:bg-primary/20"
                >
                  <Icon className="size-5 text-cyan transition-smooth group-hover:text-navy-foreground" />
                  {label}
                </a>
              ))}
              <a
                href={OFFICIAL_CHANNELS.support}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 flex items-center justify-center gap-3 rounded-2xl bg-primary p-4 text-sm font-bold text-primary-foreground shadow-glow transition-smooth hover:bg-primary-hover sm:col-span-4"
              >
                <Headset className="size-5" />
                الدعم الفني
                <span className="font-num">{SUPPORT_PHONE}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        © <span className="font-num">2026</span> SYS — مبادرة شبابية. جميع الحقوق محفوظة.
      </p>
    </footer>
  );
}
