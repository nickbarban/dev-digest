# React UI Architecture — Research Sources

Sources used to build [`.claude/skills/react-ui-architecture/`](../.claude/skills/react-ui-architecture/SKILL.md) (component folder structure, constants/utils/hooks placement, colocate-first promotion path). Duplicated here from the skill's own README for visibility outside the skills folder.

## Folder Structure / General Architecture
- [React Folder Structure Best Practices (2026) — Robin Wieruch](https://www.robinwieruch.de/react-folder-structure/) — feature-based structure walkthrough
- [bulletproof-react — project-structure.md](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md) — unidirectional dependency rules, `features/` layout
- [bulletproof-react — repo](https://github.com/alan2207/bulletproof-react) — full reference architecture
- [Project Standards — React Handbook](https://reacthandbook.dev/project-standards)
- [Popular React Folder Structures and Screaming Architecture — profy.dev](https://profy.dev/article/react-folder-structure)
- [Delightful React File/Directory Structure — Josh W. Comeau](https://www.joshwcomeau.com/react/file-structure/) — barrel-file pattern
- [Tao of React — Alex Kondov](https://alexkondov.com/tao-of-react/) — component-folder pattern, utils/hooks/api folder split
- [Clean Architecture in React — Alex Kondov](https://alexkondov.com/full-stack-tao-clean-architecture-react/)
- [How to Structure a Scalable React Project in 2026 — Chirag Mehta](https://medium.com/@chiragmehta900/how-to-structure-a-scalable-react-project-in-2026-folder-architecture-guide-5562a6280b1e)
- [How to structure your React projects — Sandro Roth](https://sandroroth.com/blog/project-structure/)
- [File Structure — legacy React docs](https://legacy.reactjs.org/docs/faq-structure.html)

## Feature-Sliced Design (further reading — not the default this repo uses)
- [Feature-Sliced Design — official docs](https://feature-sliced.design/)
- [Feature-Sliced Design — Documentation](https://feature-sliced.design/docs)
- [Building Scalable Systems with React Architecture — FSD blog](https://feature-sliced.design/blog/scalable-react-architecture)
- [Mastering React Hooks: An Architectural Guide — FSD blog](https://feature-sliced.design/blog/react-hooks-architecture)

## Component Splitting / Composition
- [When to break up a component into multiple components — Kent C. Dodds](https://kentcdodds.com/blog/when-to-break-up-a-component-into-multiple-components)
- [React components composition: how to get it right — Developer Way](https://www.developerway.com/posts/components-composition-how-to-get-it-right)
- [Techniques for decomposing React components — David Tang, DailyJS](https://medium.com/dailyjs/techniques-for-decomposing-react-components-e8a1081ef5da)
- [Common Sense Refactoring of a Messy React Component — Alex Kondov](https://alexkondov.com/refactoring-a-messy-react-component/)

## Business Logic: Hooks vs Components
- [Reusing Logic with Custom Hooks — React docs](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Separation of concerns with React hooks — Felix Gerschau](https://felixgerschau.com/react-hooks-separation-of-concerns/)
- [Path To A Clean(er) React Architecture (Part 6) — Business Logic Separation — profy.dev](https://profy.dev/article/react-architecture-business-logic-and-dependency-injection)
- [Decoupling Business Logic from UI with Custom React Hooks — eMoosavi](https://www.emoosavi.com/blog/decoupling-business-logic-from-ui-with-custom-react-hooks)

## State Colocation
- [State Colocation will make your React app faster — Kent C. Dodds](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)
- [Colocation — Kent C. Dodds](https://kentcdodds.com/blog/colocation)
- [Application State Management with React — Kent C. Dodds](https://kentcdodds.com/blog/application-state-management-with-react)

## Constants
- [How to Add a Constants File to Your React Project — Austin Paley](https://medium.com/@austinpaley32/how-to-add-a-constants-file-to-your-react-project-6ce31c015774)
- [Tips to Use Constants File in TypeScript — DEV Community](https://dev.to/amirfakour/tips-to-use-constants-file-in-typescript-27je)
- [How to Improve Your ReactJS Code with Constants — Bomberbot](https://www.bomberbot.com/reactjs/how-to-improve-your-reactjs-code-with-constants-an-expert-guide/)

## Utils vs Helpers vs `lib/`
- [Are utils a code smell? — DEV Community](https://dev.to/noway/are-utils-folder-where-you-put-random-stuff-you-don-t-know-where-to-put-otherwise-a-code-smell-3054)
- [Utils files are not so useful and helper classes are not so helpful — DEV Community](https://dev.to/dvddpl/utils-files-are-not-so-useful-and-helper-classes-are-not-so-helpful-1kfn)
- [Understanding the Role of libs and utils in a Next.js 15 Project — Khairul Muhtadin](https://khaisastudio.medium.com/understanding-the-role-of-libs-and-utils-in-a-next-js-15-project-b1c0368ef044)
