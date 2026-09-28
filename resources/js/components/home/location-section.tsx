import gsap from 'gsap';
import {
    useEffect,
    useRef,
    useState,
    type MouseEvent,
} from 'react';

type Language = 'ar' | 'en';

const MAP_URL =
    'https://maps.app.goo.gl/tRkdRSAkoneq1gQy6';

function PinIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.55"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
        </svg>
    );
}

function ArrowIcon({ rtl }: { rtl: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className={`h-[17px] w-[17px] ${rtl ? '' : 'rotate-180'}`}
            aria-hidden="true"
        >
            <path d="M19 12H5" />
            <path d="m11 18-6-6 6-6" />
        </svg>
    );
}

export default function LocationSection({
    language,
}: {
    language: Language;
}) {
    const isRtl = language === 'ar';

    const sectionRef = useRef<HTMLElement>(null);
    const eyebrowRef = useRef<HTMLDivElement>(null);
    const titlePrimaryRef = useRef<HTMLSpanElement>(null);
    const titleSecondaryRef = useRef<HTMLSpanElement>(null);
    const noteRef = useRef<HTMLDivElement>(null);
    const portalRef = useRef<HTMLButtonElement>(null);
    const portalGlowRef = useRef<HTMLSpanElement>(null);

    const [launching, setLaunching] = useState(false);

    useEffect(() => {
        const section = sectionRef.current;
        const eyebrow = eyebrowRef.current;
        const titlePrimary = titlePrimaryRef.current;
        const titleSecondary = titleSecondaryRef.current;
        const note = noteRef.current;
        const portal = portalRef.current;

        if (
            !section ||
            !eyebrow ||
            !titlePrimary ||
            !titleSecondary ||
            !note ||
            !portal
        ) {
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reducedMotion) {
            return;
        }

        const context = gsap.context(() => {
            gsap.set(eyebrow, {
                autoAlpha: 0,
                x: isRtl ? 18 : -18,
                filter: 'blur(5px)',
            });

            gsap.set([titlePrimary, titleSecondary], {
                autoAlpha: 0,
                y: 28,
                filter: 'blur(8px)',
            });

            gsap.set(note, {
                autoAlpha: 0,
                x: isRtl ? -18 : 18,
                scale: 0.985,
            });

            gsap.set(portal, {
                autoAlpha: 0,
                y: 22,
                scale: 0.96,
                filter: 'blur(4px)',
            });

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    gsap.timeline({
                        defaults: {
                            ease: 'power3.out',
                        },
                    })
                        .to(eyebrow, {
                            autoAlpha: 1,
                            x: 0,
                            filter: 'blur(0px)',
                            duration: 0.38,
                        })
                        .to(
                            titlePrimary,
                            {
                                autoAlpha: 1,
                                y: 0,
                                filter: 'blur(0px)',
                                duration: 0.58,
                            },
                            '-=0.14',
                        )
                        .to(
                            titleSecondary,
                            {
                                autoAlpha: 1,
                                y: 0,
                                filter: 'blur(0px)',
                                duration: 0.58,
                            },
                            '-=0.4',
                        )
                        .to(
                            note,
                            {
                                autoAlpha: 1,
                                x: 0,
                                scale: 1,
                                duration: 0.44,
                            },
                            '-=0.36',
                        )
                        .to(
                            portal,
                            {
                                autoAlpha: 1,
                                y: 0,
                                scale: 1,
                                filter: 'blur(0px)',
                                duration: 0.62,
                            },
                            '-=0.24',
                        );

                    observer.disconnect();
                },
                {
                    threshold: 0.12,
                },
            );

            observer.observe(section);

            return () => observer.disconnect();
        }, section);

        return () => context.revert();
    }, [isRtl]);

    function handlePortalMove(
        event: MouseEvent<HTMLButtonElement>,
    ) {
        if (window.innerWidth < 1024) {
            return;
        }

        const portal = portalRef.current;
        const glow = portalGlowRef.current;

        if (!portal || !glow) {
            return;
        }

        const rect = portal.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        gsap.to(glow, {
            x,
            y,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: true,
        });
    }

    function handleOpenLocation() {
        if (launching) {
            return;
        }

        setLaunching(true);

        const portal = portalRef.current;

        if (!portal) {
            window.location.href = MAP_URL;
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reducedMotion) {
            window.location.href = MAP_URL;
            return;
        }

        gsap.timeline({
            onComplete: () => {
                window.location.href = MAP_URL;
            },
        })
            .to(portal, {
                scale: 0.985,
                duration: 0.1,
                ease: 'power2.in',
            })
            .to(portal, {
                scale: 1.018,
                boxShadow:
                    '0 0 0 1px rgba(209,178,115,.28), 0 0 54px rgba(209,178,115,.18)',
                duration: 0.24,
                ease: 'power2.out',
            })
            .to(portal, {
                scale: 1,
                duration: 0.18,
                ease: 'power2.out',
            });
    }

    return (
<section
    ref={sectionRef}
    id="location"
    className="relative overflow-hidden bg-[#efeae1] py-[72px] text-[#191b18] sm:py-[88px] lg:py-24 dark:bg-[#0d0f0e] dark:text-[#f3f0e9]"
>
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-[-12%] top-[8%] h-[26rem] w-[26rem] rounded-full bg-[#b9965a]/[0.045] blur-[130px]" />
                <div className="absolute left-[6%] bottom-[-30%] h-[24rem] w-[24rem] rounded-full bg-black/[0.025] blur-[130px] dark:bg-white/[0.012]" />
            </div>

            <div className="relative mx-auto w-full max-w-[1450px] px-4 sm:px-6 lg:px-10 xl:px-14">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-end">
                    <div className="max-w-[760px]">
                        <div
                            ref={eyebrowRef}
                            className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-[#b9965a]/20 bg-[#b9965a]/[0.055] px-3 py-1.5 text-[8px] font-bold tracking-[0.12em] text-[#98733d] dark:text-[#d4b578]"
                        >
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#b9965a]/45 motion-reduce:animate-none" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#b9965a]" />
                            </span>
                            <span>{isRtl ? 'الموقع' : 'Location'}</span>
                        </div>

                        <h2 className="sl-display py-1 text-[clamp(2.15rem,3.75vw,4rem)] font-medium leading-[1.18]">
                            <span
                                ref={titlePrimaryRef}
                                className="block will-change-transform"
                            >
                                {isRtl
                                    ? 'في قلب'
                                    : 'In the heart of'}
                            </span>

                            <span
                                ref={titleSecondaryRef}
                                className="sl-location-gold-shimmer mt-1 block py-1 will-change-transform"
                            >
                                {isRtl ? 'حي المصيف' : 'Al Masif'}
                            </span>
                        </h2>
                    </div>

                    <div
                        ref={noteRef}
                        className="relative max-w-[430px] overflow-hidden rounded-full border border-black/[0.075] bg-white/34 px-5 py-3.5 dark:border-white/[0.075] dark:bg-white/[0.025]"
                    >
                        <span className="pointer-events-none absolute inset-y-0 -left-24 w-20 rotate-[15deg] bg-gradient-to-r from-transparent via-[#d6b878]/25 to-transparent animate-[slLocationNoteSweep_2.8s_linear_infinite] motion-reduce:animate-none" />
                        <span className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b9965a]/45 to-transparent" />

                        <p className="relative text-[10.5px] leading-6 text-black/46 dark:text-white/37">
                            {isRtl
                                ? 'حي المصيف، شارع أبي بكر الصديق الفرعي، الرياض'
                                : 'Al Masif, Abi Bakr As Siddiq Branch Road, Riyadh'}
                        </p>
                    </div>
                </div>

                <div className="mt-12 flex justify-center lg:mt-14">
                    <button
                        ref={portalRef}
                        type="button"
                        onMouseMove={handlePortalMove}
                        onClick={handleOpenLocation}
                        className={`sl-location-portal group relative isolate w-full max-w-[760px] overflow-hidden rounded-[999px] border border-black/[0.08] bg-white/42 px-5 py-4 text-start shadow-[0_18px_48px_rgba(31,28,23,0.06)] transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-[#b9965a]/38 hover:shadow-[0_26px_72px_rgba(31,28,23,0.12)] dark:border-white/[0.08] dark:bg-[#151715]/82 dark:shadow-[0_24px_62px_rgba(0,0,0,0.18)] sm:px-6 sm:py-5 ${
                            launching
                                ? 'pointer-events-none'
                                : ''
                        }`}
                        aria-label={
                            isRtl
                                ? 'افتح موقع سفن لوز على خرائط Google'
                                : 'Open Seven Luz in Google Maps'
                        }
                    >
                        <span
                            ref={portalGlowRef}
                            className="pointer-events-none absolute left-0 top-0 -z-10 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d2b574]/[0.13] blur-[44px]"
                        />

                        <span className="pointer-events-none absolute inset-0 -z-10 opacity-70">
                            <span className="absolute inset-y-0 left-[14%] w-px bg-gradient-to-b from-transparent via-[#b9965a]/18 to-transparent" />
                            <span className="absolute inset-y-0 right-[18%] w-px bg-gradient-to-b from-transparent via-[#b9965a]/12 to-transparent" />
                        </span>

                        <span className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b9965a]/38 to-transparent" />

                        <span className="pointer-events-none absolute inset-y-0 -left-32 w-24 rotate-[13deg] bg-gradient-to-r from-transparent via-[#e3c98c]/18 to-transparent animate-[slLocationPortalSweep_3.4s_ease-in-out_infinite] motion-reduce:animate-none" />

                        <span className="relative flex items-center gap-4 sm:gap-5">
                            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#b9965a]/30 bg-[#b9965a]/[0.08] text-[#9c7842] transition-all duration-500 group-hover:scale-105 group-hover:border-[#d0af6e]/55 group-hover:bg-[#b9965a] group-hover:text-[#171816] dark:text-[#d4b578]">
                                <span className="absolute inset-[-7px] rounded-full border border-[#b9965a]/15 animate-[slLocationOrbit_3.8s_linear_infinite] motion-reduce:animate-none">
                                    <span className="absolute left-1/2 top-[-2px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#d4b578] shadow-[0_0_14px_rgba(212,181,120,.65)]" />
                                </span>
                                <PinIcon />
                            </span>

                            <span className="min-w-0 flex-1">
                                <span className="block text-[8px] font-bold tracking-[0.12em] text-[#9d7843] dark:text-[#d1b273]">
                                    SEVEN LUZ · AL MASIF
                                </span>

                                <span className="mt-1.5 block text-[16px] font-semibold text-black/78 transition-colors duration-300 group-hover:text-[#8e6d3c] dark:text-white/82 dark:group-hover:text-[#e0c485] sm:text-[18px]">
                                    {launching
                                        ? isRtl
                                            ? 'جارٍ فتح الموقع...'
                                            : 'Opening location...'
                                        : isRtl
                                          ? 'افتح الموقع والاتجاهات'
                                          : 'Open location and directions'}
                                </span>
                            </span>

                            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#191b18] text-white transition-all duration-500 group-hover:translate-x-[-2px] group-hover:bg-[#b9965a] group-hover:text-[#171816] dark:bg-white dark:text-[#171816] dark:group-hover:bg-[#d1b273]">
                                <ArrowIcon rtl={isRtl} />
                            </span>
                        </span>

                        <span
                            className={`pointer-events-none absolute inset-0 rounded-[inherit] border transition-opacity duration-200 ${
                                launching
                                    ? 'border-[#d1b273]/55 opacity-100'
                                    : 'border-transparent opacity-0'
                            }`}
                        />
                    </button>
                </div>
            </div>

            <style>{`
                .sl-location-gold-shimmer {
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
                    animation: slLocationGoldShimmer 2.75s ease-in-out infinite;
                }

                @keyframes slLocationGoldShimmer {
                    0%, 20% { background-position: 120% 0; }
                    64%, 100% { background-position: -120% 0; }
                }

                @keyframes slLocationNoteSweep {
                    from {
                        transform: translateX(-180%) rotate(15deg);
                        opacity: 0;
                    }
                    18% {
                        opacity: 1;
                    }
                    55% {
                        opacity: .8;
                    }
                    to {
                        transform: translateX(760%) rotate(15deg);
                        opacity: 0;
                    }
                }

                @keyframes slLocationPortalSweep {
                    0%, 18% {
                        transform: translateX(-190%) rotate(13deg);
                        opacity: 0;
                    }
                    35% {
                        opacity: .9;
                    }
                    68%, 100% {
                        transform: translateX(1050%) rotate(13deg);
                        opacity: 0;
                    }
                }

                @keyframes slLocationOrbit {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .sl-location-gold-shimmer {
                        animation: none !important;
                    }
                }
            `}</style>
        </section>
    );
}
