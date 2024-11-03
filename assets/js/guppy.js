// Create a new WebSocket connection
const ws = new WebSocket('ws://10.0.0.112:9090');

// Handle connection opening
ws.onopen = () => {
    console.log('Connected to the WebSocket server.');
    document.getElementById('sendmessages').textContent += 'Connected to the WebSocket server.\n';
};

// Handle incoming messages
ws.onmessage = (event) => {
    const receivedData = JSON.parse(event.data);
    console.log('Received:', receivedData);

    // Create a formatted string for the received data
    const msg = receivedData.msg || {}; // Extract the message object safely
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

    // Update the received messages section to show only the latest message in a formatted manner
    document.getElementById('recievedmessages').textContent = `Received:\n${formattedReceivedData.trim()}\n`;
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

// Send data when the "Send Data" button is clicked
document.getElementById('sendButton').onclick = () => {
    // Retrieve values from input fields
    const msgData = {
        surge: parseInt(document.getElementById('surge').value) || 0,
        sway: parseInt(document.getElementById('sway').value) || 0,
        yaw: parseInt(document.getElementById('yaw').value) || 0,
        heave: parseInt(document.getElementById('heave').value) || 0,
        s1: parseInt(document.getElementById('s1').value) || 0,
        s2: parseInt(document.getElementById('s2').value) || 0,
        o1: parseInt(document.getElementById('o1').value) || 0,
        o2: parseInt(document.getElementById('o2').value) || 0,
        o3: parseInt(document.getElementById('o3').value) || 0,
        o4: parseInt(document.getElementById('o4').value) || 0
    };

    const data = {
        op: "publish",
        topic: "/Guppy_Transmitted",
        type: "guppy_interface/msg/GuppyDriverTransmitted",
        msg: msgData
    };
    const formattedSentData = `Surge=${msgData.surge}, Sway=${msgData.sway}, Yaw=${msgData.yaw}, Heave=${msgData.heave}, S1=${msgData.s1}, S2=${msgData.s2}, O1=${msgData.o1}, O2=${msgData.o2}, O3=${msgData.o3}, O4=${msgData.o4}`;

    // Send the data as a JSON string
    ws.send(JSON.stringify(data));
    console.log('Sent:', data);

    document.getElementById('sendmessages').textContent += `Sent: ${formattedSentData}\n`; // Update to show formatted values
};

// Subscribe to received data when the "Subscribe to Received Data" button is clicked
document.getElementById('recievedButton').onclick = () => {
    const data = {
        op: "subscribe",
        topic: "/Guppy_Received",
    };

    // Send the data as a JSON string
    ws.send(JSON.stringify(data));
    console.log('Sent subscription request:', data);
    document.getElementById('sendmessages').textContent += `Sent subscription request: ${JSON.stringify(data)}\n`;
};
