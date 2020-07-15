/* eslint-disable no-undef */

function attachIdentityListern() {
  let isSigningIn = false;
  
  netlifyIdentity.on('init', (user) => {
    updateNav(user);
    // getAirbaseUid(user);
  });

  netlifyIdentity.on('login', async (user) => {
    updateNav(user);

    //redirect if not already on memberpage
    const memberPagePath = "/pages/memberpage/";
    if (isSigningIn && !(window.location.pathname == memberPagePath)) {
      window.location.replace(memberPagePath);
    }

    netlifyIdentity.close();
  });

  netlifyIdentity.on('logout', () => {
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

function updateNav(user) {
  if (user) {
    let user_link = document.getElementById('nav-user-name');
    if (user_link) {
      user_link.style.display = '';
      user_link.childNodes[1].innerText = "我的活动";
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
