const socket = io();

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  
  const response = await fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.text();
  alert(result);
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.text();
  alert(result);
});

document.getElementById('file-transfer-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];

  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = () => {
    const arrayBuffer = reader.result;
    const buffer = new Uint8Array(arrayBuffer);
    socket.emit('file-upload', { name: file.name, buffer });

    document.getElementById('status').innerText = 'File uploaded successfully!';
  };
});

socket.on('file-transfer', (file) => {
  const progressBar = document.getElementById('progress');
  let receivedBuffer = new Uint8Array();

  progressBar.style.width = '0%';
  document.getElementById('status').innerText = 'Receiving file...';

  socket.on('file-chunk', (chunk) => {
    receivedBuffer = new Uint8Array([...receivedBuffer, ...chunk.buffer]);
    const progress = (receivedBuffer.length / file.size) * 100;
    progressBar.style.width = `${progress}%`;

    if (receivedBuffer.length === file.size) {
      document.getElementById('status').innerText = 'File received successfully!';
      const blob = new Blob([receivedBuffer]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
    }
  });
});
