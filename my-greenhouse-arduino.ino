#include <Arduino.h>
#if defined(ESP32)
#include <WiFi.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#endif
#include <FirebaseESP8266.h>
#include "addons/TokenHelper.h" //Provide the token generation process info.
#include "addons/RTDBHelper.h" //Provide the RTDB payload printing info and other helper functions.

//ESP Wi-Fi Settings
#define WIFI_SSID "Hassan"
#define WIFI_PASSWORD "KHASANBOY"

//Firebase Settings
#define API_KEY "AIzaSyAdw2vd-PlfxyFJdPaslCx_TlQigTrOl_0" //API key of Firebase realtime database
#define DATABASE_URL "greenhouse-i-default-rtdb.firebaseio.com" //URL of Firebase realtime database
FirebaseData fbdo; //creating an instance of Firebase class
FirebaseData status;
FirebaseAuth auth;
FirebaseConfig config;
bool signupOK = false;

//DHT Settings
#include "DHT.h"
#define DHTPIN D4 //setting DHT pin
#define DHTTYPE DHT11 //setting DHT type
DHT dht(DHTPIN, DHTTYPE);

//LCD I2C Settings
#include <Wire.h>               
#include <LiquidCrystal_I2C.h>  
LiquidCrystal_I2C lcd(0x27,16,2); //creating a new instance of LCD with 16x2 size


//Micro Servo Settings
#include <Servo.h>
Servo myservo;

//Light Sensor Settings
const int ldrPin = A0; //analog input from light sensor

//LED Settings
const int ledPin = D5;
const int htrPin = D6; //as replacement for heater
const int hmfPin = D7; //as replacement for humidifier
const int cldPin = D8; //network controled led


//Buzzer Settings
const int buzPin = D3;

//defining global variables with default values
float humidity, temp; //from DHT
const float minHumidity = 60.00; //approximate figures
const float maxHumidity = 80.00;
const float minTemp = 27.00;
const float maxTemp = 30.00;

int lightLevel; //from LDR


//creating boolean variables to store the state of particular actions to avoid the buzzer repeating in loop
bool ledWasOn = false;
bool htrWasOn = false;
bool hmfWasOn = false;

void setup(){
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD); //connecting to wi fi
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED){
    //until it gets connected
    Serial.print(".");
    delay(300);
  }
  //after it is connected
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP()); //printing IP address
  Serial.println();

  config.api_key = API_KEY; //ssigning the api key
  config.database_url = DATABASE_URL; //assigning the RTDB URL

  //signing up
  if (Firebase.signUp(&config, &auth, "", "")){
    Serial.println("SUCCESSFULLY SIGNED UP TO THE DATABASE");
    signupOK = true;
  }
  else{
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  //assigning the callback function for the long running token generation task
  config.token_status_callback = tokenStatusCallback;
  
  Firebase.begin(&config, &auth); //beginning communication with Firebase
  Firebase.reconnectWiFi(true);

  //starting sensors and actuators
  lcd.init(); //starting LCD
  lcd.backlight();           
  dht.begin(); //starting DHT
  myservo.attach(D0); //starting Micro Servo Motor

  //setting pin modes
  pinMode(ldrPin, INPUT);
  pinMode(ledPin, OUTPUT);
  pinMode(htrPin, OUTPUT);
  pinMode(hmfPin, OUTPUT);
  pinMode(cldPin, OUTPUT);
  pinMode(buzPin, OUTPUT);
}

void loop(){
 
  readFromSensors(); //setting temperature

  printToLCD(); //printing measured metrics to LCD
  
  //Light Control
  if (lightLevel >= 900) //if dark
  {
    digitalWrite(ledPin, HIGH); //turn LED on

    if(!ledWasOn) { //if led was not already on
      alert(1, 2); //buzz
    }

    ledWasOn = true;
  }
  else //if bright
  {
    digitalWrite(ledPin, LOW); //turn led off

    if(ledWasOn) { //if led was not already off
      alert(1, 1); //buzz
    }

    ledWasOn = false;

  }

  //Temperature Control
  if (temp > maxTemp)
  {
    //TURN HEATER OFF
    digitalWrite(htrPin, LOW); //trun LED off (in place of heater)

    if(htrWasOn) {
      alert(2, 1);
    }

    htrWasOn = false;
  }
  else if (temp < minTemp)
  {
    //TURN HEATER ON
    digitalWrite(htrPin, HIGH); //trun LED on (in place of heater)

    if(!htrWasOn) {
      alert(2, 2);
    }

    htrWasOn = true;
  }

  //Humidity Control
  if (humidity > maxHumidity)
  {
    myservo.write(0); //open window (servo motor)
    //TURN HUMIDIFIER OFF
    digitalWrite(hmfPin, LOW); //trun LED off (in place of humidifier)

    if(hmfWasOn) {
      alert(3, 1);
    }

    hmfWasOn = false;
  }
  else if (humidity < minHumidity)
  {
    myservo.write(180); //close window (servo motor)
    //TURN HUMIDIFIER ON
     digitalWrite(hmfPin, HIGH); //trun LED on (in place of humidifier)

    if(!hmfWasOn) {
      alert(3, 2);
    }

    hmfWasOn = true;
  }
  
  //working with Firebase
  if (Firebase.ready() && signupOK) { //checking if authenticated
    
    //trying to send data to database
    if (Firebase.setFloat(fbdo, "humidity",humidity) && Firebase.setFloat(fbdo, "temperature", temp) && Firebase.setFloat(fbdo, "light", lightLevel)){
      Serial.print("Humidity: "); //printing humidity if sent succesfully
      Serial.print(humidity);
      Serial.print("  |  ");
      Serial.print("Temperature: "); //printing humidity if sent succesfully
      Serial.print(temp);
      Serial.print("  |  ");
      Serial.print("Light Level: "); //printing humidity if sent succesfully
      Serial.println(lightLevel);

    }
    //catching exception in case of error
    else { 
      Serial.println("FAILED WRITING METRICS TO THE DATABASE");
      Serial.println("REASON: " + fbdo.errorReason());
    }
  }

  //getting LED data
  if (Firebase.getInt(status, "/LED")) { 
    if (status.stringData()=="1") {
      digitalWrite(cldPin, HIGH); //turnig LED on if it is 1
    }
    else {
      digitalWrite(cldPin, LOW); //turnig LED off if it is not 1
    }
  }
  //catching exception in case of error
  else {
      Serial.println("FAILED READING LED");
      Serial.println("REASON: " + status.errorReason());
  }
  
  //getting Window data
  if (Firebase.getInt(status, "/window")) {
    if (status.stringData()=="1") {
      myservo.write(0); //opening window if 1
    }
    else {
      myservo.write(180); //closing window if not 1
    }
  }
  //catching exception in case of error
  else {
      Serial.println("FAILED READING WINDOW");
      Serial.println("REASON: " + status.errorReason());
  }

  //getting Buzz data
  if (Firebase.getInt(status, "/buzz")) {
      if(status.stringData().toInt() > 0) {
        alert(0, status.stringData().toInt()); //buzzing as many times as requested
      
        if(Firebase.setInt(status, "/buzz", 0)) { //seeting buzz data back to 0
          Serial.println("Buzz has been reset to 0");
        }
        //catching exception in case of error
        else {
          Serial.println("FAILED WRITING BUZZ");
          Serial.println("REASON: " + status.errorReason());
        }
      }
  }
  //catching exception in case of error
  else {
      Serial.println("FAILED READING BUZZ");
      Serial.println("REASON: " + status.errorReason());
  }

  //getting Message data
  if (Firebase.getString(status, "/message")) {
      printMessage(status.stringData()); //printing message to LCD using custom function below
  }
  //catching exception in case of error
  else {
      Serial.println("FAILED READING MESSAGE");
      Serial.println("REASON: " + status.errorReason());
  }
    
}

//function that resets the humidity and temperature variables in the interval specified above
void readFromSensors() {
  humidity = dht.readHumidity();      //set humidity
  temp = dht.readTemperature(false);  //set temperature in celcius

  //setting humidity and temperature to 0 if DHT does not return any value
  if (isnan(humidity) || isnan(temp)) {
      humidity=0;
      temp=0;
      Serial.println("Failed to read from DHT sensor!");
      return;
  }

  lightLevel = analogRead(ldrPin); //set light
}

//function that displays metrics on LCD
void printToLCD() {
  String hs="Humidity:   "+String((int)humidity)+" % "; //creating temp line
  String ts="Temp:       "+String((int)temp)+char(223)+"C "; //creating humidity line
  lcd.setCursor(0, 0); //setting cursor to the first line
  lcd.print(hs); //writing humidity
  lcd.setCursor(0, 1); //setting cursor to the second line
  lcd.print(ts); //writing temperature
}

//function that displays message from Firebase
void printMessage(String message) {
  lcd.setCursor(0, 1); //setting cursor to the second line
  String metrics="H: " + String((int)humidity) + "%   T: " + String((int)temp) + char(223) + "C";
  lcd.print(metrics); //displaying metrics in shortened version in 1 line

  //creating scroll effect for LCD to display long text
  for (int i=0; i < 16; i++) {
    message = " " + message;  
  } 
  message = message + " "; 
  for (int position = 0; position < message.length(); position++) {
    lcd.setCursor(0, 0); //setting cursor to the first line
    lcd.print(message.substring(position, position + 16)); //displaying message in the first line with scroll effect
    delay(300);
  }
}

//function that alerts about recent action through buzzer
void alert(int actuatorId, int buzNum) {
  //this function helps to notify of recent actions using the buzz numbers
  //number of first group of buzzings identify the device
  //1x - light source (yellow), 2x - heater (red), 3x - humidifier (blue)
  //number of second group of buzzings identify the action
  //1x - turning off, 2x - turning on
  //E.g. (2xbuzz) + (1xbuzz) = HEATER has been turned OFF

  for(int i=1; i<=actuatorId; i++) {
    digitalWrite(buzPin, HIGH);
    delay(200);
    digitalWrite(buzPin, LOW);
    delay(100);
  }

  delay(500);
  
  for(int i=1; i<=buzNum; i++) {
    digitalWrite(buzPin, HIGH);
    delay(200);
    digitalWrite(buzPin, LOW);
    delay(100);
  }

  delay(1000);
}
