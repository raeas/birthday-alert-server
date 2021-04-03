# Birthday Alert Server
This is the server for the Birthday Alert app where you can keep a list of people's birthdays and create a list of gift ideas for each person on your birthday list.

-----
### Link to live app
Live version of the app can be found here: <a href = "https://birthday-alert-client.vercel.app/">https://birthday-alert-client.vercel.app/</a>

### API Base url
<a href = "https://desolate-sea-54001.herokuapp.com/api">https://desolate-sea-54001.herokuapp.com/api</a>

-----
### Summary
Birthday Alert is a birthday tracker that allows you to create gift lists for your friends' and relatives' birthdays. You can add a birthday to your "Birthday List" and then create a list of gift ideas. It is easy to get started! Simply click "Add Birthday" to add a person to your Birthday List. To see upcoming birtdays on your Birthday List, click Upcoming B-Days to view details and gift lists.

### Endpoints

#### People (Birthdays)
`GET /api/people`  
Description: Gets all people and their birthdays.    
Data Example:  
```
{
  id: 1,
  first_name: "Howard",
  last_name: "Phillips",
  birthday: "2/1/1966"
},
{
  id: 2,
  first_name: "Jonathan",
  last_name: "Morris",
  birthday: "12/31/1993"
},
{
  id: 3,
  first_name: "Martin",
  last_name: "Bryant",
  birthday: "9/25/1975"
}
```
Success Response: 200 OK  
Error Response: 404 Not Found  


`POST /api/people`  
Description:   Add a person to the birthday list. Required fields are "first_name" and "birthday".  
Data Example:  
```
{
  id: 4,
  first_name: "Sam",
  last_name: "Thomas",
  birthday: "6/25/1995"
}
```
Success Response: 201 Created  
Error Response: 400 Bad Request "'${field}' is required'"


`PATCH /api/people/${peopleId}`  
Description: Updates a person. Required fields are "first_name" and "birthday".        
Data Example:  
```
{
  id: 4,
  first_name: "Sammy",
  last_name: "Thomas",
  birthday: "6/25/1995"
}
```
Success Response: 200 OK  
Error Response: 400 Bad Request - "'${field}' is required'"   


`DELETE /api/people/${personId}`  
Description: Deletes a person     
Success Response: 200 OK  
Error Response: 404 Not Found - "Person Not Found"


#### Gifts
`GET /api/gifts`  
Description:  Gets a list of all gifts.   
Data Example:  
```
{
  id: 1,
  gift_name: "Earrings",
  person: 3
},
{
  id: 2,
  gift_name: "Hula hoop",
  person: 1
},
{
  id: 3,
  gift_name: "Sidewalk chalk",
  person: 2
}
```
Success Response: 200 OK  
Error Response: 404 Not Found

`POST /api/gifts`  
Description:   Add a gift to a person's gift list. Required fields are "gift_name" and "person".  
Data Example:  
```
{
  id: 4,
  gift_name: "Socks",
  person: 1
}
```
Success Response: 201 Created  
Error Response: 400 Bad Request "'${field}' is required'"


`PATCH /api/gifts/${giftId}`  
Description: Updates a person. Required fields are "gift_name" and "person".        
Data Example:  
```
{
  id: 4,
  gift_name: "Red Socks",
  person: 1
}
```
Success Response: 200 OK  
Error Response: 400 Bad Request - "'${field}' is required'"   


`DELETE /api/gifts/${giftId}`  
Description: Deletes a gift       
Success Response: 200 OK  
Error Response: 404 Not Found - "Gift Not Found"  


### Tech Stack
- Node.js
- Express
- Mocha

