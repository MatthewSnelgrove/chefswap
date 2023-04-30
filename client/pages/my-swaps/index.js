import React from "react";
// import styles from "../../styles/MySwapsPage.module.css";
import OnlyLoggedIn from "../../components/OnlyLoggedIn";
import SwapSwitch from "../../components/SwapSwitch";
import { useUser } from "../../components/useUser";
import { useSwapType } from "../../components/useSwapType";
import SwapListPending from "../../components/SwapListPending";
import SwapListOngoing from "../../components/SwapListOngoing";
import SwapListPast from "../../components/SwapListPast";
import global_vars from "../../utils/config";
import Head from "next/head";

function MySwapsPage() {
  const user = useUser();
  const loading = global_vars.userStates.loading;
  const [swapListPending, setSwapListPending] = useSwapType({
    status: "pending",
  });
  const [swapListPast, setSwapListPast] = useSwapType({ status: "ended" });
  const [swapListOngoing, setSwapListOngoing] = useSwapType({
    status: "ongoing",
  });

  if (
    user == loading ||
    swapListPending == loading ||
    swapListPast == loading ||
    swapListOngoing == loading
  ) {
    return (
      <>
        <Head>
          <title>Chefswap | My Swaps</title>
        </Head>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Chefswap | My Swaps</title>
      </Head>

      <OnlyLoggedIn>
        <div className="navbar-margin" style={{ paddingTop: "20px" }}>
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
              <SwapListPending
                swapListPending={swapListPending}
                setSwapListPending={setSwapListPending}
                setSwapListOngoing={setSwapListOngoing}
                user={user}
              />
            </div>
            <div>
              <SwapListOngoing
                swapListOngoing={swapListOngoing}
                setSwapListPast={setSwapListPast}
                setSwapListOngoing={setSwapListOngoing}
                user={user}
              />
            </div>
            <div>
              <SwapListPast swapListPast={swapListPast} user={user} />
            </div>
          </div>
        </div>
      </OnlyLoggedIn>
    </>
  );
}

export default MySwapsPage;
