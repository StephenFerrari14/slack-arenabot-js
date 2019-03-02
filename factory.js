/**
 * 
 * 
 * 
 */

const maxHealth = 10;
const maxAttack = 10;

const createRobot = (owner, name) => ({'name': name, 'owner': owner, 'xp': 0, 'hp': Math.floor(Math.random() * maxHealth + 1), 'attack': Math.floor(Math.random() * maxAttack + 1)});

const saveRobot = (hubot, robot) => hubot.brain.set(robot.owner, robot);

const loadRobot = (hubot, owner) => hubot.brain.get(owner);

const deleteRobot = (hubot, owner) => hubot.brain.set(owner, null);

const startFight = (bot1, bot2) => {
  bot1Power = bot1.hp + bot1.attack;
  bot2Power = bot2.hp + bot2.attack;
  const rand = Math.random();
  if (rand <= bot1Power/(bot1Power + bot2Power)) {
    return bot1;
  }
  return bot2;
};

const gainXp = (hubot, robot, amount) => {
  try {
    newRobot = {...robot};
    newRobot.xp += amount;
    hubot.brain.set(newRobot.owner, newRobot);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = {
  createRobot,
  startFight,
  saveRobot,
  loadRobot,
  gainXp,
  deleteRobot
}
// I think I can use classes here for the bot stuff, will probably split out the files since bot stuff isn't factory stuff