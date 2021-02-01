const User = require('../database/models/user');

module.exports.batchUsers = async (userIds) => {
    console.log('keys===', userIds);
    const users = await Users.find({ _id: { $in: userIds } });
    return userIds.map(userId => users.find(user => user.id === userId));
}