//Firebase configurations to connect the realtime database to the web applciation
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

// Initializing Firebase
firebase.initializeApp(firebaseConfig);

//jQuery waiting for the document to be ready
$(document).ready(function(){
    var database = firebase.database();

	//creating global variable with initial values
	var humidity = 0;
	var temp = 0;
	var light = 900;

	//starting communication with Firebase
	database.ref().on("value", function(snap){
		humidity = snap.val().humidity;   //writing humidity to database
		temp = snap.val().temperature;    //writing temperature to database
		light = snap.val().light;         //writing light level to database

		window.feed = function(callback) {
			var tick = {};
			tick.plot0 = Math.ceil(350 + (Math.random() * 500));
			callback(JSON.stringify(tick));
		};

		//using JavaScript plugin called Zingchart for plotting gauge charts
		
		//creating  configurations for a new gauge to display TEMPERATURE
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
				text: '%v',
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
			  values: [temp], // temperature value that comes from Firebase
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
		   
		//creating  configurations for a new gauge to display HUMIDITY
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
			  values: [parseInt(humidity)], // humidity value that comes from Firebase
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
		   
		//creating  configurations for a new gauge to display LIGHT LEVEL
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
			  values: [light], // light level value that comes from Firebase
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

		//renderring three gauge charts with configurations above
		zingchart.render({
			id: 'temp',
			data: myTemperature,
			height: 500,
			width: '100%'
		});
		   
		zingchart.render({
			id: 'light',
			data: myLight,
			height: 500,
			width: '100%'
		});

		zingchart.render({
			id: 'humidity',
			data: myHumidity,
			height: 500,
			width: '100%'
		});
	});


	//opening window function
    $("#openWindow").click(function(){ //when button clicked
		var windowW = firebase.database().ref().child("window"); //
		windowW.set("1"); //setting window to 1 which represents OPEN
	})

	//closing window function
	$("#closeWindow").click(function(){ //when button clicked
		var windowW = firebase.database().ref().child("window");
		windowW.set("0"); //setting window to 0 which represents CLOSED
	})

	//turning LED on function
	$("#turnLightOn").click(function(){ //when button clicked
		var light = firebase.database().ref().child("LED");
		light.set("1"); //setting LED to 1 which represents ON
	})

	//turning LED off function
	$("#turnLightOff").click(function(){ //when button clicked
		var light = firebase.database().ref().child("LED");
		light.set("0"); //setting LED to 0 which represents OFF
	})

	//sending message function
	$("#sendMessage").click(function(){ //when button clicked
		if($("#messageInput").val()) { //if message is not empty
			var message = firebase.database().ref().child("message");
			//setting message to inserted message which will be displayed on LCD
			message.set($("#messageInput").val());

		} else alert("Message cannot be empty!") //send alert if empty

	})

	//sending buzz function
	$("#makeBuzz").click(function(){ //when button clicked
		if($("#buzzTimes").val() != 0) { //if buzz number is not 0
			var buzz = firebase.database().ref().child("buzz");
			//setting buzz to inserted number which makes the buzzer buzz as many times as requested
			buzz.set($("#buzzTimes").val());
		} else alert("Buzz times cannot be 0!") //send alert if 0
	})
});