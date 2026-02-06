const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET;
console.log('Using secret:', secret);

const token = jwt.sign({ id: 'test' }, secret, { expiresIn: '1h' });
console.log('Signed token:', token);

try {
    const decoded = jwt.verify(token, secret);
    console.log('Verified decoded:', decoded);
    console.log('SUCCESS: Sign and Verify match.');
} catch (error) {
    console.error('FAILURE:', error.message);
}
