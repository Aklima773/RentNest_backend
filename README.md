Postman Api Collections: 

1.Auth(Post api/auth/login)
2.Users(Post /api/users/register)
   user (Get /api/users/me)
        (Put /api/users/my-profile)
  admin (Get /api/users/allusers)
  admin (Put /api/users/:id)

3.Property(Post /api/properties)
    public (Get /api/properties)
    landlord (Get /api/properties/:id)
    landlord (Patch /api/properties/:id)
    landlord (delete /api/properties/:id)

4.Category Admin(Post /api/categories)
            Admin(Put /api/categories/:id)
            Admin(delete /api/categories/:id)
           Public(Get /api/categories)
           Public(Get /api/categories/:id)

5.Rental Request tenant(Post /api/rentalrequest)
                 tenant(Get /api/rentalrequest/my-requests)
                 tenant(Delete /api/rentalrequest/:id)
                 tenant(Patch /api/rentalrequest/:id)
                 landlord(Patch /api/rentalrequest/:id/status)
                 landlord(Get /api/rentalrequest/landlord/:propertyId)

6.Review tenant(Post /api/reviews)                 
         tenant(Get /api/reviews/my-reviews)                 
         tenant(Get /api/reviews/my-reviews/:propertyId)                 
         tenant(Patch /api/reviews/:id)                 
         tenant(Delete /api/reviews/:id)                 
         landlord(Get /api/reviews/property/:propertyId)       

7. Payment tenant(Post /api/payments/checkout)     


Admin Credentials:

1. Name: Abdul
   Email: abdulk@gmail.com
   Password: 123456

2. Name: karim
   Email: kkarim@gmail.com
   Password: 123456   