// Description:
//   Arena for bots to fight in
//
// Commands:
//   hubot create robot <name> - Create a new bot
//   hubot delete robot - Delete your current bot
//   hubot get bot - Get information on your current bot
//   hubot fight <user> - Challenge a user to a fight
//
// Configuration:
//   HUBOT_HELP_REPLY_IN_PRIVATE - if set to any value, all `hubot help` replies are sent in private
//   HUBOT_HELP_DISABLE_HTTP - if set, no web entry point will be declared
//   HUBOT_HELP_HIDDEN_COMMANDS - comma-separated list of commands that will not be displayed in help
//
// Notes:
//   These commands are grabbed from comment blocks at the top of each file.

const factory = require('./factory.js');
const Conversation = require('hubot-conversation');

const mastersOfCeremonies = ['sferrari'];

module.exports = (robot) => {
  const switchboard = new Conversation(robot);

  robot.respond(/create robot (.*)/i, (res) => {
    const user = res.message.user.name;
    const name = res.match[1];
    // Add dialog for overriding right now
    try {
      newRobot = factory.createRobot(user, name)
      factory.saveRobot(robot, newRobot);
      res.reply('Created Robot :robot_face:\nStats: ' + JSON.stringify(newRobot));
    } catch(error) {
      res.reply('Failed to create robot. Please try again.')
    }
  });

  robot.hear(/delete robot/i, (res) => {
    res.reply('Are you sure?');
    const dialog = switchboard.startDialog(res);
    dialog.addChoice(/yes|Yes/, (res2) => {
      try {
        factory.deleteRobot(robot, res2.message.user.name);
        res2.reply('Robot deleted :robot_face:');
      } catch (error) {
        res2.reply('There was trouble deleting your robot, try again.');
      }
    });
    dialog.addChoice(/no|No/, function(res2){ res2.reply('Thanks.') });
    dialog.addChoice(/.*/, function(res2){ res2.reply('Please ask again and answer with "yes" or "no".') });
    // The dialog will expire after 30 seconds
  });

  robot.hear(/get robot/i, (res) => {
    const user = res.message.user.name;
    console.log(res.messsage.user);
    const robert = factory.loadRobot(robot, user);
    if (robert) {
      res.reply(':robot_face: Robot assembled...\n' + JSON.stringify(robert));
    } else {
      res.reply('You do not have a robot, Please make one.');
    }
  });

  robot.hear(/fight (.+)/i, (res) => {
    const id1 = res.message.user.name;
    const id2 = res.match[1];

    if (id1 === id2) {
      res.reply('You can\'t challenge yourself.');
      return;
    }
    const robert  = factory.loadRobot(robot, id1);
    const robert2 = factory.loadRobot(robot, id2);
    if (!robert) {
      res.reply('Your robot doesn\'t exist, please create one :robot_face:');
      return;
    }
    if (!robert2) {
      res.reply('Enemy doesn\'t exist.');
      return;
    }
    try {
      const winner = factory.startFight(robert, robert2);
      if (factory.gainXp(robot, winner, 1)) {
        res.reply('Winner is ' + winner.name + ' :robot_face:!');
        return;
      }
      throw "Error saving experience for " + winner.name + " of " + winner.owner;
    } catch(error) {
      console.log(error); // Replace console logs with logger
      res.reply('Technical difficulties during the fight, repair your robots and try again.')
    }
  });

  robot.hear(/set test robots/i, (res) => {
    robot.brain.set('testbot', {'name': 'Testbot', 'owner': 'testbot', 'hp': 1, 'attack': 1, 'xp': 1});
    robot.brain.set('the ultimate robot', {'name': 'The Ultimate Robot', 'owner': 'the ultimate robot', 'hp': 1000000, 'attack': 1000000, 'xp': 0});
  })
}