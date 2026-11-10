import { describe, expect, it } from "vitest";
import { isValidScore, submissionSchema, validateWorkFile } from "@/lib/validation";
import { countRecent, RELOAD_WINDOW_MS, RELOADS_NEEDED } from "@/hooks/use-admin-trigger";

const base = {
  participantCode: "SYS@Youth#Summit26",
  fullName: "أحمد محمد علي",
  phone: "01012345678",
  nationalId: "30101011234567",
  projectLink: "",
  hasFile: true,
};

describe("finalist submission rules", () => {
  it("accepts an 11-digit Egyptian phone and rejects 10 digits", () => {
    expect(submissionSchema.safeParse(base).success).toBe(true);
    expect(submissionSchema.safeParse({ ...base, phone: "0101234567" }).success).toBe(false);
  });

  it("requires the national ID to be exactly 14 digits", () => {
    expect(submissionSchema.safeParse({ ...base, nationalId: "3010101123456" }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...base, nationalId: "301010112345678" }).success).toBe(false);
  });

  it("accepts Arabic-Indic digits for phone", () => {
    const r = submissionSchema.safeParse({ ...base, phone: "٠١٠١٢٣٤٥٦٧٨" });
    expect(r.success && r.data.phone).toBe("01012345678");
  });

  it("requires a file or a project link", () => {
    expect(submissionSchema.safeParse({ ...base, hasFile: false }).success).toBe(false);
    expect(
      submissionSchema.safeParse({ ...base, hasFile: false, projectLink: "https://github.com/x/y" }).success,
    ).toBe(true);
  });

  it("only allows PDF or ZIP files", () => {
    expect(validateWorkFile(new File(["x"], "work.pdf"))).toBeNull();
    expect(validateWorkFile(new File(["x"], "work.zip"))).toBeNull();
    expect(validateWorkFile(new File(["x"], "work.docx"))).not.toBeNull();
  });
});

describe("judging rules", () => {
  it("score must be between 0 and 100", () => {
    expect(isValidScore(0)).toBe(true);
    expect(isValidScore(100)).toBe(true);
    expect(isValidScore(101)).toBe(false);
    expect(isValidScore(-1)).toBe(false);
  });

  it("3 refreshes within 10 seconds reveal the admin entrance, older ones don't count", () => {
    const now = 100_000;
    expect(RELOADS_NEEDED).toBe(3);
    expect(RELOAD_WINDOW_MS).toBe(10_000);
    expect(countRecent([now - 9_000, now - 4_000], now, RELOAD_WINDOW_MS).length + 1).toBe(3);
    expect(countRecent([now - 11_000, now - 4_000], now, RELOAD_WINDOW_MS).length + 1).toBe(2);
  });
});
