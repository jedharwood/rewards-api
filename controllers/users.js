import * as usersRepo from "../repositories/users.js";
import * as rewardsRepo from "../repositories/rewards.js";

export const getUserById = (req, res) => {
  const { id } = req.params;
  const { at } = req.query;
  const users = usersRepo.getUsers();
  const existingUser = users.find((user) => user.id === id);

  if (!existingUser) {
    users.push({ id: id, emailAddress: "jack.burton@porkchopexpress.com" });
    usersRepo.setUsers(users);
    generateRewards(id, at);
  }

  res.send(rewardsRepo.getRewardsByUserId(id));
};

const generateRewards = (id, at) => {
  if (!at) return;

  const reqDate = new Date(at);
  reqDate.setDate(reqDate.getDate() - 5);
  // This really threw me. I'm from the UK and have never had to handle dates outside of GMT before. I couldn't
  // understand for a minute why I was havinf to add 9 to get to midnight. I also worried that this would go
  // wrong during the summer months when the UK clocks change but apparently BST and GMT are separate entities.
  // British problems.
  reqDate.setHours(9, 0, 0, 0);
  const rewards = rewardsRepo.getrewards();

  for (let i = 0; i < 7; i++) {
    // Generating a collection of seven 'reward' objects with incrementing availableAt and expiresAt dates centred
    // around the 'at' date supplied in the request string.
    const availableAt = new Date(reqDate.setDate(reqDate.getDate() + 1));
    const expiresAt = new Date(availableAt);
    expiresAt.setDate(expiresAt.getDate() + 1);

    rewards.push({
      userId: id,
      availableAt: availableAt,
      redeemedAt: null,
      expiresAt: expiresAt,
    });
  }

  rewardsRepo.setRewards(rewards);
};

export const updateUserRewards = (req, res) => {
  const { id, at } = req.params;
  const reqDate = new Date(at);
  const rewardToRedeem = rewardsRepo.getRewardByUserIdAndDate(id, reqDate);
  const now = new Date(Date.now());

  if (!rewardToRedeem) {
    res.status(404);
    res.json({
      error: {
        message: `This reward for user: ${id} could not be found. Sorry.`,
      },
    });
  } else if (rewardToRedeem.expiresAt < now) {
    res.status(400);
    res.json({
      error: {
        message: `This reward expired at: ${rewardToRedeem.expiresAt}.`,
      },
    });
  } else {
    // If I'd had a bit more time I would have also liked to have updated the reward object in the repository.
    rewardToRedeem.redeemedAt = now;
    res.send(rewardToRedeem);
  }
};
