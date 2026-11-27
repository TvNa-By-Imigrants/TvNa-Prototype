import { ArrowLeftIcon, BadgeCheckIcon, PencilIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Profile } from "@/data/profiles"
import { useLanguage } from "@/i18n"
import { cn } from "@/lib/utils"

export type ProfileHeaderProps = {
  profile: Profile
  postCount: number
  isOwner: boolean
  following: boolean
  onEdit: () => void
  onFollow: () => void
  onBack: () => void
}

/**
 * Cardless Facebook-style header: the cover runs the full column and the
 * identity sits directly on the page background. Do not wrap this in a Card.
 * Cards resume below the header.
 */
export function ProfileHeader({
  profile,
  postCount,
  isOwner,
  following,
  onEdit,
  onFollow,
  onBack,
}: ProfileHeaderProps) {
  const { t } = useLanguage()

  const avatarClass =
    "-mt-10 size-20 shrink-0 rounded-full object-cover ring-4 ring-background sm:-mt-14 sm:size-28"

  return (
    <header className="relative">
      <div
        aria-hidden="true"
        className="h-32 w-full bg-linear-to-br from-secondary to-primary/25 sm:h-40 lg:h-48"
      />

      {isOwner ? null : (
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          onClick={onBack}
          aria-label={t("profile.back")}
          className="absolute left-2 top-2 rounded-full bg-background/90"
        >
          <ArrowLeftIcon />
        </Button>
      )}

      <div className="px-1 sm:px-2">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className={avatarClass}
            />
          ) : (
            <span
              aria-hidden="true"
              className={cn(
                avatarClass,
                "flex items-center justify-center bg-secondary text-xl font-semibold text-secondary-foreground",
              )}
            >
              {profile.name.charAt(0)}
            </span>
          )}

          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-center gap-1.5">
              <h1 className="truncate text-xl font-semibold text-foreground sm:text-2xl">
                {profile.name}
              </h1>
              {profile.verified ? (
                <BadgeCheckIcon
                  aria-label={t("card.verified")}
                  className="size-4 shrink-0 text-primary"
                />
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">@{profile.handle}</p>
          </div>

          <div className="w-full sm:w-auto sm:pb-1">
            {isOwner ? (
              <Button type="button" onClick={onEdit} className="w-full gap-2 sm:w-auto">
                <PencilIcon aria-hidden="true" className="size-4" />
                {t("profile.editProfile")}
              </Button>
            ) : (
              <Button
                type="button"
                variant={following ? "outline" : "default"}
                onClick={onFollow}
                className="w-full sm:w-auto"
              >
                {following ? t("profile.following") : t("profile.follow")}
              </Button>
            )}
          </div>
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span>
            <span className="font-semibold text-foreground">{postCount}</span>{" "}
            <span className="text-muted-foreground">{t("profile.posts")}</span>
          </span>
          <span aria-hidden="true" className="text-border">·</span>
          <span>
            <span className="font-semibold text-foreground">{profile.followers}</span>{" "}
            <span className="text-muted-foreground">{t("profile.followers")}</span>
          </span>
          <span aria-hidden="true" className="text-border">·</span>
          <span>
            <span className="font-semibold text-foreground">{profile.following}</span>{" "}
            <span className="text-muted-foreground">{t("profile.followingCount")}</span>
          </span>
        </p>
      </div>
    </header>
  )
}
