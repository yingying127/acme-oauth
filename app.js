const express = require('express');
const app = express();

app.use(express.json());
app.engine('html', require('ejs').renderFile);

//^^ when render is called, when we are rendering an html file, we use this template function. this function takes a file and data and gives us back some html. we dont call it directly, we let express do it directly and express uses template engines to set it up. 
// is called an html template engine

const { models: { User }} = require('./db');
const path = require('path');

app.get('/', (req, res)=> res.render(path.join(__dirname, 'index.html'), { GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID }));
//^^ can add client info with foo and show it on the page inside html.js with foo under body

app.get('/api/auth', async(req, res, next)=> {
  try {
    res.send(await User.byToken(req.headers.authorization));
  }
  catch(ex){
    next(ex);
  }
});

app.get('/github/callback', async(req, res, next)=> {
  try {
    //code that we are getting back from github
    // res.send(req.query.code)

    //throws an error 
    const token = await User.authenticate(req.query.code);
    // res.send(token)

    res.send(`
      <html>
       <body>
       <script>
        window.localStorage.setItem('token', '${token}');
        window.document.location = '/';
       </script>
        </body>
      </html>
    `);
  }
  catch(ex){
    next(ex);
  }
});

app.use((err, req, res, next)=> {
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
