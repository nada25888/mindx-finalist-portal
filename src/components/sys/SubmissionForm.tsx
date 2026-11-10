import { useRef, useState, type DragEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  FileArchive,
  FileText,
  Hash,
  IdCard,
  Link2,
  Loader2,
  Phone,
  Send,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  MAX_FILE_SIZE_MB,
  submissionSchema,
  validateWorkFile,
  type SubmissionFormValues,
} from "@/lib/validation";
import { ApiError, IS_DEMO_MODE, submitFinalist, type Submission } from "@/services/api";

function formatSize(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="animate-fade-in text-xs font-semibold text-destructive">{message}</p>;
}

export function SubmissionForm() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<Submission | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { participantCode: "", fullName: "", phone: "", nationalId: "", projectLink: "", hasFile: false },
  });

  const pickFile = (f: File | null | undefined) => {
    if (!f) return;
    const err = validateWorkFile(f);
    if (err) {
      toast.error(err);
      return;
    }
    setFile(f);
    setValue("hasFile", true, { shouldValidate: true });
  };

  const clearFile = () => {
    setFile(null);
    setValue("hasFile", false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const onSubmit = handleSubmit(async (raw) => {
    const values = submissionSchema.parse(raw);
    try {
      const saved = await submitFinalist({
        participantCode: values.participantCode,
        fullName: values.fullName,
        phone: values.phone,
        nationalId: values.nationalId,
        projectLink: values.projectLink ?? "",
        file,
      });
      setResult(saved);
      reset();
      clearFile();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "حصلت مشكلة في الإرسال، حاول تاني");
    }
  });

  const FileIcon = file?.name.toLowerCase().endsWith(".zip") ? FileArchive : FileText;

  return (
    <>
      <form
        onSubmit={onSubmit}
        noValidate
        className="animate-slide-up rounded-3xl border border-border bg-card p-5 shadow-elevated sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold sm:text-2xl">بيانات المتأهل</h2>
            <p className="mt-1 text-sm text-muted-foreground">كل الخانات مطلوبة. اتأكد من البيانات قبل الإرسال.</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="participantCode" className="flex items-center gap-2 font-bold">
              <Hash className="size-4 text-primary" /> كود المتأهل
            </Label>
            <Input
              id="participantCode"
              dir="ltr"
              placeholder="SYS@Youth#Summit26"
              autoComplete="off"
              className="font-num h-12 rounded-xl text-start"
              aria-invalid={!!errors.participantCode}
              {...register("participantCode")}
            />
            <FieldError message={errors.participantCode?.message} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="fullName" className="flex items-center gap-2 font-bold">
              <User className="size-4 text-primary" /> الاسم بالكامل
            </Label>
            <Input
              id="fullName"
              placeholder="مثال: أحمد محمد علي حسن"
              autoComplete="name"
              className="h-12 rounded-xl"
              aria-invalid={!!errors.fullName}
              {...register("fullName")}
            />
            <FieldError message={errors.fullName?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 font-bold">
              <Phone className="size-4 text-primary" /> رقم التليفون
            </Label>
            <Input
              id="phone"
              dir="ltr"
              inputMode="numeric"
              maxLength={11}
              placeholder="01xxxxxxxxx"
              autoComplete="tel"
              className="font-num h-12 rounded-xl text-start"
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
            <FieldError message={errors.phone?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationalId" className="flex items-center gap-2 font-bold">
              <IdCard className="size-4 text-primary" /> الرقم القومي
            </Label>
            <Input
              id="nationalId"
              dir="ltr"
              inputMode="numeric"
              maxLength={14}
              placeholder="14 رقم"
              autoComplete="off"
              className="font-num h-12 rounded-xl text-start"
              aria-invalid={!!errors.nationalId}
              {...register("nationalId")}
            />
            <FieldError message={errors.nationalId?.message} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label className="flex items-center gap-2 font-bold">
              <UploadCloud className="size-4 text-primary" /> ملف الأعمال والمشاركة
            </Label>

            {file ? (
              <div className="animate-fade-in flex items-center gap-3 rounded-2xl border border-primary/30 bg-accent p-4">
                <span className="flex size-11 items-center justify-center rounded-xl bg-card text-primary shadow-card">
                  <FileIcon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-num truncate text-sm font-semibold text-start">{file.name}</p>
                  <p className="font-num text-xs text-muted-foreground text-start">{formatSize(file.size)}</p>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={clearFile} aria-label="إزالة الملف">
                  <X />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-input bg-surface px-4 py-8 text-center transition-smooth hover:border-primary hover:bg-accent",
                  dragging && "border-primary bg-accent",
                )}
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-card text-primary shadow-card">
                  <UploadCloud className="size-6" />
                </span>
                <span className="text-sm font-bold">اسحب الملف هنا أو اضغط للاختيار</span>
                <span className="text-xs text-muted-foreground">
                  PDF أو ZIP — بحد أقصى <span className="font-num">{MAX_FILE_SIZE_MB}MB</span>
                </span>
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />

            <div className="flex items-center gap-3 py-1 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> أو ضيف رابط المشروع <span className="h-px flex-1 bg-border" />
            </div>
            <div className="relative">
              <Link2 className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                dir="ltr"
                type="url"
                placeholder="https://drive.google.com/..."
                className="font-num h-12 rounded-xl pe-10 text-start"
                aria-invalid={!!errors.projectLink}
                {...register("projectLink")}
              />
            </div>
            <FieldError message={errors.projectLink?.message} />
          </div>
        </div>

        <Button type="submit" size="lg" className="mt-8 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> جاري الإرسال...
            </>
          ) : (
            <>
              <Send /> إرسال المشاركة
            </>
          )}
        </Button>
        {IS_DEMO_MODE && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            وضع المعاينة: المشاركات بتتحفظ على المتصفح ده بس لحد ما يتربط السيرفر.
          </p>
        )}
      </form>

      <Dialog open={!!result} onOpenChange={(o) => !o && setResult(null)}>
        <DialogContent className="max-w-md rounded-3xl text-center sm:rounded-3xl" dir="rtl">
          <DialogHeader className="items-center text-center sm:text-center">
            <span className="mx-auto mb-2 flex size-16 animate-slide-up items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="size-9" />
            </span>
            <DialogTitle className="text-xl font-extrabold">مشاركتك وصلت بنجاح 🎉</DialogTitle>
            <DialogDescription className="leading-7">
              شكرًا يا {result?.fullName.split(" ")[0]}، لجنة الفرز هتراجع أعمالك وهنتواصل معاك على رقم تليفونك.
            </DialogDescription>
          </DialogHeader>
          {result && (
            <dl className="mt-2 space-y-2 rounded-2xl bg-surface p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">كود المتأهل</dt>
                <dd className="font-num font-bold">{result.participantCode}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">الرقم المرجعي</dt>
                <dd className="font-num font-bold">{result.id.slice(0, 8).toUpperCase()}</dd>
              </div>
            </dl>
          )}
          <Button className="mt-2 w-full" onClick={() => setResult(null)}>
            تمام
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
