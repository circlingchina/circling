var Airtable = require("airtable");
var base = new Airtable({ apiKey: "keyN6C9ddDWd2YTGi" }).base(
  "app53ecZ2UL9M6JOw"
);

function getAirbaseUid(user) {

  base('Users').select({
    // Selecting the first 3 records in Grid view:
    maxRecords: 1,
    filterByFormula: '{email} = \"'+user.email+'\"'
  }).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.
    console.log("got back records", records.length)
    records.forEach(function(record) {
        console.log('Retrieved', record.id);
        window.airbaseUserId = record.id
    });
  });
}

function attachIdentityListern() {
  console.log("attatch")
  netlifyIdentity.on('init', user => {
    getAirbaseUid(user);
    updateNav(user)
  });
  netlifyIdentity.on('login', user => {
    console.log('login', user)
    updateNav(user)
  });
  netlifyIdentity.on('logout', () => console.log('Logged out'));
  netlifyIdentity.on('error', err => console.error('Error', err));
  netlifyIdentity.on('open', () => console.log('Widget opened'));
  netlifyIdentity.on('close', () => console.log('Widget closed'));
  
}

attachIdentityListern()


function updateNav(user) {
  if(user) {
    let user_link = document.getElementById('nav-user-name')
    if(user_link) {
      user_link.style.display = ''
      user_link.childNodes[1].innerText = user.user_metadata.full_name
    }

    let user_page_name = document.getElementById('user-name-label')
    if(user_page_name) {
      user_page_name.innerText = user.user_metadata.full_name + "你好"
    }

    let member_page_name = document.getElementById('member-name-label')
    if(member_page_name) {
      member_page_name.innerText = user.user_metadata.full_name + "的圈圈"
    }
  }
}