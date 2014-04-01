var _ = require('underscore');
var Utils = require('./transform-utils');

var exported = module.exports = [];

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
// exported.push(D05_BusArretsConfig());
//
// // 05 - Autolib
// exported.push(D06_AutoLibConfig());
//
// // 07 - Positions géographiques des stations du réseau RATP
exported.push(D07_StationRATP());
//
// // 08 - Commissariat de Police
// exported.push(D08_Police());
//

// // 24 - Mobiliers urbains de propreté - Emplacements des colonnes à verre
// exported.push(D24_MobilierParisConfig());

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
            try {
                return {
                    type : 'Feature',
                    properties : _.extend({
                        type : 'RatpStation'
                    }, this._toProperties(obj, PropertiesConfig)),
                    geometry : {
                        type : 'Point',
                        coordinates : [ parseFloat(obj.longitude),
                                parseFloat(obj.latitude) ]
                    }
                }
            } catch (e) {
                return undefined;
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

