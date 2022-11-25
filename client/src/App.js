import React from "react";
// import ReactDOM from 'react-dom';
import "./App.css";
import AboutPage from "./pages/AboutPage";
import AboutMorePage from "./pages/AboutMorePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MySwapsPage from "./pages/MySwapsPage";
import MyMessagesPage from "./pages/MyMessagesPage";
import FindSwapPage from "./pages/FindSwapPage";
import UserInfoPage from "./pages/UserInfoPage";
import Navbar from "./components/Navbar";
import UserEditPage from "./pages/UserEditPage";
import EditProfile from "./components/EditProfile"
import EditPassword from './components/EditPassword'
import EditGallery from './components/EditGallery'
import EditPersonal from './components/EditPersonal'
import { QueryClientProvider, QueryClient } from "react-query";


import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify"
import OnlyLoggedOut from "./components/OnlyLoggedOut";

const queryClient = new QueryClient();



function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <ToastContainer autoClose={2000} />
        <Routes>
          <Route path="/" element={<AboutPage />} />
          <Route path="/about" element={<AboutMorePage />} />

          {/* May not need */}
                
          <Route path="/my-swaps" element={<MySwapsPage />} />
          <Route path="/my-messages" element={<MyMessagesPage />} />
          <Route path="/find-swap" element={<FindSwapPage />} />
          <Route path="/:id" element={<UserInfoPage />} />
          <Route path="/accounts/edit" element={<UserEditPage renderType={<EditProfile />} name="EditProfile" />} />
          <Route path="/accounts/password/change" element={<UserEditPage renderType={<EditPassword />} name="EditPassword" />} />
          <Route path="/accounts/gallery" element={<UserEditPage renderType={<EditGallery />} name="EditGallery" />} />
          <Route path="/accounts/personal" element={<UserEditPage renderType={<EditPersonal />} name="EditPersonal" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />    
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
