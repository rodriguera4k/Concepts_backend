const express = require('express');
const { uuid, isUuid } = require('uuidv4');
const app = express();

app.use(express.json());

// criei array para usar como memória já que não estamos trabalhando com banco de dados
const projects = [];

// Middlewares - algum trecho seja disparado em qq lugar
function logRequests(request, response, next) {
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel);

  next(); //prox middleware

  console.timeEnd(logLabel);
}

// middlaware com return response é um validador ele
function validateProjectId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Deu Ruim' })
  }

  return next();
}


// sempre que eu quiser criar um interceptador ( middleware) e n quiser que ele atrapalhe o fluxo eu coloco o return next

app.use(logRequests);
// forma de aplicar middlewares nas rotas
app.use('/projects/:id', validateProjectId);

// criando query 
app.get('/projects', (request, response) => {

  const { title } = request.query;

  const results = title
    ? projects.filter(project => project.title.includes(title))
    : projects;



  return response.json(results);
})

// criei a constante project para receber os valores do insomnia e estou fazendo o push dela na memória do array
app.post('/projects', (request, response) => {
  const { title, name } = request.body;

  const project = { id: uuid(), title, name };

  projects.push(project);

  return response.json(project);
});

//  buscar no array e fazer as alterações no projeto e setando status code 
app.put('/projects/:id', (request, response) => {
  const { id } = request.params;
  const { title, name } = request.body;

  const projectIndex = projects.findIndex(project => project.id === id);

  if (projectIndex < 0) {
    return response.status(400).json({ error: 'Project Not Found' })
  }

  const project = {
    id,
    title,
    name,
  };

  projects[projectIndex] = project;

  return response.json(project);
});

app.delete('/projects/:id', (request, response) => {
  const { id } = request.params;

  const projectIndex = projects.findIndex(project => project.id === id);

  if (projectIndex < 0) {
    return response.status(400).json({ error: 'Project Not Found' })
  }

  projects.splice(projectIndex, 1);

  return response.status(204).send();
});


app.listen(3333, () => {
  console.log('🚀 Back-end Iniciado');
});