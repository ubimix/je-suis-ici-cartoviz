dbname="je_suis_ici"
dbuser="postgres"
dbencode="UTF8" 

dropdb -U "$dbuser" "$dbname"
createdb -U "$dbuser" "$dbname" -E "$dbencode" 
createlang -U "$dbuser" plpgsql "$dbname"
psql -U "$dbuser" -d "$dbname" -c 'create extension postgis'