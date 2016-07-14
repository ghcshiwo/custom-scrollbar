/**
 * Created by Guo on 2016/7/13.
 */
var Scroll = {};
(function(win,doc,$){
    function  CusScrollBar(options){
        this._init(options);
    }
    $.extend(CusScrollBar.prototype,{
        _init:function(options) {
            var self = this;
            self.options={
                scrollDir:'y',//滚动的方向
                contSelector:'',//滚动内容区选择器
                barSelector:'',//滚动条选择器
                sliderSelector:'',//滚动滑块选择器
                tabItemSelector:'.tab-item',//标签选择器
                tabActiveClass:'on',//选中标签类名
                anchorSelector:'.anchor',//锚点选择器
                correctSelector:".correct-bot",//校正元素
                articleSelector:".scroll-ol",//文章选择器
                wheelStep:10//滚轮步长
            };
            $.extend(true,self.options,options||{})
            self._initDomEvent();
            return self;
        },
        _initDomEvent:function(){
            var opts = this.options;
            this.$cont = $(opts.contSelector);
            this.$slider = $(opts.sliderSelector);
            this.$bar = opts.barSelector ? $(opts.barSelector):self.$slider.parent();
            this.$tabItem = $(opts.tabItemSelector);
            this.$anchor = $(opts.anchorSelector);
            this.$article = $(opts.articleSelector);
            this.$correct = $(opts.correctSelector);
            this.$doc = $(doc);
            this._initSliderDragEvent()
                ._initTabEvent()
                ._initArticleHeight()
                ._bindContScroll()
                ._bindMouseWheel();

        },
        _initSliderDragEvent:function(){
            var self = this,
                slider = self.$slider,
                sliderEl = slider[0];
            if(sliderEl){
                var doc = this.$doc,
                    dragStartPagePosition,
                    dragStartScrollPosition,
                    dragContBarRate;
                function mousemoveHandler(e){
                    e.preventDefault();
                    if(dragStartPagePosition == null){
                        return;
                    }
                    self.scrollTo(dragStartScrollPosition + (e.pageY - dragStartPagePosition)*dragContBarRate);
                }
                slider.on("mousedown",function(e){
                    e.preventDefault();
                    dragStartPagePosition = e.pageY;
                    dragStartScrollPosition = self.$cont[0].scrollTop;
                    dragContBarRate = self.getMaxScrollPosition()/self.getMaxSliderPosition();
                    doc.on("mousemove.scroll",mousemoveHandler)
                        .on("mouseup.scroll",function(e){
                            doc.off(".scroll");
                        })
                })
            }
            return self;
        },
        _initTabEvent:function(){
            var self = this;
            self.$tabItem.on("click",function(e){
                e.preventDefault();
                var index = $(this).index();
                self.changeTabSelect(index);
                self.scrollTo(self.$cont[0].scrollTop + self.getAnchorPosition(index));
            });
            return self;
        },
        _initArticleHeight:function(){
            var self = this,
                lastArticle = self.$article.last();
            var lastArticleHeight = lastArticle.height(),
                contHeight = self.$cont.height();
            if(lastArticleHeight < contHeight){
                self.$correct[0].style.height = contHeight - lastArticleHeight - self.$anchor.outerHeight() + "px";
            }
            return self;
        },
        changeTabSelect :function(index){
            var self = this,
                active = self.options.tabActiveClass;
            return self.$tabItem.eq(index).addClass(active).siblings().removeClass(active);
        },
        _bindContScroll:function(){
            var self = this;
            self.$cont.on('scroll',function(){
                var sliderEl = self.$slider && self.$slider[0];
                if(sliderEl){
                    sliderEl.style.top=self.getSliderPosition()+'px';
                }
            });
            return self;
        },
        _bindMouseWheel:function(){
            var self = this;
            self.$cont.on("mousewheel DOMMouseScroll",function(e){
                e.preventDefault();
                var oEv = e.originalEvent,
                    wheelRange = oEv.wheelDelta ? -oEv.wheelDelta/120 : (oEv.detail || 0)/3;
                self.scrollTo(self.$cont[0].scrollTop + wheelRange * self.options.wheelStep);
            });
            return self;
        },
        getSliderPosition:function(){
            var self = this,
                maxSliderPosition = self.getMaxSliderPosition();
            return Math.min(maxSliderPosition,maxSliderPosition*self.$cont[0].scrollTop/self.getMaxScrollPosition());
        },
        getAnchorPosition:function(index){
            return this.$anchor.eq(index).position().top;
        },
        getAllAnchorPosition:function(){
          var self = this,
              allPositionArr =[];
            for(var i=0;i<self.$anchor.length;i++){
                allPositionArr.push(self.$cont[0].scrollTop+self.getAnchorPosition(i));
            }
            return allPositionArr;
        },
        getMaxScrollPosition:function(){
            var self = this;
            return Math.max(self.$cont.height(),self.$cont[0].scrollHeight) - self.$cont.height();
        },
        getMaxSliderPosition:function(){
            var self = this;
            return self.$bar.height() - self.$slider.height();
        },
        scrollTo:function(positionVal){
            var self = this;
            var posArr = self.getAllAnchorPosition();
            function getIndex(positionVal){
                for(var i=posArr.length-1;i>=0;i--){
                    if(positionVal>= posArr[i]){
                        return i;
                    }
                    else {
                        continue;
                    }
                }
            }
            if(posArr.length == self.$tabItem.length){
                self.changeTabSelect(getIndex(positionVal));
            }
            self.$cont.scrollTop(positionVal);
        }
    });
    Scroll.CusScrollBar = CusScrollBar;
})(window,document,jQuery);
new Scroll.CusScrollBar({
    contSelector:'.scroll-cont',
    barSelector:'.scroll-bar',
    sliderSelector:'.scroll-slider'
});
