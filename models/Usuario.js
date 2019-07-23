const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome: {
        type:String,
        required: true

    },
    email:{
        type: String,
        required: true    
    },

    eAdmin: { 
        type: Number, //Usuarios que tem um campo igual a 0, não são admin
        default: 0 //Usuarios com o campo igual a 1, são admin


    },

    senha: {
        type: String,
        required: true
    },


})

mongoose.model('usuarios', Usuario)