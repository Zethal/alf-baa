# Alf Baa acceptance checks

Record actual results. Browser automation does not establish physical-phone compatibility.

## Automated

`npm test`: pure engine and all bundled packs. `npm run build`: strict TypeScript and production build. `npm run test:e2e`: gameplay, storage, import and accessibility in isolated Chrome. See README to add WebKit.

Covered: Bank strikes/steal/undo/score/next/final/replay; Top Ten rank 1 and 10, all ranks, total 55, duplicates and early finish; saving/resuming after reload; browser Back confirmation; JSON rejection/review/import/export/delete; Arabic reveals and language switching; 320/375/390/430/768/1024/1440/1920 widths; 200% text; keyboard focus; automated WCAG A/AA checks on five main screens in both languages.

## Desktop game check

1. Open the site. Switch English → العربية → English. Refresh and verify the chosen language remains selected.
2. Open Bank. Default 3 rounds. Name teams Red and Blue. Select 5 rounds, fill both empty slots, then return to 3. Choose Space for Round 1.
3. Start. Type Mercury → Check answer → Confirm answer. One answer is revealed; scores remain 0–0.
4. Press Wrong answer twice. Undo leaves one strike. Press Wrong twice again: exactly three strikes triggers a steal.
5. Steal successful awards Blue 1 point. Undo restores the steal at 0–0. Steal failed awards Red 1 point.
6. Next round: Blue starts with no strikes. Complete all rounds; verify final score, tie handling and replay.
7. Open Top Ten with one Science round. Hydrogen gives Team 1 one point. Neon gives Team 2 ten. Repeat Hydrogen: no additional score.
8. Find all remaining answers with the host key. Combined points total 55. Undo removes just the last reveal and score.
9. Start a new game, make one strike, refresh, Resume. The strike and Undo are retained.
10. Use Back during play. Cancel the leave dialog; the game remains intact.

## Content workflow

1. Home → Explore topics → Custom topic. Enter a topic and copy the generation request.
2. Paste `{bad}`. Check & preview must show an error.
3. Choose `examples/custom-gulf.json`. Review all six answers, their Arabic and source. The Add button stays disabled until the review box is checked.
4. Add it; find GCC members in the library; export it and select it for a Bank round.
5. Try JSON with duplicate answers/IDs, missing Arabic, unsafe URLs, 9 Top Ten answers or duplicate ranks. These are rejected.
6. Delete an imported pack via confirmation. An already-started game keeps its own copy.
7. Choose a category without content, such as Formula 1. It opens custom creation rather than claiming automatic generation.

## Physical iPhone Safari — user verification required

Use the same-Wi-Fi URL printed by the launcher or the public Pages URL after successful deployment. WebKit on Windows is not a physical Safari test.

- Test both languages, both games and a complete three-round session.
- Edit team names with the phone keyboard; inputs must remain usable.
- Rotate portrait/landscape mid-game without losing scores or clipping controls.
- Scroll in gameplay; scores should remain visible, with no Safari toolbar/safe-area overlap.
- Confirm and undo answers; double-tap to verify each answer scores only once.
- Background Safari, return, refresh, Resume.
- Copy the custom request. On LAN HTTP, clipboard APIs may be unavailable: select the displayed request manually. The HTTPS production site normally supports copying.
- If mirroring to TV, check question/score readability. The answer key is also mirrored; hide it before showing the screen.

## Android Chrome / tablet / desktop Edge

Repeat the same checks on each available device. Include keyboard, scrolling, rotation, refresh and JSON file import. Record any failure with browser/device, language, game, action, expected result and screenshot.

## Offline boundary

After the app loads, disconnect the test browser from the network and play bundled content. No gameplay action requires an AI or backend call. A fresh offline launch is not guaranteed because V1 has no service worker.
