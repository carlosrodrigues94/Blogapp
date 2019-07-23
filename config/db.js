 if(process.env.NODE_ENV == 'production'){
     module.exports = {mongoURI: "mongodb+srv://carlosjoker:qotsa12345@cluster0-q1a1l.mongodb.net/test?retryWrites=true&w=majority"}
 }else{
     module.exports = {mongoURI: "mongodb://localhost/blogapp"}
 }