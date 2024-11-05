var surge_value =0 ;
var sway_value =0;
var yaw_value =0;
var heave_value =0;
let isConnected = false; // Track connection status
let ws; // WebSocket variable
function rotateCompass(degrees) {
    document.documentElement.style.setProperty('--rotation-angle', degrees -45 + 'deg');
  }
function setGaugeValue(value, element, min = -200, max = 200) {
// Limit the value to the -400 to 400 range
value = Math.max(min, Math.min(max, value));

// Map value (-400 to 400) to degrees (-90 to 90)
let degrees = ((value + max) / (max*2)) * 180 - 90;
document.documentElement.style.setProperty(element, degrees + 'deg');
}

var joy_parameter={
    internalLineWidth : 5,
    internalFillColor: '#FF7058',
    internalStrokeColor : '#AAAAAA',
    externalStrokeColor : '#AAAAAA',
    externalLineWidth :     7,
    };
var Joy1 = new JoyStick('joy1Div', joy_parameter, function(stickData) {
    // console.log(stickData.xPosition);
    // console.log(stickData.yPosition);
    // console.log(stickData.cardinalDirection);
    // console.log(stickData.x);
    // console.log(stickData.y);
    yaw_value=stickData.x*2;
    heave_value=stickData.y*2;
    

    if(yaw_value > 200){
        // document.getElementById("yaw-value-out").value=200;
        yaw_value=200;
    }else if(yaw_value < -200){
        // document.getElementById("yaw-value-out").value=-200;
        yaw_value=-200;

    }else{
        // document.getElementById("yaw-value-out").value = yaw_value;
    }

    if(heave_value > 200){
        // document.getElementById("heave-value").value=200;
        heave_value=200;
    }else if(heave_value < -200){
        // document.getElementById("heave-value").value=-200;
        heave_value=-200;

    }else{
        // document.getElementById("heave-value").value = heave_value;
    }
    setGaugeValue(yaw_value,"--pointer-rotation-yaw"),min=-100,max=100;
    setGaugeValue(heave_value,"--pointer-rotation-heave");
    sendData();
});

var Joy2 = new JoyStick('joy2Div',joy_parameter, function(stickData) {
    // console.log(stickData.xPosition);
    // console.log(stickData.yPosition);
    // console.log(stickData.cardinalDirection);
    // console.log(stickData.x);
    // console.log(stickData.y);

    sway_value=stickData.x*2;
    surge_value=stickData.y*2;

    if(sway_value > 200){
        // document.getElementById("sway-value").value=200;
        sway_value=200;
    }else if(sway_value < -200){
        // document.getElementById("sway-value").value=-200;
        sway_value=-200;

    }else{
        // document.getElementById("sway-value").value = sway_value;
    }

    if(surge_value > 200){
        // document.getElementById("surge-value").value=200;
        surge_value=200;

    }else if(surge_value < -200){
        // document.getElementById("surge-value").value=-200;
        surge_value=-200;

    }else{
        // document.getElementById("surge-value").value = surge_value;
    }
    setGaugeValue(surge_value,"--pointer-rotation-surge");
    setGaugeValue(sway_value,"--pointer-rotation-sway");
    sendData();
});


// Function to connect or disconnect from the WebSocket server
function toggleWebSocket() {
    const url = document.getElementById('wsUrl').value;

    if (!isConnected) {
        ws = new WebSocket(url);

        // Handle connection opening
        ws.onopen = () => {
            console.log('Connected to the WebSocket server.');
            isConnected = true;
            document.getElementById('connectButton').textContent = 'Disconnect';
            document.getElementById('ledIndicator').classList.remove('led-off');
            document.getElementById('ledIndicator').classList.add('led-on');
        
            const data = {
                op: "subscribe",
                topic: "/Guppy_Received",
            };
            ws.send(JSON.stringify(data));
        };

        // Handle incoming messages
        ws.onmessage = (event) => {
            const receivedData = JSON.parse(event.data);
            // console.log('Received:', receivedData);

            // document.getElementById('receivedmessages').textContent = receivedMessage;
            // document.getElementById('roll-value').value = receivedData.msg.roll;
            // document.getElementById('pitch-value').value = receivedData.msg.pitch;
            // document.getElementById('yaw-value-in').value = receivedData.msg.yaw;
            // document.getElementById('depth-value').value = receivedData.msg.depth;
            // document.getElementById('water-value').value = receivedData.msg.water;
            // document.getElementById('volt-value').value = receivedData.msg.volt;
            // document.getElementById('amp-value').value = receivedData.msg.amp;
            rotateCompass(receivedData.msg.yaw);

        };

        // Handle connection closure
        ws.onclose = () => {
            console.log('WebSocket connection closed.');
            isConnected = false;
            document.getElementById('connectButton').textContent = 'Connect';
            document.getElementById('ledIndicator').classList.remove('led-on');
            document.getElementById('ledIndicator').classList.add('led-off');
        };
    } else {
        ws.close(); // Close the WebSocket connection
    }
}
// Function to send data to the server
function sendData() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        // const s1 = parseInt(document.getElementById('s1Input').value) || 0;
        // const s2 = parseInt(document.getElementById('s2Input').value) || 0;
        // const o1 = parseInt(document.getElementById('o1Input').value) || 0;
        // const o2 = parseInt(document.getElementById('o2Input').value) || 0;
        // const o3 = parseInt(document.getElementById('o3Input').value) || 0;
        // const o4 = parseInt(document.getElementById('o4Input').value) || 0;

        const data = {
            op: "publish",
            topic: "/Guppy_Transmitted",
            msg: {
                heave: heave_value,
                yaw: yaw_value,
                surge: surge_value,
                sway: sway_value,
                s1: s1,
                s2: s2,
                o1: o1,
                o2: o2,
                o3: o3,
                o4: o4
            }
        };
        ws.send(JSON.stringify(data));
        // const formattedValues = `Heave=${data.msg.heave}, Yaw=${data.msg.yaw}, Surge=${data.msg.surge}, Sway=${data.msg.sway}, S1=${s1}, S2=${s2}, O1=${o1}, O2=${o2}, O3=${o3}, O4=${o4}`;
        // document.getElementById('sendmessages').textContent = `Sent: ${formattedValues}`;
    }
}
document.getElementById('connectButton').onclick = toggleWebSocket;

// JavaScript function to rotate the compass

