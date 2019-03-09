module.exports = {
  apps : [{
    name: 'Arenabot',
    script: './bin/hubot',
    args: '--adapter slack',
    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 1,
    autorestart: true,
    interpreter: 'bash',
    watch: './scripts/',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      HUBOT_SLACK_TOKEN: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      PORT: 3859,
      FILE_BRAIN_PATH: './data'
    },
    env_production: {
      NODE_ENV: 'production',
      HUBOT_SLACK_TOKEN: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      PORT: 3859,
      FILE_BRAIN_PATH: './data'
    }
  }]
};
