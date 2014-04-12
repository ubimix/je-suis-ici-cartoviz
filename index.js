(function(context) {
    var mapInfo;

    $(function() {
        mapInfo = initMap();
        _.each(mapInfo.layers, function(info, id) {
            setLayerVisibility(info, info.visible);
        })
        initLayerSwitchers();
        initPrinting();
    });

    function getUrlVars(str) {
        str = str || window.location.href;
        var vars = [], hash;
        var hashes = str.slice(str.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }

    var exportMask = '<%=protocol%>//<%=hostname%><%=port%>'
            + '/export/layers/background/'
            + '<%=zoom%>/<%=west%>,<%=south%>,<%=east%>,<%=north%>/map.<%=format%>';

    function initPrinting1() {
        var exportBtn = $('[data-map-export-btn]');
        var startExport = $('[data-map-export-start]');
        if (!exportBtn[0] || !startExport[0])
            return;

        var A4 = {
            width : 210,
            height : 297
        };
        var areaSelect;
        var areaBounds;
        function hideSelector() {
            if (areaSelect) {
                // mapInfo.map.removeLayer(areaSelect);
                // areaSelect = undefined;
            }
        }
        function showSelector() {
            hideSelector();
            areaSelect = L.areaSelect({
                width : A4.height,
                height : A4.width,
            // keepAspectRatio : true
            });
            areaSelect.addTo(mapInfo.map);
            function updateBounds() {
                var bounds = areaSelect.getBounds();
                areaBounds = {
                    east : bounds._northEast.lng,
                    north : bounds._northEast.lat,
                    west : bounds._southWest.lng,
                    south : bounds._southWest.lat
                }
            }
            areaSelect.on("change", function() {
                updateBounds();
            });
            updateBounds();
        }

        var exportFormat = 'pdf';
        function setExportMode(exp) {
            if (exp) {
                exportBtn.parent().show();
                startExport.hide();
            } else {
                exportBtn.parent().hide();
                startExport.show();
            }
        }
        $('[data-map-export]').each(function() {
            var elm = $(this);
            elm.click(function(ev) {
                exportFormat = elm.data('map-export');
                showSelector();
                setExportMode(true);
            })
        });
        exportBtn.click(function(ev) {
            hideSelector();
            setExportMode(false);
            var currentLocation = window.location;
            var port = currentLocation.port;
            if (port && port != 80 && port != '80') {
                port = ':' + port;
            } else {
                port = '';
            }
            var options = _.extend({}, areaBounds, {
                zoom : mapInfo.map.getZoom(),
                format : exportFormat,
                protocol : currentLocation.protocol,
                hostname : currentLocation.hostname,
                port : port
            });
            var url = _.template(exportMask, options);
            window.location = url;
        });
        setExportMode(false);
    }

    function initPrinting() {
        var A4 = {
            width : 210,
            height : 297
        };
        function setExportMode(exp) {
            $('[data-visible-in-export-mode]').each(function() {
                var el = $(this);
                if (exp == el.data('visible-in-export-mode')) {
                    el.show();
                } else {
                    el.hide();
                }
            })
        }
        var exporting;
        mapInfo.map.on('export:start', function(ev) {
            setExportMode(true);
            showSelector();
        })

        mapInfo.map.on('export:stop', function(ev) {
            setExportMode(false);
            hideSelector();
            if (ev.cancel)
                return;
        })

        mapInfo.map.on('export:generate', function(ev) {
            var format = ev.format;
            var bounds = ev.bbox;
            var areaBounds = {
                east : bounds._northEast.lng,
                north : bounds._northEast.lat,
                west : bounds._southWest.lng,
                south : bounds._southWest.lat
            }
            var zoom = ev.zoom;
            var currentLocation = window.location;
            var port = currentLocation.port;
            if (port && port != 80 && port != '80') {
                port = ':' + port;
            } else {
                port = '';
            }
            var options = _.extend({}, areaBounds, {
                zoom : mapInfo.map.getZoom(),
                format : format,
                protocol : currentLocation.protocol,
                hostname : currentLocation.hostname,
                port : port
            });
            var url = _.template(exportMask, options);
            var win = window.open(url, '_blank');
            win.focus();
        })

        var areaSelect;
        function hideSelector() {
            if (areaSelect) {
                mapInfo.map.removeLayer(areaSelect);
                delete areaSelect;
            }
        }
        function showSelector() {
            hideSelector();
            var map = mapInfo.map;

            var viewBounds = map.getPixelBounds();
            var center = viewBounds.getCenter();
            var delta = viewBounds.getSize().multiplyBy(3 / 8);
            var sw = map.unproject(center.subtract(delta));
            var ne = map.unproject(center.add(delta));
            var bounds = new L.LatLngBounds(sw, ne);
            areaSelect = new L.LocationFilter({
                bounds : bounds,
                enable : true,
                enableButton : false,
                adjustButton : false
            });
            areaSelect.addTo(map);
            areaSelect.on("change", function() {
                var bounds = areaSelect.getBounds();
                console.log("Bounds:", this.getBounds());
            });
        }

        $('[data-map-export-btn]').each(function() {
            var elm = $(this);
            elm.click(function() {
                var ok = !!elm.data('map-export-btn');
                if (!ok) {
                    mapInfo.map.fire('export:stop');
                } else {
                    var bbox = areaSelect.getBounds();
                    var format = $('[data-map-export-format]').val();
                    mapInfo.map.fire('export:generate', {
                        zoom : mapInfo.map.getZoom(),
                        bbox : bbox,
                        format : format
                    });
                }
            })
        })

        $('[data-map-export]').each(function() {
            var elm = $(this);
            elm.click(function() {
                mapInfo.map.fire('export:start', {});
            })
        })

        setExportMode(false);

    }

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

    function setLayerVisibility(info, visible) {
        if (!info)
            return;
        info.visible = !!visible;
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

    function toggleLayer(id) {
        var info = mapInfo.layers[id];
        if (!info)
            return;
        setLayerVisibility(info, !info.visible);
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
            var visible = elm.data('visible');
            visible = !!visible;
            zIndex++;
            var layerInfo = layers[id] = {
                visible : visible
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

                function handler(ev) {
                    var panel = $(panelSelector);
                    var data = ev.data;
                    if (!data)
                        return;
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
                }
                var panelSelector = elm.data('panel') || '#info';
                var actions = elm.data('action') || 'mouseover';
                _.each(actions.split(/[,;]/gim), function(action) {
                    gridLayer.on(action, handler);
                })
                layerInfo.grid = gridLayer;
            }
        })
        mapElement.html('');

        var params = getUrlVars();
        var scroll = params['wheel-scroll'];
        scroll = !(scroll == 'no' || scroll == 'false' || scroll == '0');
        var map = result.map = L.map(mapElement[0], {
            zoomControl : false,
            scrollWheelZoom : scroll
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