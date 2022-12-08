const firebaseConfig = {
    apiKey: "AIzaSyAdw2vd-PlfxyFJdPaslCx_TlQigTrOl_0",
    authDomain: "greenhouse-i.firebaseapp.com",
    databaseURL: "https://greenhouse-i-default-rtdb.firebaseio.com",
    projectId: "greenhouse-i",
    storageBucket: "greenhouse-i.appspot.com",
    messagingSenderId: "433436925188",
    appId: "1:433436925188:web:d62b4e0ef99aed150f8451",
    measurementId: "G-NXF1NGF5QP"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

$(document).ready(function(){
    var database = firebase.database();
	var humidity = 0;
	var temp = 0;
	var light = 900;

	database.ref().on("value", function(snap){
		humidity = snap.val().humidity;
		temp = snap.val().temperature;
		light = snap.val().light;

		window.feed = function(callback) {
			var tick = {};
			tick.plot0 = Math.ceil(350 + (Math.random() * 500));
			callback(JSON.stringify(tick));
		  };
		   
		  var myTemperature = {
			type: "gauge",
			globals: {
			  fontSize: 25
			},
			plotarea: {
			  marginTop: 80
			},
			plot: {
			  size: '100%',
			  valueBox: {
				placement: 'center',
				text: '%v', //default
				fontSize: 35,
				rules: [{
					rule: '%v <= 20',
					text: '%v<br>Too Cold'
				  },
				  {
					rule: '%v > 20 && %v < 30',
					text: '%v<br>Good'
				  },
				  {
					rule: '%v >=  30',
					text: '%v<br>Too Hot'
				  }
				]
			  }
			},
			tooltip: {
			  borderRadius: 5
			},
			scaleR: {
			  aperture: 180,
			  minValue: 0,
			  maxValue: 50,
			  step: 5,
			  center: {
				visible: false
			  },
			  tick: {
				visible: false
			  },
			  item: {
				offsetR: 0,
				rules: [{
				  rule: '%i == 9',
				  offsetX: 2
				}]
			  },
			  labels: ['0', '50'],
			  ring: {
				size: 50,
				rules: [{
					rule: '%v <= 20',
					backgroundColor: '#2969ff'
				  },
				  {
					rule: '%v >= 20 && %v < 30',
					backgroundColor: '#24b50b'
				  },
				  {
					rule: '%v >= 30',
					backgroundColor: '#fc5a03'
				  }
				]
			  }
			},
			series: [{
			  values: [temp], // starting value
			  backgroundColor: 'black',
			  indicator: [10, 10, 10, 10, 0.75],
			  animation: {
				effect: 2,
				method: 1,
				sequence: 4,
				speed: 900
			  },
			}]
		  };
		   
		  zingchart.render({
			id: 'temp',
			data: myTemperature,
			height: 500,
			width: '100%'
		  });
		
		  var myHumidity = {
			type: "gauge",
			globals: {
			  fontSize: 25
			},
			plotarea: {
			  marginTop: 80
			},
			plot: {
			  size: '100%',
			  valueBox: {
				placement: 'center',
				text: '%v', //default
				fontSize: 35,
				rules: [{
					rule: '%v <= 60',
					text: '%v<br>Too Dry'
				  },
				  {
					rule: '%v > 60 && %v < 80',
					text: '%v<br>Good'
				  },
				  {
					rule: '%v >=  80',
					text: '%v<br>Too Humid'
				  }
				]
			  }
			},
			tooltip: {
			  borderRadius: 5
			},
			scaleR: {
			  aperture: 180,
			  minValue: 0,
			  maxValue: 100,
			  step: 10,
			  center: {
				visible: false
			  },
			  tick: {
				visible: false
			  },
			  item: {
				offsetR: 0,
				rules: [{
				  rule: '%i == 9',
				  offsetX: 2
				}]
			  },
			  labels: ['0', '50'],
			  ring: {
				size: 50,
				rules: [{
					rule: '%v <= 60',
					backgroundColor: '#ffbf29'
				  },
				  {
					rule: '%v >= 60 && %v < 80',
					backgroundColor: '#24b50b'
				  },
				  {
					rule: '%v >= 80',
					backgroundColor: '#2937ff'
				  }
				]
			  }
			},
			series: [{
			  values: [parseInt(humidity)], // starting value
			  backgroundColor: 'black',
			  indicator: [10, 10, 10, 10, 0.75],
			  animation: {
				effect: 2,
				method: 1,
				sequence: 4,
				speed: 900
			  },
			}]
		  };
		   
		  zingchart.render({
			id: 'humidity',
			data: myHumidity,
			height: 500,
			width: '100%'
		  });
		
		  var myLight = {
			type: "gauge",
			globals: {
			  fontSize: 25
			},
			plotarea: {
			  marginTop: 80
			},
			plot: {
			  size: '100%',
			  valueBox: {
				placement: 'center',
				text: '%v', //default
				fontSize: 35,
				rules: [{
					rule: '%v < 900',
					text: '%v<br>Bright'
				  },
				  {
					rule: '%v >= 900',
					text: '%v<br>Dark'
				  }
				]
			  }
			},
			tooltip: {
			  borderRadius: 5
			},
			scaleR: {
			  aperture: 180,
			  minValue: 500,
			  maxValue: 1024,
			  step: 100,
			  center: {
				visible: false
			  },
			  tick: {
				visible: false
			  },
			  item: {
				offsetR: 0,
				rules: [{
				  rule: '%i == 9',
				  offsetX: 2
				}]
			  },
			  ring: {
				size: 50,
				rules: [{
					rule: '%v < 900',
					backgroundColor: '#ffbf29'
				  },
				  {
					rule: '%v >= 900',
					backgroundColor: '#060a3d'
				  }
				]
			  }
			},
			series: [{
			  values: [light], // starting value
			  backgroundColor: 'black',
			  indicator: [10, 10, 10, 10, 0.75],
			  animation: {
				effect: 2,
				method: 1,
				sequence: 4,
				speed: 900
			  },
			}]
		  };
		   
		  zingchart.render({
			id: 'light',
			data: myLight,
			height: 500,
			width: '100%'
		  });
		
	});



    $("#openWindow").click(function(){
		var windowW = firebase.database().ref().child("window");
		windowW.set("1");
	})

	$("#closeWindow").click(function(){
		var windowW = firebase.database().ref().child("window");
		windowW.set("0");
	})

	$("#turnLightOn").click(function(){
		var light = firebase.database().ref().child("LED");
		light.set("1");
	})

	$("#turnLightOff").click(function(){
		var light = firebase.database().ref().child("LED");
		light.set("0");
	})

	$("#sendMessage").click(function(){
		if($("#messageInput").val()) {
			var message = firebase.database().ref().child("message");
			message.set($("#messageInput").val());

		} else alert("Message cannot be empty!")

	})

	$("#makeBuzz").click(function(){
		if($("#buzzTimes").val() != 0) {
			var buzz = firebase.database().ref().child("buzz");
			buzz.set($("#buzzTimes").val());

		} else alert("Buzz times cannot be 0!")

	})
});