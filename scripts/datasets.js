var _ = require('underscore');
var Utils = require('./transform-utils');

var exported = module.exports = [];
//
// // 01 - Musee
// exported.push(D01_MuseumConfig());
//
// // 02 - Hopitaux
// exported.push(D02_HospitalsConfig());
//
// // 03 - Poste (points de contact)
// exported.push(D03_LaPosteConfig());
//
// // 04 - Pharmacie
// exported.push(D04_PharmaciesConfig());
//
// // 05 - Arrets de bus RATP
// // !!! Not accessible
// // exported.push(D05_BusArretsConfig());
//
// // 05 - Autolib
// exported.push(D06_AutoLibConfig());
//
// // 07 - Positions géographiques des stations du réseau RATP
// exported.push(D07_StationRATP());
//
// // 08 - Commissariat de Police
// exported.push(D08_Police());
//
// // 09 - Velib
// exported.push(D09_Velib());
//
// // 10 - Monuments
// exported.push(D10_Monuments());
//
// // 11 - Gare SNCF transilien
// exported.push(D11_GaresSNCF());
//
// // 12 - Sanisettes
// exported.push(D12_Sanisettes());
//
// // 13 - Kiosques à journaux
// exported.push(D13_Kiosques());
//
// // // 15 - Marchés de quartier
// // // !!! No coordinates
// // //exported.push(D15_Marches());
//
// // 16 - Espaces verts, crèches, piscines, équipements sportifs
// exported.push(D16_EspacesVerts());
//
// // 17 - Liste des sites des hotspots Paris WiFi
// exported.push(D17_SiteWifi());
//
// // // 24 - Mobiliers urbains de propreté - Emplacements des colonnes à verre
// // exported.push(D24_MobilierParisConfig());

// 25 - La carte des hôtels classés en Île-de-France
exported.push(D25_Hotels());

// Common properties:
// - type
// - label
// - url
// - tel
// - fax

/* ------------------------------------------------------------ */

function D01_MuseumConfig() {
    return Utils
            .newDataSet({
                "path" : "liste_des_musees_franciliens.csv",
                "url" : "http://data.iledefrance.fr/explore/dataset/liste_des_musees_franciliens/download?format=csv",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'Museum'
                        }, this._toProperties(obj, {
                            exclude : [ 'wgs84' ],
                            convert : {
                                'nom_du_musee' : 'label',
                                'sitweb' : 'url'
                            },
                            dataTypes : {
                                'ferme' : 'boolean',
                                'sitweb' : 'url'
                            }
                        })),
                        geometry : this._toGeometryPoint(obj.wgs84)
                    }
                }
            });
}
/* ------------------------------------------------------------ */

function D02_HospitalsConfig() {
    return Utils
            .newDataSet({
                "path" : "les_etablissements_hospitaliers_franciliens.csv",
                "url" : "http://data.iledefrance.fr/explore/dataset/les_etablissements_hospitaliers_franciliens/download?format=csv",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'EtablissementHospitalier'
                        }, this._toProperties(obj, {
                            exclude : [ 'wgs84', 'lat', 'lng' ],
                            convert : {
                                'raison_sociale' : 'label',
                                'num_tel' : 'tel',
                                'num_fax' : 'fax'
                            },
                            dataTypes : {
                                'num_tel' : 'telephone',
                                'num_fax' : 'telephone'
                            }
                        })),
                        geometry : this._toGeometryPoint(obj.wgs84)
                    }
                }
            });
}

/* ------------------------------------------------------------ */

function D03_LaPosteConfig() {
    var LaPosteTypes = {
        exclude : [ 'wgs84', 'lat', 'lng' ],
        convert : {
            'libelle_du_site' : 'label',
            'numero_de_telephone' : 'tel'
        },
        dataTypes : {
            'numero_de_telephone' : 'telephone',
            'changeur_de_monnaie' : 'boolean',
            'distributeur_de_billets' : 'boolean',
            'distributeur_de_timbres' : 'boolean',
            'photocopie' : 'boolean',
            'bornes_de_rechargement_moneo' : 'boolean',
            'affranchissement_libre_service' : 'boolean',
            'distributeur_pret_a_poster' : 'boolean',
            'accessibilite_absence_de_ressaut_de_plus_de_2_cm_de_haut' : 'boolean',
            'accessibilite_automate_d_affranchissement_avec_prise_audio' : 'boolean',
            'accessibilite_borne_sonore_en_etat_de_fonctionnement' : 'boolean',
            'accessibilite_boucle_magnetique_en_etat_de_fonctionnement' : 'boolean',
            'accessibilite_distributeur_de_billets_avec_prise_audio' : 'boolean',
            'accessibilite_entree_autonome_en_fauteuil_roulant_possible' : 'boolean',
            'accessibilite_espace_de_circulation_interieur_suffisant_pour_pmr' : 'boolean',
            'accessibilite_pas_d_escalier_ou_bandes_de_vigilance_presentes' : 'boolean',
            'accessibilite_presence_d_un_espace_confidentiel_accessible_pmr' : 'boolean',
            'accessibilite_presence_d_un_gab_externe_accessible_pmr' : 'boolean',
            'accessibilite_presence_d_un_guichet_surbaisse_ou_d_un_ecritoire' : 'boolean',
            'accessibilite_presence_d_un_panneau_prioritaire' : 'boolean',
            'accessibilite_presence_d_une_bande_de_guidage_au_sol' : 'boolean',
        },
    };
    return Utils
            .newDataSet({
                "path" : "liste-des-points-de-contact-du-reseau-postal-dile-de-france.csv",
                "url" : "http://data.iledefrance.fr/explore/dataset/liste-des-points-de-contact-du-reseau-postal-dile-de-france/download?format=csv",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'LaPoste'
                        }, this._toProperties(obj, LaPosteTypes)),
                        geometry : this._toGeometryPoint(obj.wgs84)
                    }
                }
            });
}

/* ------------------------------------------------------------ */

function D04_PharmaciesConfig() {
    return Utils
            .newDataSet({
                "path" : "carte-des-pharmacies-dile-de-france.csv",
                "url" : "http://data.iledefrance.fr/explore/dataset/carte-des-pharmacies-dile-de-france/download?format=csv",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'Pharmacy'
                        }, this._toProperties(obj, {
                            exclude : [ 'wgs84', 'lat', 'lng' ],
                            convert : {
                                'rs' : 'label',
                                'telephone' : 'tel',
                                'telecopie' : 'fax'
                            },
                            dataTypes : {
                                'telephone' : 'telephone',
                                'telecopie' : 'telephone'
                            }
                        })),
                        geometry : this._toGeometryPoint(obj.wgs84)
                    }
                }
            });
}

/* ------------------------------------------------------------ */

function D05_BusArretsConfig() {
    var PropertiesConfig = {
        exclude : [ 'wgs84', 'x', 'y' ],
        convert : {
            'nom_arret' : 'label'
        },
        dataTypes : {
            'accessibilite_ufr' : 'boolean',
            'annonce_sonore_prochain_passage' : 'boolean',
            'annonce_visuelle_prochain_passage' : 'boolean',
            'annonce_sonore_situations_perturbees' : 'boolean',
            'annonce_visuelle_situations_perturbees' : 'boolean'
        }
    };
    return Utils
            .newDataSet({
                "path" : "busaccessibilitearrets.csv",
                "url" : "http://data.iledefrance.fr/explore/dataset/busaccessibilitearrets/download?format=csv",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'BusStop'
                        }, this._toProperties(obj, PropertiesConfig)),
                        geometry : this._toGeometryPoint(obj.wgs84)
                    }
                }
            });
}

/* ------------------------------------------------------------ */

function D06_AutoLibConfig() {
    var PropertiesConfig = {
        exclude : [ 'field13', 'x', 'y' ],
        convert : {
            'nom_de_la_station' : 'label'
        },
        dataTypes : {
            'nom_de_la_station' : 'autolibLabel',
            'places_autolib' : 'integer',
            'places_recharge_tiers' : 'integer',
            'nombre_total_de_places' : 'integer'
        }
    };
    return Utils
            .newDataSet({
                "path" : "stations_et_espaces_autolib.csv",
                "url" : "http://data.iledefrance.fr/explore/dataset/stations_et_espaces_autolib/download?format=csv",
                _toAutolibLabel : function(val) {
                    if (!val)
                        return undefined;
                    val = val.replace(/\//gim, ' ');
                    return val;
                },
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'AutoLib'
                        }, this._toProperties(obj, PropertiesConfig)),
                        geometry : this._toGeometryPoint(obj.field13)
                    }
                }
            });
}

/* ------------------------------------------------------------ */
// 07 - Positions géographiques des stations du réseau RATP
function D07_StationRATP() {
    var PropertiesConfig = {
        exclude : [ 'longitude', 'latitude' ],
        convert : {},
        dataTypes : {},
    };
    return Utils.newDataSet({
        "path" : "stations_ratp.csv",
        "url" : "http://data.ratp.fr/?eID=ics_od_datastoredownload&file=64",
        csvOptions : {
            delim : '#',
            headers : [ 'identifier', 'longitude', 'latitude', 'label',
                    'place', 'station_type' ]
        },
        transform : function(obj) {
            return {
                type : 'Feature',
                properties : _.extend({
                    type : 'RatpStation'
                }, this._toProperties(obj, PropertiesConfig)),
                geometry : this._toGeometryPointFromCoords(obj, 'latitude',
                        'longitude')
            }
        }
    });
}

/* ------------------------------------------------------------ */

// 08 - Commissariat de Police
function D08_Police() {
    return Utils
            .newDataSet({
                "path" : "cartographie-des-emplacements-des-commissariats-a-paris-et-petite-couronne.csv",
                "url" : "http://data.iledefrance.fr/explore/dataset/cartographie-des-emplacements-des-commissariats-a-paris-et-petite-couronne/download?format=csv",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'Police'
                        }, this._toProperties(obj, {
                            exclude : [ 'coordinates' ],
                            convert : {
                                'name' : 'label'
                            }
                        })),
                        geometry : this._toGeometryPoint(obj.coordinates)
                    }
                }
            });
}

/* ------------------------------------------------------------ */

// 09 - Velib
function D09_Velib() {
    return Utils
            .newDataSet({
                "path" : "velib_a_paris_et_communes_limitrophes.csv",
                "url" : "http://data.iledefrance.fr/explore/dataset/velib_a_paris_et_communes_limitrophes/download?format=csv",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'Velib'
                        }, this._toProperties(obj, {
                            exclude : [ 'latitude', 'longitude', 'wgs84' ],
                            convert : {
                                'name' : 'label'
                            }
                        })),
                        geometry : this._toGeometryPoint(obj.wgs84)
                    }
                }
            });
}

/* ------------------------------------------------------------ */

// 10 - Monuments
function D10_Monuments() {
    return Utils
            .newDataSet({
                "path" : "monuments-inscrits-ou-classes-dile-de-france.csv",
                "url" : "http://data.iledefrance.fr/explore/dataset/monuments-inscrits-ou-classes-dile-de-france/download?format=csv",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'Monument'
                        }, this._toProperties(obj, {
                            exclude : [ 'geo_shape', 'geo_point_2d', 'dat' ],
                            convert : {
                                'intitule' : 'label',
                                'type' : '_type'
                            },
                            dataTypes : {
                                'date' : 'dateDDMMYYYY',
                                'dat' : 'date'
                            }
                        })),
                        geometry : this._toGeometry(obj.geo_shape)
                    }
                }
            });
}

/* ------------------------------------------------------------ */

// // 11 - Gare SNCF transilien
function D11_GaresSNCF() {
    return Utils
            .newDataSet({
                "path" : "sncf-gares-et-arrets-transilien-ile-de-france.csv",
                "url" : "http://ressources.data.sncf.com/explore/dataset/sncf-gares-et-arrets-transilien-ile-de-france/download?format=csv",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'GaresSNCF'
                        }, this._toProperties(obj, {
                            exclude : [ 'coord_gps_wgs84',
                                    'y_lambert_ii_etendu',
                                    'x_lambert_ii_etendu' ],
                            convert : {
                                'libelle_point_d_arret' : 'label',
                                'type' : '_type'
                            },
                            dataTypes : {
                                'zone_navigo' : 'integer',
                                'gare_non_sncf' : 'boolean'
                            }
                        })),
                        geometry : this._toGeometryPoint(obj.coord_gps_wgs84)
                    }
                }
            });
}

/* ------------------------------------------------------------ */

// 12 - Sanisettes
function D12_Sanisettes() {
    return Utils
            .newDataSet({
                "path" : "sanisettesparis2011.csv",
                "url" : "http://parisdata.opendatasoft.com/explore/dataset/sanisettesparis2011/download?format=csv",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'Sanisette'
                        }, this._toProperties(obj, {
                            exclude : [ 'geom', 'geom_x_y' ],
                            convert : {
                                'libelle' : 'label'
                            },
                            dataTypes : {}
                        })),
                        geometry : this._toGeometry(obj.geom)
                    }
                }
            });
}

/* ------------------------------------------------------------ */

// 13 - Kiosques à journaux
function D13_Kiosques() {
    return Utils
            .newDataSet({
                "path" : "carte-des-kiosques-presse-a-paris.csv",
                "url" : "http://data.iledefrance.fr/explore/dataset/carte-des-kiosques-presse-a-paris/download?format=csv",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'Kiosque'
                        }, this._toProperties(obj, {
                            exclude : [ 'lat', 'lng' ],
                            convert : {
                                'libelle' : 'label'
                            },
                            dataTypes : {}
                        })),
                        geometry : this._toGeometryPointFromCoords(obj, 'lat',
                                'lng')
                    }
                }
            });
}

/* ------------------------------------------------------------ */

//
// 15 - Marchés de quartier
// !!! No geographic coordinates
function D15_Marches() {
    return Utils
            .newDataSet({
                "path" : "marches-a-paris.csv",
                "url" : "http://opendata.paris.fr/opendata/document?id=134&id_attribute=64",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'Marche'
                        }, this._toProperties(obj, {
                            convert : {},
                            dataTypes : {}
                        })),
                        geometry : this._toGeometryPointFromCoords(obj, 'lat',
                                'lng')
                    }
                }
            });
}
/* ------------------------------------------------------------ */

//
// 16 - Espaces verts, crèches, piscines, équipements sportifs
function D16_EspacesVerts() {
    return Utils
            .newDataSet({
                "path" : "paris_-_liste_des_equipements_de_proximite_ecoles_piscines_jardins.csv",
                "url" : "http://data.iledefrance.fr/explore/dataset/paris_-_liste_des_equipements_de_proximite_ecoles_piscines_jardins/download?format=csv",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'EspacePublique'
                        }, this._toProperties(obj, {
                            exclude : [ 'wgs84' ],
                            convert : {
                                'designation_longue' : 'label'
                            },
                            dataTypes : {}
                        })),
                        geometry : this._toGeometryPoint(obj.wgs84)
                    }
                }
            });
}
/* ------------------------------------------------------------ */

// 17 - Liste des sites des hotspots Paris WiFi
function D17_SiteWifi() {
    return Utils
            .newDataSet({
                "path" : "liste_des_sites_des_hotspots_paris_wifi.csv",
                "url" : "http://public.opendatasoft.com/explore/dataset/liste_des_sites_des_hotspots_paris_wifi/download?format=csv",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'SpotWifi'
                        }, this._toProperties(obj, {
                            exclude : [ 'geo_coordinates' ],
                            convert : {
                                'nom_site' : 'label'
                            },
                            dataTypes : {}
                        })),
                        geometry : this._toGeometryPoint(obj.geo_coordinates)
                    }
                }
            });
}
/* ------------------------------------------------------------ */

function D24_MobilierParisConfig() {
    return Utils
            .newDataSet({
                "path" : "mobilierenvironnementparis2011.csv",
                "url" : "http://parisdata.opendatasoft.com/explore/dataset/mobilierenvironnementparis2011/download?format=csv",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'Mobilier'
                        }, this._toProperties(obj, {
                            exclude : [ 'geom', 'geom_x_y' ],
                            convert : {
                                'libelle' : 'label'
                            }
                        })),
                        geometry : this._toGeometry(obj.geom)
                    }
                }
            });
}

/* ------------------------------------------------------------ */

// 25 - La carte des hôtels classés en Île-de-France
function D25_Hotels() {
    var DataTypes = {
        exclude : [ 'lat', 'lng', 'wgs84' ],
        convert : {
            'nom_commercial' : 'label',
            'courriel' : 'email'
        },
        dataTypes : {
            'nombre_de_chambres' : 'integer',
            'capacite_d_accueil_personnes' : 'integer',
            'site_internet' : 'url',
            'telephone' : 'telephone',
            'date_de_classement' : 'date',
            'date_de_publication_de_l_etablissement' : 'date',
            'courriel' : 'email'
        }
    };
    return Utils
            .newDataSet({
                "path" : "les_hotels_classes_en_ile-de-france.csv",
                "url" : "http://data.iledefrance.fr/explore/dataset/les_hotels_classes_en_ile-de-france/download?format=csv",
                transform : function(obj) {
                    return {
                        type : 'Feature',
                        properties : _.extend({
                            type : 'Hotels'
                        }, this._toProperties(obj, DataTypes)),
                        geometry : this._toGeometryPoint(obj.wgs84)
                    }
                }
            });
}

/* ------------------------------------------------------------ */

