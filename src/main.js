window.onload = function(){
	/* 设置数量 */
	var ball_count = 12;//设置小球个数
	var ball_error = Math.round(Math.random() * (ball_count - 1)) + 1;//设置问题小球编号
	var ball_type = Math.floor(Math.random() * 2);//设置偏重(1)还是偏轻(0)
	//document.title = ball_error + "--------" +ball_type;
	////console.log(ball_error + "--------" +ball_type);
	var ball_zIndex = 10;
	/* 获取元素 */
	var oSelect = document.getElementById('ball-idx');//select的id
	var oSubmit = document.getElementById('btn-submit');//按钮提交的id
	var oContainer = document.getElementById('balls').getElementsByTagName('ul')[0];
	var oLibra = document.getElementById('libra');
	var oLeft = oLibra.children[0].children[0];
	var oRight = oLibra.children[1].children[0];
	var oLeft_balls = [];
	var oRight_balls = [];
	var oDoweight= document.getElementById('do-weight');
	var iCount = 3;
	var oRecord= document.getElementById('operation-record');
	//生成小球及下标
	var ball = null;
	var ball_index = 0;
	var result_ball_list = ['<option value="0">请选择</option>'];
	var result_ball_container = '';
	for (var i = 0; i < ball_count; i ++) {
		ball_index = i + 1;//设置小球下标
		ball = addBall(oContainer, ball_index);//生成小球

		result_ball_list.push([
			'<option value="' + ball_index + '">',
			ball_index,
			'</option>'
		].join(''));
	}
	//向ball-idx/balls中插入小球下标
	oSelect.innerHTML = result_ball_list;//将result_ball_list插入到ball-idx中
	//布局转换
	var aPos=[];
	var aBall = getClassName('ball');
	for(var i=0; i < aBall.length; i++){
		aPos[i] = {left : aBall[i].offsetLeft, top : aBall[i].offsetTop};
		aBall[i].style.left = aPos[i].left + 'px';
		aBall[i].style.top = aPos[i].top + 'px';
		aBall[i].style.width = 60 + 'px';
		aBall[i].style.height = 60 + 'px';
	}
	for(var i = 0; i < aBall.length; i++){
		aBall[i].style.position = 'absolute';
		aBall[i].style.margin = 0;
		aBall[i].style.zIndex = ball_zIndex;
		aBall[i].index = i;
	}
	//为小球添加拖拽事件
	for(var i = 0; i < aBall.length; i++){
		drag(aBall[i]);
	}
	//拖拽
	function drag(obj){
		obj.onmousedown = function(ev){
			var oEvent = ev || event;
			//计算鼠标点击相对div的位置
			disX = oEvent.clientX - obj.offsetLeft;
			disY = oEvent.clientY - obj.offsetTop;
			
			var zIndex = ball_zIndex + 1;
	
			obj.style.zIndex = zIndex;
			
			document.onmousemove = function(ev){
				var oEvent = ev || event;
				
				var l = oEvent.clientX - disX;
				var t = oEvent.clientY - disY;
				
				obj.style.left = l + 'px';
				obj.style.top = t + 'px';
				if(collTest(obj,oLeft)){
					oLeft.style.borderColor = '#f60';
				}else{
					oLeft.style.borderColor = '#ccc';
				}
				if(collTest(obj,oRight)){
					oRight.style.borderColor = '#f60';
				}else{
					oRight.style.borderColor = '#ccc';
				}
			}
			document.onmouseup = function(){
				document.onmousemove = document.onmouseup = null;
				//释放捕获
				obj.releaseCapture && obj.releaseCapture();
				for(var i = 0; i < oLeft_balls.length; i++){
					if(oLeft_balls[i] == obj.index + 1){
						oLeft_balls.splice(i,1);
					}
				}
				for(var i = 0; i < oRight_balls.length; i++){
					if(oRight_balls[i] == obj.index + 1){
						oRight_balls.splice(i,1);
					}
				}
				if(!collTest(obj,oLeft) && !collTest(obj,oRight)){
					
					startMove(obj,aPos[obj.index],{end:function(){
						obj.style.zIndex = ball_zIndex;
					}});
				}else if(collTest(obj,oLeft)){
					oLeft.style.borderColor = '#ccc';
					oLeft_balls.push(obj.index + 1);
					oLeft_balls.sort(function(a,b){return a-b;});
					//alert(oLeft_balls);
				}else if(collTest(obj,oRight)){
					oRight.style.borderColor = '#ccc';
					oRight_balls.push(obj.index + 1);
					oRight_balls.sort(function(a,b){return a-b;});
					//alert(oRight_balls);
				}
			}
			//设置捕获
			obj.setCapture && obj.setCapture();
			return false;
		}
	}
	var iFalg = 0;
	
	/* 称重 */
	oDoweight.onclick = function(){
		
		if(!oLeft_balls.length || !oRight_balls.length){
			alert('托盘不能为空');
			return;
		}
		if(oLeft_balls.length != oRight_balls.length){
			alert('托盘左右数量不相等');
			return;
		}
		iCount--;
		if(iCount > 0){
			oDoweight.innerHTML = '称一下(还有' + iCount + '次机会)';
		}else{
			oDoweight.innerHTML = '不能再称了，请提交你的答案';
			oDoweight.disabled = true;
		}
		//开始称重
		var msg = '两边一样重。';
		var timer = null;
		var iNum = 8;
		var bFalg = true;
		var a = 1;
		for(var i = 0; i < oLeft_balls.length; i++){
			if(oLeft_balls[i] == ball_error){//oLibra.children[0]
				if(ball_type){
					msg = '左边比右面重。';
					//console.log("1:"+iFalg);
					if(iFalg != 1){
						if(iFalg == 3){
							a = 2;
						}
						oLibra.children[2].style.backgroundImage = 'url("images/blance_1.png")'; 
						timer = setInterval(function(){
							iNum--;
							if(!iNum){
								a = 1;
								iFalg = 1; 
								clearInterval(timer);
							}else{
								oLibra.children[2].style.backgroundPosition = '50%' + -120 * iNum + 'px';
								oLibra.children[0].style.top = parseInt(oLibra.children[0].offsetTop) + 5 * a + 'px';
								oLibra.children[1].style.top = parseInt(oLibra.children[1].offsetTop) + -5 * a + 'px';
								for(var j = 0; j < oLeft_balls.length; j++){
									aBall[(oLeft_balls[j]-1)].style.top = parseInt(aBall[(oLeft_balls[j]-1)].offsetTop) + 5 * a + 'px';
									aBall[(oRight_balls[j]-1)].style.top = parseInt(aBall[(oRight_balls[j]-1)].offsetTop) + -5 * a + 'px';
								}
							}	
						},30);
						
					}
				}else{
					msg = '右边比左面重。';
					//console.log("2:"+iFalg);
					if(iFalg != 2){
						if(iFalg == 4){
							a = 2;
						}
						oLibra.children[2].style.backgroundImage = 'url("images/blance_2.png")'; 
						timer = setInterval(function(){
							iNum--;
							if(!iNum){
								a = 1;
								clearInterval(timer);
								iFalg = 2; 
							}else{
								oLibra.children[2].style.backgroundPosition = '50%' + -120 * iNum + 'px';
								oLibra.children[0].style.top = parseInt(oLibra.children[0].offsetTop) + -5 * a + 'px';
								oLibra.children[1].style.top = parseInt(oLibra.children[1].offsetTop) + 5 * a + 'px';
								for(var j = 0; j < oLeft_balls.length; j++){
									aBall[(oLeft_balls[j]-1)].style.top = parseInt(aBall[(oLeft_balls[j]-1)].offsetTop) + -5 * a + 'px';
									aBall[(oRight_balls[j]-1)].style.top = parseInt(aBall[(oRight_balls[j]-1)].offsetTop) + 5 * a + 'px';
								}
							}	
						},30);
						
					}
				}
				bFalg = false;
			}
		}
		for(var i = 0; i < oRight_balls.length; i++){
			if(oRight_balls[i] == ball_error){
				if(ball_type){
					msg = '右边比左面重。';
					//console.log("3:"+iFalg);
					if(iFalg != 3){
						if(iFalg == 1){
							a = 2;
						}
						oLibra.children[2].style.backgroundImage = 'url("images/blance_2.png")'; 
						timer = setInterval(function(){
							iNum--;
							if(!iNum){
								iFalg = 3; 
								a = 1;
								clearInterval(timer);
							}else{
								oLibra.children[2].style.backgroundPosition = '50%' + -120 * iNum + 'px';
								oLibra.children[0].style.top = parseInt(oLibra.children[0].offsetTop) + -5 * a + 'px';
								oLibra.children[1].style.top = parseInt(oLibra.children[1].offsetTop) + 5 * a + 'px';
								for(var j = 0; j < oLeft_balls.length; j++){
									aBall[(oLeft_balls[j]-1)].style.top = parseInt(aBall[(oLeft_balls[j]-1)].offsetTop) + -5 * a + 'px';
									aBall[(oRight_balls[j]-1)].style.top = parseInt(aBall[(oRight_balls[j]-1)].offsetTop) + 5 * a + 'px';
								}
							}	
						},30);
						
					}
				}else{
					msg = '左边比右面重。';
					//console.log("4:"+iFalg);
					if(iFalg != 4){
						if(iFalg == 2){
							a = 2;
						}
						oLibra.children[2].style.backgroundImage = 'url("images/blance_1.png")'; 
						timer = setInterval(function(){
							iNum--;
							if(!iNum){
								a = 1;
								iFalg = 4; 
								clearInterval(timer);
							}else{
								oLibra.children[2].style.backgroundPosition = '50%' + -120 * iNum + 'px';
								oLibra.children[0].style.top = parseInt(oLibra.children[0].offsetTop) + 5 * a + 'px';
								oLibra.children[1].style.top = parseInt(oLibra.children[1].offsetTop) + -5 * a + 'px';
								for(var j = 0; j < oLeft_balls.length; j++){
									aBall[(oLeft_balls[j]-1)].style.top = parseInt(aBall[(oLeft_balls[j]-1)].offsetTop) + 5 * a + 'px';
									aBall[(oRight_balls[j]-1)].style.top = parseInt(aBall[(oRight_balls[j]-1)].offsetTop) + -5 * a + 'px';
								}
							}	
						},30);
						
					}
				}
				bFalg = false;
			}
		}
		if(bFalg){
			
			if(parseInt(getStyle(oLibra.children[0],'top')) != 40){
				//console.log(iFalg);
				timer = setInterval(function(){
					iNum--;
					if(!iNum){
						a = 1;
						iFalg = 0; 
						clearInterval(timer);
					}else{
						//console.log("-----"+iFalg);
						if(iFalg == 1 || iFalg == 4){
							a = -1;
						};
						//console.log("-----"+a);
						oLibra.children[2].style.backgroundPosition = '50%' + -120 * (9 - iNum) + 'px';
						oLibra.children[0].style.top = parseInt(oLibra.children[0].offsetTop) + 5 * a + 'px';
						oLibra.children[1].style.top = parseInt(oLibra.children[1].offsetTop) + -5 * a + 'px';
						for(var j = 0; j < oLeft_balls.length; j++){
							aBall[(oLeft_balls[j]-1)].style.top = parseInt(aBall[(oLeft_balls[j]-1)].offsetTop) + 5 * a + 'px';
							aBall[(oRight_balls[j]-1)].style.top = parseInt(aBall[(oRight_balls[j]-1)].offsetTop) + -5 * a + 'px';
						}
					}
				},30);
				
			}
			
		}
		oRecord.style.display = 'block';
		oRecord.getElementsByTagName('ul')[0].innerHTML += ['<li>',
			'#第' + (3 - iCount) + '次称重 ',
			'左边：',
			oLeft_balls.join(','),
			' 号小球，',
			'右边：',
			oRight_balls.join(','),
			' 号小球，',
			msg,
			'</li>'].join('');
	};
	
	/* 计算结果是否正确 */
	oSubmit.onclick = function(){
		var oSelect_value = document.getElementById('ball-idx').value;//select的value
		var oRadio_value = getRadioName('ball-w-l').value;
		//alert(oRadio_value);
		//验证小球编号是否被选中
		if (isNaN(oSelect_value) || oSelect_value < 1 || oSelect_value > 12) {
			alert('请选择有效的小球序号！');
			return;
		}
		//验证小球问题类型是否被选中
		if (!oRadio_value || (oRadio_value != 0 && oRadio_value != 1)) {
			alert('请选择小球偏轻还是偏重！');
			return;
		}
		//提交开始 处理按钮置灰
		this.disabled = true;
		//验证答案是否正确
		if(ball_error == oSelect_value && ball_type == oRadio_value){
			alert('恭喜你，回答正确，你太聪明了');
		}else{
			alert('很遗憾，答案不是这样的… :-(');
		}	
	};
	
	function addBall(obj,index){//生成第index小球
		var oBall = '<li><div class="ball"><span>' + index + '</span></div></li>';
		obj.innerHTML += oBall;
	}
	/* 工具类 */
	//用于判断当前单选选择的是哪一个
	function getRadioName(name){
		var aRadio = document.getElementsByName(name);
		for(var i=0; i < aRadio.length; i++){
			if(aRadio[i].checked){
				return aRadio[i]
			}
		}
		return false;
	}
	//getByClass 根据className 获取一组元素
	function getClassName(sClass,oParent){
		if(!document.getElementsByClassName){
			var arr = [];
			var reg = new RegExp('(^| )' + sClass + '( |$)');
			var aEle = YU.util.getTagName('*',(oParent||document));
			for(var i = 0; i < aEle.length; i++){
				reg.test(aEle[i].className) && arr.push(aEle[i])
			}
			return arr;
		}else{
			return (oParent||document).getElementsByClassName(sClass);
		}
	}
	
	function getPos(obj){
　　		var t=0;
　　		var l=0;
　　
　　		while(obj){
　　			t += obj.offsetTop;
　　			l += obj.offsetLeft;
　　			obj = obj.offsetParent;//每取完一次值，让obj等于他的有定位的父级，然后再循环传进来，继续找
　　		};
　　	return {top:t,left:l}
	}
	//包容检测
	function collTest(obj1,obj2){
		var l1 = obj1.offsetLeft;
		var r1 = obj1.offsetLeft + obj1.offsetWidth;
		var t1 = obj1.offsetTop;
		var b1 = obj1.offsetTop + obj1.offsetHeight;
		
		var l2 = getPos(obj2).left;
		var r2 = getPos(obj2).left + obj2.offsetWidth;
		var t2 = getPos(obj2).top;
		var b2 = getPos(obj2).top + obj2.offsetHeight;

		if(r1 < r2 && l1 > l2 && b1 < b2 && t1 > t2){
			return true;
		}else{
			return false;
		}
	}
	//运动
	function startMove(obj,json,options){
		options = options || {};
		options.time = options.time || 700;
		options.type = options.type || 'ease-out';
		
		var count = Math.floor(options.time/30);
		
		var start = {};
		var dis = {};
		
		for(var name in json){
			if(name == 'opacity'){
				start[name] = Math.round(parseFloat(getStyle(obj,name)) * 100);
			}else{
				start[name] = parseInt(getStyle(obj,name));	
			}
			dis[name] = json[name]-start[name];
		}
		
		var n = 0;
		clearInterval(obj.timer);
		obj.timer = setInterval(function(){
			n++;
			
			for(var name in json){
				
				switch(options.type){
					case 'linear':
						var a = n / count;
						var cur = start[name] + dis[name] * a;
						break;
					case 'ease-out':
						var a = 1 - n / count;
						var cur = start[name] + dis[name] * (1 - a * a * a);
						break;
					case 'ease-in':
						var a = n / count;
						var cur = start[name] + dis[name] * (a * a * a);
						break;
				}
				
				if(name == 'opacity'){
					obj.style.opacity = cur / 100;
					obj.style.filter = 'alpha(opacity:' + cur + ')';
				}else{
					obj.style[name] = cur + 'px';	
				}
			}
			
			if(n == count){
				clearInterval(obj.timer);
				options.end && options.end();	
			}
		},30);
	}
	function getStyle(obj,name){
		return (obj.currentStyle || getComputedStyle(obj,false))[name];
	}
};