/* diff-viewer — unified-diff viewer with optional inline GitHub comments.
   Public surface: the DiffViewer component + the DiffCommentApi contract.

   Deliberate exception to the "colocate first, promote on 2nd consumer" rule
   (react-ui-architecture skill): DiffTab is the only real route consumer, but
   this stays in the shared components/ tree — not nested under DiffTab's
   _components/ — because src/test/smoke.test.tsx exercises it directly as a
   patch-parsing unit test, and route-private folders shouldn't be reached
   into from outside their route. Revisit if a second real UI consumer shows
   up; the smoke test alone doesn't justify keeping it here forever. */
export { DiffViewer } from "./DiffViewer";
export type { DiffCommentApi } from "./comments";
