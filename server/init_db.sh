#!/bin/bash
PGPASSWORD=circling psql -h localhost -p 5555 -U circling circling_db < db/init_tables.sql
node db/migrate_airtable.js