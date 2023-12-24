import { useEffect, useState } from "react";
import EditListLink from "../../components/EditListLink";
import OnlyLoggedIn from "../../components/OnlyLoggedIn";
import styles from "../../styles/UserEditPage.module.css";
import EditProfile from "../../components/EditProfile";
import EditGallery from "../../components/EditGallery";
import EditPersonal from "../../components/EditPersonal";
import Head from "next/head";
import { useRouter } from "next/router";

function UserEditPage() {
  const [tabSelected, setTabSelected] = useState("profile");
  const router = useRouter();

  useEffect(() => {
    const { tab } = router.query;

    if (!!tab) {
      setTabSelected(tab);
    }
  }, [router]);

  const editComponentMap = {
    profile: <EditProfile />,
    gallery: <EditGallery />,
    personal: <EditPersonal />,
  };

  return (
    <>
      <Head>
        <title>Chefswap | Edit my profile</title>
      </Head>

      <OnlyLoggedIn>
        <div className={`${styles.form_container} full-contain`}>
          <ul className={styles.list_links}>
            <EditListLink
              // curSelected={props.name}
              // link={pages.editProfile}
              // listType="EditProfile"
              selected={tabSelected === "profile"}
              onClick={() => setTabSelected("profile")}
              display="Edit Profile"
              smallImg="/person.svg"
            />
            <EditListLink
              // curSelected={props.name}
              // link={pages.editGallery}
              // listType="EditGallery"
              selected={tabSelected === "gallery"}
              onClick={() => setTabSelected("gallery")}
              display="Gallery"
              smallImg="/photo.svg"
            />
            <EditListLink
              // curSelected={props.name}
              // link={pages.editPersonal}
              // listType="EditPersonal"
              selected={tabSelected === "personal"}
              onClick={() => setTabSelected("personal")}
              display="Personal Info"
              smallImg="/key.svg"
            />
          </ul>
          {editComponentMap[tabSelected]}
        </div>
      </OnlyLoggedIn>
    </>
  );
}

export default UserEditPage;
