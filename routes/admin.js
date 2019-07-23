const express = require('express')//Está importando o express
const router = express.Router()
const mongoose = require('mongoose')//está importando o mongoose
require('../models/Categoria')//Está importando o arquivo categoria.js da pasta models
const Categoria = mongoose.model('categorias')//Foi criada uma constante usando o mongoose para poder salvar dados no banco de dados
require('../models/Postagem') //Carrega o model de posts
const Postagem = mongoose.model('postagens')
const {eAdmin} = require("../helpers/eAdmin")// Carrega o Helper {} dentro do eAdmin ele irá pegar apenas a função
router.get('/', eAdmin, (req,res) => { //Está declarando rotas na URL
    res.render('admin/index')
})

router.get('/posts', eAdmin,  (req, res) => {
    res.send('Pagina de posts')
})

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render('admin/categorias', {categorias: categorias}) //Está listando todas as categorias usando .find() e armazenando na var categorias
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar categorias')
        res.redirect('/admin')//Ao final do processo de erro, redireciona para a rota /admin
    })
})

router.get("/categorias/add", eAdmin, (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){ //caso der erro, irá ser armazenado no array
        erros.push({texto: "Nome inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){ //caso der erro, irá ser armazenado no array
        erros.push({texto: 'Slug inválido'})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: 'Erro, nome da categoria muito pequeno'}) //caso der erro, irá ser armazenado no array
    }
    if(erros.length >0){
        res.render('admin/addcategorias', {erros: erros}) //Está mandando renderizar na pagina a partir do handlebars e irá printar o erro na pagina
    }else{ 
        const novaCategoria = {
            nome: req.body.nome, //esta fazendo referencia ao nome no categoria.handlebars
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => { //Esta salvando no banco de dados mongoose
            req.flash('success_msg', ' Categoria criada com sucesso')//Mensagem de confirmação antes de redirecionar a pagina (foi criada tambem uma id para usar no handlebars)
            res.redirect('/admin/categorias')//Caso de certo o registro de categoria, irá redirecionar para a rota /admin/categorias
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria, tente novamente!')
            res.redirect('/admin')
        })
    }
})
router.get('/categorias/edit/:id', eAdmin, (req, res) => { //está pegando a rota da categoria e junto com o id renderiza o arquivo editcategoria.handlrbars
    Categoria.findOne({_id:req.params.id}).then((categoria) => { //ele irá encontrar com o findOne, o id que foi requisitado na pagina de edição
        res.render('admin/editcategorias', {categoria: categoria}) //quando for solicitado entre chaves duplas {{}} o 'categoria', ele irá buscar aqui o parametro categorias
    }).catch((err) => {
        req.flash('error_msg', 'Esta categoria não existe')//Caso não de certo, ele manda uma msg de erro e redireciona para /admin/categorias usando o res.redirect
        res.redirect('/admin/categorias') 
    }) 
})

router.post('/categorias/edit', eAdmin, (req, res) => { //Com a função post, irá postar nessa rota as alterações feitas na categoria
    
    Categoria.findOne({_id: req.body.id}).then((categoria) => { //Fara a busca nas categorias, uma categoria que tenha o id requisitado no frontend
        
        categoria.nome = req.body.nome //Ele buscara o campo nome que esta escrito lá no html e irá atribuir ao formulario de ediçao
        categoria.slug = req.body.slug
        
        categoria.save().then(() => {
            req.flash('success_msg','Edição de categoria feita com sucesso')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria')
            res.redirect('/admin/categorias')
         
        })
        
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar a categoria')
        res.redirect('/admin/categorias')
    })
})
router.post('/categorias/deletar', eAdmin, (req,res) => {
    Categoria.remove({_id:req.body.id}).then(()=> { //Ele irá remover a categoria que tenha o Id igual ao id la do formulario handlebars
        req.flash('success_msg', 'Categoria deletada com sucesso')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível remover a categoria')
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', eAdmin, (req,res) => { //Pagina de listagem de postagem que ira renderizar admin/postagens
    Postagem.find().populate('categoria').sort({data:"desc"}).then((postagens) => {
        res.render('admin/postagens', {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens')
        res.redirect('/admin')    
    })
})
router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find().then((categorias) => { //Chama o model Categoria.find e retorna todas as categorias
        res.render('admin/addpostagem', {categorias: categorias}) //Passou todas as categorias para a view 
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário')
        res.redirect('/admin')
    })
      
})
router.post('/postagens/nova', eAdmin, (req, res) => {
    var erros = []
    console.log(req.body)   
    if(req.body.categoria == '0'){
        erros.push({texto: 'Categoria inválida, registre uma categoria'}) //Jogara na variavel erros2
    }
    if(erros.length > 0){ //se existir algum erro, ele enviara a msg de erro para o backend
        res.render('admin/addpostagem', {erros: erros}) //Irá renderiar a view addpostagem com o erros        
    }else{
        const novaPostagem = { //constante novaPostagem recebe um objeto  
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        
        
        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!');
            res.redirect('/admin/postagens/')
            
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro durante o salvamento da postagem');
            console.log(err)
            //res.redirect('/admin/postagens/add')
        })
    }
})
router.get('/postagens/edit/:id', eAdmin, (req, res) => {

    Postagem.findOne({_id: req.params.id}).then((postagem) => {/*Pesquisa por postagem, depois pesquisa por categoria, apos isso renderiza na view*/
        Categoria.find().then((categorias) => {
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect('/admin/postagens')
        })
        
    }).catch((err) => {
        req.flash('error_msg','Houve um erro ao editar a postagem')
        res.redirect('/admin/postagens')
    })
    
})

router.post('/postagens/edit', eAdmin, (req, res) => {
    Postagem.findOne({_id:req.body.id}).then((postagem) => {          //esta usando .body pq no formulario editpostagens, 
       
        postagem.titulo = req.body.titulo                         // existe um campo chamado id e esta buscando pelo id do formulario
        postagem.slug = req.body.slug                                           
        postagem.descricao = req.body.descricao                                    
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Erro interno')
            res.redirect('/admin/postagens')
        })
                                                                    
}).catch((err) => {
    req.flash('error_msg','Houve um erro ao salvar a edição')
    res.redirect('/admin/postagens')
})

})

router.get('/postagens/deletar/:id', eAdmin, (req, res) => {
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso')
        res.redirect("/admin/postagens")

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar postagem')
        res.redirect('/admin/postagens')
    })
})


module.exports = router
