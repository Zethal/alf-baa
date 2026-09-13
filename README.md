# ألف باء · Alf Baa

An original mobile-first Arabic/English party trivia game. One phone, one host, two teams. React + strict TypeScript + Vite. No accounts, payments, database, analytics or AI API required.

## Open the finished local build

In this project's folder, double-click **START-ALF-BAA.cmd**. Open **http://localhost:4173**. Keep the server window open. If it is already running, use the existing browser page. The launcher can use the Node runtime bundled with Codex when Node is not separately installed.

This launcher serves an existing `dist/` build; it does not rebuild source edits. A fresh clone needs the setup/build steps below.

## Windows setup and editing

1. Install the free **Node.js LTS Windows installer** from [nodejs.org](https://nodejs.org/en/download), keeping the defaults. Node 24 LTS is recommended; minimum supported is 22.12.
2. In GitHub Desktop choose **Repository → Show in Explorer**.
3. Click Explorer's address bar, type **powershell**, and press Enter.
4. Run each command separately:

```powershell
node --version
npm.cmd ci
npm.cmd run dev
```

Open **http://localhost:5173**. Save source edits to update the development site. `npm.cmd` avoids Windows PowerShell's common `npm.ps1` policy error. Stop a server using **Ctrl+C**.

To test and rebuild the finished app:

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run serve
```

The build creates `dist/`; the production server opens on port 4173. Do not double-click `index.html`; JavaScript modules need a web server.

For browser tests with installed Google Chrome:

```powershell
npm.cmd run build
npm.cmd run test:e2e
```

For WebKit too:

```powershell
npx.cmd playwright install webkit
$env:ALF_WEBKIT="1"
npm.cmd run test:e2e
```

Tests use isolated browser profiles. WebKit on Windows gives useful Safari-engine coverage; it is not a physical iPhone test.

## Test on your iPhone now

1. Put the computer and iPhone on the same trusted Wi-Fi.
2. Start the launcher. Copy the terminal's **Phone on the same Wi-Fi: http://...:4173** address into Safari. Do not use localhost on the phone.
3. If Windows asks to allow Node through the firewall, allow **Private networks** for your home network. Do not turn the firewall off.
4. If connection fails, check Wi-Fi/VPN and guest-network device isolation. The public Pages URL is an alternative after deployment.
5. Repeat in Android Chrome if available. Test portrait, landscape, keyboard input, scrolling, both games, undo and refresh/resume.

Browser storage is device- and address-specific. A localhost session does not automatically transfer to your phone or the public site. Export/import custom JSON packs to move them.

## Publish on free GitHub Pages

1. Open [this repository's Pages settings](https://github.com/Zethal/alf-baa/settings/pages).
2. Under **Build and deployment → Source**, select **GitHub Actions**. The workflow is already included; do not create another template.
3. In GitHub Desktop, if Changes still lists files, enter **Build Alf Baa bilingual party game** in Summary and click **Commit to main**. If the work is already committed locally, continue.
4. Click **Push origin**.
5. Open [Actions](https://github.com/Zethal/alf-baa/actions), then **Test and deploy Alf Baa**. Wait for **build** and **deploy** to turn green.
6. Open **https://zethal.github.io/alf-baa/** on the computer and phone.

This is the expected public URL, not a claim that deployment has finished. A green deployment and working public page confirm publication. If the workflow ran before Pages was enabled, use **Actions → Test and deploy Alf Baa → Run workflow → main → Run workflow** afterward.

Every push to main checks and redeploys the app. V1 needs no domain purchase, API keys or paid hosting. Relative paths support `/alf-baa/`. See [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [Vite deployment](https://vite.dev/guide/static-deploy).

## Included gameplay

- Full Arabic and English, correct RTL/LTR, language preference, locally bundled Arabic and Latin fonts.
- Two named teams, 3 default rounds, 1–10 configurable rounds, a different topic each round.
- **Bank:** one shared answer pool; 3 strikes; host-judged steal; exactly 1 point for the winner; alternating round starters; clear-all automatic win; manual early round award.
- **Top Ten:** exactly 10 ranks; rank 1 = 1 point, rank 10 = 10 points; total 55; alternating turns after an answer/pass; host team selection; duplicate guard; early finish retains earned points only.
- Host key with mirror-screen warning, exact bilingual answer lookup, explicit confirmation, source details, next round, final scores, ties and replay.
- Last 120 valid actions can be undone, including strikes, steals, awards and round changes. Games save locally and can resume after refreshing. Leaving play asks for confirmation.
- 20 bilingual starter packs and 54 topic suggestions. Suggestions without content open custom creation, not a fake generator.
- Custom topic → copy AI request → paste/upload JSON → validate → host review → import. Export and delete custom packs. Try `examples/custom-gulf.json`.
- Keyboard navigation, dialog focus containment, reduced motion, safe-area padding and mobile/desktop/wide-screen layouts.

Most entertainment packs are explicitly labelled **house lists**: selected pools and subjective rankings, not surveys, official rankings or exhaustive categories. Factual starter lists provide scope, dates and sources: [NASA](https://science.nasa.gov/solar-system/planets/), [GCC](https://www.gcc-sg.org/en/AboutUs/Pages/default.aspx), [IUPAC](https://iupac.org/what-we-do/periodic-table-of-elements/) and [Pixar](https://www.pixar.com/feature-films).

Validation checks JSON structure, both languages, unique IDs/answers/aliases/ranks, HTTP(S) source URLs and limits. It cannot establish factual truth; the host reviews facts and Arabic before adding. Limits: 150 KB per import, 40 custom packs, 3–40 Bank answers, exactly 10 Top Ten answers.

## Code map and future work

```text
src/components/    Screens and reusable controls
src/domain/        Pure game engine, constants, validation, content provider
src/data/          Bundled question packs and category suggestions
src/localization/  Typed Arabic/English strings and language context
src/lib/           Defensive browser storage
src/tokens.css     Shared design tokens
e2e/               Browser gameplay and accessibility tests
examples/          Importable JSON example
scripts/           Dependency-free local production server
.github/workflows/ Test, build and Pages deployment
```

The engine consumes validated packs independently of their provider. `src/domain/provider.ts` implements manual generation/import. A future server provider can return the same schema. A ChatGPT session is not an API, and no connection is simulated. Keep tokens and `.env` files out of Git. Never put a secret in client code or `VITE_*` variables. A future AI provider needs a server route; GitHub Pages cannot execute it.

Once the app loads, gameplay requires no network. Fresh offline launch is not guaranteed: there is no service worker in V1. The basic manifest is groundwork, not a claim of complete PWA installability. Raster install icons, service workers, native wrappers, database, paid packs, accounts and online multiplayer remain future work.

Device screen mirroring can display the game, but no native casting/TV app is built. Showing the answer key also shows it on the mirrored TV.

## Troubleshooting

- **Blank page:** use the server URL, rebuild and read the first error.
- **Node/npm missing:** install Node LTS and reopen PowerShell.
- **Port already used:** open the existing page or stop the previous terminal with Ctrl+C.
- **JSON rejected:** remove Markdown fences, use both languages and a unique `custom-...` ID, and check ranks. Try the sample first.
- **Saving fails:** private browsing/full storage/restrictions may prevent saving. A message appears. Export your important packs.
- **Pages 404:** check Source is GitHub Actions, the deploy is green, and the URL includes `/alf-baa/`.
- **Action failed:** open the failed step and report the first actual error line.

Detailed game/device checks and scope boundaries are in `docs/TESTING.md` and `docs/REQUIREMENTS.md`.
