# Hero Prototype Interpreter

A GitHub-ready Next.js workshop tool that turns four wordless Hero's Journey poster photos into:

- an AI interpretation bridge from visual metaphor to feature concept
- a clickable responsive web prototype with exactly four screens

The model returns structured JSON only. The app validates the JSON server-side and renders it through fixed React components, so generated React/HTML is never executed.

## Stack

- Next.js App Router
- TypeScript
- React
- Plain CSS in `app/globals.css`
- Zod runtime validation
- Google Gemini REST API via `app/api/generate/route.ts`
- Private Vercel Blob storage for generated prototype submissions
- No database or user accounts

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

On Windows PowerShell, if `npm` is blocked by execution policy, use `npm.cmd`:

```bash
npm.cmd install
npm.cmd run dev
```

## Environment Variables

```bash
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-2.5-flash
MOCK_GEMINI=false
ADMIN_URL_KEY=replace-with-a-long-random-value
BLOB_STORE_ID=added_by_vercel
BLOB_WEBHOOK_PUBLIC_KEY=added_by_vercel
```

- `GEMINI_API_KEY` is required for live Gemini calls.
- `GEMINI_MODEL` is optional. The default is `gemini-2.5-flash`.
- `MOCK_GEMINI=true` runs the full UI with a realistic hardcoded prototype and no API key.
- `ADMIN_URL_KEY` is the private, URL-safe key used for the facilitator gallery route.
- `BLOB_STORE_ID` and `BLOB_WEBHOOK_PUBLIC_KEY` are added automatically after connecting a private Vercel Blob store. On Vercel, the Blob SDK uses the deployment's ambient OIDC credential; `BLOB_WEBHOOK_PUBLIC_KEY` is reserved for verifying client-upload callbacks.
- `BLOB_READ_WRITE_TOKEN` can still be set for local development or older Blob integrations.

The API key is read only in the server route and is never exposed to the client.

## Facilitator Submission Gallery

Every successful live or mock generation is saved automatically as an immutable JSON document. The saved submission contains the generated interpretation and four-screen prototype, but not the uploaded poster photos or raw Gemini response.

Open the facilitator gallery at:

```text
/admin/<ADMIN_URL_KEY>
```

The gallery is read-only and lists submissions by feature name and timestamp. The URL is excluded from search indexing, but it is not a substitute for authenticated access: anyone who knows the complete URL can open it.

For local development, submissions are written to `.data/submissions`, and the default gallery URL is `/admin/local-admin` when `ADMIN_URL_KEY` is omitted.

## Workshop Flow

1. Start from the landing page.
2. Enter only a short feature name.
3. Upload four poster photos, one for each stage:
   - Call to Adventure
   - Crossing the Threshold
   - Seizing the Sword
   - Hero's Reward
4. Generate the interpretation and prototype.
5. Click through the four generated screens and compare the interpretation against the original posters.

Images are compressed in the browser before being sent to the server. Previews and results are stored only in `sessionStorage`.

## Mock Mode

Use mock mode when developing without a Gemini API key:

```bash
MOCK_GEMINI=true
npm run dev
```

The upload flow still requires four images so the workshop behavior remains realistic.

## Deploy To Vercel

1. Push this project to GitHub.
2. Import the repo into Vercel.
3. Add `GEMINI_API_KEY` in Project Settings -> Environment Variables.
4. Create a private Vercel Blob store and connect it to the project.
5. Add a long, URL-safe `ADMIN_URL_KEY` in Project Settings -> Environment Variables.
6. Optionally set `GEMINI_MODEL`.
7. Deploy.

The app uses private Blob storage rather than a database and is designed for typical workshop-scale traffic.

## Known Limitations

- Very large or unusual image formats may need to be cropped or converted before upload.
- Browser session storage has a quota, so previews are compressed and session-only.
- The fallback prototype is intentionally generic and should be used for continuity, not as a real interpretation.
- The app validates structure, but visual interpretation quality depends on the uploaded poster photos and model behavior.
- Gemini is run in JSON mode and the app performs strict local validation. The full app schema is not sent as a constrained decoding schema because Gemini may reject complex nested schemas during serving.

## Future Enhancements

- Add optional export to PDF for workshop recap.
- Add a facilitator view comparing teams side by side.
- Add a retry button that keeps the same four posters.
- Add richer component variants while keeping the renderer fixed and safe.
