import { Head, Link, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
    type MouseEvent,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
} from 'react';
import { dashboard, login } from '@/routes';
import AmenitiesSection from '@/components/home/amenities-section';
import RoomsSection from '@/components/home/rooms-section';
import GallerySection from '@/components/home/gallery-section';
import LocationSection from '@/components/home/location-section';
import BookingCtaSection from '@/components/home/booking-cta-section';
import SiteFooter from '@/components/home/site-footer';

type Language = 'ar' | 'en';
type ThemeMode = 'light' | 'dark';

type AvailabilityResult = {
    room_type_id: number;
    slug: string;
    name_ar: string;
    name_en: string;
    short_description_ar: string | null;
    short_description_en: string | null;
    available_units: number;
    nights: number;
    total_price: string;
    nightly_breakdown: Array<{
        date: string;
        price: string;
        available_units: number;
    }>;
};

type BookingHoldResult = {
    id: number;
    booking_reference: string;
    branch_id: number;
    room_type_id: number;
    check_in: string;
    check_out: string;
    nights_count: number;
    subtotal: string;
    discount_amount: string;
    total_amount: string;
    currency: string;
    status: string;
    payment_status: string;
    payment_method: 'pay_now' | 'pay_at_property' | null;
    phone_verified: boolean;
    guest_count: number;
    hold_expires_at: string | null;
    room_type: {
        id: number;
        slug: string;
        name_ar: string;
        name_en: string;
    };
    nights: Array<{
        date: string;
        nightly_rate: string;
    }>;
};

type PhoneVerificationSendResult = {
    booking_reference: string;
    phone: string;
    channel: string;
    expires_at: string;
    resend_available_at: string | null;
    development_code: string | null;
};

type PhoneVerificationVerifyResult = {
    booking_reference: string;
    phone_verified: boolean;
    verified_at: string | null;
};

type CouponApplyResult = {
    booking_reference: string;
    coupon_code: string;
    subtotal: string;
    discount_amount: string;
    total_amount: string;
    currency: string;
};

type PaymentMethodResult = {
    booking_reference: string;
    payment_method: 'pay_now' | 'pay_at_property';
    payment_status: string;
    subtotal: string;
    discount_amount: string;
    total_amount: string;
    currency: string;
};

type PaymentStartResult = {
    payment_reference: string;
    booking_reference: string;
    status: string;
    amount: string;
    currency: string;
    provider: string | null;
    payment_url: string | null;
    initiated_at: string | null;
};

type PayAtPropertyConfirmationResult = {
    booking_reference: string;
    status: string;
    payment_method: 'pay_at_property';
    payment_status: string;
    total_amount: string;
    currency: string;
    confirmed_at: string | null;
    pay_at_property_deadline: string | null;
};

function getCsrfHeaders(): Record<string, string> {
    const metaToken = document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content');

    if (metaToken) {
        return {
            'X-CSRF-TOKEN': metaToken,
        };
    }

    const xsrfCookie = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
        ?.split('=')
        .slice(1)
        .join('=');

    if (xsrfCookie) {
        return {
            'X-XSRF-TOKEN': decodeURIComponent(xsrfCookie),
        };
    }

    return {};
}

type CalendarPickerProps = {
    label: string;
    value: Date | null;
    minDate: Date;
    language: Language;
    icon: ReactNode;
    onChange: (date: Date) => void;
};

const detailScenes = [
    {
        src: '/assets/images/hero/lounge-primary.jpg',
        ar: 'مساحات هادئة للإقامة',
        en: 'Calm spaces for your stay',
    },
    {
        src: '/assets/images/hero/lounge-depth.jpg',
        ar: 'تفاصيل مصممة بعناية',
        en: 'Details considered with care',
    },
    {
        src: '/assets/images/hero/arrival-exterior.jpg',
        ar: 'لحظة الوصول إلى سفن لوز',
        en: 'Arriving at Seven Luz',
    },
] as const;

const heroSlides = [
    {
        image: 'https://res.cloudinary.com/deayevwds/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_2200/v1790603960/1_%D8%A7hero_nfizpg.jpg',
        ar: {
            eyebrow: 'سفن لوز · المصيف · الرياض',
            lineOne: 'إقامة مصممة',
            lineTwo: 'لتترك انطباعًا',
            description:
                'تجربة إقامة هادئة تجمع الأناقة والخصوصية والخدمة المدروسة من أول لحظة وصول',
        },
        en: {
            eyebrow: 'Seven Luz · Al Masif · Riyadh',
            lineOne: 'A stay designed',
            lineTwo: 'to leave an impression',
            description:
                'A calm serviced stay that brings together refined design privacy and thoughtful hospitality from the moment you arrive',
        },
        position: 'center center',
    },
    {
        image: 'https://res.cloudinary.com/deayevwds/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_2200/v1790603960/WhatsApp_Image_2026-09-21_at_2.04.08_PM_rjbanp.jpg',
        ar: {
            eyebrow: 'تفاصيل تصنع الفرق',
            lineOne: 'فخامة هادئة',
            lineTwo: 'في كل زاوية',
            description:
                'إضاءة دافئة وخامات أنيقة ومساحات مرتبة بعناية تمنحك إحساسًا بالراحة من أول نظرة',
        },
        en: {
            eyebrow: 'Details that make the difference',
            lineOne: 'Quiet luxury',
            lineTwo: 'in every corner',
            description:
                'Warm lighting refined materials and carefully composed spaces create comfort from the very first glance',
        },
        position: 'center center',
    },
    {
        image: 'https://res.cloudinary.com/deayevwds/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_2200/v1790603960/WhatsApp_Image_2026-09-21_at_2.03.44_PM_1_fm0jck.jpg',
        ar: {
            eyebrow: 'راحة تشبه البيت',
            lineOne: 'مساحتك الخاصة',
            lineTwo: 'بأسلوب أرقى',
            description:
                'خصوصية أكبر ومساحة مريحة وتجربة عملية تناسب الإقامات القصيرة والطويلة داخل الرياض',
        },
        en: {
            eyebrow: 'Comfort that feels familiar',
            lineOne: 'Your own space',
            lineTwo: 'with a refined touch',
            description:
                'More privacy more room to settle in and a practical stay made for both short visits and longer stays in Riyadh',
        },
        position: 'center center',
    },
    {
        image: 'https://res.cloudinary.com/deayevwds/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_2200/v1790603960/WhatsApp_Image_2026-09-21_at_2.03.57_PM_fhmdih.jpg',
        ar: {
            eyebrow: 'تجربة سفن لوز',
            lineOne: 'تفاصيل فندقية',
            lineTwo: 'بروح عصرية',
            description:
                'تصميم مريح وخدمة واضحة ولمسات بصرية راقية تجعل كل إقامة أكثر سلاسة وأناقة',
        },
        en: {
            eyebrow: 'The Seven Luz experience',
            lineOne: 'Hotel-level details',
            lineTwo: 'with a modern spirit',
            description:
                'Comfortable design clear service and refined visual details make every stay smoother more elegant and more memorable',
        },
        position: 'center center',
    },
] as const;

const content = {
    ar: {
        nav: {
            stay: 'الإقامة',
            amenities: 'الخدمات',
            rooms: 'الوحدات',
            gallery: 'المعرض',
            location: 'الموقع',
        },
        brandSub: 'الشقق المخدومة',
        branch: 'المصيف · الرياض',
        introLine: 'RIYADH · AL MASIF',

        eyebrow: 'استقبال يعتني بالتفاصيل',
        heroLineOne: 'إقامة مصممة',
        heroLineTwo: 'بطريقتك',
        heroDescription:
            'مساحات مخدومة تجمع الراحة والخصوصية وسهولة الوصول في قلب حي المصيف بمدينة الرياض',

        discover: 'اكتشف سفن لوز',
        directBooking: 'حجز مباشر',
        reception: 'استقبال متواصل',
        serviced: 'شقق مخدومة',

        booking: 'احجز إقامتك',
        checkIn: 'الوصول',
        checkOut: 'المغادرة',
        guests: 'الضيوف',
        selectDate: 'اختر التاريخ',
        search: 'تحقق من التوفر',
        mobileBook: 'ابدأ الحجز',

        admin: 'الإدارة',
        dashboard: 'لوحة التحكم',
        language: 'EN',

        storyEyebrow: 'تفاصيل من سفن لوز',
        storyTitleOne: 'كل زاوية',
        storyTitleTwo: 'تحكي إحساس مختلف',
        storyDescription:
            'من هدوء الصالة إلى لحظة الوصول تتكامل التفاصيل لتصنع تجربة مريحة وواضحة من أول خطوة',
        storyLink: 'استكشف المكان',
        storyCounter: 'لقطة',
    },

    en: {
        nav: {
            stay: 'Stay',
            amenities: 'Amenities',
            rooms: 'Apartments',
            gallery: 'Gallery',
            location: 'Location',
        },
        brandSub: 'Serviced Apartment',
        branch: 'Al Masif · Riyadh',
        introLine: 'RIYADH · AL MASIF',

        eyebrow: 'Reception with attention',
        heroLineOne: 'A stay shaped',
        heroLineTwo: 'around you',
        heroDescription:
            'Serviced spaces combining comfort privacy and effortless access in Al Masif Riyadh',

        discover: 'Discover Seven Luz',
        directBooking: 'Direct booking',
        reception: 'Attentive reception',
        serviced: 'Serviced apartments',

        booking: 'Book your stay',
        checkIn: 'Check-in',
        checkOut: 'Check-out',
        guests: 'Guests',
        selectDate: 'Select date',
        search: 'Check availability',
        mobileBook: 'Start booking',

        admin: 'Admin',
        dashboard: 'Dashboard',
        language: 'ع',

        storyEyebrow: 'Inside Seven Luz',
        storyTitleOne: 'Every corner',
        storyTitleTwo: 'has its own feeling',
        storyDescription:
            'From calm interiors to the moment of arrival every detail comes together for an effortless stay',
        storyLink: 'Explore the place',
        storyCounter: 'View',
    },
} as const;

function SunIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-[17px] w-[17px]"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2.5v2M12 19.5v2M4.5 12h-2M21.5 12h-2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-[17px] w-[17px]"
            aria-hidden="true"
        >
            <path d="M20 15.7A8.25 8.25 0 0 1 8.3 4a8.5 8.5 0 1 0 11.7 11.7Z" />
        </svg>
    );
}

function MenuIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-[18px] w-[18px]"
            aria-hidden="true"
        >
            <path d="M4 8h16M4 16h16" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-[18px] w-[18px]"
            aria-hidden="true"
        >
            <path d="M6 6l12 12M18 6 6 18" />
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
            className={`h-[18px] w-[18px] ${rtl ? '' : 'rotate-180'}`}
            aria-hidden="true"
        >
            <path d="M19 12H5" />
            <path d="m11 18-6-6 6-6" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-[16px] w-[16px]"
            aria-hidden="true"
        >
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-[16px] w-[16px]"
            aria-hidden="true"
        >
            <circle cx="9" cy="8" r="3" />
            <path d="M3.5 19c.4-4 2.6-6 5.5-6s5.1 2 5.5 6" />
            <path d="M15.5 5.5a3 3 0 0 1 0 5.6M16 13.5c2.6.5 4.1 2.3 4.5 5.5" />
        </svg>
    );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className={`h-4 w-4 ${
                direction === 'right' ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
        >
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}

function pad(value: number) {
    return `${value}`.padStart(2, '0');
}

function normaliseDate(date: Date) {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    );
}

function toApiDate(date: Date) {
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
    ].join('-');
}

function sameDay(a: Date | null, b: Date) {
    if (!a) {
        return false;
    }

    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function formatDate(date: Date | null, language: Language) {
    if (!date) {
        return '';
    }

    return new Intl.DateTimeFormat(
        language === 'ar' ? 'ar-SA-u-nu-latn' : 'en-GB',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        },
    ).format(date);
}

function monthLabel(date: Date, language: Language) {
    return new Intl.DateTimeFormat(
        language === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US',
        {
            month: 'long',
            year: 'numeric',
        },
    ).format(date);
}

function getCalendarDays(month: Date) {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);

    const days: Array<Date | null> = [];

    for (let index = 0; index < firstDay.getDay(); index += 1) {
        days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
        days.push(new Date(year, monthIndex, day));
    }

    while (days.length % 7 !== 0) {
        days.push(null);
    }

    return days;
}

function CalendarPicker({
    label,
    value,
    minDate,
    language,
    icon,
    onChange,
}: CalendarPickerProps) {
    const [open, setOpen] = useState(false);
    const [viewMonth, setViewMonth] = useState(() => {
        const source = value ?? minDate;

        return new Date(
            source.getFullYear(),
            source.getMonth(),
            1,
        );
    });

    const wrapperRef = useRef<HTMLDivElement>(null);

    const days = useMemo(
        () => getCalendarDays(viewMonth),
        [viewMonth],
    );

    const weekDays =
        language === 'ar'
            ? ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']
            : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    useEffect(() => {
        function handleOutside(event: globalThis.MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleOutside);

        return () => {
            document.removeEventListener('mousedown', handleOutside);
        };
    }, []);

    return (
        <div
            ref={wrapperRef}
            className="relative"
        >
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={`group flex min-h-[66px] w-full items-center gap-3 rounded-[16px] px-4 text-start transition-all duration-300 ${
                    open
                        ? 'bg-[#b9965a]/12 shadow-[inset_0_0_0_1px_rgba(185,150,90,0.42)] dark:bg-[#b9965a]/10'
                        : 'hover:bg-black/[0.055] dark:hover:bg-white/[0.065]'
                }`}
            >
                <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        open
                            ? 'border-[#b9965a] bg-[#b9965a] text-[#181915]'
                            : 'border-black/10 text-[#9a7845] group-hover:border-[#b9965a] group-hover:bg-[#b9965a] group-hover:text-[#181915] dark:border-white/12 dark:text-[#d2b372]'
                    }`}
                >
                    {icon}
                </span>

                <span className="min-w-0 flex-1">
                    <span className="mb-1 block text-[10px] font-semibold text-black/48 dark:text-white/44">
                        {label}
                    </span>

                    <span
                        className={`block truncate text-[10px] font-semibold ${
                            value
                                ? 'text-[#1c1e1c] dark:text-white/88'
                                : 'text-black/38 dark:text-white/35'
                        }`}
                    >
                        {value
                            ? formatDate(value, language)
                            : language === 'ar'
                              ? 'اختر التاريخ'
                              : 'Select date'}
                    </span>
                </span>
            </button>

            {open && (
                <div className="absolute bottom-[calc(100%+12px)] start-0 z-[120] w-[296px] rounded-[22px] border border-black/10 bg-[#f7f2e9]/[0.98] p-3 shadow-[0_26px_70px_rgba(0,0,0,0.25)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#191a18]/[0.98] sm:w-[310px]">
                    <div className="mb-3 flex items-center justify-between px-1">
                        <button
                            type="button"
                            onClick={() =>
                                setViewMonth(
                                    new Date(
                                        viewMonth.getFullYear(),
                                        viewMonth.getMonth() - 1,
                                        1,
                                    ),
                                )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/8 text-black/55 transition duration-300 hover:border-[#b9965a] hover:bg-[#b9965a] hover:text-[#171816] dark:border-white/10 dark:text-white/55"
                        >
                            <ChevronIcon direction="left" />
                        </button>

                        <p className="text-[11px] font-bold text-[#252723] dark:text-white/86">
                            {monthLabel(viewMonth, language)}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setViewMonth(
                                    new Date(
                                        viewMonth.getFullYear(),
                                        viewMonth.getMonth() + 1,
                                        1,
                                    ),
                                )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/8 text-black/55 transition duration-300 hover:border-[#b9965a] hover:bg-[#b9965a] hover:text-[#171816] dark:border-white/10 dark:text-white/55"
                        >
                            <ChevronIcon direction="right" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {weekDays.map((day, index) => (
                            <div
                                key={`${day}-${index}`}
                                className="flex h-7 items-center justify-center text-[8px] font-bold text-black/35 dark:text-white/30"
                            >
                                {day}
                            </div>
                        ))}

                        {days.map((day, index) => {
                            if (!day) {
                                return (
                                    <div
                                        key={`empty-${index}`}
                                        className="h-8"
                                    />
                                );
                            }

                            const disabled =
                                normaliseDate(day).getTime() <
                                normaliseDate(minDate).getTime();

                            const selected = sameDay(value, day);

                            return (
                                <button
                                    key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => {
                                        onChange(day);
                                        setOpen(false);
                                    }}
                                    className={`flex h-8 items-center justify-center rounded-[9px] text-[9px] font-semibold transition-all duration-200 ${
                                        disabled
                                            ? 'cursor-not-allowed text-black/18 dark:text-white/14'
                                            : selected
                                              ? 'bg-[#b9965a] text-[#171816] shadow-[0_6px_16px_rgba(185,150,90,0.26)]'
                                              : 'text-black/68 hover:bg-[#b9965a]/16 hover:text-[#7d5e2f] dark:text-white/66 dark:hover:bg-[#b9965a]/14 dark:hover:text-[#e0c182]'
                                    }`}
                                >
                                    {day.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function GuestPicker({
    value,
    language,
    onChange,
}: {
    value: number;
    language: Language;
    onChange: (value: number) => void;
}) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleOutside(event: globalThis.MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleOutside);

        return () => {
            document.removeEventListener('mousedown', handleOutside);
        };
    }, []);

    const guestLabel =
        language === 'ar'
            ? value === 1
                ? '1 ضيف'
                : `${value} ضيوف`
            : value === 1
              ? '1 guest'
              : `${value} guests`;

    return (
        <div
            ref={wrapperRef}
            className="relative"
        >
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={`group flex min-h-[66px] w-full items-center gap-3 rounded-[16px] px-4 text-start transition-all duration-300 ${
                    open
                        ? 'bg-[#b9965a]/12 shadow-[inset_0_0_0_1px_rgba(185,150,90,0.42)] dark:bg-[#b9965a]/10'
                        : 'hover:bg-black/[0.055] dark:hover:bg-white/[0.065]'
                }`}
            >
                <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        open
                            ? 'border-[#b9965a] bg-[#b9965a] text-[#181915]'
                            : 'border-black/10 text-[#9a7845] group-hover:border-[#b9965a] group-hover:bg-[#b9965a] group-hover:text-[#181915] dark:border-white/12 dark:text-[#d2b372]'
                    }`}
                >
                    <UsersIcon />
                </span>

                <span className="min-w-0 flex-1">
                    <span className="mb-1 block text-[10px] font-semibold text-black/48 dark:text-white/44">
                        {language === 'ar' ? 'الضيوف' : 'Guests'}
                    </span>

                    <span className="block text-[13px] font-bold text-[#1c1e1c] dark:text-white/90">
                        {guestLabel}
                    </span>
                </span>
            </button>

            {open && (
                <div className="absolute bottom-[calc(100%+12px)] start-0 z-[120] w-[210px] rounded-[20px] border border-black/10 bg-[#f7f2e9]/[0.98] p-2 shadow-[0_24px_65px_rgba(0,0,0,0.24)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#191a18]/[0.98]">
                    {[1, 2, 3, 4, 5, 6].map((guest) => (
                        <button
                            key={guest}
                            type="button"
                            onClick={() => {
                                onChange(guest);
                                setOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-[10px] font-semibold transition-all duration-250 ${
                                value === guest
                                    ? 'bg-[#b9965a] text-[#171816]'
                                    : 'text-black/62 hover:bg-[#b9965a]/14 hover:text-[#7e5f31] dark:text-white/65 dark:hover:bg-[#b9965a]/12 dark:hover:text-[#e0c182]'
                            }`}
                        >
                            <span>
                                {language === 'ar'
                                    ? guest === 1
                                        ? 'ضيف واحد'
                                        : `${guest} ضيوف`
                                    : guest === 1
                                      ? '1 guest'
                                      : `${guest} guests`}
                            </span>

                            <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                    value === guest
                                        ? 'bg-[#171816]'
                                        : 'bg-black/15 dark:bg-white/15'
                                }`}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage().props as {
        auth: {
            user: unknown | null;
        };
    };

    const rootRef = useRef<HTMLDivElement>(null);

    const introRef = useRef<HTMLDivElement>(null);
    const introTopRef = useRef<HTMLDivElement>(null);
    const introBottomRef = useRef<HTMLDivElement>(null);
    const introLogoRef = useRef<HTMLImageElement>(null);
    const introCaptionRef = useRef<HTMLParagraphElement>(null);
    const introRingOneRef = useRef<HTMLDivElement>(null);
    const introRingTwoRef = useRef<HTMLDivElement>(null);
    const introBeamRef = useRef<HTMLDivElement>(null);

    const headerRef = useRef<HTMLElement>(null);
    const desktopNavRef = useRef<HTMLDivElement>(null);
    const heroImageRef = useRef<HTMLImageElement>(null);
    const heroLightRef = useRef<HTMLDivElement>(null);

    const eyebrowRef = useRef<HTMLDivElement>(null);
    const titleOneRef = useRef<HTMLSpanElement>(null);
    const titleTwoRef = useRef<HTMLSpanElement>(null);
    const descriptionRef = useRef<HTMLDivElement>(null);
    const chipsRef = useRef<HTMLDivElement>(null);
    const discoverRef = useRef<HTMLAnchorElement>(null);

    const bookingRef = useRef<HTMLFormElement>(null);

    const storySectionRef = useRef<HTMLElement>(null);
    const storyCopyRef = useRef<HTMLDivElement>(null);
    const storyStageRef = useRef<HTMLDivElement>(null);
    const storyCardRef = useRef<HTMLDivElement>(null);

    const detailRefs = useRef<Array<HTMLDivElement | null>>([]);
    const activeDetailRef = useRef(0);
    const firstDetailChangeRef = useRef(true);

    const [language, setLanguage] = useState<Language>('ar');
    const [theme, setTheme] = useState<ThemeMode>('dark');
    const [menuOpen, setMenuOpen] = useState(false);
    const [logoEngaged, setLogoEngaged] = useState(false);
    const [mobileBookingOpen, setMobileBookingOpen] = useState(false);
    const [detailIndex, setDetailIndex] = useState(0);
    const [heroIndex, setHeroIndex] = useState(0);
    const [heroDirection, setHeroDirection] = useState<1 | -1>(1);
    const [heroPaused, setHeroPaused] = useState(false);

    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [guests, setGuests] = useState(2);
    const [availabilityResults, setAvailabilityResults] = useState<
        AvailabilityResult[]
    >([]);
    const [availabilityOpen, setAvailabilityOpen] = useState(false);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [availabilityError, setAvailabilityError] = useState<string | null>(
        null,
    );
    const [selectedRoom, setSelectedRoom] = useState<AvailabilityResult | null>(
        null,
    );
    const [guestDetailsOpen, setGuestDetailsOpen] = useState(false);
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [holdLoading, setHoldLoading] = useState(false);
    const [holdError, setHoldError] = useState<string | null>(null);
    const [createdHold, setCreatedHold] = useState<BookingHoldResult | null>(
        null,
    );
    const [verificationSent, setVerificationSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [developmentCode, setDevelopmentCode] = useState<string | null>(null);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(
        null,
    );
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<CouponApplyResult | null>(
        null,
    );
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
        'pay_now' | 'pay_at_property' | null
    >(null);
    const [paymentMethodLoading, setPaymentMethodLoading] = useState(false);
    const [paymentMethodError, setPaymentMethodError] = useState<string | null>(
        null,
    );
    const [paymentStartLoading, setPaymentStartLoading] = useState(false);
    const [paymentStartError, setPaymentStartError] = useState<string | null>(
        null,
    );
    const [startedPayment, setStartedPayment] =
        useState<PaymentStartResult | null>(null);
    const [payAtPropertyLoading, setPayAtPropertyLoading] = useState(false);
    const [payAtPropertyError, setPayAtPropertyError] = useState<string | null>(
        null,
    );
    const [confirmedPayAtProperty, setConfirmedPayAtProperty] =
        useState<PayAtPropertyConfirmationResult | null>(null);

    const isRtl = language === 'ar';
    const t = content[language];
    const activeHero = heroSlides[heroIndex];
    const activeHeroCopy = activeHero[language];

    function changeHeroSlide(nextIndex: number, direction: 1 | -1 = 1) {
        const normalized =
            (nextIndex + heroSlides.length) % heroSlides.length;

        if (normalized === heroIndex) {
            return;
        }

        setHeroDirection(direction);
        setHeroIndex(normalized);
    }

    const today = useMemo(
        () => normaliseDate(new Date()),
        [],
    );

    const checkoutMinimum = useMemo(() => {
        if (!checkIn) {
            return today;
        }

        const next = new Date(checkIn);
        next.setDate(next.getDate() + 1);

        return normaliseDate(next);
    }, [checkIn, today]);

    useEffect(() => {
        if (
            checkOut &&
            normaliseDate(checkOut).getTime() <
                checkoutMinimum.getTime()
        ) {
            setCheckOut(null);
        }
    }, [checkOut, checkoutMinimum]);

    useEffect(() => {
        const stored = window.localStorage.getItem(
            'seven-luz-theme',
        ) as ThemeMode | null;

        const preferred =
            stored ??
            (window.matchMedia('(prefers-color-scheme: light)').matches
                ? 'light'
                : 'dark');

        setTheme(preferred);

        document.documentElement.classList.toggle(
            'dark',
            preferred === 'dark',
        );
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle(
            'dark',
            theme === 'dark',
        );

        window.localStorage.setItem('seven-luz-theme', theme);
    }, [theme]);

    useEffect(() => {
        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reducedMotion || heroPaused) {
            return;
        }

        const interval = window.setInterval(() => {
            setHeroDirection(1);
            setHeroIndex((current) => (current + 1) % heroSlides.length);
        }, 6400);

        return () => window.clearInterval(interval);
    }, [heroPaused]);

    useEffect(() => {
        const root = rootRef.current;

        if (!root) {
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        const context = gsap.context(() => {
            if (reducedMotion) {
                gsap.set(introRef.current, {
                    display: 'none',
                });

                gsap.set(
                    [
                        headerRef.current,
                        desktopNavRef.current,
                        eyebrowRef.current,
                        titleOneRef.current,
                        titleTwoRef.current,
                        descriptionRef.current,
                        chipsRef.current,
                        discoverRef.current,
                        bookingRef.current,
                    ],
                    {
                        autoAlpha: 1,
                        x: 0,
                        y: 0,
                        filter: 'blur(0px)',
                    },
                );

                return;
            }

            gsap.set([headerRef.current, desktopNavRef.current], {
                autoAlpha: 0,
                y: -24,
            });

            gsap.set(eyebrowRef.current, {
                autoAlpha: 0,
                y: 14,
            });

            gsap.set(titleOneRef.current, {
                autoAlpha: 0,
                y: 54,
                filter: 'blur(10px)',
            });

            gsap.set(titleTwoRef.current, {
                autoAlpha: 0,
                y: 64,
                filter: 'blur(12px)',
            });

            gsap.set(descriptionRef.current, {
                autoAlpha: 0,
                y: 24,
            });

            gsap.set(chipsRef.current, {
                autoAlpha: 0,
                y: 20,
            });

            gsap.set(discoverRef.current, {
                autoAlpha: 0,
                x: isRtl ? 24 : -24,
            });

            gsap.set(bookingRef.current, {
                autoAlpha: 0,
                y: 32,
            });

            gsap.set(heroImageRef.current, {
                scale: 1.09,
            });

            gsap.set(introLogoRef.current, {
                autoAlpha: 0,
                scale: 0.78,
            });

            gsap.set(introCaptionRef.current, {
                autoAlpha: 0,
                y: 12,
            });

            gsap.set(introRingOneRef.current, {
                autoAlpha: 0,
                scale: 0.7,
                rotate: -18,
            });

            gsap.set(introRingTwoRef.current, {
                autoAlpha: 0,
                scale: 0.75,
                rotate: 20,
            });

            gsap.set(introBeamRef.current, {
                scaleX: 0,
                transformOrigin: 'center',
            });

            const timeline = gsap.timeline({
                defaults: {
                    ease: 'power3.out',
                },
            });

            timeline
                .to(introRingOneRef.current, {
                    autoAlpha: 1,
                    scale: 1,
                    rotate: 0,
                    duration: 0.9,
                })
                .to(
                    introRingTwoRef.current,
                    {
                        autoAlpha: 1,
                        scale: 1,
                        rotate: 0,
                        duration: 1,
                    },
                    '-=0.72',
                )
                .to(
                    introLogoRef.current,
                    {
                        autoAlpha: 1,
                        scale: 1,
                        duration: 0.92,
                    },
                    '-=0.75',
                )
                .to(
                    introBeamRef.current,
                    {
                        scaleX: 1,
                        duration: 0.75,
                        ease: 'power4.out',
                    },
                    '-=0.6',
                )
                .to(
                    introCaptionRef.current,
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.55,
                    },
                    '-=0.32',
                )
                .to(
                    introRingOneRef.current,
                    {
                        rotate: 28,
                        scale: 1.06,
                        duration: 0.8,
                        ease: 'power2.inOut',
                    },
                    '+=0.22',
                )
                .to(
                    introRingTwoRef.current,
                    {
                        rotate: -24,
                        scale: 1.08,
                        duration: 0.8,
                        ease: 'power2.inOut',
                    },
                    '<',
                )
                .to(
                    introLogoRef.current,
                    {
                        scale: 0.95,
                        duration: 0.55,
                        ease: 'power2.inOut',
                    },
                    '<',
                )
                .to(
                    introTopRef.current,
                    {
                        yPercent: -100,
                        duration: 1.05,
                        ease: 'power4.inOut',
                    },
                    '<',
                )
                .to(
                    introBottomRef.current,
                    {
                        yPercent: 100,
                        duration: 1.05,
                        ease: 'power4.inOut',
                    },
                    '<',
                )
                .to(
                    introRef.current,
                    {
                        autoAlpha: 0,
                        duration: 0.08,
                        onComplete: () => {
                            if (introRef.current) {
                                introRef.current.style.display = 'none';
                            }
                        },
                    },
                    '-=0.04',
                )
                .to(
                    heroImageRef.current,
                    {
                        scale: 1.015,
                        duration: 1.8,
                        ease: 'power3.out',
                    },
                    '-=1.05',
                )
                .to(
                    [headerRef.current, desktopNavRef.current],
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.68,
                    },
                    '-=1.08',
                )
                .to(
                    eyebrowRef.current,
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.65,
                    },
                    '-=0.52',
                )
                .to(
                    titleOneRef.current,
                    {
                        autoAlpha: 1,
                        y: 0,
                        filter: 'blur(0px)',
                        duration: 0.95,
                        ease: 'power4.out',
                    },
                    '-=0.35',
                )
                .to(
                    titleTwoRef.current,
                    {
                        autoAlpha: 1,
                        y: 0,
                        filter: 'blur(0px)',
                        duration: 1.05,
                        ease: 'power4.out',
                    },
                    '-=0.72',
                )
                .to(
                    descriptionRef.current,
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.72,
                    },
                    '-=0.48',
                )
                .to(
                    discoverRef.current,
                    {
                        autoAlpha: 1,
                        x: 0,
                        duration: 0.66,
                    },
                    '-=0.58',
                )
                .to(
                    chipsRef.current,
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.65,
                    },
                    '-=0.48',
                )
                .to(
                    bookingRef.current,
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.78,
                    },
                    '-=0.45',
                );

            const chips =
                chipsRef.current?.querySelectorAll('[data-chip]');

            if (chips?.length) {
                gsap.fromTo(
                    chips,
                    {
                        scale: 0.86,
                    },
                    {
                        scale: 1,
                        duration: 0.55,
                        stagger: 0.08,
                        ease: 'back.out(1.7)',
                        delay: 3.75,
                    },
                );
            }
        }, root);

        return () => context.revert();
    }, []);

    useEffect(() => {
        const section = storySectionRef.current;

        if (!section) {
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reducedMotion) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    return;
                }

                const timeline = gsap.timeline();

                timeline
                    .fromTo(
                        storyCopyRef.current,
                        {
                            autoAlpha: 0,
                            y: 44,
                        },
                        {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.9,
                            ease: 'power4.out',
                        },
                    )
                    .fromTo(
                        storyStageRef.current,
                        {
                            autoAlpha: 0,
                            scale: 0.94,
                            y: 36,
                        },
                        {
                            autoAlpha: 1,
                            scale: 1,
                            y: 0,
                            duration: 1.05,
                            ease: 'power4.out',
                        },
                        '-=0.6',
                    );

                if (storyCardRef.current) {
                    gsap.to(storyCardRef.current, {
                        y: -9,
                        duration: 3.6,
                        repeat: -1,
                        yoyo: true,
                        ease: 'sine.inOut',
                    });
                }

                observer.disconnect();
            },
            {
                threshold: 0.2,
            },
        );

        observer.observe(section);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reducedMotion) {
            return;
        }

        const timer = window.setInterval(() => {
            setDetailIndex(
                (current) => (current + 1) % detailScenes.length,
            );
        }, 4600);

        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        if (firstDetailChangeRef.current) {
            detailRefs.current.forEach((element, index) => {
                if (!element) {
                    return;
                }

                gsap.set(element, {
                    autoAlpha: index === 0 ? 1 : 0,
                    clipPath:
                        index === 0
                            ? 'inset(0% 0% 0% 0%)'
                            : 'inset(100% 0% 0% 0%)',
                });
            });

            firstDetailChangeRef.current = false;

            return;
        }

        const incoming = detailRefs.current[detailIndex];
        const outgoing = detailRefs.current[activeDetailRef.current];

        if (!incoming || !outgoing || incoming === outgoing) {
            activeDetailRef.current = detailIndex;

            return;
        }

        const incomingImage = incoming.querySelector('img');

        gsap.killTweensOf([incoming, outgoing, incomingImage]);

        gsap.set(incoming, {
            autoAlpha: 1,
            zIndex: 3,
            clipPath: isRtl
                ? 'inset(0% 100% 0% 0%)'
                : 'inset(0% 0% 0% 100%)',
        });

        gsap.set(outgoing, {
            autoAlpha: 1,
            zIndex: 2,
        });

        gsap.set(incomingImage, {
            scale: 1.11,
        });

        const timeline = gsap.timeline();

        timeline
            .to(incoming, {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 1.15,
                ease: 'power4.inOut',
            })
            .to(
                incomingImage,
                {
                    scale: 1,
                    duration: 1.55,
                    ease: 'power3.out',
                },
                '<',
            )
            .set(outgoing, {
                autoAlpha: 0,
                zIndex: 1,
            });

        activeDetailRef.current = detailIndex;
    }, [detailIndex, isRtl]);

    function handleHeroMove(event: MouseEvent<HTMLElement>) {
        if (window.innerWidth < 1024) {
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();

        const x =
            (event.clientX - rect.left) / rect.width - 0.5;

        const y =
            (event.clientY - rect.top) / rect.height - 0.5;

        gsap.to(heroImageRef.current, {
            xPercent: x * 1.45,
            yPercent: y * 1.05,
            scale: 1.028,
            duration: 1.35,
            ease: 'power3.out',
            overwrite: 'auto',
        });

        gsap.to(heroLightRef.current, {
            xPercent: x * -14,
            yPercent: y * -10,
            duration: 1.65,
            ease: 'power3.out',
            overwrite: 'auto',
        });
    }

    function handleHeroLeave() {
        gsap.to(heroImageRef.current, {
            xPercent: 0,
            yPercent: 0,
            scale: 1.015,
            duration: 1.5,
            ease: 'power3.out',
            overwrite: 'auto',
        });

        gsap.to(heroLightRef.current, {
            xPercent: 0,
            yPercent: 0,
            duration: 1.6,
            ease: 'power3.out',
            overwrite: 'auto',
        });
    }

    function handleStoryMove(event: ReactPointerEvent<HTMLDivElement>) {
        const card = storyCardRef.current;

        if (!card) {
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        gsap.to(card, {
            rotateY: x * 7,
            rotateX: y * -6,
            x: x * 7,
            y: y * 7,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            transformPerspective: 900,
            overwrite: 'auto',
        });
    }

    function handleStoryLeave() {
        const card = storyCardRef.current;

        if (!card) {
            return;
        }

        gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            x: 0,
            y: -9,
            scale: 1,
            duration: 0.82,
            ease: 'power3.out',
            overwrite: 'auto',
        });
    }

    async function runAvailabilitySearch() {
        if (!checkIn || !checkOut) {
            setAvailabilityError(
                language === 'ar'
                    ? 'اختر تاريخ الوصول والمغادرة أولاً'
                    : 'Select check-in and check-out dates first',
            );
            setAvailabilityResults([]);
            setAvailabilityOpen(true);

            return;
        }

        if (
            normaliseDate(checkOut).getTime() <=
            normaliseDate(checkIn).getTime()
        ) {
            setAvailabilityError(
                language === 'ar'
                    ? 'تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول'
                    : 'Check-out must be after check-in',
            );
            setAvailabilityResults([]);
            setAvailabilityOpen(true);

            return;
        }

        setAvailabilityLoading(true);
        setAvailabilityError(null);

        try {
            const params = new URLSearchParams({
                branch_id: '1',
                check_in: toApiDate(checkIn),
                check_out: toApiDate(checkOut),
            });

            const response = await fetch(
                `/booking/availability?${params.toString()}`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            const payload = (await response.json()) as {
                data?: AvailabilityResult[];
                message?: string;
                errors?: Record<string, string[]>;
            };

            if (!response.ok) {
                const firstValidationMessage = payload.errors
                    ? Object.values(payload.errors).flat()[0]
                    : null;

                throw new Error(
                    firstValidationMessage ??
                        payload.message ??
                        (language === 'ar'
                            ? 'تعذر التحقق من التوفر'
                            : 'Unable to check availability'),
                );
            }

            setAvailabilityResults(payload.data ?? []);
            setAvailabilityOpen(true);
            setMobileBookingOpen(false);
        } catch (error) {
            setAvailabilityResults([]);
            setAvailabilityError(
                error instanceof Error
                    ? error.message
                    : language === 'ar'
                      ? 'تعذر التحقق من التوفر'
                      : 'Unable to check availability',
            );
            setAvailabilityOpen(true);
        } finally {
            setAvailabilityLoading(false);
        }
    }

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void runAvailabilitySearch();
    }

    function beginBooking(result: AvailabilityResult) {
        setSelectedRoom(result);
        setAvailabilityOpen(false);
        setHoldError(null);
        setCreatedHold(null);
        setVerificationSent(false);
        setVerificationCode('');
        setDevelopmentCode(null);
        setVerificationError(null);
        setPhoneVerified(false);
        setCouponCode('');
        setCouponError(null);
        setAppliedCoupon(null);
        setSelectedPaymentMethod(null);
        setPaymentMethodError(null);
        setPaymentStartError(null);
        setStartedPayment(null);
        setPayAtPropertyError(null);
        setConfirmedPayAtProperty(null);
        setGuestDetailsOpen(true);
    }

    async function createBookingHold(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedRoom || !checkIn || !checkOut) {
            setHoldError(
                language === 'ar'
                    ? 'بيانات الحجز غير مكتملة، تحقق من التوفر مرة أخرى'
                    : 'Booking details are incomplete. Please check availability again',
            );

            return;
        }

        if (!guestName.trim() || !guestPhone.trim()) {
            setHoldError(
                language === 'ar'
                    ? 'الاسم ورقم الجوال مطلوبان للمتابعة'
                    : 'Name and mobile number are required to continue',
            );

            return;
        }

        setHoldLoading(true);
        setHoldError(null);

        try {
            const response = await fetch('/booking/hold', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...getCsrfHeaders(),
                },
                body: JSON.stringify({
                    branch_id: 1,
                    room_type_id: selectedRoom.room_type_id,
                    check_in: toApiDate(checkIn),
                    check_out: toApiDate(checkOut),
                    guest_name: guestName.trim(),
                    guest_phone: guestPhone.trim(),
                    guest_email: guestEmail.trim() || null,
                    guest_count: guests,
                }),
            });

            const payload = (await response.json()) as {
                data?: BookingHoldResult;
                message?: string;
                errors?: Record<string, string[]>;
            };

            if (!response.ok || !payload.data) {
                const firstValidationMessage = payload.errors
                    ? Object.values(payload.errors).flat()[0]
                    : null;

                throw new Error(
                    firstValidationMessage ??
                        payload.message ??
                        (language === 'ar'
                            ? 'تعذر بدء الحجز، حاول مرة أخرى'
                            : 'Unable to start the booking. Please try again'),
                );
            }

            setCreatedHold(payload.data);

            setAvailabilityResults((current) =>
                current
                    .map((result) =>
                        result.room_type_id === selectedRoom.room_type_id
                            ? {
                                  ...result,
                                  available_units: Math.max(
                                      0,
                                      result.available_units - 1,
                                  ),
                              }
                            : result,
                    )
                    .filter((result) => result.available_units > 0),
            );
        } catch (error) {
            setHoldError(
                error instanceof Error
                    ? error.message
                    : language === 'ar'
                      ? 'تعذر بدء الحجز، حاول مرة أخرى'
                      : 'Unable to start the booking. Please try again',
            );
        } finally {
            setHoldLoading(false);
        }
    }

    async function sendPhoneVerification() {
        if (!createdHold) {
            return;
        }

        setVerificationLoading(true);
        setVerificationError(null);

        try {
            const response = await fetch(
                `/booking/${createdHold.id}/phone-verification/send`,
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        ...getCsrfHeaders(),
                    },
                },
            );

            const payload = (await response.json()) as {
                data?: PhoneVerificationSendResult;
                message?: string;
                errors?: Record<string, string[]>;
            };

            if (!response.ok || !payload.data) {
                const firstValidationMessage = payload.errors
                    ? Object.values(payload.errors).flat()[0]
                    : null;

                throw new Error(
                    firstValidationMessage ??
                        payload.message ??
                        (language === 'ar'
                            ? 'تعذر إرسال كود التحقق'
                            : 'Unable to send the verification code'),
                );
            }

            setVerificationSent(true);
            setDevelopmentCode(payload.data.development_code);
            setVerificationCode('');
        } catch (error) {
            setVerificationError(
                error instanceof Error
                    ? error.message
                    : language === 'ar'
                      ? 'تعذر إرسال كود التحقق'
                      : 'Unable to send the verification code',
            );
        } finally {
            setVerificationLoading(false);
        }
    }

    async function verifyPhoneCode(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!createdHold) {
            return;
        }

        const code = verificationCode.trim();

        if (!/^\d{6}$/.test(code)) {
            setVerificationError(
                language === 'ar'
                    ? 'أدخل كود التحقق المكوّن من 6 أرقام'
                    : 'Enter the 6-digit verification code',
            );

            return;
        }

        setVerificationLoading(true);
        setVerificationError(null);

        try {
            const response = await fetch(
                `/booking/${createdHold.id}/phone-verification/verify`,
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...getCsrfHeaders(),
                    },
                    body: JSON.stringify({
                        code,
                    }),
                },
            );

            const payload = (await response.json()) as {
                data?: PhoneVerificationVerifyResult;
                message?: string;
                errors?: Record<string, string[]>;
            };

            if (!response.ok || !payload.data) {
                const firstValidationMessage = payload.errors
                    ? Object.values(payload.errors).flat()[0]
                    : null;

                throw new Error(
                    firstValidationMessage ??
                        payload.message ??
                        (language === 'ar'
                            ? 'تعذر التحقق من الكود'
                            : 'Unable to verify the code'),
                );
            }

            setPhoneVerified(payload.data.phone_verified);
            setCreatedHold((current) =>
                current
                    ? {
                          ...current,
                          phone_verified: payload.data?.phone_verified ?? true,
                      }
                    : current,
            );
            setVerificationError(null);
        } catch (error) {
            setVerificationError(
                error instanceof Error
                    ? error.message
                    : language === 'ar'
                      ? 'تعذر التحقق من الكود'
                      : 'Unable to verify the code',
            );
        } finally {
            setVerificationLoading(false);
        }
    }


    async function applyCoupon(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!createdHold || !phoneVerified) {
            return;
        }

        const code = couponCode.trim();

        if (!code) {
            setCouponError(
                language === 'ar'
                    ? 'أدخل كود الخصم أولاً'
                    : 'Enter a coupon code first',
            );

            return;
        }

        setCouponLoading(true);
        setCouponError(null);

        try {
            const response = await fetch(
                `/booking/${createdHold.id}/coupon`,
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...getCsrfHeaders(),
                    },
                    body: JSON.stringify({
                        code,
                    }),
                },
            );

            const payload = (await response.json()) as {
                data?: CouponApplyResult;
                message?: string;
                errors?: Record<string, string[]>;
            };

            if (!response.ok || !payload.data) {
                const firstValidationMessage = payload.errors
                    ? Object.values(payload.errors).flat()[0]
                    : null;

                throw new Error(
                    firstValidationMessage ??
                        payload.message ??
                        (language === 'ar'
                            ? 'تعذر تطبيق كود الخصم'
                            : 'Unable to apply the coupon code'),
                );
            }

            setAppliedCoupon(payload.data);
            setCouponCode(payload.data.coupon_code);
            setCreatedHold((current) =>
                current
                    ? {
                          ...current,
                          subtotal: payload.data?.subtotal ?? current.subtotal,
                          discount_amount:
                              payload.data?.discount_amount ??
                              current.discount_amount,
                          total_amount:
                              payload.data?.total_amount ??
                              current.total_amount,
                      }
                    : current,
            );
        } catch (error) {
            setCouponError(
                error instanceof Error
                    ? error.message
                    : language === 'ar'
                      ? 'تعذر تطبيق كود الخصم'
                      : 'Unable to apply the coupon code',
            );
        } finally {
            setCouponLoading(false);
        }
    }


    async function selectPaymentMethod(
        paymentMethod: 'pay_now' | 'pay_at_property',
    ) {
        if (!createdHold || !phoneVerified) {
            return;
        }

        setPaymentMethodLoading(true);
        setPaymentMethodError(null);

        try {
            const response = await fetch(
                `/booking/${createdHold.id}/payment-method`,
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        ...getCsrfHeaders(),
                    },
                    body: JSON.stringify({
                        payment_method: paymentMethod,
                    }),
                },
            );

            const payload = (await response.json()) as {
                data?: PaymentMethodResult;
                message?: string;
                errors?: Record<string, string[]>;
            };

            if (!response.ok || !payload.data) {
                const firstValidationMessage = payload.errors
                    ? Object.values(payload.errors).flat()[0]
                    : null;

                throw new Error(
                    firstValidationMessage ??
                        payload.message ??
                        (language === 'ar'
                            ? 'تعذر حفظ طريقة الدفع'
                            : 'Unable to save the payment method'),
                );
            }

            setSelectedPaymentMethod(payload.data.payment_method);
            setPaymentStartError(null);
            setStartedPayment(null);
            setPayAtPropertyError(null);
            setConfirmedPayAtProperty(null);
            setCreatedHold((current) =>
                current
                    ? {
                          ...current,
                          payment_method: payload.data?.payment_method ?? null,
                          payment_status:
                              payload.data?.payment_status ??
                              current.payment_status,
                          subtotal: payload.data?.subtotal ?? current.subtotal,
                          discount_amount:
                              payload.data?.discount_amount ??
                              current.discount_amount,
                          total_amount:
                              payload.data?.total_amount ??
                              current.total_amount,
                      }
                    : current,
            );
        } catch (error) {
            setPaymentMethodError(
                error instanceof Error
                    ? error.message
                    : language === 'ar'
                      ? 'تعذر حفظ طريقة الدفع'
                      : 'Unable to save the payment method',
            );
        } finally {
            setPaymentMethodLoading(false);
        }
    }

    async function startOnlinePayment() {
        if (
            !createdHold ||
            !phoneVerified ||
            selectedPaymentMethod !== 'pay_now'
        ) {
            return;
        }

        setPaymentStartLoading(true);
        setPaymentStartError(null);

        try {
            const response = await fetch(
                `/booking/${createdHold.id}/payment/start`,
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        ...getCsrfHeaders(),
                    },
                },
            );

            const payload = (await response.json()) as {
                data?: PaymentStartResult;
                message?: string;
                errors?: Record<string, string[]>;
            };

            if (!response.ok || !payload.data) {
                const firstValidationMessage = payload.errors
                    ? Object.values(payload.errors).flat()[0]
                    : null;

                throw new Error(
                    firstValidationMessage ??
                        payload.message ??
                        (language === 'ar'
                            ? 'تعذر تجهيز عملية الدفع، حاول مرة أخرى'
                            : 'Unable to prepare the payment. Please try again'),
                );
            }

            setStartedPayment(payload.data);

            if (payload.data.payment_url) {
                window.location.assign(payload.data.payment_url);
            }
        } catch (error) {
            setPaymentStartError(
                error instanceof Error
                    ? error.message
                    : language === 'ar'
                      ? 'تعذر تجهيز عملية الدفع، حاول مرة أخرى'
                      : 'Unable to prepare the payment. Please try again',
            );
        } finally {
            setPaymentStartLoading(false);
        }
    }

    async function confirmPayAtPropertyBooking() {
        if (
            !createdHold ||
            !phoneVerified ||
            selectedPaymentMethod !== 'pay_at_property'
        ) {
            return;
        }

        setPayAtPropertyLoading(true);
        setPayAtPropertyError(null);

        try {
            const response = await fetch(
                `/booking/${createdHold.id}/confirm-pay-at-property`,
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        ...getCsrfHeaders(),
                    },
                },
            );

            const payload = (await response.json()) as {
                data?: PayAtPropertyConfirmationResult;
                message?: string;
                errors?: Record<string, string[]>;
            };

            if (!response.ok || !payload.data) {
                const firstValidationMessage = payload.errors
                    ? Object.values(payload.errors).flat()[0]
                    : null;

                throw new Error(
                    firstValidationMessage ??
                        payload.message ??
                        (language === 'ar'
                            ? 'تعذر تأكيد الحجز، حاول مرة أخرى'
                            : 'Unable to confirm the booking. Please try again'),
                );
            }

            setConfirmedPayAtProperty(payload.data);
            setCreatedHold((current) =>
                current
                    ? {
                          ...current,
                          status: payload.data?.status ?? current.status,
                          payment_method:
                              payload.data?.payment_method ??
                              current.payment_method,
                          payment_status:
                              payload.data?.payment_status ??
                              current.payment_status,
                          hold_expires_at: null,
                      }
                    : current,
            );
        } catch (error) {
            setPayAtPropertyError(
                error instanceof Error
                    ? error.message
                    : language === 'ar'
                      ? 'تعذر تأكيد الحجز، حاول مرة أخرى'
                      : 'Unable to confirm the booking. Please try again',
            );
        } finally {
            setPayAtPropertyLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>
                    {language === 'ar'
                        ? 'سفن لوز للشقق المخدومة'
                        : 'Seven Luz Serviced Apartment'}
                </title>

                <meta
                    name="description"
                    content={
                        language === 'ar'
                            ? 'سفن لوز للشقق المخدومة في حي المصيف بمدينة الرياض'
                            : 'Seven Luz Serviced Apartment in Al Masif Riyadh'
                    }
                />
            </Head>

            <div
                ref={rootRef}
                dir={isRtl ? 'rtl' : 'ltr'}
                lang={language}
                className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground"
            >
                <div
                    ref={introRef}
                    className="fixed inset-0 z-[200] overflow-hidden bg-[#10110f]"
                >
                    <div
                        ref={introTopRef}
                        className="absolute inset-x-0 top-0 h-1/2 bg-[#10110f]"
                    />

                    <div
                        ref={introBottomRef}
                        className="absolute inset-x-0 bottom-0 h-1/2 bg-[#10110f]"
                    />

                    <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_center,rgba(199,163,101,0.10),transparent_35%)]" />

                    <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
                        <div className="relative flex h-[360px] w-[360px] max-w-[86vw] items-center justify-center sm:h-[430px] sm:w-[430px]">
                            <div
                                ref={introRingOneRef}
                                className="absolute inset-[4%] rounded-[35%] border border-[#c7a365]/18"
                            />

                            <div
                                ref={introRingTwoRef}
                                className="absolute inset-[14%] rounded-[31%] border border-white/[0.07]"
                            />

                            <div className="relative z-10 flex flex-col items-center">
                                <img
                                    ref={introLogoRef}
                                    src="/assets/brand/seven-luz-logo.png"
                                    alt="Seven Luz"
                                    className="w-[190px] select-none object-contain sm:w-[240px]"
                                    draggable={false}
                                />

                                <div
                                    ref={introBeamRef}
                                    className="mt-7 h-px w-28 bg-gradient-to-r from-transparent via-[#d1ae6d] to-transparent"
                                />

                                <p
                                    ref={introCaptionRef}
                                    className="mt-4 text-[9px] font-semibold tracking-[0.42em] text-[#c7a365]/78 sm:text-[10px]"
                                >
                                    {t.introLine}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <main
                    onMouseMove={handleHeroMove}
                    onMouseLeave={handleHeroLeave}
                    className="relative min-h-[100svh] w-full overflow-hidden bg-[#111210]"
                >
                    <div
                        className="absolute inset-0 overflow-hidden"
                        onMouseEnter={() => setHeroPaused(true)}
                        onMouseLeave={() => setHeroPaused(false)}
                    >
                        {heroSlides.map((slide, index) => {
                            const active = index === heroIndex;

                            return (
                                <div
                                    key={slide.image}
                                    className={`sl-hero-slide absolute inset-0 ${active ? 'sl-hero-slide-active z-[2]' : 'z-0'}`}
                                    data-direction={heroDirection}
                                    aria-hidden={!active}
                                >
                                    <img
                                        ref={active ? heroImageRef : undefined}
                                        src={slide.image}
                                        alt={
                                            language === 'ar'
                                                ? slide.ar.lineOne
                                                : slide.en.lineOne
                                        }
                                        className="sl-image h-full w-full object-cover"
                                        style={{ objectPosition: slide.position }}
                                        fetchPriority={index === 0 ? 'high' : 'auto'}
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                        draggable={false}
                                    />

                                    <div className="sl-hero-image-glow pointer-events-none absolute inset-0" />
                                    <div className="sl-hero-image-shine pointer-events-none absolute inset-0" />
                                </div>
                            );
                        })}

                        <div className="absolute inset-0 z-[3] bg-[linear-gradient(180deg,rgba(5,6,5,0.46)_0%,rgba(5,6,5,0.06)_27%,rgba(5,6,5,0.24)_59%,rgba(5,6,5,0.94)_100%)]" />

                        <div
                            className={`absolute inset-0 z-[3] ${
                                isRtl
                                    ? 'bg-[linear-gradient(270deg,rgba(5,6,5,0.88)_0%,rgba(5,6,5,0.50)_37%,rgba(5,6,5,0.11)_72%,rgba(5,6,5,0)_100%)]'
                                    : 'bg-[linear-gradient(90deg,rgba(5,6,5,0.88)_0%,rgba(5,6,5,0.50)_37%,rgba(5,6,5,0.11)_72%,rgba(5,6,5,0)_100%)]'
                            }`}
                        />

                        <div className="sl-hero-vignette pointer-events-none absolute inset-0 z-[4]" />

                        <div
                            ref={heroLightRef}
                            className="sl-hero-ambient pointer-events-none absolute right-[-8%] top-[-4%] z-[4] h-[820px] w-[820px] rounded-full bg-[#d4b36f]/[0.18] blur-[145px]"
                        />

                        <div className="sl-hero-sweep pointer-events-none absolute inset-y-[-20%] left-[-48%] z-[5] w-[22%] rotate-[10deg] bg-gradient-to-r from-transparent via-white/[0.20] to-transparent blur-[3px]" />

                        <div className="pointer-events-none absolute bottom-[27%] left-[6%] z-[5] hidden h-[150px] w-px bg-gradient-to-b from-transparent via-[#e5c985]/55 to-transparent lg:block" />
                    </div>

                    <header
                        ref={headerRef}
                        className="absolute inset-x-0 top-0 z-[120] will-change-transform"
                    >
                        <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-10 xl:px-14">
                            <a
                                href="#top"
                                aria-label="Seven Luz"
                                onPointerEnter={() => setLogoEngaged(true)}
                                onPointerLeave={() => setLogoEngaged(false)}
                                onPointerDown={() => setLogoEngaged(true)}
                                onPointerUp={() => {
                                    window.setTimeout(
                                        () => setLogoEngaged(false),
                                        620,
                                    );
                                }}
                                className="group flex items-center gap-2.5 sm:gap-3"
                            >
                                <div
                                    className={`relative flex h-[64px] w-[92px] items-center justify-center overflow-hidden rounded-[18px] border bg-[#111210]/72 px-2.5 py-2 shadow-[0_15px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl transition duration-500 sm:h-[70px] sm:w-[104px] ${
                                        logoEngaged
                                            ? 'border-[#c7a365]/45 bg-[#111210]/90'
                                            : 'border-white/10'
                                    } group-hover:border-[#c7a365]/45 group-hover:bg-[#111210]/90`}
                                >
                                    <img
                                        src="/assets/brand/seven-luz-logo.png"
                                        alt="Seven Luz"
                                        className="h-full w-full object-contain"
                                        draggable={false}
                                    />

                                    <span className="pointer-events-none absolute inset-x-3 bottom-1.5 h-px overflow-hidden rounded-full bg-white/10">
                                        <span
                                            className={`block h-full rounded-full bg-gradient-to-r from-[#8e6b35] via-[#e4c987] to-[#b9965a] transition-all duration-700 ease-out ${
                                                logoEngaged
                                                    ? 'w-full'
                                                    : 'w-0'
                                            } group-hover:w-full`}
                                        />
                                    </span>
                                </div>

                                <div className="block max-w-[92px] border-s border-white/15 ps-2.5 sm:max-w-none sm:ps-4">
                                    <p className="text-[8px] font-semibold leading-4 tracking-[0.08em] text-[#dec487] sm:text-[10px] sm:tracking-[0.12em]">
                                        {t.brandSub}
                                    </p>

                                    <p className="mt-0.5 text-[7px] leading-4 tracking-[0.05em] text-white/48 sm:mt-1 sm:text-[9px] sm:tracking-[0.1em]">
                                        {t.branch}
                                    </p>
                                </div>
                            </a>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setLanguage((current) =>
                                            current === 'ar'
                                                ? 'en'
                                                : 'ar',
                                        )
                                    }
                                    className="sl-header-control flex h-10 min-w-10 items-center justify-center rounded-full border border-white/15 bg-black/20 px-3 text-[10px] font-bold text-white/82 backdrop-blur-xl transition-all duration-300"
                                >
                                    {t.language}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setTheme((current) =>
                                            current === 'dark'
                                                ? 'light'
                                                : 'dark',
                                        )
                                    }
                                    className="sl-header-control flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white/82 backdrop-blur-xl transition-all duration-300"
                                >
                                    {theme === 'dark' ? (
                                        <SunIcon />
                                    ) : (
                                        <MoonIcon />
                                    )}
                                </button>

                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="sl-admin-control hidden rounded-full border border-[#d4b775]/45 bg-[#d3ae68]/92 px-5 py-2.5 text-[10px] font-bold text-[#171816] shadow-[0_10px_28px_rgba(0,0,0,0.14)] transition-all duration-300 sm:inline-flex"
                                    >
                                        {t.dashboard}
                                    </Link>
                                ) : (
                                    <Link
                                        href={login()}
                                        className="sl-admin-control hidden rounded-full border border-[#d4b775]/45 bg-[#d3ae68]/92 px-5 py-2.5 text-[10px] font-bold text-[#171816] shadow-[0_10px_28px_rgba(0,0,0,0.14)] transition-all duration-300 sm:inline-flex"
                                    >
                                        {t.admin}
                                    </Link>
                                )}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setMenuOpen(
                                            (current) => !current,
                                        )
                                    }
                                    className="sl-header-control flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white/82 backdrop-blur-xl transition-all duration-300 lg:hidden"
                                >
                                    {menuOpen ? (
                                        <CloseIcon />
                                    ) : (
                                        <MenuIcon />
                                    )}
                                </button>
                            </div>
                        </div>

                        {menuOpen && (
                            <div className="mx-4 mt-1 rounded-[24px] border border-white/12 bg-[#151614]/94 p-2 shadow-2xl backdrop-blur-2xl sm:mx-6 lg:hidden">
                                {Object.entries(t.nav).map(
                                    ([key, label]) => (
                                        <a
                                            key={key}
                                            href={`#${key}`}
                                            onClick={() =>
                                                setMenuOpen(false)
                                            }
                                            className="sl-mobile-menu-link block rounded-[18px] px-4 py-3 text-sm text-white/72 transition duration-300"
                                        >
                                            {label}
                                        </a>
                                    ),
                                )}
                            </div>
                        )}
                    </header>

                    <div
                        ref={desktopNavRef}
                        className="pointer-events-none fixed inset-x-0 top-5 z-[130] hidden justify-center px-4 will-change-transform lg:flex"
                    >
                        <nav className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/12 bg-black/24 p-1.5 shadow-[0_12px_34px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                            {Object.entries(t.nav).map(
                                ([key, label]) => (
                                    <a
                                        key={key}
                                        href={`#${key}`}
                                        className="sl-desktop-nav-link group relative overflow-hidden rounded-full px-5 py-2.5 text-[11px] font-medium text-white/68 transition-all duration-300"
                                    >
                                        <span className="relative z-10">
                                            {label}
                                        </span>

                                        <span className="absolute inset-0 scale-[0.82] rounded-full border border-[#d0ac69]/0 bg-[#d0ac69]/0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:border-[#d0ac69]/18 group-hover:bg-[#d0ac69]/10 group-hover:opacity-100" />
                                    </a>
                                ),
                            )}
                        </nav>
                    </div>

                    <section
                        id="top"
                        className="relative z-20 flex min-h-[100svh] flex-col justify-end pb-[132px] pt-32 sm:pb-[142px] sm:pt-36 lg:pb-[150px]"
                    >
                        <div className="mx-auto w-full max-w-[1450px] px-4 sm:px-6 lg:px-10 xl:px-14">
                            <div className="max-w-[1160px]">
                                <div
                                    key={`hero-eyebrow-${heroIndex}-${language}`}
                                    ref={eyebrowRef}
                                    className="sl-hero-copy sl-hero-copy-1 mb-5 flex items-center gap-3 sm:mb-6"
                                >
                                    <span className="h-px w-12 bg-gradient-to-r from-[#d2b372] via-[#f0dca8] to-transparent sm:w-16" />

                                    <span className="sl-overline text-[13px] font-semibold tracking-[0.08em] text-[#f0d99f] sm:text-[14px] lg:text-[15px]">
                                        {activeHeroCopy.eyebrow}
                                    </span>
                                </div>

                                <h1
                                    key={`hero-title-${heroIndex}-${language}`}
                                    className="sl-display max-w-[1120px] font-medium leading-[0.99] text-white"
                                >
                                    <span
                                        ref={titleOneRef}
                                        className="sl-hero-copy sl-hero-copy-2 block pb-[0.11em] pt-[0.06em] text-[clamp(4rem,8.35vw,9.1rem)] tracking-[-0.025em] will-change-transform"
                                    >
                                        {activeHeroCopy.lineOne}
                                    </span>

                                    <span
                                        ref={titleTwoRef}
                                        className="sl-hero-gold sl-hero-copy sl-hero-copy-3 block pb-[0.15em] pt-[0.01em] text-[clamp(4rem,8.35vw,9.1rem)] tracking-[-0.025em] will-change-transform"
                                    >
                                        {activeHeroCopy.lineTwo}
                                    </span>
                                </h1>

                                <div
                                    key={`hero-desc-${heroIndex}-${language}`}
                                    ref={descriptionRef}
                                    className="mt-5 flex max-w-[1040px] flex-col gap-7 sm:mt-6 sm:flex-row sm:items-end sm:justify-between"
                                >
                                    <p className="sl-copy sl-hero-copy sl-hero-copy-4 max-w-[760px] text-[18px] font-medium leading-[1.9] text-white/84 sm:text-[20px] lg:text-[22px] lg:leading-[1.9]">
                                        {activeHeroCopy.description}
                                    </p>

                                    <a
                                        ref={discoverRef}
                                        href="#stay"
                                        className="sl-hero-copy sl-hero-copy-5 group inline-flex w-fit shrink-0 items-center gap-3 text-[14px] font-bold text-white sm:text-[15px]"
                                    >
                                        <span>{t.discover}</span>

                                        <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/30 bg-white/[0.08] shadow-[0_16px_38px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-500 group-hover:-rotate-12 group-hover:scale-110 group-hover:border-[#edd49a] group-hover:bg-[#e6c985] group-hover:text-[#171816]">
                                            <ArrowIcon rtl={isRtl} />
                                        </span>
                                    </a>
                                </div>

                                <div
                                    ref={chipsRef}
                                    className="sl-hero-copy sl-hero-copy-6 mt-7 flex flex-wrap items-center gap-2.5 sm:mt-8"
                                >
                                    {[t.directBooking, t.reception, t.serviced].map(
                                        (item) => (
                                            <span
                                                key={item}
                                                data-chip
                                                className="rounded-full border border-white/18 bg-black/20 px-4.5 py-2.5 text-[12px] font-semibold tracking-[0.035em] text-white/78 shadow-[0_9px_28px_rgba(0,0,0,0.12)] backdrop-blur-md transition duration-300 hover:border-[#e0c080]/55 hover:bg-[#d3b36f]/14 hover:text-white"
                                            >
                                                {item}
                                            </span>
                                        ),
                                    )}
                                </div>

                                <div className="mt-8 flex items-center gap-3 sm:mt-9">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeHeroSlide(
                                                heroIndex - 1,
                                                -1,
                                            )
                                        }
                                        aria-label={
                                            language === 'ar'
                                                ? 'الصورة السابقة'
                                                : 'Previous slide'
                                        }
                                        className="sl-hero-nav flex h-10 w-10 items-center justify-center rounded-full border border-white/16 bg-black/16 text-white/75 backdrop-blur-md transition hover:border-[#e3c680]/55 hover:bg-[#d3b36f]/15 hover:text-white"
                                    >
                                        <ChevronIcon
                                            direction={
                                                isRtl
                                                    ? 'right'
                                                    : 'left'
                                            }
                                        />
                                    </button>

                                    <span className="text-[11px] font-bold tracking-[0.18em] text-white/55">
                                        {String(heroIndex + 1).padStart(2, '0')}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        {heroSlides.map((slide, index) => (
                                            <button
                                                key={slide.image}
                                                type="button"
                                                onClick={() =>
                                                    changeHeroSlide(
                                                        index,
                                                        index > heroIndex
                                                            ? 1
                                                            : -1,
                                                    )
                                                }
                                                aria-label={
                                                    language === 'ar'
                                                        ? `عرض الصورة ${index + 1}`
                                                        : `Show slide ${index + 1}`
                                                }
                                                aria-current={
                                                    heroIndex === index
                                                        ? 'true'
                                                        : undefined
                                                }
                                                className={`group relative h-[5px] overflow-hidden rounded-full transition-all duration-500 ${
                                                    heroIndex === index
                                                        ? 'w-[74px] bg-white/18'
                                                        : 'w-8 bg-white/10 hover:bg-white/22'
                                                }`}
                                            >
                                                <span
                                                    className={`absolute inset-y-0 start-0 rounded-full ${
                                                        heroIndex === index
                                                            ? 'sl-hero-progress w-full bg-gradient-to-r from-[#9c7437] via-[#ffe7af] to-[#b89455]'
                                                            : 'w-0'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    <span className="text-[11px] font-bold tracking-[0.18em] text-white/32">
                                        {String(heroSlides.length).padStart(2, '0')}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeHeroSlide(
                                                heroIndex + 1,
                                                1,
                                            )
                                        }
                                        aria-label={
                                            language === 'ar'
                                                ? 'الصورة التالية'
                                                : 'Next slide'
                                        }
                                        className="sl-hero-nav flex h-10 w-10 items-center justify-center rounded-full border border-white/16 bg-black/16 text-white/75 backdrop-blur-md transition hover:border-[#e3c680]/55 hover:bg-[#d3b36f]/15 hover:text-white"
                                    >
                                        <ChevronIcon
                                            direction={
                                                isRtl
                                                    ? 'left'
                                                    : 'right'
                                            }
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <form
                        ref={bookingRef}
                        onSubmit={handleSearch}
                        className="absolute inset-x-0 bottom-0 z-30 hidden px-4 pb-3 sm:px-6 md:block lg:px-10 xl:px-14"
                    >
                        <div className="mx-auto grid w-full max-w-[1160px] grid-cols-[1fr_1fr_0.78fr_auto] rounded-[20px] border border-white/13 bg-[#f6f1e8]/94 p-1 shadow-[0_22px_58px_rgba(0,0,0,0.25)] backdrop-blur-2xl dark:bg-[#171817]/94">
                            <CalendarPicker
                                label={t.checkIn}
                                value={checkIn}
                                minDate={today}
                                language={language}
                                icon={<CalendarIcon />}
                                onChange={setCheckIn}
                            />

                            <CalendarPicker
                                label={t.checkOut}
                                value={checkOut}
                                minDate={checkoutMinimum}
                                language={language}
                                icon={<CalendarIcon />}
                                onChange={setCheckOut}
                            />

                            <GuestPicker
                                value={guests}
                                language={language}
                                onChange={setGuests}
                            />

                            <button
                                type="submit"
                                disabled={availabilityLoading}
                                className="group m-0.5 flex min-w-[142px] items-center justify-center gap-2 rounded-[15px] border border-[#d0ad6d]/20 bg-[#1b1d1b] px-5 text-[9px] font-bold text-white shadow-[0_9px_22px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d0ad6d] hover:bg-[#b9965a] hover:text-[#171816] hover:shadow-[0_13px_30px_rgba(185,150,90,0.19)] disabled:cursor-wait disabled:opacity-70 dark:bg-[#c7a365] dark:text-[#171816] dark:hover:bg-[#dfc486]"
                            >
                                <span>
                                    {availabilityLoading
                                        ? language === 'ar'
                                            ? 'جارٍ التحقق...'
                                            : 'Checking...'
                                        : t.search}
                                </span>

                                <span
                                    className={`transition-transform duration-300 ${
                                        availabilityLoading
                                            ? 'animate-pulse'
                                            : 'group-hover:-translate-x-1'
                                    }`}
                                >
                                    <ArrowIcon rtl={isRtl} />
                                </span>
                            </button>
                        </div>
                    </form>

                    <div className="absolute inset-x-0 bottom-0 z-30 p-4 md:hidden">
                        <button
                            type="button"
                            onClick={() =>
                                setMobileBookingOpen(true)
                            }
                            className="flex min-h-[56px] w-full items-center justify-between rounded-[19px] border border-white/15 bg-[#f4efe7]/94 px-5 text-[#171816] shadow-[0_25px_65px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300 dark:bg-[#181917]/94 dark:text-white"
                        >
                            <span>
                                <span className="block text-[9px] font-semibold text-[#9b7a47]">
                                    {t.booking}
                                </span>

                                <span className="mt-1 block text-[12px] font-bold">
                                    {t.mobileBook}
                                </span>
                            </span>

                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c7a365] text-[#171816]">
                                <ArrowIcon rtl={isRtl} />
                            </span>
                        </button>
                    </div>
                </main>

                <section
                    ref={storySectionRef}
                    id="stay"
                    className="relative overflow-hidden bg-[#f2eee6] py-20 text-[#1b1d1c] sm:py-24 lg:py-28 dark:bg-[#101110] dark:text-[#f0ede7]"
                >
                    <div className="pointer-events-none absolute left-[-14rem] top-[-10rem] h-[36rem] w-[36rem] rounded-full bg-[#b9965a]/[0.08] blur-[120px]" />

                    <div className="pointer-events-none absolute right-[-18rem] bottom-[-18rem] h-[42rem] w-[42rem] rounded-full bg-[#b9965a]/[0.05] blur-[140px]" />

                    <div className="mx-auto grid w-full max-w-[1450px] items-center gap-14 px-4 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:gap-10 lg:px-10 xl:gap-20 xl:px-14">
                        <div
                            ref={storyCopyRef}
                            className="relative z-20 max-w-[620px]"
                        >
                            <div className="mb-5 flex items-center gap-3">
                                <span className="h-px w-8 bg-[#b9965a]" />

                                <span className="sl-overline text-[#9b7841] dark:text-[#d0ad70]">
                                    {t.storyEyebrow}
                                </span>
                            </div>

                            <h2 className="sl-display text-[clamp(2.7rem,5vw,5.65rem)] font-medium leading-[1.08]">
                                <span className="block pb-[0.08em] pt-[0.08em]">
                                    {t.storyTitleOne}
                                </span>

                                <span className="sl-hero-shimmer mt-1 block pb-[0.08em] pt-[0.08em] will-change-transform">
                                    {t.storyTitleTwo}
                                </span>
                            </h2>

                            <p className="sl-copy mt-5 max-w-[530px] text-[13px] text-[#676861] sm:text-[14px] dark:text-white/48">
                                {t.storyDescription}
                            </p>

                            <div className="mt-6 flex items-center gap-5 text-[9px] font-semibold tracking-[0.12em] text-[#837e74] dark:text-white/34">
                                <span>RIYADH</span>
                                <span className="h-1 w-1 rounded-full bg-[#b9965a]" />
                                <span>AL MASIF</span>
                                <span className="h-1 w-1 rounded-full bg-[#b9965a]" />
                                <span>SEVEN LUZ</span>
                            </div>

                            <a
                                href="#gallery"
                                className="group mt-8 inline-flex items-center gap-3 text-[11px] font-bold"
                            >
                                <span>{t.storyLink}</span>

                                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 transition-all duration-500 group-hover:-rotate-12 group-hover:border-[#b9965a] group-hover:bg-[#b9965a] group-hover:text-[#171816] dark:border-white/15">
                                    <ArrowIcon rtl={isRtl} />
                                </span>
                            </a>
                        </div>

                        <div
                            ref={storyStageRef}
                            onPointerMove={handleStoryMove}
                            onPointerDown={(event) => {
                                event.currentTarget.setPointerCapture?.(
                                    event.pointerId,
                                );
                            }}
                            onPointerLeave={handleStoryLeave}
                            onPointerCancel={handleStoryLeave}
                            onPointerUp={handleStoryLeave}
                            className="relative mx-auto flex aspect-[1/1] w-full max-w-[620px] touch-pan-y items-center justify-center sm:aspect-[1.08/1]"
                            style={{
                                perspective: '1100px',
                            }}
                        >
                            <div className="pointer-events-none absolute inset-[7%] animate-[slOrbit_22s_linear_infinite] rounded-[34%] border border-[#9f8355]/25 dark:border-[#c7a365]/18" />

                            <div className="pointer-events-none absolute inset-[16%] animate-[slOrbitReverse_18s_linear_infinite] rounded-[30%] border border-black/10 dark:border-white/10" />

                            <div className="relative z-10 w-[62%] min-w-[220px] max-w-[350px]">
                                <div
                                    ref={storyCardRef}
                                    className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-black/10 bg-[#d8d1c6] shadow-[0_32px_90px_rgba(32,29,24,0.22)] will-change-transform dark:border-white/10 dark:bg-[#1b1c1a] dark:shadow-[0_38px_100px_rgba(0,0,0,0.38)] sm:rounded-[38px]"
                                >
                                    {detailScenes.map(
                                        (scene, index) => (
                                            <div
                                                key={scene.src}
                                                ref={(element) => {
                                                    detailRefs.current[
                                                        index
                                                    ] = element;
                                                }}
                                                className="absolute inset-0"
                                            >
                                                <img
                                                    src={scene.src}
                                                    alt={
                                                        language ===
                                                        'ar'
                                                            ? scene.ar
                                                            : scene.en
                                                    }
                                                    className="h-full w-full object-cover"
                                                    draggable={false}
                                                />

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-transparent to-black/[0.04]" />
                                            </div>
                                        ),
                                    )}

                                    <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
                                        <div className="flex items-end justify-between gap-3">
                                            <p className="max-w-[190px] text-[12px] font-semibold leading-6 text-white sm:text-[13px]">
                                                {language === 'ar'
                                                    ? detailScenes[
                                                          detailIndex
                                                      ].ar
                                                    : detailScenes[
                                                          detailIndex
                                                      ].en}
                                            </p>

                                            <p className="shrink-0 text-[9px] font-semibold tracking-[0.14em] text-[#e1c78d]">
                                                0{detailIndex + 1}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-center gap-2">
                                    {detailScenes.map(
                                        (scene, index) => (
                                            <button
                                                key={scene.src}
                                                type="button"
                                                onClick={() =>
                                                    setDetailIndex(
                                                        index,
                                                    )
                                                }
                                                aria-label={`${t.storyCounter} ${index + 1}`}
                                                className={`h-[3px] rounded-full transition-all duration-500 ${
                                                    detailIndex ===
                                                    index
                                                        ? 'w-10 bg-[#b9965a]'
                                                        : 'w-4 bg-black/15 hover:bg-black/35 dark:bg-white/15 dark:hover:bg-white/35'
                                                }`}
                                            />
                                        ),
                                    )}
                                </div>
                            </div>

                            <div className="absolute left-[1%] top-[16%] h-[76px] w-[58px] animate-[slPhotoFloatA_5.4s_ease-in-out_infinite] overflow-hidden rounded-[16px] border border-white/25 shadow-[0_14px_34px_rgba(0,0,0,0.18)] sm:left-[7%] sm:top-[18%] sm:h-[120px] sm:w-[90px] sm:rounded-[22px] sm:shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
                                <img
                                    src="/assets/images/hero/lounge-depth.jpg"
                                    alt=""
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>

                            <div className="absolute bottom-[10%] right-[1%] h-[62px] w-[84px] animate-[slPhotoFloatB_6s_ease-in-out_infinite] overflow-hidden rounded-[16px] border border-white/20 shadow-[0_14px_34px_rgba(0,0,0,0.18)] sm:bottom-[13%] sm:right-[8%] sm:h-[90px] sm:w-[120px] sm:rounded-[22px] sm:shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
                                <img
                                    src="/assets/images/hero/arrival-exterior.jpg"
                                    alt=""
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <AmenitiesSection language={language} />

                <RoomsSection language={language} />

                <GallerySection language={language} />

                <LocationSection language={language} />

                <BookingCtaSection language={language} />


                <div
                    className={`fixed bottom-5 z-[160] flex flex-col gap-3 sm:bottom-7 ${
                        isRtl
                            ? 'right-4 sm:right-6'
                            : 'left-4 sm:left-6'
                    }`}
                >
                    <a
                        href="tel:+966546230519"
                        aria-label={isRtl ? 'اتصل بسفن لوز' : 'Call Seven Luz'}
                        className="sl-floating-contact sl-floating-contact-call group relative flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[#d2b372]/30 bg-[#151714]/94 shadow-[0_16px_38px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:h-14 sm:w-14"
                    >
                        <span className="absolute inset-[-6px] rounded-full border border-[#d2b372]/12" />
                        <img
                            src="https://cdn.jsdelivr.net/npm/lucide-static@0.468.0/icons/phone-call.svg"
                            alt=""
                            aria-hidden="true"
                            className="h-[22px] w-[22px] brightness-0 invert sepia saturate-[5] hue-rotate-[355deg]"
                        />
                    </a>

                    <a
                        href="https://wa.me/966546230519?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D8%AD%D8%AC%D8%B2%20%D9%81%D9%8A%20%D8%B3%D9%81%D9%86%20%D9%84%D9%88%D8%B2"
                        target="_blank"
                        rel="noreferrer"
                        aria-label={isRtl ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
                        className="sl-floating-contact sl-floating-contact-whatsapp group relative flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[#d2b372]/30 bg-[#171914]/96 shadow-[0_16px_38px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:h-14 sm:w-14"
                    >
                        <span className="absolute inset-[-6px] rounded-full border border-[#d2b372]/12" />
                        <img
                            src="https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/whatsapp.svg"
                            alt=""
                            aria-hidden="true"
                            className="h-[23px] w-[23px] brightness-0 invert sepia saturate-[5] hue-rotate-[355deg]"
                        />
                    </a>
                </div>

                <SiteFooter language={language} />

                {mobileBookingOpen && (
                    <div className="fixed inset-0 z-[150] flex items-end bg-black/60 p-3 backdrop-blur-sm md:hidden">
                        <button
                            type="button"
                            aria-label="Close"
                            onClick={() =>
                                setMobileBookingOpen(false)
                            }
                            className="absolute inset-0"
                        />

                        <div className="relative z-10 w-full rounded-[28px] border border-black/8 bg-[#f7f2e9] p-3 shadow-[0_35px_90px_rgba(0,0,0,0.36)] dark:border-white/10 dark:bg-[#181917]">
                            <div className="flex items-center justify-between px-2 pb-4 pt-1">
                                <div>
                                    <p className="text-[9px] font-semibold text-[#a07d47]">
                                        SEVEN LUZ
                                    </p>

                                    <p className="mt-1 text-sm font-bold">
                                        {t.booking}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setMobileBookingOpen(false)
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 dark:border-white/12"
                                >
                                    <CloseIcon />
                                </button>
                            </div>

                            <div className="grid gap-2">
                                <CalendarPicker
                                    label={t.checkIn}
                                    value={checkIn}
                                    minDate={today}
                                    language={language}
                                    icon={<CalendarIcon />}
                                    onChange={setCheckIn}
                                />

                                <CalendarPicker
                                    label={t.checkOut}
                                    value={checkOut}
                                    minDate={checkoutMinimum}
                                    language={language}
                                    icon={<CalendarIcon />}
                                    onChange={setCheckOut}
                                />

                                <GuestPicker
                                    value={guests}
                                    language={language}
                                    onChange={setGuests}
                                />

                                <button
                                    type="button"
                                    onClick={() => void runAvailabilitySearch()}
                                    disabled={availabilityLoading}
                                    className="flex min-h-[56px] items-center justify-center gap-3 rounded-[18px] bg-[#1b1d1b] text-[11px] font-bold text-white transition-all duration-300 hover:bg-[#b9965a] hover:text-[#171816] disabled:cursor-wait disabled:opacity-70 dark:bg-[#c7a365] dark:text-[#171816]"
                                >
                                    {availabilityLoading
                                        ? language === 'ar'
                                            ? 'جارٍ التحقق...'
                                            : 'Checking...'
                                        : t.search}

                                    <ArrowIcon rtl={isRtl} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {availabilityOpen && (
                    <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/68 p-4 backdrop-blur-md">
                        <button
                            type="button"
                            aria-label={
                                language === 'ar'
                                    ? 'إغلاق نتائج التوفر'
                                    : 'Close availability results'
                            }
                            onClick={() => setAvailabilityOpen(false)}
                            className="absolute inset-0"
                        />

                        <div className="relative z-10 max-h-[86svh] w-full max-w-[760px] overflow-hidden rounded-[30px] border border-[#d2b372]/18 bg-[#f5f0e7]/[0.98] shadow-[0_40px_120px_rgba(0,0,0,0.45)] dark:bg-[#151714]/[0.98]">
                            <div className="flex items-start justify-between gap-5 border-b border-black/[0.07] px-5 py-5 sm:px-7 sm:py-6 dark:border-white/[0.07]">
                                <div>
                                    <p className="text-[9px] font-bold tracking-[0.14em] text-[#a17d45] dark:text-[#d2b372]">
                                        SEVEN LUZ · AL MASIF
                                    </p>

                                    <h2 className="mt-2 text-xl font-semibold text-[#1b1d1b] dark:text-white sm:text-2xl">
                                        {language === 'ar'
                                            ? 'نتائج التوفر'
                                            : 'Availability results'}
                                    </h2>

                                    {checkIn && checkOut && (
                                        <p className="mt-2 text-[11px] leading-5 text-black/48 dark:text-white/42">
                                            {formatDate(checkIn, language)}
                                            {'  ·  '}
                                            {formatDate(checkOut, language)}
                                            {'  ·  '}
                                            {language === 'ar'
                                                ? `${guests} ضيوف`
                                                : `${guests} guests`}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setAvailabilityOpen(false)}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 text-black/60 transition duration-300 hover:border-[#b9965a] hover:bg-[#b9965a] hover:text-[#171816] dark:border-white/12 dark:text-white/65"
                                >
                                    <CloseIcon />
                                </button>
                            </div>

                            <div className="max-h-[calc(86svh-118px)] overflow-y-auto p-4 sm:p-6">
                                {availabilityError ? (
                                    <div className="rounded-[22px] border border-[#b9965a]/20 bg-[#b9965a]/[0.07] px-5 py-6 text-center">
                                        <p className="text-sm font-semibold text-[#6f542d] dark:text-[#e0c487]">
                                            {availabilityError}
                                        </p>
                                    </div>
                                ) : availabilityResults.length === 0 ? (
                                    <div className="rounded-[22px] border border-black/[0.07] bg-white/46 px-5 py-8 text-center dark:border-white/[0.07] dark:bg-white/[0.025]">
                                        <p className="text-sm font-semibold text-[#282a27] dark:text-white/82">
                                            {language === 'ar'
                                                ? 'لا توجد وحدات متاحة لكل ليالي الفترة المختارة'
                                                : 'No room types are available for every night in the selected stay'}
                                        </p>

                                        <p className="mx-auto mt-2 max-w-[440px] text-[11px] leading-5 text-black/45 dark:text-white/38">
                                            {language === 'ar'
                                                ? 'جرّب تغيير تاريخ الوصول أو المغادرة ثم تحقق مرة أخرى'
                                                : 'Try different check-in or check-out dates and check again'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {availabilityResults.map((result) => (
                                            <div
                                                key={result.room_type_id}
                                                className="group rounded-[24px] border border-black/[0.07] bg-white/54 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#b9965a]/30 hover:shadow-[0_18px_42px_rgba(32,27,20,0.08)] dark:border-white/[0.07] dark:bg-white/[0.025]"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <div className="inline-flex items-center gap-2 rounded-full border border-[#b9965a]/20 bg-[#b9965a]/[0.07] px-2.5 py-1 text-[8px] font-bold text-[#9a7540] dark:text-[#d4b578]">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-[#b9965a]" />
                                                            <span>
                                                                {language ===
                                                                'ar'
                                                                    ? 'متاح'
                                                                    : 'Available'}
                                                            </span>
                                                        </div>

                                                        <h3 className="mt-3 text-[16px] font-semibold text-[#20221f] dark:text-white/90 sm:text-[18px]">
                                                            {language === 'ar'
                                                                ? result.name_ar
                                                                : result.name_en}
                                                        </h3>

                                                        <p className="mt-1.5 text-[10px] leading-5 text-black/44 dark:text-white/38">
                                                            {language === 'ar'
                                                                ? `${result.nights} ${result.nights === 1 ? 'ليلة' : 'ليالٍ'} · ${result.available_units} وحدات متاحة`
                                                                : `${result.nights} ${result.nights === 1 ? 'night' : 'nights'} · ${result.available_units} units available`}
                                                        </p>
                                                    </div>

                                                    <div
                                                        className={`shrink-0 ${
                                                            isRtl
                                                                ? 'text-left'
                                                                : 'text-right'
                                                        }`}
                                                    >
                                                        <p className="text-[8px] font-semibold text-black/38 dark:text-white/32">
                                                            {language === 'ar'
                                                                ? 'إجمالي الإقامة'
                                                                : 'Stay total'}
                                                        </p>

                                                        <p className="mt-1 text-lg font-bold text-[#9b7741] dark:text-[#d7ba7b]">
                                                            {result.total_price}
                                                            <span className="ms-1 text-[9px] font-semibold">
                                                                SAR
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/[0.06] pt-3 dark:border-white/[0.06]">
                                                    <p className="text-[9px] text-black/38 dark:text-white/32">
                                                        {language === 'ar'
                                                            ? 'السعر محسوب من السعر المحدد لكل ليلة'
                                                            : 'Total is calculated from each nightly rate'}
                                                    </p>

                                                    <div className="flex shrink-0 items-center gap-2">
                                                        <a
                                                            href="#rooms"
                                                            onClick={() =>
                                                                setAvailabilityOpen(
                                                                    false,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 px-2 text-[9px] font-bold text-[#8e6b38] transition hover:text-[#b9965a] dark:text-[#d6b877]"
                                                        >
                                                            <span>
                                                                {language === 'ar'
                                                                    ? 'عرض الوحدة'
                                                                    : 'View room'}
                                                            </span>
                                                        </a>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                beginBooking(
                                                                    result,
                                                                )
                                                            }
                                                            className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#1b1d1b] px-4 text-[9px] font-bold text-white transition duration-300 hover:bg-[#b9965a] hover:text-[#171816] dark:bg-[#c7a365] dark:text-[#171816]"
                                                        >
                                                            <span>
                                                                {language === 'ar'
                                                                    ? 'متابعة الحجز'
                                                                    : 'Continue booking'}
                                                            </span>

                                                            <ArrowIcon
                                                                rtl={isRtl}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {guestDetailsOpen && selectedRoom && (
                    <div className="fixed inset-0 z-[195] flex items-center justify-center bg-black/72 p-4 backdrop-blur-md">
                        <button
                            type="button"
                            aria-label={
                                language === 'ar'
                                    ? 'إغلاق بيانات الحجز'
                                    : 'Close booking details'
                            }
                            onClick={() => {
                                if (!holdLoading) {
                                    setGuestDetailsOpen(false);
                                }
                            }}
                            className="absolute inset-0"
                        />

                        <div className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-[620px] overflow-y-auto rounded-[30px] border border-[#d2b372]/18 bg-[#f5f0e7]/[0.99] shadow-[0_40px_120px_rgba(0,0,0,0.48)] dark:bg-[#151714]/[0.99]">
                            <div className="flex items-start justify-between gap-5 border-b border-black/[0.07] px-5 py-5 sm:px-7 sm:py-6 dark:border-white/[0.07]">
                                <div>
                                    <p className="text-[9px] font-bold tracking-[0.14em] text-[#a17d45] dark:text-[#d2b372]">
                                        SEVEN LUZ · AL MASIF
                                    </p>

                                    <h2 className="mt-2 text-xl font-semibold text-[#1b1d1b] dark:text-white sm:text-2xl">
                                        {createdHold
                                            ? language === 'ar'
                                                ? 'تم بدء الحجز'
                                                : 'Booking started'
                                            : language === 'ar'
                                              ? 'بيانات الضيف'
                                              : 'Guest details'}
                                    </h2>

                                    <p className="mt-2 text-[11px] leading-5 text-black/48 dark:text-white/42">
                                        {language === 'ar'
                                            ? selectedRoom.name_ar
                                            : selectedRoom.name_en}
                                        {'  ·  '}
                                        {selectedRoom.total_price} SAR
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    disabled={holdLoading}
                                    onClick={() =>
                                        setGuestDetailsOpen(false)
                                    }
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 text-black/60 transition duration-300 hover:border-[#b9965a] hover:bg-[#b9965a] hover:text-[#171816] disabled:opacity-40 dark:border-white/12 dark:text-white/65"
                                >
                                    <CloseIcon />
                                </button>
                            </div>

                            {createdHold ? (
                                <div className="p-5 sm:p-7">
                                    <div className="rounded-[24px] border border-[#b9965a]/22 bg-[#b9965a]/[0.08] p-5 text-center">
                                        <p className="text-[9px] font-bold tracking-[0.12em] text-[#9a7540] dark:text-[#d4b578]">
                                            {language === 'ar'
                                                ? 'رقم مرجع الحجز'
                                                : 'Booking reference'}
                                        </p>

                                        <p className="mt-2 text-xl font-bold tracking-[0.08em] text-[#1c1e1c] dark:text-white">
                                            {createdHold.booking_reference}
                                        </p>

                                        <p className="mx-auto mt-3 max-w-[430px] text-[11px] leading-6 text-black/48 dark:text-white/42">
                                            {phoneVerified
                                                ? language === 'ar'
                                                    ? 'تم توثيق رقم الجوال بنجاح وأصبح الحجز جاهزًا للانتقال إلى الخطوة التالية.'
                                                    : 'The mobile number has been verified successfully and the booking is ready for the next step.'
                                                : language === 'ar'
                                                  ? 'تم تثبيت الوحدة مؤقتًا. أكمل الآن توثيق رقم الجوال للمتابعة في رحلة الحجز.'
                                                  : 'The room is temporarily held. Verify the mobile number now to continue the booking journey.'}
                                        </p>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="rounded-[18px] border border-black/[0.06] bg-white/45 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.025]">
                                            <p className="text-[8px] font-semibold text-black/35 dark:text-white/30">
                                                {language === 'ar'
                                                    ? 'عدد الليالي'
                                                    : 'Nights'}
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-[#242622] dark:text-white/86">
                                                {createdHold.nights_count}
                                            </p>
                                        </div>

                                        <div className="rounded-[18px] border border-black/[0.06] bg-white/45 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.025]">
                                            <p className="text-[8px] font-semibold text-black/35 dark:text-white/30">
                                                {language === 'ar'
                                                    ? 'الإجمالي'
                                                    : 'Total'}
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-[#9b7741] dark:text-[#d7ba7b]">
                                                {createdHold.total_amount}{' '}
                                                {createdHold.currency}
                                            </p>
                                        </div>
                                    </div>

                                    {!phoneVerified ? (
                                        <div className="mt-4 rounded-[22px] border border-black/[0.07] bg-white/50 p-4 dark:border-white/[0.07] dark:bg-white/[0.025]">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-[9px] font-bold text-[#242622] dark:text-white/86">
                                                        {language === 'ar'
                                                            ? 'توثيق رقم الجوال'
                                                            : 'Mobile verification'}
                                                    </p>
                                                    <p
                                                        dir="ltr"
                                                        className="mt-1 text-[10px] font-semibold text-black/42 dark:text-white/38"
                                                    >
                                                        {guestPhone}
                                                    </p>
                                                </div>

                                                <span className="rounded-full border border-[#b9965a]/25 bg-[#b9965a]/10 px-3 py-1.5 text-[8px] font-bold text-[#8b6937] dark:text-[#d9bc7f]">
                                                    {verificationSent
                                                        ? language === 'ar'
                                                            ? 'تم إرسال الكود'
                                                            : 'Code sent'
                                                        : language === 'ar'
                                                          ? 'بانتظار الإرسال'
                                                          : 'Not sent yet'}
                                                </span>
                                            </div>

                                            {!verificationSent ? (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        verificationLoading
                                                    }
                                                    onClick={() =>
                                                        void sendPhoneVerification()
                                                    }
                                                    className="mt-4 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#1b1d1b] text-[10px] font-bold text-white transition duration-300 hover:bg-[#b9965a] hover:text-[#171816] disabled:cursor-wait disabled:opacity-60 dark:bg-[#c7a365] dark:text-[#171816]"
                                                >
                                                    {verificationLoading
                                                        ? language === 'ar'
                                                            ? 'جارٍ إنشاء الكود...'
                                                            : 'Generating code...'
                                                        : language === 'ar'
                                                          ? 'إرسال كود التحقق'
                                                          : 'Send verification code'}
                                                </button>
                                            ) : (
                                                <form
                                                    onSubmit={verifyPhoneCode}
                                                    className="mt-4"
                                                >
                                                    {developmentCode && (
                                                        <div className="mb-4 rounded-[16px] border border-[#b9965a]/25 bg-[#b9965a]/[0.09] px-4 py-3 text-center">
                                                            <p className="text-[8px] font-bold text-[#896735] dark:text-[#d9bc7f]">
                                                                {language === 'ar'
                                                                    ? 'كود تجريبي لبيئة التطوير'
                                                                    : 'Development test code'}
                                                            </p>
                                                            <p
                                                                dir="ltr"
                                                                className="mt-1.5 text-lg font-bold tracking-[0.28em] text-[#1c1e1c] dark:text-white"
                                                            >
                                                                {
                                                                    developmentCode
                                                                }
                                                            </p>
                                                            <p className="mt-1.5 text-[8px] leading-4 text-black/38 dark:text-white/32">
                                                                {language ===
                                                                'ar'
                                                                    ? 'عند ربط مزود الرسائل سيصل الكود إلى الجوال بدل ظهوره هنا'
                                                                    : 'Once an SMS provider is connected, the code will be delivered to the mobile instead of appearing here'}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <label className="block">
                                                        <span className="mb-1.5 block text-[9px] font-bold text-black/45 dark:text-white/40">
                                                            {language === 'ar'
                                                                ? 'كود التحقق'
                                                                : 'Verification code'}
                                                        </span>
                                                        <input
                                                            value={
                                                                verificationCode
                                                            }
                                                            onChange={(event) =>
                                                                setVerificationCode(
                                                                    event.target.value
                                                                        .replace(
                                                                            /\D/g,
                                                                            '',
                                                                        )
                                                                        .slice(
                                                                            0,
                                                                            6,
                                                                        ),
                                                                )
                                                            }
                                                            inputMode="numeric"
                                                            autoComplete="one-time-code"
                                                            dir="ltr"
                                                            maxLength={6}
                                                            className="h-12 w-full rounded-[16px] border border-black/10 bg-white/70 px-4 text-center text-base font-bold tracking-[0.3em] text-[#1c1e1c] outline-none transition focus:border-[#b9965a] dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                                                            placeholder="000000"
                                                        />
                                                    </label>

                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            verificationLoading
                                                        }
                                                        className="mt-3 flex min-h-[50px] w-full items-center justify-center rounded-[16px] bg-[#b9965a] text-[10px] font-bold text-[#171816] transition duration-300 hover:bg-[#c9aa70] disabled:cursor-wait disabled:opacity-60"
                                                    >
                                                        {verificationLoading
                                                            ? language === 'ar'
                                                                ? 'جارٍ التحقق...'
                                                                : 'Verifying...'
                                                            : language === 'ar'
                                                              ? 'تأكيد رقم الجوال'
                                                              : 'Verify mobile'}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            verificationLoading
                                                        }
                                                        onClick={() =>
                                                            void sendPhoneVerification()
                                                        }
                                                        className="mt-2 w-full py-2 text-[9px] font-bold text-[#8b6937] transition hover:text-[#b9965a] disabled:opacity-50 dark:text-[#d4b578]"
                                                    >
                                                        {language === 'ar'
                                                            ? 'إعادة إرسال الكود'
                                                            : 'Resend code'}
                                                    </button>
                                                </form>
                                            )}

                                            {verificationError && (
                                                <div className="mt-3 rounded-[14px] border border-[#b9965a]/20 bg-[#b9965a]/[0.07] px-4 py-3">
                                                    <p className="text-[9px] font-semibold leading-5 text-[#6f542d] dark:text-[#e0c487]">
                                                        {verificationError}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-4 space-y-4">
                                            <div className="rounded-[22px] border border-[#b9965a]/25 bg-[#b9965a]/[0.09] p-5 text-center">
                                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#b9965a] text-[#171816]">
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        className="h-5 w-5"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="m5 12 4 4L19 6" />
                                                    </svg>
                                                </div>
                                                <p className="mt-3 text-[11px] font-bold text-[#242622] dark:text-white/90">
                                                    {language === 'ar'
                                                        ? 'تم توثيق رقم الجوال بنجاح'
                                                        : 'Mobile number verified successfully'}
                                                </p>
                                                <p className="mt-1 text-[9px] leading-5 text-black/42 dark:text-white/36">
                                                    {language === 'ar'
                                                        ? 'يمكنك الآن إضافة كود خصم إن وجد ثم متابعة طريقة الدفع'
                                                        : 'You can now add a coupon code if available, then continue to payment'}
                                                </p>
                                            </div>

                                            <div className="rounded-[22px] border border-black/[0.07] bg-white/50 p-4 dark:border-white/[0.07] dark:bg-white/[0.025] sm:p-5">
                                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-[#242622] dark:text-white/88">
                                                            {language === 'ar'
                                                                ? 'كود الخصم'
                                                                : 'Coupon code'}
                                                        </p>
                                                        <p className="mt-1 text-[8px] leading-4 text-black/38 dark:text-white/32">
                                                            {language === 'ar'
                                                                ? 'أدخل الكود إن كان لديك كوبون فعال'
                                                                : 'Enter your code if you have an active coupon'}
                                                        </p>
                                                    </div>

                                                    {appliedCoupon && (
                                                        <span className="mt-2 inline-flex w-fit items-center rounded-full border border-[#b9965a]/25 bg-[#b9965a]/10 px-3 py-1.5 text-[8px] font-bold text-[#8a6735] dark:text-[#d8bb7d] sm:mt-0">
                                                            {language === 'ar'
                                                                ? `تم تطبيق ${appliedCoupon.coupon_code}`
                                                                : `${appliedCoupon.coupon_code} applied`}
                                                        </span>
                                                    )}
                                                </div>

                                                <form
                                                    onSubmit={applyCoupon}
                                                    className="mt-4 flex flex-col gap-2 sm:flex-row"
                                                >
                                                    <input
                                                        value={couponCode}
                                                        onChange={(event) => {
                                                            setCouponCode(
                                                                event.target.value.toUpperCase(),
                                                            );
                                                            setCouponError(null);
                                                        }}
                                                        disabled={couponLoading}
                                                        autoComplete="off"
                                                        inputMode="text"
                                                        dir="ltr"
                                                        placeholder="SEVEN10"
                                                        className="h-12 min-w-0 flex-1 rounded-[16px] border border-black/10 bg-white/70 px-4 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-[#20221f] outline-none transition focus:border-[#b9965a] dark:border-white/10 dark:bg-white/[0.045] dark:text-white"
                                                    />

                                                    <button
                                                        type="submit"
                                                        disabled={couponLoading}
                                                        className="h-12 shrink-0 rounded-[16px] bg-[#1b1d1b] px-6 text-[10px] font-bold text-white transition duration-300 hover:bg-[#b9965a] hover:text-[#171816] disabled:cursor-wait disabled:opacity-60 dark:bg-[#c7a365] dark:text-[#171816] sm:min-w-[125px]"
                                                    >
                                                        {couponLoading
                                                            ? language === 'ar'
                                                                ? 'جارٍ التطبيق...'
                                                                : 'Applying...'
                                                            : appliedCoupon
                                                              ? language === 'ar'
                                                                  ? 'تحديث الكوبون'
                                                                  : 'Update coupon'
                                                              : language === 'ar'
                                                                ? 'تطبيق الكوبون'
                                                                : 'Apply coupon'}
                                                    </button>
                                                </form>

                                                {couponError && (
                                                    <div className="mt-3 rounded-[14px] border border-[#b9965a]/20 bg-[#b9965a]/[0.07] px-4 py-3">
                                                        <p className="text-[9px] font-semibold leading-5 text-[#6f542d] dark:text-[#e0c487]">
                                                            {couponError}
                                                        </p>
                                                    </div>
                                                )}

                                                {appliedCoupon && (
                                                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                                        <div className="rounded-[15px] border border-black/[0.06] bg-white/55 px-3 py-3 text-center dark:border-white/[0.06] dark:bg-white/[0.025]">
                                                            <p className="text-[8px] font-semibold text-black/35 dark:text-white/30">
                                                                {language === 'ar'
                                                                    ? 'قبل الخصم'
                                                                    : 'Before discount'}
                                                            </p>
                                                            <p className="mt-1 text-[11px] font-bold text-[#242622] dark:text-white/86">
                                                                {appliedCoupon.subtotal}{' '}
                                                                {appliedCoupon.currency}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-[15px] border border-black/[0.06] bg-white/55 px-3 py-3 text-center dark:border-white/[0.06] dark:bg-white/[0.025]">
                                                            <p className="text-[8px] font-semibold text-black/35 dark:text-white/30">
                                                                {language === 'ar'
                                                                    ? 'قيمة الخصم'
                                                                    : 'Discount'}
                                                            </p>
                                                            <p className="mt-1 text-[11px] font-bold text-[#9a7540] dark:text-[#d4b578]">
                                                                -{appliedCoupon.discount_amount}{' '}
                                                                {appliedCoupon.currency}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-[15px] border border-[#b9965a]/20 bg-[#b9965a]/[0.08] px-3 py-3 text-center">
                                                            <p className="text-[8px] font-semibold text-[#896735] dark:text-[#d6b979]">
                                                                {language === 'ar'
                                                                    ? 'الإجمالي بعد الخصم'
                                                                    : 'Total after discount'}
                                                            </p>
                                                            <p className="mt-1 text-[11px] font-bold text-[#242622] dark:text-white/90">
                                                                {appliedCoupon.total_amount}{' '}
                                                                {appliedCoupon.currency}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="rounded-[22px] border border-black/[0.07] bg-white/50 p-4 dark:border-white/[0.07] dark:bg-white/[0.025] sm:p-5">
                                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-[#242622] dark:text-white/88">
                                                            {language === 'ar'
                                                                ? 'اختر طريقة الدفع'
                                                                : 'Choose payment method'}
                                                        </p>
                                                        <p className="mt-1 text-[8px] leading-4 text-black/38 dark:text-white/32">
                                                            {language === 'ar'
                                                                ? 'اختر الدفع الآن أو الدفع عند الوصول للمتابعة'
                                                                : 'Choose pay now or pay at property to continue'}
                                                        </p>
                                                    </div>

                                                    <span className="mt-2 inline-flex w-fit items-center rounded-full border border-black/[0.06] bg-white/55 px-3 py-1.5 text-[8px] font-bold text-black/45 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-white/42 sm:mt-0">
                                                        {createdHold.total_amount} {createdHold.currency}
                                                    </span>
                                                </div>

                                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <button
                                                        type="button"
                                                        disabled={paymentMethodLoading}
                                                        onClick={() =>
                                                            void selectPaymentMethod(
                                                                'pay_now',
                                                            )
                                                        }
                                                        className={`min-h-[86px] rounded-[18px] border p-4 text-start transition-all duration-300 disabled:cursor-wait disabled:opacity-60 ${
                                                            selectedPaymentMethod ===
                                                            'pay_now'
                                                                ? 'border-[#b9965a] bg-[#b9965a]/12 shadow-[0_10px_28px_rgba(185,150,90,0.12)]'
                                                                : 'border-black/[0.07] bg-white/55 hover:border-[#b9965a]/55 hover:bg-[#b9965a]/[0.06] dark:border-white/[0.07] dark:bg-white/[0.025]'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-[10px] font-bold text-[#242622] dark:text-white/90">
                                                                    {language ===
                                                                    'ar'
                                                                        ? 'الدفع الآن'
                                                                        : 'Pay now'}
                                                                </p>
                                                                <p className="mt-1.5 text-[8px] leading-5 text-black/40 dark:text-white/34">
                                                                    {language ===
                                                                    'ar'
                                                                        ? 'إكمال الدفع الإلكتروني لتأكيد الحجز'
                                                                        : 'Complete online payment to confirm the booking'}
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${
                                                                    selectedPaymentMethod ===
                                                                    'pay_now'
                                                                        ? 'border-[#b9965a] bg-[#b9965a] shadow-[inset_0_0_0_3px_#f7f2e9] dark:shadow-[inset_0_0_0_3px_#191a18]'
                                                                        : 'border-black/15 dark:border-white/18'
                                                                }`}
                                                            />
                                                        </div>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={paymentMethodLoading}
                                                        onClick={() =>
                                                            void selectPaymentMethod(
                                                                'pay_at_property',
                                                            )
                                                        }
                                                        className={`min-h-[86px] rounded-[18px] border p-4 text-start transition-all duration-300 disabled:cursor-wait disabled:opacity-60 ${
                                                            selectedPaymentMethod ===
                                                            'pay_at_property'
                                                                ? 'border-[#b9965a] bg-[#b9965a]/12 shadow-[0_10px_28px_rgba(185,150,90,0.12)]'
                                                                : 'border-black/[0.07] bg-white/55 hover:border-[#b9965a]/55 hover:bg-[#b9965a]/[0.06] dark:border-white/[0.07] dark:bg-white/[0.025]'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-[10px] font-bold text-[#242622] dark:text-white/90">
                                                                    {language ===
                                                                    'ar'
                                                                        ? 'الدفع عند الوصول'
                                                                        : 'Pay at property'}
                                                                </p>
                                                                <p className="mt-1.5 text-[8px] leading-5 text-black/40 dark:text-white/34">
                                                                    {language ===
                                                                    'ar'
                                                                        ? 'اختيار الدفع في مقر سفن لوز عند الوصول'
                                                                        : 'Choose to pay at Seven Luz when you arrive'}
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${
                                                                    selectedPaymentMethod ===
                                                                    'pay_at_property'
                                                                        ? 'border-[#b9965a] bg-[#b9965a] shadow-[inset_0_0_0_3px_#f7f2e9] dark:shadow-[inset_0_0_0_3px_#191a18]'
                                                                        : 'border-black/15 dark:border-white/18'
                                                                }`}
                                                            />
                                                        </div>
                                                    </button>
                                                </div>

                                                {paymentMethodLoading && (
                                                    <p className="mt-3 text-center text-[9px] font-semibold text-[#8b6937] dark:text-[#d4b578]">
                                                        {language === 'ar'
                                                            ? 'جارٍ حفظ طريقة الدفع...'
                                                            : 'Saving payment method...'}
                                                    </p>
                                                )}

                                                {paymentMethodError && (
                                                    <div className="mt-3 rounded-[14px] border border-[#b9965a]/20 bg-[#b9965a]/[0.07] px-4 py-3">
                                                        <p className="text-[9px] font-semibold leading-5 text-[#6f542d] dark:text-[#e0c487]">
                                                            {paymentMethodError}
                                                        </p>
                                                    </div>
                                                )}

                                                {selectedPaymentMethod && (
                                                    <div className="mt-4 rounded-[16px] border border-[#b9965a]/24 bg-[#b9965a]/[0.08] px-4 py-3 text-center">
                                                        <p className="text-[9px] font-bold text-[#896735] dark:text-[#d9bc7f]">
                                                            {language === 'ar'
                                                                ? selectedPaymentMethod ===
                                                                  'pay_now'
                                                                    ? 'تم اختيار الدفع الآن'
                                                                    : 'تم اختيار الدفع عند الوصول'
                                                                : selectedPaymentMethod ===
                                                                    'pay_now'
                                                                  ? 'Pay now selected'
                                                                  : 'Pay at property selected'}
                                                        </p>
                                                        <p className="mt-1 text-[8px] leading-4 text-black/38 dark:text-white/32">
                                                            {language === 'ar'
                                                                ? selectedPaymentMethod ===
                                                                  'pay_now'
                                                                    ? 'الخطوة التالية ستكون فتح مسار بوابة الدفع الإلكتروني'
                                                                    : confirmedPayAtProperty
                                                                      ? 'تم تأكيد الحجز بنجاح والدفع ما زال مستحقًا عند الوصول'
                                                                      : 'تم حفظ الاختيار، أكد الحجز لإتمام حجز الدفع عند الوصول'
                                                                : selectedPaymentMethod ===
                                                                    'pay_now'
                                                                  ? 'The next step will open the online payment flow'
                                                                  : confirmedPayAtProperty
                                                                    ? 'Booking confirmed successfully. Payment remains due at arrival'
                                                                    : 'Your choice is saved. Confirm the booking to finish pay at property'}
                                                        </p>
                                                    </div>
                                                )}

                                                {selectedPaymentMethod ===
                                                    'pay_now' && (
                                                        <div className="mt-4">
                                                            {paymentStartError && (
                                                                <div className="mb-3 rounded-[14px] border border-[#b9965a]/20 bg-[#b9965a]/[0.07] px-4 py-3">
                                                                    <p className="text-[9px] font-semibold leading-5 text-[#6f542d] dark:text-[#e0c487]">
                                                                        {paymentStartError}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {!startedPayment ? (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        disabled={paymentStartLoading}
                                                                        onClick={() =>
                                                                            void startOnlinePayment()
                                                                        }
                                                                        className="flex min-h-[52px] w-full items-center justify-center rounded-[16px] bg-[#1b1d1b] px-4 text-[10px] font-bold text-white transition duration-300 hover:bg-[#b9965a] hover:text-[#171816] disabled:cursor-wait disabled:opacity-60 dark:bg-[#c7a365] dark:text-[#171816]"
                                                                    >
                                                                        {paymentStartLoading
                                                                            ? language === 'ar'
                                                                                ? 'جارٍ تجهيز عملية الدفع...'
                                                                                : 'Preparing payment...'
                                                                            : language === 'ar'
                                                                              ? 'المتابعة إلى الدفع الإلكتروني'
                                                                              : 'Continue to online payment'}
                                                                    </button>

                                                                    <p className="mt-2 text-center text-[8px] leading-4 text-black/36 dark:text-white/30">
                                                                        {language === 'ar'
                                                                            ? 'لن يتم اعتبار الحجز مدفوعًا أو مؤكدًا إلا بعد تأكيد بوابة الدفع الفعلية'
                                                                            : 'The booking will not be marked paid or confirmed until the real payment gateway verifies the payment'}
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <div className="rounded-[18px] border border-[#b9965a]/28 bg-[#b9965a]/[0.09] p-4 text-center">
                                                                    <p className="text-[10px] font-bold text-[#7f6031] dark:text-[#dec184]">
                                                                        {language === 'ar'
                                                                            ? 'تم تجهيز محاولة الدفع'
                                                                            : 'Payment attempt prepared'}
                                                                    </p>

                                                                    <p className="mt-2 text-[8px] leading-5 text-black/44 dark:text-white/36">
                                                                        {language === 'ar'
                                                                            ? `مرجع الدفع: ${startedPayment.payment_reference}`
                                                                            : `Payment reference: ${startedPayment.payment_reference}`}
                                                                    </p>

                                                                    <p className="text-[8px] leading-5 text-black/44 dark:text-white/36">
                                                                        {startedPayment.amount}{' '}
                                                                        {startedPayment.currency}
                                                                    </p>

                                                                    {!startedPayment.payment_url && (
                                                                        <p className="mt-2 text-[8px] leading-4 text-black/36 dark:text-white/30">
                                                                            {language === 'ar'
                                                                                ? 'البنية جاهزة، وسيتم فتح صفحة الدفع تلقائيًا بعد ربط مزود الدفع الحقيقي'
                                                                                : 'The payment flow is ready. The gateway page will open automatically once the real provider is connected'}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                {selectedPaymentMethod ===
                                                    'pay_at_property' &&
                                                    !confirmedPayAtProperty && (
                                                        <div className="mt-4">
                                                            {payAtPropertyError && (
                                                                <div className="mb-3 rounded-[14px] border border-[#b9965a]/20 bg-[#b9965a]/[0.07] px-4 py-3">
                                                                    <p className="text-[9px] font-semibold leading-5 text-[#6f542d] dark:text-[#e0c487]">
                                                                        {payAtPropertyError}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            <button
                                                                type="button"
                                                                disabled={payAtPropertyLoading}
                                                                onClick={() =>
                                                                    void confirmPayAtPropertyBooking()
                                                                }
                                                                className="flex min-h-[52px] w-full items-center justify-center rounded-[16px] bg-[#1b1d1b] px-4 text-[10px] font-bold text-white transition duration-300 hover:bg-[#b9965a] hover:text-[#171816] disabled:cursor-wait disabled:opacity-60 dark:bg-[#c7a365] dark:text-[#171816]"
                                                            >
                                                                {payAtPropertyLoading
                                                                    ? language === 'ar'
                                                                        ? 'جارٍ تأكيد الحجز...'
                                                                        : 'Confirming booking...'
                                                                    : language === 'ar'
                                                                      ? 'تأكيد الحجز والدفع عند الوصول'
                                                                      : 'Confirm booking — pay at property'}
                                                            </button>

                                                            <p className="mt-2 text-center text-[8px] leading-4 text-black/36 dark:text-white/30">
                                                                {language === 'ar'
                                                                    ? 'سيظل الدفع مستحقًا عند الوصول، والحجز متاح حتى الساعة 11 مساءً يوم الوصول'
                                                                    : 'Payment remains due at arrival. The booking is available until 11:00 PM on the arrival day'}
                                                            </p>
                                                        </div>
                                                    )}

                                                {confirmedPayAtProperty && (
                                                    <div className="mt-4 rounded-[20px] border border-[#b9965a]/30 bg-[#b9965a]/[0.10] p-4 text-center sm:p-5">
                                                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#b9965a] text-[#171816]">
                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                className="h-5 w-5"
                                                                aria-hidden="true"
                                                            >
                                                                <path d="m5 12 4 4L19 6" />
                                                            </svg>
                                                        </div>

                                                        <p className="mt-3 text-[11px] font-bold text-[#242622] dark:text-white/92">
                                                            {language === 'ar'
                                                                ? 'تم تأكيد الحجز بنجاح'
                                                                : 'Booking confirmed successfully'}
                                                        </p>

                                                        <p className="mt-1 text-[9px] leading-5 text-black/45 dark:text-white/38">
                                                            {language === 'ar'
                                                                ? `مرجع الحجز: ${confirmedPayAtProperty.booking_reference}`
                                                                : `Booking reference: ${confirmedPayAtProperty.booking_reference}`}
                                                        </p>

                                                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                            <div className="rounded-[14px] border border-black/[0.06] bg-white/45 px-3 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.025]">
                                                                <p className="text-[8px] text-black/38 dark:text-white/32">
                                                                    {language === 'ar'
                                                                        ? 'الإجمالي'
                                                                        : 'Total'}
                                                                </p>
                                                                <p className="mt-1 text-[10px] font-bold text-[#242622] dark:text-white/88">
                                                                    {confirmedPayAtProperty.total_amount}{' '}
                                                                    {confirmedPayAtProperty.currency}
                                                                </p>
                                                            </div>

                                                            <div className="rounded-[14px] border border-black/[0.06] bg-white/45 px-3 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.025]">
                                                                <p className="text-[8px] text-black/38 dark:text-white/32">
                                                                    {language === 'ar'
                                                                        ? 'حالة الدفع'
                                                                        : 'Payment status'}
                                                                </p>
                                                                <p className="mt-1 text-[10px] font-bold text-[#242622] dark:text-white/88">
                                                                    {language === 'ar'
                                                                        ? 'الدفع عند الوصول'
                                                                        : 'Pay at property'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <p className="mt-3 text-[8px] leading-5 text-black/42 dark:text-white/35">
                                                            {language === 'ar'
                                                                ? 'الحجز متاح حتى الساعة 11:00 مساءً يوم الوصول بتوقيت الرياض'
                                                                : 'The booking is available until 11:00 PM on the arrival day, Riyadh time'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setGuestDetailsOpen(false)
                                        }
                                        className="mt-5 flex min-h-[48px] w-full items-center justify-center rounded-[16px] border border-black/10 text-[10px] font-bold text-black/60 transition duration-300 hover:border-[#b9965a] hover:text-[#8b6937] dark:border-white/10 dark:text-white/60"
                                    >
                                        {language === 'ar'
                                            ? 'إغلاق'
                                            : 'Close'}
                                    </button>
                                </div>
                            ) : (
                                <form
                                    onSubmit={createBookingHold}
                                    className="p-5 sm:p-7"
                                >
                                    <div className="grid gap-3">
                                        <label className="block">
                                            <span className="mb-1.5 block text-[9px] font-bold text-black/45 dark:text-white/40">
                                                {language === 'ar'
                                                    ? 'الاسم الكامل'
                                                    : 'Full name'}
                                            </span>
                                            <input
                                                value={guestName}
                                                onChange={(event) =>
                                                    setGuestName(
                                                        event.target.value,
                                                    )
                                                }
                                                autoComplete="name"
                                                className="h-12 w-full rounded-[16px] border border-black/10 bg-white/65 px-4 text-sm text-[#1c1e1c] outline-none transition focus:border-[#b9965a] dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                                                placeholder={
                                                    language === 'ar'
                                                        ? 'اكتب اسم الضيف'
                                                        : 'Guest name'
                                                }
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="mb-1.5 block text-[9px] font-bold text-black/45 dark:text-white/40">
                                                {language === 'ar'
                                                    ? 'رقم الجوال'
                                                    : 'Mobile number'}
                                            </span>
                                            <input
                                                value={guestPhone}
                                                onChange={(event) =>
                                                    setGuestPhone(
                                                        event.target.value,
                                                    )
                                                }
                                                inputMode="tel"
                                                autoComplete="tel"
                                                dir="ltr"
                                                className="h-12 w-full rounded-[16px] border border-black/10 bg-white/65 px-4 text-sm text-[#1c1e1c] outline-none transition focus:border-[#b9965a] dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                                                placeholder="+9665XXXXXXXX"
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="mb-1.5 block text-[9px] font-bold text-black/45 dark:text-white/40">
                                                {language === 'ar'
                                                    ? 'البريد الإلكتروني (اختياري)'
                                                    : 'Email (optional)'}
                                            </span>
                                            <input
                                                value={guestEmail}
                                                onChange={(event) =>
                                                    setGuestEmail(
                                                        event.target.value,
                                                    )
                                                }
                                                type="email"
                                                autoComplete="email"
                                                dir="ltr"
                                                className="h-12 w-full rounded-[16px] border border-black/10 bg-white/65 px-4 text-sm text-[#1c1e1c] outline-none transition focus:border-[#b9965a] dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                                                placeholder="name@example.com"
                                            />
                                        </label>
                                    </div>

                                    {holdError && (
                                        <div className="mt-4 rounded-[16px] border border-[#b9965a]/20 bg-[#b9965a]/[0.07] px-4 py-3">
                                            <p className="text-[10px] font-semibold leading-5 text-[#6f542d] dark:text-[#e0c487]">
                                                {holdError}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={holdLoading}
                                        className="mt-5 flex min-h-[54px] w-full items-center justify-center gap-3 rounded-[18px] bg-[#1b1d1b] text-[11px] font-bold text-white transition-all duration-300 hover:bg-[#b9965a] hover:text-[#171816] disabled:cursor-wait disabled:opacity-65 dark:bg-[#c7a365] dark:text-[#171816]"
                                    >
                                        {holdLoading
                                            ? language === 'ar'
                                                ? 'جارٍ تثبيت الوحدة...'
                                                : 'Holding room...'
                                            : language === 'ar'
                                              ? 'تثبيت الوحدة والمتابعة'
                                              : 'Hold room and continue'}

                                        {!holdLoading && (
                                            <ArrowIcon rtl={isRtl} />
                                        )}
                                    </button>

                                    <p className="mt-3 text-center text-[9px] leading-5 text-black/38 dark:text-white/32">
                                        {language === 'ar'
                                            ? 'سيتم تثبيت الوحدة مؤقتًا أثناء استكمال خطوات الحجز'
                                            : 'The room will be held temporarily while you complete the booking'}
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                <style>{`
                    .sl-header-control:hover,
                    .sl-header-control:active,
                    .sl-header-control:focus-visible {
                        border-color: rgba(210, 179, 114, .4);
                        background: rgba(210, 179, 114, .12);
                        color: #f3dba8;
                        box-shadow: 0 8px 24px rgba(0, 0, 0, .12);
                    }

                    .sl-admin-control:hover,
                    .sl-admin-control:active,
                    .sl-admin-control:focus-visible {
                        transform: translateY(-2px);
                        background: #e0c58c;
                        box-shadow: 0 14px 34px rgba(0, 0, 0, .2);
                    }

                    .sl-mobile-menu-link:hover,
                    .sl-mobile-menu-link:active,
                    .sl-mobile-menu-link:focus-visible {
                        background: rgba(199, 163, 101, .14);
                        color: #ecd49e;
                    }

                    .sl-desktop-nav-link:hover,
                    .sl-desktop-nav-link:active,
                    .sl-desktop-nav-link:focus-visible {
                        color: #efd9aa;
                    }

                    .sl-floating-contact {
                        -webkit-tap-highlight-color: transparent;
                        transition:
                            transform .3s ease,
                            border-color .3s ease,
                            box-shadow .3s ease;
                        will-change: transform;
                    }

                    .sl-floating-contact:hover,
                    .sl-floating-contact:active,
                    .sl-floating-contact:focus-visible {
                        border-color: rgba(224, 197, 140, .58);
                        box-shadow:
                            0 18px 42px rgba(0, 0, 0, .3),
                            0 0 28px rgba(210, 179, 114, .16);
                    }

                    .sl-floating-contact-call {
                        animation: slFloatingCall 4.2s ease-in-out infinite;
                    }

                    .sl-floating-contact-whatsapp {
                        animation: slFloatingWhatsApp 4.2s ease-in-out .55s infinite;
                    }

                    @keyframes slFloatingCall {
                        0%, 100% { transform: translateY(0); }
                        45%, 55% { transform: translateY(-7px); }
                    }

                    @keyframes slFloatingWhatsApp {
                        0%, 100% { transform: translateY(0); }
                        45%, 55% { transform: translateY(-8px); }
                    }

                    html {
                        scroll-behavior: smooth;
                        scroll-padding-top: 96px;
                    }

                    .sl-hero-shimmer {
                        color: #d8b978;
                        background-image: linear-gradient(
                            105deg,
                            #cda963 0%,
                            #d8b978 34%,
                            #fff3c8 48%,
                            #e8cc90 56%,
                            #d8b978 68%,
                            #cda963 100%
                        );
                        background-size: 240% 100%;
                        background-position: 120% 0;
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: slHeroShimmer 4.8s ease-in-out infinite;
                    }

                    @keyframes slHeroShimmer {
                        0%,
                        58%,
                        100% {
                            background-position: 120% 0;
                        }

                        72% {
                            background-position: -35% 0;
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .sl-floating-contact-call,
                        .sl-floating-contact-whatsapp {
                            animation: none !important;
                        }

                        .sl-hero-slide {
                        opacity: 0;
                        transform: translate3d(7%, 0, 0) scale(1.09);
                        filter: saturate(.88) brightness(.86);
                        transition:
                            opacity 1.15s cubic-bezier(.16, 1, .3, 1),
                            transform 1.35s cubic-bezier(.16, 1, .3, 1),
                            filter 1.35s ease;
                        will-change: opacity, transform, filter;
                    }

                    [dir="ltr"] .sl-hero-slide {
                        transform: translate3d(-7%, 0, 0) scale(1.09);
                    }

                    .sl-hero-slide-active {
                        opacity: 1;
                        transform: translate3d(0, 0, 0) scale(1);
                        filter: saturate(1) brightness(1);
                    }

                    .sl-hero-slide-active img {
                        animation: slHeroImageDrift 5.6s cubic-bezier(.16, 1, .3, 1) both;
                    }

                    .sl-hero-image-glow {
                        background:
                            radial-gradient(circle at 18% 32%, rgba(244, 218, 154, .20), transparent 28%),
                            radial-gradient(circle at 82% 22%, rgba(205, 166, 92, .17), transparent 25%),
                            radial-gradient(circle at 74% 76%, rgba(255, 244, 211, .11), transparent 22%);
                        mix-blend-mode: screen;
                        animation: slHeroImageGlow 5.8s ease-in-out infinite;
                    }

                    .sl-hero-vignette {
                        box-shadow:
                            inset 0 0 160px rgba(0, 0, 0, .24),
                            inset 0 -130px 155px rgba(0, 0, 0, .34);
                    }

                    .sl-hero-ambient {
                        animation: slHeroAmbient 6.4s ease-in-out infinite;
                    }

                    .sl-hero-sweep {
                        opacity: 0;
                        animation: slHeroSweep 5.6s cubic-bezier(.2, .72, .28, 1) infinite;
                    }

                    .sl-hero-copy {
                        opacity: 0;
                        filter: blur(10px);
                        transform: translate3d(54px, 0, 0);
                        animation: slHeroCopyIn .9s cubic-bezier(.16, 1, .3, 1) forwards;
                        will-change: transform, opacity, filter;
                    }

                    [dir="ltr"] .sl-hero-copy {
                        transform: translate3d(-54px, 0, 0);
                    }

                    .sl-hero-copy-1 { animation-delay: .04s; }
                    .sl-hero-copy-2 { animation-delay: .10s; }
                    .sl-hero-copy-3 { animation-delay: .18s; }
                    .sl-hero-copy-4 { animation-delay: .27s; }
                    .sl-hero-copy-5 { animation-delay: .36s; }
                    .sl-hero-copy-6 { animation-delay: .44s; }

                    .sl-hero-progress {
                        transform-origin: right center;
                        animation: slHeroProgress 5.6s linear forwards;
                    }

                    [dir="ltr"] .sl-hero-progress {
                        transform-origin: left center;
                    }

                    @keyframes slHeroImageDrift {
                        0% {
                            transform: scale(1.11) translate3d(0, 0, 0);
                        }

                        100% {
                            transform: scale(1.02) translate3d(0, -0.7%, 0);
                        }
                    }

                    @keyframes slHeroImageGlow {
                        0%, 100% {
                            opacity: .62;
                            transform: scale(1) translate3d(0, 0, 0);
                        }

                        50% {
                            opacity: 1;
                            transform: scale(1.045) translate3d(-1.2%, 1.4%, 0);
                        }
                    }

                    @keyframes slHeroAmbient {
                        0%, 100% {
                            opacity: .55;
                            transform: translate3d(0, 0, 0) scale(.92);
                        }

                        50% {
                            opacity: 1;
                            transform: translate3d(-4%, 4%, 0) scale(1.10);
                        }
                    }

                    @keyframes slHeroSweep {
                        0%, 14% {
                            transform: translate3d(-35%, 0, 0) rotate(11deg);
                            opacity: 0;
                        }

                        28% {
                            opacity: .8;
                        }

                        58% {
                            opacity: .95;
                        }

                        76%, 100% {
                            transform: translate3d(650%, 0, 0) rotate(11deg);
                            opacity: 0;
                        }
                    }

                    @keyframes slHeroCopyIn {
                        0% {
                            opacity: 0;
                            transform: translate3d(54px, 0, 0);
                            filter: blur(10px);
                        }

                        100% {
                            opacity: 1;
                            transform: translate3d(0, 0, 0);
                            filter: blur(0);
                        }
                    }

                    @keyframes slHeroProgress {
                        from {
                            transform: scaleX(0);
                        }

                        to {
                            transform: scaleX(1);
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .sl-hero-slide,
                        .sl-hero-slide-active,
                        .sl-hero-slide-active img,
                        .sl-hero-image-glow,
                        .sl-hero-ambient,
                        .sl-hero-sweep,
                        .sl-hero-copy,
                        .sl-hero-progress {
                            animation: none !important;
                            transition: none !important;
                        }

                        .sl-hero-slide {
                        opacity: 0;
                        clip-path: inset(0 0 0 100%);
                        transform: translate3d(8%, 0, 0) scale(1.13);
                        filter: blur(7px) saturate(.82) brightness(.78);
                        transition:
                            opacity 1.25s cubic-bezier(.16, 1, .3, 1),
                            clip-path 1.45s cubic-bezier(.16, 1, .3, 1),
                            transform 1.65s cubic-bezier(.16, 1, .3, 1),
                            filter 1.35s ease;
                        will-change: opacity, clip-path, transform, filter;
                    }

                    [dir="ltr"] .sl-hero-slide {
                        clip-path: inset(0 100% 0 0);
                        transform: translate3d(-8%, 0, 0) scale(1.13);
                    }

                    .sl-hero-slide-active {
                        opacity: 1;
                        clip-path: inset(0 0 0 0);
                        transform: translate3d(0, 0, 0) scale(1);
                        filter: blur(0) saturate(1) brightness(1);
                    }

                    .sl-hero-slide-active img {
                        animation: slHeroImageDrift 6.4s cubic-bezier(.16, 1, .3, 1) both;
                    }

                    .sl-hero-image-glow {
                        background:
                            radial-gradient(circle at 18% 30%, rgba(255, 226, 157, .23), transparent 26%),
                            radial-gradient(circle at 82% 18%, rgba(204, 160, 78, .20), transparent 24%),
                            radial-gradient(circle at 68% 78%, rgba(255, 246, 220, .13), transparent 22%);
                        mix-blend-mode: screen;
                        animation: slHeroImageGlow 4.8s ease-in-out infinite;
                    }

                    .sl-hero-image-shine {
                        background:
                            linear-gradient(
                                116deg,
                                transparent 0%,
                                transparent 39%,
                                rgba(255,255,255,.02) 43%,
                                rgba(255,238,194,.14) 49%,
                                rgba(255,255,255,.21) 52%,
                                rgba(255,238,194,.08) 56%,
                                transparent 62%,
                                transparent 100%
                            );
                        background-size: 240% 100%;
                        animation: slHeroImageShine 5.4s ease-in-out infinite;
                        mix-blend-mode: screen;
                    }

                    .sl-hero-vignette {
                        box-shadow:
                            inset 0 0 190px rgba(0, 0, 0, .25),
                            inset 0 -145px 180px rgba(0, 0, 0, .39);
                    }

                    .sl-hero-ambient {
                        animation: slHeroAmbient 5.8s ease-in-out infinite;
                    }

                    .sl-hero-sweep {
                        opacity: 0;
                        animation: slHeroSweep 6.4s cubic-bezier(.18, .74, .27, 1) infinite;
                    }

                    .sl-hero-copy {
                        opacity: 0;
                        filter: blur(12px);
                        transform: translate3d(82px, 0, 0);
                        animation: slHeroCopyIn 1.05s cubic-bezier(.16, 1, .3, 1) forwards;
                        will-change: transform, opacity, filter;
                    }

                    [dir="ltr"] .sl-hero-copy {
                        transform: translate3d(-82px, 0, 0);
                    }

                    .sl-hero-copy-1 { animation-delay: .04s; }
                    .sl-hero-copy-2 { animation-delay: .12s; }
                    .sl-hero-copy-3 { animation-delay: .23s; }
                    .sl-hero-copy-4 { animation-delay: .34s; }
                    .sl-hero-copy-5 { animation-delay: .45s; }
                    .sl-hero-copy-6 { animation-delay: .56s; }

                    .sl-hero-gold {
                        color: #e0bd72;
                        background-image: linear-gradient(
                            105deg,
                            #a77c3a 0%,
                            #dbb96e 22%,
                            #fff3c6 42%,
                            #fffbe7 50%,
                            #f2d995 58%,
                            #d8b36a 74%,
                            #a77c3a 100%
                        );
                        background-size: 250% 100%;
                        background-position: 125% 0;
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        filter: drop-shadow(0 0 10px rgba(224, 190, 116, .20));
                        animation:
                            slHeroCopyIn 1.05s .23s cubic-bezier(.16, 1, .3, 1) forwards,
                            slHeroGoldShimmer 3.9s 1.2s ease-in-out infinite,
                            slHeroGoldGlow 2.8s 1.2s ease-in-out infinite;
                    }

                    .sl-hero-progress {
                        transform-origin: right center;
                        animation: slHeroProgress 6.4s linear forwards;
                    }

                    [dir="ltr"] .sl-hero-progress {
                        transform-origin: left center;
                    }

                    .sl-hero-nav {
                        -webkit-tap-highlight-color: transparent;
                    }

                    @keyframes slHeroImageDrift {
                        0% {
                            transform: scale(1.14) translate3d(1.5%, 0, 0);
                        }

                        100% {
                            transform: scale(1.025) translate3d(-1%, -0.8%, 0);
                        }
                    }

                    @keyframes slHeroImageGlow {
                        0%, 100% {
                            opacity: .55;
                            transform: scale(1) translate3d(0, 0, 0);
                        }

                        50% {
                            opacity: 1;
                            transform: scale(1.055) translate3d(-1.4%, 1.6%, 0);
                        }
                    }

                    @keyframes slHeroImageShine {
                        0%, 20% {
                            background-position: 135% 0;
                            opacity: .18;
                        }

                        44% {
                            opacity: .95;
                        }

                        68%, 100% {
                            background-position: -70% 0;
                            opacity: .22;
                        }
                    }

                    @keyframes slHeroAmbient {
                        0%, 100% {
                            opacity: .48;
                            transform: translate3d(0, 0, 0) scale(.90);
                        }

                        50% {
                            opacity: 1;
                            transform: translate3d(-5%, 5%, 0) scale(1.12);
                        }
                    }

                    @keyframes slHeroSweep {
                        0%, 16% {
                            transform: translate3d(-30%, 0, 0) rotate(10deg);
                            opacity: 0;
                        }

                        28% {
                            opacity: .7;
                        }

                        52% {
                            opacity: 1;
                        }

                        74%, 100% {
                            transform: translate3d(720%, 0, 0) rotate(10deg);
                            opacity: 0;
                        }
                    }

                    @keyframes slHeroCopyIn {
                        0% {
                            opacity: 0;
                            transform: translate3d(82px, 0, 0);
                            filter: blur(12px);
                        }

                        55% {
                            opacity: 1;
                        }

                        100% {
                            opacity: 1;
                            transform: translate3d(0, 0, 0);
                            filter: blur(0);
                        }
                    }

                    @keyframes slHeroGoldShimmer {
                        0%, 58%, 100% {
                            background-position: 125% 0;
                        }

                        74% {
                            background-position: -40% 0;
                        }
                    }

                    @keyframes slHeroGoldGlow {
                        0%, 100% {
                            filter: drop-shadow(0 0 8px rgba(224, 190, 116, .16));
                        }

                        50% {
                            filter:
                                drop-shadow(0 0 14px rgba(255, 229, 166, .40))
                                drop-shadow(0 0 28px rgba(190, 143, 63, .22));
                        }
                    }

                    @keyframes slHeroProgress {
                        from { transform: scaleX(0); }
                        to { transform: scaleX(1); }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .sl-hero-slide,
                        .sl-hero-slide-active,
                        .sl-hero-slide-active img,
                        .sl-hero-image-glow,
                        .sl-hero-image-shine,
                        .sl-hero-ambient,
                        .sl-hero-sweep,
                        .sl-hero-copy,
                        .sl-hero-gold,
                        .sl-hero-progress {
                            animation: none !important;
                            transition: none !important;
                        }

                        .sl-hero-slide {
                            transform: none !important;
                            clip-path: none !important;
                        }

                        .sl-hero-copy,
                        .sl-hero-gold {
                            opacity: 1 !important;
                            transform: none !important;
                            filter: none !important;
                        }
                    }

                    .sl-hero-shimmer {
                            animation: none;
                            -webkit-text-fill-color: #d8b978;
                            background-image: none;
                        }
                    }

                    @keyframes slOrbit {
                        from {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(360deg);
                        }
                    }

                    @keyframes slOrbitReverse {
                        from {
                            transform: rotate(360deg);
                        }

                        to {
                            transform: rotate(0deg);
                        }
                    }

                    @keyframes slPhotoFloatA {
                        0%,
                        100% {
                            transform: translate3d(0, 0, 0) rotate(-2deg);
                        }

                        50% {
                            transform: translate3d(8px, -10px, 0) rotate(2deg);
                        }
                    }

                    @keyframes slPhotoFloatB {
                        0%,
                        100% {
                            transform: translate3d(0, 0, 0) rotate(2deg);
                        }

                        50% {
                            transform: translate3d(-8px, 9px, 0) rotate(-2deg);
                        }
                    }
                `}</style>
            </div>
        </>
    );
}