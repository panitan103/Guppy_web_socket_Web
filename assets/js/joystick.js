let ws; // WebSocket variable
let isConnected = false; // Track connection status

const heaveValue = document.getElementById('heaveValue');
const yawValue = document.getElementById('yawValue');
const surgeValue = document.getElementById('surgeValue');
const swayValue = document.getElementById('swayValue');

let heave = 0;
let yaw = 0;
let surge = 0;
let sway = 0;

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
            console.log('Received:', receivedData);
            const receivedMessage = `Roll: ${receivedData.msg.roll}, 
Pitch: ${receivedData.msg.pitch} 
Yaw: ${receivedData.msg.yaw}
Depth: ${receivedData.msg.depth}
Water: ${receivedData.msg.water}
Volt: ${receivedData.msg.volt}
Amp: ${receivedData.msg.amp}`;
            document.getElementById('receivedmessages').textContent = receivedMessage;
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
        const s1 = parseInt(document.getElementById('s1Input').value) || 0;
        const s2 = parseInt(document.getElementById('s2Input').value) || 0;
        const o1 = parseInt(document.getElementById('o1Input').value) || 0;
        const o2 = parseInt(document.getElementById('o2Input').value) || 0;
        const o3 = parseInt(document.getElementById('o3Input').value) || 0;
        const o4 = parseInt(document.getElementById('o4Input').value) || 0;

        const data = {
            op: "publish",
            topic: "/Guppy_Transmitted",
            msg: {
                heave: heave,
                yaw: yaw,
                surge: surge,
                sway: sway,
                s1: s1,
                s2: s2,
                o1: o1,
                o2: o2,
                o3: o3,
                o4: o4
            }
        };
        ws.send(JSON.stringify(data));
        const formattedValues = `Heave=${data.msg.heave}, Yaw=${data.msg.yaw}, Surge=${data.msg.surge}, Sway=${data.msg.sway}, S1=${s1}, S2=${s2}, O1=${o1}, O2=${o2}, O3=${o3}, O4=${o4}`;
        document.getElementById('sendmessages').textContent = `Sent: ${formattedValues}`;
    }
}

// Button click handlers
document.getElementById('heaveUp').onclick = () => {
    heave += 5; // Increment heave by 5
    heaveValue.textContent = heave;
    sendData(); // Send data on button click
};

document.getElementById('heaveDown').onclick = () => {
    heave -= 5; // Decrement heave by 5
    heaveValue.textContent = heave;
    sendData(); // Send data on button click
};

document.getElementById('yawLeft').onclick = () => {
    yaw -= 5; // Decrement yaw by 5
    yawValue.textContent = yaw;
    sendData(); // Send data on button click
};

document.getElementById('yawRight').onclick = () => {
    yaw += 5; // Increment yaw by 5
    yawValue.textContent = yaw;
    sendData(); // Send data on button click
};

document.getElementById('surgeUp').onclick = () => {
    surge += 5; // Increment surge by 5
    surgeValue.textContent = surge;
    sendData(); // Send data on button click
};

document.getElementById('surgeDown').onclick = () => {
    surge -= 5; // Decrement surge by 5
    surgeValue.textContent = surge;
    sendData(); // Send data on button click
};

document.getElementById('swayLeft').onclick = () => {
    sway -= 5; // Decrement sway by 5
    swayValue.textContent = sway;
    sendData(); // Send data on button click
};

document.getElementById('swayRight').onclick = () => {
    sway += 5; // Increment sway by 5
    swayValue.textContent = sway;
    sendData(); // Send data on button click
};

// Reset button handler
document.getElementById('resetButton').onclick = () => {
    heave = 0;
    yaw = 0;
    surge = 0;
    sway = 0;

    heaveValue.textContent = heave;
    yawValue.textContent = yaw;
    surgeValue.textContent = surge;
    swayValue.textContent = sway;

    // Reset the input fields
    document.getElementById('s1Input').value = 0;
    document.getElementById('s2Input').value = 0;
    document.getElementById('o1Input').value = 0;
    document.getElementById('o2Input').value = 0;
    document.getElementById('o3Input').value = 0;
    document.getElementById('o4Input').value = 0;

    sendData(); // Send data on reset
};

// Connect or disconnect WebSocket when the connect button is clicked
document.getElementById('connectButton').onclick = toggleWebSocket;
