dbname="je_suis_ici"
dbuser="postgres"
dbencode="UTF8" 
# dbencode="LATIN1"
 
# See http://prj2epsg.org/search
epsgcode=3857 # WGS 84 / Pseudo-Mercator


shapefiles=("ne_110m_admin_0_countries")

cd $(dirname $0);
basedir=`pwd`
dataDir="$basedir/../data"
sqlDir="$basedir/sql"

cd "$dataDir"
mkdir "$sqlDir"
for shapefile in "${shapefiles[@]}"
do
    tablename=${shapefile//[\\\/-]/_}
    
    echo "-----------------------------------"
    echo "Importing '$shapefile' in '$tablename'."

    # Generate SQL file from a shape file(s)
    shp2pgsql -W "$dbencode" -s "$epsgcode" "$shapefile" "$tablename" > "$sqlDir/$tablename.sql"

    # Import the generated SQL file in the DB
    psql -U "$dbuser" -d "$dbname" -f "$sqlDir/$tablename.sql"

    # Configuring imported table for windshaft use
    psql -U "$dbuser" -d "$dbname" -c "alter table $tablename add the_geom_webmercator geometry"
    psql -U "$dbuser" -d "$dbname" -c "update $tablename set the_geom_webmercator = ST_Transform(geom, 3857)"
done

echo "-----------------------------------"
echo "Imported tables: "

for shapefile in "${shapefiles[@]}"
do
    tablename=${shapefile//[\\\/-]/_}
    echo "$tablename"
done