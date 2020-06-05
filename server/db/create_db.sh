#!/bin/bash

# create dev and test db
PGPASSWORD=circling dropdb -h localhost -U circling circling_test_db
PGPASSWORD=circling createdb -h localhost -U circling -O circling circling_test_db

#add required extension
PGPASSWORD=circling psql -h localhost -U circling circling_test_db << EOF
CREATE EXTENSION pgcrypto;
EOF

#add required extension
PGPASSWORD=circling psql -h localhost -U circling circling_db << EOF
CREATE EXTENSION pgcrypto;
EOF

PGPASSWORD=circling psql -h localhost -U circling circling_db < db/init_tables.sql
PGPASSWORD=circling psql -h localhost -U circling circling_test_db < db/init_tables.sql