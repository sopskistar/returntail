import type { Metadata } from 'next';
import { WorkspaceShell } from '@/components/workspace-shell';
import { OrderClient } from '@/components/order-client';
export const metadata: Metadata = {
  title: 'Purchase resolution',
  description:
    'Review a BCH purchase, customer refund requests, wallet authorizations and settlement evidence.',
  robots: { index: false, follow: false },
};
export default async function Order({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <WorkspaceShell>
      <OrderClient id={id} merchant />
    </WorkspaceShell>
  );
}
