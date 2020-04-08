
//TODO Delete Your web app's Firebase configuration 1 2 3

const firebaseConfig = {
  apiKey: "AIzaSyAceEs3c7xMnYAMixeQObVahvyH3SzVenI",
  authDomain: "circling-e3e41.firebaseapp.com",
  databaseURL: "https://circling-e3e41.firebaseio.com",
  projectId: "circling-e3e41",
  storageBucket: "circling-e3e41.appspot.com",
  messagingSenderId: "805716700872",
  appId: "1:805716700872:web:11b10137cab5aa2a63bffd",
  measurementId: "G-C9VGY24SYC"
};

var uiConfig = {
  signInSuccessUrl: 'nonmemberuser.html',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
  ],
  // tosUrl and privacyPolicyUrl accept either url string or a callback
  // function.
  // Terms of service url/callback.
  tosUrl: '<your-tos-url>',
  // Privacy policy url/callback.
  privacyPolicyUrl: function() {
    window.location.assign('<your-privacy-policy-url>');
  }
};

function init() {
  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
}
// firebase.analytics();

export function insertLoginForm() {
  init()
  // Initialize the FirebaseUI Widget using Firebase.
  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  // The start method will wait until the DOM is loaded.
  ui.start('#firebaseui-auth-container', uiConfig);
}

export function loadUser() {
  
  init()

  firebase.auth().onAuthStateChanged(function(user) {
    console.log("On Auth Changed")
    if (user) {
      grabUserInfo(user)
    } else {
      // No user is signed in.
    }
  });


}

function grabUserInfo(user) {
  var name, email, photoUrl, uid, emailVerified;

  if (user != null) {
    name = user.displayName;
    email = user.email;
    photoUrl = user.photoURL;
    emailVerified = user.emailVerified;
    uid = user.uid;  // The user's ID, unique to the Firebase project. Do NOT use
                    // this value to authenticate with your backend server, if
                    // you have one. Use User.getToken() instead.
  }
  document.getElementById("user-name-label").innerHTML = name + " 你好"
  console.log(user)
}

