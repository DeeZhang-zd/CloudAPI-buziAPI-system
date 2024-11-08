const bcrypt = require('bcryptjs');

const enteredPassword = 'newsecurepassword';
const storedHash = '$2a$08$k0ulbPz9vi1dqL/QzJkz.ugi4rRFKPimA4t0R0ZLkXrSBx5chjviS'; // The stored hash from your database

bcrypt.compare(enteredPassword, storedHash, (err, isMatch) => {
    if (err) {
        console.error('Error comparing passwords:', err);
    } else {
        console.log('Password comparison result:', isMatch);
    }
});
