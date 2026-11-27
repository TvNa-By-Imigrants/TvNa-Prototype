import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import {
  CalendarDaysIcon,
  CompassIcon,
  FileQuestionIcon,
  LockKeyholeIcon,
  MapPinIcon,
} from "lucide-react"

import { FeedCard, PlanCard } from "@/components/cards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { postsByHandle, savedPlans } from "@/data/profiles"
import type { Profile } from "@/data/profiles"
import { useLanguage } from "@/i18n"
import { usePermissions } from "@/lib/permissions"
import { useProfileContext } from "@/lib/profile-context"
import { cn } from "@/lib/utils"

import { EditProfileDialog } from "./edit-profile-dialog"
import { ProfileHeader } from "./profile-header"

// GitHub's line treatment: the underline belongs to the label, not the row.
const tabTriggerClass =
  "h-auto flex-none rounded-none border-0 pr-3 pl-0 pb-2.5 text-sm font-medium text-muted-foreground after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 hover:text-foreground data-active:border-0 data-active:bg-transparent data-active:text-foreground data-active:after:opacity-100"

type Tab = "posts" | "saved"

function IntroCard({ profile }: { profile: Profile }) {
  const { language, t } = useLanguage()
  const bio = language === "km" ? profile.bioKm : profile.bio
  const location = language === "km" ? profile.locationKm : profile.location

  return (
    <Card className="gap-3 rounded-xl p-4">
      <h2 className="font-semibold text-foreground">{t("profile.intro")}</h2>
      {bio ? (
        <p className={cn("text-sm text-muted-foreground", language === "km" && "leading-relaxed")}>
          {bio}
        </p>
      ) : null}
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        {location ? (
          <p className="flex items-center gap-2">
            <MapPinIcon aria-hidden="true" className="size-4 shrink-0" />
            {location}
          </p>
        ) : null}
        <p className="flex items-center gap-2">
          <CalendarDaysIcon aria-hidden="true" className="size-4 shrink-0" />
          {t("profile.joined")} {profile.joined}
        </p>
      </div>
    </Card>
  )
}

function EmptyState({
  title,
  body,
}: {
  title: string
  body: string
}) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileQuestionIcon aria-hidden="true" className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
      <Link to="/place">
        <Button variant="outline" className="gap-2">
          <CompassIcon aria-hidden="true" className="size-4" />
          {t("profile.explorePlaces")}
        </Button>
      </Link>
    </div>
  )
}

export type ProfilePageProps = {
  handle: string
}

export function ProfilePage({ handle }: ProfilePageProps) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user } = usePermissions()
  const { getProfile } = useProfileContext()
  const [tab, setTab] = useState<Tab>("posts")
  const [following, setFollowing] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const profile = getProfile(handle)
  if (!profile) return null

  // The signed-in prototype account is the owner; every other handle is public.
  const isOwner = !!user && profile.owner === true
  const posts = postsByHandle(profile.sourceHandle)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col">
      <ProfileHeader
        profile={profile}
        postCount={posts.length}
        isOwner={isOwner}
        following={following}
        onEdit={() => setEditOpen(true)}
        onFollow={() => setFollowing((prev) => !prev)}
        onBack={() => navigate({ to: "/" })}
      />

      <div className="sticky top-[var(--header-h,4rem)] z-30 mt-4 border-b border-border bg-background/95 backdrop-blur">
        <div role="tablist" aria-label={t("profile.tabPosts")} className="flex gap-1">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "posts"}
            data-active={tab === "posts" ? "" : undefined}
            onClick={() => setTab("posts")}
            className={cn(tabTriggerClass, tab === "posts" && "text-foreground")}
          >
            {t("profile.tabPosts")}
          </button>
          {isOwner ? (
            <button
              type="button"
              role="tab"
              aria-selected={tab === "saved"}
              data-active={tab === "saved" ? "" : undefined}
              onClick={() => setTab("saved")}
              className={cn(tabTriggerClass, tab === "saved" && "text-foreground")}
            >
              {t("profile.tabSaved")}{" "}
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] max-sm:hidden">
                {t("profile.onlyYou")}
              </Badge>
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 py-5 lg:grid-cols-[280px_1fr] lg:gap-6">
        <aside className="lg:sticky lg:top-[calc(var(--header-h,4rem)+2.75rem)] lg:self-start">
          <IntroCard profile={profile} />
        </aside>

        <div role="tabpanel" className="min-w-0">
          {tab === "posts" ? (
            posts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {posts.map((post) => (
                  <FeedCard key={post.id} post={post} variant="full" />
                ))}
              </div>
            ) : (
              <EmptyState
                title={t("profile.emptyPostsTitle")}
                body={t("profile.emptyPostsBody")}
              />
            )
          ) : (
            <div className="flex flex-col gap-3">
              <Card className="flex items-center gap-2 rounded-xl border-border/70 bg-muted/40 p-3 text-sm text-muted-foreground">
                <LockKeyholeIcon aria-hidden="true" className="size-4 shrink-0" />
                {t("profile.privateNote")}
              </Card>
              {savedPlans.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {savedPlans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={t("profile.emptyPlansTitle")}
                  body={t("profile.emptyPlansBody")}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {isOwner ? (
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          profile={profile}
        />
      ) : null}
    </div>
  )
}
