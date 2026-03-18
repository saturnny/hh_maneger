const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@qualificados.com',
        password: 'Admin@123'
      })
    });

    const result = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};

testLogin();
