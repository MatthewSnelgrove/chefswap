import { React } from "react";
import { useUser } from "./useUser";
import global_vars from "../utils/config";

function OnlyLoggedIn(props) {
  const user = useUser();
  const globalVars = global_vars;

  if (user == globalVars.userStates.loading) {
    return <></>;
  }

  if (user == null) {
    window.location = global_vars.pages.login;
    return <></>;
  }

  return <>{props.children}</>;
}

export default OnlyLoggedIn;
