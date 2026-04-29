const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

(async () => {
  try {
    const base = 'http://localhost:3007/api/v1';

    // register
    try {
      await axios.post(`${base}/auth/register`, {
        email: 'devtest+1@example.com',
        username: 'devtest1',
        password: 'Password123!',
        name: 'Dev',
        surname: 'Tester',
        phone: '123456'
      });
      console.log('registered');
    } catch (e) {
      console.log('register error (may already exist):', e.response ? e.response.data : e.message);
    }

    // login
    const loginRes = await axios.post(`${base}/auth/login`, { emailOrUsername: 'devtest1', password: 'Password123!' });
    const token = loginRes.data.token;
    console.log('token:', token);

    // upload avatar via PUT
    const form = new FormData();
    form.append('profilePicture', fs.createReadStream('ms-react/src/assets/img/Icono.png'));

    const putRes = await axios.put(`${base}/auth/profile/avatar`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` },
    });

    console.log('PUT upload response:', putRes.data);
  } catch (err) {
    console.error('error:', err.response ? err.response.status : err.message);
    if (err.response) console.error(err.response.data);
  }
})();
