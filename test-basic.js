console.log('Test starting');

try {
    console.log('1. Loading dotenv');
    require('dotenv').config();
    console.log('2. Loading express');
    const express = require('express');
    console.log('3. Creating app');
    const app = express();
    console.log('4. Starting server');
    app.listen(3005, () => {
        console.log('5. Server running');
    });
} catch (error) {
    console.error('Error:', error);
}
