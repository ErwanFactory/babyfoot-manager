# babyfoot-manager
Test technique pour l'entreprise Ideolys (Easilys) - BabyFoot Manager est une application web de type RIA permettant de créer des parties de babyfoot. Sa particularité sera de pouvoir créer des parties de manière collaborative.

## Dependencies

PostgreSQL : [www.postgresql.org/](https://www.postgresql.org/)

Node : [nodejs.org/](https://nodejs.org/en/)

## Database

### Creation

```sql
create table babyfoot_match (id serial primary key not null,
    						 player1 text not null, 
							 player2 text not null,
                             finished boolean default false);
```

## License

GNU GENERAL PUBLIC LICENSE

## How to use it

First of all, create a postgresql database and table with the previous SQL script.

### Configuration files

You need to have a configuration file. Which is located at `backend/config.json`

``````json
{
    "connectionString" : "postgres://<user name>:<password>@<domain>:<port>/<database name>"
}
``````

### Run backend

```bash
$ cd <path/to/project>/backend
$ npm install
$ node api-websocket.js
```

Once, the backend server is started, you can run the web app (`frontend/index.html`) with Firefox or Chrome.

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
	|_ api-rest.js 		 // See legacy part
	|_ api-websocket.js 	 // Backend main script which starts the websocket server
	|_ database-interface.js // Database connection & request module
``````

### Legacy

I never used websocket before (didn't know if it would be easy to implement) so when I was prototyping, I developed a Rest API which you can run using `node api-rest.js`.

