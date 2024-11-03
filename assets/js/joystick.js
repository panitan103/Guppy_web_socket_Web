let ws; // WebSocket variable
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

// Function to connect to the WebSocket server
function connectWebSocket() {
    const url = document.getElementById('wsUrl').value;
    ws = new WebSocket(url);

    ws.onopen = () => {
        console.log('Connected to the WebSocket server.');
        document.getElementById('sendmessages').textContent = 'Connected to the WebSocket server.\n';
        
        // Send subscription data
        const data = {
            op: "subscribe",
            topic: "/Guppy_Received",
        };
        ws.send(JSON.stringify(data));
        
        // Automatically send data in real-time
        sendRealTimeData();
    };

    ws.onmessage = (event) => {
        const receivedData = JSON.parse(event.data);
        console.log('Received:', receivedData);

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
        
        document.getElementById('receivedmessages').textContent += `Received: ${formattedReceivedData.trim()}\n`;
    };

    ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        document.getElementById('sendmessages').textContent += `Error: ${error.message}\n`;
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed.');
        document.getElementById('sendmessages').textContent += 'WebSocket connection closed.\n';
    };
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
        const formattedValues = `Surge=${data.msg.surge}, Sway=${data.msg.sway}, Heave=${data.msg.heave}, Yaw=${data.msg.yaw}, S1=${data.msg.s1}, S2=${data.msg.s2}, O1=${data.msg.o1}, O2=${data.msg.o2}, O3=${data.msg.o3}, O4=${data.msg.o4}`;
    
        document.getElementById('sendmessages').textContent = `Sent: ${formattedValues}`;
    }

    requestAnimationFrame(sendRealTimeData);
}

// Function to update the joystick position and values
function updateJoystick(stick, event, joystick) {
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

// Reset the stick position on pointer up
function resetStick(stick) {
    stick.style.left = '50%'; // Reset to center
    stick.style.top = '50%';  // Reset to center
}

// Handle pointer events for left joystick
leftStick.addEventListener('pointerdown', (event) => {
    document.addEventListener('pointermove', (e) => updateJoystick(leftStick, e, leftJoystick));
    document.addEventListener('pointerup', () => {
        resetStick(leftStick);
        heave = 0; // Reset values on release
        yaw = 0;   // Reset values on release
        heaveValue.textContent = heave;
        yawValue.textContent = yaw;
        document.removeEventListener('pointermove', updateJoystick);
        document.removeEventListener('pointerup', resetStick);
    });
});

// Handle pointer events for right joystick
rightStick.addEventListener('pointerdown', (event) => {
    document.addEventListener('pointermove', (e) => updateJoystick(rightStick, e, rightJoystick));
    document.addEventListener('pointerup', () => {
        resetStick(rightStick);
        surge = 0; // Reset values on release
        sway = 0;  // Reset values on release
        surgeValue.textContent = surge;
        swayValue.textContent = sway;
        document.removeEventListener('pointermove', updateJoystick);
        document.removeEventListener('pointerup', resetStick);
    });
});

// Connect WebSocket when the connect button is clicked
document.getElementById('connectButton').onclick = connectWebSocket;
