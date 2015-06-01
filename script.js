// vars
var compon = false;
var activeMemPlace = 0;
var temp_data = [];
var temp_addr = [];
var memplace_data = {}; // ex: {13: [0,1,0,0,1,0,1,0]}
var memplace_addr = {}; // ex: {7: [0,1,0,0,1,0,1,0,0,1,0,0,1,0,1]}
var resetListener;
var demoInterval;
var demoindex = 0;

var builtin_memplace_data = {};
var builtin_memplace_addr = {};
builtin_memplace_data[0] = [0,0,0,0,0,0,0,0];
builtin_memplace_addr[0] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; // 0
builtin_memplace_data[1] = [1,0,0,0,0,0,0,0];
builtin_memplace_addr[1] = [0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0]; // 20
builtin_memplace_data[2] = [1,1,0,0,0,0,0,0];
builtin_memplace_addr[2] = [0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0]; // 40
builtin_memplace_data[3] = [0,1,1,0,0,0,0,0];
builtin_memplace_addr[3] = [0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0]; // 60
builtin_memplace_data[4] = [0,0,1,1,0,0,0,0];
builtin_memplace_addr[4] = [0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0]; // 80
builtin_memplace_data[5] = [0,0,0,1,1,0,0,0];
builtin_memplace_addr[5] = [0,0,0,0,0,0,0,0,0,1,1,0,0,1,0,0]; // 100
builtin_memplace_data[6] = [0,0,0,0,1,1,0,0];
builtin_memplace_addr[6] = [0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0]; // 120
builtin_memplace_data[7] = [0,0,0,0,0,1,1,0];
builtin_memplace_addr[7] = [0,0,0,0,0,0,0,0,1,0,0,0,1,1,0,0]; // 140
builtin_memplace_data[8] = [0,0,0,0,0,0,1,1];
builtin_memplace_addr[8] = [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0]; // 160
builtin_memplace_data[9] = [0,0,0,0,0,0,0,0];
builtin_memplace_addr[9] = [0,0,0,0,0,0,0,0,1,0,1,1,0,1,0,0]; // 180
builtin_memplace_data[10] = [1,1,1,1,1,1,1,1];
builtin_memplace_addr[10] = [0,0,0,0,0,0,0,0,1,1,0,0,1,0,0,0]; // 200
builtin_memplace_data[11] = [0,0,0,0,0,0,0,0];
builtin_memplace_addr[11] = [0,0,0,0,0,0,0,0,1,1,0,1,1,1,0,0]; // 220
builtin_memplace_data[12] = [1,1,1,1,1,1,1,1];
builtin_memplace_addr[12] = [0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0]; // 240
builtin_memplace_data[13] = [0,0,0,0,0,0,0,0];
builtin_memplace_addr[13] = [0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0]; // 260
builtin_memplace_data[14] = [0,1,0,1,0,1,0,0];
builtin_memplace_addr[14] = [0,0,0,0,0,0,0,1,0,0,0,1,1,0,0,0]; // 280
builtin_memplace_data[15] = [1,0,1,0,1,0,1,0];
builtin_memplace_addr[15] = [0,0,0,0,0,0,0,1,0,0,1,0,1,1,0,0]; // 300

$(document).ready(function(){

	// switches
	var powerSwitch = $('.switch-on');
	var addrSwitch = $('.switch-addr');
	var programSwitch = $('.switch-program');
	var demoSwitch = $('.switch-demo');
	var runSwitch = $('.switch-run');
	var stepSwitch = $('.switch-single');
	var resetSwitch = $('.switch-reset');
	//leds
	var powerLed = $('.led-power-1');
	
	// don't allow clicks while computer is off
	$(document).on('click', '.switch', function(){
		if (!compon){
			if ($(this).hasClass('switch-on')){ poweron(); }
			else{ toggleOnOff($(this)); }
		}
		else{
			if ($(this).hasClass('switch-on')){ poweroff(); }
			else{ switchClicked($(this)); }
		}
	});

	$(document).on('mousedown', '.switch-reset', function(){
		toggleOn(resetSwitch);
		demoindex = 0;
		console.log("> demo rewinded to the beginning");
		resetListener = setInterval(function(){
			resetComp();
			console.log("> memory spaces reset");
			toggleOff(resetSwitch);
		}, 1000);
	});
	$(document).on('mouseup', '.switch-reset', function(){
		toggleOff(resetSwitch);
		clearInterval(resetListener);
	});

	// fires when comp on and any switch clicked
	function switchClicked(swt){
		// address switch clicked
		if (swt.hasClass('switch-addr')){ switchMode(); }

		// program switch clicked
		if (swt.hasClass('switch-program')){ program(); }

		// singlestep switch clicked
		if (swt.hasClass('switch-single')){ singleStep(); }

		// demo switch clicked
		if (swt.hasClass('switch-demo')){ demoMode(); }

		// run-stop switch clicked
		if (swt.hasClass('switch-run')){ runStop(); }

		// data/addr switches clicked
		if (swt.hasClass('switch-a')){
			toggleSwitch(swt);
			flashSwitchStatesToTempMemory();
			if (compMode()=="data" && swt.hasClass('switch-d')){
				var dataSwitchID = swt.attr('id');
				if (isOn(swt)){ toggleLedOn($('.led-d'+dataSwitchID)); }
				else{ toggleLedOff($('.led-d'+dataSwitchID)); }
			}
			else if (compMode()=="addr"){
				var addrSwitchID = swt.attr('id');
				if (isOn(swt)){ toggleLedOn($('.led-a'+addrSwitchID)); }
				else{ toggleLedOff($('.led-a'+addrSwitchID)); }
			}
		}
	}

	// switches the computer from data mode to addr mode
	function switchMode(){
		toggleSwitch(addrSwitch);
		if (compMode()=="data"){
			//$('.led-a').each(function(){ toggleLedOff($(this)); });
			for(var i=0; i<=7; i++){
				if (isOn($('.switch-a'+i))){ toggleLedOn($('.led-d'+i)); }
				else{ toggleLedOff($('.led-d'+i)); }
			}
		}
		else if (compMode()=="addr"){
			//$('.led-d').each(function(){ toggleLedOff($(this)); });
			for(var i=0; i<=15; i++){
				if (isOn($('.switch-a'+i))){ toggleLedOn($('.led-a'+i)); }
				else{ toggleLedOff($('.led-a'+i)); }
			}
		}
		flashSwitchStatesToTempMemory();
	}

	// toggles leds according to the states of the switches
	function backToSwitchStates(){
		if (compMode()=="data"){
			$('.led-a').each(function(){ toggleLedOff($(this)); });
			for(var i=0; i<=7; i++){
				if (isOn($('.switch-a'+i))){ toggleLedOn($('.led-d'+i)); }
				else{ toggleLedOff($('.led-d'+i)); }
			}
		}
		else if (compMode()=="addr"){
			$('.led-d').each(function(){ toggleLedOff($(this)); });
			for(var i=0; i<=15; i++){
				if (isOn($('.switch-a'+i))){ toggleLedOn($('.led-a'+i)); }
				else{ toggleLedOff($('.led-a'+i)); }
			}
		}
	}

	// takes the current state of each switch and records to the memory
	// taking the current mode into consideration (data or addr)
	function flashSwitchStatesToTempMemory(){
		if (compMode()=="data"){
			temp_data=[];
			for(var i=0; i<=7; i++){
				if (isOn($('.switch-a'+i))){ temp_data.push(1); }
				else{ temp_data.push(0); }
			}
		}
		else if (compMode()=="addr"){
			temp_addr=[];
			for(var i=0; i<=15; i++){
				if (isOn($('.switch-a'+i))){ temp_addr.push(1); }
				else{ temp_addr.push(0); }
			}
		}
		console.log("> temporary memory updated");
		console.log("current computer mode : "+compMode());
		console.log("temp memory for data : "+tempMemStat("data"));
		console.log("temp memory for addr : "+tempMemStat("addr"));
		console.log("");
	}

	// returns the current mode
	function compMode(){
		if(isOn(addrSwitch)){ return "addr"; }
		else{ return "data"; }
	}

	// shifts the temp memory inside memory
	function program(){
		toggleOnOff(programSwitch);
		memplace_data[activeMemPlace] = [];
		memplace_addr[activeMemPlace] = [];
		for(var i=0; i<=15; i++){
			if (i<=7){ memplace_data[activeMemPlace].push(temp_data[i]); }
			memplace_addr[activeMemPlace].push(temp_addr[i]);
		}
		console.log("> computer programmed");
		console.log("wrote in memspace : "+activeMemPlace);
		console.log("memory for data (in memspace "+activeMemPlace+") : "+memStat("data"));
		console.log("memory for addr (in memspace "+activeMemPlace+") : "+memStat("addr"));
		console.log("");
	}

	// pressed single step button
	function singleStep(){
		toggleOnOff(stepSwitch);
		if (isOn(demoSwitch)){
			console.log("> demo next step");
			demoindex++;
			if (demoindex>15){demoindex=0;}
			displayMemStat(demoindex, true);
		}
		else{
			if (activeMemPlace<15){ activeMemPlace++; }
			else{ activeMemPlace = 0; }
			$('.led-a').each(function(){ toggleLedOff($(this)); });
			$('.led-d').each(function(){ toggleLedOff($(this)); });
			temp_data = [];
			temp_addr = [];
			console.log("> memspace "+activeMemPlace+" active");
			console.log("memory for data (in memspace "+activeMemPlace+") : "+memStat("data"));
			console.log("memory for addr (in memspace "+activeMemPlace+") : "+memStat("addr"));
			console.log("> temporary memory reset");
			console.log("> flashing current switch states into temp memory...");
			flashSwitchStatesToTempMemory();
			backToSwitchStates();
		}
	}

	function runStop(){
		toggleSwitch(runSwitch);
		if (isOn(runSwitch)){
			var demo = false;
			if (isOn(demoSwitch)){
				console.log("> demo mode active");
				console.log("> demo running...");
				demo = true;
			}
			else{
				console.log("> demo mode not active");
				console.log("> user data running...");
			}
			demoInterval = setInterval(function(){
				displayMemStat(demoindex, demo); demoindex++;
				if (demoindex>15){demoindex=0;}
			},500);
		}
		else{
			clearInterval(demoInterval);
			demoindex = 0;
			backToSwitchStates();
			console.log("> demo stopped...");
		}
	}

	function demoMode(){
		toggleSwitch(demoSwitch);
		if (isOn(demoSwitch)){
			demoindex = 0;
			displayMemStat(demoindex, true);
			console.log("> demo mode on");
		}
		else{
			console.log("> demo mode off");
			demoindex = 0;
			backToSwitchStates();
		}
	}

	function displayMemStat(memspace, demo){
		if (demo){
			console.log("showing memspace "+memspace+" (built-in data) ------------------------------");
			console.log("memory for data (in memspace "+memspace+") : "+memStat("data", memspace, demo));
			console.log("memory for addr (in memspace "+memspace+") : "+memStat("addr", memspace, demo));
		}
		else{
			console.log("showing memspace "+memspace+" (user data) ------------------------------");
			console.log("memory for data (in memspace "+memspace+") : "+memStat("data", memspace));
			console.log("memory for addr (in memspace "+memspace+") : "+memStat("addr", memspace));
		}
		var memStats_data = memplace_data[memspace];
		if (demo){ memStats_data = builtin_memplace_data[memspace]; }
		if (memStats_data && memStats_data.length > 0){
			for(var i=0; i<=7; i++){
				var ind = i;
				if (demo){ ind = 7-i;}
				if(memStats_data[i]==1){ toggleLedOn($('.led-d'+ind)); }
				else{ toggleLedOff($('.led-d'+ind)); }
			}
		}
		var memStats_addr = memplace_addr[memspace];
		if (demo){ memStats_addr = builtin_memplace_addr[memspace]; }
		if (memStats_addr && memStats_addr.length > 0){
			for(var i=0; i<=15; i++){
				var ind = i;
				if (demo){ ind = 15-i;}
				if(memStats_addr[i]==1){ toggleLedOn($('.led-a'+ind)); }
				else{ toggleLedOff($('.led-a'+ind)); }
			}
		}
		
	}


	// return temp memory status
	function tempMemStat(mem){
		var stats = "";
		if (mem=="data"){
			if (temp_data && temp_data.length > 0){
				for(var i=0; i<=7; i++){
					stats = temp_data[i]+" "+stats;
				}
			}
			else{ stats = "Not Set"; }	
		}
		else if (mem=="addr"){
			if (temp_addr && temp_addr.length > 0){
				for(var i=0; i<=15; i++){
					stats = temp_addr[i]+" "+stats;
				}
			}
			else{ stats = "Not Set"; }
		}
		return stats;
	}

	// return memory status
	function memStat(mem, memspace, demo){
		var stats = "";
		var currentMemSpace = activeMemPlace;
		if(memspace){ currentMemSpace = memspace; }
		if (mem=="data"){
			var memStats = memplace_data[currentMemSpace];
			if (demo){ memStats = builtin_memplace_data[currentMemSpace]; }
			if (memStats && memStats.length > 0){
				for(var i=0; i<=7; i++){
					stats = memStats[i]+" "+stats;
				}
			}
			else{ stats = "Not Set"; }
			
		}
		else if (mem=="addr"){
			var memStats = memplace_addr[currentMemSpace];
			if (demo){ memStats = builtin_memplace_addr[currentMemSpace]; }
			if (memStats && memStats.length > 0){
				for(var i=0; i<=15; i++){
					stats = memStats[i]+" "+stats;
				}
			}
			else{ stats = "Not Set"; }
		}
		return stats;
	}



	/* comp */
	function resetComp(){
		activeMemPlace = 0;
		memplace_data = {};
		memplace_addr = {};
		temp_data = [];
		temp_addr = [];
	}
	function poweron(){
		resetComp();
		toggleOn(powerSwitch);
		toggleLedOn(powerLed);
		$('.led-a').each(function(){ toggleLedOn($(this)); });
		$('.led-d').each(function(){ toggleLedOn($(this)); });
		setTimeout(function(){
			$('.led-a').each(function(){ toggleLedOff($(this)); });
			$('.led-d').each(function(){ toggleLedOff($(this)); });
		},1000);
		compon = true;
		console.log("> computer on");
		console.log("> started at memspace "+activeMemPlace);
		console.log("");
	}
	function poweroff(){
		console.log("> resetting");
		resetComp();
		console.log("> bye");
		console.log("");
		toggleOff(powerSwitch);
		toggleLedOff(powerLed);
		$('.led').each(function(){ toggleLedOff($(this)); });
		compon = false;
	}
	/* leds */
	function toggleLed(led){
		if (led.hasClass('active')){ toggleLedOn(led); }
		else{ toggleLedOff(led); }
	}
	function toggleLedOn(led){ led.addClass('active'); }
	function toggleLedOff(led){ led.removeClass('active'); }
	function isLedOn(led){
		return led.hasClass('active');
	}
	/* toggles */
	function toggleSwitch(swt){
		if (swt.hasClass('swoff')){ toggleOn(swt); }
		else{ toggleOff(swt); }
	}
	function toggleOn(swt){
		swt.removeClass('swoff');
		swt.html("<img src='sw-on.png'>");
	}
	function toggleOff(swt){
		swt.addClass('swoff');
		swt.html("<img src='sw-off.png'>");
	}
	function toggleOnOff(swt){
		toggleSwitch(swt);
		setTimeout(function(){
			toggleSwitch(swt);
		},100);
	}
	function isOn(swt){
		return !swt.hasClass('swoff');
	}

});
