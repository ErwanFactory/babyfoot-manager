# babyfoot-manager
Test technique pour l'entreprise Ideolys (Easilys) - BabyFoot Manager est une application web de type RIA permettant de créer des parties de babyfoot. Sa particularité sera de pouvoir créer des parties de manière collaborative.

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

`express` : Node HTTP server services

`pg-promise` : Postgre interface for express server

`cors` : Node package to override the [CORS Policy](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS) . Because that project has no purpose to be deployed online in production mode, I'll just let that pack so that the project runs easily on every local environment.

