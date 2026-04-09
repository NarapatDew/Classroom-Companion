# Classroom Companion

**Tagline:** Google Classroom, made simpler.

Classroom Companion is a third-party React + TypeScript + Vite app that helps students and instructors use Google Classroom with a cleaner workflow and easier-to-read dashboards.

> Disclaimer: Classroom Companion is an independent third-party tool and is not affiliated with, endorsed by, or sponsored by Google.

## What This App Does

- Connects to Google Classroom using OAuth
- Brings courses, coursework, submissions, and roster data into one interface
- Highlights actionable insights (missing work, at-risk students, assignment performance)
- Speeds up follow-up messaging and day-to-day classroom operations

## Core Product Principles

- **Clarity first**: show the most important actions and metrics without noise
- **Action over data dump**: every dashboard block should help users decide what to do next
- **Companion, not replacement**: this app extends Google Classroom workflows, not replaces them
- **Consistent language**: use the same UI terms across student and instructor views

## UI Identity Recommendations

### Color System (Suggested)

- **Primary**: Emerald (`#059669`) for key actions and positive workflow states
- **Primary Dark**: Emerald deep (`#047857`) for emphasis and hover states
- **Accent**: Orange (`#EA580C`) for highlights and section identity
- **Warning**: Amber (`#F59E0B`) for late/needs-attention states
- **Danger**: Red (`#DC2626`) for missing/at-risk states
- **Neutral**: Slate/Gray range for content structure and readability

### UI Vocabulary (Suggested Standards)

Use these labels consistently to make the product feel like one system:

- **Student side**
  - `Student Workspace`
  - `Overall Progress`
  - `Upcoming Work`
  - `On Track` / `Needs Attention`
- **Instructor side**
  - `Instructor Workspace`
  - `Rapid Follow-up`
  - `Submission Status`
  - `Assignment Performance`
  - `At-Risk Students`

## Quick Start

### Installation

```bash
npm install
```

### Environment Setup

1. Create a `.env` file in the root directory:
```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

2. Get your Google OAuth Client ID from [Google Cloud Console](https://console.cloud.google.com/)

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Google OAuth Configuration

**Important:** If you're deploying to Vercel and encountering `redirect_uri_mismatch` errors, see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed setup instructions.

**สำคัญ:** หากคุณกำลัง deploy ไปที่ Vercel และพบข้อผิดพลาด `redirect_uri_mismatch` ดู [GOOGLE_OAUTH_SETUP_TH.md](./GOOGLE_OAUTH_SETUP_TH.md) สำหรับคำแนะนำภาษาไทย

Quick fix / วิธีแก้ไขเร็ว:
1. เพิ่ม URL ของ Vercel ใน Google Cloud Console ในส่วน **Authorized JavaScript origins** และ **Authorized redirect URIs**
2. ตรวจสอบว่า `VITE_GOOGLE_CLIENT_ID` ถูกตั้งค่าใน Vercel environment variables แล้ว
3. รอสักครู่ (5-10 นาที) เพื่อให้การเปลี่ยนแปลงมีผล

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
