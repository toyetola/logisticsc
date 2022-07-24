db.createUser(
    {
        user: "carbonuser",
        pwd: "carbon1234",
        roles : [
            {
                role:"readWrite",
                db : "logistics"
            }
        ]
    }
)
