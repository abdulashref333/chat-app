const users = [];

const addUser = ({id, username, roomname}) =>{
    username = username.trim().toLowerCase();
    roomname = roomname.trim().toLowerCase();

    if(!username || !roomname){
        return {
            error:'username and room is required!'
        }
    }

    const existingUser = users.find((user)=>{
        return user.username === username && user.roomname === roomname;
    });
    
    if(existingUser){
        return {
            error:'username is in use!'
        }
    }
    const user = {id, username, roomname};
    users.push(user);
    return { user };
};

const removeUser = (id) =>{
    const index = users.findIndex((user) => user.id === id);
    if(index !== -1) {
        return users.splice(index,1)[0];
    }
};

const getUser = (id) =>{
    return users.find((user)=>{
        return user.id === id;
    });
}

const getUsersInRoom = (room) => {
    return users.filter((user)=>{
        return user.roomname === room ;
    });
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}