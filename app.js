
const express = require('express') // importando o express
const handlebars = require('express-handlebars') // importando o handlebars
const bodyParser = require('body-parser') // importando o bodyParser
const app = express()
const admin = require('./routes/admin')
const path = require('path') // Modulo padrão do node, serve para trabalhar com diretórios
const mongoose = require('mongoose') // importando o mongoose
const session = require('express-session') //carrega o modulo express-session
const flash = require('connect-flash')// carrega o modulo connect-flash, ele é um tipo de sessao que aparece somente 1 vez
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)
const db = require("./config/db")

//Configurações

//Sessao (app.use é usado toda vez que o objetivo é configurar um midware)
app.use(session({
    secret: 'cursodenode', //secret é como uma chave para gerar uma sessão para você
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize()) // Deve ficar nessa ordem
app.use(passport.session())
app.use(flash()) //flash configurado, sempre deve ficar abaixo da sessão
//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg') //res.locals é usado para declarar uma variável global
    res.locals.error_msg = req.flash('error_msg') //variavel
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null // Essa variável irá armazenar dados do usuario, req.user o passport usa
    next() //Necessario usar o next pois se trata de um middleware, se não  for usado o codigo não segue o curso
    
})

//Body Parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//HandleBars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
//Mongoose
mongoose.Promise = global.Promise
mongoose.connect(db.mongoURI).then(() => { //Importa a url do arquivo db.js
    console.log('Servidor conectado com sucesso!')
}).catch((err) => {
    console.log('Erro ao conectar o servidor' + err)
})
//Public
app.use(express.static(path.join(__dirname, "public"))) /* estou dizendo para o express que a pasta public contém todos os 
        arquivos estáticos, usar o dirname evita erros da busca*/

//Rotas *Chamar rotas sempre abaixo das configurações


app.get('/', (req, res) => {   //Prefixo seguido da constante criada para importar o arquivo de rotas
    Postagem.find().populate('categoria').sort({ data: 'desc' }).then((postagens) => {
        res.render('index', { postagens: postagens })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/404')

    })
})
app.get('/postagem/:slug', (req, res) => { //rota postagem parametro slug
    Postagem.findOne({ slug: req.params.slug }).then((postagem) => {
        if (postagem) {
            res.render('postagem/index', { postagem: postagem })
        } else {
            req.flash("error_msg", 'Essa postagem não existe')
            res.redirect('/')
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno')
    })
})


app.get('/categorias', (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('categorias/index', {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um problema')
        res.redirect('/')
    })
})

app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
        if(categoria){
            Postagem.find({categoria: categoria._id}).then((postagens) => {
                res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao listar os posts')
                res.redirect('/')
            })
        }else{
            req.flash('error_msg', 'Essa categoria não existe')
            res.redirect('/')
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro')
        res.redirect('/')
    })
})

app.get('/404', (req, res) => {
    res.send('Erro 404')
})


app.use('/admin', admin)
app.use('/usuarios', usuarios)

//Outros
const PORT = process.env.PORT || 8081 //Função do node para variavel ambiente, da qual será enviada para o Heroku
app.listen(PORT, () => {
    console.log('Servidor Rodando!')
})
