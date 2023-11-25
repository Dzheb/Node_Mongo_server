const express = require('express');
const joi = require('joi');
const fs = require('fs');
const path = require('path');
// modules initialization
const app = express();
const userSchema = joi.object({
  firstName: joi.string().min(1).required(),
  secondName: joi.string().min(1).required(),
  age: joi.number().min(0).max(150).required(),
  city: joi.string().min(1),
});
const pathToFile = path.join(__dirname, 'users.json');
let uniqueID = 0;
let users = [];
// read from file if exists json
if (fs.existsSync(pathToFile)) {
  users = JSON.parse(fs.readFileSync(pathToFile, 'utf-8'));
  /***
   * max id identification
   */
  let maxProp = 'id',
    propValues,
    maxvalue;
  propValues = users.map(function (user) {
    return user[maxProp];
  });
  uniqueID = Math.max.apply(null, propValues);
} else {
  // create json if doesn't exist
  fs.writeFileSync(pathToFile, JSON.stringify(users, null, 2));
}
// routes
app.use(express.json());
// get all users
app.get('/users', (req, res) => {
  res.send({ users });
});
// get one user by id
app.get('/users/:id', (req, res) => {
  const userId = +req.params.id;
  const user = users.find((user) => user.id === userId);
  if (user) {
    res.send({ user });
  } else {
    res.status(404);
    res.send({ user: null });
  }
});
// add a new  user
app.post('/users', (req, res) => {
  const result = userSchema.validate(req.body);
  if (result.error) {
    return res.status(404).send({ error: result.error.details });
  }
  uniqueID += 1;
  users.push({
    id: uniqueID,
    ...req.body,
  });
  fs.writeFileSync(pathToFile, JSON.stringify(users, null, 2));
  res.send({ id: uniqueID });
});
// update user by id
app.put('/users/:id', (req, res) => {
  const result = userSchema.validate(req.body);
  if (result.error) {
    return res.status(404).send({ error: result.error.details });
  }
  const userId = +req.params.id;
  const user = users.find((user) => user.id === userId);
  if (user) {
    const { firstName, secondName, age, city } = req.body;
    user.firstName = firstName;
    user.secondName = secondName;
    user.age = age;
    user.city = city;
    fs.writeFileSync(pathToFile, JSON.stringify(users, null, 2));
    res.send({ user });
  } else {
    res.status(404);
    res.send({ user: null });
  }
});
// remove one user
app.delete('/users/:id', (req, res) => {
  const userId = +req.params.id;

  const user = users.find((user) => user.id === userId);
  if (user) {
    const userIndex = users.indexOf(user);
    users.splice(userIndex, 1);
    fs.writeFileSync(pathToFile, JSON.stringify(users, null, 2));
    res.send({ user });
  } else {
    res.status(404);
    res.send({ user: null });
  }
});
// server starts on 3000
const port = 3000;
app.listen(port, () => {
  console.log('Server started at port 3000');
});
