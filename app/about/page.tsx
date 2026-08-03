import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PlainBackground from '@/components/PlainBackground';
import AboutFeedbackButton from '@/components/AboutFeedbackButton';
import LegalModals from '@/components/LegalModals';

export const metadata: Metadata = {
  title: 'About - Radiordle',
  description: 'Learn about Radiordle, the daily radiology puzzle game designed for medical students, radiology residents, and healthcare professionals.',
};

/**
 * Glass content card used across the About screen (design foundation:
 * radiordle-screens.jsx `AboutCard`). Flat translucent white wash + a light
 * blur + hairline border — reads as glass while staying cheap.
 */
function AboutCard({ title, children }: { title: string; children: ReactNode }) {
  // Flat translucent fill (no backdrop-blur) so the long, scrolling About page
  // stays smooth — the glow background behind it is dark enough to read as glass.
  return (
    <section className="rounded-2xl p-6 sm:p-7 bg-white/[0.06] border border-white/10">
      <h2 className="text-2xl text-white font-baloo-2 font-bold mb-4">{title}</h2>
      <div className="space-y-3 text-white/85 leading-relaxed">{children}</div>
    </section>
  );
}

const HOW_TO_PLAY = [
  'View the medical image and make your best diagnosis guess',
  'After each incorrect guess, a new hint is revealed to help narrow down the diagnosis',
  'You have 5 attempts to guess the correct diagnosis',
  'Share your results and compare with colleagues!',
];

// Team roles from the redesign prototype — placeholder bios; replace with real
// details before this ships to production.
const TEAM = [
  {
    role: 'Founder & Puzzle Creator',
    job: 'MS4 at McGovern',
    bio: 'Curates the daily cases and writes the hints that make each puzzle click.',
  },
  {
    role: 'Tech & Development',
    job: 'Dev @ X',
    bio: 'Builds and maintains the app, from the guessing engine to the daily release pipeline.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen-safe relative overflow-y-auto overflow-x-hidden" style={{ minHeight: 'var(--full-vh)' }}>
      {/* Plain dark base */}
      <PlainBackground />

      {/* Content */}
      <div className="relative z-10 min-h-screen-safe flex flex-col" style={{ minHeight: 'var(--full-vh)' }}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-baloo-2 font-bold bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Game
          </Link>

          <div className="flex items-center gap-1 drop-shadow-[0_6px_20px_rgba(0,0,0,0.6)]">
            <div className="relative w-11 h-11 sm:w-14 sm:h-14">
              <Image src="/radle_icon.svg" alt="Radiordle Icon" fill className="object-contain" />
            </div>
            <span className="text-2xl sm:text-3xl text-white font-baloo-2 font-extrabold tracking-tight">
              Radiordle
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center px-4 py-6 sm:py-8">
          <div className="w-full max-w-2xl space-y-5">
            <AboutCard title="About Radiordle">
              <p>
                Radiordle is a daily radiology puzzle game inspired by Wordle. Each day, players are presented with a medical imaging case and must guess the correct diagnosis.
              </p>
              <p>
                New puzzles are released daily at midnight EST, featuring a variety of imaging modalities including X-rays, CT scans, MRIs, and ultrasounds.
              </p>
            </AboutCard>

            <AboutCard title="How to Play">
              <ol className="space-y-3">
                {HOW_TO_PLAY.map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="font-bold text-accent">{i + 1}.</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </AboutCard>

            <AboutCard title="Meet the Team">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {TEAM.map((member) => (
                  <div
                    key={member.role}
                    className="flex flex-col items-center text-center rounded-xl p-5 bg-white/[0.04] border border-white/[0.08]"
                  >
                    <div className="flex items-center justify-center rounded-full mb-3.5 w-[104px] h-[104px] bg-white/[0.06] border border-dashed border-white/[0.22]">
                      <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    </div>
                    <h3 className="font-baloo-2 font-extrabold text-white leading-tight text-lg">{member.role}</h3>
                    <p className="font-semibold mb-2.5 text-accent-light text-sm">{member.job}</p>
                    <p className="text-white/70 text-sm leading-relaxed">{member.bio}</p>
                  </div>
                ))}
              </div>
            </AboutCard>

            <AboutCard title="Contact & Contribute">
              <p>Have feedback, suggestions, or found a bug? We would love to hear from you!</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <a
                  href="https://github.com/kishanasokan/Radwordle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold bg-[#24292e] hover:bg-[#3a3f44] transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  GitHub Repository
                </a>
                <AboutFeedbackButton />
              </div>
            </AboutCard>

            <AboutCard title="Image Sources & Credits">
              <p>
                All medical images used in Radiordle are sourced from open-source or free-use collections and are used in accordance with their respective licenses. We are grateful to the medical imaging community for making educational resources freely available.
              </p>
            </AboutCard>

            {/* Disclaimer — quieter card */}
            <section className="rounded-2xl p-6 bg-white/[0.04] border border-white/10">
              <h2 className="text-xl text-white font-baloo-2 font-bold mb-3">Disclaimer</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Radiordle is designed for entertainment and general educational interest only and does not provide medical advice. Users should consult a qualified healthcare professional for medical concerns. All images used are sourced from open-source or free-use collections and are used in accordance with their licenses.
              </p>
            </section>

            {/* Legal (Terms / Privacy) */}
            <LegalModals />

            <p className="text-white/45 text-center text-xs font-baloo-2 py-4">
              © {new Date().getFullYear()} Radiordle. For educational and entertainment purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
