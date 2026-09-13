# Delivered scope

| Requirement          | Implementation                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| Original mobile game | Original lime/ink/lilac identity, Arabic wordmark, responsive React/TypeScript                     |
| English and Arabic   | Typed dictionary, translated packs, correct lang/dir, local preference, bundled fonts              |
| Bank                 | Shared pool, three strikes, host-controlled steal, one point per round, undo, alternating starters |
| Top Ten              | Ten ranks, rank equals points, total 55, hidden answers, host confirmation, no duplicates          |
| Host controls        | Check/reveal, wrong/pass, key, steal outcomes, undo, next, early end, winner/team selection        |
| Teams and rounds     | Exactly two named teams, 3 default rounds, configurable 1–10 distinct topics                       |
| Session              | Local save/resume, undo history, leave confirmation, results, tie and replay                       |
| Content              | 20 bilingual starter packs, 54 topic suggestions, factual metadata and labelled house lists        |
| Free custom topics   | Copy request, externally create JSON, validate, host review, import/export/delete                  |
| Accessibility        | Keyboard controls, modal focus, reduced motion, contrast, responsive/RTL checks                    |
| Cost and privacy     | No accounts, payments, database, analytics, paid APIs or mandatory services                        |
| Hosting              | Static build and GitHub Pages test/build/deploy workflow                                           |
| Testing              | Engine/content checks, browser journeys, size/RTL/accessibility checks, device checklist           |
| Future integration   | Separate engine/content provider; basic web manifest; no dependency on a future backend            |

## Rule choices where the brief was open

- Clearing every Bank answer wins the round. The host may end early and choose the winner.
- Correct answers and passes alternate Top Ten turns. The host can select the team before revealing an answer. An early finish retains only earned points.
- Starting teams alternate each round. A tied final score remains a tie, without an invented tiebreaker.
- Round configuration caps at ten for V1; `MAX_ROUNDS` centralizes the limit.
- House questions explicitly ask for the selected pool; they do not claim the list is exhaustive or its order objective.
- Games and custom packs stay in the current browser. There is no cross-device sync.

## Future boundaries and manual completion

The supplied brief defers accounts, payments, online multiplayer, native apps, native casting, databases, domains and live AI generation. Those are not implemented. The manual JSON workflow works without an API. A future provider needs a server, never a client-side secret.

The web manifest is groundwork, not complete PWA installability. Service workers, install icons and wrappers remain future work. A loaded game can continue offline; fresh offline loading is not guaranteed.

Publication is complete only after an authenticated push, Pages enablement and a successful deployment. If this session cannot publish, the owner must perform the README steps in GitHub Desktop. Physical iPhone, Android and real TV-mirroring checks still require the owner's devices.
