const axios = require('axios');

async function createAdminUser() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Admin',
      lastName: 'User',
      idNumber: 'A1234567',
      username: 'admin',
      password: 'password123',
      role: 'superAdmin',
      phonenumber: '1234567890',
      email: 'admin@example.com'
    });
    console.log('User created:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    console.error('Full error object:', error);
  }
}

createAdminUser(); 