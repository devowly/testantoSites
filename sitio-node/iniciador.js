'use strict'

var pasta = require('path');
var configuracao = require('jsconfig');
var pastaConfiguracaoPadrao = pasta.join(__dirname, "/configuracao/configuracao.js");
//var registrador = require('./biblioteca/nucleo/Registrador')('iniciar');
var express = require('express');
var http = require('http');
//var wine = require('./routes/wines');

// Carregamos o nosso registrador
var registrador = require('./fonte/nucleo/registrador')('iniciador'); 

configuracao.defaults(pastaConfiguracaoPadrao);

// Parametros do ambiente
configuracao.set('env', {
  DOMAIN: 'domain',
  PORT: ['port', parseInt],
});

configuracao.cli({
  configuracao: ['c', "pasta para carregar arquivo de configuracao", 'path', pastaConfiguracaoPadrao],
  storage: ['storage', [false, "Não utilizar armazenamento"]],
  server: ['server', [false, "Não oferecer servidor express"]]
});

configuracao.load(function (args, opcs) {

  // Carrega um arquivo de configuração pelo argv preservando o padrão
  if(args.length > 0) {
    opcs.configuracao = args[args.length - 1];
  }

  // Faz a união da configuração com os dados informados pelo usuário.
  if(opcs.configuracao !== pastaConfiguracaoPadrao) {
    configuracao.merge(require(opcs.configuracao));
  }

  // Iniciamos o servidor express
  var aplic = express();

  /* Configuração do express */
  aplic.configure(function () {
    aplic.set('port', process.env.PORT || configuracao.server.port);
    aplic.use(express.logger(configuracao.server.logger));  
    aplic.use(express.bodyParser()),
    aplic.use(express.static(pasta.join(__dirname, 'publico')));
  });

  /* ABAIXO RESTFUL:
   * GET (Pega dados)
   * POST (Envio de dados)
   * PUT (Atualização de dados)
   * DELETE (Apaga uma entrada)
  --------------------------------------*/
  /*
  aplic.get('/wines', wine.findAll);
  aplic.get('/wines/:id', wine.findById);
  aplic.post('/wines', wine.addWine);
  aplic.put('/wines/:id', wine.updateWine);
  aplic.delete('/wines/:id', wine.deleteWine);
  */
  
  // Inicia escuta por conexões
  http.createServer(aplic).listen(aplic.get('port'), function () {
    console.log("Servidor express carregado e escutando na porta " + aplic.get('port'));
  });
  
});

