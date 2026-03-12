create table usuarios (

id serial primary key,

re integer unique,

nome text,

senha text,

perfil text

);

create table ambientes(

id serial primary key,

nome text

);

create table itens(

id serial primary key,

descricao text,

ambiente_id integer

);

create table checklist(

id serial primary key,

usuario_id integer,

item_id integer,

status boolean,

data timestamp default now()

);