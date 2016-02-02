import express from 'express';
import httpProxy from 'http-proxy';
import fetch from 'node-fetch';

import TheatricsAPI from './core/api';
import Resolver from './core/resolver';
import Router from './core/router';
import Context from './core/context';

import MainView from './views/main';


const API_SERVER = 'http://localhost:9001';

const context = new Context({
  api: new TheatricsAPI(API_SERVER, fetch),
  resolver: new Resolver,
})

const router = new Router(context);

const app = express();

const apiProxy = new httpProxy.createProxyServer({target: API_SERVER});

app.use('/static', express.static('build'));

app.use('/api', (req, res, next) => {
    apiProxy.web(req, res);
});

app.use((req, res, next) => {
  router
    .handle(req.originalUrl)
    .then(view => {
      const mainView = new MainView(context, view);
      const html = mainView.getHTML();
      res.send(html);
    })
    .catch(error => {
      console.log(error)
      res.send(error.toString());
    });
});

app.listen(9000);
