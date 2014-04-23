-- planet_osm_line
-- DROP INDEX IF EXISTS idx_planet_osm_line_way;
DROP INDEX IF EXISTS idx_planet_osm_line_highway;
DROP INDEX IF EXISTS idx_planet_osm_line_tunnel;
DROP INDEX IF EXISTS idx_planet_osm_line_bridge;
DROP INDEX IF EXISTS idx_planet_osm_line_railway;
DROP INDEX IF EXISTS idx_planet_osm_line_waterway;
DROP INDEX IF EXISTS idx_planet_osm_line_landuse;

DROP INDEX IF EXISTS idx_planet_osm_polygon_natural;
DROP INDEX IF EXISTS idx_planet_osm_polygon_waterway;
DROP INDEX IF EXISTS idx_planet_osm_polygon_landuse;
DROP INDEX IF EXISTS idx_planet_osm_polygon_building;

-- CREATE INDEX idx_planet_osm_line_way ON planet_osm_line USING GIST(way);  
CREATE INDEX idx_planet_osm_line_highway ON planet_osm_line USING BTREE(highway); 
CREATE INDEX idx_planet_osm_line_tunnel ON planet_osm_line USING BTREE(tunnel); 
CREATE INDEX idx_planet_osm_line_bridge ON planet_osm_line USING BTREE(bridge); 
CREATE INDEX idx_planet_osm_line_railway ON planet_osm_line USING BTREE(railway); 
CREATE INDEX idx_planet_osm_line_waterway ON planet_osm_line USING BTREE(waterway);
CREATE INDEX idx_planet_osm_line_landuse ON planet_osm_line USING BTREE(landuse);
 
CREATE INDEX idx_planet_osm_polygon_natural ON planet_osm_polygon USING BTREE("natural");
CREATE INDEX idx_planet_osm_polygon_waterway ON planet_osm_polygon USING BTREE(waterway);
CREATE INDEX idx_planet_osm_polygon_landuse ON planet_osm_polygon USING BTREE(landuse);
CREATE INDEX idx_planet_osm_polygon_building ON planet_osm_polygon USING BTREE(building);


 