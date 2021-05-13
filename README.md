# Panda Social Club Web Application
REST API web application made with NodeJs as back-end and Handlebars templating engine as front-end alongside with MySql database. Application has user authentication and authorization which includes registration, email verification, login, or user can login immediately with google account. There is also the role management of two layers, basic user and administrator. 
## Basic User Can: 
- Publish posts that need to be reviewed and approved by the admin in order to be published publicly.
- Change his profile photo, cover photo, password, information( first name, last name, location, about me)
- Turn on two-factor authentication which will be activated next time the basic user logs in (One-time four-digit code will be sent to his email )
- Comment and like other users posts
- Follow/Unfollow other users
- Access public/private chat with other users
- View, edit or delete pending posts
- Be notified by email when a post is approved/rejected by the admin
- Set a new password if the old one is forggoten
- Can view who liked a certain post
- Can delete his/her comments or comments on his/her post
- Delete his/her post
- Can view the section called 'Popular Posts' and the section called 'Your Liked Posts'

## Admin User Can
- Do everything as a basic user
- Approve or Reject basic user pending posts
- Remove user post 
- Remove users
- Set or unset a basic user to be an admin
- Be notified by email when the user publishes a new post

## Web Security
*There are basic measures of security applied to the application*.
- 2FA ( Two Factor Authentication )
- Brute force attack prevention
- CSRF ( Cross Site Request Forgery ) prevention
- XSS ( Cross Site Scripting ) prevention
- SQL injection prevention
- Encrypted user passwords

## Link 
*https://panda-social-club-mne.herokuapp.com*
