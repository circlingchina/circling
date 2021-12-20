# db setup

This is a step-by-step operation for initialize the pg database locally.

- to create db:

    ```
    ❯ pg_ctl initdb -D /usr/local/var/pg_circling_db
    The files belonging to this database system will be owned by user "yiliangt5".
    This user must also own the server process.

    The database cluster will be initialized with locales
    COLLATE:  en_US.UTF-8
    CTYPE:    UTF-8
    MESSAGES: en_US.UTF-8
    MONETARY: en_US.UTF-8
    NUMERIC:  en_US.UTF-8
    TIME:     en_US.UTF-8
    The default database encoding has accordingly been set to "UTF8".
    initdb: could not find suitable text search configuration for locale "UTF-8"
    The default text search configuration will be set to "simple".

    Data page checksums are disabled.

    creating directory /usr/local/var/pg_circling_db ... ok
    creating subdirectories ... ok
    selecting dynamic shared memory implementation ... posix
    selecting default max_connections ... 100
    selecting default shared_buffers ... 128MB
    selecting default time zone ... Europe/Amsterdam
    creating configuration files ... ok
    running bootstrap script ... ok
    performing post-bootstrap initialization ... ok
    syncing data to disk ... ok

    initdb: warning: enabling "trust" authentication for local connections
    You can change this by editing pg_hba.conf or using the option -A, or
    --auth-local and --auth-host, the next time you run initdb.

    Success. You can now start the database server using:

    /usr/local/Cellar/postgresql/14.1_1/bin/pg_ctl -D /usr/local/var/pg_circling_db -l logfile start
    ```

- to start server:
    ```
    /usr/local/Cellar/postgresql/14.1_1/bin/pg_ctl -D /usr/local/var/pg_circling_db -l /usr/local/var/pg_circling_db/logfile start
    waiting for server to start.... done
    server started
    ```



- to stop server:
    ```
    /usr/local/Cellar/postgresql/14.1_1/bin/pg_ctl -D /usr/local/var/pg_circling_db -l /usr/local/var/pg_circling_db/logfile stop
    waiting for server to shut down.... done
    server stopped
    ```



- create role:
    ```
    ❯ psql postgres
    psql (14.1)
    Type "help" for help.

    postgres=# create role circling with createdb login password 'circling'
    postgres-# ;
    CREATE ROLE
    postgres=# \q
    ```

- create circling_db database

    ```
    PGPASSWORD=circling dropdb -h localhost -U circling circling_db
    PGPASSWORD=circling createdb -h localhost -U circling -O circling circling_db
    ```

- init tables
    ```
    circling git/master*
    ❯ pwd
    /Users/yiliangt5/Developer/circling

    circling git/master*
    ❯ cd server

    circling/server git/master*
    ❯ ./db/create_db.sh
    Init tables - dev ...
    NOTICE:  extension "pgcrypto" already exists, skipping
    CREATE EXTENSION
    DROP TABLE
    DROP TABLE
    DROP TABLE
    DROP TYPE
    CREATE TYPE
    CREATE TABLE
    CREATE TABLE
    CREATE TABLE
    Init tables - dev finished
    Init tables - test ...
    CREATE EXTENSION
    NOTICE:  table "user_event" does not exist, skipping
    DROP TABLE
    NOTICE:  table "events" does not exist, skipping
    DROP TABLE
    NOTICE:  table "users" does not exist, skipping
    DROP TABLE
    NOTICE:  type "event_category" does not exist, skipping
    DROP TYPE
    CREATE TYPE
    CREATE TABLE
    CREATE TABLE
    CREATE TABLE
    Init tables - test finished

    circling/server git/master*
    ❯
    ```

- run db migrations per timestamps for both circling_db and circling_test_db

    ``` 
    # this is the example for running the *first script to circling_db only*
    psql -W circling -U circling -d circling_db -f ./db/migrations/20200625_add_end_time_to_events.sql
    psql: warning: extra command-line argument "circling" ignored
    Password:
    CREATE TABLE
    INSERT 0 1
    DO
    ALTER TABLE
    UPDATE 0
    ```

- Have fun!
