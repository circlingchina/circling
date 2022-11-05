module.exports = {

  local: {
    client: 'pg',
    connection: {
      host : 'localhost',
      user : 'circling',
      password : 'circling',
      database : 'circling_db_prod'
    }
  },

  development: {
    client: 'pg',
    connection: {
      host: 'pgm-2ze3z8jo4e863al4129190.pg.rds.aliyuncs.com',
      // host : '10.0.96.3',
      port: '1921',
      user : 'circling',
      password : 'circling',
      database : 'circling_db_test',
      ssl: false,
      // ssl: {
      //   rejectUnauthorized: false
      // }
    }
  },

  // note: host is a private IP on a VPC, which confines access to compute engine servers
  //       Therefore the password does not have to be regarded as a secret
  production: {
    client: 'pg',
    connection: {
      host: 'pgm-2ze3z8jo4e863al4129190.pg.rds.aliyuncs.com',
      // host : '10.0.96.3',
      port: '1921',
      user : 'circling',
      password : 'circling',
      database : 'circling_db',
      ssl: false,
      // ssl: {
      //   rejectUnauthorized: false
      // }
    }
  },
};

