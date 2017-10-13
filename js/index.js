// js 常用组件
~function (pro) {
    //myTrim:Remove the string and space
    pro.myTrim = function myTrim() {
        return this.replace(/(^ +| +$)/g, "");
    };

    //mySub:Intercept string, this method is distinguished in English
    pro.mySub = function mySub() {
        var len = arguments[0] || 10, isD = arguments[1] || false, str = "", n = 0;
        for (var i = 0; i < this.length; i++) {
            var s = this.charAt(i);
            /[\u4e00-\u9fa5]/.test(s) ? n += 2 : n++;
            if (n > len) {
                isD ? str += "..." : void 0;
                break;
            }
            str += s;
        }
        return str;
    };

    //myFormatTime:Format time
    pro.myFormatTime = function myFormatTime() {
        var reg = /^(\d{4})(?:-|\/|\.|:)(\d{1,2})(?:-|\/|\.|:)(\d{1,2})(?: +)?(\d{1,2})?(?:-|\/|\.|:)?(\d{1,2})?(?:-|\/|\.|:)?(\d{1,2})?$/g,
            ary = [];
        this.replace(reg, function () {
            ary = ([].slice.call(arguments)).slice(1, 7);
        });
        var format = arguments[0] || "{0}年{1}月{2}日{3}:{4}:{5}";
        return format.replace(/{(\d+)}/g, function () {
            var val = ary[arguments[1]];
            return val.length === 1 ? "0" + val : val;
        });
    };

    //queryURLParameter:Gets the parameters in the URL address bar
    pro.queryURLParameter = function queryURLParameter() {
        var reg = /([^?&=]+)=([^?&=]+)/g, obj = {};
        this.replace(reg, function () {
            obj[arguments[1]] = arguments[2];
        });
        return obj;
    };
}(String.prototype);

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

//MATCH INFO
var matchRender = (function () {
    var $matchInfo = $('.matchInfo');

    //  BIND EVENT
    function bindEvent() {
        var $bottom = $('.bottom'),
            $bottomHome = $bottom.find('.home'),
            $bottomAway = $bottom.find('.away');
        //  获取本地信息
        var support = localStorage.getItem('support');

        if (support) {
            support = JSON.parse(support);
            console.log(support.istap);
            if (support.istap) {
                $bottom.attr('isTap', true);
                support.type == 1 ? $bottomHome.addClass("bg") : $bottomAway.addClass("bg");
            }
        }
        $matchInfo.tap(function (e) {
            var tar = e.target,
                tarTag = tar.tagName,
                tarP = tar.parentNode,
                $tar = $(tar),
                $tarP = $tar.parent(),
                tarInn = $tar.html();
            if (tarTag === 'SPAN' && tarP.className === "bottom") {
                if ($bottom.attr('isTap') === "true") {
                    return;
                }
                if (tar.className === 'type') {
                    return;
                }
                $tar.html(parseFloat(tarInn) + 1).addClass("bg");

                //    发送给服务器支持的谁
                $.ajax({
                    url: 'http://matchweb.sports.qq.com/kbs/teamSupport?' +
                    'mid=100000%3A1471455&type=' + $tar.attr("type"),
                    dataType: 'jsonp',
                    jsonpCallback: 'support'
                });

                //只能点击一次
                $bottom.attr("isTap", true);
                localStorage.setItem('support', JSON.stringify({'istap': true, "type": $tar.attr("type")}));
            }
        })
    }

    //  BIND HTML
    function bindHTML(matchinfo) {
        var obj = {
            matchinfo: [matchinfo]
        }
        //  调用模版引擎
        var resultStr = template("template", obj);
        $('.matchInfo').html(resultStr);
        //  控制进度条
        window.setTimeout(function () {
            var leftNum = parseFloat(matchinfo.leftSupport),
                rightNum = parseFloat(matchinfo.rightSupport);
            $('.middle span').css('width', (leftNum / (leftNum + rightNum)) * 100 + '%');
        }, 500);
    }

    return {
        init: function () {
            //    get data
            $.ajax({
                url: "http://matchweb.sports.qq.com/html/matchDetail?" +
                "mid=100000%3A1471434&_=1507727623690&callback=matchDetailCallback",
                dataType: "jsonp",
                success: function (data) {
                    if (data && data[0] === 0) {
                        data = data[1];
                        console.log(data);
                        var matchinfo = data["matchInfo"];
                        matchinfo["leftSupport"] = data["leftSupport"];
                        matchinfo["rightSupport"] = data["rightSupport"];
                        matchinfo["startTime2"] = matchinfo['startTime'].myFormatTime('{1}月{2}日{3}:{4}');
                        console.log(matchinfo);

                        //    bind HTML
                        bindHTML(matchinfo);

                        //    bind event
                        bindEvent();
                    }
                }
            });
        }
    }
})();
matchRender.init();

//MATCH LIST
var matchListRender = (function () {
    function bindHtml(matchList) {
        var obj = {
            matchList: matchList
        };
        $('.clear').html(template("template2", obj)).css({width: $(".clear").children("li").length * 2.4 + "rem"});
        $(".clear").children("li").eq(0).addClass("bg");
        $('.clear').children("li").on("click",function () {
            $(this).addClass("bg").siblings().removeClass("bg");
            var playUrl = $(this).attr("playUrl");
            console.log($("video").attr("src",playUrl));
        });
        //    实现局部滚动
        new IScroll('.matchList', {
            scrollX: true,
            scrollY: false,
            click: true
        })

    }

    return {
        init: function () {
            $.ajax({
                type: 'get',
                url: 'http://matchweb.sports.qq.com/html/matchStatV37?mid=100000%3A1471455',
                dataType: 'jsonp',
                success: function (data) {
                    if (data && data[0] == 0) {
                        data = data[1].stats;
                        console.log(data);
                        var matchList = null;
                        $.each(data, function (index, item) {
                            console.log(item);
                            if (item.type == 9) {
                                matchList = item.list;
                                $.each(matchList, function (index, item) {
                                    item.duration = item.duration.slice(3);
                                });
                                return false;
                            }
                        });
                        bindHtml(matchList);
                    }
                }
            })
        }
    }
})();
matchListRender.init();