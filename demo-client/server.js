require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Kafka, logLevel } = require('kafkajs');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Helper function to extract Bearer token from Authorization header
const extractBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

// Kafka configuration function
function createKafkaClient(accessToken) {
  const bootstrapServers = process.env.KAFKA_BOOTSTRAP || 'localhost:19092';

  return new Kafka({
    clientId: 'knep-demo-client',
    brokers: bootstrapServers.split(','),
    logLevel: logLevel.ERROR,
    ssl: false,
    sasl: {
      mechanism: 'oauthbearer',
      oauthBearerProvider: async () => {
        return {
          value: accessToken,
        };
      },
    },
  });
}

async function listKafkaTopics(accessToken) {
  const kafka = createKafkaClient(accessToken);
  const admin = kafka.admin();

  try {
    await admin.connect();
    const topics = await admin.listTopics();
    return topics;
  } finally {
    await admin.disconnect();
  }
}

async function getTopicMessages(accessToken, topicName, maxMessages = 50) {
  const kafka = createKafkaClient(accessToken);
  const consumer = kafka.consumer({ groupId: `web-consumer-${Date.now()}` });

  try {
    await consumer.connect();
    await consumer.subscribe({ topic: topicName, fromBeginning: true });

    const messages = [];
    let messageCount = 0;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve(messages);
      }, 5000); // 5 second timeout

      consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          if (messageCount >= maxMessages) {
            clearTimeout(timeout);
            resolve(messages);
            return;
          }

          messages.push({
            topic,
            partition,
            offset: message.offset,
            timestamp: message.timestamp,
            key: message.key ? message.key.toString() : null,
            value: message.value ? message.value.toString() : null,
            headers: message.headers
          });

          messageCount++;

          if (messageCount >= maxMessages) {
            clearTimeout(timeout);
            resolve(messages);
          }
        },
      }).catch(reject);
    });
  } finally {
    await consumer.disconnect();
  }
}

// API Routes

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    service: 'KNEP Demo Client API',
    timestamp: new Date().toISOString(),
    environment: {
      kafka_bootstrap: process.env.KAFKA_BOOTSTRAP || 'localhost:19092',
      node_env: process.env.NODE_ENV || 'development'
    }
  });
});

// Kafka topics API endpoint
app.get('/api/kafka/topics', async (req, res) => {
  try {
    const accessToken = extractBearerToken(req);
    if (!accessToken) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    console.log('📋 API: Kafka topics requested');
    const topics = await listKafkaTopics(accessToken);
    console.log(`✅ API: Retrieved ${topics.length} Kafka topics`);

    res.json({
      success: true,
      topics: topics,
      count: topics.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ API: Error listing Kafka topics:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});



// Kafka topic messages API endpoint
app.get('/api/kafka/topics/:topicName/messages', async (req, res) => {
  try {
    const accessToken = extractBearerToken(req);
    if (!accessToken) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const topicName = decodeURIComponent(req.params.topicName);
    const limit = parseInt(req.query.limit) || 50;

    console.log(`📨 API: Messages requested for topic: ${topicName}`);
    console.log(`  - Max messages: ${limit}`);

    const messages = await getTopicMessages(accessToken, topicName, limit);
    console.log(`✅ API: Retrieved ${messages.length} messages from topic: ${topicName}`);

    res.json({
      success: true,
      messages: messages,
      count: messages.length,
      topic: topicName,
      limit: limit,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`❌ API: Error retrieving messages from topic ${req.params.topicName}:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      topic: req.params.topicName,
      timestamp: new Date().toISOString()
    });
  }
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  } else {
    res.json({
      message: 'KNEP Demo Client API',
      note: 'In development mode, the React app should be served by Create React App dev server on port 3000',
      api_endpoints: [
        'GET /api/status',
        'GET /api/kafka/topics',
        'GET /api/kafka/topics/:topicName/messages'
      ]
    });
  }
});

// Error handling
app.use((err, _req, res, _next) => {
  console.error('Application error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 KNEP Demo Client API Server running at http://localhost:${port}`);
  console.log('📋 Environment configuration:');
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   - KAFKA_BOOTSTRAP: ${process.env.KAFKA_BOOTSTRAP || 'localhost:19092 (default)'}`);
  console.log('✅ API server ready');

  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Development mode: React app should be running on port 3000');
    console.log('📡 API endpoints available:');
    console.log('   - GET /api/status');
    console.log('   - GET /api/kafka/topics');
    console.log('   - GET /api/kafka/topics/:topicName/messages');
  }
});
