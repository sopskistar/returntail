import type { Metadata } from 'next';
import { WorkspaceShell } from '@/components/workspace-shell';
import { WorkspaceClient } from '@/components/workspace-client';
export const metadata: Metadata = {
  title: 'Merchant workspace',
  description:
    'Track BCH purchases and review customer refund requests in your secure merchant workspace.',
  robots: { index: false, follow: false },
};
export default async function Workspace({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const refunds = (await searchParams).view === 'refunds';
  return (
    <WorkspaceShell active={refunds ? 'refunds' : 'orders'}>
      <WorkspaceClient refunds={refunds} />
    </WorkspaceShell>
  );
}
