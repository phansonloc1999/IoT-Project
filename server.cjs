var five = require("johnny-five");
var admin = require("firebase-admin");
var serviceAccount = require("./iot-project-8037c-55228667761f.json");
var firebaseDb = require("firebase-admin/database");

var app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://iot-project-8037c-default-rtdb.asia-southeast1.firebasedatabase.app"
});

// Initialize Firebase
const db = firebaseDb.getDatabase(app);

var board = new five.Board({
    port: "COM4"
});

var firebaseDbRef = db.ref();

// hardware objects with states
var led1, led2, led3;
var led1State = 0, led2State = 0, led3State = 0;  // 0: off, 1: on

// reset firebase data
firebaseDbRef.update({ 'led1': led1State, 'led2': led2State, 'led3': led3State });

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
    firebaseDbRef.child('led1').on('value', function (snapshot) {
        changeLed(led1, snapshot.val(), 'led1');
    });

    firebaseDbRef.child('led2').on('value', function (snapshot) {
        changeLed(led2, snapshot.val(), 'led2');
    });

    firebaseDbRef.child('led3').on('value', function (snapshot) {
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

const express = require('express')
const webApp = express()
const port = 8080
webApp.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
})

webApp.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

webApp.get('/', (req, res) => {
    res.sendFile('public/index.html', { root: __dirname })
})

webApp.get('/server.cjs', (req, res) => {
    res.sendFile('./server.cjs', { root: __dirname })
})

webApp.get('/api/*/on', (req, res) => {
    var led = null
    switch (req.params[0]) {
        case 'led1':
            led = led1
            led1State = 1
            break;
        case 'led2':
            led2State = 1
            led = led2
            break;
        case 'led3':
            led3State = 1
            led = led3
            break;
        default:
            break;
    }
    changeLed(led, 1, req.params[0])
    firebaseDbRef.update({ 'led1': led1State, 'led2': led2State, 'led3': led3State });
    res.send()
})

webApp.get('/api/*/off', (req, res) => {
    var led = null
    switch (req.params[0]) {
        case 'led1':
            led = led1
            led1State = 0
            break;
        case 'led2':
            led = led2
            led2State = 0
            break;
        case 'led3':
            led = led3
            led3State = 0
            break;
        default:
            break;
    }
    changeLed(led, 0, req.params[0])
    firebaseDbRef.update({ 'led1': led1State, 'led2': led2State, 'led3': led3State });
    res.send()
})