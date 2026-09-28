import gsap from 'gsap';
import {
    useEffect,
    useRef,
    useState,
    type MouseEvent,
} from 'react';

type Language = 'ar' | 'en';

type RoomUnit = {
    slug: string;
    nameAr: string;
    nameEn: string;
    kickerAr: string;
    kickerEn: string;
    descriptionAr: string;
    descriptionEn: string;
    image: string;
    fallback: string;
};

const units: RoomUnit[] = [
    {
        slug: 'king-studio',
        nameAr: 'استوديو كينغ',
        nameEn: 'King Studio',
        kickerAr: 'مساحة عملية بإحساس هادئ',
        kickerEn: 'A calm practical stay',
        descriptionAr:
            'خيار مريح للإقامات القصيرة والعملية مع تفاصيل مصممة لتجربة أكثر هدوءًا',
        descriptionEn:
            'A comfortable choice for shorter stays with a calm practical layout and considered details',
        image: '/assets/images/rooms/twin-room-main.jpg',
        fallback: '/assets/images/rooms/twin-room-main.jpg',
    },
    {
        slug: 'twin-room',
        nameAr: 'غرفة توين',
        nameEn: 'Twin Room',
        kickerAr: 'سريران منفصلان وراحة واضحة',
        kickerEn: 'Two beds with effortless comfort',
        descriptionAr:
            'تكوين مناسب للإقامة المشتركة مع خصوصية وراحة يومية بدون تعقيد',
        descriptionEn:
            'A practical shared-stay layout designed for comfort privacy and everyday ease',
        image: '/assets/images/rooms/twin-room-main.jpg',
        fallback: '/assets/images/rooms/premium-1br-main.jpg',
    },
    {
        slug: 'premium-1br',
        nameAr: 'بريميوم غرفة وصالة',
        nameEn: 'Premium One Bedroom',
        kickerAr: 'مساحة أوسع وإقامة أكثر مرونة',
        kickerEn: 'More room to settle in',
        descriptionAr:
            'غرفة نوم مع مساحة معيشة تمنحك فصلًا مريحًا بين الراحة ووقت الجلوس',
        descriptionEn:
            'A separate bedroom and living space for a more flexible and comfortable stay',
        image: '/assets/images/rooms/premium-1br-main.jpg',
        fallback: '/assets/images/rooms/twin-room-main.jpg',
    },
    {
        slug: 'superior-2br',
        nameAr: 'سوبيريور غرفتين وصالة',
        nameEn: 'Superior Two Bedroom',
        kickerAr: 'لإقامة عائلية أكثر رحابة',
        kickerEn: 'Room to stay together',
        descriptionAr:
            'مساحة أكبر للعائلات والإقامات الممتدة مع توزيع يساعد على الراحة والخصوصية',
        descriptionEn:
            'A more generous layout for families and longer stays with space for comfort and privacy',
        image: '/assets/images/rooms/superior-2br-main.jpg',
        fallback: '/assets/images/rooms/premium-1br-main.jpg',
    },
    {
        slug: 'premium-3br',
        nameAr: 'بريميوم ثلاث غرف وصالة',
        nameEn: 'Premium Three Bedroom',
        kickerAr: 'مساحة أكبر لإقامة تجمع الجميع',
        kickerEn: 'A larger stay for everyone',
        descriptionAr:
            'خيار رحب للإقامات العائلية والمجموعات مع تجربة مصممة لتبقى عملية ومريحة',
        descriptionEn:
            'A spacious option for families and groups with an experience designed to stay practical and comfortable',
        image: '/assets/images/rooms/premium-3br-main.jpg',
        fallback: '/assets/images/rooms/superior-2br-main.jpg',
    },
];

function ArrowIcon({ rtl }: { rtl: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className={`h-[18px] w-[18px] ${rtl ? '' : 'rotate-180'}`}
            aria-hidden="true"
        >
            <path d="M19 12H5" />
            <path d="m11 18-6-6 6-6" />
        </svg>
    );
}

export default function RoomsSection({
    language,
}: {
    language: Language;
}) {
    const isRtl = language === 'ar';
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const roomEyebrowRef = useRef<HTMLDivElement>(null);
    const roomTitlePrimaryRef = useRef<HTMLSpanElement>(null);
    const roomTitleSecondaryRef = useRef<HTMLSpanElement>(null);
    const roomNoteRef = useRef<HTMLDivElement>(null);
    const visualRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const activeUnit = units[activeIndex];

    useEffect(() => {
        const section = sectionRef.current;
        const eyebrow = roomEyebrowRef.current;
        const titlePrimary = roomTitlePrimaryRef.current;
        const titleSecondary = roomTitleSecondaryRef.current;
        const note = roomNoteRef.current;
        const visual = visualRef.current;
        const list = listRef.current;

        if (
            !section ||
            !eyebrow ||
            !titlePrimary ||
            !titleSecondary ||
            !note ||
            !visual ||
            !list
        ) {
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reducedMotion) {
            return;
        }

        const listItems = Array.from(list.children);

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

            gsap.set(visual, {
                autoAlpha: 0,
                y: 26,
                scale: 0.99,
            });

            gsap.set(listItems, {
                autoAlpha: 0,
                y: 16,
            });

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    const timeline = gsap.timeline({
                        defaults: {
                            ease: 'power3.out',
                        },
                    });

                    timeline
                        .to(eyebrow, {
                            autoAlpha: 1,
                            x: 0,
                            filter: 'blur(0px)',
                            duration: 0.42,
                        })
                        .to(
                            titlePrimary,
                            {
                                autoAlpha: 1,
                                y: 0,
                                filter: 'blur(0px)',
                                duration: 0.62,
                            },
                            '-=0.18',
                        )
                        .to(
                            titleSecondary,
                            {
                                autoAlpha: 1,
                                y: 0,
                                filter: 'blur(0px)',
                                duration: 0.62,
                            },
                            '-=0.43',
                        )
                        .to(
                            note,
                            {
                                autoAlpha: 1,
                                x: 0,
                                scale: 1,
                                duration: 0.48,
                            },
                            '-=0.42',
                        )
                        .to(
                            visual,
                            {
                                autoAlpha: 1,
                                y: 0,
                                scale: 1,
                                duration: 0.8,
                            },
                            '-=0.36',
                        )
                        .to(
                            listItems,
                            {
                                autoAlpha: 1,
                                y: 0,
                                duration: 0.42,
                                stagger: 0.055,
                            },
                            '-=0.52',
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

    useEffect(() => {
        const image = imageRef.current;

        if (!image) {
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reducedMotion) {
            return;
        }

        gsap.killTweensOf(image);

        gsap.fromTo(
            image,
            {
                autoAlpha: 0.45,
                scale: 1.045,
                filter: 'blur(5px)',
            },
            {
                autoAlpha: 1,
                scale: 1,
                filter: 'blur(0px)',
                duration: 0.78,
                ease: 'power3.out',
            },
        );
    }, [activeIndex]);

    function handleVisualMove(
        event: MouseEvent<HTMLDivElement>,
    ) {
        if (window.innerWidth < 1024) {
            return;
        }

        const rect =
            event.currentTarget.getBoundingClientRect();

        const x =
            (event.clientX - rect.left) / rect.width -
            0.5;

        const y =
            (event.clientY - rect.top) / rect.height -
            0.5;

        gsap.to(imageRef.current, {
            xPercent: x * 1.15,
            yPercent: y * 0.7,
            scale: 1.018,
            duration: 0.9,
            ease: 'power3.out',
            overwrite: 'auto',
        });
    }

    function handleVisualLeave() {
        gsap.to(imageRef.current, {
            xPercent: 0,
            yPercent: 0,
            scale: 1,
            duration: 0.9,
            ease: 'power3.out',
            overwrite: 'auto',
        });
    }

    function handleImageError(
        event: React.SyntheticEvent<
            HTMLImageElement,
            Event
        >,
        fallback: string,
    ) {
        const image = event.currentTarget;

        if (!image.src.endsWith(fallback)) {
            image.src = fallback;
        }
    }

    return (
        <section
            ref={sectionRef}
            id="rooms"
            className="relative overflow-hidden bg-[#f1ede5] py-20 text-[#191b18] sm:py-24 lg:py-28 dark:bg-[#0e100f] dark:text-[#f3f0e9]"
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-16%] top-[6%] h-[34rem] w-[34rem] rounded-full bg-[#b9965a]/[0.055] blur-[130px]" />
                <div className="absolute bottom-[-20%] right-[-10%] h-[32rem] w-[32rem] rounded-full bg-black/[0.035] blur-[120px] dark:bg-white/[0.025]" />
            </div>

            <div className="relative mx-auto w-full max-w-[1450px] px-4 sm:px-6 lg:px-10 xl:px-14">
                <div
                    ref={headerRef}
                    className="mb-10 grid gap-6 sm:mb-12 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-end"
                >
                    <div className="max-w-[760px]">
                        <div
                            ref={roomEyebrowRef}
                            className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-[#b9965a]/20 bg-[#b9965a]/[0.055] px-3 py-1.5 text-[8px] font-bold tracking-[0.12em] text-[#98733d] dark:text-[#d3b577]"
                        >
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#b9965a]/45 motion-reduce:animate-none" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#b9965a]" />
                            </span>
                            <span>{isRtl ? 'مساحات للإقامة' : 'Spaces to stay'}</span>
                        </div>

                        <h2 className="sl-display text-[clamp(2.7rem,5vw,5.65rem)] font-medium leading-[1.08]">
                            <span
                                ref={roomTitlePrimaryRef}
                                className="block pb-[0.08em] pt-[0.08em] will-change-transform"
                            >
                                {isRtl ? 'اختر المساحة' : 'Choose the space'}
                            </span>

                            <span
                                ref={roomTitleSecondaryRef}
                                className="sl-hero-shimmer mt-1 block pb-[0.08em] pt-[0.08em] will-change-transform"
                            >
                                {isRtl ? 'التي تناسب إقامتك' : 'that fits your stay'}
                            </span>
                        </h2>
                    </div>

                    <div
                        ref={roomNoteRef}
                        className="group relative max-w-[430px] overflow-hidden rounded-full border border-black/[0.075] bg-white/34 px-5 py-3.5 dark:border-white/[0.075] dark:bg-white/[0.025]"
                    >
                        <span className="pointer-events-none absolute inset-y-0 -left-24 w-20 rotate-[15deg] bg-gradient-to-r from-transparent via-[#d6b878]/24 to-transparent animate-[slRoomNoteSweep_2.9s_linear_infinite] motion-reduce:animate-none" />
                        <span className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b9965a]/45 to-transparent" />

                        <p className="relative text-[10.5px] leading-6 text-black/46 dark:text-white/37">
                            {isRtl
                                ? 'أنواع إقامة مختلفة بتكوينات عملية ويمكن للإدارة تحديث الصور والتفاصيل من لوحة التحكم'
                                : 'Different stay types with practical layouts while photos and details remain manageable from the dashboard'}
                        </p>
                    </div>
                </div>

                <div className="hidden gap-8 lg:grid lg:grid-cols-[1.18fr_0.82fr] xl:gap-12">
                    <div
                        ref={visualRef}
                        onMouseMove={handleVisualMove}
                        onMouseLeave={handleVisualLeave}
                        className="relative min-h-[620px] overflow-hidden rounded-[34px] border border-black/[0.08] bg-[#ddd7ce] shadow-[0_28px_80px_rgba(29,27,22,0.12)] dark:border-white/[0.09] dark:bg-[#151715] dark:shadow-[0_32px_90px_rgba(0,0,0,0.28)]"
                    >
                        <img
                            key={activeUnit.slug}
                            ref={imageRef}
                            src={activeUnit.image}
                            onError={(event) =>
                                handleImageError(
                                    event,
                                    activeUnit.fallback,
                                )
                            }
                            alt={
                                isRtl
                                    ? activeUnit.nameAr
                                    : activeUnit.nameEn
                            }
                            className="absolute inset-0 h-full w-full object-cover will-change-transform"
                            draggable={false}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/[0.08] to-black/[0.05]" />

                        <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <span className="text-[10px] font-semibold tracking-[0.16em] text-[#e1c487]">
                                    0{activeIndex + 1}
                                </span>

                                <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[8px] font-semibold tracking-[0.08em] text-white/70 backdrop-blur-md">
                                    {isRtl
                                        ? activeUnit.kickerAr
                                        : activeUnit.kickerEn}
                                </span>
                            </div>

                            <div className="flex items-end justify-between gap-5">
                                <div>
                                    <h3 className="sl-display text-[clamp(2.2rem,4vw,4.8rem)] font-medium leading-[1.05] text-white">
                                        {isRtl
                                            ? activeUnit.nameAr
                                            : activeUnit.nameEn}
                                    </h3>

                                    <p className="mt-4 max-w-[620px] text-[12px] leading-7 text-white/65 sm:text-[13px]">
                                        {isRtl
                                            ? activeUnit.descriptionAr
                                            : activeUnit.descriptionEn}
                                    </p>
                                </div>

                                <a
                                    href={`#${activeUnit.slug}`}
                                    className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/24 bg-white/[0.06] text-white transition-all duration-300 hover:border-[#d5b676] hover:bg-[#d5b676] hover:text-[#171816]"
                                    aria-label={
                                        isRtl
                                            ? `استكشف ${activeUnit.nameAr}`
                                            : `Explore ${activeUnit.nameEn}`
                                    }
                                >
                                    <ArrowIcon rtl={isRtl} />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div
                        ref={listRef}
                        className="flex flex-col justify-center"
                    >
                        {units.map((unit, index) => {
                            const active =
                                activeIndex === index;

                            return (
                                <button
                                    key={unit.slug}
                                    type="button"
                                    onMouseEnter={() =>
                                        setActiveIndex(index)
                                    }
                                    onFocus={() =>
                                        setActiveIndex(index)
                                    }
                                    onClick={() =>
                                        setActiveIndex(index)
                                    }
                                    className={`group relative flex min-h-[104px] w-full items-center gap-5 border-b px-1 text-start transition-all duration-300 ${
                                        active
                                            ? 'border-[#b9965a]/60'
                                            : 'border-black/[0.08] dark:border-white/[0.08]'
                                    }`}
                                >
                                    <span
                                        className={`shrink-0 text-[9px] font-semibold tracking-[0.14em] transition-colors duration-300 ${
                                            active
                                                ? 'text-[#a67f46] dark:text-[#d2b273]'
                                                : 'text-black/25 dark:text-white/22'
                                        }`}
                                    >
                                        0{index + 1}
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span
                                            className={`block text-[19px] font-semibold transition-all duration-300 xl:text-[22px] ${
                                                active
                                                    ? 'translate-x-0 text-[#1b1d19] dark:text-white'
                                                    : isRtl
                                                      ? 'translate-x-1 text-black/48 group-hover:translate-x-0 group-hover:text-black/76 dark:text-white/38 dark:group-hover:text-white/70'
                                                      : '-translate-x-1 text-black/48 group-hover:translate-x-0 group-hover:text-black/76 dark:text-white/38 dark:group-hover:text-white/70'
                                            }`}
                                        >
                                            {isRtl
                                                ? unit.nameAr
                                                : unit.nameEn}
                                        </span>

                                        <span
                                            className={`mt-1.5 block text-[10px] leading-5 transition-colors duration-300 ${
                                                active
                                                    ? 'text-black/48 dark:text-white/44'
                                                    : 'text-black/27 dark:text-white/24'
                                            }`}
                                        >
                                            {isRtl
                                                ? unit.kickerAr
                                                : unit.kickerEn}
                                        </span>
                                    </span>

                                    <span
                                        className={`h-px transition-all duration-500 ${
                                            active
                                                ? 'w-12 bg-[#b9965a]'
                                                : 'w-5 bg-black/12 group-hover:w-8 dark:bg-white/12'
                                        }`}
                                    />

                                    {active && (
                                        <span className="absolute inset-x-0 bottom-[-1px] h-px overflow-hidden">
                                            <span className="block h-full w-[34%] animate-[slRoomLine_2.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#d7ba7c] to-transparent" />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:hidden">
                    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {units.map((unit, index) => (
                            <article
                                key={unit.slug}
                                id={unit.slug}
                                className="relative w-[84vw] max-w-[390px] shrink-0 snap-center overflow-hidden rounded-[28px] border border-black/[0.08] bg-[#ded8cf] dark:border-white/[0.09] dark:bg-[#151715]"
                            >
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    <img
                                        src={unit.image}
                                        onError={(event) =>
                                            handleImageError(
                                                event,
                                                unit.fallback,
                                            )
                                        }
                                        alt={
                                            isRtl
                                                ? unit.nameAr
                                                : unit.nameEn
                                        }
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.025]"
                                        draggable={false}
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/[0.05] to-transparent" />

                                    <div className="absolute inset-x-0 bottom-0 p-5">
                                        <div className="mb-3 flex items-center justify-between gap-4">
                                            <span className="text-[9px] font-semibold tracking-[0.14em] text-[#e0c284]">
                                                0{index + 1}
                                            </span>

                                            <span className="text-[8px] font-medium text-white/55">
                                                {isRtl
                                                    ? unit.kickerAr
                                                    : unit.kickerEn}
                                            </span>
                                        </div>

                                        <h3 className="sl-display text-[30px] font-medium leading-[1.08] text-white sm:text-[34px]">
                                            {isRtl
                                                ? unit.nameAr
                                                : unit.nameEn}
                                        </h3>

                                        <p className="mt-3 text-[10px] leading-6 text-white/62">
                                            {isRtl
                                                ? unit.descriptionAr
                                                : unit.descriptionEn}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-[9px] font-semibold tracking-[0.08em] text-black/35 dark:text-white/30">
                        <span>
                            {isRtl
                                ? 'اسحب لاستكشاف الوحدات'
                                : 'Swipe to explore'}
                        </span>

                        <span>01 — 05</span>
                    </div>
                </div>
            </div>

            <style>{`
                .sl-room-gold-shimmer {
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
                    animation: slRoomGoldShimmer 2.75s ease-in-out infinite;
                }

                @keyframes slRoomGoldShimmer {
                    0%, 20% { background-position: 120% 0; }
                    64%, 100% { background-position: -120% 0; }
                }

                @keyframes slRoomNoteSweep {
                    from { transform: translateX(-180%) rotate(15deg); opacity: 0; }
                    18% { opacity: 1; }
                    55% { opacity: .8; }
                    to { transform: translateX(760%) rotate(15deg); opacity: 0; }
                }

                @keyframes slRoomLine {
                    0% {
                        transform: translateX(-130%);
                        opacity: 0;
                    }

                    25% {
                        opacity: 1;
                    }

                    75% {
                        opacity: 1;
                    }

                    100% {
                        transform: translateX(390%);
                        opacity: 0;
                    }
                }
            `}</style>
        </section>
    );
}
