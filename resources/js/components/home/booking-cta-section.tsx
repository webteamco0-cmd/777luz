import gsap from 'gsap';
import { useEffect, useRef } from 'react';

type Language = 'ar' | 'en';

export default function BookingCtaSection({ language }: { language: Language }) {
    const isRtl = language === 'ar';
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const copyRef = useRef<HTMLParagraphElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const title = titleRef.current;
        const copy = copyRef.current;
        const actions = actionsRef.current;

        if (!section || !title || !copy || !actions) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const ctx = gsap.context(() => {
            gsap.set([title, copy, ...Array.from(actions.children)], {
                autoAlpha: 0,
                y: 24,
                filter: 'blur(6px)',
            });

            const observer = new IntersectionObserver(([entry]) => {
                if (!entry.isIntersecting) return;

                gsap.timeline({ defaults: { ease: 'power3.out' } })
                    .to(title, {
                        autoAlpha: 1,
                        y: 0,
                        filter: 'blur(0px)',
                        duration: 0.65,
                    })
                    .to(
                        copy,
                        {
                            autoAlpha: 1,
                            y: 0,
                            filter: 'blur(0px)',
                            duration: 0.45,
                        },
                        '-=0.36',
                    )
                    .to(
                        Array.from(actions.children),
                        {
                            autoAlpha: 1,
                            y: 0,
                            filter: 'blur(0px)',
                            duration: 0.4,
                            stagger: 0.08,
                        },
                        '-=0.22',
                    );

                observer.disconnect();
            }, { threshold: 0.18 });

            observer.observe(section);
            return () => observer.disconnect();
        }, section);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="book"
            className="relative overflow-hidden bg-[#ebe6dc] py-20 text-[#191b18] sm:py-24 dark:bg-[#0b0d0c] dark:text-[#f3f0e9]"
        >
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b9965a]/[0.055] blur-[145px]" />

            <div className="relative mx-auto w-full max-w-[1450px] px-4 sm:px-6 lg:px-10 xl:px-14">
                <div className="mx-auto w-full max-w-[1120px]">
                    <div className="relative overflow-hidden rounded-[30px] border border-black/[0.08] bg-white/38 px-5 py-10 text-center shadow-[0_28px_80px_rgba(31,28,23,0.07)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#141614]/78 dark:shadow-[0_32px_90px_rgba(0,0,0,0.24)] sm:rounded-[36px] sm:px-10 sm:py-14 lg:px-16">
                        <span className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-gradient-to-r from-transparent via-[#b9965a]/45 to-transparent" />
                        <span className="pointer-events-none absolute -left-28 top-0 h-full w-20 rotate-[14deg] bg-gradient-to-r from-transparent via-[#e0c481]/14 to-transparent animate-[slCtaSweep_4.6s_ease-in-out_infinite] motion-reduce:animate-none" />

                        <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-[#b9965a]/20 bg-[#b9965a]/[0.055] px-3 py-1.5 text-[8px] font-bold tracking-[0.12em] text-[#98733d] dark:text-[#d4b578]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#b9965a]" />
                            <span>{isRtl ? 'جاهز لإقامتك' : 'Ready for your stay'}</span>
                        </div>

                        <h2
                            ref={titleRef}
                            className="sl-display mx-auto max-w-[860px] text-[clamp(2.7rem,5vw,5.65rem)] font-medium leading-[1.08]"
                        >
                            <span className="block pb-[0.08em] pt-[0.08em]">
                                {isRtl ? 'إقامتك تبدأ' : 'Your stay starts'}
                            </span>
                            <span className="sl-cta-gold mt-1 block pb-[0.08em] pt-[0.08em]">
                                {isRtl ? 'بخطوة واحدة' : 'with one simple step'}
                            </span>
                        </h2>

                        <p
                            ref={copyRef}
                            className="mx-auto mt-5 max-w-[620px] text-[11px] leading-7 text-black/48 sm:text-[12px] dark:text-white/38"
                        >
                            {isRtl
                                ? 'اختر نوع الوحدة والتاريخ المناسب وسنكمل معك رحلة الحجز بشكل واضح وسريع'
                                : 'Choose your apartment type and dates and continue through a clear direct booking journey'}
                        </p>

                        <div
                            ref={actionsRef}
                            className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
                        >
                            <a
                                href="#rooms"
                                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#191b18] px-6 py-3.5 text-[10px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a9844c] active:-translate-y-0.5 active:bg-[#a9844c] focus-visible:-translate-y-0.5 focus-visible:bg-[#a9844c] sm:w-auto sm:min-w-[180px] dark:bg-white dark:text-[#171816] dark:hover:bg-[#d1b273] dark:active:bg-[#d1b273] dark:focus-visible:bg-[#d1b273]"
                            >
                                {isRtl ? 'استكشف الوحدات' : 'Explore apartments'}
                            </a>

                            <a
                                href="tel:+966546230519"
                                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-black/[0.1] bg-white/40 px-6 py-3.5 text-[10px] font-semibold text-black/72 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#b9965a]/35 hover:text-[#8f6d3b] active:-translate-y-0.5 active:border-[#b9965a]/35 active:text-[#8f6d3b] focus-visible:-translate-y-0.5 focus-visible:border-[#b9965a]/35 focus-visible:text-[#8f6d3b] sm:w-auto sm:min-w-[180px] dark:border-white/[0.1] dark:bg-white/[0.035] dark:text-white/72 dark:hover:text-[#dec182] dark:active:text-[#dec182] dark:focus-visible:text-[#dec182]"
                            >
                                {isRtl ? 'اتصل للحجز' : 'Call to book'}
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .sl-cta-gold {
                    background: linear-gradient(
                        105deg,
                        #a47f48 0%,
                        #a47f48 34%,
                        #f0d8a1 46%,
                        #fff8e9 50%,
                        #d4b273 54%,
                        #a47f48 66%,
                        #a47f48 100%
                    );
                    background-size: 230% 100%;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    animation: slCtaGold 2.75s ease-in-out infinite;
                }

                @keyframes slCtaGold {
                    0%, 20% { background-position: 120% 0; }
                    64%, 100% { background-position: -120% 0; }
                }

                @keyframes slCtaSweep {
                    0%, 18% {
                        transform: translateX(-160%) rotate(14deg);
                        opacity: 0;
                    }
                    34% { opacity: .9; }
                    68%, 100% {
                        transform: translateX(1450%) rotate(14deg);
                        opacity: 0;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .sl-cta-gold {
                        animation: none !important;
                    }
                }
            `}</style>
        </section>
    );
}
