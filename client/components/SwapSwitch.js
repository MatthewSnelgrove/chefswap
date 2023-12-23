import styles from "./styles/SwapSwitch.module.css";
import global_vars from "../utils/config";

function linkToPage(link) {
  window.location = link;
}

function SwapSwitch(props) {
  const pages = global_vars.pages;

  return (
    <div className={`${styles.switch_container} container`}>
      <button
        onClick={(e) => {
          linkToPage(pages.mySwaps);
        }}
        className={`${styles.swap_click_button} ${
          props.current == 0
            ? styles.highlight_container
            : styles.non_highlight_container
        }

        `}
      >
        <span className={`material-icons-round ${styles.swap_click_image}`}>
          multiple_stop
        </span>
      </button>
      <button
        onClick={(e) => {
          linkToPage(pages.myMessages);
        }}
        className={`${styles.message_button} ${
          props.current == 1
            ? styles.highlight_container
            : styles.non_highlight_container
        }`}
      >
        <span className="material-icons-round message-image">chat</span>
      </button>
    </div>
  );
}

export default SwapSwitch;
