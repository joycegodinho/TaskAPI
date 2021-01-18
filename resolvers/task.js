const uuid = require('uuid');
const { combineResolvers } = require('graphql-resolvers');

const { users, tasks } = require('../constants')

const Task = require('../database/models/task');
const User = require('../database/models/user');
const { isAuthenticated } = require('./middleware')

module.exports = {
    Query: {
        tasks: combineResolvers(isAuthenticated, async (_,__,{ loggedInUserId }) => {
            try{
                const tasks = await Task.find({ user: loggedInUserId });
                return tasks;

            }catch (error) {
                console.log(error);
                throw error;
            }

        }),
        task: combineResolvers(isAuthenticated, isTaskOwner, async (_,{ id }) => {
            try{
                const task = await Task.findById(id);
                return task;

            }catch (error) {
                console.log(error);
                throw error;
            }

        }),
    },
    Mutation: {
        createTask: combineResolvers(isAuthenticated, async(_, { input }, { email }) => {
            try {
                const user = await User.findOne({ email: email });
                const task = new Task({ ...input, user: user.id });
                const result = await task.save();
                user.tasks.push(result.id);
                await user.save();
                return result;
            }catch (error){
                console.log(error);
                throw error;
            }
        })
    },
    // level fild resolver, para puaxar o usuário da task 
    Task: {
        user: async (parent) => {
            try{
                const user = await User.findById(parent.user);
                return user;

            }catch (error) {
                console.log(error);
                throw error;
            }

        }
    }
}