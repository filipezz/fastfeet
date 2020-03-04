<h1 align="center">
  <img alt="Fastfeet" title="Fastfeet" src="https://i.ibb.co/C9Ppsnn/logo.png" width="300px" />
</h1>

<h1 align="center">
  Transportadora Fastfeet
</h1>

## Features
-  [Express](https://expressjs.com/)
-  [Prettier](https://prettier.io/)
-  [nodemon](https://nodemon.io/)
-  [Sucrase](https://github.com/alangpierce/sucrase)
-  [Docker](https://www.docker.com/docker-community)
-  [Sequelize](http://docs.sequelizejs.com/)
-  [PostgreSQL](https://www.postgresql.org/)
-  [Redis](https://redis.io/)
-  [JWT](https://jwt.io/)
-  [Multer](https://github.com/expressjs/multer)
-  [Bcrypt](https://www.npmjs.com/package/bcrypt)
-  [Youch](https://www.npmjs.com/package/youch)
-  [Yup](https://www.npmjs.com/package/yup)
-  [Bee Queue](https://www.npmjs.com/package/bcrypt)
-  [Nodemailer](https://nodemailer.com/about/)
-  [date-fns](https://date-fns.org/)
-  [Sentry](https://sentry.io/)
-  [ESLint](https://eslint.org/)
-  [Mailtrap](https://mailtrap.io/)



## Requerimentos

 - [Node](https://nodejs.org/en/download/current/)  
 - [Yarn](https://yarnpkg.com/en/docs/install)
 - [Docker](https://www.docker.com/)
 
 
 #### Instalar dependências:

```bash
yarn
```

#### Rodando localmente

```bash
yarn dev
yarn queue
```
* yarn queue roda o Job de envio de emails em segundo plano

#### Instalando imagens docker

```docker
docker run -it --rm --network some-network postgres psql -h some-postgres -U postgres
docker run --name some-redis -d redis:alpine
```
#### Migrations e Seeds

```yarn
yarn sequelize db:migrate
yarn sequelize db:seed:all
```

## Rotas

### Sessões


Método | URI | Parêmtros | Body | Descrição
-------|-----|-----------|------|-----------
POST | /users | - | `{ email, password }` | 


### CRUD Entregadores

* Roda apenas para Administradores. <strong>Requer autenticação</strong>

Método | URI | Parêmtros | Body | Descrição
-------|-----|-----------|------|-----------
GET | /deliveryman | - |
POST | /deliveryman | - | { name,email }
PUT | /deliveryman/:id | deliveryman_id | { name, email, avatar_id }
DELETE | /deliveryman/:id | deliveryman_id | 

### Destinatários

* Roda apenas para Administradores. <strong>Requer autenticação</strong>

Método | URI | Parêmtros | Body | Descrição
-------|-----|-----------|------|-----------
GET | /recipients | - |
POST | /recipients | - | { name, street, number, complement, state, city, zip }
GET | /recipients/:id | recipient_id |
PUT | /recipients/:id | recipient_id | { name, street, number, complement, state, city, zip }
DELETE | /recipients/:id | recipient_id | 

### Pedidos

* Roda apenas para Administradores. <strong>Requer autenticação</strong>

Método | URI | Parêmtros | Body | Descrição
-------|-----|-----------|------|-----------
GET | /orders | - |
POST | /orders | - | { product, recipient_id , deliveryman_id }
PUT | /orders/:id | order_id | { product, recipient_id , deliveryman_id }
DELETE | /orders/:id | order_id | 
DELETE | /deliveries/problem/:problem_id/cancel | :problem_id, | - | Cancela um pedido baseado no ID do problema da entrega 


### Entregas

* Rota para entregadores. Não requer autenticação

Método | URI | Parêmtros | Body | Descrição
-------|-----|-----------|------|-----------
GET | /deliveryman/:deliveryman_id | deliveryman_id |
PUT | /deliveryman/:deliveryman_id/order/:order_id | deliveryman_id, order_id | { start_date } | <strong>Queries</strong><br/> "deliveried=true" lista todas os pedidos entregues. "deliveried=false=" lista todas as não entregues. Sem query retorna todas as entregas já registradas do entregador
PUT | /deliveryman/:deliveryman_id/order/:order_id/end_delivery | deliveryman_id, order_id | { end_date, signature_id } | Finaliza entrega




### Problemas na entrega

* Rota para entregadores. Não requer autenticação

Método | URI | Parêmtros | Body | Descrição
-------|-----|-----------|------|-----------
GET | //deliveries/problems | - | 
POST | /deliveries/:order_id/problems | order_id | { description }
GET | /deliveries/:order_id/problems | order_id | - | Lista todos os problemas com determinada entrega

### Arquivos

Método | URI | Parêmtros | Body | Descrição
-------|-----|-----------|------|-----------
GET | /files | - | Multipart form:<strong>File</strong>
GET | /signature | - | Multipart form:<strong>File</strong>


## :memo: License

This project is under the MIT license. See the [LICENSE](https://github.com/alexiakattah/fastfeet-api/blob/master/LICENCE)

Feito com ♥ por Filipe :wave: [Linkedin](https://www.linkedin.com/in/filipemarron/)
