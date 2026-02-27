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
function createKafkaClient(accessToken, config = null) {
  const bootstrapServers = config?.bootstrapServers || process.env.KAFKA_BOOTSTRAP || 'localhost:19092';
  const clientId = config?.clientId || 'knep-demo-client';
  const ssl = config?.ssl !== undefined ? config.ssl : false;
  const saslMechanism = config?.saslMechanism || 'oauthbearer';

  const kafkaConfig = {
    clientId,
    brokers: bootstrapServers.split(','),
    logLevel: logLevel.ERROR,
    ssl,
  };

  // Configure SASL based on mechanism
  if (saslMechanism === 'oauthbearer') {
    kafkaConfig.sasl = {
      mechanism: 'oauthbearer',
      oauthBearerProvider: async () => {
        return {
          value: accessToken,
        };
      },
    };
  } else if (saslMechanism === 'plain') {
    kafkaConfig.sasl = {
      mechanism: 'plain',
      username: config?.username || '',
      password: config?.password || '',
    };
  } else if (saslMechanism === 'scram-sha-256') {
    kafkaConfig.sasl = {
      mechanism: 'scram-sha-256',
      username: config?.username || '',
      password: config?.password || '',
    };
  } else if (saslMechanism === 'scram-sha-512') {
    kafkaConfig.sasl = {
      mechanism: 'scram-sha-512',
      username: config?.username || '',
      password: config?.password || '',
    };
  }

  return new Kafka(kafkaConfig);
}

async function listKafkaTopics(accessToken, config = null) {
  const kafka = createKafkaClient(accessToken, config);
  const admin = kafka.admin();

  try {
    await admin.connect();
    const topics = await admin.listTopics();
    return topics;
  } finally {
    await admin.disconnect();
  }
}

async function getTopicMessages(accessToken, topicName, maxMessages = 50, config = null) {
  const kafka = createKafkaClient(accessToken, config);
  // Use a unique group ID for each request to ensure we always read from earliest
  const consumer = kafka.consumer({
    groupId: `web-consumer-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    // Ensure we always start from the earliest offset
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
  });

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

async function testKafkaConnection(accessToken, config) {
  try {
    const kafka = createKafkaClient(accessToken, config);
    const admin = kafka.admin();

    await admin.connect();
    // Try to get cluster metadata as a connection test
    await admin.describeCluster();
    await admin.disconnect();

    return {
      success: true,
      message: 'Connection successful! Kafka cluster is reachable.',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      message: 'Connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function produceMessage(accessToken, topicName, messageData, config = null) {
  const kafka = createKafkaClient(accessToken, config);
  const producer = kafka.producer();

  try {
    await producer.connect();

    const message = {
      key: messageData.key || null,
      value: messageData.value,
      headers: messageData.headers || {},
    };

    // Add partition if specified
    const produceRequest = {
      topic: topicName,
      messages: [message],
    };

    if (messageData.partition !== undefined) {
      produceRequest.messages[0].partition = messageData.partition;
    }

    const result = await producer.send(produceRequest);

    // Return the first (and only) record metadata
    const recordMetadata = result[0];

    // Log the raw result for debugging
    console.log('📋 Producer result:', JSON.stringify(recordMetadata, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    return {
      success: true,
      message: 'Message sent successfully',
      topic: recordMetadata.topicName || topicName,
      partition: recordMetadata.partition || 0,
      offset: recordMetadata.offset != null ? recordMetadata.offset.toString() : '0',
      timestamp: new Date().toISOString()
    };
  } finally {
    await producer.disconnect();
  }
}

// API Routes

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    service: 'KEG Demo Client API',
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

// Test Kafka connection with custom configuration
app.post('/api/kafka/test-connection', async (req, res) => {
  try {
    const accessToken = extractBearerToken(req);
    if (!accessToken) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const { config } = req.body;
    if (!config) {
      return res.status(400).json({ error: 'Kafka configuration required' });
    }

    console.log('🔧 API: Testing Kafka connection with custom config');
    console.log(`  - Bootstrap servers: ${config.bootstrapServers}`);
    console.log(`  - SSL: ${config.ssl}`);
    console.log(`  - SASL mechanism: ${config.saslMechanism}`);

    const result = await testKafkaConnection(accessToken, config);
    console.log(`${result.success ? '✅' : '❌'} API: Connection test ${result.success ? 'passed' : 'failed'}`);

    res.json(result);
  } catch (error) {
    console.error('❌ API: Error testing Kafka connection:', error.message);
    res.status(500).json({
      success: false,
      message: 'Connection test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get Kafka topics with custom configuration
app.post('/api/kafka/topics-with-config', async (req, res) => {
  try {
    const accessToken = extractBearerToken(req);
    if (!accessToken) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const { config } = req.body;
    if (!config) {
      return res.status(400).json({ error: 'Kafka configuration required' });
    }

    console.log('📋 API: Kafka topics requested with custom config');
    const topics = await listKafkaTopics(accessToken, config);
    console.log(`✅ API: Retrieved ${topics.length} Kafka topics with custom config`);

    res.json({
      success: true,
      topics: topics,
      count: topics.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ API: Error listing Kafka topics with custom config:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get Kafka topic messages with custom configuration
app.post('/api/kafka/topics-with-config/:topicName/messages', async (req, res) => {
  try {
    const accessToken = extractBearerToken(req);
    if (!accessToken) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const { config } = req.body;
    if (!config) {
      return res.status(400).json({ error: 'Kafka configuration required' });
    }

    const topicName = decodeURIComponent(req.params.topicName);
    const limit = parseInt(req.query.limit) || 50;

    console.log(`📨 API: Messages requested for topic: ${topicName} with custom config`);
    console.log(`  - Max messages: ${limit}`);

    const messages = await getTopicMessages(accessToken, topicName, limit, config);
    console.log(`✅ API: Retrieved ${messages.length} messages from topic: ${topicName} with custom config`);

    res.json({
      success: true,
      messages: messages,
      count: messages.length,
      topic: topicName,
      limit: limit,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`❌ API: Error retrieving messages from topic ${req.params.topicName} with custom config:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      topic: req.params.topicName,
      timestamp: new Date().toISOString()
    });
  }
});

// Produce message to a Kafka topic
app.post('/api/kafka/topics/:topicName/produce', async (req, res) => {
  try {
    const accessToken = extractBearerToken(req);
    if (!accessToken) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const topicName = decodeURIComponent(req.params.topicName);
    const messageData = req.body;

    if (!messageData.value) {
      return res.status(400).json({ error: 'Message value is required' });
    }

    console.log(`📤 API: Producing message to topic: ${topicName}`);
    console.log(`  - Key: ${messageData.key || '(none)'}`);
    console.log(`  - Value length: ${messageData.value.length} characters`);
    console.log(`  - Headers: ${messageData.headers ? Object.keys(messageData.headers).length : 0} headers`);

    const result = await produceMessage(accessToken, topicName, messageData);
    console.log(`✅ API: Message produced to topic: ${topicName}, partition: ${result.partition}, offset: ${result.offset}`);

    res.json(result);
  } catch (error) {
    console.error(`❌ API: Error producing message to topic ${req.params.topicName}:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      topic: req.params.topicName,
      timestamp: new Date().toISOString()
    });
  }
});

// Produce message to a Kafka topic with custom configuration
app.post('/api/kafka/topics-with-config/:topicName/produce', async (req, res) => {
  try {
    const accessToken = extractBearerToken(req);
    if (!accessToken) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const { message, config } = req.body;
    if (!config) {
      return res.status(400).json({ error: 'Kafka configuration required' });
    }

    if (!message || !message.value) {
      return res.status(400).json({ error: 'Message value is required' });
    }

    const topicName = decodeURIComponent(req.params.topicName);

    console.log(`📤 API: Producing message to topic: ${topicName} with custom config`);
    console.log(`  - Key: ${message.key || '(none)'}`);
    console.log(`  - Value length: ${message.value.length} characters`);
    console.log(`  - Headers: ${message.headers ? Object.keys(message.headers).length : 0} headers`);

    const result = await produceMessage(accessToken, topicName, message, config);
    console.log(`✅ API: Message produced to topic: ${topicName} with custom config, partition: ${result.partition}, offset: ${result.offset}`);

    res.json(result);
  } catch (error) {
    console.error(`❌ API: Error producing message to topic ${req.params.topicName} with custom config:`, error.message);
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
      message: 'KEG Demo Client API',
      note: 'In development mode, the React app should be served by Create React App dev server on port 3000',
      api_endpoints: [
        'GET /api/status',
        'GET /api/kafka/topics',
        'GET /api/kafka/topics/:topicName/messages',
        'POST /api/kafka/topics/:topicName/produce',
        'POST /api/kafka/test-connection',
        'POST /api/kafka/topics-with-config',
        'POST /api/kafka/topics-with-config/:topicName/messages',
        'POST /api/kafka/topics-with-config/:topicName/produce'
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
  console.log(`🚀 KEG Demo Client API Server running at http://localhost:${port}`);
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
    console.log('   - POST /api/kafka/topics/:topicName/produce');
    console.log('   - POST /api/kafka/test-connection');
    console.log('   - POST /api/kafka/topics-with-config');
    console.log('   - POST /api/kafka/topics-with-config/:topicName/messages');
    console.log('   - POST /api/kafka/topics-with-config/:topicName/produce');
  }
});
