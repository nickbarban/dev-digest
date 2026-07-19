import { PullsListView } from "./_components/PullsListView";

/* Route: /repos/:repoId/pulls. Thin route entry — the view, its filter bar,
   row component, styles, constants and helpers are colocated under
   _components/ (PullsListView + siblings share constants.ts/helpers.ts/styles.ts
   at this route root, same as the diff-viewer group). */
export default function PullsPage() {
  return <PullsListView />;
}
