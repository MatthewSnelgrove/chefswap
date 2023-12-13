export function setUsersForSwapList(users) {

    return users.map((user) => {
      const profile = user.profileData.profile
      return {
        img: profile.pfpLink,
        username: profile.username,
        cuisinePrefrences: profile.cuisinePrefrences,
        cuisineSpecialities: profile.cuisineSpecialities,
        bio: profile.bio,
        distance: (profile.distance / 1000),
        rating: profile.avgRating,
        accountUid: profile.accountUid,
        numRatings: profile.numRatings,
        pfpLink: profile.pfpLink,
        requestTimestamp: user.requestTimestamp,
        requesterUid: user.requesterUid
      }
    })
}