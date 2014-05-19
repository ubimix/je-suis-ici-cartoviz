select
    id,
    type,
    (properties->>'title') as label, 
    properties::text as properties, 
    ST_AsGeoJson(ST_Centroid(geometry)) as geometry, 
    the_geom_webmercator
from objects_webmercator
