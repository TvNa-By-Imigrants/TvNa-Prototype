import { useNavigate } from "@tanstack/react-router"
import {
  BadgeCheckIcon,
  EyeIcon,
  MapPinIcon,
  MessageCircleIcon,
  ThumbsUpIcon,
} from "lucide-react"

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
import { normalizeHandle } from "@/data/profiles"
import { useLanguage } from "@/i18n"
import { openAuthDialog } from "@/lib/auth-dialog"
import { usePermissions } from "@/lib/permissions"
import { cn } from "@/lib/utils"

function formatCount(count: number): string {
  if (count >= 1000) {
    const k = count / 1000
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`
  }
  return String(count)
}

export type FeedCardProps = {
  post: FeedPost
  className?: string
  /** `full` reorders the card for a one-column feed; grid keeps photo first. */
  variant?: "grid" | "full"
}

/**
 * Social / promo feed card built strictly with shadcn primitives:
 * Card + AspectRatio + Button.
 */
export function FeedCard({
  post,
  className,
  variant = "grid",
}: FeedCardProps) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user } = usePermissions()
  const full = variant === "full"

  // Browsing an author is a signed-in feature; an anonymous visitor gets the
  // login prompt instead of a dead profile page.
  const openAuthor = () => {
    if (!post.author.handle) return
    if (!user) {
      openAuthDialog("login")
      return
    }
    navigate({
      to: "/profile",
      search: { handle: normalizeHandle(post.author.handle) },
    })
  }

  const photo = (
    <AspectRatio
      ratio={16 / 9}
      className={cn(
        "overflow-hidden bg-muted",
        full ? "mx-4 rounded-lg" : "rounded-t-xl",
      )}
    >
      <img
        src={post.image}
        alt={post.title}
        loading="lazy"
        className="size-full object-cover"
      />
    </AspectRatio>
  )

  return (
    <Card className={cn("h-full pt-0", className)}>
      {full ? null : photo}

      <CardHeader className={cn(full && "pt-4")}>
        <button
          type="button"
          onClick={openAuthor}
          disabled={!post.author.handle}
          className="flex w-fit items-center gap-2 text-left disabled:cursor-default"
        >
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
          {full && post.timestamp ? (
            <span className="text-xs text-muted-foreground">· {post.timestamp}</span>
          ) : null}
        </button>

        <CardTitle className={cn(!full && "line-clamp-1")}>{post.title}</CardTitle>
        <CardDescription className={cn(!full && "line-clamp-2")}>
          {post.description}
        </CardDescription>
        {full && post.location ? (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPinIcon aria-hidden="true" className="size-3.5 shrink-0" />
            {post.location}
          </p>
        ) : null}
      </CardHeader>

      {full ? photo : null}

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
