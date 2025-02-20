// Description:
//   Arena for bots to fight in
//
// Commands:
//   hubot create robot <name> - Create a new bot
//   hubot delete my robot - Delete your current bot
//   hubot show my robot - Get information on your current bot
//   hubot challenge <user> - Challenge a user to a fight
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
    const user = res.message.user.id;
    const name = res.match[1];
    // Add dialog for overriding right now
    res.reply('Creating a new robot overrides your current one. Do you still want to do it?');
    const dialog = switchboard.startDialog(res);
    dialog.addChoice(/yes|Yes/, (res2) => {
      try {
        newRobot = factory.createRobot(user, name)
        factory.saveRobot(robot, newRobot);
        const statsMessage = 
        '>*Stats:*\n' +
        '>*Name :* ' + newRobot.name + '\n' +
        '>*HP      :* ' + newRobot.hp + '\n' +
        '>*Attack:* ' + newRobot.attack;
        res2.reply('Created Robot :robot_face:\n' + statsMessage);
      } catch(error) {
        res2.reply('Failed to create robot. Please try again.')
      }
    });
    dialog.addChoice(/no|No/, function(res2){ res2.reply('Thanks.') });
    dialog.addChoice(/.*/, function(res2){ res2.reply('Please ask again and answer with "yes" or "no".') });
  });

  robot.respond(/delete my robot/i, (res) => {
    res.reply('Are you sure?');
    const user = res.message.user.id;
    const dialog = switchboard.startDialog(res);
    dialog.addChoice(/yes|Yes/, (res2) => {
      try {
        factory.deleteRobot(robot, user);
        res2.reply('Robot deleted :robot_face:');
      } catch (error) {
        res2.reply('There was trouble deleting your robot, try again.');
      }
    });
    dialog.addChoice(/no|No/, function(res2){ res2.reply('Thanks.') });
    dialog.addChoice(/.*/, function(res2){ res2.reply('Please ask again and answer with "yes" or "no".') });
    // The dialog will expire after 30 seconds
  });

  robot.respond(/get my robot|show my robot/i, (res) => {
    const user = res.message.user.id;
    // console.log(res.message.user);
    const robert = factory.loadRobot(robot, user);
    if (robert) {
      const statsMessage =
      '>*Stats:*\n' +
      '>*Name :* ' + robert.name + '\n' +
      '>*HP      :* ' + robert.hp + '\n' +
      '>*Attack:* ' + robert.attack + '\n' +
      '>*XP      :* ' + robert.xp;
      res.reply(':robot_face: Robot assembled...\n' + statsMessage);
    } else {
      res.reply('You do not have a robot, Please make one.');
    }
  });

  robot.respond(/challenge (.+)/i, (res) => {
    const challenger = res.message.user.id;
    let id2 = res.match[1]; // To use id here we need to get it from the user but that might be easier when they confirm
    id2 = id2.replace('@', '');

    // console.log(robot.brain.userForName('testbot'));

    const challengee = robot.brain.userForName(id2)

    if (challenger === challengee) {
      res.reply('You can\'t challenge yourself.');
      return;
    }
    const robert  = factory.loadRobot(robot, challenger);
    const robert2 = factory.loadRobot(robot, challengee.id);
    if (!robert) {
      res.reply('Your robot doesn\'t exist, please create one :robot_face:');
      return;
    }
    if (!robert2) {
      res.reply('Enemy doesn\'t have a robot.');
      return;
    }

    try {
      const winner = factory.startFight(robert, robert2);
      if (factory.gainXp(robot, winner, 1)) {
        res.send('Winner is ' + winner.name + ' :robot_face:!');
        return;
      }
      throw "Error saving experience for " + winner.name + " of " + winner.owner;
    } catch(error) {
      console.log(error); // Replace console logs with logger
      res.send('Technical difficulties during the fight, repair your robots and try again.')
    }
  });

  robot.hear(/set test robots/i, (res) => {
    robot.brain.set('U84UA7KGS', {'name': 'Testbot', 'owner': 'U84UA7KGS', 'hp': 1, 'attack': 1, 'xp': 1});
    robot.brain.set('the ultimate robot', {'name': 'The Ultimate Robot', 'owner': 'the ultimate robot', 'hp': 1000000, 'attack': 1000000, 'xp': 0});
  });
}