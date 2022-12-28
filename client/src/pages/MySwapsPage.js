import React, { useEffect, useState } from "react";
import "./styles/MySwapsPage.css";
import OnlyLoggedIn from "../components/OnlyLoggedIn";
import SwapSwitch from "../components/SwapSwitch";
import { useUser } from "../components/useUser";
import { useSwapType } from "../components/useSwapType";
import SwapListPending from "../components/SwapListPending";
import SwapListOngoing from "../components/SwapListOngoing";
import SwapListPast from "../components/SwapListPast";


function MySwapsPage() {
  const user = useUser()
  const loading = global.config.userStates.loading
  const [swapListPending, setSwapListPending] = useSwapType({ status: "pending" })
  const [swapListPast, setSwapListPast] = useSwapType({ status: "ended" })
  const [swapListOngoing, setSwapListOngoing] = useSwapType({ status: "ongoing" })

  useEffect(() => {
    document.title = "Chefswap | My swaps";
  }, []);

  if (user == loading || swapListPending == loading || swapListPast == loading || swapListOngoing == loading) {return (<></>)}

  const people = [];

  people[0] = {
    img: "corn.jpg",
    username: "XD Man",
    cuisinePrefrences: ["Indian", "Italian"],
    cuisineSpecialities: ["Indian", "Italian"],
    bio: "Hey guys XDDDas;d;oasndlasnaskldkasnldkansdlkasnkldnaslkdn askldnkasndklasndlkdm;awkdmaslkdmalksmdlkasmdlkasmdkladlksndlasndlasnldnasljdnalsjdnlajsndlaslndn",
    distance: "4",
    rating: "4.1",
    id: 1,
  };

  people[1] = {
    img: "corn.jpg",
    username: "XD Man312389012390120983812903019283812890319038109823",
    cuisinePrefrences: ["Indian", "Italian"],
    cuisineSpecialities: ["Indian", "Italian"],
    bio: "Hey guys XDDDas;d;oasndlasnaskldkasnldkansdlkasnkldnaslkdn askldnkasndklasndlkdm;awkdmaslkdmalksmdlkasmdlkasmdkladlksndlasndlasnldnasljdnalsjdnlajsndlaslndn",
    distance: "4",
    rating: "4.1",
    id: 2,
  };

  

  return (
    <OnlyLoggedIn >
      <div className="navbar-margin">
        <div className="swap-container">
          <h1 className="px-5 swap-text">Swaps</h1>
          {/* <div >
            <MySwapSwitch hl={"swaps"} />
          </div> */}
        </div>
        <SwapSwitch current={0} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            justifyContent: "center",
            marginTop: "23px",
          }}
        >
          <div>
            <SwapListPending swapListPending={swapListPending} setSwapListPending={setSwapListPending} setSwapListOngoing={setSwapListOngoing} user={user} />
          </div>
          <div>
            <SwapListOngoing swapListOngoing={swapListOngoing} setSwapListPast={setSwapListPast} setSwapListOngoing={setSwapListOngoing} user={user}  />
          </div>
          <div>
            <SwapListPast swapListPast={swapListPast} user={user} />
          </div>
        </div>
      </div>
    </OnlyLoggedIn>
  );
}

export default MySwapsPage;
