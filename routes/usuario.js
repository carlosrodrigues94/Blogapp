const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {


    var erros = [] //Campos de validação de nome e senha para registro

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: 'Nome inválido' })
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: 'Email inválido' })
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: 'Senha inválida' })
    }
    if (req.body.senha.length < 4) {
        erros.push({ texto: 'Senha muito curta' })
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: 'As senhas estão diferentes, tente novamente' })
    }

    if (erros.length > 0) {
        res.render('usuarios/registro', { erros: erros })

    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash('error_msg', 'Esse email já foi cadastrado no sistema')
                res.redirect('/usuarios/registro')

            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                   
                })

                bcrypt.genSalt(10, (erro, salt) => { //Irá encripitar a senha, o salt é um valor aleatorio que é misturado com o hash
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => { //ele é misturado com o hash para encriptar mais ainda a senha
                        if (erro) {
                            req.flash('error_msg', 'Houve um erro ao salvar o usuario')
                            res.redirect('/')
                            console.log('chegouaqyu')
                        }
                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Usuario criado com sucesso')
                            res.redirect('/')
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao salvar o usuario')
                            res.redirect('/usuarios/registro')
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        }) //Esta pesquisando no banco de dados por algum usuario,
        // com o mesmo email do que esta na tentativa de cadastro/
    }
})

router.get('/login', (req,res) => {
    res.render('usuarios/login')
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',   
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next) // Passa o req, res, next novamente
})

router.get('/logout', (req, res ) => { // Fara o logout do usuario
    req.logout()
    req.flash('success_msg', 'Logout feito com sucesso!')
    res.redirect('/')
})
module.exports = router