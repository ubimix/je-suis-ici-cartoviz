select
    id, type,  (properties->>'label') as label, 
    properties::text as properties, 
    ST_AsGeoJson(ST_Centroid(geometry)) as geometry,
    the_geom_webmercator from objects_webmercator
where /* Hello, there */
    type in (
        'Sanisette', 
        'Police', 
        'Pharmacy',
        'SpotWifi',
        'EtablissementHospitalier',
        'Kiosque',
        'LaPoste',
        'EspacePublique'
     )
    
