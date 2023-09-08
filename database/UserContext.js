const knex = require('./Connection');
const hashPassword = require('../helpers/HashPassword');


// Function to retrieve users with pagination
const getUsers = async (page, pageSize, searchval) => {
    const offset = (page - 1) * pageSize;
    let query;
    if (searchval) {
        query = knex('Users')
            .select('*')
            .where('email', 'like', `%${searchval}%`)
            .orWhere('fullname', 'like', `%${searchval}%`)
            .offset(offset)
            .limit(pageSize);
    } else {
        query = knex('Users')
            .select('*')
            .offset(offset)
            .limit(pageSize);
    }

    const users = await query;
    let totalCountQuery = knex('Users').count('id as count');
    if (searchval) {
        totalCountQuery = totalCountQuery
            .where('email', 'like', `%${searchval}%`)
            .orWhere('fullname', 'like', `%${searchval}%`);
    }

    const totalCountResult = await totalCountQuery;
    const totalCount = totalCountResult[0].count;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        users,
        totalPages,
        totalCount,
    };
};


// Function to get user information by id
const getUserByInformation = async (type, data) => {
    const [user] = await knex('Users').select('*').where(type, data);
    return user;
};

// Function to add a new user
const addUser = async (userData) => {
    const { fullname, gender, age, email, username, password, created_by } =
        userData;
    const created_at = new Date();
    const { hashPass, salt } = hashPassword(password);
    try {
        const [user] = await knex('Users').insert({
            fullname,
            gender,
            age,
            created_at,
            created_by,
            email,
            username,
            password: hashPass,
            salt: salt,
        });
        return user;
    } catch (error) {
        console.error(error);
    }
};

// Function to delete a user by id
const deleteUserById = async (id) => {
    try {
        const deletedUser = await knex('Users').where('id', id).del();
        return deletedUser;
    } catch (error) {
        console.error(error);
    }
};

// Function to update a user
const updateUser = async (id, userData) => {
    const { fullname, gender, age } = userData;
    try {
        const result = await knex('Users')
            .where('id', id)
            .update({ fullname, gender, age });
        return result;
    } catch (error) {
        console.error(error);
    }
};

// Export all the functions
module.exports = {
    getUsers,
    getUserByInformation,
    addUser,
    deleteUserById,
    updateUser,
};
