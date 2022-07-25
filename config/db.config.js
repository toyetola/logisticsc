db.createUser(
    {
        user: "root",
        pwd: "carbon1234",
        roles : [
            {
                role:"readWrite",
                db : "logistics"
            }
        ]
    }
)
