import React from "react";
import SwapList from "../components/SwapList";
import "./styles/MySwapsPage.css";
import MessageSwapSwitch from "../components/MessageSwapSwitch";
import OnlyLoggedIn from "../components/OnlyLoggedIn";

function MySwapsPage() {
  const people = [];

  people[0] = {
    img: "corn.jpg",
    username: "XD Man",
    cuisinePrefrences: ["Indian", "Italian"],
    cuisineSpecialities: ["Indian", "Italian"],
    bio: "Hey guys XDDDas;d;oasndlasnaskldkasnldkansdlkasnkldnaslkdn askldnkasndklasndlkdm;awkdmaslkdmalksmdlkasmdlkasmdkladlksndlasndlasnldnasljdnalsjdnlajsndlaslndn",
    distance: "4km",
    rating: "4.1",
    date: "10/20/2003",
    id: 1,
  };

  people[1] = {
    img: "corn.jpg",
    username: "XD Man312389012390120983812903019283812890319038109823",
    cuisinePrefrences: ["Indian", "Italian"],
    cuisineSpecialities: ["Indian", "Italian"],
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
            <SwapList data={people} type={"Pending"} finalColJsx={<PendingButtons />} />
          </div>
          <div>
            <SwapList data={people} type={"Ongoing"} finalColJsx={<></>} />
          </div>
          <div>
            <SwapList data={people} type={"Past"} finalColJsx={<></>} />
          </div>
        </div>
      </div>
    </OnlyLoggedIn>
  );
}

function PendingButtons(props) {
  return (
    <>
      <div className="pending-button-wrapper">
        <button className="accept-button">
          <span class="material-icons-round accept-image">done</span>
        </button>
        <button className="decline-button">
          <span class="material-icons-round decline-image">close</span>
        </button>
        <button className="message-button">
          <span class="material-icons-round message-image">chat</span>
        </button>
      </div>
    </>
  )
}



export default MySwapsPage;
