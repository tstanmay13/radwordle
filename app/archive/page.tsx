import Link from 'next/link';
import Image from 'next/image';
import PlainBackground from '@/components/PlainBackground';
import ArchiveBrowser from '@/components/ArchiveBrowser';

export default function ArchivePage() {
  return (
    <div className="min-h-screen-safe relative overflow-y-auto overflow-x-hidden" style={{ minHeight: 'var(--full-vh)' }}>
      {/* Plain dark base */}
      <PlainBackground />

      {/* Content */}
      <div className="relative z-10 min-h-screen-safe flex flex-col" style={{ minHeight: 'var(--full-vh)' }}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6">
          {/* Back Button */}
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-white rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] transition-colors flex-shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>

          {/* Logo and Title - Centered, clickable to return home */}
          <Link href="/" className="flex items-center gap-1 drop-shadow-[0_6px_20px_rgba(0,0,0,0.6)] hover:opacity-90 transition-opacity">
            <div className="relative w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0">
              <Image
                src="/radle_icon.svg"
                alt="Radiordle Icon"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-[3.375rem] text-white font-baloo-2 font-extrabold tracking-tight">
              Radiordle
            </h1>
          </Link>

          {/* Spacer for centering */}
          <div className="w-10 sm:w-12"></div>
        </div>

        {/* Archive Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl text-white font-bold font-baloo-2">Archive</h2>
          <p className="text-white/60 mt-2 font-baloo-2">Play any past puzzle!</p>
        </div>

        {/* Archive Browser */}
        <div className="flex-1 px-4 pb-20">
          <ArchiveBrowser />
        </div>
      </div>
    </div>
  );
}
