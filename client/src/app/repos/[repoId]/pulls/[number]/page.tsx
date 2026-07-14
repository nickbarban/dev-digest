import { PrDetailView } from "./_components/PrDetailView";

/* Route: /repos/:repoId/pulls/:number. Thin route entry — the view, its tabs,
   header, and the trace drawer are colocated under _components/. */
export default function PRDetailPage() {
  return <PrDetailView />;
}
