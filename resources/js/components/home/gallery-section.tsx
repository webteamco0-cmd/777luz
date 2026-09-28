import gsap from 'gsap';
import {
    useEffect,
    useRef,
    useState,
    type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

type Language = 'ar' | 'en';

type GalleryItem = {
    src: string;
    fallback: string;
    titleAr: string;
    titleEn: string;
    labelAr: string;
    labelEn: string;
    position?: string;
};

const galleryItems: GalleryItem[] = [
    {
        src: '/assets/images/hero/reception-primary.jpg',
        fallback: '/assets/images/hero/lounge-primary.jpg',
        titleAr: 'منطقة الاستقبال',
        titleEn: 'Reception',
        labelAr: 'لحظة الوصول',
        labelEn: 'Arrival',
        position: 'center center',
    },
    {
        src: '/assets/images/hero/lounge-primary.jpg',
        fallback: '/assets/images/hero/reception-primary.jpg',
        titleAr: 'مساحات معيشة هادئة',
        titleEn: 'Calm living spaces',
        labelAr: 'الداخل',
        labelEn: 'Interiors',
        position: 'center center',
    },
    {
        src: '/assets/images/rooms/premium-1br-main.jpg',
        fallback: '/assets/images/hero/lounge-depth.jpg',
        titleAr: 'تفاصيل الإقامة',
        titleEn: 'Stay details',
        labelAr: 'الوحدات',
        labelEn: 'Apartments',
        position: 'center center',
    },
    {
        src: '/assets/images/hero/arrival-exterior.jpg',
        fallback: '/assets/images/hero/reception-primary.jpg',
        titleAr: 'واجهة سفن لوز',
        titleEn: 'Seven Luz exterior',
        labelAr: 'الموقع',
        labelEn: 'Location',
        position: 'center center',
    },
    {
        src: '/assets/images/rooms/twin-room-main.jpg',
        fallback: '/assets/images/hero/lounge-primary.jpg',
        titleAr: 'غرفة توين',
        titleEn: 'Twin room',
        labelAr: 'الإقامة',
        labelEn: 'Stay',
        position: 'center center',
    },
    {
        src: '/assets/images/rooms/superior-2br-main.jpg',
        fallback: '/assets/images/hero/lounge-depth.jpg',
        titleAr: 'مساحات أوسع',
        titleEn: 'More room to settle in',
        labelAr: 'الإقامة',
        labelEn: 'Stay',
        position: 'center center',
    },
];

function CloseIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <path d="M6 6l12 12M18 6 6 18" />
        </svg>
    );
}

function ArrowIcon({
    direction,
}: {
    direction: 'previous' | 'next';
}) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className={`h-5 w-5 ${
                direction === 'next' ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
        >
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}

function ExpandIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-[17px] w-[17px]"
            aria-hidden="true"
        >
            <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
        </svg>
    );
}

function imageClass(index: number) {
    const classes = [
        'md:col-span-7 md:row-span-2',
        'md:col-span-5',
        'md:col-span-5',
        'md:col-span-4',
        'md:col-span-4',
        'md:col-span-4',
    ];

    return classes[index] ?? 'md:col-span-4';
}

export default function GallerySection({
    language,
}: {
    language: Language;
}) {
    const isRtl = language === 'ar';
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const galleryEyebrowRef = useRef<HTMLDivElement>(null);
    const galleryTitlePrimaryRef = useRef<HTMLSpanElement>(null);
    const galleryTitleSecondaryRef = useRef<HTMLSpanElement>(null);
    const galleryNoteRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(
        null,
    );

    useEffect(() => {
        const section = sectionRef.current;
        const eyebrow = galleryEyebrowRef.current;
        const titlePrimary = galleryTitlePrimaryRef.current;
        const titleSecondary = galleryTitleSecondaryRef.current;
        const note = galleryNoteRef.current;
        const grid = gridRef.current;

        if (
            !section ||
            !eyebrow ||
            !titlePrimary ||
            !titleSecondary ||
            !note ||
            !grid
        ) {
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reducedMotion) {
            return;
        }

        const cards = Array.from(
            grid.querySelectorAll<HTMLElement>('[data-gallery-card]'),
        );

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

            gsap.set(cards, {
                autoAlpha: 0,
                y: 22,
                scale: 0.992,
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
                            cards,
                            {
                                autoAlpha: 1,
                                y: 0,
                                scale: 1,
                                duration: 0.56,
                                stagger: 0.055,
                            },
                            '-=0.34',
                        );

                    observer.disconnect();
                },
                {
                    threshold: 0.1,
                },
            );

            observer.observe(section);

            return () => observer.disconnect();
        }, section);

        return () => context.revert();
    }, [isRtl]);

    useEffect(() => {
        if (activeIndex === null) {
            document.body.style.overflow = '';
            return;
        }

        document.body.style.overflow = 'hidden';

        function handleKeydown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setActiveIndex(null);
            }

            if (event.key === 'ArrowLeft') {
                setActiveIndex((current) => {
                    if (current === null) {
                        return 0;
                    }

                    return (
                        current + 1
                    ) % galleryItems.length;
                });
            }

            if (event.key === 'ArrowRight') {
                setActiveIndex((current) => {
                    if (current === null) {
                        return 0;
                    }

                    return (
                        current -
                        1 +
                        galleryItems.length
                    ) % galleryItems.length;
                });
            }
        }

        window.addEventListener('keydown', handleKeydown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener(
                'keydown',
                handleKeydown,
            );
        };
    }, [activeIndex]);

    function nextImage() {
        setActiveIndex((current) => {
            if (current === null) {
                return 0;
            }

            return (current + 1) % galleryItems.length;
        });
    }

    function previousImage() {
        setActiveIndex((current) => {
            if (current === null) {
                return 0;
            }

            return (
                current -
                1 +
                galleryItems.length
            ) % galleryItems.length;
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
        <>
            <section
                ref={sectionRef}
                id="gallery"
                className="relative overflow-hidden bg-[#ebe6dc] py-20 text-[#191b18] sm:py-24 lg:py-28 dark:bg-[#0b0d0c] dark:text-[#f2efe8]"
            >
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-52 top-20 h-[32rem] w-[32rem] rounded-full bg-[#b9965a]/[0.045] blur-[135px]" />
                    <div className="absolute -right-44 bottom-0 h-[28rem] w-[28rem] rounded-full bg-white/[0.18] blur-[150px] dark:bg-white/[0.02]" />
                </div>

                <div className="relative mx-auto w-full max-w-[1450px] px-4 sm:px-6 lg:px-10 xl:px-14">
                    <div
                        ref={headerRef}
                        className="mb-10 grid gap-6 sm:mb-12 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-end"
                    >
                        <div className="max-w-[760px]">
                            <div
                                ref={galleryEyebrowRef}
                                className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-[#b9965a]/20 bg-[#b9965a]/[0.055] px-3 py-1.5 text-[8px] font-bold tracking-[0.12em] text-[#98733d] dark:text-[#d4b578]"
                            >
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#b9965a]/45 motion-reduce:animate-none" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#b9965a]" />
                                </span>
                                <span>{isRtl ? 'المعرض' : 'Gallery'}</span>
                            </div>

                            <h2 className="sl-display text-[clamp(2.7rem,5vw,5.65rem)] font-medium leading-[1.08]">
                                <span
                                    ref={galleryTitlePrimaryRef}
                                    className="block pb-[0.08em] pt-[0.08em] will-change-transform"
                                >
                                    {isRtl ? 'شاهد المكان' : 'See the place'}
                                </span>

                                <span
                                    ref={galleryTitleSecondaryRef}
                                    className="sl-hero-shimmer mt-1 block pb-[0.08em] pt-[0.08em] will-change-transform"
                                >
                                    {isRtl ? 'كما ستعيشه' : 'before you arrive'}
                                </span>
                            </h2>
                        </div>

                        <div
                            ref={galleryNoteRef}
                            className="group relative max-w-[430px] overflow-hidden rounded-full border border-black/[0.075] bg-white/34 px-5 py-3.5 dark:border-white/[0.075] dark:bg-white/[0.025]"
                        >
                            <span className="pointer-events-none absolute inset-y-0 -left-24 w-20 rotate-[15deg] bg-gradient-to-r from-transparent via-[#d6b878]/24 to-transparent animate-[slGalleryNoteSweep_2.9s_linear_infinite] motion-reduce:animate-none" />
                            <span className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b9965a]/45 to-transparent" />

                            <p className="relative text-[10.5px] leading-6 text-black/46 dark:text-white/37">
                                {isRtl
                                    ? 'لقطات حقيقية من سفن لوز تعرّفك على تفاصيل المكان بهدوء ومن غير مبالغة'
                                    : 'Real views from Seven Luz showing the spaces and details with a calm honest perspective'}
                            </p>
                        </div>
                    </div>

                    <div
                        ref={gridRef}
                        className="grid auto-rows-[230px] grid-cols-1 gap-4 sm:auto-rows-[250px] sm:grid-cols-2 md:auto-rows-[290px] md:grid-cols-12 lg:gap-5"
                    >
                        {galleryItems.map(
                            (item, index) => (
                                <button
                                    key={`${item.src}-${index}`}
                                    type="button"
                                    data-gallery-card
                                    onClick={() =>
                                        setActiveIndex(
                                            index,
                                        )
                                    }
                                    className={`group relative col-span-1 overflow-hidden rounded-[26px] border border-black/[0.07] bg-[#d9d2c8] text-start shadow-[0_20px_55px_rgba(33,30,24,0.08)] transition-shadow duration-500 hover:shadow-[0_28px_70px_rgba(33,30,24,0.14)] dark:border-white/[0.08] dark:bg-[#141614] dark:shadow-[0_24px_65px_rgba(0,0,0,0.24)] ${imageClass(
                                        index,
                                    )}`}
                                >
                                    <img
                                        src={item.src}
                                        onError={(
                                            event,
                                        ) =>
                                            handleImageError(
                                                event,
                                                item.fallback,
                                            )
                                        }
                                        alt={
                                            isRtl
                                                ? item.titleAr
                                                : item.titleEn
                                        }
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.025]"
                                        style={{
                                            objectPosition:
                                                item.position ??
                                                'center center',
                                        }}
                                        draggable={false}
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-black/[0.02] to-transparent opacity-85 transition-opacity duration-500 group-hover:opacity-95" />

                                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                                        <div>
                                            <span className="text-[8px] font-bold tracking-[0.12em] text-[#dfc184]">
                                                {isRtl
                                                    ? item.labelAr
                                                    : item.labelEn}
                                            </span>

                                            <h3 className="mt-1.5 text-[17px] font-semibold text-white sm:text-[19px]">
                                                {isRtl
                                                    ? item.titleAr
                                                    : item.titleEn}
                                            </h3>
                                        </div>

                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white/80 backdrop-blur-md transition-all duration-300 group-hover:border-[#d7b97b] group-hover:bg-[#d7b97b] group-hover:text-[#171816]">
                                            <ExpandIcon />
                                        </span>
                                    </div>

                                    <span className="pointer-events-none absolute inset-x-5 top-5 h-px origin-left scale-x-0 bg-gradient-to-r from-[#d8ba7b] via-[#d8ba7b]/45 to-transparent transition-transform duration-700 group-hover:scale-x-100" />
                                </button>
                            ),
                        )}
                    </div>

                    <div className="mt-7 flex items-center justify-between border-t border-black/[0.07] pt-5 text-[9px] font-semibold tracking-[0.08em] text-black/34 dark:border-white/[0.07] dark:text-white/28">
                        <span>
                            {isRtl
                                ? 'صور حقيقية من الفرع'
                                : 'Real views from the property'}
                        </span>

                        <span>06 / 06</span>
                    </div>
                </div>
            </section>

            <style>{`
                .sl-gallery-gold-shimmer {
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
                    animation: slGalleryGoldShimmer 2.75s ease-in-out infinite;
                }

                @keyframes slGalleryGoldShimmer {
                    0%, 20% { background-position: 120% 0; }
                    64%, 100% { background-position: -120% 0; }
                }

                @keyframes slGalleryNoteSweep {
                    from { transform: translateX(-180%) rotate(15deg); opacity: 0; }
                    18% { opacity: 1; }
                    55% { opacity: .8; }
                    to { transform: translateX(760%) rotate(15deg); opacity: 0; }
                }
            `}</style>

            {activeIndex !== null && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={
                        isRtl
                            ? 'عرض الصورة'
                            : 'Image viewer'
                    }
                    className="fixed inset-0 z-[190] flex items-center justify-center bg-[#080908]/94 p-3 backdrop-blur-xl sm:p-6"
                    onClick={() =>
                        setActiveIndex(null)
                    }
                    onKeyDown={(
                        event: ReactKeyboardEvent<HTMLDivElement>,
                    ) => {
                        if (event.key === 'Escape') {
                            setActiveIndex(null);
                        }
                    }}
                >
                    <div
                        className="relative flex h-full w-full max-w-[1500px] items-center justify-center"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <button
                            type="button"
                            onClick={() =>
                                setActiveIndex(null)
                            }
                            className="absolute end-0 top-0 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-white/[0.06] text-white/80 transition-all duration-300 hover:border-[#d2b372] hover:bg-[#d2b372] hover:text-[#171816]"
                            aria-label={
                                isRtl
                                    ? 'إغلاق'
                                    : 'Close'
                            }
                        >
                            <CloseIcon />
                        </button>

                        <button
                            type="button"
                            onClick={previousImage}
                            className="absolute start-0 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/14 bg-black/20 text-white/80 backdrop-blur-md transition-all duration-300 hover:border-[#d2b372] hover:bg-[#d2b372] hover:text-[#171816] sm:start-3"
                            aria-label={
                                isRtl
                                    ? 'الصورة السابقة'
                                    : 'Previous image'
                            }
                        >
                            <ArrowIcon direction="previous" />
                        </button>

                        <button
                            type="button"
                            onClick={nextImage}
                            className="absolute end-0 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/14 bg-black/20 text-white/80 backdrop-blur-md transition-all duration-300 hover:border-[#d2b372] hover:bg-[#d2b372] hover:text-[#171816] sm:end-3"
                            aria-label={
                                isRtl
                                    ? 'الصورة التالية'
                                    : 'Next image'
                            }
                        >
                            <ArrowIcon direction="next" />
                        </button>

                        <div className="relative max-h-[86vh] max-w-[calc(100%-72px)] overflow-hidden rounded-[26px] sm:max-w-[calc(100%-150px)] sm:rounded-[32px]">
                            <img
                                src={
                                    galleryItems[
                                        activeIndex
                                    ].src
                                }
                                onError={(event) =>
                                    handleImageError(
                                        event,
                                        galleryItems[
                                            activeIndex
                                        ].fallback,
                                    )
                                }
                                alt={
                                    isRtl
                                        ? galleryItems[
                                              activeIndex
                                          ].titleAr
                                        : galleryItems[
                                              activeIndex
                                          ].titleEn
                                }
                                className="max-h-[86vh] max-w-full object-contain"
                                draggable={false}
                            />

                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 to-transparent p-5 pt-16 sm:p-7 sm:pt-20">
                                <span className="text-[8px] font-bold tracking-[0.12em] text-[#dfc184]">
                                    {isRtl
                                        ? galleryItems[
                                              activeIndex
                                          ].labelAr
                                        : galleryItems[
                                              activeIndex
                                          ].labelEn}
                                </span>

                                <h3 className="mt-2 text-[20px] font-semibold text-white sm:text-[24px]">
                                    {isRtl
                                        ? galleryItems[
                                              activeIndex
                                          ].titleAr
                                        : galleryItems[
                                              activeIndex
                                          ].titleEn}
                                </h3>
                            </div>
                        </div>

                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-semibold tracking-[0.16em] text-white/40">
                            {String(
                                activeIndex + 1,
                            ).padStart(2, '0')}{' '}
                            /{' '}
                            {String(
                                galleryItems.length,
                            ).padStart(2, '0')}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
