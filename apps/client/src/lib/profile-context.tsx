import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { normalizeHandle, profiles as initialProfiles, type Profile } from "@/data/profiles"

type ProfileContextValue = {
  profiles: Profile[]
  getProfile: (handle: string) => Profile | undefined
  getOwnerProfile: () => Profile | undefined
  updateProfile: (handle: string, patch: Partial<Profile>) => void
  handleTaken: (handle: string, exceptHandle: string) => boolean
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

/** Prototype profile state: edits live here until a profile API exists. */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState(initialProfiles)

  const getProfile = useCallback(
    (handle: string) => {
      const normalized = normalizeHandle(handle)
      return profiles.find((profile) => profile.handle === normalized)
    },
    [profiles],
  )

  const getOwnerProfile = useCallback(
    () => profiles.find((profile) => profile.owner),
    [profiles],
  )

  const updateProfile = useCallback((handle: string, patch: Partial<Profile>) => {
    const normalized = normalizeHandle(handle)
    setProfiles((prev) =>
      prev.map((profile) =>
        profile.handle === normalized ? { ...profile, ...patch } : profile,
      ),
    )
  }, [])

  const handleTaken = useCallback(
    (handle: string, exceptHandle: string) =>
      profiles.some(
        (profile) =>
          profile.handle === normalizeHandle(handle) &&
          profile.handle !== normalizeHandle(exceptHandle),
      ),
    [profiles],
  )

  const value = useMemo(
    () => ({ profiles, getProfile, getOwnerProfile, updateProfile, handleTaken }),
    [profiles, getProfile, getOwnerProfile, updateProfile, handleTaken],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfileContext(): ProfileContextValue {
  const value = useContext(ProfileContext)
  if (!value) {
    throw new Error("useProfileContext must be used within a ProfileProvider")
  }
  return value
}
