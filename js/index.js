// rem
~function () {
    var desW = 640,
        winW = document.documentElement.clientWidth || document.body.clientWidth;
    if (winW > desW) {
        $('.main').css("width", desW);
        return;
    }
    //  设置html字体大小
    document.documentElement.style.fontSize = winW / desW * 100 + "px";
}();

//-> HEADER
~function () {
    var $header = $('.header'),
        $menu = $header.find('.menu'),
        $nav = $header.find('.nav'),
        $bool = false;
    $menu.tap(function () {
        $bool = !$bool;
        if ($bool) {
            $nav.css({
                padding: '.1rem 0',
                height: '2.22rem'
            });
            return;
        }
        $nav.css({
            padding: 0,
            height: 0
        });
    })
}();