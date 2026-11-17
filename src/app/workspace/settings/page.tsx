import type { Metadata } from 'next';
import { WorkspaceShell } from '@/components/workspace-shell';
import { StoreSettings } from '@/components/workspace-client';
export const metadata: Metadata = {
  title: 'Store and wallet settings',
  description: 'Configure your merchant store and BCH public receiving key.',
  robots: { index: false, follow: false },
};
export default function Settings() {
  return (
    <WorkspaceShell active="settings">
      <StoreSettings />
    </WorkspaceShell>
  );
}
