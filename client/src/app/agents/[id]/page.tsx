import { AgentDetailView } from "./_components/AgentDetailView";

/* Route: /agents/:id. Thin route entry — the agent list rail, the editor
   tabs, and their styles/constants are colocated under _components/. */
export default function AgentEditorPage() {
  return <AgentDetailView />;
}
