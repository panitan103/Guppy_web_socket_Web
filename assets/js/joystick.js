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

    // Handle connection opening
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

    // Handle incoming messages
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

    // Handle connection errors
    ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        document.getElementById('sendmessages').textContent += `Error: ${error.message}\n`;
    };

    // Handle connection closure
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
    const offsetX = event.clientX !== undefined ? event.clientX - rect.left - rect.width / 2 : event.touches[0].clientX - rect.left - rect.width / 2; // Centering the joystick
    const offsetY = event.clientY !== undefined ? event.clientY - rect.top - rect.height / 2 : event.touches[0].clientY - rect.top - rect.height / 2;  // Centering the joystick

    const maxDistance = rect.width / 2 - stick.offsetWidth / 2;

    const x = Math.max(-maxDistance, Math.min(maxDistance, offsetX));
    const y = Math.max(-maxDistance, Math.min(maxDistance, offsetY));

    stick.style.left = `${x + maxDistance}px`;  // Centering the stick
    stick.style.top = `${y + maxDistance}px`;    // Centering the stick

    if (joystick === leftJoystick) {
        heave = Math.round((-y / maxDistance) * 200); // Range -200 to 200
        yaw = Math.round((x / maxDistance) * 100); // Range -100 to 100
        heaveValue.textContent = heave;
        yawValue.textContent = yaw;
    } else if (joystick === rightJoystick) {
        sway = Math.round((x / maxDistance) * 200); // Range -200 to 200
        surge = Math.round((-y / maxDistance) * 200); // Range -200 to 200
        surgeValue.textContent = surge;
        swayValue.textContent = sway;
    }
}

// Reset the stick position on mouse/touch end
function resetStick(stick) {
    stick.style.left = '50%'; // Reset to center
    stick.style.top = '50%';  // Reset to center
}

// Function to handle start of dragging
function startDragging(stick, joystick, event) {
    event.preventDefault(); // Prevent default touch behavior
    document.onmousemove = (e) => updateJoystick(stick, e, joystick);
    document.onmouseup = () => {
        resetStick(stick);
        heave = 0; // Reset values on release
        yaw = 0;   // Reset values on release
        heaveValue.textContent = heave;
        yawValue.textContent = yaw;
        cleanup();
    };

    document.ontouchmove = (e) => updateJoystick(stick, e, joystick);
    document.ontouchend = () => {
        resetStick(stick);
        heave = 0; // Reset values on release
        yaw = 0;   // Reset values on release
        heaveValue.textContent = heave;
        yawValue.textContent = yaw;
        cleanup();
    };
}

// Function to clean up event handlers
function cleanup() {
    document.onmousemove = null;
    document.onmouseup = null;
    document.ontouchmove = null;
    document.ontouchend = null;
}

// Handle mouse events for left joystick
leftStick.onmousedown = (event) => startDragging(leftStick, leftJoystick, event);

// Handle touch events for left joystick
leftStick.ontouchstart = (event) => startDragging(leftStick, leftJoystick, event);

// Handle mouse events for right joystick
rightStick.onmousedown = (event) => startDragging(rightStick, rightJoystick, event);

// Handle touch events for right joystick
rightStick.ontouchstart = (event) => startDragging(rightStick, rightJoystick, event);

// Connect WebSocket when the connect button is clicked
document.getElementById('connectButton').onclick = connectWebSocket;
