import type { Metadata } from 'next';
import { WorkspaceShell } from '@/components/workspace-shell';
import { NewOrder } from '@/components/workspace-client';
export const metadata: Metadata = {
  title: 'New payment request',
  description:
    'Create a real, private BCH merchant payment request with a unique receiving address.',
  robots: { index: false, follow: false },
};
export default async function New({
  searchParams,
}: {
  searchParams: Promise<{ correctedFrom?: string }>;
}) {
  const { correctedFrom } = await searchParams;
  return (
    <WorkspaceShell>
      <NewOrder correctedFrom={correctedFrom} />
    </WorkspaceShell>
  );
}
