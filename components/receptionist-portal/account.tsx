"use client"

import { UserButton, useUser } from "@clerk/nextjs"

/** Who's signed in, top right: first name and profile photo (the photo opens Clerk's account menu). */
export function Account() {
  const { isLoaded, user } = useUser()
  const name = user?.firstName || user?.fullName || user?.primaryEmailAddress?.emailAddress || ""
  return (
    <div className="pt-account">
      {isLoaded ? <span className="pt-account-name">{name}</span> : <span className="pt-account-name pt-account-wait" aria-hidden="true" />}
      <UserButton appearance={{ elements: { avatarBox: { width: 30, height: 30 } } }} />
    </div>
  )
}
