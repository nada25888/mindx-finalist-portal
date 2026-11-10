# MindX Finalist Portal

Build a complete, responsive Arabic (RTL) web application for the final stage of the "MindX" competition under the "SYS" youth initiative ("نظام التقديم والفرز الإلكتروني - المرحلة النهائية لمسابقة MindX").



### 1. Design System & Branding (SYS-Design-System):

- **Direction & Language:** Full Arabic RTL layout using modern Arabic typography ('Cairo' or 'Tajawal' paired with 'Inter' for numbers/codes).

- **Color Palette:**

  - Dark Navy Hero & Header Background: #0F172A / #020617 (matching the uploaded SYS reference screenshots).

  - Light Page Background: #FAFAFF with crisp white cards (#FFFFFF) and subtle #F0F2F5 surfaces.

  - Primary Brand Blue: #2563EB (hover #1D4ED8), Secondary Cyan: #0891B2, Accent Amber: #F59E0B, Success Green: #10B981, Error Red: #EF4444.

- **UI & Micro-interactions:** Rounded cards (`rounded-2xl` / 16px), pill-shaped buttons (`rounded-full`), smooth cubic-bezier transitions (200ms), `fadeIn` and `slideUp` entrance animations, and elevated card shadows.

- **Logo:** Place the uploaded SYS logo inside a clean white rounded-square badge (`rounded-2xl`) in the sticky top navbar and on cards.



### 2. Application Pages & Features:



#### A. Main Landing & Finalist Submission Page (`/`):

- **Header:** Sticky dark navy navbar with the SYS logo badge, title "SYS - نظام التقديم والفرز الإلكتروني", and a slide-out mobile menu.

- **Hero Section:** Dark navy background with subtle grid pattern, status pill badge ("● التقديم للمرحلة النهائية مفتوح الآن" in green), main heading "المرحلة النهائية لمسابقة MindX", brief description, and a CTA button "سجّل بياناتك وأعمالك الآن" that scrolls smoothly to the form.

- **Finalist Submission Form Card:** Elevated white card with clear validation for:

  1. **كود المتأهل (Participant Code):** Required text input (e.g., `SYS@Youth#Summit26` or unique finalist code) to verify eligibility during sorting.

  2. **الاسم بالكامل (Full Name):** Required Arabic full name input.

  3. **رقم التليفون (Phone Number):** Required 11-digit Egyptian phone number validation.

  4. **الرقم القومي (National ID):** Required exact 14-digit number validation.

  5. **ملف الأعمال والمشاركة (Project Work File):** File upload dropzone accepting PDF, ZIP, or project links.

  - Submit button with loading state and a clean confirmation modal upon submission.

- **FAQ & Official Channels Footer:** Expandable FAQ accordion ("إزاي أعرف إن مشاركتي وصلت؟", "شروط تسليم ملف الأعمال") and a dark navy social card with buttons for SYS Facebook, WhatsApp Channel, Instagram, TikTok, and Technical Support (`01007091685`).



#### B. Secret Refresh Trigger to Admin Portal:

- Implement a hidden admin trigger: if a user refreshes the page 3 times within 10 seconds (tracked via `sessionStorage`), or clicks the navbar SYS logo 5 times quickly, reveal a floating button/banner "دخول لجنة الفرز والتحكيم" that navigates to `/admin-login`.



#### C. Private Judging & Admin Login Page (`/admin-login`):

- Centered elevated white card on a dark navy background matching the reference login screen.

- SYS logo badge at the top, heading "لوحة الفرز والتحكيم — منطقة خاصة", subtitle "الصفحة دي للجنة التنظيم والتحكيم فقط. دخل بيانات الدخول عشان تفتح البيانات."

- Inputs for **البريد الإلكتروني / اسم المستخدم (Email/Username)** and **كلمة المرور (Password)** with an eye toggle ("إظهار الباسورد"), a full-width dark navy button "فتح اللوحة", and a "رجوع للرئيسية" link.

- (Note: Keep authentication clean and ready to connect to an external backend API; allow demo login using `technology.sys.2026@gmail.com` / `technology@sys#2026` for frontend preview).



#### D. Judging & Sorting Dashboard (`/dashboard`):

- **Stats Cards:** Total Finalists Registered, Evaluated Count, Pending Review Count.

- **Search & Filter:** Search bar by **Participant Code (الكود)**, Name, or National ID, plus filter by evaluation status.

- **Finalists Evaluation Table:** Clean responsive table displaying:

  - الكود (Participant Code badge)

  - الاسم بالكامل (Full Name)

  - رقم التليفون (Phone Number)

  - الرقم القومي (National ID)

  - ملف الأعمال (Button to preview/download the submitted file)

  - التقييم النهائي (Inline numeric score input 0-100 + notes input + "حفظ التقييم" button)

- **Export to Excel Button:** Prominent green button **"تصدير البيانات إلى شيت إكسيل (Export Excel)"** using `xlsx` (SheetJS) that downloads a properly formatted `.xlsx` file containing all finalist data, codes, and final evaluation scores.

- Structure all data fetching, form submissions, and auth calls inside a dedicated `src/services/api.ts` file with clear placeholder endpoints so the backend developer can easily connect the real database.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bbb3a3ef-deb2-47ae-aa66-2940a189a66e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
