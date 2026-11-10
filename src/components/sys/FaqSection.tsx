import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SUPPORT_PHONE } from "@/lib/site-config";

const FAQS = [
  {
    q: "إزاي أعرف إن مشاركتي وصلت؟",
    a: "أول ما تضغط «إرسال المشاركة» وتظهر لك رسالة التأكيد ومعاها رقم مرجعي، يبقى مشاركتك وصلت للجنة الفرز. احتفظ بالرقم المرجعي وكود المتأهل، ولو ما ظهرتش رسالة التأكيد تواصل مع الدعم الفني.",
  },
  {
    q: "شروط تسليم ملف الأعمال",
    a: "الملف يكون بصيغة PDF أو ZIP وحجمه ما يزيدش عن 25 ميجا، أو تضيف رابط مباشر للمشروع (Google Drive أو GitHub أو غيره) ويكون متاح للمشاهدة. اكتب اسمك وكود المتأهل في أول صفحة من الملف.",
  },
  {
    q: "أقدر أعدّل بياناتي بعد الإرسال؟",
    a: "كل رقم قومي بيتسجل مرة واحدة بس. لو محتاج تعدّل حاجة بعد الإرسال، كلّم الدعم الفني وقولهم كود المتأهل بتاعك.",
  },
  {
    q: "ليه محتاجين كود المتأهل؟",
    a: "كود المتأهل هو اللي بيأكد إنك من المتأهلين للمرحلة النهائية، ولجنة الفرز بتستخدمه عشان تطابق مشاركتك. اكتبه زي ما وصلك بالظبط.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <span className="text-sm font-bold text-primary">الأسئلة الشائعة</span>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">عندك سؤال؟</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`item-${i}`}
              className="rounded-2xl border border-border bg-card px-5 shadow-card"
            >
              <AccordionTrigger className="text-start text-base font-bold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-7 text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          لسه محتاج مساعدة؟ كلّم الدعم الفني على{" "}
          <a href={`tel:${SUPPORT_PHONE}`} className="font-num font-semibold text-primary hover:underline">
            {SUPPORT_PHONE}
          </a>
        </p>
      </div>
    </section>
  );
}
