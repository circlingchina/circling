/* eslint-disable no-undef */
let base = require("./airtable/base");

function getAirbaseUid(user) {
  if (!user) {
    return;
  }
  base.Users.select({
    // Selecting the first 3 records in Grid view:
    maxRecords: 1,
    filterByFormula: '{email} = \"' + user.email + '\"'
  }).eachPage((records) => {
    // This function (`page`) will get called for each page of records.
    records.forEach((record) => {
      window.airbaseUserId = record.id;
      window.localStorage.setItem('airbaseUserId', record.id);
    });
  });
}

function attachIdentityListern() {
  let isSigningIn = false;
  netlifyIdentity.on('init', user => {
    getAirbaseUid(user);
    updateNav(user);
  });
  netlifyIdentity.on('login', user => {
    updateNav(user);
    if (isSigningIn) {
      window.location.replace("/pages/memberpage");
    }
    netlifyIdentity.close();
  });
  // netlifyIdentity.on('logout', () => console.log('Logged out'));
  netlifyIdentity.on('error', err => console.error('Error', err));
  netlifyIdentity.on('open', () => {
    isSigningIn = true;
  });
  netlifyIdentity.on('close', () => {
    isSigningIn = false;
  });

}

attachIdentityListern();


function updateNav(user) {
  if (user) {
    let user_link = document.getElementById('nav-user-name');
    if (user_link) {
      user_link.style.display = '';
      user_link.childNodes[1].innerText = user.user_metadata.full_name;
    }

    let user_page_name = document.getElementById('user-name-label');
    if (user_page_name) {
      user_page_name.innerText = user.user_metadata.full_name + "你好";
    }

    let member_page_name = document.getElementById('member-name-label');
    if (member_page_name) {
      member_page_name.innerText = user.user_metadata.full_name + "的圈圈";
    }
  }
}