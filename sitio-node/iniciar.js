'use strict'

var pasta = require('path');
var configuracao = require('jsconfig');
var pastaConfiguracaoPadrao = pasta.join(__dirname, "/configuracao/configuracao.js");
var express = require('express');
var http = require('http');

// Carregamos o nosso registrador
var registrador = require('./fonte/nucleo/registrador')('iniciar');

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
  
  var bodyParser = require('body-parser');
  
  /* Configuração do express */
  aplic.configure(function () {
    aplic.set('port', process.env.PORT || configuracao.server.port);
    aplic.use(express.logger(configuracao.server.logger));  
    aplic.use(bodyParser.json());
    aplic.use(bodyParser.urlencoded({ extended: false }));
    aplic.use(express.static(pasta.join(__dirname, 'publico')));
  });
  
  // Chamamos o arquivo principal, ele vai carregar os outros arquivos principais do servidor.
  var sitio = require('./fonte/iniciador/principal');
  sitio.prosseguir(configuracao, aplic, function() {
    
    registrador.debug('Carregando servideo HTTP.');
    
    // Inicia o servidor HTTP e começa a esperar por conexões
    var servidorHTTP = http.createServer(aplic);
    
    servidorHTTP.listen(aplic.get('port'), function () {
      console.log("Servidor express carregado e escutando na porta " + aplic.get('port'));
    });
  });
  
});