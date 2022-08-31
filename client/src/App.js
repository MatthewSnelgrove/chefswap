import React from "react";
// import ReactDOM from 'react-dom';
import "./App.css";
import AboutPage from "./components/AboutPage";
import AboutUsPage from "./components/AboutUsPage";
import Login from "./components/Login";
import Signup from "./components/Signup";

import MySwapsPage from "./components/MySwapsPage";
import MyMessagesPage from "./components/MyMessagesPage"
import FindSwapPage from "./components/FindSwapPage";
import UserInfoPage from "./components/UserInfoPage";

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AboutPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />

        {/* May not need */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/my-swaps" element={<MySwapsPage />} />
        <Route path="/my-messages" element={<MyMessagesPage />} />
        <Route path="/find-swap" element={<FindSwapPage />} />
        <Route path="/user/somekey" element={<UserInfoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;