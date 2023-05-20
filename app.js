const express = require("express")
const app = express()
const { Configuration, OpenAIApi } = require("openai");
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const post = require("./models/post")

require("dotenv").config();
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.engine("handlebars", handlebars({ defaultLayout: "main" }))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extends: false}))
app.use(bodyParser.json())

app.get("/", function(req,res){
    res.render("Home")
})

app.get("/pagcadastro", function(req,res){
    res.render("pagcadastrar")
})

app.get("/gpt", function (req, res) {
    post.findAll().then(function (post) {
        res.render("gpt", { post })
    }).catch(function (erro) {
        console.log("Erro ao carregar dados do banco: " + erro)
    })
})


app.get("/descricao/:id/:produto/:marca/:modelo", function (req, res) {
    post.findAll({ where: { 'id': req.params.id } }).then(function (post) {
        async()=>{
            const produto = req.params.produto
            const marca = req.params.marca
            const modelo = req.params.modelo
            const mensagem = "Crie uma descrição de produto persuasiva com o intuito de venda no modelo AIDA para o produto " + produto +" da marca: "+ marca+ "do modelo" + modelo;

            await openai
            .createChatCompletion({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: mensagem }],
            })
            .then((response) => {
              const result = [
                {
                  Result: response.data.choices[0].message.content,
                  desc,
                },
              ];

              const resposta  = result[0]
              res.render("descricao", resposta);
            })
            .catch((error) => {
              console.log(error);
            });
        }
    }).catch(function (erro) {
        console.log("Erro ao carregar dados do banco: " + erro)
    })
})

app.get("/palavraschaves/:id/:produto/:marca/:modelo", function (req, res) {
    post.findAll({ where: { 'id': req.params.id } }).then(function () {
        async()=>{
            const produto = req.params.produto
            const marca = req.params.marca
            const modelo = req.params.modelo
            const mensagem = "Crie 100 palavras chaves para campanhas de anuncio no google ads para o produto " + produto +" da marca: "+ marca+ "do modelo" + modelo;

            await openai
            .createChatCompletion({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: mensagem }],
            })
            .then((response) => {
              const result = [
                {
                  Result: response.data.choices[0].message.content,
                  desc,
                },
              ];

              const resposta  = result[0]
              res.render("palavraschaves", resposta);
            })
            .catch((error) => {
              console.log(error);
            });
        }
    }).catch(function (erro) {
        console.log("Erro ao excluir ou encontrar os dados do banco: " + erro)
    })
})


app.post("/cadastrar", function(req,res){
    post.create({
        produto: req.body.produto,
        marca: req.body.marca,
        modelo: req.body.modelo
    }).then(function(){
        res.render("Home")
    }).catch(function(erro){
        res.send("Falha ao cadastrar os dados: " +erro)
    })
})

app.get("/consulta", function(req, res){
    post.findAll().then(function(post){
        res.render("consulta", {post})
    }).catch(function(erro){
        console.log("Erro ao carregar dados do banco: " + erro)
    })
})

app.get("/editar/:id", function(req, res){
    post.findAll({where: {'id': req.params.id}}).then(function(post){
        res.render("editar", {post})
    }).catch(function(erro){
        console.log("Erro ao carregar dados do banco: " + erro)
    })
})

app.get("/excluir/:id", function(req, res){
    post.destroy({where: {'id': req.params.id}}).then(function(){
        res.render("Home")
    }).catch(function(erro){
        console.log("Erro ao excluir ou encontrar os dados do banco: " + erro)
    })
})

app.post("/atualizar", function(req, res){
    post.update({
        produto: req.body.produto,
        marca: req.body.marca,
        modelo: req.body.modelo,
        descricao: req.body.descricao,
        palavraschaves: req.body.palavraschaves
    },{
        where: {
            id: req.body.id
        }
    }).then(function(){
        res.redirect("/consulta")
    })
})

app.post("/atualizarDescircao", function (req, res) {
    post.update({
        descricao: req.body.resposta
    }, {
        where: {
            id: req.body.id
        }
    }).then(function () {
        res.redirect("/")
    })
})
app.post("/atualizarPalavras", function (req, res) {
    post.update({
        palavraschaves: req.body.resposta
    }, {
        where: {
            id: req.body.id
        }
    }).then(function () {
        res.redirect("/")
    })
})

app.listen(8081, function(){
    console.log("Servidor Ativo")
})