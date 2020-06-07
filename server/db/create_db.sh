#!/bin/bash

# cleanup test db
PGPASSWORD=circling dropdb -h localhost -U circling circling_test_db
PGPASSWORD=circling createdb -h localhost -U circling -O circling circling_test_db

echo "Init tables - dev ..."
PGPASSWORD=circling psql -h localhost -U circling circling_db << EOF
CREATE EXTENSION IF NOT EXISTS pgcrypto;
EOF
PGPASSWORD=circling psql -h localhost -U circling circling_db < db/init_tables.sql
echo "Init tables - dev finished"

echo "Init tables - test ..."
PGPASSWORD=circling psql -h localhost -U circling circling_test_db << EOF
CREATE EXTENSION IF NOT EXISTS pgcrypto;
EOF
PGPASSWORD=circling psql -h localhost -U circling circling_test_db < db/init_tables.sql
echo "Init tables - test finished"
