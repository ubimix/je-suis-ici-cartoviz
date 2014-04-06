(function(context) {
    $(function() {
        initSlimScroll();
        initTabs();
        initWindowResize();
    });

    function initSlimScroll() {
        $('.slimscroll-sidebar').slimScroll({});
    }

    function initTabs() {
        // Sidebar
        var sectionSwitch = {
            closeOthers : function($trigger, $target) {
                $('.left-zone .tab').not($trigger).removeClass('open')
                $('ul.categories').not($target).removeClass('open')
            },

            init : function($trigger) {
                $trigger.on('click', function() {

                    var $trigger = $(this);
                    var id = $(this).data('trigger-section');
                    var $target = $('ul.categories[data-section=' + id + ']');

                    $trigger.toggleClass('open');
                    $target.toggleClass('open');

                    sectionSwitch.closeOthers($trigger, $target);
                })
            }
        }
        $('[data-trigger-section]').each(function() {
            sectionSwitch.init($(this));
        });

    }

    function initWindowResize() {
        // Functions
        function sidebarheight() {
            var $sidebar = $('.categories');
            var $bottom = $('.bottom-zone:visible');
            var $right = $('.left-zone');
            var $map = $('.map');

            var sidebarHeight = $sidebar.height();
            var mapHeight = $map.height();
            var bottomHeight = $bottom.height();
            var paddingTop = parseInt($right.css('padding-top'), 10);
            var paddingBottom = parseInt($right.css('padding-bottom'), 10);

            $sidebar.css('max-height', mapHeight - bottomHeight - paddingTop
                    - paddingBottom);
        }
        // Events
        $(window).on('throttledresize', function() {

            sidebarheight();

            $('.slimscroll-sidebar').slimScroll({});
        });
        sidebarheight();
    }

})(this);