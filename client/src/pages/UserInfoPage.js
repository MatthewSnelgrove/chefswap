import React from 'react'
import UserProfileContainer from '../components/UserProfileContainer'
import Navbar from '../components/Navbar'

function UserInfoPage() {
  const user = {
    img: "../covid-victor.jpg",
    name: "XD Man"
  }
  
  return (
    <div>
      <Navbar />
      <UserProfileContainer user={user} />
    </div>
    
  )
}

export default UserInfoPage