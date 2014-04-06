(function(context) {
    var mapInfo;

    $(function() {
        mapInfo = initMap();
        _.each(mapInfo.layers, function(info, id) {
            toggleLayer(id);
        })
        initLayerSwitchers();
    });

    function initLayerSwitchers() {
        $('[data-map-layer-selector]').each(function() {
            var el = $(this);
            var id = el.data('map-layer-selector');
            if (!id)
                return;
            el.click(function(e) {
                toggleLayer(id);
                e.preventDefault();
                e.stopPropagation();
            })
        })
    }

    function toggleLayer(id) {
        var info = mapInfo.layers[id];
        if (!info)
            return;
        info.visible = !info.visible;
        _.each([ info.tiles, info.grid ], function(layer) {
            if (!layer)
                return;
            if (info.visible) {
                mapInfo.map.addLayer(layer);
            } else {
                mapInfo.map.removeLayer(layer);
            }
        })
    }

    var marker;
    var markerLatLng;
    function showMarker(data) {
        var coords = data.geometry.coordinates;
        markerLatLng = [ coords[1], coords[0] ];
        refreshMarker();
    }
    function hideMarker() {
        if (marker) {
            mapInfo.map.removeLayer(marker);
            marker = null;
        }
    }
    function refreshMarker() {
        hideMarker();
        if (!markerLatLng)
            return;
        var zoom = mapInfo.map.getZoom();
        var baseRadius = 10;
        var baseZoom = 16;
        var baseWidth = 1;
        var radius = Math.max(5, baseRadius * Math.pow(2, zoom - baseZoom));
        var width = Math.max(1, baseWidth * Math.pow(2, zoom - baseZoom));
        marker = L.circleMarker(markerLatLng, {
            color : 'red',
            opacity : 0.8,
            weight : width,
            radius : radius,
            fillColor : 'white',
            fillOpacity : 0.3
        });
        mapInfo.map.addLayer(marker);
    }
    function initMap() {
        function appendRandomParam(url) {
            var ch = (url.indexOf('?') < 0) ? '?' : '&';
            url += ch;
            url += 'x=' + Math.random() * 1000;
            url += '-' + new Date().getTime();
            return url;
        }
        var templates = {};
        function getTemplate(elm, type) {
            var template = templates[type];
            if (template)
                return template;
            var templateElm = elm.find('[data-template="' + type + '"]');
            if (!templateElm[0]) {
                templateElm = elm.find('[data-template="default"]');
            }
            var content;
            if (templateElm.prop('tagName') == 'SCRIPT') {
                var t = _.template(templateElm.text());
                template = function(data) {
                    var str = t({
                        data : data,
                        icon : function(key, css, text, title) {
                            console.log(key, data.properties)
                            if (!data.properties[key])
                                return '';
                            text = text || '';
                            if (title && title != '') {
                                title = ' title="' + title + '"'
                            }
                            var result = '<i class="' + css + '"' + title
                                    + '/>';
                            result += ' ' + text;
                            return '<div>' + result + '</div>';
                        }
                    });
                    return $('<div></div>').append(str);
                }
            } else {
                var text = templateElm.html();
                template = function(data) {
                    var content = $('<div></div>').append(text);
                    content.find('[data-property]').each(
                            function() {
                                var el = $(this);
                                var f = eval('(function(data){return '
                                        + el.data('property') + ';})');
                                var value = '';
                                if (_.isFunction(f)) {
                                    value = f.call(data, data);
                                }
                                el.text(value);
                            })
                    return content;
                }
            }
            templates[type] = template;
            return template;
        }
        function formatContent(elm, data) {
            var type = data.properties.type;
            var template = getTemplate(elm, type);
            return template ? template(data) : null;
        }
        var mapElement = $('#map');
        var center = mapElement.data('center') || [ 0, 0 ];
        center = [ center[1], center[0] ];
        var zoom = mapElement.data('zoom');
        var minZoom = mapElement.data('min-zoom') || 2;
        var maxZoom = mapElement.data('max-zoom') || 18;
        var forceReload = mapElement.data('force-reload') || false;

        var layers = {};
        var result = {
            layers : layers
        };
        var zIndex = 0;
        mapElement.find('[data-map-layer]').each(function() {
            var elm = $(this);
            var id = elm.data('map-layer');
            zIndex++;
            var layerInfo = layers[id] = {
                visible : false
            };
            var tilesUrl = elm.data('tiles-url');
            if (tilesUrl) {
                if (forceReload) {
                    tilesUrl = appendRandomParam(tilesUrl);
                }
                var attributionElm = elm.find('.attribution');
                var attribution = attributionElm.html();
                attributionElm.remove();
                var tilesLayer = L.tileLayer(tilesUrl, {
                    attribution : attribution,
                    minZoom : minZoom,
                    maxZoom : maxZoom,
                    zIndex : zIndex
                });
                layerInfo.tiles = tilesLayer;
            }
            var utfgridUrl = elm.data('utfgrid-url');
            if (utfgridUrl) {
                if (forceReload) {
                    utfgridUrl = appendRandomParam(utfgridUrl);
                }
                var gridLayer = new L.UtfGrid(utfgridUrl, {
                    zIndex : zIndex + 1000
                });
                var html = elm.html();
                var panelSelector = elm.data('panel') || '#info';
                var action = elm.data('action') || 'mouseover';
                gridLayer.on(action, function(ev) {
                    var panel = $(panelSelector);
                    var data = ev.data;
                    if (_.isString(data.properties)) {
                        data.properties = JSON.parse(data.properties);
                        if (!data.properties.type) {
                            data.properties.type = data.type;
                        }
                    }
                    if (_.isString(data.geometry)) {
                        data.geometry = JSON.parse(data.geometry);
                    }
                    console.log(JSON.stringify(data, null, 2));
                    var content = formatContent(elm, data);
                    panel.html(content);
                    panel.removeClass('hidden');
                    showMarker(data);
                });
                layerInfo.grid = gridLayer;
            }
        })
        mapElement.html('');

        var map = result.map = L.map(mapElement[0], {
            zoomControl : false
        });
        map.addControl(L.control.zoom({
            position : 'topright'
        }));
        map.setView(center, zoom);

        map.on('click', function(e) {
            console.log(map.getZoom() + ' [' + e.latlng.lng + ','
                    + e.latlng.lat + ']');
        })

        map.on('zoomend', function() {
            refreshMarker();
        });
        return result;
    }

})(this);