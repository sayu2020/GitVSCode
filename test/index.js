const { spawn } = require('child_process');

// Call the Python script using spawn
const pythonProcess = spawn('python', ['example.py', 'Hello from JavaScript']);

pythonProcess.stdout.on('data', (data) => {
    console.log(`Python Output: ${data.toString()}`);
});

pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data.toString()}`);
});

pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
});
