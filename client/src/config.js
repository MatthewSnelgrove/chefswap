module.exports = global.config = {
    pages: {
        homepage: "http://localhost:3000/",
        editProfile: "http://localhost:3000/accounts/edit",
        editGallery: "http://localhost:3000/accounts/gallery",
        editPassword: "http://localhost:3000/accounts/password/change",
        editPersonal: "http://localhost:3000/accounts/personal",
        myMessages: "http://localhost:3000/my-messages",
        login: "http://localhost:3000/login",
        mySwaps: "http://localhost:3000/my-swaps",
        searchSwaps: "http://localhost:3000/find-swap/search"
    },
    userStates: {
        loading: "loading"
    },
    maxLengths: {
        maxQueryLength: 6
    },
    cuisineItems : [
        "Indian",
        "Italian",
        "Greek",
        "Pizza",
        "Thai"
    ]
};