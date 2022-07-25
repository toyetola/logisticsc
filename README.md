***LOGISTICS: DELIVERY TRACKING API***

Clone this repository

```git clone https://github.com/toyetola/logisticsc.git```

Install all dependencies of this application by running

```npm install```

Create a .env file in the root of the project and copy .env.example to it

Replace the DB_URI and DB_URI_TEST with two different mongodb uri in your local system

OR

you can create a mongo db atlas account at https://account.mongodb.com

Then create two databases in a cluster one for test and the other as the main database

RUN ```npm start``` to start the application.

Your application should be running on ```https://127.0.0.1:3000```

When your application is running and all databases have been set up

RUN 

```
npm run test
```

If successfully 11 test cases should pass

**Here are the Endpoints you can test out:**

Checkout the API endpoints usage via this API document:

https://documenter.getpostman.com/view/3707157/UzXKXKdq

The App assumes that their are two-three roles for this system:

1. customer
2. admin
3. rider

**The customers signup and login**

POST {{baseUrl}}/signup
POST {{baseUrl}}/login

**Customer make order to request pick up**

Header['Authorization'] = `Bearer <Token>` #Gotten from login api

POST {{baseUrl}}/api/createOrder

**Customer List all order he has made so far**

Header['Authorization'] = `Bearer <Token>` #Gotten from login api


GET {{baseUrl}}/api/getMyOrders

**Customer gets a single order he made previously**

Header['Authorization'] = `Bearer <Token>` #Gotten from login api


GET {{baseUrl}}/api/singleOrder/:orderId


**Customer Update Order**

Header['Authorization'] = `Bearer <Token>` #Gotten from login api

PATCH {{baseUrl}}/api/updateOrder/:orderId
Data to send example :
{ 
    "destination_address":"good place"
}

The above can contain other valid attributes

**Customer cancel Order before pick up**

Header['Authorization'] = `Bearer <Token>` #Gotten from login api

DELETE {{baseUrl}}/api/cancelOrder/:orderId


**Admin/Rider Endpoints**

Admin logs in

**Update delivery status** 

Header['Authorization'] = `Bearer <Token>` #Gotten from login api

PATCH {{baseUrl}}/api/updateOrderStatus/:orderId

**List All orders available in the system**

Header['Authorization'] = `Bearer <Token>` #Gotten from login api

GET {{baseUrl}}/api/listOrders


**RUN TESTS**

```npm run test```

