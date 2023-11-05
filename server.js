const express = require('express');
const app = express();
const port = 1000;

// Cette ligne indique le répertoire qui contient
// les fichiers statiques: html, css, js, images etc.
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/youssef', (req, res) => {
  res.sendFile(__dirname + '/youssef/index.html');
});

app.get('/omar', (req, res) => {
  res.sendFile(__dirname + '/public/omar/index.html');
});
app.listen(port, () => {
  var url = `http://localhost:${port}`
  console.log('Example app listening at '+url);

  var start =
      process.platform == "darwin"
          ? "open"
          : process.platform == "win32"
              ? "start"
              : "xdg-open";
  require("child_process").exec(start + ' '+url);
  console.log("App now running on port", port);
});
