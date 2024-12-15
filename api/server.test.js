const request = require('supertest');
const server = require('./server'); 
const db = require('../data/dbConfig');
const bcryptjs = require('bcryptjs')

describe('POST /register', () => {
  it('should register a new user successfully', async () => {
    const newUser = { username: 'Captain Marvel', password: 'foobar' };

    const res = await request(server)
      .post('/api/auth/register') 
      .send(newUser);

    expect(res.status).toBe(201); 
    expect(res.body.username).toBe('Captain Marvel'); 
    expect(res.body).toHaveProperty('id'); 
  });

  it('should return 400 if username is already taken', async () => {
    await db('users').insert({ username: 'Captain Marvel', password: 'foobar' });

    const res = await request(server)
      .post('/api/auth/register')
      .send({ username: 'Captain Marvel', password: 'foobar' }); 

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('username taken');
  });
});

describe('POST /login', () => {
  beforeEach(async () => {
    const hashedPassword = bcryptjs.hashSync('foobar', 8);
    await db('users').insert({ username: 'Captain Marvel', password: hashedPassword });
  });

  it('should log in a user successfully', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'Captain Marvel', password: 'foobar' });

    expect(res.status).toBe(200); 
    expect(res.body.message).toBe('welcome, Captain Marvel'); 
    expect(res.body).toHaveProperty('token'); 
  });

  it('should return 401 if password is incorrect', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'Captain Marvel', password: 'wrongpassword' });

    expect(res.status).toBe(401); 
    expect(res.body.message).toBe('invalid credentials');
  });

  it('should return 400 if username or password is missing', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'Captain Marvel' }); 

    expect(res.status).toBe(400); 
    expect(res.body.message).toBe('username and password required');
  });
});