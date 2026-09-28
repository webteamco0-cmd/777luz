import gsap from 'gsap';
import { useEffect, useRef, type ReactNode } from 'react';

type Language = 'ar' | 'en';

type Amenity = {
    id: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    icon: ReactNode;
};

function BellIcon() {
    return (
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" aria-hidden="true">
            <path d="M24 9v5M20 9h8M13 31.5c1-7.4 4.6-11.2 11-11.2s10 3.8 11 11.2H13Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 36h28" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    );
}

function WifiIcon() {
    return (
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" aria-hidden="true">
            <path d="M9 18.5c8.7-7.2 21.3-7.2 30 0M15 24.6c5.2-4.1 12.8-4.1 18 0M21 30.4c1.8-1.3 4.2-1.3 6 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="24" cy="35.2" r="1.7" fill="currentColor" />
        </svg>
    );
}

function CarIcon() {
    return (
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" aria-hidden="true">
            <path d="M13 30.5 16.5 20h15L35 30.5M11 30.5h26v7H11v-7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M16 37.5v2M32 37.5v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="17" cy="33.8" r="1.4" fill="currentColor" />
            <circle cx="31" cy="33.8" r="1.4" fill="currentColor" />
        </svg>
    );
}

function SparkleIcon() {
    return (
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" aria-hidden="true">
            <path d="M24 9c1.3 7.1 5.3 11.1 12.4 12.4C29.3 22.7 25.3 26.7 24 33.8 22.7 26.7 18.7 22.7 11.6 21.4 18.7 20.1 22.7 16.1 24 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M36.5 31c.6 3.3 2.5 5.2 5.8 5.8-3.3.6-5.2 2.5-5.8 5.8-.6-3.3-2.5-5.2-5.8-5.8 3.3-.6 5.2-2.5 5.8-5.8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
    );
}

function KitchenIcon() {
    return (
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" aria-hidden="true">
            <path d="M14 10v28M10 10v9c0 4 8 4 8 0v-9M31 10v28M27 10c0 7.5 8 9 8 0v28" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function WasherIcon() {
    return (
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" aria-hidden="true">
            <rect x="12" y="8" width="24" height="32" rx="3" stroke="currentColor" strokeWidth="1.7" />
            <circle cx="24" cy="27" r="8" stroke="currentColor" strokeWidth="1.7" />
            <path d="M17 14h.01M22 14h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    );
}

const amenities: Amenity[] = [
    {
        id: 'reception',
        titleAr: 'استقبال متواصل',
        titleEn: 'Reception service',
        descriptionAr: 'فريق حاضر لمساعدتك وجعل الوصول والإقامة أكثر سهولة',
        descriptionEn: 'A team ready to make arrival and your stay easier',
        icon: <BellIcon />,
    },
    {
        id: 'internet',
        titleAr: 'إنترنت مجاني',
        titleEn: 'Free internet',
        descriptionAr: 'اتصال متاح داخل الشقق والمساحات المشتركة طوال فترة الإقامة',
        descriptionEn: 'Connectivity available across apartments and shared spaces',
        icon: <WifiIcon />,
    },
    {
        id: 'parking',
        titleAr: 'مواقف سيارات',
        titleEn: 'Parking',
        descriptionAr: 'مواقف مخصصة تساعد على الوصول والمغادرة براحة أكبر',
        descriptionEn: 'Dedicated parking for easier arrivals and departures',
        icon: <CarIcon />,
    },
    {
        id: 'housekeeping',
        titleAr: 'عناية يومية',
        titleEn: 'Housekeeping',
        descriptionAr: 'خدمة تحافظ على راحة المساحة وجودتها أثناء الإقامة',
        descriptionEn: 'Care that keeps your space comfortable throughout the stay',
        icon: <SparkleIcon />,
    },
    {
        id: 'kitchen',
        titleAr: 'مطابخ مجهزة',
        titleEn: 'Equipped kitchens',
        descriptionAr: 'تجهيزات عملية تمنح الإقامات الطويلة والقصيرة مرونة أكبر',
        descriptionEn: 'Practical kitchens that add flexibility to every stay',
        icon: <KitchenIcon />,
    },
    {
        id: 'washer',
        titleAr: 'غسالة داخل الوحدة',
        titleEn: 'In-unit washer',
        descriptionAr: 'غسالة داخل الوحدة لتجربة يومية أسهل وأكثر استقلالية',
        descriptionEn: 'An in-unit washer for a more independent everyday stay',
        icon: <WasherIcon />,
    },
];

function AmenityCard({
    item,
    language,
}: {
    item: Amenity;
    language: Language;
}) {
    const isRtl = language === 'ar';

    return (
        <article
            dir={isRtl ? 'rtl' : 'ltr'}
            className="group relative h-[194px] w-[292px] shrink-0 overflow-hidden rounded-[26px] border border-black/[0.08] bg-white/48 p-5 shadow-[0_14px_36px_rgba(37,32,24,0.05)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#b9965a]/42 hover:bg-white/62 hover:shadow-[0_22px_54px_rgba(37,32,24,0.095)] dark:border-white/[0.08] dark:bg-[#151715]/82 dark:hover:bg-[#181a18] sm:w-[318px]"
        >
            <span className="pointer-events-none absolute inset-x-5 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-[#c9a866] via-[#e3c98f] to-transparent transition-transform duration-500 group-hover:scale-x-100" />

            <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-[#b9965a]/24 bg-[#b9965a]/[0.065] p-[11px] text-[#98733d] transition-all duration-500 group-hover:-rotate-3 group-hover:scale-[1.04] group-hover:bg-[#b9965a]/[0.12] dark:text-[#d4b578]">
                    {item.icon}
                </div>

                <span className="mt-1 text-[8px] font-bold tracking-[0.15em] text-black/20 dark:text-white/18">
                    7LUZ
                </span>
            </div>

            <div className="mt-6">
                <h3 className="text-[19px] font-semibold text-[#1c1e1a] dark:text-white">
                    {isRtl ? item.titleAr : item.titleEn}
                </h3>

                <p className="mt-2 max-w-[270px] text-[10.5px] leading-[1.75] text-black/43 dark:text-white/36">
                    {isRtl ? item.descriptionAr : item.descriptionEn}
                </p>
            </div>
        </article>
    );
}

export default function AmenitiesSection({
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

    useEffect(() => {
        const section = sectionRef.current;
        const eyebrow = eyebrowRef.current;
        const titlePrimary = titlePrimaryRef.current;
        const titleSecondary = titleSecondaryRef.current;
        const note = noteRef.current;

        if (!section || !eyebrow || !titlePrimary || !titleSecondary || !note) {
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
                y: 30,
                filter: 'blur(8px)',
            });

            gsap.set(note, {
                autoAlpha: 0,
                x: isRtl ? -20 : 20,
                scale: 0.985,
            });

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    gsap.timeline({
                        defaults: { ease: 'power3.out' },
                    })
                        .to(eyebrow, {
                            autoAlpha: 1,
                            x: 0,
                            filter: 'blur(0px)',
                            duration: 0.4,
                        })
                        .to(
                            titlePrimary,
                            {
                                autoAlpha: 1,
                                y: 0,
                                filter: 'blur(0px)',
                                duration: 0.6,
                            },
                            '-=0.16',
                        )
                        .to(
                            titleSecondary,
                            {
                                autoAlpha: 1,
                                y: 0,
                                filter: 'blur(0px)',
                                duration: 0.6,
                            },
                            '-=0.42',
                        )
                        .to(
                            note,
                            {
                                autoAlpha: 1,
                                x: 0,
                                scale: 1,
                                duration: 0.46,
                            },
                            '-=0.4',
                        );

                    observer.disconnect();
                },
                { threshold: 0.1 },
            );

            observer.observe(section);

            return () => observer.disconnect();
        }, section);

        return () => context.revert();
    }, [isRtl]);

    return (
        <section
            ref={sectionRef}
            id="amenities"
            className="relative overflow-hidden bg-[#f0ece4] py-[72px] text-[#191b18] sm:py-[88px] lg:py-24 dark:bg-[#0d0f0e] dark:text-[#f3f0e9]"
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-15%] top-[4%] h-[26rem] w-[26rem] rounded-full bg-[#b9965a]/[0.045] blur-[130px]" />
                <div className="absolute right-[-10%] bottom-[-24%] h-[28rem] w-[28rem] rounded-full bg-black/[0.03] blur-[130px] dark:bg-white/[0.018]" />
            </div>

            <div className="relative mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-10 xl:px-14">
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
                            <span>{isRtl ? 'الخدمات' : 'Amenities'}</span>
                        </div>

                        <h2 className="sl-display text-[clamp(2.7rem,5vw,5.65rem)] font-medium leading-[1.08]">
                            <span
                                ref={titlePrimaryRef}
                                className="block pb-[0.08em] pt-[0.08em] will-change-transform"
                            >
                                {isRtl ? 'كل ما تحتاجه' : 'Everything you need'}
                            </span>

                            <span
                                ref={titleSecondaryRef}
                                className="sl-hero-shimmer mt-1 block pb-[0.08em] pt-[0.08em] will-change-transform"
                            >
                                {isRtl ? 'ضمن تفاصيل إقامتك' : 'built into your stay'}
                            </span>
                        </h2>
                    </div>

                    <div
                        ref={noteRef}
                        className="relative max-w-[430px] overflow-hidden rounded-full border border-black/[0.075] bg-white/34 px-5 py-3.5 dark:border-white/[0.075] dark:bg-white/[0.025]"
                    >
                        <span className="pointer-events-none absolute inset-y-0 -left-24 w-20 rotate-[15deg] bg-gradient-to-r from-transparent via-[#d6b878]/25 to-transparent animate-[slAmenitiesNoteSweep_2.8s_linear_infinite] motion-reduce:animate-none" />
                        <span className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b9965a]/45 to-transparent" />

                        <p className="relative text-[10.5px] leading-6 text-black/46 dark:text-white/37">
                            {isRtl
                                ? 'خدمات عملية اختيرت لتجعل يومك أكثر راحة من لحظة الوصول وحتى المغادرة'
                                : 'Practical services selected to make every part of your stay feel easier'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative mt-10 sm:mt-12">
                <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-0 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#b9965a]/18 to-transparent" />
                <div className="pointer-events-none absolute left-0 top-1/2 z-0 h-px w-[22%] -translate-y-1/2 bg-gradient-to-r from-transparent via-[#dfc17f] to-transparent shadow-[0_0_18px_rgba(223,193,127,0.4)] animate-[slAmenitiesRailGlow_4.6s_linear_infinite] motion-reduce:animate-none" />

                <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-[#f0ece4] to-transparent dark:from-[#0d0f0e] sm:w-24" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-[#f0ece4] to-transparent dark:from-[#0d0f0e] sm:w-24" />

                <div className="relative z-10 overflow-hidden py-2" dir="ltr">
                    <div className="sl-amenities-marquee flex w-max">
                        {[0, 1].map((groupIndex) => (
                            <div
                                key={groupIndex}
                                aria-hidden={groupIndex === 1}
                                className="flex shrink-0 gap-4 pe-4"
                            >
                                {amenities.map((item) => (
                                    <AmenityCard
                                        key={`${groupIndex}-${item.id}`}
                                        item={item}
                                        language={language}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .sl-amenities-gold-shimmer {
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
                    animation: slAmenitiesGoldShimmer 2.75s ease-in-out infinite;
                }

                .sl-amenities-marquee {
                    animation: slAmenitiesLoop 34s linear infinite;
                    will-change: transform;
                }

                @keyframes slAmenitiesLoop {
                    from { transform: translate3d(0, 0, 0); }
                    to { transform: translate3d(-50%, 0, 0); }
                }

                @keyframes slAmenitiesRailGlow {
                    from { transform: translate3d(-120%, -50%, 0); }
                    to { transform: translate3d(560%, -50%, 0); }
                }

                @keyframes slAmenitiesGoldShimmer {
                    0%, 20% { background-position: 120% 0; }
                    64%, 100% { background-position: -120% 0; }
                }

                @keyframes slAmenitiesNoteSweep {
                    from { transform: translateX(-180%) rotate(15deg); opacity: 0; }
                    18% { opacity: 1; }
                    55% { opacity: .8; }
                    to { transform: translateX(760%) rotate(15deg); opacity: 0; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .sl-amenities-marquee,
                    .sl-amenities-gold-shimmer {
                        animation: none !important;
                    }
                }
            `}</style>
        </section>
    );
}
