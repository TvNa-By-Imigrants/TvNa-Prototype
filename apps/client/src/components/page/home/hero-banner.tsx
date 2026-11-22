import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/i18n"
import { cn } from "@/lib/utils"

export type HeroBannerProps = {
  className?: string
}

type SlideItem = {
  id: string
  isBrandSlide?: boolean
  badgeKey?: string
  headlineKey?: string
  headlineText?: string
  taglineKey?: string
  taglineText?: string
  meta?: string
  image: string
}

const slides: SlideItem[] = [
  {
    id: "tvna-brand",
    isBrandSlide: true,
    headlineKey: "discovery.heroHeadline",
    taglineKey: "discovery.heroTagline",
    image: "https://res.cloudinary.com/daqze8ogx/image/upload/v1795371425/uucdm3f2rcmwonp0p4oq.webp",
  },
  {
    id: "tsutaya-cafe",
    headlineText: "Tatsuya Bookstore Cafe",
    taglineText: "ហាងសៀវភៅ និងកាហ្វេ សម្រាប់អាន និងធ្វើការយ៉ាងស្ងប់ស្ងាត់",
    meta: "BKK1 · Bookstore Cafe",
    image: "https://res.cloudinary.com/daqze8ogx/image/upload/v1795371423/vntoncedkjvhc511pjtg.webp",
  },
  {
    id: "kaixin-hotpot",
    headlineText: "Kaixin Hotpot",
    taglineText: "ស៊ុបក្ដៅរសជាតិដើមដ៏ឈ្ងុយឆ្ងាញ់នៅ Fun Mall",
    meta: "Toul Kork · Restaurant",
    image: "https://res.cloudinary.com/daqze8ogx/image/upload/v1795371412/v1s5lmz8pbzd1dl7ll3m.webp",
  },
  {
    id: "coconut-park",
    headlineText: "Coconut Park Cafe",
    taglineText: "សួនកម្សាន្តធម្មជាតិ និងកាហ្វេមាត់ទឹកដ៏ត្រជាក់",
    meta: "Chamkar Mon · Park & Cafe",
    image: "https://res.cloudinary.com/daqze8ogx/image/upload/v1795371403/yshym1x7gt5n7zvuan7i.webp",
  },
  {
    id: "funnifun-arcade",
    headlineText: "Funnifun Arcade",
    taglineText: "កន្លែងកម្សាន្តចាប់តុក្កតា និងហ្គេមប្លែកៗ",
    meta: "BKK1 · Arcade & Games",
    image: "https://res.cloudinary.com/daqze8ogx/image/upload/v1795371410/urxupkkd3dtlbixytj3u.webp",
  },
]

/**
 * Hero promo banner with infinite auto-sliding loop (... -> end -> front -> ...).
 * Features official partner places and TvNa brand showcase.
 * Strictly uses shadcn Button and Badge primitives with stable vertical positioning.
 */
export function HeroBanner({ className }: HeroBannerProps) {
  const { language, t } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const navigate = useNavigate()

  // Auto-slide loop: advances every 4.2 seconds
  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 4200)

    return () => clearInterval(timer)
  }, [isPaused])

  const handlePrev = (e?: React.MouseEvent) => {
    e?.preventDefault()
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault()
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  return (
    <section
      aria-label="Hero promotion slider"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        "group relative h-64 sm:h-72 lg:h-80 w-full overflow-hidden rounded-2xl bg-muted shadow-sm select-none",
        className
      )}
    >
      {/* Sliding Carousel Track */}
      <div
        className="flex h-full w-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => {
          const headline = slide.headlineKey ? t(slide.headlineKey as any) : slide.headlineText
          const tagline = slide.taglineKey ? t(slide.taglineKey as any) : slide.taglineText

          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${slides.length}`}
              className="relative flex h-full min-w-full flex-col justify-end overflow-hidden p-5 sm:p-6 lg:p-8"
            >
              {/* Slide Background Image */}
              <img
                src={slide.image}
                alt=""
                aria-hidden="true"
                loading="eager"
                className="absolute inset-0 size-full object-cover"
              />

              {/* Dark Gradient Overlay for optimal text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />

              {/* Slide Content with fixed min-height to keep the button locked in place */}
              <div className="relative z-10 flex min-h-[148px] sm:min-h-[160px] max-w-xl flex-col justify-end items-start gap-2 text-white">
                {slide.isBrandSlide ? (
                  <div className="flex items-center gap-2">
                    <img
                      src="https://res.cloudinary.com/daqze8ogx/image/upload/v1795371398/tdowgtvwjxagvyomrmhu.png"
                      alt="TvNa"
                      className="size-8 rounded-md object-contain bg-primary p-0.5 shadow-xs"
                    />
                    <Badge
                      variant="outline"
                      className="border-white/30 bg-white/15 text-white backdrop-blur-xs font-semibold"
                    >
                      <SparklesIcon className="size-3.5" aria-hidden="true" />
                      <span>TvNa · ទៅណា២៤</span>
                    </Badge>
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-primary/40 bg-primary/25 text-white backdrop-blur-xs font-medium"
                  >
                    <span>{t("discovery.partnerPromotion")}</span>
                    {slide.meta ? <span className="opacity-75">· {slide.meta}</span> : null}
                  </Badge>
                )}

                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl line-clamp-1">
                  {headline}
                </h2>

                <p
                  className={cn(
                    "text-white/85 line-clamp-2 max-w-md",
                    language === "km" ? "text-sm leading-relaxed" : "text-sm sm:text-base"
                  )}
                >
                  {tagline}
                </p>

                <Button
                  size="sm"
                  onClick={() => navigate({ to: "/place" })}
                  className="mt-1 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <span>{t("discovery.exploreNow")}</span>
                  <ChevronRightIcon data-icon="inline-end" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Prev / Next Controls using shadcn Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrev}
        aria-label="Previous slide"
        className="absolute left-3 top-0 bottom-0 my-auto z-20 size-9 rounded-full bg-black/40 text-white backdrop-blur-xs opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-black/60 focus-visible:opacity-100 active:translate-y-0"
      >
        <ChevronLeftIcon className="size-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-3 top-0 bottom-0 my-auto z-20 size-9 rounded-full bg-black/40 text-white backdrop-blur-xs opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-black/60 focus-visible:opacity-100 active:translate-y-0"
      >
        <ChevronRightIcon className="size-5" />
      </Button>

      {/* Slide Indicator Dots using shadcn Button primitives */}
      <div className="absolute bottom-3.5 right-4 z-20 flex items-center gap-1.5 sm:bottom-4 sm:right-6">
        {slides.map((s, idx) => {
          const isActive = idx === currentIndex
          return (
            <Button
              key={s.id}
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.preventDefault()
                setCurrentIndex(idx)
              }}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "h-2 p-0 rounded-full transition-all duration-300 min-w-0 border-none active:translate-y-0",
                isActive ? "w-6 bg-primary hover:bg-primary" : "w-2 bg-white/40 hover:bg-white/70"
              )}
            />
          )
        })}
      </div>
    </section>
  )
}
