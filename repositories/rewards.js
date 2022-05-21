let rewards = [];

export const getrewards = () => {
  return rewards;
};

export const setRewards = (updatedRewards) => {
  rewards = updatedRewards;
};

export const getRewardByUserIdAndDate = (id, date) => {
  console.log("R2R", id, date, rewards);
  const r2r = rewards.find(
    (r) => r.userId === id && r.availableAt.toString() === date.toString()
  );
  return r2r;
};

export const getRewardsByUserId = (id) => {
  return rewards.filter((r) => r.userId === id);
};
