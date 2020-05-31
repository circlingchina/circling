module.exports = {

  development: {
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port: '5555',
      user : 'circling',
      password : 'circling',
      database : 'circling_db'
    }
  },

  test: {
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port: '5555',
      user : 'circling',
      password : 'circling',
      database : 'circling_test_db'
    }
  },

  production: {
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port: '5555',
      user : 'circling',
      password : 'circling',
      database : 'circling_test_db'
    }
  }

};
