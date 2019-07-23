module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){ //Se ele esta autenticado, next..(req.user (variavel global) )
            return next();
        }

        req.flash('error_msg', 'Você precisa ser administrador para acessar')
        res.redirect('/')
    }
}