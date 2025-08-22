require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');
const { Kafka, logLevel } = require('kafkajs');

const app = express();
const port = process.env.PORT || 3000;

// Environment variables validation
const requiredEnvVars = ['OKTA_CLIENT_ID', 'OKTA_CLIENT_SECRET', 'OKTA_ISSUER'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please set the following environment variables:');
  console.error('- OKTA_CLIENT_ID: Your Okta application client ID');
  console.error('- OKTA_CLIENT_SECRET: Your Okta application client secret');
  console.error('- OKTA_ISSUER: Your Okta domain (e.g., https://your-domain.okta.com)');
  process.exit(1);
}

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: true,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// OIDC configuration
const oidc = new ExpressOIDC({
  issuer: process.env.OKTA_ISSUER,
  client_id: process.env.OKTA_CLIENT_ID,
  client_secret: process.env.OKTA_CLIENT_SECRET,
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
  scope: 'openid profile email',
  routes: {
    login: {
      path: '/auth/login'
    },
    loginCallback: {
      path: '/auth/callback',
      afterCallback: '/dashboard'
    }
  }
});

// Apply OIDC middleware
app.use(oidc.router);

// Kafka configuration function
function createKafkaClient(accessToken) {
  const bootstrapServers = process.env.KAFKA_BOOTSTRAP;

  if (!bootstrapServers) {
    throw new Error('KAFKA_BOOTSTRAP environment variable is not set');
  }

  return new Kafka({
    clientId: 'okta-kafka-web-client',
    brokers: bootstrapServers.split(','),
    logLevel: logLevel.ERROR, // Reduce logging for web interface
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

// Middleware to check authentication
function ensureAuthenticated(req, res, next) {
  if (req.userContext) {
    return next();
  }
  res.redirect('/auth/login');
}

// Routes
app.get('/', (req, res) => {
  console.log('🏠 Home route accessed');
  console.log('  - Session ID:', req.sessionID);
  console.log('  - User Context:', req.userContext ? 'Present' : 'Missing');
  console.log('  - Error param:', req.query.error);

  if (req.userContext) {
    console.log('✅ User is authenticated, redirecting to dashboard');
    res.redirect('/dashboard');
  } else {
    console.log('❌ User not authenticated, showing login page');
    const errorMessage = req.query.error ? `<div style="color: red; margin: 20px 0;">Authentication Error: ${req.query.error}</div>` : '';

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Okta OIDC Authentication</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          .container { text-align: center; }
          .btn { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
          .btn:hover { background-color: #0056b3; }
          .info { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: left; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 Okta OIDC Authentication</h1>
          ${errorMessage}
          <p>Click the button below to authenticate with Okta and view your token information.</p>
          <a href="/auth/login" class="btn">Login with Okta</a>
          
          <div class="info">
            <h3>Environment Variables Required:</h3>
            <ul>
              <li><strong>OKTA_CLIENT_ID</strong>: Your Okta application client ID</li>
              <li><strong>OKTA_CLIENT_SECRET</strong>: Your Okta application client secret</li>
              <li><strong>OKTA_ISSUER</strong>: Your Okta domain (e.g., https://your-domain.okta.com)</li>
              <li><strong>CALLBACK_URL</strong> (optional): Defaults to http://localhost:3000/auth/callback</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

// Authentication routes are handled by Okta OIDC middleware automatically

// Debug route
app.get('/debug', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    userContext: req.userContext,
    session: req.session,
    cookies: req.headers.cookie
  });
});

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  const userContext = req.userContext;
  const userInfo = userContext.userinfo;
  const tokens = userContext.tokens;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Token Information - Okta OIDC</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 20px auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .token-section { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .token-value { background-color: #e9ecef; padding: 10px; border-radius: 3px; font-family: monospace; word-break: break-all; margin: 10px 0; }
        .btn { background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
        .btn:hover { background-color: #c82333; }
        .json-display { background-color: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-wrap; overflow-x: auto; }
        .success { color: #28a745; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .info-grid { grid-template-columns: 1fr; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Authentication Successful!</h1>
        <p class="success">You have successfully authenticated with Okta OIDC</p>
        <a href="/kafka/topics" class="btn" style="background-color: #28a745; margin-right: 10px;">📋 List Kafka Topics</a>
        <a href="/logout" class="btn">Logout</a>
      </div>

      <div class="info-grid">
        <div class="token-section">
          <h2>🔑 Access Token</h2>
          <div class="token-value">${tokens.access_token || 'Not available'}</div>
        </div>

        <div class="token-section">
          <h2>🔄 Refresh Token</h2>
          <div class="token-value">${tokens.refresh_token || 'Not available'}</div>
        </div>
      </div>

      <div class="token-section">
        <h2>👤 User Profile Information</h2>
        <div class="json-display">${JSON.stringify(userInfo, null, 2)}</div>
      </div>

      <div class="token-section">
        <h2>📋 ID Token Claims</h2>
        <div class="json-display">${JSON.stringify(tokens.id_token ? JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()) : {}, null, 2)}</div>
      </div>

      <div class="token-section">
        <h2>🔍 Full Token Object</h2>
        <div class="json-display">${JSON.stringify({
          access_token: tokens.access_token ? 'Present' : 'Missing',
          refresh_token: tokens.refresh_token ? 'Present' : 'Missing',
          id_token: tokens.id_token ? 'Present' : 'Missing',
          token_type: tokens.token_type,
          expires_in: tokens.expires_in
        }, null, 2)}</div>
      </div>
    </body>
    </html>
  `);
});

// Kafka topics route
app.get('/kafka/topics', ensureAuthenticated, async (req, res) => {
  const userContext = req.userContext;
  const accessToken = userContext.tokens.access_token;

  console.log('📋 Kafka topics requested');
  console.log('  - Access Token:', accessToken ? 'Present' : 'Missing');

  try {
    const topics = await listKafkaTopics(accessToken);
    console.log(`✅ Retrieved ${topics.length} Kafka topics`);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kafka Topics - Okta OIDC</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 1200px; margin: 20px auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .btn { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
          .btn:hover { background-color: #0056b3; }
          .btn.success { background-color: #28a745; }
          .btn.success:hover { background-color: #218838; }
          .topics-container { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .topic-item { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; cursor: pointer; transition: all 0.3s ease; }
          .topic-item:hover { background-color: #f8f9fa; border-left-color: #28a745; transform: translateX(5px); }
          .topic-link { text-decoration: none; color: #333; display: block; }
          .topic-link:hover { text-decoration: none; color: #333; }
          .topic-count { color: #28a745; font-weight: bold; }
          .no-topics { color: #dc3545; font-style: italic; }
          .error { color: #dc3545; background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Kafka Topics</h1>
          <p>Topics retrieved using your Okta access token</p>
          <a href="/dashboard" class="btn">🏠 Back to Dashboard</a>
          <a href="/kafka/topics" class="btn success">🔄 Refresh Topics</a>
          <a href="/logout" class="btn" style="background-color: #dc3545;">Logout</a>
        </div>

        <div class="topics-container">
          <h2>📊 Topic List</h2>
          <p class="topic-count">Found ${topics.length} topics</p>

          ${topics.length > 0 ?
            topics.map(topic => `
              <div class="topic-item">
                <a href="/kafka/topics/${encodeURIComponent(topic)}/messages" class="topic-link">
                  📄 ${topic}
                  <span style="float: right; color: #007bff; font-size: 0.9em;">Click to view messages →</span>
                </a>
              </div>
            `).join('') :
            '<p class="no-topics">No topics found in the Kafka cluster</p>'
          }
        </div>

        <div class="topics-container">
          <h3>🔧 Configuration Used</h3>
          <p><strong>Kafka Bootstrap Servers:</strong> ${process.env.KAFKA_BOOTSTRAP || 'Not configured'}</p>
          <p><strong>Authentication:</strong> OAuth Bearer Token from Okta</p>
          <p><strong>Client ID:</strong> okta-kafka-web-client</p>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('❌ Error listing Kafka topics:', error.message);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kafka Topics Error - Okta OIDC</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 1200px; margin: 20px auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .btn { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
          .btn:hover { background-color: #0056b3; }
          .error { color: #dc3545; background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .config-info { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>❌ Error Listing Kafka Topics</h1>
          <a href="/dashboard" class="btn">🏠 Back to Dashboard</a>
          <a href="/kafka/topics" class="btn" style="background-color: #28a745;">🔄 Try Again</a>
        </div>

        <div class="error">
          <h3>Error Details:</h3>
          <p>${error.message}</p>
        </div>

        <div class="config-info">
          <h3>🔧 Configuration Check</h3>
          <p><strong>Kafka Bootstrap Servers:</strong> ${process.env.KAFKA_BOOTSTRAP || '❌ Not configured - Please set KAFKA_BOOTSTRAP environment variable'}</p>
          <p><strong>Access Token:</strong> ${accessToken ? '✅ Present' : '❌ Missing'}</p>

          <h4>Common Issues:</h4>
          <ul>
            <li>KAFKA_BOOTSTRAP environment variable not set</li>
            <li>Kafka cluster not accessible from this network</li>
            <li>Access token doesn't have permission to access Kafka</li>
            <li>Kafka cluster requires different authentication method</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  }
});

// Kafka topic messages route
app.get('/kafka/topics/:topicName/messages', ensureAuthenticated, async (req, res) => {
  const userContext = req.userContext;
  const accessToken = userContext.tokens.access_token;
  const topicName = decodeURIComponent(req.params.topicName);
  const maxMessages = parseInt(req.query.limit) || 50;

  console.log(`📨 Messages requested for topic: ${topicName}`);
  console.log(`  - Max messages: ${maxMessages}`);
  console.log('  - Access Token:', accessToken ? 'Present' : 'Missing');

  try {
    const messages = await getTopicMessages(accessToken, topicName, maxMessages);
    console.log(`✅ Retrieved ${messages.length} messages from topic: ${topicName}`);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Messages: ${topicName} - Kafka OIDC</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 1400px; margin: 20px auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .btn { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px; }
          .btn:hover { background-color: #0056b3; }
          .btn.success { background-color: #28a745; }
          .btn.success:hover { background-color: #218838; }
          .messages-container { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .message-item { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
          .message-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.9em; color: #666; }
          .message-key { background-color: #e9ecef; padding: 5px 10px; border-radius: 3px; font-family: monospace; margin: 5px 0; }
          .message-value { background-color: #f8f9fa; padding: 10px; border-radius: 3px; font-family: monospace; white-space: pre-wrap; word-break: break-word; }
          .message-count { color: #28a745; font-weight: bold; }
          .no-messages { color: #dc3545; font-style: italic; text-align: center; padding: 40px; }
          .topic-name { color: #007bff; font-weight: bold; }
          .timestamp { color: #6c757d; }
          .partition-offset { background-color: #17a2b8; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📨 Messages from Topic</h1>
          <h2 class="topic-name">${topicName}</h2>
          <a href="/kafka/topics" class="btn">📋 Back to Topics</a>
          <a href="/kafka/topics/${encodeURIComponent(topicName)}/messages" class="btn success">🔄 Refresh Messages</a>
          <a href="/kafka/topics/${encodeURIComponent(topicName)}/messages?limit=100" class="btn" style="background-color: #ffc107; color: #212529;">📈 Load More (100)</a>
          <a href="/dashboard" class="btn">🏠 Dashboard</a>
        </div>

        <div class="messages-container">
          <h3>📊 Message List</h3>
          <p class="message-count">Retrieved ${messages.length} messages (limit: ${maxMessages})</p>

          ${messages.length > 0 ?
            messages.map((msg, index) => `
              <div class="message-item">
                <div class="message-header">
                  <span>Message #${index + 1}</span>
                  <span class="partition-offset">Partition: ${msg.partition} | Offset: ${msg.offset}</span>
                  <span class="timestamp">${msg.timestamp ? new Date(parseInt(msg.timestamp)).toLocaleString() : 'No timestamp'}</span>
                </div>
                ${msg.key ? `<div class="message-key"><strong>Key:</strong> ${msg.key}</div>` : ''}
                <div class="message-value"><strong>Value:</strong><br>${msg.value || '(empty)'}</div>
                ${msg.headers && Object.keys(msg.headers).length > 0 ?
                  `<div class="message-key"><strong>Headers:</strong> ${JSON.stringify(msg.headers)}</div>` :
                  ''
                }
              </div>
            `).join('') :
            '<div class="no-messages">No messages found in this topic.<br>The topic might be empty or messages might be older than the consumer offset.</div>'
          }
        </div>

        <div class="messages-container">
          <h3>🔧 Configuration</h3>
          <p><strong>Topic:</strong> ${topicName}</p>
          <p><strong>Max Messages:</strong> ${maxMessages}</p>
          <p><strong>Consumer Group:</strong> web-consumer-${Date.now()}</p>
          <p><strong>Authentication:</strong> OAuth Bearer Token from Okta</p>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error(`❌ Error retrieving messages from topic ${topicName}:`, error.message);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error: ${topicName} - Kafka OIDC</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 1200px; margin: 20px auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .btn { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
          .btn:hover { background-color: #0056b3; }
          .error { color: #dc3545; background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .config-info { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .topic-name { color: #007bff; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>❌ Error Reading Messages</h1>
          <h2 class="topic-name">${topicName}</h2>
          <a href="/kafka/topics" class="btn">📋 Back to Topics</a>
          <a href="/kafka/topics/${encodeURIComponent(topicName)}/messages" class="btn" style="background-color: #28a745;">🔄 Try Again</a>
        </div>

        <div class="error">
          <h3>Error Details:</h3>
          <p>${error.message}</p>
        </div>

        <div class="config-info">
          <h3>🔧 Troubleshooting</h3>
          <p><strong>Topic:</strong> ${topicName}</p>
          <p><strong>Kafka Bootstrap:</strong> ${process.env.KAFKA_BOOTSTRAP || '❌ Not configured'}</p>
          <p><strong>Access Token:</strong> ${accessToken ? '✅ Present' : '❌ Missing'}</p>

          <h4>Common Issues:</h4>
          <ul>
            <li>Topic doesn't exist or has no messages</li>
            <li>Consumer doesn't have permission to read from topic</li>
            <li>Network connectivity issues</li>
            <li>Kafka cluster authentication problems</li>
            <li>Topic has no recent messages (consumer reads from latest offset)</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  }
});

// Custom logout route
app.get('/logout', (req, res) => {
  console.log('🚪 Logout requested');
  if (req.userContext) {
    console.log('✅ User found, destroying session');
    // Clear the user context
    delete req.userContext;
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Session destroy error:', err);
      }
      console.log('🏠 Redirecting to home');
      res.redirect('/');
    });
  } else {
    console.log('❌ No user context found, redirecting to home');
    res.redirect('/');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Application error:', err);
  res.status(500).send(`
    <h1>Error</h1>
    <p>An error occurred during authentication: ${err.message}</p>
    <a href="/">Go back to home</a>
  `);
});

oidc.on('ready', () => {
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log('📋 Environment variables configured:');
    console.log(`   - OKTA_CLIENT_ID: ${process.env.OKTA_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - OKTA_CLIENT_SECRET: ${process.env.OKTA_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - OKTA_ISSUER: ${process.env.OKTA_ISSUER || '❌ Missing'}`);
    console.log(`   - APP_BASE_URL: ${process.env.APP_BASE_URL || 'http://localhost:3000 (default)'}`);
    console.log('✅ Okta OIDC middleware ready');
  });
});

oidc.on('error', err => {
  console.error('❌ Okta OIDC middleware error:', err);
});
