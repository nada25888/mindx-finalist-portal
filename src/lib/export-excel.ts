import * as XLSX from "xlsx";
import type { Submission } from "@/services/api";

export const EXCEL_HEADERS = [
  "م",
  "الكود",
  "الاسم بالكامل",
  "رقم التليفون",
  "الرقم القومي",
  "ملف الأعمال",
  "رابط المشروع",
  "التقييم النهائي (من 100)",
  "الملاحظات",
  "الحالة",
  "تاريخ التسجيل",
  "تاريخ التقييم",
] as const;

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }) : "";

/** Builds rows for the export. Phone & national ID stay text so leading zeros are kept. */
export function buildExportRows(list: Submission[]): (string | number)[][] {
  return list.map((s, i) => [
    i + 1,
    s.participantCode,
    s.fullName,
    s.phone,
    s.nationalId,
    s.fileName ?? "",
    s.projectLink,
    s.score ?? "",
    s.notes,
    s.status === "evaluated" ? "تم التقييم" : "قيد المراجعة",
    fmtDate(s.submittedAt),
    fmtDate(s.evaluatedAt),
  ]);
}

export function exportSubmissionsToExcel(list: Submission[]) {
  const rows = buildExportRows(list);
  const ws = XLSX.utils.aoa_to_sheet([[...EXCEL_HEADERS], ...rows]);
  ws["!cols"] = [6, 22, 30, 16, 20, 28, 34, 20, 40, 14, 18, 18].map((wch) => ({ wch }));
  ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: EXCEL_HEADERS.length - 1 } }) };
  // Force phone / national ID cells to text.
  for (let r = 1; r <= rows.length; r++) {
    for (const c of [1, 3, 4]) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (cell) {
        cell.t = "s";
        cell.z = "@";
      }
    }
  }

  const evaluated = list.filter((s) => s.status === "evaluated");
  const scores = evaluated.map((s) => s.score ?? 0);
  const summary = XLSX.utils.aoa_to_sheet([
    ["ملخص المرحلة النهائية - MindX"],
    [],
    ["إجمالي المتأهلين المسجلين", list.length],
    ["تم تقييمهم", evaluated.length],
    ["قيد المراجعة", list.length - evaluated.length],
    ["متوسط التقييم", scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) : "-"],
    ["أعلى تقييم", scores.length ? Math.max(...scores) : "-"],
    ["تاريخ التصدير", fmtDate(new Date().toISOString())],
  ]);
  summary["!cols"] = [{ wch: 30 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  wb.Workbook = { Views: [{ RTL: true }] };
  XLSX.utils.book_append_sheet(wb, ws, "المتأهلين والتقييمات");
  XLSX.utils.book_append_sheet(wb, summary, "الملخص");

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `MindX-Finalists-${date}.xlsx`, { compression: true });
}
