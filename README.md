# babyfoot-manager
Test technique pour l'entreprise Ideolys (Easilys) - BabyFoot Manager est une application web de type RIA permettant de créer des parties de babyfoot. Sa particularité sera de pouvoir créer des parties de manière collaborative.

## Database

### Creation

```sql
create table babyfoot_user (id int primary key not null, username text);

create table babyfoot_match (id_player_1 int not null, 
							 id_player_2 int not null,
							 foreign key (id_player_1) references babyfoot_user(id),
							 foreign key (id_player_2) references babyfoot_user(id));
```

