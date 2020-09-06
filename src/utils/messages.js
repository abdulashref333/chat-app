const generateMessages = (username,text)=>{
    return{
        username,
        text,
        timeStamp: new Date().getTime()
    }
};

module.exports ={
    generateMessages
}