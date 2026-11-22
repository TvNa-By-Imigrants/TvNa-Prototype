import { BadgeCheckIcon, EyeIcon, MessageCircleIcon, ThumbsUpIcon } from "lucide-react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { FeedPost } from "@/data"
import { useLanguage } from "@/i18n"
import { cn } from "@/lib/utils"

function formatCount(count: number): string {
  if (count >= 1000) {
    const k = count / 1000
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`
  }
  return String(count)
}

/**
 * Social / promo feed card built strictly with shadcn primitives:
 * Card + AspectRatio + Button.
 */
export function FeedCard({ post, className }: { post: FeedPost; className?: string }) {
  const { t } = useLanguage()

  return (
    <Card className={cn("h-full pt-0", className)}>
      <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-t-xl bg-muted">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className="size-full object-cover"
        />
      </AspectRatio>

      <CardHeader>
        <div className="flex items-center gap-2">
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="size-7 shrink-0 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
            >
              {post.author.name.charAt(0)}
            </span>
          )}
          <span className="text-sm font-medium text-foreground">
            {post.author.name}
          </span>
          {post.author.verified ? (
            <BadgeCheckIcon
              aria-label={t("card.verified")}
              className="size-4 text-primary"
            />
          ) : null}
        </div>

        <CardTitle className="line-clamp-1">{post.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {post.description}
        </CardDescription>
      </CardHeader>

      <CardFooter className="mt-auto gap-1 bg-transparent p-1">
        <Button
          variant="ghost"
          size="lg"
          aria-label={t("card.likes")}
          className="flex-1 justify-center gap-1.5 text-xs text-muted-foreground"
        >
          <ThumbsUpIcon aria-hidden="true" />
          {formatCount(post.stats.likes)}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          aria-label={t("card.comments")}
          className="flex-1 justify-center gap-1.5 text-xs text-muted-foreground"
        >
          <MessageCircleIcon aria-hidden="true" />
          {formatCount(post.stats.comments)}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          aria-label={t("card.views")}
          className="flex-1 justify-center gap-1.5 text-xs text-muted-foreground"
        >
          <EyeIcon aria-hidden="true" />
          {formatCount(post.stats.views)}
        </Button>
      </CardFooter>
    </Card>
  )
}
