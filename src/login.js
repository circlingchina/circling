import airtable from "./airtable/api";

/* eslint-disable no-undef */
function clearUserIdCache() {
  window.localStorage.removeItem('lastUserId');
}

function getAirbaseUid(user) {
  if (!user) {
    return;
  }
  base.Users.select({
    maxRecords: 1,
    filterByFormula: '{email} = \"' + user.email + '\"'
  }).eachPage((records) => {
    // This function (`page`) will get called for each page of records.
    records.forEach((record) => {
      window.airbaseUserId = record.id;
      window.airbaseUserRecord = record;
      window.localStorage.setItem('airbaseUserId', record.id);
      window.localStorage.setItem('airbaseUserRecord', record);
    });
  });
}

function attachIdentityListern() {
  let isSigningIn = false;
  
  netlifyIdentity.on('init', (user) => {
    updateNav(user);
  });

  netlifyIdentity.on('login', async (user) => {
    updateNav(user);

    //redirect if not already on memberpage
    const memberPagePath = "/pages/memberpage/";
    if (isSigningIn && !(window.location.pathname == memberPagePath)) {
      window.location.replace(memberPagePath);
    }
    const records = await airtable.getAirtableUser(user.email);
    if(records.length > 0) {
      window.localStorage.setItem('lastUserId', records[0].id);
    }

    netlifyIdentity.close();
  });

  netlifyIdentity.on('logout', () => {
    logoutHook();
    clearUserIdCache();
    window.location.replace("/");
  });


  netlifyIdentity.on('error', err => console.error('Error', err));
  netlifyIdentity.on('open', () => {
    isSigningIn = true;
  });
  netlifyIdentity.on('close', () => {
    isSigningIn = false;
  });
}

attachIdentityListern();


function logoutHook() {
  $("#nav-user-name").css({display: "none"});
}

function updateNav(user) {
  if (user) {
    let user_link = document.getElementById('nav-user-name');
    if (user_link) {
      user_link.style.display = '';
      user_link.childNodes[1].innerText = user.user_metadata.full_name + "的活动";
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