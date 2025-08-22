// Test script to verify the new configuration endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

// Mock access token for testing (replace with real token)
const ACCESS_TOKEN = 'your-test-token-here';

// Test configuration
const testConfig = {
  bootstrapServers: 'localhost:19092',
  ssl: false,
  saslMechanism: 'oauthbearer',
  clientId: 'test-client'
};

async function testEndpoints() {
  console.log('🧪 Testing Kafka Configuration Endpoints\n');

  try {
    // Test 1: Connection test
    console.log('1. Testing connection test endpoint...');
    try {
      const response = await axios.post(`${API_BASE}/api/kafka/test-connection`, {
        config: testConfig
      }, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Connection test endpoint working');
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('❌ Connection test failed:', error.response?.data || error.message);
    }

    console.log('\n');

    // Test 2: Topics with config
    console.log('2. Testing topics with config endpoint...');
    try {
      const response = await axios.post(`${API_BASE}/api/kafka/topics-with-config`, {
        config: testConfig
      }, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Topics with config endpoint working');
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('❌ Topics with config failed:', error.response?.data || error.message);
    }

    console.log('\n');

    // Test 3: Messages with config
    console.log('3. Testing messages with config endpoint...');
    try {
      const response = await axios.post(`${API_BASE}/api/kafka/topics-with-config/test-topic/messages?limit=10`, {
        config: testConfig
      }, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Messages with config endpoint working');
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('❌ Messages with config failed:', error.response?.data || error.message);
    }

    console.log('\n');

    // Test 4: Status endpoint (should work without auth)
    console.log('4. Testing status endpoint...');
    try {
      const response = await axios.get(`${API_BASE}/api/status`);
      console.log('✅ Status endpoint working');
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('❌ Status endpoint failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  console.log('📋 Make sure the demo client server is running on port 3001');
  console.log('📋 Update ACCESS_TOKEN variable with a valid Okta token for full testing\n');
  
  testEndpoints().then(() => {
    console.log('\n🏁 Test suite completed');
  }).catch(error => {
    console.error('💥 Test suite crashed:', error.message);
  });
}

module.exports = { testEndpoints };
