export default global.config = {
  pages: {
    homepage: "http://localhost:3000/",
    editProfile: "http://localhost:3000/me",
    editGallery: "http://localhost:3000/me",
    editPassword: "http://localhost:3000/me",
    editPersonal: "http://localhost:3000/me",
    myMessages: "http://localhost:3000/my-messages",
    login: "http://localhost:3000/login",
    mySwaps: "http://localhost:3000/my-swaps",
    searchSwaps: "http://localhost:3000/find-swap/search",
  },
  userStates: {
    loading: "loading",
  },
  maxLengths: {
    maxQueryLength: 6,
  },
  cuisineItems: ["Indian", "Italian", "Greek", "Pizza", "Thai"],
  serverUrl: "http://localhost:3001",
};
