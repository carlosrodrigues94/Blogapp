const mongoose = require('mongoose') 
const Schema = mongoose.Schema
const Postagem = new Schema ({ //Define o model chamado Postagem, embaixo, define postagem
    titulo:{
        type: String, //Quando é colocado o required true, quer dizer que é obrigatoria.
        require: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao:{
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },


    categoria:{
       type: Schema.Types.ObjectId, //Referencia uma categoria ja existente, ou seja, irá armazenar o ID de uma categoria exitente (objeto)
       ref: 'categorias', //quando se cria um objeto desse tipo, precisa-se passar uma referencia, nome do model
       required: true
    },
    data: {
        type: Date,
        default: Date.now() //Valor padrão, data atual
    }
})

mongoose.model('postagens', Postagem) //Chamou o mongo, cria uma collection chamada, postagens, feita com base no model Postagem
    