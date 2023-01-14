var five = require("johnny-five");

var admin = require("firebase-admin");

var serviceAccount = require("./iot-project-8037c-firebase-adminsdk-ui916-d0f44acec8.json");

var app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://iot-project-8037c-default-rtdb.asia-southeast1.firebasedatabase.app"
});

var database = require("firebase-admin/database");

// Initialize Firebase
const db = database.getDatabase(app);

// init
var board = new five.Board();
var ardxRef = db.ref();

// hardware objects with states
var led1, led2, led3;
var led1State = 0, led2State = 0, led3State = 0;  // 0: off, 1: on

// reset firebase data
ardxRef.update({ 'led1': led1State, 'led2': led2State, 'led3': led3State });

/**
 * called on board is ready
 * 1. init leds
 * 2. reset led states to off
 * 3. register firebase event
 * */
board.on("ready", function () {
    led1 = new five.Led(7);
    led2 = new five.Led(9);
    led3 = new five.Led(10);

    led1.stop().off();
    led2.stop().off();
    led3.stop().off();

    listenEvent();

});

/**
 * register firebase events (node change)
 * */
var listenEvent = function () {
    ardxRef.child('led1').on('value', function (snapshot) {
        changeLed(led1, snapshot.val(), 'led1');
    });

    ardxRef.child('led2').on('value', function (snapshot) {
        changeLed(led2, snapshot.val(), 'led2');
    });

    ardxRef.child('led3').on('value', function (snapshot) {
        changeLed(led3, snapshot.val(), 'led3');
    });
};

/**
 * change led state
 * @param led: which led
 * @param value: 0: off, 1: on
 * @param tag: name of led
 * */
var changeLed = function (led, value, tag) {
    switch (value) {
        case 0:
            led.stop().off();
            console.log(tag + " off");
            break;
        default:
            led.on();
            console.log(tag + " on");
            break;
    }
};