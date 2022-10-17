import React from "react";
// import ReactDOM from 'react-dom';
import "./App.css";
import AboutPage from "./pages/AboutPage";
import AboutUsPage from "./pages/AboutUsPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import MySwapsPage from "./pages/MySwapsPage";
import MyMessagesPage from "./pages/MyMessagesPage"
import FindSwapPage from "./pages/FindSwapPage";
import UserInfoPage from "./pages/UserInfoPage";
import Navbar from "./components/Navbar";
import UserEditPage from "./pages/UserEditPage";

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from "./UserLogin"

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<AboutPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />

        {/* May not need */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/my-swaps" element={<MySwapsPage />} />
        <Route path="/my-messages" element={<MyMessagesPage />} />
        <Route path="/find-swap" element={<FindSwapPage />} />
        <Route path="/:id" element={<UserInfoPage />} />
        <Route path="/accounts/edit" element={<UserEditPage type={"edit_profile"} />} />
        <Route path="/accounts/password/change" element={<UserEditPage type={"change_password"} />} />
        <Route path="/accounts/gallery" element={<UserEditPage type={"edit_gallery"} />} />
        <Route path="/accounts/personal" element={<UserEditPage type={"edit_personal"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;