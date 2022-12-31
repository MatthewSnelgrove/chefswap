export function setUsersForSwapList(users) {

    return users.map((user) => {
      const profile = user.profileData.profile
      console.log(profile)
      return {
        img: profile.pfpLink,
        username: profile.username,
        cuisinePrefrences: profile.cuisinePrefrences,
        cuisineSpecialities: profile.cuisineSpecialities,
        bio: profile.bio,
        distance: (profile.distance / 1000).toFixed(1),
        rating: profile.avgRating,
        accountUid: profile.accountUid,
        requestTimestamp: user.requestTimestamp,
        requesterUid: user.requesterUid
      }
    })
}