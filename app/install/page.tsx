import type { Metadata } from 'next';
import PlainBackground from '@/components/PlainBackground';
import InstallScreen from '@/components/InstallScreen';

export const metadata: Metadata = {
  title: 'Install - Radiordle',
  description: 'Add Radiordle to your home screen for a full-screen, app-like experience on iOS Safari and Android Chrome.',
};

export default function InstallPage() {
  return (
    <div className="min-h-screen-safe relative overflow-y-auto overflow-x-hidden" style={{ minHeight: 'var(--full-vh)' }}>
      {/* Plain dark base */}
      <PlainBackground />

      {/* Content */}
      <div className="relative z-10 min-h-screen-safe flex flex-col mx-auto w-full max-w-lg" style={{ minHeight: 'var(--full-vh)' }}>
        <InstallScreen />
      </div>
    </div>
  );
}
