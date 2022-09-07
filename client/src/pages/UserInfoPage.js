import React from 'react'
import UserProfileContainer from '../components/UserProfileContainer'
import Navbar from '../components/Navbar'

function UserInfoPage() {
  const user = {
    img: "../covid-victor.jpg",
    name: "XD Man",
    prefrences: "Indian, Thai",
    specialties: "Thai, Mongolian",
    bio: "Hey guys XDDDas;d;oasndlasnaskldkasnldkansdlkasnkldnaslkdn askldnkasndklasndlkdm;awkdmaslkdmalksmdlkasmdlkasmdkladlksndlasndlasnldnasljdnalsjdnlajsndlaslndn"
  }
  
  return (
    <div>
      <Navbar />
      <div style = {{marginTop: 100}}>
        <UserProfileContainer user={user} type={"non-user"} />
      </div>
      
    </div>
    
  )
}

export default UserInfoPage