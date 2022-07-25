const app = require("../test.server");
const mongoose = require("mongoose");
const supertest = require("supertest");
require("dotenv").config()
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

const User = require("../models/user");

beforeAll((done) => {
    mongoose.connect(process.env.DB_URI_TEST ,
      { useNewUrlParser: true, useUnifiedTopology: true },
      () =>  done());
});

afterAll(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let connection of collections) {
      await connection.deleteMany({});
    }
});

afterAll((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(() => done())
    });
}); 

let order;
let usertoken;
let admintoken;

describe('Customer Endpoints', () => {
    it('should create a new order by customer', async () => {
      const hashPass = await bcrypt.hash("1234567", 10)
      const newUser = await User.create({ firstname: "Test", lastname: "User", email:"test@user.com", password: hashPass})
      const userPayload = {
        userId: newUser._id
      }    
      
      const jwtToken = await jwt.sign(userPayload, process.env.JWT_SECRET);
      usertoken = jwtToken
      const res = await supertest(app)
        .post(`/api/createOrder/`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
            "item_name":"Water",
            "item_type":"Normal",
            "size":6,
            "source_address":"Ojodu, Berger",
            "destination_address":"Victoria Island"
        })
      order = res.body.data;
      expect(res.statusCode).toEqual(201)
      expect(res.body.data).toBeTruthy();
      expect(res.body.data).toHaveProperty("user");
    })

    it('should retrieve orders by customer', async () => {
        const res = await supertest(app)
          .get(`/api/getMyOrders`)
          .set('Authorization', `Bearer ${usertoken}`)  
        expect(res.statusCode).toEqual(200)
        expect(res.body.data).toBeTruthy();
        expect(res.body.data[0]).toHaveProperty("airwaybill_no");
    })

    it('should retrieve single order by customer', async () => {
        const res = await supertest(app)
          .get(`/api/singleOrder/${order._id}`)
          .set('Authorization', `Bearer ${usertoken}`)
        expect(res.statusCode).toEqual(200)
        expect(res.body.data).toBeTruthy();
        expect(res.body.data).toHaveProperty("airwaybill_no");
    })

    it('should update order ONLY before pick up', async () => {
        const res = await supertest(app)
          .patch(`/api/updateOrder/${order._id}`)
          .set('Authorization', `Bearer ${usertoken}`)
          .send({
            "destination_address":"good place"
          })
        expect(res.statusCode).toEqual(200)
    })

    /* it('should cancel order ONLY before pick up', async () => {
        const res = await supertest(app)
          .delete(`/api/cancelOrder/${order._id}`)
          .set('Authorization', `Bearer ${usertoken}`)
        expect(res.statusCode).toEqual(204)
    }) */
  
})

describe('Admin/Rider Enpoints', () => {
    it('should update user\'s order delivery_status', async () => {

        const hashPass = await bcrypt.hash("1234567", 10)
        const newUser = await User.create({ firstname: "Admin", lastname: "User", email:"admin@user.com", password: hashPass, role:"admin"})
        const userPayload = {
            userId: newUser._id
        }    
      
        const jwtToken = await jwt.sign(userPayload, process.env.JWT_SECRET);
        admintoken = jwtToken

        const res = await supertest(app)
        .patch(`/api/updateOrderStatus/${order._id}`)
        .set('Authorization', `Bearer ${admintoken}`)
        .send({
            "delivery_status":"PICKED_UP"
        })
        expect(res.statusCode).toEqual(200)
        // expect(res.body).toHaveProperty("data")
    })


    it('should reject update for pick_up a second time.', async () => {

        const res = await supertest(app)
        .patch(`/api/updateOrderStatus/${order._id}`)
        .set('Authorization', `Bearer ${admintoken}`)
        .send({
            "delivery_status":"PICKED_UP"
        })
        expect(res.statusCode).toBe(403)
    })

    it('should update to WAREHOUSE status successfully.', async () => {

        const res = await supertest(app)
        .patch(`/api/updateOrderStatus/${order._id}`)
        .set('Authorization', `Bearer ${admintoken}`)
        .send({
            "delivery_status":"WAREHOUSE"
        })
        expect(res.statusCode).toBe(200)
    })

    it('should update to DELIVERED status successfully.', async () => {

        const res = await supertest(app)
        .patch(`/api/updateOrderStatus/${order._id}`)
        .set('Authorization', `Bearer ${admintoken}`)
        .send({
            "delivery_status":"DELIVERED"
        })
        expect(res.statusCode).toBe(200)
    })

    it('should reject update to DELIVERED the second time.', async () => {

        const res = await supertest(app)
        .patch(`/api/updateOrderStatus/${order._id}`)
        .set('Authorization', `Bearer ${admintoken}`)
        .send({
            "delivery_status":"DELIVERED"
        })
        expect(res.statusCode).toBe(403)
    })
})

describe('Customer action after some admin actions', () => {
    it('should reject customer update to order after pick up', async () => {

        const res = await supertest(app)
        .patch(`/api/updateOrder/${order._id}`)
        .set('Authorization', `Bearer ${usertoken}`)
        .send({
            "destination_address":"good place"
        })
        expect(res.statusCode).toEqual(403)
    })

    it('should reject cancel order : cancel ONLY before pick up', async () => {
        const res = await supertest(app)
          .delete(`/api/cancelOrder/${order._id}`)
          .set('Authorization', `Bearer ${usertoken}`)
        expect(res.statusCode).toEqual(403)
    })
})