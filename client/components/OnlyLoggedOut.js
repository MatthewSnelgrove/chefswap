import { React } from "react";
import { useUser } from "./useUser";
import global_vars from "../utils/config";

function OnlyLoggedOut(props) {
  const user = useUser();
  const globalVars = global_vars;

  if (user == globalVars.userStates.loading) {
    return <></>;
  }

  if (user != globalVars.userStates.loading && user != null) {
    window.location = globalVars.pages.homepage;
    return <></>;
  }

  return <>{props.children}</>;
}

export default OnlyLoggedOut;
