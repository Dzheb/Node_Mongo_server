const express = require('express');
const { MongoClient } = require('mongodb');
const joi = require('joi');
const fs = require('fs');
const path = require('path');
const mongo = require('./mongo');
// modules initialization
const app = express();
const userSchema = joi.object({
  firstName: joi.string().min(1).required(),
  secondName: joi.string().min(1).required(),
  age: joi.number().min(0).max(150).required(),
  city: joi.string().min(1),
});
const collectionName = 'users';
// routes
app.use(express.json());
// get all users
app.get('/users', (req, res) => {
  mongo.fetchAll(collectionName).then((docs) => {
    res.send({ docs });
  });
});
// get one user by id
app.get('/users/:id', (req, res) => {
  const userId = +req.params.id;
  mongo.fetchById(collectionName, userId).then((user) => {
    if (user) {
      res.send({ user });
    } else {
      res.status(404);
      res.send({ user: null });
    }
  });
});
// add a new  user
app.post('/users', (req, res) => {
  const result = userSchema.validate(req.body);
  if (result.error) {
    return res.status(404).send({ error: result.error.details });
  }
  const doc = {
    id: null,
    ...req.body,
  };
  mongo
    .insertOne(collectionName, doc)
    .then(function (result) {
      console.log('Insert res: ' + result);
      res.send({ result });
    })
    .catch(console.error);
});
// update user by id
app.put('/users/:id', (req, res) => {
  const result = userSchema.validate(req.body);
  if (result.error) {
    return res.status(404).send({ error: result.error.details });
  }
  const userId = +req.params.id;
  const user = mongo
    .updateOne(collectionName, userId, req.body)
    .then((user) => {
      if (user) {
        res.send(`${user} record updated`);
      } else {
        res.status(404);
        res.send({ user: null });
      }
    });
});
// remove one user
app.delete('/users/:id', (req, res) => {
  const userId = +req.params.id;
  const user = mongo.deleteOne(collectionName, userId).then((user) => {
    if (user) {
      res.send(`${user} record deleted`);
    } else {
      res.status(404);
      res.send({ user: null });
    }
  });
});
// server starts on 3000
const port = 3000;
app.listen(port, () => {
  console.log('Server started at port 3000');
});
