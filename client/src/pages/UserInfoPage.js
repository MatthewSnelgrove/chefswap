import React from 'react'
import UserProfileContainer from '../components/UserProfileContainer'
import Navbar from '../components/Navbar'

function UserInfoPage() {
  const user = {
    img: "../covid-victor.jpg",
    name: "XD Man",
    cuisinePrefrences: {
      "indian": true,
      "italian": true
    },
    cuisineSpecialties: {
      "indian": true,
      "italian": true,
      "a": true,
      "itd": true,
      "idian": true,
      "idn": true,
      "italai7an": true,
      "italia4dn": true,
      "itdi1an": true,
      "ital2ian": true,
      "italdi5an": true,
      "ita4lian": true,
      "it4ali2dan": true,
      "it555alian": true,
      "ita55323lian": true,
    },
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