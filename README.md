# babyfoot-manager
Test technique pour l'entreprise Ideolys (Easilys) - BabyFoot Manager est une application web de type RIA permettant de créer des parties de babyfoot. Sa particularité sera de pouvoir créer des parties de manière collaborative.

## How to use it

### Run backend

``````bash
$ cd <path/to/project>/backend
$ npm install
$ node api-websocket.js
``````

Once, the backend server is started, you can run with Firefox or Chrome `frontend/index.html`

## Database

### Creation

```sql
create table babyfoot_match (id serial primary key not null,
    						 player1 text not null, 
							 player2 text not null,
                             finished boolean default false);
```

## Backend

### Dependencies 

`express` : Node HTTP server services.

`websocket` : Websocket server.

`pg-promise` : Postgre interface for express server.

`cors` : Node package to override the [CORS Policy](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS) . Because that project has no purpose to be deployed online in production mode, I'll just let that pack so that the project runs easily on every local environment.

`uuid` : Used to identify every connections.

### Architecture

``````
backend/
	|_ api-rest.js // See legacy part
	|_ api-websocket.js // Backend main script which starts the websocket server
	|_ database-interface.js // Database connection & request module
``````

### Legacy

I never used websocket before (didn't know if I would fit well) so when I was prototyping, I developed a Rest API which you can run using `node api-rest.js`.

