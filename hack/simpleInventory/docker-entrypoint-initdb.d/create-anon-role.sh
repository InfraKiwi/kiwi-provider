#!/bin/bash

#
# (c) 2024 Alberto Marchetti (info@cmaster11.me)
# GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
#

psql -U "$POSTGRES_USER" -d inventory <<-END
DROP ROLE IF EXISTS ${DB_ANON_ROLE};
CREATE ROLE ${DB_ANON_ROLE} NOLOGIN;

GRANT ${DB_ANON_ROLE} TO ${POSTGRES_USER};
GRANT USAGE ON SCHEMA public TO ${DB_ANON_ROLE};

GRANT pg_read_all_data TO ${DB_ANON_ROLE};
GRANT pg_write_all_data TO ${DB_ANON_ROLE};
END