let ws; // WebSocket variable
let isConnected = false; // Track connection status
const leftJoystick = document.getElementById('leftJoystick');
const rightJoystick = document.getElementById('rightJoystick');
const leftStick = document.getElementById('leftStick');
const rightStick = document.getElementById('rightStick');

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
            //document.getElementById('sendmessages').textContent = 'Connected to the WebSocket server.\n';
            isConnected = true;

            // Automatically send data in real-time
            sendRealTimeData();

            // Subscribe to a topic
            const data = {
                op: "subscribe",
                topic: "/Guppy_Received",
            };
            ws.send(JSON.stringify(data));
            document.getElementById('connectButton').textContent = 'Disconnect';
        };

        // Handle incoming messages
        ws.onmessage = (event) => {
            const receivedData = JSON.parse(event.data);
            console.log('Received:', receivedData);

            // Process the received data as needed
            const msg = receivedData.msg || {};
            const formattedReceivedData = `
                Topic=${receivedData.topic || 'N/A'},
                Operation=${receivedData.op || 'N/A'},
                Roll=${msg.roll || 'N/A'},
                Pitch=${msg.pitch || 'N/A'},
                Yaw=${msg.yaw || 'N/A'},
                Depth=${msg.depth || 'N/A'},
                Amp=${msg.amp || 'N/A'},
                Volt=${msg.volt || 'N/A'}
            `;

            document.getElementById('receivedmessages').textContent = `Received: ${formattedReceivedData.trim()}\n`;
        };

        // Handle connection errors
        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            //document.getElementById('sendmessages').textContent += `Error: ${error.message}\n`;
        };

        // Handle connection closure
        ws.onclose = () => {
            console.log('WebSocket connection closed.');
            //document.getElementById('sendmessages').textContent += 'WebSocket connection closed.\n';
            isConnected = false;
            document.getElementById('connectButton').textContent = 'Connect WebSocket';
        };
    } else {
        ws.close(); // Close the WebSocket connection
    }
}

// Function to send data in real-time
function sendRealTimeData() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const data = {
            op: "publish",
            topic: "/Guppy_Transmitted",
            type: "guppy_interface/msg/GuppyDriverTransmitted",
            msg: {
                heave: heave,
                yaw: yaw,
                surge: surge,
                sway: sway,
                s1: parseInt(s1Input.value) || 0,
                s2: parseInt(s2Input.value) || 0,
                o1: parseInt(o1Input.value) || 0,
                o2: parseInt(o2Input.value) || 0,
                o3: parseInt(o3Input.value) || 0,
                o4: parseInt(o4Input.value) || 0
            }
        };

        ws.send(JSON.stringify(data));
        // Format the values for display
        const formattedValues = `Surge=${data.msg.surge}, Sway=${data.msg.sway}, Heave=${data.msg.heave}, Yaw=${data.msg.yaw}, S1=${data.msg.s1}, S2=${data.msg.s2}, O1=${data.msg.o1}, O2=${data.msg.o2}, O3=${data.msg.o3}, O4=${data.msg.o4}`;
    
        document.getElementById('sendmessages').textContent = `Sent: ${formattedValues}`;
    }

    // Continue sending data at a set interval
    requestAnimationFrame(sendRealTimeData);
}

// Function to update the joystick position and values
function updateJoystick(stick, event, joystick) {
    event.preventDefault(); // Prevent scrolling when touching

    const rect = joystick.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2; // Centering the joystick
    const offsetY = event.clientY - rect.top - rect.height / 2;  // Centering the joystick

    const maxDistance = rect.width / 2 - stick.offsetWidth / 2;

    // Limit movement within the joystick area
    const x = Math.max(-maxDistance, Math.min(maxDistance, offsetX));
    const y = Math.max(-maxDistance, Math.min(maxDistance, offsetY));

    stick.style.left = `${x + maxDistance}px`;  // Centering the stick
    stick.style.top = `${y + maxDistance}px`;    // Centering the stick

    if (joystick === leftJoystick) {
        // Calculate heave and yaw values based on joystick position
        heave = Math.round((-y / maxDistance) * 200); // Range -200 to 200
        yaw = Math.round((x / maxDistance) * 100); // Range -100 to 100
        heaveValue.textContent = heave;
        yawValue.textContent = yaw;
    } else if (joystick === rightJoystick) {
        // Calculate surge and sway values based on joystick position
        sway = Math.round((x / maxDistance) * 200); // Range -200 to 200
        surge = Math.round((-y / maxDistance) * 200); // Range -200 to 200
        surgeValue.textContent = surge;
        swayValue.textContent = sway;
    }
}

// Reset the stick position on mouse up
function resetStick(stick) {
    stick.style.left = '50%'; // Reset to center
    stick.style.top = '50%';  // Reset to center
}

// Handle mouse and touch events for left joystick
leftStick.onmousedown = (event) => {
    document.onmousemove = (e) => updateJoystick(leftStick, e, leftJoystick);
    document.onmouseup = () => {
        resetStick(leftStick);
        heave = 0; // Reset values on release
        yaw = 0;   // Reset values on release
        heaveValue.textContent = heave;
        yawValue.textContent = yaw;
        document.onmousemove = null;
        document.onmouseup = null;
    };
};

// Touch event handling for left joystick
leftJoystick.addEventListener('touchstart', (event) => {
    event.preventDefault(); // Prevent scrolling
    updateJoystick(leftStick, event.touches[0], leftJoystick);
    document.addEventListener('touchmove', (e) => updateJoystick(leftStick, e.touches[0], leftJoystick), { passive: false });
});
leftJoystick.addEventListener('touchend', () => {
    resetStick(leftStick);
    heave = 0; // Reset values on release
    yaw = 0;   // Reset values on release
    heaveValue.textContent = heave;
    yawValue.textContent = yaw;
    document.removeEventListener('touchmove', (e) => updateJoystick(leftStick, e.touches[0], leftJoystick));
});

// Handle mouse and touch events for right joystick
rightStick.onmousedown = (event) => {
    document.onmousemove = (e) => updateJoystick(rightStick, e, rightJoystick);
    document.onmouseup = () => {
        resetStick(rightStick);
        surge = 0; // Reset values on release
        sway = 0;  // Reset values on release
        surgeValue.textContent = surge;
        swayValue.textContent = sway;
        document.onmousemove = null;
        document.onmouseup = null;
    };
};

// Touch event handling for right joystick
rightJoystick.addEventListener('touchstart', (event) => {
    event.preventDefault(); // Prevent scrolling
    updateJoystick(rightStick, event.touches[0], rightJoystick);
    document.addEventListener('touchmove', (e) => updateJoystick(rightStick, e.touches[0], rightJoystick), { passive: false });
});
rightJoystick.addEventListener('touchend', () => {
    resetStick(rightStick);
    surge = 0; // Reset values on release
    sway = 0;  // Reset values on release
    surgeValue.textContent = surge;
    swayValue.textContent = sway;
    document.removeEventListener('touchmove', (e) => updateJoystick(rightStick, e.touches[0], rightJoystick));
});

// Connect or disconnect WebSocket when the connect button is clicked
document.getElementById('connectButton').onclick = toggleWebSocket;
function toggleWebSocket() {
    const url = document.getElementById('wsUrl').value;

    if (!isConnected) {
        ws = new WebSocket(url);

        // Handle connection opening
        ws.onopen = () => {
            console.log('Connected to the WebSocket server.');
            //document.getElementById('sendmessages').textContent = 'Connected to the WebSocket server.\n';
            isConnected = true;

            // Change LED to on
            document.getElementById('ledIndicator').classList.remove('led-off');
            document.getElementById('ledIndicator').classList.add('led-on');

            // Automatically send data in real-time
            sendRealTimeData();

            // Subscribe to a topic
            const data = {
                op: "subscribe",
                topic: "/Guppy_Received",
            };
            ws.send(JSON.stringify(data));
            document.getElementById('connectButton').textContent = 'Disconnect';
        };

        // Handle incoming messages
        ws.onmessage = (event) => {
            const receivedData = JSON.parse(event.data);
            console.log('Received:', receivedData);

            // Process the received data as needed
            const msg = receivedData.msg || {};
            const formattedReceivedData = `
                Topic=${receivedData.topic || 'N/A'},
                Operation=${receivedData.op || 'N/A'},
                Roll=${msg.roll || 'N/A'},
                Pitch=${msg.pitch || 'N/A'},
                Yaw=${msg.yaw || 'N/A'},
                Depth=${msg.depth || 'N/A'},
                Amp=${msg.amp || 'N/A'},
                Volt=${msg.volt || 'N/A'}
            `;

            document.getElementById('receivedmessages').textContent = `Received: ${formattedReceivedData.trim()}\n`;
        };

        // Handle connection errors
        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            document.getElementById('sendmessages').textContent += `Error: ${error.message}\n`;
        };

        // Handle connection closure
        ws.onclose = () => {
            console.log('WebSocket connection closed.');
            //document.getElementById('sendmessages').textContent += 'WebSocket connection closed.\n';
            isConnected = false;

            // Change LED to off
            document.getElementById('ledIndicator').classList.remove('led-on');
            document.getElementById('ledIndicator').classList.add('led-off');

            document.getElementById('connectButton').textContent = 'Connect WebSocket';
        };
    } else {
        ws.close(); // Close the WebSocket connection
    }
}
