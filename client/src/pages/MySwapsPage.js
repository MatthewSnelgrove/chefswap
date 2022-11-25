import React from "react";
import SwapList from "../components/SwapList";
import MySwapSwitch from "../components/MySwapSwitch";
import "./styles/MySwapsPage.css";
import MessageSwapSwitch from "../components/MessageSwapSwitch";
import OnlyLoggedIn from "../components/OnlyLoggedIn";

function MySwapsPage() {
  const people = [];

  people[0] = {
    img: "corn.jpg",
    username: "XD Man",
    cuisinePrefrences: {
      indian: true,
      italian: true,
    },
    cuisineSpecialties: {
      indian: true,
      italian: true,
      a: true,
      itd: true,
      idian: true,
      idn: true,
    },
    bio: "Hey guys XDDDas;d;oasndlasnaskldkasnldkansdlkasnkldnaslkdn askldnkasndklasndlkdm;awkdmaslkdmalksmdlkasmdlkasmdkladlksndlasndlasnldnasljdnalsjdnlajsndlaslndn",
    distance: "4km",
    rating: "4.1",
    date: "10/20/2003",
    id: 1,
  };

  people[1] = {
    img: "corn.jpg",
    username: "XD Man312389012390120983812903019283812890319038109823",
    cuisinePrefrences: {
      indian: true,
      italian: true,
    },
    cuisineSpecialties: {
      indian: true,
      italian: true,
      a: true,
      itd: true,
      idian: true,
      idn: true,
    },
    bio: "Hey guys XDDDas;d;oasndlasnaskldkasnldkansdlkasnkldnaslkdn askldnkasndklasndlkdm;awkdmaslkdmalksmdlkasmdlkasmdkladlksndlasndlasnldnasljdnalsjdnlajsndlaslndn",
    distance: "4km",
    rating: "4.1",
    date: "10/20/2003",
    id: 2,
  };

  return (
    <OnlyLoggedIn >
      <div style={{ paddingTop: "90px" }}>
        <div className="swap-container">
          <h1 className="px-5 swap-text">Swaps</h1>
          {/* <div >
            <MySwapSwitch hl={"swaps"} />
          </div> */}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            justifyContent: "center",
            marginTop: "33px",
          }}
        >
          <MessageSwapSwitch current={0} />
          <div>
            <SwapList data={people} type={"Pending"} />
          </div>
          <div>
            <SwapList data={people} type={"Ongoing"} />
          </div>
          <div>
            <SwapList data={people} type={"Past"} />
          </div>
        </div>
      </div>
    </OnlyLoggedIn>
  );
}

export default MySwapsPage;
