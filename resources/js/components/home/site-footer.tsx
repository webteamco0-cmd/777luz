type Language = 'ar' | 'en';

const MAP_URL = 'https://maps.app.goo.gl/tRkdRSAkoneq1gQy6';

export default function SiteFooter({ language }: { language: Language }) {
    const isRtl = language === 'ar';

    const links = [
        { href: '#stay', ar: 'الإقامة', en: 'Stay' },
        { href: '#amenities', ar: 'الخدمات', en: 'Amenities' },
        { href: '#rooms', ar: 'الوحدات', en: 'Apartments' },
        { href: '#gallery', ar: 'المعرض', en: 'Gallery' },
        { href: '#location', ar: 'الموقع', en: 'Location' },
    ];

    return (
        <footer className="relative overflow-hidden bg-[#111310] px-4 pb-8 pt-12 text-white sm:px-6 lg:px-10 xl:px-14">
            <div className="pointer-events-none absolute right-[-14%] top-[-20%] h-[26rem] w-[26rem] rounded-full bg-[#b9965a]/[0.055] blur-[135px]" />

            <div className="relative mx-auto max-w-[1450px]">
                <div className="grid gap-10 border-b border-white/[0.08] pb-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
                    <div className="max-w-[520px]">
                        <a href="#top" className="inline-flex items-center gap-3" aria-label="Seven Luz">
                            <img src="/assets/brand/seven-luz-logo.png" alt="Seven Luz" className="h-14 w-14 object-contain" />
                            <div>
                                <div className="text-[13px] font-semibold tracking-[0.02em]">SEVEN LUZ</div>
                                <div className="mt-1 text-[8px] tracking-[0.14em] text-white/35">SERVICED APARTMENT</div>
                            </div>
                        </a>

                        <p className="mt-5 max-w-[440px] text-[10.5px] leading-6 text-white/38">
                            {isRtl
                                ? 'شقق مخدومة في حي المصيف بالرياض بتجهيزات عملية وخيارات إقامة تناسب الزيارات القصيرة والممتدة'
                                : 'Serviced apartments in Al Masif, Riyadh with practical amenities for short and extended stays'}
                        </p>
                    </div>

                    <div>
                        <div className="text-[8px] font-bold tracking-[0.12em] text-[#d1b273]">{isRtl ? 'تواصل' : 'CONTACT'}</div>
                        <div className="mt-5 space-y-3 text-[10.5px] text-white/48">
                            <a dir="ltr" href="tel:+966546230519" className="block w-fit transition-colors hover:text-white">+966 54 623 0519</a>
                            <a dir="ltr" href="mailto:info@sevnluz.com" className="block w-fit transition-colors hover:text-white">info@sevnluz.com</a>
                            <a href={MAP_URL} target="_blank" rel="noreferrer" className="block transition-colors hover:text-white">
                                {isRtl ? 'حي المصيف، الرياض' : 'Al Masif, Riyadh'}
                            </a>
                        </div>
                    </div>

                    <div>
                        <div className="text-[8px] font-bold tracking-[0.12em] text-[#d1b273]">{isRtl ? 'روابط' : 'LINKS'}</div>
                        <nav className="mt-5 space-y-3 text-[10.5px] text-white/48" aria-label={isRtl ? 'روابط الموقع' : 'Site links'}>
                            {links.map((link) => (
                                <a key={link.href} href={link.href} className="block transition-colors hover:text-white">
                                    {isRtl ? link.ar : link.en}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-6 text-[8px] tracking-[0.08em] text-white/24 sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} SEVEN LUZ</span>
                    <span>{isRtl ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</span>
                </div>
            </div>
        </footer>
    );
}
