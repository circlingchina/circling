
function attachIdentityListern() {
  console.log("attatch")
  netlifyIdentity.on('init', user => console.log('init', user));
  netlifyIdentity.on('login', user => {
    console.log('login', user)
    updateNav()
  });
  netlifyIdentity.on('logout', () => console.log('Logged out'));
  netlifyIdentity.on('error', err => console.error('Error', err));
  netlifyIdentity.on('open', () => console.log('Widget opened'));
  netlifyIdentity.on('close', () => console.log('Widget closed'));
  
}

attachIdentityListern()


function updateNav() {
  const user = netlifyIdentity.currentUser();
  if(user) {
    let user_link = document.getElementById('nav-user-name')
    if(user_link) {
      user_link.style.display = ''
      user_link.childNodes[1].innerText = user.user_metadata.full_name
    }

    let member_page_name = document.getElementById('user-name-label')
    if(member_page_name) {
      member_page_name.innerText = user.user_metadata.full_name + "你好"
    }
  }
}

updateNav()