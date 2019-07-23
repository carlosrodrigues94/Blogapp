const localStrategy = require('passport-local') //Carrega o passport local, modo de autenticação
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Model de usuário
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

module.exports = function (passport) {

    passport.use(new localStrategy({ usernameField: 'email', passwordField:'senha'}, (email, senha, done) => { // Qual campo você gostaria de buscar? ou seja Email

        Usuario.findOne({ email: email }).then((usuario) => { // Pesquisar um usuario igual ao passado na autenticação
            if (!usuario) { // Se não encontrar o usuario
                return done(null, false, { message: 'Esta conta não existe' }) //Done é uma função de callback
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {// Se a conta existir ele chamara o Bcrypt,
                                                                    // e vai comparar a senha com a do usuario encontrado
                if (batem) {
                    return done(null, usuario) // Se as senhas batem ok
                } else {
                    return done(null, false, { message: 'Senha incorreta' })//Senão executa-ra o else
                }
            })
        })
    }))
    passport.serializeUser((usuario, done) => {// Serve para salvar os dados do usuario em uma sessão
        done(null, usuario.id)
    })


    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => { //Serve para procurar um usuario pelo seu Id
            done(err, usuario)
        })
    })
}