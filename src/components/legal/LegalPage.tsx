import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export interface LegalSection {
  id: string;
  heading: string;
  body: React.ReactNode;
}

interface Props {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

/**
 * Shared reading layout for legal documents: sticky "On this page" rail with
 * a scroll-spy indicator (mirrors the Navbar's active-link underline), and a
 * content column built from the same section list — so the rail can never
 * drift out of sync with the page.
 */
export default function LegalPage({ eyebrow, title, lastUpdated, intro, sections }: Props) {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <Link
        to="/"
        className="flex items-center gap-2 text-[#A0A0C0] hover:text-white text-sm font-medium mb-6 transition-colors w-fit"
      >
        <ArrowLeft size={15} /> Back to home
      </Link>

      <div className="mb-10 max-w-2xl">
        <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-2">{eyebrow}</p>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">{title}</h1>
        <p className="text-[#A0A0C0] leading-relaxed">{intro}</p>
        <p className="text-[#6060A0] text-xs mt-3">Last updated {lastUpdated}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
        {/* On this page — scroll-spy rail */}
        <nav className="hidden lg:block sticky top-28 self-start">
          <p className="text-[#6060A0] text-[11px] font-bold tracking-widest uppercase mb-3">On this page</p>
          <ul className="space-y-1 relative border-l border-[rgba(124,58,237,0.15)]">
            {sections.map((s) => {
              const active = activeId === s.id;
              return (
                <li key={s.id} className="relative">
                  {active && (
                    <span className="absolute -left-px top-0 bottom-0 w-px bg-[#7C3AED] shadow-[0_0_8px_rgba(124,58,237,0.6)] transition-all" />
                  )}
                  <a
                    href={`#${s.id}`}
                    className={`block pl-4 py-1.5 text-sm transition-colors ${
                      active ? 'text-[#A78BFA] font-semibold' : 'text-[#6060A0] hover:text-[#A0A0C0]'
                    }`}
                  >
                    {s.heading}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile jump menu */}
        <div className="lg:hidden -mx-4 px-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-[rgba(124,58,237,0.25)] text-[#A0A0C0] hover:text-white hover:border-[rgba(124,58,237,0.45)] transition-all"
            >
              {s.heading}
            </a>
          ))}
        </div>

        {/* Content */}
        <div className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-3xl p-6 sm:p-10 space-y-10 min-w-0">
          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              ref={(el) => { sectionRefs.current[s.id] = el; }}
              className="scroll-mt-28"
            >
              <h2 className="text-white font-black text-xl mb-3">{s.heading}</h2>
              <div className="text-[#A0A0C0] text-sm leading-relaxed space-y-3">{s.body}</div>
            </section>
          ))}

          <div className="pt-6 border-t border-[rgba(124,58,237,0.15)] text-sm text-[#6060A0]">
            Questions about this document? Reach us at{' '}
            <a href="mailto:legal@fanconnectpro.com" className="text-[#A78BFA] hover:text-white transition-colors">
              legal@fanconnectpro.com
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
