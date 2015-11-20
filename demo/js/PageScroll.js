/**
 * jQuery PageScroll 
 * Version 0.2.2
 *
 * https://github.com/javion25/PageScroll
 * MIT licensed
 *
 * Copyright (C) 2015 Javion.com - A project by Javion
 */
;(function ($,window,document,undefined){
	/*说明：获取浏览器前缀*/
	/*实现：判断某个元素的css样式中是否存在transition属性*/
	/*参数：dom元素*/
	/*返回值：Boolean，有则返回浏览器样式前缀，否则返回false*/
	var _prefix = (function(temp){
		var aPrefix = ["webkit","Moz","o","ms"],
			props = "";
		for(var i in aPrefix){
			props = aPrefix[i] + "Transition";
			if(temp.style[ props] != undefined){
				return "-"+ aPrefix[i].toLowerCase()+"-";
			}
		}
		return false;
	})(document.createElement(PageScroll));

	var PageScroll = (function(){
		//定义PageScroll的构造函数
		function PageScroll(element,options){
			this.settings = $.extend(true,$.fn.PageScroll.defaults,options||{});
			this.element = element;
			this.init();
		}
		//定义PageScroll的方法
		PageScroll.prototype = {
			/*说明：初始化插件*/
			/*实现：初始化dom结构，布局，分页及绑定事件*/
			init : function(){
				var me = this;
				me.selectors = me.settings.selectors;
				me.sections = me.element.find(me.selectors.sections);
				me.section = me.sections.find(me.selectors.section);
				me.insection = me.element.find(me.selectors.insection);
				me.controlPrev = me.insection.find(me.selectors.controlPrev);
				me.controlNext = me.insection.find(me.selectors.controlNext);
				me.direction = me.settings.direction == "vertical" ? true:false;
				me.pagesCount = me.pagesCount();
				me.index = (me.settings.index>=0 && me.settings.index < me.pagesCount)? me.settings.index : 0;
				me.index2 = 0;
				me.canScroll = true;

				  
				if(!me.direction){
					me._initLayout();
				}else if(me.insection && ($(me.insection).length)){
					me._initInside();
				}

				if (me.settings.pagination) {
					me._initPaging();
				}

				if(me.index>0){
					me._scrollPage();
				}

				me._initEvent();
			},
			/*说明：获取滚动页面数量*/
			pagesCount : function(){
				return this.section.length;
			},
			/*说明：获取滚动的宽度（横屏滑动）或高度（竖屏滑动）*/
			ScrollLength : function(){
				return this.direction ? this.element.height() : this.element.width();
			},
			/*说明：向前滚动即上一页面*/
			prev : function(){
				var me = this;
				if(me.index > 0){
					me.index --;
				}else if(me.settings.loop){
					me.index = me.pagesCount - 1;
				}
				me._scrollPage();
			},
			/*说明：向后滚动即下一页面*/
			next : function(){
				var me = this;
				if(me.index < me.pagesCount){
					me.index ++;
				}else if(me.settings.loop){
					me.index = 0;
				}
				me._scrollPage();
			},
			/*说明：内页向前滚动即上一页面*/
			in_prev : function(){
				var me = this;
				if(me.index2 > 0){
					me.index2 --;
				}else if(me.settings.loop){
					me.index2 = me.insection.length - 1;
				}
				me._inscrollPage();
			},
			/*说明：内页向后滚动即下一页面*/
			in_next : function(){
				var me = this;
				if(me.index2 < me.insection.length){
					me.index2 ++;
				}else if(me.settings.loop){
					me.index2 = 0;
				}
				me._inscrollPage();
			},
			ScrollLength : function(){
				return this.direction ? this.element.height() : this.element.width();
			},
			/*说明：针对竖屏情况进行页面内层布局*/
			_initInside : function(){
				var me = this;
				var	width = (me.insection.length*100) + "%", 
					cellWidth = (100/me.insection.length).toFixed(2)+"%";
					me.insection.parent().width(width);
					me.insection.width(cellWidth).css("float","left");
				var	prevClass = me.selectors.controlPrev.substring(1),
					nextClass = me.selectors.controlNext.substring(1),
					controlHtml = "<a class="+prevClass+">&lt;</a>";
					controlHtml += "<a class="+nextClass+">&gt;</a>";
		 			me.element.on("mouseover",me.selectors.sections,function(){
		 				$('.control-prev').css("top",me.insection.parent().index()*100+50+"%");
		 				$('.control-next').css("top",me.insection.parent().index()*100+50+"%");
		 			});
					me.insection.parent().append(controlHtml);
			},
			/*说明：主要针对横屏情况进行页面布局*/
			_initLayout : function(){
				var me = this;
				var width = (me.pagesCount*100) + "%",
					cellWidth = (100/me.pagesCount).toFixed(2)+"%";
					me.sections.width(width);
					me.section.width(cellWidth).css("float","left");
			},
			/*说明：实现分页的dom结构及css样式*/
			_initPaging : function(){ 
				var me = this;
					pagesClass = me.selectors.page.substring(1),
				me.activeClass = me.selectors.active.substring(1);
				var pageHtml = "<ul class="+pagesClass+">";
				for(var i=0;i<me.pagesCount;i++){
					pageHtml +="<li></li>";
				}
				pageHtml+="</ul>"; 
				me.element.append(pageHtml);

				var pages = me.element.find(me.selectors.page);
				me.pageItem = pages.find("li");
				me.pageItem.eq(me.index).addClass(me.activeClass);
				
				if(me.direction) {
					pages.addClass("vertical");
				}else{
					pages.addClass("horizontal");
				};
			},
			/*说明：初始化插件事件*/
			_initEvent : function(){
				var me = this;

				me.element.on("click",me.selectors.controlPrev,function(){
					me.in_prev();
				})

				me.element.on("click",me.selectors.controlNext,function(){

					me.in_next();
				})

				me.element.on("click",me.selectors.page + " li",function(){
					me.index = $(this).index();
					me._scrollPage();
				})

				//鼠标滚轮事件
				me.element.on("mousewheel DOMMouseScroll",function(e){
					//火狐浏览器通过detail属性判断滚轮方向，向下3，向上-3
					//其他浏览器通过wheeldalta属性判断滚轮方向,向下-120，向上120
					if(me.canScroll){
						var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
						if(delta > 0 &&(me.index && !me.settings.loop || me.settings.loop)){
							me.prev();
						}else if(delta < 0 && (me.index < (me.pagesCount - 1) && !me.settings.loop || me.settings.loop)){
							me.next();
						}
					}
				})

				//键盘监听事件
				if(me.settings.keyboard){
					$(window).on("keydown",function(e){
						var keyCode = e.keyCode;
						if (keyCode == 37 || keyCode == 38) {
							me.prev();
						}else if(keyCode == 39 || keyCode == 40){
							me.next();
						}
					});
				}

				//窗口变化触发事件
				$(window).resize(function(){
					var currentLength = me.ScrollLength(),
						offset = me.settings.direction ? me.section.eq(me.index).offset().top : me.section.eq(me.index).offset().left;
						if(Math.abs(offset) > currentLength/2 && me.index < (me.pagesCount -1)){
							me.index ++;
						}
						if(me.index){
							me._scrollPage();
						}
				});

				//动画结束后触发事件
				me.sections.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend",function(){
					me.canScroll = true;
					if(me.settings.callback && $.type(me.settings.callback) == "function"){
						me.settings.callback();
					}
				});
			},
			/*说明：滑动动画*/
			_scrollPage : function(){
				var me = this,
				dest = me.section.eq(me.index).position();
				if(!dest) return;

				me.canScroll = false;

				if(_prefix){
					me.sections.css(_prefix+"transition","all " +me.settings.duration+"ms "+ me.settings.easing);
					var translate = me.direction ? "translateY(-"+dest.top+"px)" : "translateX(-"+dest.left+"px)";
					me.sections.css(_prefix+"transform",translate);
				}else{
					var animateCss = me.direction ? {top : -dest.top} : {left : -dest.left};
					me.sections.animate(animateCss,me.settings.duration,function(){
						me.canScroll = true;
						if(me.settings.callback && $.type(me.settings.callback) == "function"){
							me.settings.callback();
						}
					});
				}

				if(me.settings.pagination){
					me.pageItem.eq(me.index).addClass(me.activeClass).siblings("li").removeClass(me.activeClass);
				}
			},
			/*说明：内层滑动动画*/
			_inscrollPage : function(){
				var me = this,
				dest = me.insection.eq(me.index2).position();
				if(!dest) return;


				if(!_prefix){
					me.insection.parent().css(_prefix+"transition","all " +me.settings.duration+"ms "+ me.settings.easing);
					var translate = me.direction ? "translateX(-"+dest.left+"px)" : "translateY(-"+dest.top+"px)";
					me.insection.parent().css(_prefix+"transform",translate);
				}else{
					var animateCss = me.direction ?  {left : -dest.left} : {top : -dest.top};
					me.insection.parent().animate(animateCss,me.settings.duration,function(){
						if(me.settings.callback && $.type(me.settings.callback) == "function"){
							me.settings.callback();
						}
					});
				}
			}
		};
		return PageScroll;
	})();

	//在插件中使用PageScroll对象
	$.fn.PageScroll = function(options){
		//return this 返回当前对象，来维护插件的链式调用
		//each 循环实现每个元素的访问
		return this.each(function(){
			var me = $(this),
				instance = me.data("PageScroll");
			//如果实例存在则不再重新创建实例
			//利用data()来存放插件对象的实例
			if(!instance){
				instance = new PageScroll(me,options);
				me.data("PageScroll",instance);
			}
		});
	};

	//默认配置参数
	$.fn.PageScroll.defaults = {
		//html结构
		selectors : {
			sections : ".sections",
			section : ".section",
			insection : ".insection",
			page : ".pages",
			active : ".active",
			controlPrev : ".control-prev",
			controlNext : ".control-next"
		},
		//页面开始的索引值
		index : 0,	
		//动画效果	
		easing : "ease",		
		//动画时间，单位毫秒
		duration : 500,
		//是否循环播放
		loop : false,
		//是否进行分页处理
		pagination : true,
		//是否触发键盘事件
		keyboard :true,
		//滚动方式，默认竖屏滚动，横屏滚动为horizontal
		direction : "vertical",
		//动画执行后执行的回调函数
		callback : ""
	}
})(jQuery,window,document);