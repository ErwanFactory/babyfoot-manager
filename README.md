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

