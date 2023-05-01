import { React, useRef } from "react";
import styles from "./styles/SearchBy.module.css";
import findUserStyles from "../styles/FindUserPage.module.css";
import global_vars from "../utils/config";

function SearchBy(props) {
  const searchRef = useRef();

  return (
    <div style={props.containerStyle ? props.containerStyle : {}}>
      <span style={props.textStyle ? props.textStyle : {}}>Search User:</span>
      <div className={styles.input_container}>
        <input
          ref={searchRef}
          style={props.inputStyle ? props.inputStyle : {}}
          pattern="[^!*'();:@&=+$,/?%#\\]"
          className={styles.username_search}
          onKeyUp={(e) => {
            if (e.key != "Enter") {
              return;
            }
            goToPage(searchRef);
          }}
        ></input>
        <button
          className={styles.search_button}
          onClick={(e) => goToPage(searchRef)}
        >
          <span
            class={`material-symbols-outlined ${findUserStyles.search_tag}`}
          >
            search
          </span>
        </button>
      </div>
    </div>
  );
}

function goToPage(searchRef) {
  window.location = `${global_vars.pages.searchSwaps}?query=${searchRef.current.value}`;
}

export default SearchBy;
